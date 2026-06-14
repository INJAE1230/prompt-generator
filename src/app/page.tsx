"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Model = "claude" | "gemini";
type Tab = "main" | "favorites";

interface Purpose {
  id: string;
  emoji: string;
  label: string;
  placeholder: string;
  systemPrompt: string;
}

interface Favorite {
  id: string;
  purpose: string;
  input: string;
  result: string;
  model: string;
  timestamp: number;
}

const PURPOSES: Purpose[] = [
  {
    id: "business-doc",
    emoji: "DOC",
    label: "업무문서",
    placeholder: "프로젝트 제안서, 기획안, 사업계획서 등 작성할 문서의 종류와 핵심 내용을 입력하세요",
    systemPrompt:
      "당신은 비즈니스 문서 작성 전문가입니다. 명확하고 전문적인 업무 문서를 위한 프롬프트를 작성하세요. 문서 구조, 핵심 포함 요소, 톤앤매너, 분량 가이드를 포함하세요.",
  },
  {
    id: "email",
    emoji: "MAIL",
    label: "이메일",
    placeholder: "수신자, 목적, 핵심 전달 사항, 원하는 톤(공식/캐주얼)을 입력하세요",
    systemPrompt:
      "당신은 비즈니스 커뮤니케이션 전문가입니다. 목적에 맞는 효과적인 이메일을 위한 프롬프트를 작성하세요. 수신자 맞춤 톤, 구조, CTA(Call to Action)를 포함하세요.",
  },
  {
    id: "report",
    emoji: "RPT",
    label: "보고서",
    placeholder: "보고서 주제, 대상 독자, 포함할 데이터/분석 항목을 입력하세요",
    systemPrompt:
      "당신은 보고서 작성 전문가입니다. 데이터 기반의 체계적인 보고서를 위한 프롬프트를 작성하세요. 분석 프레임워크, 시각화 제안, 결론 도출 방법을 포함하세요.",
  },
  {
    id: "excel",
    emoji: "XLS",
    label: "엑셀수식",
    placeholder: "처리할 데이터 유형, 원하는 계산/변환, 시트 구조를 설명하세요",
    systemPrompt:
      "당신은 Excel/스프레드시트 전문가입니다. 복잡한 엑셀 수식, 매크로, 데이터 처리를 위한 프롬프트를 작성하세요. 함수 조합, 조건부 로직, 오류 처리를 포함하세요.",
  },
  {
    id: "official-doc",
    emoji: "GOV",
    label: "공문서",
    placeholder: "공문서 종류, 발신/수신 기관, 핵심 내용, 관련 법규를 입력하세요",
    systemPrompt:
      "당신은 공문서 작성 전문가입니다. 정부/공공기관 형식에 맞는 공식 문서를 위한 프롬프트를 작성하세요. 법적 용어, 격식체, 문서 번호 체계, 필수 구성 요소를 포함하세요.",
  },
  {
    id: "meeting",
    emoji: "MTG",
    label: "회의록",
    placeholder: "회의 주제, 참석자, 주요 안건, 결정 사항 형식을 입력하세요",
    systemPrompt:
      "당신은 회의 기록 전문가입니다. 체계적이고 활용도 높은 회의록을 위한 프롬프트를 작성하세요. 안건별 정리, 액션 아이템, 후속 조치, 담당자 배정 형식을 포함하세요.",
  },
  {
    id: "trade",
    emoji: "TRD",
    label: "트레이드",
    placeholder: "자산 종류(주식/비트코인), 전략 유형(스윙/데이트레이딩), 분석할 지표를 입력하세요",
    systemPrompt:
      "당신은 퀀트 트레이더입니다. 매매전략, 기술적 분석, 진입/청산 조건을 포함한 프롬프트를 작성하세요. 리스크 관리, 포지션 사이징, 백테스트 조건, 시장 환경별 전략 분기를 포함하세요.",
  },
  {
    id: "claude-code",
    emoji: "DEV",
    label: "클로드코드",
    placeholder: "개발할 기능, 사용 기술스택, 프로젝트 구조, 제약 조건을 입력하세요",
    systemPrompt:
      "당신은 Claude Code 전문가입니다. 명확한 개발 지시, 파일구조, 기술스택을 포함한 프롬프트를 작성하세요. 단계별 구현 지시, 에러 처리, 테스트 요구사항, 코드 스타일 가이드를 포함하세요.",
  },
  {
    id: "roblox",
    emoji: "LUA",
    label: "로블록스",
    placeholder: "만들 게임 장르, 필요한 기능(전투/인벤토리/UI), 게임 메카닉을 입력하세요",
    systemPrompt:
      "당신은 Roblox 게임 개발 전문가입니다. Lua 스크립트, Roblox API, 게임 로직을 포함한 프롬프트를 작성하세요. 서버/클라이언트 구분, 보안 고려사항, 성능 최적화, Roblox 서비스 활용법을 포함하세요.",
  },
  {
    id: "other",
    emoji: "ETC",
    label: "기타",
    placeholder: "원하는 프롬프트의 목적과 세부 요구사항을 자유롭게 입력하세요",
    systemPrompt:
      "당신은 AI 프롬프트 엔지니어링 전문가입니다. 사용자의 요구에 맞는 최적화된 프롬프트를 작성하세요. 명확한 역할 설정, 구체적 지시사항, 출력 형식, 제약 조건을 포함하세요.",
  },
];

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.globalAlpha = Math.random() * 0.3 + 0.1;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        ctx.globalAlpha = 1;

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function TypeWriter({ text, speed = 10 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="cursor-blink" />}
    </span>
  );
}

