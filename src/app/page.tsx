"use client";

import { useState, useRef } from "react";

type Model = "claude" | "gemini";

interface Purpose {
  id: string;
  emoji: string;
  label: string;
  placeholder: string;
  systemPrompt: string;
}

const PURPOSES: Purpose[] = [
  {
    id: "business-doc",
    emoji: "📄",
    label: "업무문서",
    placeholder: "예: 프로젝트 제안서, 기획안, 사업계획서 등 작성할 문서의 종류와 핵심 내용을 입력하세요",
    systemPrompt:
      "당신은 비즈니스 문서 작성 전문가입니다. 명확하고 전문적인 업무 문서를 위한 프롬프트를 작성하세요. 문서 구조, 핵심 포함 요소, 톤앤매너, 분량 가이드를 포함하세요.",
  },
  {
    id: "email",
    emoji: "📧",
    label: "이메일",
    placeholder: "예: 수신자, 목적, 핵심 전달 사항, 원하는 톤(공식/캐주얼)을 입력하세요",
    systemPrompt:
      "당신은 비즈니스 커뮤니케이션 전문가입니다. 목적에 맞는 효과적인 이메일을 위한 프롬프트를 작성하세요. 수신자 맞춤 톤, 구조, CTA(Call to Action)를 포함하세요.",
  },
  {
    id: "report",
    emoji: "📊",
    label: "보고서",
    placeholder: "예: 보고서 주제, 대상 독자, 포함할 데이터/분석 항목을 입력하세요",
    systemPrompt:
      "당신은 보고서 작성 전문가입니다. 데이터 기반의 체계적인 보고서를 위한 프롬프트를 작성하세요. 분석 프레임워크, 시각화 제안, 결론 도출 방법을 포함하세요.",
  },
  {
    id: "excel",
    emoji: "📐",
    label: "엑셀수식",
    placeholder: "예: 처리할 데이터 유형, 원하는 계산/변환, 시트 구조를 설명하세요",
    systemPrompt:
      "당신은 Excel/스프레드시트 전문가입니다. 복잡한 엑셀 수식, 매크로, 데이터 처리를 위한 프롬프트를 작성하세요. 함수 조합, 조건부 로직, 오류 처리를 포함하세요.",
  },
  {
    id: "official-doc",
    emoji: "🏛️",
    label: "공문서",
    placeholder: "예: 공문서 종류, 발신/수신 기관, 핵심 내용, 관련 법규를 입력하세요",
    systemPrompt:
      "당신은 공문서 작성 전문가입니다. 정부/공공기관 형식에 맞는 공식 문서를 위한 프롬프트를 작성하세요. 법적 용어, 격식체, 문서 번호 체계, 필수 구성 요소를 포함하세요.",
  },
  {
    id: "meeting",
    emoji: "📝",
    label: "회의록",
    placeholder: "예: 회의 주제, 참석자, 주요 안건, 결정 사항 형식을 입력하세요",
    systemPrompt:
      "당신은 회의 기록 전문가입니다. 체계적이고 활용도 높은 회의록을 위한 프롬프트를 작성하세요. 안건별 정리, 액션 아이템, 후속 조치, 담당자 배정 형식을 포함하세요.",
  },
  {
    id: "trade",
    emoji: "📈",
    label: "트레이드",
    placeholder: "예: 자산 종류(주식/비트코인), 전략 유형(스윙/데이트레이딩), 분석할 지표를 입력하세요",
    systemPrompt:
      "당신은 퀀트 트레이더입니다. 매매전략, 기술적 분석, 진입/청산 조건을 포함한 프롬프트를 작성하세요. 리스크 관리, 포지션 사이징, 백테스트 조건, 시장 환경별 전략 분기를 포함하세요.",
  },
  {
    id: "claude-code",
    emoji: "💻",
    label: "클로드코드",
    placeholder: "예: 개발할 기능, 사용 기술스택, 프로젝트 구조, 제약 조건을 입력하세요",
    systemPrompt:
      "당신은 Claude Code 전문가입니다. 명확한 개발 지시, 파일구조, 기술스택을 포함한 프롬프트를 작성하세요. 단계별 구현 지시, 에러 처리, 테스트 요구사항, 코드 스타일 가이드를 포함하세요.",
  },
  {
    id: "roblox",
    emoji: "🎮",
    label: "로블록스 Lua",
    placeholder: "예: 만들 게임 장르, 필요한 기능(전투/인벤토리/UI), 게임 메카닉을 입력하세요",
    systemPrompt:
      "당신은 Roblox 게임 개발 전문가입니다. Lua 스크립트, Roblox API, 게임 로직을 포함한 프롬프트를 작성하세요. 서버/클라이언트 구분, 보안 고려사항, 성능 최적화, Roblox 서비스 활용법을 포함하세요.",
  },
  {
    id: "other",
    emoji: "✏️",
    label: "기타",
    placeholder: "원하는 프롬프트의 목적과 세부 요구사항을 자유롭게 입력하세요",
    systemPrompt:
      "당신은 AI 프롬프트 엔지니어링 전문가입니다. 사용자의 요구에 맞는 최적화된 프롬프트를 작성하세요. 명확한 역할 설정, 구체적 지시사항, 출력 형식, 제약 조건을 포함하세요.",
  },
];

