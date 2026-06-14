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
    emoji: "📄",
    label: "업무문서",
    placeholder: "프로젝트 제안서, 기획안 등 작성할 문서의 종류와 핵심 내용",
    systemPrompt: "당신은 비즈니스 문서 작성 전문가입니다. 명확하고 전문적인 업무 문서를 위한 프롬프트를 작성하세요. 문서 구조, 핵심 포함 요소, 톤앤매너, 분량 가이드를 포함하세요.",
  },
  {
    id: "email",
    emoji: "📧",
    label: "이메일",
    placeholder: "수신자, 목적, 핵심 전달 사항, 원하는 톤",
    systemPrompt: "당신은 비즈니스 커뮤니케이션 전문가입니다. 목적에 맞는 효과적인 이메일을 위한 프롬프트를 작성하세요. 수신자 맞춤 톤, 구조, CTA를 포함하세요.",
  },
  {
    id: "report",
    emoji: "📊",
    label: "보고서",
    placeholder: "보고서 주제, 대상 독자, 포함할 데이터/분석 항목",
    systemPrompt: "당신은 보고서 작성 전문가입니다. 데이터 기반의 체계적인 보고서를 위한 프롬프트를 작성하세요. 분석 프레임워크, 시각화 제안, 결론 도출 방법을 포함하세요.",
  },
  {
    id: "excel",
    emoji: "📐",
    label: "엑셀수식",
    placeholder: "처리할 데이터 유형, 원하는 계산/변환, 시트 구조",
    systemPrompt: "당신은 Excel/스프레드시트 전문가입니다. 복잡한 엑셀 수식, 매크로, 데이터 처리를 위한 프롬프트를 작성하세요. 함수 조합, 조건부 로직, 오류 처리를 포함하세요.",
  },
  {
    id: "official-doc",
    emoji: "🏛️",
    label: "공문서",
    placeholder: "공문서 종류, 발신/수신 기관, 핵심 내용",
    systemPrompt: "당신은 공문서 작성 전문가입니다. 정부/공공기관 형식에 맞는 공식 문서를 위한 프롬프트를 작성하세요. 법적 용어, 격식체, 필수 구성 요소를 포함하세요.",
  },
  {
    id: "meeting",
    emoji: "📝",
    label: "회의록",
    placeholder: "회의 주제, 참석자, 주요 안건, 결정 사항 형식",
    systemPrompt: "당신은 회의 기록 전문가입니다. 체계적이고 활용도 높은 회의록을 위한 프롬프트를 작성하세요. 안건별 정리, 액션 아이템, 후속 조치를 포함하세요.",
  },
  {
    id: "trade",
    emoji: "📈",
    label: "트레이드",
    placeholder: "자산 종류, 전략 유형, 분석할 지표",
    systemPrompt: "당신은 퀀트 트레이더입니다. 매매전략, 기술적 분석, 진입/청산 조건을 포함한 프롬프트를 작성하세요. 리스크 관리, 포지션 사이징, 백테스트 조건을 포함하세요.",
  },
  {
    id: "claude-code",
    emoji: "💻",
    label: "클로드코드",
    placeholder: "개발할 기능, 사용 기술스택, 프로젝트 구조",
    systemPrompt: "당신은 Claude Code 전문가입니다. 명확한 개발 지시, 파일구조, 기술스택을 포함한 프롬프트를 작성하세요. 단계별 구현 지시, 에러 처리, 테스트 요구사항을 포함하세요.",
  },
  {
    id: "roblox",
    emoji: "🎮",
    label: "로블록스 Lua",
    placeholder: "게임 장르, 필요한 기능, 게임 메카닉",
    systemPrompt: "당신은 Roblox 게임 개발 전문가입니다. Lua 스크립트, Roblox API, 게임 로직을 포함한 프롬프트를 작성하세요. 서버/클라이언트 구분, 보안, 성능 최적화를 포함하세요.",
  },
  {
    id: "other",
    emoji: "✏️",
    label: "기타",
    placeholder: "원하는 프롬프트의 목적과 세부 요구사항을 자유롭게 입력하세요",
    systemPrompt: "당신은 AI 프롬프트 엔지니어링 전문가입니다. 사용자의 요구에 맞는 최적화된 프롬프트를 작성하세요. 명확한 역할 설정, 구체적 지시사항, 출력 형식, 제약 조건을 포함하세요.",
  },
];