export default function Home() {
  const [model, setModel] = useState<Model>("gemini");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [compareResult, setCompareResult] = useState<{ claude: string; gemini: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [tab, setTab] = useState<Tab>("main");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("prompt-favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const saveFavorites = (favs: Favorite[]) => {
    setFavorites(favs);
    localStorage.setItem("prompt-favorites", JSON.stringify(favs));
  };

  const currentPurpose = PURPOSES.find((p) => p.id === selectedPurpose);

  const estimateTokens = (text: string) => Math.ceil(text.length / 3.5);

  const generate = async () => {
    if (!currentPurpose || !userInput.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    setCompareResult(null);

    const payload = {
      systemPrompt: currentPurpose.systemPrompt,
      userMessage: `다음 요구사항에 맞는 최적화된 AI 프롬프트를 한국어로 작성해주세요.\n\n[목적] ${currentPurpose.label}\n[세부 요구사항] ${userInput}`,
    };

    try {
      if (compareMode) {
        const [claudeRes, geminiRes] = await Promise.allSettled([
          fetch("/api/claude", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json()),
          fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json()),
        ]);

        setCompareResult({
          claude:
            claudeRes.status === "fulfilled"
              ? claudeRes.value.result || claudeRes.value.error || "ERROR"
              : "CONNECTION_FAILED",
          gemini:
            geminiRes.status === "fulfilled"
              ? geminiRes.value.result || geminiRes.value.error || "ERROR"
              : "CONNECTION_FAILED",
        });
      } else {
        const res = await fetch(`/api/${model}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "GENERATION_FAILED");
        setResult(data.result);
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addFavorite = (text: string, mdl: string) => {
    const fav: Favorite = {
      id: Date.now().toString(),
      purpose: currentPurpose?.label || "",
      input: userInput,
      result: text,
      model: mdl,
      timestamp: Date.now(),
    };
    saveFavorites([fav, ...favorites]);
  };

  const removeFavorite = (id: string) => {
    saveFavorites(favorites.filter((f) => f.id !== id));
  };

  const exportFile = useCallback((text: string, format: "txt" | "md") => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <>
      <MatrixRain />
      <div className="scanline" />

      <div className="relative z-10 min-h-screen crt-flicker">
        {/* Terminal Bar */}
        <div className="border-b border-[#00ff41]/30 bg-black/90 backdrop-blur px-4 py-2 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-sm glow">AI_PROMPT_GENERATOR v1.0</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("main")}
              className={`px-3 py-1 text-xs border ${
                tab === "main"
                  ? "border-[#00ff41] text-[#00ff41]"
                  : "border-[#00ff41]/30 text-[#00ff41]/50"
              } hover:bg-[#00ff41]/10 transition-colors`}
            >
              [MAIN]
            </button>
            <button
              onClick={() => setTab("favorites")}
              className={`px-3 py-1 text-xs border ${
                tab === "favorites"
                  ? "border-[#00ff41] text-[#00ff41]"
                  : "border-[#00ff41]/30 text-[#00ff41]/50"
              } hover:bg-[#00ff41]/10 transition-colors`}
            >
              [★FAV:{favorites.length}]
            </button>
          </div>
        </div>

        {tab === "favorites" ? (
          <div className="max-w-5xl mx-auto p-4">
            <p className="text-sm mb-4 text-[#00ff41]/70">
              {"> "}SAVED_PROMPTS: {favorites.length} entries
            </p>
            {favorites.length === 0 ? (
              <p className="text-[#00ff41]/40 text-sm">{">"} NO_FAVORITES_FOUND</p>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="border border-[#00ff41]/30 bg-black/80 p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-[#00ff41]/50">
                        [{fav.model.toUpperCase()}] {fav.purpose} |{" "}
                        {new Date(fav.timestamp).toLocaleString("ko")}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(fav.result)}
                          className="text-xs border border-[#00ff41]/30 px-2 py-0.5 hover:bg-[#00ff41]/10"
                        >
                          [COPY]
                        </button>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          className="text-xs border border-red-500/30 text-red-500 px-2 py-0.5 hover:bg-red-500/10"
                        >
                          [DEL]
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-[#00ff41]/40 mb-2">
                      {">"} {fav.input.slice(0, 80)}
                      {fav.input.length > 80 && "..."}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {fav.result.slice(0, 300)}
                      {fav.result.length > 300 && "..."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT PANEL */}
              <div className="space-y-5">
                {/* Model Selection */}
                <div>
                  <p className="text-xs text-[#00ff41]/50 mb-2">
                    {">"} SELECT_MODEL:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setModel("claude");
                        setCompareMode(false);
                      }}
                      className={`px-4 py-2 text-sm border transition-all ${
                        model === "claude" && !compareMode
                          ? "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] glow"
                          : "border-[#00ff41]/30 text-[#00ff41]/50 hover:border-[#00ff41]/60"
                      }`}
                    >
                      [CLAUDE]
                    </button>
                    <button
                      onClick={() => {
                        setModel("gemini");
                        setCompareMode(false);
                      }}
                      className={`px-4 py-2 text-sm border transition-all ${
                        model === "gemini" && !compareMode
                          ? "border-[#00ff41] bg-[#00ff41]/10 text-[#00ff41] glow"
                          : "border-[#00ff41]/30 text-[#00ff41]/50 hover:border-[#00ff41]/60"
                      }`}
                    >
                      [GEMINI]
                    </button>
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`px-4 py-2 text-sm border transition-all ${
                        compareMode
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                          : "border-[#00ff41]/30 text-[#00ff41]/50 hover:border-[#00ff41]/60"
                      }`}
                    >
                      [COMPARE]
                    </button>
                  </div>
                  {compareMode && (
                    <p className="text-xs text-yellow-400/70 mt-2 type-in">
                      {">"} COMPARE_MODE: Claude vs Gemini 동시 실행
                    </p>
                  )}
                </div>

                {/* Purpose Cards */}
                <div>
                  <p className="text-xs text-[#00ff41]/50 mb-2">
                    {">"} SELECT_PURPOSE:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PURPOSES.map((purpose) => (
                      <button
                        key={purpose.id}
                        onClick={() => setSelectedPurpose(purpose.id)}
                        className={`p-3 text-left text-sm border transition-all ${
                          selectedPurpose === purpose.id
                            ? "border-[#00ff41] bg-[#00ff41]/10"
                            : "border-[#00ff41]/20 hover:border-[#00ff41]/50 bg-black/50"
                        }`}
                      >
                        <span className="text-xs text-[#00ff41]/40 block mb-1">
                          {selectedPurpose === purpose.id ? "> " : "  "}
                          {purpose.emoji}
                        </span>
                        <span
                          className={
                            selectedPurpose === purpose.id ? "glow" : ""
                          }
                        >
                          {purpose.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                {currentPurpose && (
                  <div className="type-in">
                    <p className="text-xs text-[#00ff41]/50 mb-2">
                      {">"} INPUT_CONDITIONS:
                    </p>
                    <div className="border border-[#00ff41]/30 bg-black/50">
                      <div className="flex items-start p-3">
                        <span className="text-[#00ff41]/50 mr-2 mt-0.5 select-none">
                          {">"}
                        </span>
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder={currentPurpose.placeholder}
                          rows={5}
                          className="flex-1 bg-transparent resize-none text-sm text-[#00ff41] placeholder-[#00ff41]/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                {currentPurpose && (
                  <button
                    onClick={generate}
                    disabled={loading || !userInput.trim()}
                    className={`w-full py-3 text-sm border transition-all ${
                      loading || !userInput.trim()
                        ? "border-[#00ff41]/20 text-[#00ff41]/30 cursor-not-allowed"
                        : "border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41]/10 glow"
                    }`}
                  >
                    {loading ? (
                      <span>
                        [EXECUTING<span className="loading-dots" />]
                      </span>
                    ) : (
                      "[EXECUTE]"
                    )}
                  </button>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div ref={resultRef} className="space-y-4">
                {error && (
                  <div className="border border-red-500/50 bg-red-500/5 p-4 type-in">
                    <p className="text-red-500 text-sm">
                      {">"} ERROR: {error}
                    </p>
                  </div>
                )}

                {/* Single Result */}
                {result && !compareMode && (
                  <div className="type-in">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#00ff41]/50">
                        {">"} OUTPUT [{model.toUpperCase()}]:
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(result)}
                          className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10 transition-colors"
                        >
                          {copied ? "[COPIED!]" : "[COPY]"}
                        </button>
                        <button
                          onClick={generate}
                          disabled={loading}
                          className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10 transition-colors disabled:opacity-30"
                        >
                          [REGEN]
                        </button>
                        <button
                          onClick={() => addFavorite(result, model)}
                          className="text-xs border border-yellow-400/30 text-yellow-400 px-2 py-1 hover:bg-yellow-400/10 transition-colors"
                        >
                          [★FAV]
                        </button>
                      </div>
                    </div>
                    <div className="border border-[#00ff41]/30 bg-black/80 p-4">
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        <TypeWriter text={result} speed={8} />
                      </div>
                    </div>
                    {/* Export */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => exportFile(result, "txt")}
                        className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                      >
                        [EXPORT.TXT]
                      </button>
                      <button
                        onClick={() => exportFile(result, "md")}
                        className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                      >
                        [EXPORT.MD]
                      </button>
                    </div>
                    {/* Token Counter */}
                    <div className="text-xs text-[#00ff41]/40 mt-2">
                      CHARS: {result.length.toString().padStart(4, "0")} |
                      TOKENS: ~{estimateTokens(result).toString().padStart(4, "0")}
                    </div>
                  </div>
                )}

                {/* Compare Results */}
                {compareResult && compareMode && (
                  <div className="space-y-4 type-in">
                    {/* Claude Result */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#00ff41]/50">
                          {">"} CLAUDE_OUTPUT:
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              copyToClipboard(compareResult.claude)
                            }
                            className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                          >
                            [COPY]
                          </button>
                          <button
                            onClick={() =>
                              addFavorite(compareResult.claude, "claude")
                            }
                            className="text-xs border border-yellow-400/30 text-yellow-400 px-2 py-1 hover:bg-yellow-400/10"
                          >
                            [★FAV]
                          </button>
                        </div>
                      </div>
                      <div className="border border-[#00ff41]/30 bg-black/80 p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          <TypeWriter text={compareResult.claude} speed={8} />
                        </div>
                      </div>
                      <div className="text-xs text-[#00ff41]/40 mt-1">
                        CHARS:{" "}
                        {compareResult.claude.length
                          .toString()
                          .padStart(4, "0")}{" "}
                        | TOKENS: ~
                        {estimateTokens(compareResult.claude)
                          .toString()
                          .padStart(4, "0")}
                      </div>
                    </div>
                    {/* Gemini Result */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#00ff41]/50">
                          {">"} GEMINI_OUTPUT:
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              copyToClipboard(compareResult.gemini)
                            }
                            className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                          >
                            [COPY]
                          </button>
                          <button
                            onClick={() =>
                              addFavorite(compareResult.gemini, "gemini")
                            }
                            className="text-xs border border-yellow-400/30 text-yellow-400 px-2 py-1 hover:bg-yellow-400/10"
                          >
                            [★FAV]
                          </button>
                        </div>
                      </div>
                      <div className="border border-[#00ff41]/30 bg-black/80 p-4 max-h-96 overflow-y-auto">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">
                          <TypeWriter text={compareResult.gemini} speed={8} />
                        </div>
                      </div>
                      <div className="text-xs text-[#00ff41]/40 mt-1">
                        CHARS:{" "}
                        {compareResult.gemini.length
                          .toString()
                          .padStart(4, "0")}{" "}
                        | TOKENS: ~
                        {estimateTokens(compareResult.gemini)
                          .toString()
                          .padStart(4, "0")}
                      </div>
                    </div>
                    {/* Export Both */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          exportFile(
                            `=== CLAUDE ===\n${compareResult.claude}\n\n=== GEMINI ===\n${compareResult.gemini}`,
                            "txt"
                          )
                        }
                        className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                      >
                        [EXPORT_ALL.TXT]
                      </button>
                      <button
                        onClick={() =>
                          exportFile(
                            `## Claude\n${compareResult.claude}\n\n## Gemini\n${compareResult.gemini}`,
                            "md"
                          )
                        }
                        className="text-xs border border-[#00ff41]/30 px-2 py-1 hover:bg-[#00ff41]/10"
                      >
                        [EXPORT_ALL.MD]
                      </button>
                    </div>
                  </div>
                )}

                {/* Idle State */}
                {!result && !compareResult && !error && !loading && (
                  <div className="border border-[#00ff41]/10 bg-black/30 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="text-center text-[#00ff41]/30 text-sm">
                      <p className="mb-2">{">"} AWAITING_INPUT...</p>
                      <p className="text-xs">
                        모델과 목적을 선택하고 조건을 입력하세요
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="border border-[#00ff41]/30 bg-black/50 p-8 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                      <p className="text-sm glow-pulse">
                        {">"} PROCESSING
                        <span className="loading-dots" />
                      </p>
                      <p className="text-xs text-[#00ff41]/40 mt-2">
                        {compareMode
                          ? "Claude & Gemini 동시 호출 중"
                          : `${model.toUpperCase()} API 호출 중`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-[#00ff41]/10 text-center text-xs text-[#00ff41]/20">
              AI_PROMPT_GENERATOR v1.0 | SYSTEM_STATUS: ONLINE |{" "}
              {new Date().getFullYear()}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
