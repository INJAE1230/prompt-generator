import { NextRequest } from "next/server";
import { extractText, isNativeMedia, getMediaType } from "@/lib/parse-file";

export const dynamic = "force-dynamic";

const MODEL_NAME = "claude-sonnet-4-6";
const MAX_FILES = 5;
const MAX_FILE_DATA_BYTES = 4 * 1024 * 1024;

interface FilePayload {
  name: string;
  type: string;
  data: string;
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-access-token");
  const accessPassword = process.env.ACCESS_PASSWORD;
  if (accessPassword && token !== accessPassword) {
    return Response.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const { systemPrompt, userMessage, files = [] } = await req.json();

    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return Response.json({ error: "메시지를 입력해주세요." }, { status: 400 });
    }
    if ((files as FilePayload[]).length > MAX_FILES) {
      return Response.json(
        { error: `파일은 최대 ${MAX_FILES}개까지 첨부할 수 있습니다.` },
        { status: 400 }
      );
    }
    const totalDataBytes = (files as FilePayload[]).reduce(
      (sum, f) => sum + Math.ceil((f.data?.length ?? 0) * 0.75),
      0
    );
    if (totalDataBytes > MAX_FILE_DATA_BYTES) {
      return Response.json(
        { error: "첨부 파일 총 크기가 4MB를 초과합니다." },
        { status: 400 }
      );
    }

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
        model: MODEL_NAME,
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
              } catch (err) {
                console.error("claude/route: SSE JSON 파싱 오류:", err);
              }
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "done",
              model: MODEL_NAME,
              input_tokens: inputTokens,
              output_tokens: outputTokens,
            })}\n\n`)
          );
        } catch (err) {
          console.error("claude/route: 스트림 처리 오류:", err);
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
    console.error("claude/route: 요청 처리 오류:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
