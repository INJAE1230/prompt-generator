export interface Purpose {
  id: string;
  emoji: string;
  label: string;
  placeholder: string;
  systemPrompt: string;
}

export interface Option {
  id: string;
  emoji: string;
  label: string;
  instruction: string;
}

export const PURPOSES: Purpose[] = [
  { id: "business-doc", emoji: "📄", label: "업무문서", placeholder: "프로젝트 제안서, 기획안 등 작성할 문서의 종류와 핵심 내용", systemPrompt: "당신은 비즈니스 문서 작성 전문가입니다. 명확하고 전문적인 업무 문서를 위한 프롬프트를 작성하세요. 문서 구조, 핵심 포함 요소, 톤앤매너, 분량 가이드를 포함하세요." },
  { id: "email", emoji: "📧", label: "이메일", placeholder: "수신자, 목적, 핵심 전달 사항, 원하는 톤", systemPrompt: "당신은 비즈니스 커뮤니케이션 전문가입니다. 목적에 맞는 효과적인 이메일을 위한 프롬프트를 작성하세요. 수신자 맞춤 톤, 구조, CTA를 포함하세요." },
  { id: "report", emoji: "📊", label: "보고서", placeholder: "보고서 주제, 대상 독자, 포함할 데이터/분석 항목", systemPrompt: "당신은 보고서 작성 전문가입니다. 데이터 기반의 체계적인 보고서를 위한 프롬프트를 작성하세요. 분석 프레임워크, 시각화 제안, 결론 도출 방법을 포함하세요." },
  { id: "excel", emoji: "📐", label: "엑셀수식", placeholder: "처리할 데이터 유형, 원하는 계산/변환, 시트 구조", systemPrompt: "당신은 Excel/스프레드시트 전문가입니다. 복잡한 엑셀 수식, 매크로, 데이터 처리를 위한 프롬프트를 작성하세요. 함수 조합, 조건부 로직, 오류 처리를 포함하세요." },
  { id: "official-doc", emoji: "🏛️", label: "공문서", placeholder: "공문서 종류, 발신/수신 기관, 핵심 내용", systemPrompt: "당신은 공문서 작성 전문가입니다. 정부/공공기관 형식에 맞는 공식 문서를 위한 프롬프트를 작성하세요. 법적 용어, 격식체, 필수 구성 요소를 포함하세요." },
  { id: "meeting", emoji: "📝", label: "회의록", placeholder: "회의 주제, 참석자, 주요 안건, 결정 사항 형식", systemPrompt: "당신은 회의 기록 전문가입니다. 체계적이고 활용도 높은 회의록을 위한 프롬프트를 작성하세요. 안건별 정리, 액션 아이템, 후속 조치를 포함하세요." },
  { id: "trade", emoji: "📈", label: "트레이드", placeholder: "자산 종류, 전략 유형, 분석할 지표", systemPrompt: "당신은 퀀트 트레이더입니다. 매매전략, 기술적 분석, 진입/청산 조건을 포함한 프롬프트를 작성하세요. 리스크 관리, 포지션 사이징, 백테스트 조건을 포함하세요." },
  { id: "claude-code", emoji: "💻", label: "클로드코드", placeholder: "개발할 기능, 사용 기술스택, 프로젝트 구조", systemPrompt: "당신은 Claude Code 전문가입니다. 명확한 개발 지시, 파일구조, 기술스택을 포함한 프롬프트를 작성하세요. 단계별 구현 지시, 에러 처리, 테스트 요구사항을 포함하세요." },
  { id: "roblox", emoji: "🎮", label: "로블록스 Lua", placeholder: "게임 장르, 필요한 기능, 게임 메카닉", systemPrompt: "당신은 Roblox 게임 개발 전문가입니다. Lua 스크립트, Roblox API, 게임 로직을 포함한 프롬프트를 작성하세요. 서버/클라이언트 구분, 보안, 성능 최적화를 포함하세요." },
  { id: "contract", emoji: "📜", label: "계약서", placeholder: "계약 종류(금전소비대차/가맹/임대차/근로계약 등), 당사자, 핵심 조건", systemPrompt: "당신은 계약서 작성 및 법률 문서 전문가입니다. 계약 유형에 맞는 정확한 법적 구조와 조항을 포함한 프롬프트를 작성하세요. 반드시 최신 개정 법령(민법, 상법, 근로기준법, 주택임대차보호법, 가맹사업법 등)을 기준으로 하고, 계약 당사자의 권리·의무, 계약 기간, 해지 조건, 손해배상, 분쟁 해결 조항, 특약사항을 빠짐없이 포함하세요. 관련 법조항 번호를 명시하고, 최근 법 개정 사항이 있을 경우 반영 여부를 확인하도록 안내하세요." },
  { id: "other", emoji: "✏️", label: "기타", placeholder: "원하는 프롬프트의 목적과 세부 요구사항을 자유롭게 입력하세요", systemPrompt: "당신은 AI 프롬프트 엔지니어링 전문가입니다. 사용자의 요구에 맞는 최적화된 프롬프트를 작성하세요. 명확한 역할 설정, 구체적 지시사항, 출력 형식, 제약 조건을 포함하세요." },
];

export const OPTIONS: Option[] = [
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
