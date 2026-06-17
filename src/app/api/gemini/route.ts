import { NextRequest } from "next/server";
import { extractText, isNativeMedia, getMediaType } from "@/lib/parse-file";

export const dynamic = "force-dynamic";

interface FilePayload {
  name: string;
  type: string;
  data: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { systemPrompt, userMessage, files = [] } = await req.json();

    const parts: unknown[] = [];

    for (const file of files as FilePayload[]) {
      if (isNativeMedia(file)) {
        parts.push({
          inline_data: { mime_type: getMediaType(file), data: file.data },
        });
      } else {
        const text = await extractText(file);
        if (text) {
          parts.push({ text: `[첨부파일: ${file.name}]\n${text}` });
        }
      }
    }

    parts.push({ text: systemPrompt + "\n\n" + userMessage });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
        }),
      }
    );

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
              if (!raw) continue;

              try {
                const parsed = JSON.parse(raw);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "text", content: text })}\n\n`)
                  );
                }

                if (parsed.usageMetadata) {
                  inputTokens = parsed.usageMetadata.promptTokenCount || inputTokens;
                  outputTokens = parsed.usageMetadata.candidatesTokenCount || outputTokens;
                }
              } catch {}
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "done",
              model: "gemini-2.5-flash",
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
