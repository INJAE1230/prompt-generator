"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Model = "claude" | "gemini";
type Tab = "main" | "favorites";
type Theme = "dark" | "light";

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
  { id: "business-doc", emoji: "📄", label: "업무문서", placeholder: "프로젝트 제안서, 기획안 등 작성할 문서의 종류와 핵심 내용", systemPrompt: "당신은 비즈니스 문서 작성 전문가입니다. 명확하고 전문적인 업무 문서를 위한 프롬프트를 작성하세요. 문서 구조, 핵심 포함 요소, 톤앤매너, 분량 가이드를 포함하세요." },
  { id: "email", emoji: "📧", label: "이메일", placeholder: "수신자, 목적, 핵심 전달 사항, 원하는 톤", systemPrompt: "당신은 비즈니스 커뮤니케이션 전문가입니다. 목적에 맞는 효과적인 이메일을 위한 프롬프트를 작성하세요. 수신자 맞춤 톤, 구조, CTA를 포함하세요." },
  { id: "report", emoji: "📊", label: "보고서", placeholder: "보고서 주제, 대상 독자, 포함할 데이터/분석 항목", systemPrompt: "당신은 보고서 작성 전문가입니다. 데이터 기반의 체계적인 보고서를 위한 프롬프트를 작성하세요. 분석 프레임워크, 시각화 제안, 결론 도출 방법을 포함하세요." },
  { id: "excel", emoji: "📐", label: "엑셀수식", placeholder: "처리할 데이터 유형, 원하는 계산/변환, 시트 구조", systemPrompt: "당신은 Excel/스프레드시트 전문가입니다. 복잡한 엑셀 수식, 매크로, 데이터 처리를 위한 프롬프트를 작성하세요. 함수 조합, 조건부 로직, 오류 처리를 포함하세요." },
  { id: "official-doc", emoji: "🏛️", label: "공문서", placeholder: "공문서 종류, 발신/수신 기관, 핵심 내용", systemPrompt: "당신은 공문서 작성 전문가입니다. 정부/공공기관 형식에 맞는 공식 문서를 위한 프롬프트를 작성하세요. 법적 용어, 격식체, 필수 구성 요소를 포함하세요." },
  { id: "meeting", emoji: "📝", label: "회의록", placeholder: "회의 주제, 참석자, 주요 안건, 결정 사항 형식", systemPrompt: "당신은 회의 기록 전문가입니다. 체계적이고 활용도 높은 회의록을 위한 프롬프트를 작성하세요. 안건별 정리, 액션 아이템, 후속 조치를 포함하세요." },
  { id: "trade", emoji: "📈", label: "트레이드", placeholder: "자산 종류, 전략 유형, 분석할 지표", systemPrompt: "당신은 퀀트 트레이더입니다. 매매전략, 기술적 분석, 진입/청산 조건을 포함한 프롬프트를 작성하세요. 리스크 관리, 포지션 사이징, 백테스트 조건을 포함하세요." },
  { id: "claude-code", emoji: "💻", label: "클로드코드", placeholder: "개발할 기능, 사용 기술스택, 프로젝트 구조", systemPrompt: "당신은 Claude Code 전문가입니다. 명확한 개발 지시, 파일구조, 기술스택을 포함한 프롬프트를 작성하세요. 단계별 구현 지시, 에러 처리, 테스트 요구사항을 포함하세요." },
  { id: "roblox", emoji: "🎮", label: "로블록스 Lua", placeholder: "게임 장르, 필요한 기능, 게임 메카닉", systemPrompt: "당신은 Roblox 게임 개발 전문가입니다. Lua 스크립트, Roblox API, 게임 로직을 포함한 프롬프트를 작성하세요. 서버/클라이언트 구분, 보안, 성능 최적화를 포함하세요." },
  { id: "other", emoji: "✏️", label: "기타", placeholder: "원하는 프롬프트의 목적과 세부 요구사항을 자유롭게 입력하세요", systemPrompt: "당신은 AI 프롬프트 엔지니어링 전문가입니다. 사용자의 요구에 맞는 최적화된 프롬프트를 작성하세요. 명확한 역할 설정, 구체적 지시사항, 출력 형식, 제약 조건을 포함하세요." },
];