function MatrixBg() {
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

    const chars = "01";
    const fontSize = 12;
    const columns = Math.floor(canvas.width / (fontSize * 2));
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.98) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize * 2;
          const y = drops[i] * fontSize;
          ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.06 + 0.01})`;
          ctx.fillText(text, x, y);
        }

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    };

    const interval = setInterval(draw, 80);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-60"
      style={{ zIndex: 0 }}
    />
  );
}

function TypeWriter({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDisplayed(text);
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

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${
        active ? "bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.6)]" : "bg-gray-600"
      }`}
    />
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
          fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json()),
          fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json()),
        ]);
        setCompareResult({
          claude: claudeRes.status === "fulfilled" ? claudeRes.value.result || claudeRes.value.error || "ERROR" : "CONNECTION_FAILED",
          gemini: geminiRes.status === "fulfilled" ? geminiRes.value.result || geminiRes.value.error || "ERROR" : "CONNECTION_FAILED",
        });
      } else {
        const res = await fetch(`/api/${model}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "생성 실패");
        setResult(data.result);
      }
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
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

  const ResultActions = ({ text, mdl }: { text: string; mdl: string }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      <button onClick={() => copyToClipboard(text)} className="btn-sm">{copied ? "복사됨 ✓" : "복사"}</button>
      <button onClick={generate} disabled={loading} className="btn-sm disabled:opacity-30">재생성</button>
      <button onClick={() => addFavorite(text, mdl)} className="btn-sm !border-amber-500/30 !text-amber-400 hover:!bg-amber-500/10">★ 저장</button>
      <button onClick={() => exportFile(text, "txt")} className="btn-sm">.txt</button>
      <button onClick={() => exportFile(text, "md")} className="btn-sm">.md</button>
    </div>
  );

  const TokenCounter = ({ text }: { text: string }) => (
    <div className="mono text-[11px] text-gray-500 mt-2 tracking-wider">
      CHARS {text.length.toLocaleString()} &nbsp;·&nbsp; TOKENS ~{estimateTokens(text).toLocaleString()}
    </div>
  );

  return (
    <>
      <MatrixBg />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#ffbd2e]" />
                <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
              </div>
              <h1 className="mono text-sm font-semibold text-[#00ff88] tracking-wide">
                PROMPT_GENERATOR
              </h1>
              <span className="mono text-[10px] text-gray-600 hidden sm:inline">v1.0</span>
            </div>

            <nav className="flex gap-1">
              <button
                onClick={() => setTab("main")}
                className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                  tab === "main"
                    ? "bg-white/[0.08] text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                생성기
              </button>
              <button
                onClick={() => setTab("favorites")}
                className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 ${
                  tab === "favorites"
                    ? "bg-white/[0.08] text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                즐겨찾기
                {favorites.length > 0 && (
                  <span className="mono text-[10px] bg-[#00ff88]/15 text-[#00ff88] px-1.5 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </header>

        {tab === "favorites" ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {favorites.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-gray-500 text-sm">저장된 프롬프트가 없습니다</p>
                <p className="text-gray-600 text-xs mt-1">생성된 프롬프트에서 ★ 저장을 눌러보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div key={fav.id} className="card p-5 fade-up">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded ${
                          fav.model === "claude" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"
                        }`}>
                          {fav.model.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">{fav.purpose}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(fav.timestamp).toLocaleDateString("ko")}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => copyToClipboard(fav.result)} className="btn-sm text-[11px]">복사</button>
                        <button onClick={() => removeFavorite(fav.id)} className="btn-sm text-[11px] !border-red-500/20 !text-red-400 hover:!bg-red-500/10">삭제</button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 truncate">{fav.input}</p>
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">{fav.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT PANEL */}
              <div className="lg:col-span-5 space-y-5">
                {/* Model Selection */}
                <div className="card p-4">
                  <label className="label">모델 선택</label>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setModel("claude"); setCompareMode(false); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        model === "claude" && !compareMode
                          ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30"
                          : "bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                      }`}
                    >
                      <StatusDot active={model === "claude" && !compareMode} />
                      Claude
                    </button>
                    <button
                      onClick={() => { setModel("gemini"); setCompareMode(false); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        model === "gemini" && !compareMode
                          ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                          : "bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                      }`}
                    >
                      <StatusDot active={model === "gemini" && !compareMode} />
                      Gemini
                    </button>
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        compareMode
                          ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30"
                          : "bg-white/[0.03] text-gray-500 hover:bg-white/[0.06] hover:text-gray-300"
                      }`}
                    >
                      <StatusDot active={compareMode} />
                      비교
                    </button>
                  </div>
                  {compareMode && (
                    <p className="text-[11px] text-purple-400/70 mt-2 fade-up">
                      Claude와 Gemini 결과를 동시에 비교합니다
                    </p>
                  )}
                </div>

                {/* Purpose Cards */}
                <div className="card p-4">
                  <label className="label">사용 목적</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {PURPOSES.map((purpose) => (
                      <button
                        key={purpose.id}
                        onClick={() => setSelectedPurpose(purpose.id)}
                        className={`group relative p-3 rounded-lg text-left text-sm transition-all ${
                          selectedPurpose === purpose.id
                            ? "bg-[#00ff88]/8 ring-1 ring-[#00ff88]/25 text-white"
                            : "bg-white/[0.02] text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                        }`}
                      >
                        <span className="text-base mr-1.5">{purpose.emoji}</span>
                        <span className="text-[13px]">{purpose.label}</span>
                        {selectedPurpose === purpose.id && (
                          <span className="absolute top-1.5 right-2 text-[#00ff88] text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                {currentPurpose && (
                  <div className="card p-4 fade-up">
                    <label className="label">세부 조건</label>
                    <div className="relative mt-2">
                      <span className="mono absolute left-3 top-3 text-[#00ff88]/40 text-sm select-none pointer-events-none">{">"}</span>
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={currentPurpose.placeholder}
                        rows={5}
                        className="w-full bg-black/40 rounded-lg pl-7 pr-4 py-3 text-sm text-gray-200 placeholder-gray-600 resize-none ring-1 ring-white/[0.06] focus:ring-[#00ff88]/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Execute */}
                {currentPurpose && (
                  <button
                    onClick={generate}
                    disabled={loading || !userInput.trim()}
                    className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all fade-up ${
                      loading || !userInput.trim()
                        ? "bg-white/[0.04] text-gray-600 cursor-not-allowed"
                        : "bg-[#00ff88]/12 text-[#00ff88] ring-1 ring-[#00ff88]/20 hover:bg-[#00ff88]/18 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0.2s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0.4s" }} />
                        </span>
                        생성 중
                      </span>
                    ) : (
                      <span className="mono tracking-wider">EXECUTE</span>
                    )}
                  </button>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div ref={resultRef} className="lg:col-span-7 space-y-4">
                {error && (
                  <div className="card !border-red-500/20 p-4 fade-up">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Single Result */}
                {result && !compareMode && (
                  <div className="card p-5 fade-up">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium ${
                          model === "claude" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"
                        }`}>
                          {model.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{currentPurpose?.label}</span>
                      </div>
                    </div>
                    <div className="bg-black/40 rounded-lg p-4 ring-1 ring-white/[0.04]">
                      <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                        <TypeWriter text={result} />
                      </div>
                    </div>
                    <ResultActions text={result} mdl={model} />
                    <TokenCounter text={result} />
                  </div>
                )}

                {/* Compare Results */}
                {compareResult && compareMode && (
                  <div className="space-y-4 fade-up">
                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="mono text-[10px] px-2 py-0.5 rounded font-medium bg-orange-500/15 text-orange-400">CLAUDE</span>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 ring-1 ring-white/[0.04] max-h-80 overflow-y-auto">
                        <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                          <TypeWriter text={compareResult.claude} />
                        </div>
                      </div>
                      <ResultActions text={compareResult.claude} mdl="claude" />
                      <TokenCounter text={compareResult.claude} />
                    </div>

                    <div className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="mono text-[10px] px-2 py-0.5 rounded font-medium bg-blue-500/15 text-blue-400">GEMINI</span>
                      </div>
                      <div className="bg-black/40 rounded-lg p-4 ring-1 ring-white/[0.04] max-h-80 overflow-y-auto">
                        <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                          <TypeWriter text={compareResult.gemini} />
                        </div>
                      </div>
                      <ResultActions text={compareResult.gemini} mdl="gemini" />
                      <TokenCounter text={compareResult.gemini} />
                    </div>
                  </div>
                )}

                {/* Idle */}
                {!result && !compareResult && !error && !loading && (
                  <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#00ff88]/8 flex items-center justify-center mb-4">
                      <span className="text-[#00ff88] text-xl">⟩</span>
                    </div>
                    <p className="text-gray-400 text-sm">결과가 여기에 표시됩니다</p>
                    <p className="text-gray-600 text-xs mt-1">모델과 목적을 선택한 후 실행하세요</p>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] shimmer">
                    <div className="flex gap-2 mb-4">
                      <span className="w-2 h-2 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0s" }} />
                      <span className="w-2 h-2 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0.2s" }} />
                      <span className="w-2 h-2 rounded-full bg-[#00ff88] pulse-dot" style={{ animationDelay: "0.4s" }} />
                    </div>
                    <p className="text-gray-400 text-sm">
                      {compareMode ? "Claude & Gemini 동시 생성 중" : `${model === "claude" ? "Claude" : "Gemini"} 생성 중`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="mono text-[11px] text-gray-700 tracking-wider">
                PROMPT_GENERATOR v1.0 — {new Date().getFullYear()}
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .card {
          background: rgba(15, 17, 23, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          backdrop-filter: blur(12px);
        }
        .card:hover {
          border-color: rgba(255, 255, 255, 0.09);
        }
        .label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .btn-sm {
          padding: 5px 12px;
          font-size: 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #aaa;
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.15s;
          cursor: pointer;
        }
        .btn-sm:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
