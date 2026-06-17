import { NextRequest } from "next/server";
import { extractText, isNativeMedia, getMediaType } from "@/lib/parse-file";

export const dynamic = "force-dynamic";

interface FilePayload {
  name: string;
  type: string;
  data: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { systemPrompt, userMessage, files = [] } = await req.json();

    const content: unknown[] = [];

    for (const file of files as FilePayload[]) {
      if (isNativeMedia(file)) {
        const mediaType = getMediaType(file);
        if (mediaType === "application/pdf") {
          content.push({
            type: "document",
            source: { type: "base64", media_type: mediaType, data: file.data },
          });
        } else {
          content.push({
            type: "image",
            source: { type: "base64", media_type: mediaType, data: file.data },
          });
        }
      } else {
        const text = await extractText(file);
        if (text) {
          content.push({ type: "text", text: `[첨부파일: ${file.name}]\n${text}` });
        }
      }
    }

    content.push({ type: "text", text: userMessage });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error?.message || `API 오류: ${response.status}` },
        { status: response.status }
      );
    }

    let inputTokens = 0;
    let outputTokens = 0;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;

              try {
                const parsed = JSON.parse(raw);

                if (parsed.type === "message_start" && parsed.message?.usage) {
                  inputTokens = parsed.message.usage.input_tokens || 0;
                }

                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: parsed.delta.text })}\n\n`)
                  );
                }

                if (parsed.type === "message_delta" && parsed.usage) {
                  outputTokens = parsed.usage.output_tokens || 0;
                }
              } catch {}
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "done",
              model: "claude-sonnet-4-6",
              input_tokens: inputTokens,
              output_tokens: outputTokens,
            })}\n\n`)
          );
        } catch {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: "스트림 처리 중 오류" })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