function MatrixBg({ theme }: { theme: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 12;
    const columns = Math.floor(canvas.width / (fontSize * 2));
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      const bgAlpha = theme === "dark" ? "rgba(10,10,15,0.15)" : "rgba(244,245,247,0.2)";
      ctx.fillStyle = bgAlpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < drops.length; i++) {
        if (Math.random() > 0.98) {
          const text = "01"[Math.floor(Math.random() * 2)];
          const x = i * fontSize * 2;
          const y = drops[i] * fontSize;
          const alpha = theme === "dark" ? Math.random() * 0.06 + 0.01 : Math.random() * 0.04 + 0.005;
          ctx.fillStyle = theme === "dark" ? `rgba(0,255,136,${alpha})` : `rgba(0,168,86,${alpha})`;
          ctx.fillText(text, x, y);
        }
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) drops[i] = 0;
        drops[i] += 0.5;
      }
    };

    const interval = setInterval(draw, 80);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }} />;
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
      if (i >= text.length) { setDisplayed(text); clearInterval(interval); setDone(true); }
      else setDisplayed(text.slice(0, i));
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}{!done && <span className="cursor-blink" />}</span>;
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
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
    const savedTheme = localStorage.getItem("prompt-theme") as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("prompt-theme", theme);
  }, [theme]);

  const saveFavorites = (favs: Favorite[]) => { setFavorites(favs); localStorage.setItem("prompt-favorites", JSON.stringify(favs)); };
  const currentPurpose = PURPOSES.find((p) => p.id === selectedPurpose);
  const estimateTokens = (text: string) => Math.ceil(text.length / 3.5);

  const generate = async () => {
    if (!currentPurpose || !userInput.trim()) return;
    setLoading(true); setError(""); setResult(""); setCompareResult(null);
    const payload = { systemPrompt: currentPurpose.systemPrompt, userMessage: `다음 요구사항에 맞는 최적화된 AI 프롬프트를 한국어로 작성해주세요.\n\n[목적] ${currentPurpose.label}\n[세부 요구사항] ${userInput}` };
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
    } finally { setLoading(false); }
  };

  const copyToClipboard = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const addFavorite = (text: string, mdl: string) => {
    const fav: Favorite = { id: Date.now().toString(), purpose: currentPurpose?.label || "", input: userInput, result: text, model: mdl, timestamp: Date.now() };
    saveFavorites([fav, ...favorites]);
  };
  const removeFavorite = (id: string) => saveFavorites(favorites.filter((f) => f.id !== id));
  const exportFile = useCallback((text: string, format: "txt" | "md") => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `prompt_${Date.now()}.${format}`; a.click(); URL.revokeObjectURL(url);
  }, []);

  const ResultActions = ({ text, mdl }: { text: string; mdl: string }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      <button onClick={() => copyToClipboard(text)} className="btn-sm">{copied ? "복사됨 ✓" : "복사"}</button>
      <button onClick={generate} disabled={loading} className="btn-sm disabled:opacity-30">재생성</button>
      <button onClick={() => addFavorite(text, mdl)} className="btn-sm btn-fav">★ 저장</button>
      <button onClick={() => exportFile(text, "txt")} className="btn-sm">.txt</button>
      <button onClick={() => exportFile(text, "md")} className="btn-sm">.md</button>
    </div>
  );

  const TokenCounter = ({ text }: { text: string }) => (
    <div className="mono text-[11px] mt-2 tracking-wider" style={{ color: "var(--text-dim)" }}>
      CHARS {text.length.toLocaleString()} &nbsp;·&nbsp; TOKENS ~{estimateTokens(text).toLocaleString()}
    </div>
  );

  return (
    <>
      <MatrixBg theme={theme} />

      <div className="relative z-10 min-h-screen">
        {/* ═══ HEADER ═══ */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Top accent line */}
            <div className="h-[2px] -mx-4 sm:-mx-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />
            </div>

            <div className="h-14 flex items-center justify-between">
              {/* Left: Logo */}
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20">
                  <span className="mono font-bold text-sm" style={{ color: "var(--accent)" }}>P</span>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                    Prompt Generator
                  </h1>
                  <p className="mono text-[9px] tracking-widest" style={{ color: "var(--text-dim)" }}>
                    AI-POWERED · v1.0
                  </p>
                </div>
              </div>

              {/* Center: Status (desktop) */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                  <span className="mono text-[10px]" style={{ color: "var(--text-dim)" }}>SYSTEM ONLINE</span>
                </div>
                <div className="w-px h-3" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${model === "claude" ? "bg-orange-400" : "bg-blue-400"}`} />
                  <span className="mono text-[10px]" style={{ color: "var(--text-dim)" }}>
                    {compareMode ? "COMPARE" : model.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Right: Nav + Theme */}
              <div className="flex items-center gap-2">
                <nav className="flex gap-1 mr-2">
                  <button
                    onClick={() => setTab("main")}
                    className="tab-btn"
                    data-active={tab === "main"}
                  >
                    생성기
                  </button>
                  <button
                    onClick={() => setTab("favorites")}
                    className="tab-btn"
                    data-active={tab === "favorites"}
                  >
                    즐겨찾기
                    {favorites.length > 0 && (
                      <span className="mono text-[9px] ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15" style={{ color: "var(--accent)" }}>
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </nav>

                <div className="w-px h-5" style={{ background: "var(--border)" }} />

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: "var(--bg-input)" }}
                  title={theme === "dark" ? "라이트 모드" : "다크 모드"}
                >
                  {theme === "dark" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim)" }}>
                      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-dim)" }}>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ═══ FAVORITES TAB ═══ */}
        {tab === "favorites" ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {favorites.length === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>저장된 프롬프트가 없습니다</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>생성된 프롬프트에서 ★ 저장을 눌러보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div key={fav.id} className="card p-5 fade-up">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium ${fav.model === "claude" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"}`}>
                          {fav.model.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{fav.purpose}</span>
                        <span className="text-xs" style={{ color: "var(--text-dim)" }}>{new Date(fav.timestamp).toLocaleDateString("ko")}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => copyToClipboard(fav.result)} className="btn-sm text-[11px]">복사</button>
                        <button onClick={() => removeFavorite(fav.id)} className="btn-sm btn-danger text-[11px]">삭제</button>
                      </div>
                    </div>
                    <p className="text-xs mb-2 truncate" style={{ color: "var(--text-dim)" }}>{fav.input}</p>
                    <p className="text-sm leading-relaxed line-clamp-4" style={{ color: "var(--text-secondary)" }}>{fav.result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (

        /* ═══ MAIN TAB ═══ */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-5 space-y-5">
              {/* Model */}
              <div className="card p-4">
                <label className="label">모델 선택</label>
                <div className="flex gap-2 mt-2">
                  {[
                    { key: "claude" as Model, name: "Claude", color: "orange" },
                    { key: "gemini" as Model, name: "Gemini", color: "blue" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      onClick={() => { setModel(m.key); setCompareMode(false); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        model === m.key && !compareMode
                          ? `bg-${m.color}-500/15 text-${m.color}-400 ring-1 ring-${m.color}-500/30`
                          : "model-btn-inactive"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${model === m.key && !compareMode ? `bg-${m.color}-400 shadow-[0_0_6px_rgba(0,0,0,0.3)]` : ""}`} style={{ background: model === m.key && !compareMode ? undefined : "var(--text-dim)" }} />
                      {m.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      compareMode ? "bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/30" : "model-btn-inactive"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${compareMode ? "bg-purple-400" : ""}`} style={{ background: compareMode ? undefined : "var(--text-dim)" }} />
                    비교
                  </button>
                </div>
                {compareMode && <p className="text-[11px] text-purple-400/70 mt-2 fade-up">Claude와 Gemini 결과를 동시에 비교합니다</p>}
              </div>

              {/* Purpose */}
              <div className="card p-4">
                <label className="label">사용 목적</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PURPOSES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPurpose(p.id)}
                      className={`purpose-btn ${selectedPurpose === p.id ? "purpose-btn-active" : ""}`}
                    >
                      <span className="text-base mr-1.5">{p.emoji}</span>
                      <span className="text-[13px]">{p.label}</span>
                      {selectedPurpose === p.id && <span className="absolute top-1.5 right-2 text-xs" style={{ color: "var(--accent)" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              {currentPurpose && (
                <div className="card p-4 fade-up">
                  <label className="label">세부 조건</label>
                  <div className="relative mt-2">
                    <span className="mono absolute left-3 top-3 text-sm select-none pointer-events-none" style={{ color: "var(--text-dim)" }}>{">"}</span>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={currentPurpose.placeholder}
                      rows={5}
                      className="input-area"
                    />
                  </div>
                </div>
              )}

              {/* Execute */}
              {currentPurpose && (
                <button
                  onClick={generate}
                  disabled={loading || !userInput.trim()}
                  className={`execute-btn ${loading || !userInput.trim() ? "execute-btn-disabled" : ""}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="flex gap-1">
                        {[0, 0.2, 0.4].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)", animationDelay: `${d}s` }} />
                        ))}
                      </span>
                      생성 중
                    </span>
                  ) : (
                    <span className="mono tracking-wider">EXECUTE</span>
                  )}
                </button>
              )}
            </div>

            {/* RIGHT */}
            <div ref={resultRef} className="lg:col-span-7 space-y-4">
              {error && (
                <div className="card card-error p-4 fade-up">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {result && !compareMode && (
                <div className="card p-5 fade-up">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium ${model === "claude" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"}`}>
                      {model.toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>{currentPurpose?.label}</span>
                  </div>
                  <div className="result-box">
                    <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                      <TypeWriter text={result} />
                    </div>
                  </div>
                  <ResultActions text={result} mdl={model} />
                  <TokenCounter text={result} />
                </div>
              )}

              {compareResult && compareMode && (
                <div className="space-y-4 fade-up">
                  {[
                    { key: "claude" as const, label: "CLAUDE", color: "orange" },
                    { key: "gemini" as const, label: "GEMINI", color: "blue" },
                  ].map((m) => (
                    <div key={m.key} className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium bg-${m.color}-500/15 text-${m.color}-400`}>{m.label}</span>
                      </div>
                      <div className="result-box max-h-80 overflow-y-auto">
                        <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                          <TypeWriter text={compareResult[m.key]} />
                        </div>
                      </div>
                      <ResultActions text={compareResult[m.key]} mdl={m.key} />
                      <TokenCounter text={compareResult[m.key]} />
                    </div>
                  ))}
                </div>
              )}

              {!result && !compareResult && !error && !loading && (
                <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <span className="text-2xl" style={{ color: "var(--accent)" }}>⟩</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>결과가 여기에 표시됩니다</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>모델과 목적을 선택한 후 실행하세요</p>
                </div>
              )}

              {loading && (
                <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] shimmer">
                  <div className="flex gap-2 mb-4">
                    {[0, 0.2, 0.4].map((d) => (
                      <span key={d} className="w-2 h-2 rounded-full pulse-dot" style={{ background: "var(--accent)", animationDelay: `${d}s` }} />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {compareMode ? "Claude & Gemini 동시 생성 중" : `${model === "claude" ? "Claude" : "Gemini"} 생성 중`}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="mono text-[11px] tracking-wider" style={{ color: "var(--text-dim)" }}>
              PROMPT_GENERATOR v1.0 — {new Date().getFullYear()}
            </p>
          </div>
        </div>
        )}
      </div>

      <style jsx global>{`
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          backdrop-filter: blur(16px);
          transition: border-color 0.2s;
        }
        .card:hover { border-color: var(--border-hover); }
        .card-error { border-color: rgba(239,68,68,0.2) !important; }

        .label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tab-btn {
          padding: 6px 12px;
          font-size: 13px;
          border-radius: 8px;
          color: var(--text-dim);
          transition: all 0.15s;
          display: flex;
          align-items: center;
        }
        .tab-btn:hover { color: var(--text-secondary); background: var(--bg-input); }
        .tab-btn[data-active="true"] { color: var(--text); background: var(--bg-input); }

        .model-btn-inactive {
          background: var(--bg-input);
          color: var(--text-dim);
          transition: all 0.15s;
        }
        .model-btn-inactive:hover { color: var(--text-secondary); }

        .purpose-btn {
          position: relative;
          padding: 10px 12px;
          border-radius: 10px;
          text-align: left;
          font-size: 13px;
          background: var(--bg-input);
          color: var(--text-secondary);
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .purpose-btn:hover { color: var(--text); border-color: var(--border-hover); }
        .purpose-btn-active {
          border-color: var(--border-accent) !important;
          color: var(--text) !important;
          background: var(--bg-card);
        }

        .input-area {
          width: 100%;
          background: var(--bg-input);
          border-radius: 10px;
          padding: 12px 16px 12px 28px;
          font-size: 14px;
          color: var(--text);
          resize: none;
          border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .input-area::placeholder { color: var(--text-dim); }
        .input-area:focus { border-color: var(--border-accent); }

        .execute-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          color: var(--accent);
          background: var(--bg-input);
          border: 1px solid var(--border-accent);
          transition: all 0.2s;
          cursor: pointer;
        }
        .execute-btn:hover:not(.execute-btn-disabled) {
          box-shadow: 0 0 24px rgba(0,255,136,0.08);
        }
        .execute-btn-disabled {
          opacity: 0.35;
          cursor: not-allowed;
          border-color: var(--border);
        }

        .result-box {
          background: var(--bg-input);
          border-radius: 10px;
          padding: 16px;
          border: 1px solid var(--border);
        }

        .btn-sm {
          padding: 5px 12px;
          font-size: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          background: var(--bg-input);
          transition: all 0.15s;
          cursor: pointer;
        }
        .btn-sm:hover { border-color: var(--border-hover); color: var(--text); }
        .btn-fav { border-color: rgba(245,158,11,0.2) !important; color: rgb(245,158,11) !important; }
        .btn-fav:hover { background: rgba(245,158,11,0.08) !important; }
        .btn-danger { border-color: rgba(239,68,68,0.2) !important; color: rgb(239,68,68) !important; }
        .btn-danger:hover { background: rgba(239,68,68,0.08) !important; }

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