export default function Home() {
  const [model, setModel] = useState<Model>("claude");
  const [selectedPurpose, setSelectedPurpose] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const currentPurpose = PURPOSES.find((p) => p.id === selectedPurpose);
  const accentColor = model === "claude" ? "orange" : "blue";

  const generate = async () => {
    if (!currentPurpose || !userInput.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch(`/api/${model}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemPrompt: currentPurpose.systemPrompt,
          userMessage: `다음 요구사항에 맞는 최적화된 AI 프롬프트를 한국어로 작성해주세요.\n\n[목적] ${currentPurpose.label}\n[세부 요구사항] ${userInput}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "프롬프트 생성에 실패했습니다.");
      }

      setResult(data.result);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentClasses = {
    orange: {
      tab: "bg-orange-500 text-white",
      tabInactive: "bg-gray-800 text-gray-400 hover:bg-gray-700",
      card: "border-orange-500 bg-orange-500/10",
      cardHover: "hover:border-orange-500/50 hover:bg-orange-500/5",
      button: "bg-orange-500 hover:bg-orange-600",
      border: "border-orange-500/30",
      text: "text-orange-400",
      ring: "ring-orange-500/20",
      focusBorder: "focus:border-orange-500/50",
    },
    blue: {
      tab: "bg-blue-500 text-white",
      tabInactive: "bg-gray-800 text-gray-400 hover:bg-gray-700",
      card: "border-blue-500 bg-blue-500/10",
      cardHover: "hover:border-blue-500/50 hover:bg-blue-500/5",
      button: "bg-blue-500 hover:bg-blue-600",
      border: "border-blue-500/30",
      text: "text-blue-400",
      ring: "ring-blue-500/20",
      focusBorder: "focus:border-blue-500/50",
    },
  };

  const theme = accentClasses[accentColor];

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            AI 프롬프트 생성기
          </h1>
          <p className="text-gray-400">
            목적에 맞는 최적화된 프롬프트를 생성합니다
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          <button
            onClick={() => setModel("claude")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              model === "claude"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Claude
          </button>
          <button
            onClick={() => setModel("gemini")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              model === "gemini"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Gemini
          </button>
        </div>

        {/* Purpose Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">
            사용 목적을 선택하세요
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PURPOSES.map((purpose) => (
              <button
                key={purpose.id}
                onClick={() => setSelectedPurpose(purpose.id)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedPurpose === purpose.id
                    ? theme.card
                    : `border-gray-700 bg-gray-800/50 ${theme.cardHover}`
                }`}
              >
                <span className="text-2xl block mb-1">{purpose.emoji}</span>
                <span className="text-sm font-medium">{purpose.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        {currentPurpose && (
          <div className="mb-6 fade-in">
            <h2 className="text-lg font-semibold mb-3 text-gray-300">
              세부 조건을 입력하세요
            </h2>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={currentPurpose.placeholder}
              rows={4}
              className={`w-full bg-gray-800/50 border-2 border-gray-700 rounded-xl p-4 text-gray-100 placeholder-gray-500 resize-none focus:outline-none transition-colors ${theme.focusBorder}`}
            />
          </div>
        )}

        {/* Generate Button */}
        {currentPurpose && (
          <div className="mb-8 fade-in">
            <button
              onClick={generate}
              disabled={loading || !userInput.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${theme.button} text-white`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="spinner h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  프롬프트 생성 중...
                </span>
              ) : (
                "프롬프트 생성하기"
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 fade-in">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div ref={resultRef} className="fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-300">
                생성된 프롬프트
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : `bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700`
                  }`}
                >
                  {copied ? "복사됨!" : "복사"}
                </button>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all disabled:opacity-40"
                >
                  재생성
                </button>
              </div>
            </div>
            <div
              className={`p-6 bg-gray-800/50 border-2 rounded-xl whitespace-pre-wrap leading-relaxed text-gray-200 ${theme.border}`}
            >
              {result}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          AI 프롬프트 생성기 &middot; Powered by Claude & Gemini
        </footer>
      </div>
    </main>
  );
}
