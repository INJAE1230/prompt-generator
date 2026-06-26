"use client";

import { PURPOSES, OPTIONS } from "@/lib/constants";

export default function GuideTab() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* 사용법 */}
      <div className="card p-6 fade-up">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>사용법</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "모델 선택", desc: "Claude 또는 Gemini 중 원하는 AI 모델을 선택하세요. '비교' 버튼을 누르면 두 모델의 결과를 동시에 볼 수 있습니다." },
            { step: "2", title: "사용 목적 선택", desc: "프롬프트의 용도에 맞는 카테고리를 선택하세요. 목적에 따라 AI가 더 정확한 프롬프트를 만들어 줍니다." },
            { step: "3", title: "세부 조건 입력", desc: "만들고 싶은 프롬프트의 내용을 자유롭게 적어주세요. 구체적일수록 결과가 좋아집니다." },
            { step: "4", title: "추가 옵션 선택", desc: "원하는 스타일이나 형식을 선택하세요. 여러 개를 동시에 고를 수 있습니다." },
            { step: "5", title: "GENERATE", desc: "버튼을 누르면 AI가 최적화된 프롬프트를 실시간으로 생성합니다." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mono text-sm font-bold" style={{ background: "var(--bg-input)", color: "var(--accent)", border: "1px solid var(--border)" }}>
                {item.step}
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text)" }}>{item.title}</p>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사용 목적 설명 */}
      <div className="card p-6 fade-up">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>사용 목적</h2>
        <div className="space-y-2.5">
          {PURPOSES.map((p) => (
            <div key={p.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg" style={{ background: "var(--bg-input)" }}>
              <span className="text-lg flex-shrink-0 mt-0.5">{p.emoji}</span>
              <div>
                <p className="text-base font-semibold" style={{ color: "var(--text)" }}>{p.label}</p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{p.placeholder}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 추가 옵션 설명 */}
      <div className="card p-6 fade-up">
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>추가 옵션</h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
              <div className="px-4 py-3.5 flex items-center gap-3">
                <span className={`flex-shrink-0 ${opt.id === "korean" || opt.id === "english" ? "mono text-sm font-semibold" : "text-xl"}`} style={opt.id === "korean" || opt.id === "english" ? { color: "var(--text-dim)" } : undefined}>{opt.emoji}</span>
                <p className="text-lg font-semibold" style={{ color: "var(--text)" }}>{opt.label}</p>
              </div>
              <div className="px-4 pb-4 space-y-2.5">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{opt.desc}</p>
                <div className="flex items-start gap-2">
                  <span className="mono text-xs px-2 py-0.5 rounded flex-shrink-0 font-medium" style={{ background: "var(--bg-card)", color: "var(--accent)", border: "1px solid var(--border)" }}>추천</span>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{opt.when}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mono text-xs px-2 py-0.5 rounded flex-shrink-0 font-medium" style={{ background: "var(--bg-card)", color: "var(--text-dim)", border: "1px solid var(--border)" }}>TIP</span>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{opt.tip}</p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>잘 맞는 조합:</span>
                  {opt.pair.map((pId) => {
                    const paired = OPTIONS.find(o => o.id === pId);
                    return paired ? (
                      <span key={pId} className="mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
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
        <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text)" }}>결과 정보</h2>
        <div className="space-y-3">
          {[
            { label: "모델명", desc: "프롬프트를 생성한 AI 모델 이름" },
            { label: "입력 토큰", desc: "내가 입력한 내용의 크기 (한글 1자 ≈ 2~3토큰)" },
            { label: "출력 토큰", desc: "AI가 생성한 프롬프트의 크기" },
            { label: "응답 시간", desc: "요청부터 생성 완료까지 걸린 시간" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="mono text-xs px-2 py-0.5 rounded font-medium flex-shrink-0" style={{ background: "var(--bg-input)", color: "var(--accent)", border: "1px solid var(--border)" }}>{item.label}</span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
