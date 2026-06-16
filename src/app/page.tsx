"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Model = "claude" | "gemini";
type Tab = "main" | "favorites" | "guide";
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

interface StreamMeta {
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency: number;
}

interface Option {
  id: string;
  emoji: string;
  label: string;
  instruction: string;
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

const OPTIONS: Option[] = [
  { id: "detailed", emoji: "📋", label: "상세하게", instruction: "가능한 한 상세하고 구체적으로 작성하세요" },
  { id: "step-by-step", emoji: "🔢", label: "단계별로", instruction: "단계별로 구분하여 체계적으로 작성하세요" },
  { id: "with-examples", emoji: "💡", label: "예시 포함", instruction: "적절한 예시를 포함하세요" },
  { id: "list-format", emoji: "📑", label: "표/목록 형식", instruction: "표나 목록 형식을 활용하세요" },
  { id: "simple", emoji: "🐣", label: "쉬운 말로", instruction: "전문 용어를 피하고 쉬운 말로 작성하세요" },
  { id: "concise", emoji: "⚡", label: "간결하게", instruction: "핵심만 간결하게 작성하세요" },
  { id: "korean", emoji: "KR", label: "한국어로", instruction: "반드시 한국어로 작성하세요" },
  { id: "expert", emoji: "🎓", label: "전문가 수준", instruction: "해당 분야 전문가 수준의 깊이로 작성하세요" },
  { id: "english", emoji: "EN", label: "영어로", instruction: "반드시 영어로 작성하세요" },
  { id: "compare", emoji: "🔄", label: "비교/대조", instruction: "비교와 대조 구조를 활용하여 작성하세요" },
  { id: "qna", emoji: "❓", label: "Q&A 형식", instruction: "질문과 답변 형식으로 구성하세요" },
  { id: "markdown", emoji: "📝", label: "마크다운", instruction: "마크다운 문법(제목, 볼드, 코드블록 등)을 활용하세요" },
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

async function readStream(
  response: Response,
  onText: (text: string) => void,
  onDone: (meta: { model: string; input_tokens: number; output_tokens: number }) => void,
  onError: (msg: string) => void,
) {
  if (!response.body) {
    onError("스트림을 읽을 수 없습니다");
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";
      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "text") onText(data.content);
          else if (data.type === "done") onDone(data);
          else if (data.type === "error") onError(data.message);
        } catch {}
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [model, setModel] = useState<Model>("gemini");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [compareResult, setCompareResult] = useState({ claude: "", gemini: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [tab, setTab] = useState<Tab>("main");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [meta, setMeta] = useState<StreamMeta | null>(null);
  const [compareMeta, setCompareMeta] = useState<{ claude: StreamMeta | null; gemini: StreamMeta | null }>({ claude: null, gemini: null });
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

  const hasAnyResult = compareMode
    ? !!(compareResult.claude || compareResult.gemini)
    : !!result;

  const generate = async () => {
    if (!currentPurpose || !userInput.trim()) return;
    setLoading(true);
    setError("");
    setResult("");
    setCompareResult({ claude: "", gemini: "" });
    setMeta(null);
    setCompareMeta({ claude: null, gemini: null });

    const optionsText = selectedOptions.length > 0
      ? `\n[추가 옵션] ${selectedOptions.map(id => OPTIONS.find(o => o.id === id)?.instruction).filter(Boolean).join("; ")}`
      : "";

    const payload = {
      systemPrompt: currentPurpose.systemPrompt,
      userMessage: `다음 요구사항에 맞는 최적화된 AI 프롬프트를 한국어로 작성해주세요.\n\n[목적] ${currentPurpose.label}\n[세부 요구사항] ${userInput}${optionsText}`,
    };

    const startTime = Date.now();
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    try {
      if (compareMode) {
        const [claudeRes, geminiRes] = await Promise.allSettled([
          fetch("/api/claude", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
          fetch("/api/gemini", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        ]);

        const readModelStream = async (
          settled: PromiseSettledResult<Response>,
          key: "claude" | "gemini",
        ) => {
          if (settled.status === "rejected") {
            setCompareResult(prev => ({ ...prev, [key]: "CONNECTION_FAILED" }));
            return;
          }
          const response = settled.value;
          const ct = response.headers.get("content-type") || "";
          if (!response.ok || ct.includes("application/json")) {
            const data = await response.json();
            setCompareResult(prev => ({ ...prev, [key]: data.error || "ERROR" }));
            return;
          }
          await readStream(
            response,
            (text) => setCompareResult(prev => ({ ...prev, [key]: prev[key] + text })),
            (doneMeta) => setCompareMeta(prev => ({ ...prev, [key]: { ...doneMeta, latency: Date.now() - startTime } })),
            (msg) => setCompareResult(prev => ({ ...prev, [key]: msg })),
          );
        };

        await Promise.all([
          readModelStream(claudeRes, "claude"),
          readModelStream(geminiRes, "gemini"),
        ]);
      } else {
        const res = await fetch(`/api/${model}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const ct = res.headers.get("content-type") || "";
        if (!res.ok || ct.includes("application/json")) {
          const data = await res.json();
          throw new Error(data.error || "생성 실패");
        }
        await readStream(
          res,
          (text) => setResult(prev => prev + text),
          (doneMeta) => setMeta({ ...doneMeta, latency: Date.now() - startTime }),
          (msg) => setError(msg),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
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

  const toggleOption = (id: string) => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const ResultActions = ({ text, mdl }: { text: string; mdl: string }) => (
    <div className="flex flex-wrap gap-2 mt-3">
      <button onClick={() => copyToClipboard(text)} className="btn-sm">{copied ? "복사됨 ✓" : "복사"}</button>
      <button onClick={generate} disabled={loading} className="btn-sm disabled:opacity-30">재생성</button>
      <button onClick={() => addFavorite(text, mdl)} className="btn-sm btn-fav">★ 저장</button>
      <button onClick={() => exportFile(text, "txt")} className="btn-sm">.txt</button>
      <button onClick={() => exportFile(text, "md")} className="btn-sm">.md</button>
    </div>
  );

  const formatModelName = (raw: string) => {
    const map: Record<string, string> = {
      "claude-sonnet-4-6": "Claude Sonnet 4.6",
      "gemini-2.5-flash": "Gemini 2.5 Flash",
    };
    return map[raw] || raw;
  };

  const MetaInfo = ({ meta: m }: { meta: StreamMeta }) => (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mono text-[11px] mt-3 tracking-wider" style={{ color: "var(--text-dim)" }}>
      <span>{formatModelName(m.model)}</span>
      <span className="opacity-40">·</span>
      <span>입력 {m.input_tokens.toLocaleString()}토큰</span>
      <span className="opacity-40">·</span>
      <span>출력 {m.output_tokens.toLocaleString()}토큰</span>
      <span className="opacity-40">·</span>
      <span>응답 {(m.latency / 1000).toFixed(1)}초</span>
    </div>
  );

  return (
    <>
      <MatrixBg theme={theme} />

      <div className="relative z-10 min-h-screen">
        {/* ═══ HEADER ═══ */}
        <header className="sticky top-0 z-50 backdrop-blur-xl border-b" style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-[2px] -mx-4 sm:-mx-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40" />
            </div>

            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20">
                  <span className="mono font-bold text-base sm:text-lg" style={{ color: "var(--accent)" }}>P</span>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                    Prompt Generator
                  </h1>
                  <p className="mono text-[9px] sm:text-[11px] tracking-widest hidden sm:block" style={{ color: "var(--text-dim)" }}>
                    AI-POWERED · v1.0
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-4">
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

              <div className="flex items-center gap-1 sm:gap-2">
                <nav className="flex gap-1 mr-1 sm:mr-2">
                  <button onClick={() => setTab("main")} className="tab-btn" data-active={tab === "main"}>
                    <span className="hidden sm:inline">생성기</span>
                    <span className="sm:hidden">생성</span>
                  </button>
                  <button onClick={() => setTab("favorites")} className="tab-btn" data-active={tab === "favorites"}>
                    <span className="hidden sm:inline">즐겨찾기</span>
                    <span className="sm:hidden">★</span>
                    {favorites.length > 0 && (
                      <span className="mono text-[9px] ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent)]/15" style={{ color: "var(--accent)" }}>
                        {favorites.length}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setTab("guide")} className="tab-btn" data-active={tab === "guide"}>
                    <span className="hidden sm:inline">가이드</span>
                    <span className="sm:hidden">?</span>
                  </button>
                </nav>

                <div className="w-px h-5" style={{ background: "var(--border)" }} />

                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
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

        {/* ═══ GUIDE TAB ═══ */}
        {tab === "guide" ? (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* 사용법 */}
            <div className="card p-6 fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>사용법</h2>
              <div className="space-y-4">
                {[
                  { step: "1", title: "모델 선택", desc: "Claude 또는 Gemini 중 원하는 AI 모델을 선택하세요. '비교' 버튼을 누르면 두 모델의 결과를 동시에 볼 수 있습니다." },
                  { step: "2", title: "사용 목적 선택", desc: "프롬프트의 용도에 맞는 카테고리를 선택하세요. 목적에 따라 AI가 더 정확한 프롬프트를 만들어 줍니다." },
                  { step: "3", title: "세부 조건 입력", desc: "만들고 싶은 프롬프트의 내용을 자유롭게 적어주세요. 구체적일수록 결과가 좋아집니다." },
                  { step: "4", title: "추가 옵션 선택", desc: "원하는 스타일이나 형식을 선택하세요. 여러 개를 동시에 고를 수 있습니다." },
                  { step: "5", title: "GENERATE", desc: "버튼을 누르면 AI가 최적화된 프롬프트를 실시간으로 생성합니다." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mono text-xs font-bold" style={{ background: "var(--bg-input)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 사용 목적 설명 */}
            <div className="card p-6 fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>사용 목적</h2>
              <div className="space-y-2.5">
                {PURPOSES.map((p) => (
                  <div key={p.id} className="flex items-start gap-3 py-2 px-3 rounded-lg" style={{ background: "var(--bg-input)" }}>
                    <span className="text-base flex-shrink-0 mt-0.5">{p.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{p.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.placeholder}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 추가 옵션 설명 */}
            <div className="card p-6 fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>추가 옵션</h2>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                여러 개를 동시에 선택할 수 있습니다. 선택한 옵션이 프롬프트 생성에 반영됩니다.<br/>
                옵션을 조합하면 더 정교한 프롬프트를 만들 수 있습니다.
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: "detailed", emoji: "📋", label: "상세하게",
                    desc: "AI가 프롬프트를 최대한 구체적이고 상세하게 작성합니다. 배경 설명, 세부 조건, 예외 사항 등을 빠짐없이 포함시킵니다.",
                    when: "복잡한 업무나 여러 조건이 있는 문서를 만들 때",
                    tip: "\"단계별로\"와 함께 사용하면 체계적이면서도 빈틈없는 프롬프트가 됩니다.",
                    pair: ["step-by-step", "expert"],
                  },
                  {
                    id: "step-by-step", emoji: "🔢", label: "단계별로",
                    desc: "프롬프트를 순차적인 단계로 나누어 구성합니다. 1단계, 2단계... 형태로 작업 순서를 명확히 합니다.",
                    when: "절차가 중요한 작업이나 순서대로 진행해야 하는 과정을 설명할 때",
                    tip: "엑셀수식, 클로드코드 등 기술적 목적에서 특히 효과적입니다.",
                    pair: ["detailed", "with-examples"],
                  },
                  {
                    id: "with-examples", emoji: "💡", label: "예시 포함",
                    desc: "프롬프트에 구체적인 입출력 예시를 포함시킵니다. AI가 원하는 결과의 형태를 더 정확히 이해하게 됩니다.",
                    when: "원하는 결과물의 형태를 명확히 보여주고 싶을 때",
                    tip: "모든 목적과 잘 어울리며, 특히 이메일/공문서처럼 형식이 중요한 경우 필수입니다.",
                    pair: ["detailed", "list-format"],
                  },
                  {
                    id: "list-format", emoji: "📑", label: "표/목록 형식",
                    desc: "결과물을 표(테이블)나 불릿 목록 형태로 정리하도록 유도합니다. 정보를 한눈에 비교하거나 체크리스트로 활용할 수 있습니다.",
                    when: "비교 분석, 항목 정리, 체크리스트가 필요할 때",
                    tip: "보고서, 회의록 작성 시 가독성을 크게 높여줍니다.",
                    pair: ["compare", "markdown"],
                  },
                  {
                    id: "simple", emoji: "🐣", label: "쉬운 말로",
                    desc: "전문 용어를 피하고 누구나 이해할 수 있는 쉬운 표현을 사용합니다. 초보자나 비전문가도 따라할 수 있도록 풀어서 설명합니다.",
                    when: "다양한 수준의 독자를 대상으로 할 때, 또는 교육/안내 자료를 만들 때",
                    tip: "\"전문가 수준\"과는 반대 효과이므로 동시 선택을 피하세요.",
                    pair: ["step-by-step", "with-examples"],
                  },
                  {
                    id: "concise", emoji: "⚡", label: "간결하게",
                    desc: "핵심만 남기고 불필요한 설명을 모두 제거합니다. 짧고 임팩트 있는 프롬프트를 만듭니다.",
                    when: "빠른 결과가 필요하거나 토큰을 절약하고 싶을 때",
                    tip: "\"상세하게\"와는 반대 효과입니다. 이메일, 보고서 요약에 적합합니다.",
                    pair: ["list-format"],
                  },
                  {
                    id: "korean", emoji: "KR", label: "한국어로",
                    desc: "프롬프트 전체를 한국어로 작성하도록 강제합니다. 기본적으로 한국어가 사용되지만, 영어 전문용어가 많은 분야에서 확실한 한국어 출력을 보장합니다.",
                    when: "한국어 결과물이 반드시 필요할 때, 영어 혼용을 방지하고 싶을 때",
                    tip: "\"영어로\" 옵션과 동시에 선택하면 충돌하므로 주의하세요.",
                    pair: ["simple"],
                  },
                  {
                    id: "expert", emoji: "🎓", label: "전문가 수준",
                    desc: "해당 분야의 전문가가 사용하는 깊이 있는 용어와 개념을 활용합니다. 학술적/기술적으로 높은 수준의 프롬프트를 생성합니다.",
                    when: "전문가 대상 문서, 기술 보고서, 학술 자료를 만들 때",
                    tip: "트레이드, 클로드코드, 엑셀수식 등 전문 분야와 조합하면 효과적입니다.",
                    pair: ["detailed", "with-examples"],
                  },
                  {
                    id: "english", emoji: "EN", label: "영어로",
                    desc: "프롬프트 전체를 영어로 작성합니다. 해외 협업, 영문 이메일, 글로벌 문서 작성에 활용됩니다.",
                    when: "영어 결과물이 필요하거나 영어권 AI에게 전달할 프롬프트를 만들 때",
                    tip: "\"한국어로\" 옵션과 동시에 선택하면 충돌하므로 주의하세요.",
                    pair: ["expert"],
                  },
                  {
                    id: "compare", emoji: "🔄", label: "비교/대조",
                    desc: "두 가지 이상의 대상을 비교·대조하는 구조로 프롬프트를 구성합니다. 장단점, 차이점, 공통점을 체계적으로 분석합니다.",
                    when: "선택지 비교, 기술 비교, 정책 비교 등 의사결정이 필요한 상황",
                    tip: "\"표/목록 형식\"과 함께 사용하면 비교표가 포함되어 더 직관적입니다.",
                    pair: ["list-format", "detailed"],
                  },
                  {
                    id: "qna", emoji: "❓", label: "Q&A 형식",
                    desc: "질문과 답변이 번갈아 나오는 형식으로 프롬프트를 구성합니다. FAQ, 인터뷰, 교육 자료에 적합합니다.",
                    when: "FAQ 문서, 교육 콘텐츠, 인터뷰 스크립트를 만들 때",
                    tip: "\"쉬운 말로\"와 함께 쓰면 초보자용 가이드에 완벽합니다.",
                    pair: ["simple", "with-examples"],
                  },
                  {
                    id: "markdown", emoji: "📝", label: "마크다운",
                    desc: "마크다운 문법(제목, 볼드, 코드블록, 인용 등)을 활용한 구조화된 프롬프트를 생성합니다. 결과물을 바로 문서로 활용할 수 있습니다.",
                    when: "GitHub, Notion 등 마크다운을 지원하는 플랫폼에서 바로 사용할 문서를 만들 때",
                    tip: "클로드코드 목적에서 특히 유용합니다. 코드블록이 포함된 깔끔한 지시문을 만들 수 있습니다.",
                    pair: ["list-format", "step-by-step"],
                  },
                ].map((opt) => (
                  <div key={opt.id} className="rounded-xl overflow-hidden" style={{ background: "var(--bg-input)", border: "1px solid var(--border-inner)" }}>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className={`flex-shrink-0 ${opt.id === "korean" || opt.id === "english" ? "mono text-[11px] font-semibold" : "text-base"}`} style={opt.id === "korean" || opt.id === "english" ? { color: "var(--text-dim)" } : undefined}>{opt.emoji}</span>
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{opt.label}</p>
                    </div>
                    <div className="px-4 pb-3 space-y-2">
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{opt.desc}</p>
                      <div className="flex items-start gap-2">
                        <span className="mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium" style={{ background: "var(--bg-card)", color: "var(--accent)", border: "1px solid var(--border)" }}>추천</span>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{opt.when}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-medium" style={{ background: "var(--bg-card)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>TIP</span>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{opt.tip}</p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>잘 맞는 조합:</span>
                        {opt.pair.map((pId) => {
                          const paired = OPTIONS.find(o => o.id === pId);
                          return paired ? (
                            <span key={pId} className="mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                              {paired.emoji} {paired.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 결과 정보 설명 */}
            <div className="card p-6 fade-up">
              <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text)" }}>결과 정보</h2>
              <div className="space-y-3">
                {[
                  { label: "모델명", desc: "프롬프트를 생성한 AI 모델 이름" },
                  { label: "입력 토큰", desc: "내가 입력한 내용의 크기 (한글 1자 ≈ 2~3토큰)" },
                  { label: "출력 토큰", desc: "AI가 생성한 프롬프트의 크기" },
                  { label: "응답 시간", desc: "요청부터 생성 완료까지 걸린 시간" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="mono text-[11px] px-2 py-0.5 rounded font-medium flex-shrink-0" style={{ background: "var(--bg-input)", color: "var(--accent)", border: "1px solid var(--border)" }}>{item.label}</span>
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "favorites" ? (
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
                      className={`flex-1 py-3 rounded-lg text-base font-medium transition-all flex items-center justify-center gap-2 ${
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
                    className={`px-5 py-3 rounded-lg text-base font-medium transition-all flex items-center justify-center gap-2 ${
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
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-2.5 mt-2">
                  {PURPOSES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPurpose(p.id)}
                      className={`purpose-btn ${selectedPurpose === p.id ? "purpose-btn-active" : ""}`}
                    >
                      <span className="text-base mr-1.5">{p.emoji}</span>
                      <span className="text-[15px]">{p.label}</span>
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

              {/* Options */}
              {currentPurpose && (
                <div className="card p-4 fade-up">
                  <label className="label">추가 옵션</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => toggleOption(opt.id)}
                        className={`option-btn ${selectedOptions.includes(opt.id) ? "option-btn-active" : ""}`}
                      >
                        <span className={`mr-1.5 ${opt.id === "korean" || opt.id === "english" ? "mono text-[11px] font-semibold" : "text-sm"}`}>{opt.emoji}</span>
                        <span className="text-[13px]">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Execute */}
              {currentPurpose && (
                <button
                  onClick={generate}
                  disabled={loading || !userInput.trim()}
                  className={`execute-btn group ${loading || !userInput.trim() ? "execute-btn-disabled" : ""}`}
                >
                  <div className="execute-glow" />
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <span className="flex gap-1.5">
                          {[0, 0.15, 0.3].map((d) => (
                            <span key={d} className="w-2 h-2 rounded-full pulse-dot bg-white" style={{ animationDelay: `${d}s` }} />
                          ))}
                        </span>
                        <span className="text-white/90">PROCESSING</span>
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                          <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        <span className="tracking-wider font-bold">GENERATE</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </>
                    )}
                  </div>
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

              {/* Single result (streaming) */}
              {result && !compareMode && (
                <div className="card p-5 fade-up">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium ${model === "claude" ? "bg-orange-500/15 text-orange-400" : "bg-blue-500/15 text-blue-400"}`}>
                      {model.toUpperCase()}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>{currentPurpose?.label}</span>
                  </div>
                  <div className="result-box">
                    <div className="text-[15px] whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                      {result}{loading && <span className="cursor-blink" />}
                    </div>
                  </div>
                  {!loading && <ResultActions text={result} mdl={model} />}
                  {!loading && meta && <MetaInfo meta={meta} />}
                </div>
              )}

              {/* Compare results (streaming) */}
              {compareMode && (compareResult.claude || compareResult.gemini) && (
                <div className="space-y-4 fade-up">
                  {[
                    { key: "claude" as const, label: "CLAUDE", color: "orange" },
                    { key: "gemini" as const, label: "GEMINI", color: "blue" },
                  ].map((m) => (
                    <div key={m.key} className="card p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`mono text-[10px] px-2 py-0.5 rounded font-medium bg-${m.color}-500/15 text-${m.color}-400`}>{m.label}</span>
                        {loading && !compareResult[m.key] && (
                          <span className="text-xs" style={{ color: "var(--text-dim)" }}>연결 중...</span>
                        )}
                      </div>
                      {compareResult[m.key] ? (
                        <>
                          <div className="result-box max-h-80 overflow-y-auto">
                            <div className="text-[15px] whitespace-pre-wrap leading-relaxed" style={{ color: "var(--text)" }}>
                              {compareResult[m.key]}{loading && !compareMeta[m.key] && <span className="cursor-blink" />}
                            </div>
                          </div>
                          {!loading && <ResultActions text={compareResult[m.key]} mdl={m.key} />}
                          {compareMeta[m.key] && <MetaInfo meta={compareMeta[m.key]!} />}
                        </>
                      ) : loading ? (
                        <div className="result-box flex items-center justify-center py-8">
                          <div className="flex gap-1.5">
                            {[0, 0.15, 0.3].map((d) => (
                              <span key={d} className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--accent)", animationDelay: `${d}s` }} />
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!hasAnyResult && !error && !loading && (
                <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                    <span className="text-2xl" style={{ color: "var(--accent)" }}>⟩</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>결과가 여기에 표시됩니다</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>모델과 목적을 선택한 후 실행하세요</p>
                </div>
              )}

              {/* Loading (before first text arrives) */}
              {loading && !hasAnyResult && !error && (
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
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        [data-theme="light"] .card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04);
        }
        .card:hover { border-color: var(--border-hover); }
        [data-theme="light"] .card:hover {
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.06);
        }
        .card-error { border-color: rgba(239,68,68,0.2) !important; }

        .label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .tab-btn {
          padding: 6px 14px;
          font-size: 14px;
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
          border: 1px solid var(--border-inner);
        }
        .model-btn-inactive:hover { color: var(--text-secondary); border-color: var(--border-hover); }

        .purpose-btn {
          position: relative;
          padding: 12px 14px;
          border-radius: 10px;
          text-align: left;
          font-size: 15px;
          background: var(--bg-input);
          color: var(--text-secondary);
          transition: all 0.15s;
          border: 1px solid var(--border-inner);
        }
        .purpose-btn:hover { color: var(--text); border-color: var(--border-hover); }
        .purpose-btn:active { transform: scale(0.97); }
        .purpose-btn-active {
          border-color: var(--border-accent) !important;
          color: var(--text) !important;
          background: var(--bg-card);
        }

        .option-btn {
          padding: 7px 14px;
          border-radius: 8px;
          background: var(--bg-input);
          color: var(--text-dim);
          transition: all 0.15s;
          border: 1px solid var(--border-inner);
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .option-btn:hover { color: var(--text-secondary); border-color: var(--border-hover); }
        .option-btn:active { transform: scale(0.95); }
        .option-btn-active {
          border-color: var(--border-accent) !important;
          color: var(--accent) !important;
        }
        [data-theme="light"] .option-btn {
          border-color: var(--border);
        }

        .input-area {
          width: 100%;
          background: var(--bg-input);
          border-radius: 10px;
          padding: 14px 18px 14px 30px;
          font-size: 15px;
          color: var(--text);
          resize: none;
          border: 1px solid var(--border-inner);
          transition: border-color 0.2s;
        }
        [data-theme="light"] .input-area {
          border-color: var(--border);
        }
        .input-area::placeholder { color: var(--text-dim); }
        .input-area:focus { border-color: var(--border-accent); }

        .execute-btn {
          position: relative;
          width: 100%;
          padding: 16px 20px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 15px;
          color: #fff;
          background: linear-gradient(135deg, #059669 0%, #00c07b 50%, #10b981 100%);
          border: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 200, 120, 0.2), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .execute-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .execute-btn:hover:not(.execute-btn-disabled) .execute-glow { opacity: 1; }
        .execute-btn:hover:not(.execute-btn-disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 25px rgba(0, 200, 120, 0.3), 0 0 40px rgba(0, 255, 136, 0.1), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        .execute-btn:active:not(.execute-btn-disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(0, 200, 120, 0.2);
        }
        .execute-btn-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          background: var(--bg-input);
          color: var(--text-dim);
          box-shadow: none;
          border: 1px solid var(--border);
        }
        [data-theme="light"] .execute-btn:not(.execute-btn-disabled) {
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        [data-theme="light"] .execute-btn:hover:not(.execute-btn-disabled) {
          box-shadow: 0 6px 25px rgba(5, 150, 105, 0.35), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .result-box {
          background: var(--bg-input);
          border-radius: 10px;
          padding: 16px;
          border: 1px solid var(--border-inner);
        }
        [data-theme="light"] .result-box {
          border-color: var(--border);
        }

        .btn-sm {
          padding: 6px 14px;
          font-size: 13px;
          border-radius: 8px;
          border: 1px solid var(--border);
          color: var(--text-secondary);
          background: var(--bg-input);
          transition: all 0.15s;
          cursor: pointer;
        }
        .btn-sm:hover { border-color: var(--border-hover); color: var(--text); }
        .btn-sm:active { transform: scale(0.95); }
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
