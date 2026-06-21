import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen, Lightbulb, Package, Home as HomeIcon, Briefcase, Star,
  Download, Lock, ChevronLeft, MessageCircle, Crown, Sprout,
  Sun, Mountain, Zap, Droplets, Share2, Copy
} from "lucide-react";

// 👇 파이어베이스 연결 마스터 키 (결제/DB 로직 원본 100% 유지) 👇
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClPag6QhN-icmRbS6tLsgvhLJ7mIKkBFQ",
  authDomain: "secretconsulting.firebaseapp.com",
  projectId: "secretconsulting",
  storageBucket: "secretconsulting.firebasestorage.app",
  messagingSenderId: "828043749092",
  appId: "1:828043749092:web:ede973ec88face060a6ef1",
  measurementId: "G-F3HGRZRX9W"
};

// React StrictMode 재마운트 시 Firebase 중복 생성 에러 방어 싱글톤 래퍼
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
// 👆 파이어베이스 연결 마스터 키 👆

const MENU_LIST = [
  { id: 1, title: "사주로 보는\n기본 학습스타일", icon: BookOpen, bar: "bg-gradient-to-r from-[#F5B8C8] to-[#FFCBA4]", bg: "#F5B8C8" },
  { id: 2, title: "효과적인\n학습 방법", icon: Lightbulb, bar: "bg-gradient-to-r from-[#90D8C8] to-[#90C8E8]", bg: "#90D8C8" },
  { id: 3, title: "추천\n학습 아이템", icon: Package, bar: "bg-gradient-to-r from-[#C8B8E8] to-[#F5B8C8]", bg: "#C8B8E8" },
  { id: 4, title: "공부방\n추천 컬러", icon: HomeIcon, bar: "bg-gradient-to-r from-[#E8C87A] to-[#FFCBA4]", bg: "#E8C87A" },
  { id: 5, title: "미래\n추천 직업", icon: Briefcase, bar: "bg-gradient-to-r from-[#90C8E8] to-[#B8A8E8]", bg: "#90C8E8" },
  { id: 6, title: "나는 어떤\n스타일의 인재?", icon: Star, bar: "bg-gradient-to-r from-[#90D8C8] to-[#E8C87A]", bg: "#90D8C8" },
  { id: 7, title: "학습효율 올리는\n필승 대화방법", icon: MessageCircle, bar: "bg-gradient-to-r from-[#FFCBA4] to-[#F5B8C8]", bg: "#FFCBA4" },
];

const GAN_KOR: Record<string, string> = { 甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계" };
const ZHI_KOR: Record<string, string> = { 子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해" };

const DAY_MASTERS: Record<string, any> = {
  甲: { name: "갑목(甲木)", nature: "거대한 소나무", strength: "추진력, 리더십", weakness: "유연성 부족", icon: Sprout, color: "#90D8C8" },
  乙: { name: "을목(乙木)", nature: "끈질긴 넝쿨과 꽃", strength: "적응력, 친화력", weakness: "결단력 부족", icon: Sprout, color: "#90D8C8" },
  丙: { name: "병화(丙火)", nature: "눈부신 태양", strength: "열정, 통찰력", weakness: "감정 기복", icon: Sun, color: "#F5B8C8" },
  丁: { name: "정화(丁火)", nature: "따뜻한 모닥불", strength: "세심함, 집중력", weakness: "내면 스트레스", icon: Sun, color: "#F5B8C8" },
  戊: { name: "무토(戊土)", nature: "거대한 산", strength: "신뢰감, 포용력", weakness: "변화 둔감, 고집", icon: Mountain, color: "#E8C87A" },
  己: { name: "기토(己土)", nature: "비옥한 평야", strength: "섬세함, 기억력", weakness: "지나친 신중함", icon: Mountain, color: "#E8C87A" },
  庚: { name: "경금(庚金)", nature: "강인한 무쇠", strength: "결단력, 실행력", weakness: "융통성 부족", icon: Zap, color: "#FFF4CA" },
  辛: { name: "신금(辛金)", nature: "빛나는 보석", strength: "완벽주의, 예리함", weakness: "자기중심적 예민함", icon: Zap, color: "#FFF4CA" },
  壬: { name: "임수(壬水)", nature: "넓은 바다", strength: "지혜, 수용성", weakness: "생각이 많아 지연", icon: Droplets, color: "#90C8E8" },
  癸: { name: "계수(癸水)", nature: "촉촉한 봄비", strength: "창의력, 직관력", weakness: "감정적, 끈기 부족", icon: Droplets, color: "#90C8E8" }
};

const ELEMENT_PRESCRIPTION: Record<string, any> = {
  "목(나무)": { color: "딥 그린, 터콰이즈", item: "원목 소재 가구, 뻗은 식물(스투키)", action: "목차와 뼈대를 기획하는 습관", job: "기획, 교육, IT 개발, 건축", symbols: [{ emoji: "🌳", label: "성장 에너지" }, { emoji: "📈", label: "구조화 훈련" }] },
  "화(불)": { color: "피치 코랄, 인디고 핑크", item: "따뜻한 조명, 붉은 계열 소품", action: "타인에게 설명하는 출력(Output) 학습", job: "방송, 미디어, 마케팅, 디자이너", symbols: [{ emoji: "🔥", label: "출력(Output)" }, { emoji: "🗣️", label: "티칭 학습법" }] },
  "토(흙)": { color: "오트밀 베이지, 브릭 레드", item: "푹신한 방석, 도자기, 정리 수납장", action: "매일 같은 시간, 장소의 고정 루틴", job: "행정, 금융 컨설팅, 부동산", symbols: [{ emoji: "⛰️", label: "고정 루틴" }, { emoji: "🗂️", label: "공간 정리" }] },
  "금(쇠)": { color: "스노우 화이트, 실버 그레이", item: "금속 재질의 거치대, 정교한 펜", action: "감정을 배제한 논리적 오답 분석", job: "법조계, 데이터 분석, 의료", symbols: [{ emoji: "⚔️", label: "원리 분석" }, { emoji: "🧊", label: "감정 배제" }] },
  "수(물)": { color: "미드나잇 블루, 딥 퍼플", item: "노이즈 캔슬링 헤드폰, 가습기", action: "방해받지 않는 심야 시간의 딥워크", job: "기획/전략, 심리 연구, 무역", symbols: [{ emoji: "🌊", label: "심야 딥워크" }, { emoji: "🎧", label: "외부 차단" }] },
};

const CHILD_STUDY_MAP: Record<string, any> = {
  "甲": { title: "자기주도 끝판왕 [불도저 리더형]", emoji: "🚀", trait: "간섭하면 엇나가는 자존심 끝판왕입니다. 큰 숲을 보는 기획력이 뛰어나며, 목표와 주도권만 쥐어주면 스스로 뚫고 나가는 무서운 추진력을 가졌습니다.", imgUrl: "https://i.ibb.co/B27J0D8K/image.png" },
  "乙": { title: "환경 흡수 스펀지 [유연한 네트워크형]", emoji: "🌱", trait: "주변 환경과 짝꿍의 영향을 가장 뼈저리게 받는 기질입니다. 강압적인 지시보다는 부드러운 유대감과 좋은 면학 분위기 속에 던져둘 때 성적이 폭발합니다.", imgUrl: "https://i.ibb.co/1Gjttdmc/image.png" },
  "丙": { title: "주목받아야 크는 [열정 폭발 스피커형]", emoji: "🌞", trait: "칭찬과 인정이 곧 뇌의 도파민입니다. 혼자 조용히 푸는 것보다, 화이트보드 앞에서 남에게 일타강사처럼 가르치며 설명하는 학습법이 최고의 효율을 냅니다.", imgUrl: "https://i.ibb.co/LX3HsMmW/image.png" },
  "丁": { title: "집요한 딥다이브 [심야의 연구원형]", emoji: "🕯️", trait: "한번 꽂힌 과목이나 원리는 끝을 보는 무서운 집요함이 있습니다. 야행성 기질이 강해, 남들이 자는 심야의 고요한 시간에 폭발적인 집중력을 발휘합니다.", imgUrl: "https://i.ibb.co/sdcZNDxM/image.png" },
  "戊": { title: "흔들림 없는 [무한 체력 마라토너형]", emoji: "⛰️", trait: "잔머리를 굴리기보다 우직하게 밀어붙이는 엉덩이 힘의 최강자입니다. 변동성보다는 매일 같은 장소, 같은 시간의 '고정 루틴'을 지켜줄 때 가장 강해집니다.", imgUrl: "https://i.ibb.co/CKJTNcdj/image.png" },
  "己": { title: "실수 용납 불가 [디테일 완벽주의자형]", emoji: "📝", trait: "기억력이 비상하고 정보의 구조화 능력이 탁월합니다. 다만 틀리는 것에 대한 공포가 커서, 꼼꼼하게 오답 노트를 분석하는 학습법이 성적을 올립니다.", imgUrl: "https://i.ibb.co/TxYkwdqN/image.png" },
  "庚": { title: "보상이 확실해야 뛰는 [실전파 경주마형]", emoji: "🎯", trait: "눈앞에 확실한 결과나 즉각적인 보상(당근)이 주어져야 눈빛이 바뀝니다. 추상적인 동기부여는 통하지 않으며, 실전 모의고사 훈련 시 텐션이 오릅니다.", imgUrl: "https://i.ibb.co/bjPmLzZx/image.png" },
  "辛": { title: "예리한 핀셋 [초정밀 전략가형]", emoji: "💎", trait: "지능이 높고 굉장히 예민하여 주입식 교육을 혐오합니다. 개념의 빈틈을 핀셋처럼 짚어내는 능력이 탁월해 최상위권 킬러 문항 정복에 가장 유리한 기질입니다.", imgUrl: "https://i.ibb.co/xbSnqyc/image.png" },
  "壬": { title: "스케일이 다른 [빅픽처 설계자형]", emoji: "🌊", trait: "단순 암기를 극도로 싫어하며 이해의 폭이 바다처럼 넓습니다. 무작정 문제를 풀리기보다 과목의 전체적인 맥락과 원리를 먼저 납득시켜야 뇌가 움직입니다.", imgUrl: "https://i.ibb.co/B5Fjh4wh/image.png" },
  "癸": { title: "틀을 깨부수는 [직관적 천재 영감형]", emoji: "💧", trait: "가만히 앉아 듣기만 하는 수업을 들으면 뇌가 정지합니다. 남들이 생각지 못한 엉뚱하고 기발한 패턴으로 정답을 유추해내는 영재성이 다분한 기질입니다.", imgUrl: "https://i.ibb.co/kVq7n1yQ/image.png" }
};


const REVIEWS = [
  { id: 1, author: "대치동 시우맘", type: "선비형 / 초6", content: "애 성향 모르면 학원비 수백 그냥 버리는 듯요. 솔루션대로 백지 복습 시켰더니 이번 단원평가 처음으로 다 맞아왔네요." },
  { id: 2, author: "분당 예은맘", type: "에디슨형 / 중1", content: "산만해서 걱정했는데 식상이 강한 에디슨형이었네요. 화이트보드 사다 주고 설명하게 시켰더니 집중력이 어마어마해졌어요." },
  { id: 3, author: "목동 성민맘", type: "경주마형 / 고1", content: "경주마형은 추상적 목표 안 통한다는 말 정답입니다. 가이드대로 주간 단위 보상 걸어주니까 밤새서 공부합니다." },
  { id: 4, author: "잠실 민준맘", type: "연구원형 / 중2", content: "야행성 기질 정확하네요. 억지로 아침형 인간 만들려다 애 잡을 뻔했습니다. 밤 10시 이후 딥워크 시키니 성적 오릅니다." }
];

const Starfield = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 no-print">
    <div className="absolute top-[12%] left-[15%] w-1 h-1 bg-white rounded-full opacity-80 animate-[twinkle_3s_infinite]"></div>
    <div className="absolute top-[28%] left-[82%] w-1.5 h-1.5 bg-[#E8C87A] rounded-full opacity-90 animate-[twinkle_4s_infinite_1s]"></div>
    <div className="absolute top-[52%] left-[8%] w-1 h-1 bg-white rounded-full opacity-60 animate-[twinkle_2.5s_infinite_0.5s]"></div>
    <div className="absolute top-[75%] left-[88%] w-1 h-1 bg-[#90C8E8] rounded-full opacity-70 animate-[twinkle_5s_infinite_1.5s]"></div>
    <div className="absolute top-[88%] left-[22%] w-1.5 h-1.5 bg-[#F5B8C8] rounded-full opacity-50 animate-[twinkle_3.5s_infinite]"></div>
    <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-[#112138] to-transparent rounded-full blur-3xl opacity-50"></div>
  </div>
);

const safeDecode = (str: string | null) => {
  if (!str) return '';
  try { return decodeURIComponent(str); } catch { return str; }
};

const charToElement = (char: string) => {
  if (["甲", "乙", "寅", "卯"].includes(char)) return "목(나무)";
  if (["丙", "丁", "巳", "午"].includes(char)) return "화(불)";
  if (["戊", "己", "辰", "戌", "丑", "未"].includes(char)) return "토(흙)";
  if (["庚", "辛", "申", "酉"].includes(char)) return "금(쇠)";
  if (["壬", "癸", "亥", "子"].includes(char)) return "수(물)";
  return "수(물)";
};

const calculateAge = (birthDateStr: string) => {
  if (!birthDateStr) return 20; 
  const birthYear = parseInt(birthDateStr.split("-")[0], 10);
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1; 
};

// 🔥 일간별 고유 선천 본성 딕셔너리 🔥
const DM_NATURE_DESCRIPTIONS: Record<string, string> = {
  甲: "대지를 뚫고 수직으로 솟구치는 거대한 소나무의 수직적 생명력을 핵심 뼈대로 세팅받았습니다. 간섭과 억압을 극도로 혐오하며, 본인이 납득할 수 있는 '거대한 명분과 숲 전체의 조감도'가 세워져야만 전두엽 엔진이 점화되는 대기만성형 그릇입니다.",
  乙: "바위를 감싸 안고 끈질기게 영역을 확장하는 생명력 넘치는 넝쿨의 기질입니다. 뛰어난 환경 적응력과 인지 유연성을 지녔으나, 강압적인 수직적 서열 경쟁에 노출되면 선천적 에너지가 안으로 꼬여버리며 극심한 심리적 방어막을 치는 섬세한 원석입니다.",
  丙: "천하를 눈부시게 비추는 태양의 폭발적인 파동을 타고났습니다. 타인의 칭찬과 시각적인 아우라의 확인이 전두엽 도파민의 핵심 원천이며, 어두운 골방에 결박해 두고 혼자 파고들게 만드는 수동적 활자 암기는 이 명식의 천재성을 완벽하게 질식시킵니다.",
  丁: "어둠 속에서 한 가지 목표를 집요하게 비추는 모닥불과 핀셋 조명의 기질입니다. 고도의 탐구력을 지녔으나 내면의 정서적 텐션에 따라 뇌파 기복이 심하므로, '심리적인 안전 기지'가 확보되지 않으면 지식 입력 스위치가 강제로 꺼집니다.",
  戊: "계절의 변화를 묵묵히 품어내는 웅장한 거대 산맥의 기질을 세팅받았습니다. 압도적인 기억력과 포용력을 타고났으나 외부 자극에 대한 인지 전환 속도가 다소 둔감하므로, '본인만의 고정 루틴'이 이식되기 전까지는 발동이 늦게 걸리는 타입입니다.",
  己: "비옥하고 정밀하게 구획된 평야의 디테일한 그릇입니다. 지식을 카테고리별로 정돈하는 능력은 타의 추종을 불허하나, '틀리는 것에 대한 공포(오답 공포증)'가 뇌파를 지배하고 있어 낯선 유형의 변형 문제를 마주하면 연산이 급격히 얼어붙습니다.",
  庚: "제련을 기다리는 강인하고 차가운 야생 무쇠의 돌격력을 품고 태어났습니다. 목표와 보상이 명확하면 뒤도 돌아보지 않는 실행력을 과시하나, 추상적이고 뜬구름 잡는 감성적 동기부여 앞에서는 뇌가 완벽한 파업을 선언하는 실전파입니다.",
  辛: "정교하게 세공된 최고급 보석의 예리한 기질입니다. 핀셋 같은 비판적 사고와 완벽주의를 타고났으나, 주변 환경의 미세한 거슬림이나 강사의 비논리적인 설명에 시냅스가 극도로 예민하게 반응하며 생체 에너지를 낭비하는 스타일입니다.",
  壬: "거침없이 도도하게 흘러가는 넓은 바다의 거시적 파동을 지녔습니다. 얄팍한 단순 암기를 혐오하고 과목 전체를 관통하는 융합적 원리를 추구하므로, \"왜 이 공식을 써야 하는가?\"에 대한 인과관계가 납득되어야 전두엽이 회전합니다.",
  癸: "만물에 스며드는 촉촉한 봄비의 영재성을 타고났습니다. 정형화된 공식의 틀을 깨부수는 기발한 패턴 유추 능력을 지녔으나, 가만히 앉아 수동적으로 듣기만 하는 주입식 환경에 방치되면 뇌파가 쉽게 방전되는 '마이크로 텐션' 소유자입니다."
};

// 🔥 메뉴별 완전히 격리된 3대 맞춤 솔루션 매트릭스 🔥
const SOLUTION_MATRIX: Record<number, Record<string, string>> = {
  1: {
    "목(나무)": "【 STEP 1. 목차 수기 뼈대 각인 】 본문을 읽기 전 반드시 텅 빈 백지에 대단원 목차를 직접 손으로 써서 뇌 속에 지식의 '서랍장'부터 구획하십시오.\n\n【 STEP 2. 타이머 기반 압축 복습 】 15분 단위의 마이크로 인출 타이머를 걸어 텐션을 유지하십시오.",
    "화(불)": "【 STEP 1. 5분 자체 티칭 예열 】 활자를 읽기 전 오늘 배울 주제를 남에게 설명하듯 소리 내어 떠들어 언어 중추를 예열하십시오.\n\n【 STEP 2. 청각적 낭독 복습 】 눈으로만 보는 복습을 소각하고 반드시 입으로 뱉어 귀로 다시 듣는 2중 각인 회로를 가동하십시오.",
    "토(흙)": "【 STEP 1. 10초 공간 앵커링 】 매일 정확히 같은 시간, 같은 의자에 앉아 호흡하는 10초의 의식을 통해 뇌파에 '연산 모드 돌입' 신호를 주입하십시오.\n\n【 STEP 2. 개념 범주화 서랍 노팅 】 파편화된 공식들을 성격별로 묶어 표로 렌더링하는 요약본에 투자하십시오.",
    "금(쇠)": "【 STEP 1. 감정 배제 3분 오답 복기 】 시험을 망쳤을 때의 자책을 소각하고, '어느 지점의 논리 연산이 누락되었나'만 핀셋으로 도려내 박제하십시오.\n\n【 STEP 2. 초정밀 압축 치트시트 작성 】 교재 전체를 A4 용지 단 한 장의 수식으로 압축하는 정밀 세공 복습을 가동하십시오.",
    "수(물)": "【 STEP 1. 심야 진공 알파파 딥워크 】 외부 노이즈가 소거된 밤 10시 이후의 고요한 20분을 이 아이만의 '킬러 개념 각인 시간'으로 사수하십시오.\n\n【 STEP 2. 역발상 마인드맵 복습 】 정답에서 출발해 질문으로 거꾸로 올라가는 역추적 복습 루틴을 이식하십시오."
  },
  2: {
    "목(나무)": "【 STEP 1. 인풋 3 : 아웃풋 7 황금비율 】 활자 읽기를 30% 이하로 줄이고 백지에 뼈대 그리는 인출에 70%를 투자하십시오.\n\n【 STEP 2. 기상 골든타임 킬러 타겟팅 】 전두엽 에너지가 가장 충만한 기상 직후 2시간에 취약 과목을 융단폭격하십시오.",
    "화(불)": "【 STEP 1. 가상 스터디 그룹 아웃풋 】 인형이나 부모를 앞에 앉혀두고 칠판에 풀이 과정을 라이브로 증명하는 맹렬한 아웃풋을 가동하십시오.\n\n【 STEP 2. 텐션 쿨링 야간 정독 】 늦은 밤에는 뇌파 과열을 막기 위해 가벼운 오답 정독만 수행하십시오.",
    "토(흙)": "【 STEP 1. 유형별 템플릿 박제술 】 변형 문제에 얼어붙지 않도록, 대표 유형 5가지의 풀이 템플릿을 통째로 뇌에 문신 각인하십시오.\n\n【 STEP 2. 오답 노트의 규격화 】 틀린 이유를 '연산 실수 / 개념 누락 / 시간 부족' 3가지 팩터로만 엄격히 분류해 박제하십시오.",
    "금(쇠)": "【 STEP 1. 마이크로 실전 모의 훈련 】 평소 숙제를 풀 때도 실제 시험장과 똑같이 잔여 시간 압박 타이머를 켜두고 전두엽을 훈련하십시오.\n\n【 STEP 2. 핀셋 개념 도려내기 】 해설지를 베껴 적는 노가다를 중단하고, 정답을 가르는 단 하나의 핵심 링킷(Linkit)만 박제하십시오.",
    "수(물)": "【 STEP 1. 원리 납득형 딥다이브 인출 】 무작정 양치기로 풀지 마시고, 한 문제를 풀더라도 3가지의 다른 풀이법을 도출해 내는 심층 아웃풋을 가동하십시오.\n\n【 STEP 2. 시험 직전 명상 릴리즈 】 시험지 배부 1분 전, 눈을 감고 알파파 주파수를 강제 스캔하여 실전 블랙아웃을 방어하십시오."
  },
  3: {
    "목(나무)": "【 STEP 1. 원목 데스크 뼈대 구축 】 철제 책상을 소각하고 묵직한 원목 소재의 책상으로 교체해 기운의 안정을 도모하십시오.\n\n【 STEP 2. 스투키 앵커링 디톡스 】 시야 우측에 곧게 뻗은 스투키 화분을 고정 배치하여 흩어지는 뇌파를 수직으로 잡아내십시오.",
    "화(불)": "【 STEP 1. 2700K 웜 글로우 결계 】 차가운 백색 형광등을 지우고, 피로를 식혀주는 2700K 켈빈 파장의 따뜻한 데스크 조명을 이식하십시오.\n\n【 STEP 2. 코랄 펠트 데스크 매트 】 손이 닿는 면에 부드러운 코랄 펠트 매트를 깔아 뇌 신경망의 신경질적인 스파크를 완충하십시오.",
    "토(흙)": "【 STEP 1. 대형 도자기 문진 고정 앵커 】 책상 정중앙 안쪽에 묵직한 백자나 도자기 문진을 배치하여 공간의 무게중심(명당 닻)을 박제하십시오.\n\n【 STEP 2. 케이블 완전 매립 격리 】 시야를 어지럽히는 충전선 가닥들을 매립 박스 안으로 100% 진공 격리하셔야 멘탈이 보존됩니다.",
    "금(쇠)": "【 STEP 1. 스노우 실버 메탈 거치대 】 정밀 세공된 알루미늄이나 메탈 소재의 독서대를 시야 중앙에 고정 배치해 논리 연산 각을 세우십시오.\n\n【 STEP 2. 시각적 공해 완전 유배 】 화려한 엽서나 잡동사니 소품은 뇌파를 찢는 흉기이므로 서랍 깊은 곳으로 완벽히 격리 유배 보내십시오.",
    "수(물)": "【 STEP 1. 액티브 노이즈 캔슬링 요새 】 주변 소음을 100% 소거해 주는 헤드폰을 책상 위 명당에 고정 배치해 '딥워크 진입 스위치'로 삼으십시오.\n\n【 STEP 2. 초음파 가습 쿨링 】 메마른 뇌 신경계를 촉촉하게 적셔줄 미세 초음파 가습기를 가동하여 조후 밸런스를 쾌적하게 마감하십시오."
  },
  4: {
    "목(나무)": "【 STEP 1. 딥 그린 메인 시야 장악 】 시야의 30%를 차지하는 암막 커튼 톤을 딥 그린이나 포레스트 톤으로 이식하여 시신경을 안정시키십시오.\n\n【 STEP 2. 형광 원색 노이즈 박멸 】 전두엽을 자극하는 쨍한 형광펜 가닥들은 서랍 속 불투명 박스 안으로 완벽히 소각 격리하십시오.",
    "화(불)": "【 STEP 1. 인디고 핑크 파스텔 쿨링 】 과열된 뇌파 온도를 식혀줄 인디고 핑크나 피치 계열 배경화면을 태블릿과 PC 메인 화면에 강제 박제하십시오.\n\n【 STEP 2. 쿨톤 조명과의 이별 】 시신경에 코르티솔 독소를 분비하는 차가운 블루라이트 계열 스탠드를 완벽하게 퇴출하십시오.",
    "토(흙)": "【 STEP 1. 오트밀 베이지 베이스 캠프 】 책상 상판 매트 컬러를 따뜻한 오트밀 베이지로 이식하여 뇌파에 '절대적 안전 기지' 신호를 주입하십시오.\n\n【 STEP 2. 포토그래픽 주파수 암기 】 운명의 치유 컬러 펜으로만 핵심 공식을 필기하고, 눈을 감고 그 색채 파장을 통째로 인출해 내는 잔상 훈련을 반복하십시오.",
    "금(쇠)": "【 STEP 1. 스노우 화이트 진공 쉴드 】 책상 주변의 모든 벽면과 데스크 매트를 퓨어 화이트 톤으로 정제하여 방해 전파를 0%로 소거하십시오.\n\n【 STEP 2. 다채로운 색상 펜 퇴출 】 필통 속에 3가지 이상의 색상 펜을 방치하지 마시고, 오직 블랙과 스노우 블루 2톤으로만 시야를 정제하십시오.",
    "수(물)": "【 STEP 1. 미드나잇 블루 심연 결계 】 뇌파를 고요한 알파파 궤도로 끌어내려 줄 미드나잇 블루 톤의 데스크 매트를 책상 명당에 각인하십시오.\n\n【 STEP 2. 자극적 난색 소품 소각 】 뇌를 과열시키는 강렬한 레드나 오렌지 계열의 텀블러, 소품들은 단 1초의 타협 없이 방 밖으로 유배 보내십시오."
  },
  5: {
    "목(나무)": "【 STEP 1. 대체불가 기획/설계 직무 선점 】 남들이 정해놓은 시스템의 부품이 되지 마시고, 0에서 1을 창조하는 IT 아키텍트나 신사업 기획 직군을 타겟팅하십시오.\n\n【 STEP 2. 융합형 T자 인재 스펙 이식 】 타고난 뻗어나가는 기획력(세로축)에 재무/데이터 지식(가로축)을 처절하게 융합해 몸값을 폭등시키십시오.",
    "화(불)": "【 STEP 1. 도파민 폭발 미디어/스피커 직무 】 본인의 열정을 대중 앞에 출력(Output)할 때 쾌감을 느끼는 미디어 디렉터, 일타 강사, 브랜드 크리에이티브 직군을 선점하십시오.\n\n【 STEP 2. 약점인 '뒷심 부족' 보완 루틴 】 화려한 스타트 이후 마무리가 흐지부지되는 단점을 막기 위해, 프로젝트 마감 자동화 툴을 뼛속까지 이식하십시오.",
    "토(흙)": "【 STEP 1. 신뢰의 닻, 금융/부동산/행정 컨설팅 】 타인의 불안한 자산을 묵묵히 품어내고 정돈해 주는 최고급 자산 운용가, 컨설턴트 포지션으로 노동 시장을 제패하십시오.\n\n【 STEP 2. 보수성 탈피 마이크로 챌린지 】 변화에 둔감한 십성 한계를 수술하기 위해, 매 분기 낯선 IT 툴이나 언어를 배우는 강제 챌린지를 가동하십시오.",
    "금(쇠)": "【 STEP 1. 냉혹한 메스, 법조/데이터분석/의료 】 감정을 완벽히 소거하고 팩트와 원리로만 시장의 병목을 도려내는 검사, 외과의, 시니어 데이터 사이언티스트 직군을 겨냥하십시오.\n\n【 STEP 2. 융통성 결핍의 소프트 래퍼 수술 】 지나치게 칼 같은 단점으로 적을 만들지 않도록, '비즈니스 커뮤니케이션 화법 템플릿'을 뇌에 강제 박제하십시오.",
    "수(물)": "【 STEP 1. 심연의 거시 전략가, 무역/해외전략/연구 】 좁은 로컬 시장을 소각하고, 전 세계 물류와 자본의 맥락을 연결하는 글로벌 전략 디렉터 직군으로 비상하십시오.\n\n【 STEP 2. 생각의 늪 탈출 액션 트리거 】 생각이 너무 깊어져 실행이 지연되는 병목을 막기 위해, '70% 확신이 들면 즉시 Go'하는 액션 밸브를 장착하십시오."
  },
  6: {
    "목(나무)": "【 STEP 1. 묵직한 숲의 조감도 제시술 】 사내 정치에 휩쓸려 잔말을 섞지 마시고, 회의 막바지에 집단이 나아갈 '거시적 비전 뼈대' 단 하나만 툭 던져 판을 장악하십시오.\n\n【 STEP 2. 독선적 아집의 소프트 쿨링 】 본인의 옳음에 취해 팀원들을 윽박지르는 단점을 막기 위해, '질문으로 상대를 유도하는 소크라테스 화법'을 이식하십시오.",
    "화(불)": "【 STEP 1. 마음을 녹여내는 소프트 카리스마 】 정통 수직적 카리스마를 연기하지 마시고, 본인의 따뜻한 인간미와 반전 허점을 쿨하게 노출해 대중을 맹목적 우군으로 묶어두십시오.\n\n【 STEP 2. 시기심 완전 양도 프로토콜 】 본인의 화려한 빛 때문에 스폰되는 주변의 질투 독소를 소각하기 위해, 공로를 아랫사람에게 100% 양도하십시오.",
    "토(흙)": "【 STEP 1. 흔들림 없는 베이스캠프 리더십 】 위기가 터져 조직이 요동칠 때 절대 흥분하지 마시고, 묵묵히 자리를 지키며 팀원들의 감정적 쓰레기를 정돈해 주는 제왕적 닻이 되십시오.\n\n【 STEP 2. 답답한 고집의 릴리즈 밸브 】 본인의 방식만 고수하다 꼰대로 전락하지 않도록, '주니어의 제안을 조건 없이 수용하는 월 1회 룰'을 박제하십시오.",
    "금(쇠)": "【 STEP 1. 서늘하고 공정한 원리원칙 장악술 】 친목이나 혈연을 완벽히 소각하고, 오직 성과와 데이터베이스 기반의 투명한 보상 설계로 무리를 완벽하게 장악하십시오.\n\n【 STEP 2. 차가운 언어의 펠트 매트 포용술 】 팩트로 상대의 뼈를 때리는 발언을 찰나에 참아내고, '쿠션 언어 3종 템플릿'을 거쳐서 뱉도록 혀끝을 수술하십시오.",
    "수(물)": "【 STEP 1. 판의 물길을 비틀어 버리는 막후 제왕술 】 전면에 나서서 완장을 차려 안달하지 마시고, 실세들의 니즈를 조용히 파싱하여 집단의 결정 방향을 뒤에서 설계하십시오.\n\n【 STEP 2. 속을 알 수 없는 음침함 디톡스 】 음흉하다는 오해를 사지 않도록, 매주 금요일 오후엔 본인의 사소한 일상 스냅샷을 쿨하게 공유해 장벽을 해제하십시오."
  },
  7: {
    "목(나무)": "【 STEP 1. 가짜 선택권 프레임 하달술 】 \"너 숙제 했어?\"라는 직접 제어 언어를 소각하고, [ '"오늘 수학 A단원 먼저 깰래, 영어 B단원 먼저 깰래?"' ]라는 프레임을 씌워 뇌파 저항을 폭파하십시오.\n\n【 STEP 2. 3초 침묵의 편도체 완충 버퍼 】 아이가 날 선 가시를 뱉을 때 맞받아치지 마시고, 미간을 차분히 응시하며 속으로 3초를 세어 상대의 뇌파를 강제 냉각시키십시오.",
    "화(불)": "【 STEP 1. 인정 주파수 선(先)출력 프로토콜 】 대화의 첫마디를 무조건 아이의 작은 성취를 띄워주는 도파민 언어로 시작해 전두엽의 방어 빗장을 0.1초 만에 해제하십시오.\n\n【 STEP 2. 감정 과열 시 '타임아웃 쿨링 밸브' 】 대화 텐션이 끓어오를 땐 즉시 \"엄마가 물 한 잔 마시고 5분 뒤에 다시 이야기할게\"라며 스레드를 소각하십시오.",
    "토(흙)": "【 STEP 1. 존재의 닻, 절대적 안전 기지 화법 】 \"네가 원래 느려서 그래\" 식의 존재 부정 단어를 영구 유배 보내고, \"엄마는 네가 속도를 맞출 때까지 묵묵히 여기 있을게\"라는 파동을 쏘십시오.\n\n【 STEP 2. 추상적 훈계의 데이터 규격화 】 \"열심히 좀 해\"라는 뜬구름 멘트를 소각하고, '정확히 오늘 저녁 8시까지 2페이지 완료'라는 정밀 규격 언어를 구사하십시오.",
    "금(쇠)": "【 STEP 1. 팩트 폭격 가시의 펠트 래퍼 수술 】 아이의 취약점을 예리하게 찌르는 비판 언어를 입술을 깨물어서라도 삼켜내고, '쿠션 멘트 ➔ 팩트 ➔ 격려' 샌드위치 룰을 이식하십시오.\n\n【 STEP 2. 비논리적 강요의 완전 소각 】 \"엄마가 하라면 해\"라는 주입식 명분을 들이대는 순간 아이의 시냅스는 영구 단절되므로 반드시 인과관계를 설명하십시오.",
    "수(물)": "【 STEP 1. 생각의 동굴을 비추는 '마중물 문답술' 】 입을 다문 아이를 다그치지 마시고, \"지금 머릿속에 어떤 복잡한 지도가 그려지고 있어?\"라는 차분한 어조의 마중물을 던지십시오.\n\n【 STEP 2. 청각적 노이즈 완전 소거 대화 】 TV 소리나 설거지 소음이 가득한 곳에서의 대화를 소각하고, 고요한 알파파 조명 아래서만 독대 프로토콜을 가동하십시오."
  }
};

const PREVIEW_DATA: Record<number, any> = {
  1: (user: any, saju: any) => `명리학적 선천 황경 좌표 스캔 결과, ${user.name}님은 만물을 뚫고 오르는 [${saju.dayMaster}·${(DAY_MASTERS[saju.dayMaster]||{}).name}]의 지적 자아를 세팅받았습니다.\n정해진 룰을 강요받을 때 전두엽이 굳어버리며, 원국 내 '${saju.lacking}' 기운의 결핍으로 인해 인풋 대비 아웃풋 병목을 겪고 있습니다. 이 병목을 단 15분 만에 뚫어낼 선천 맞춤형 '예열 스위치'의 정체는 바로...`,
  2: (user: any) => `현재 ${user.name}님에게 남들과 똑같은 암기식 인강을 강요하는 것은 호랑이를 종이컵에 가두는 자해 행위입니다.\n원국 구조상 지식을 완벽히 내 것으로 박제하기 위해서는 반드시 [입력 30% : 출력 70%]의 외과수술적 인출 회로가 가동되어야 합니다. 당신의 뇌 구조에 최적화된 '골든타임 과목 배치술'은 바로...`,
  3: (user: any) => `사주 명리학의 '물상대체론' 관점에서 방의 풍수 파동이 꼬여있으면 아무리 의지력이 강해도 능률이 바닥으로 추락합니다.\n${user.name}님의 사주 원국에 얼어붙은 기운을 순식간에 녹여내고 고요한 알파파 집중 모드를 가동할 책상 위 명당 소품은 바로...`,
  4: (user: any) => `시신경을 통해 흡수되는 색채의 파장은 사주의 조후(온도와 습도 밸런스)를 결정짓는 생존 주파수입니다.\n책상 앞에서 ${user.name}님이 유독 극심한 피로감과 번아웃을 겪는 이유는 상극 컬러 독소 때문이며, 시야의 30%를 장악해 전두엽을 식혀줄 운명의 치유 컬러 계열은...`,
  5: (user: any) => `냉혹한 경쟁 자본주의 시장에서 ${user.name}님이 남들을 완벽히 압도할 수 있는 선천적 생존 무기는 따로 있습니다.\n평범한 톱니바퀴 부품으로 버려지지 않고 시장 전체의 룰을 뒤흔들며 독보적인 몸값을 쟁취할 수 있는 대체불가 전문 직군은...`,
  6: (user: any) => `군중 속에 고요히 섞여 있어도 ${user.name}님은 본능적으로 타인에게 거부할 수 없는 지배력과 신뢰를 뿜어내는 권력 서열 주파수가 존재합니다.\n독선적인 폭군으로 붕괴되지 않고 사람들의 마음을 완벽하게 무장 해제시켜 평생 내 편으로 묶어둘 제왕적 소프트파워의 핵심은...`,
  7: (user: any, saju: any) => `명리학적으로 일간 '${saju.dayMaster}'을 지닌 ${user.name}님의 뇌는 상대방이 뱉는 '특정 단어 파장'에 따라 전두엽이 열리거나 완벽하게 닫히는 양극단의 수용성을 보입니다.\n상대방의 반항심을 0.1초 만에 무장 해제시키고 스스로 책상에 앉게 만들 부모의 '결정적 첫 마디'의 정체는 바로...`,
};

const generateProfessionalReport = (user: any, saju: any, menuId: number) => {
  const name = user.name || "고객";
  const dm = DAY_MASTERS[saju.dayMaster] || DAY_MASTERS['甲'];
  const lackProp = ELEMENT_PRESCRIPTION[saju.lacking] || ELEMENT_PRESCRIPTION['수(물)'];
  const excessEl = saju.excessive || saju.main;
  const userAge = calculateAge(user.birthDate);

  const battleGround = userAge >= 20 ? "실전 비즈니스와 프로젝트 평가의 전장" : "잔혹한 입시와 수능의 전장";
  const ultimateGoal = userAge >= 20 ? "압도적 커리어 성과 도출" : "극상위권 1등급 도약";

  let lackAction = lackProp?.action || '명상';
  if (saju.lacking === '수(물)' && userAge < 16) {
    lackAction = "잠들기 직전 20분, 은은한 수면등 아래에서의 차분한 하루 백지 복습";
  }

  const timePhrase = user.isTimeUnknown ? "태어난 시간의 제약을 초월한 선천 황경 좌표를" : `태어난 시인 [ ${user.birthTime} ]의 우주적 에너지를`;

  let elementCountsStr = "";
  Object.entries(saju.counts).forEach(([el, cnt]) => { elementCountsStr += `${el.charAt(0)}(${cnt}개) `; });

  const introP1_Menu1 = `${timePhrase} 정밀 파싱한 결과, ${name}님은 ${DM_NATURE_DESCRIPTIONS[saju.dayMaster] || DM_NATURE_DESCRIPTIONS['甲']}\n\n현재 원국을 지배하고 있는 오행의 분포를 스캔해 보면 [ ${elementCountsStr}] 로 구성되어 있습니다. 사주 명리학에서 특정 기운이 이처럼 쏠리거나 비어버리는 불균형은 지식의 입력(Input)과 출력(Output) 과정에서 치명적인 생체 에너지 병목 현상을 일으킵니다. 특히 활자를 눈으로 읽고 이해하는 것과 그것을 시험장이나 현장에서 오차 없이 끄집어내는 속도 사이에 괴리가 발생하는 근본 원인이 바로 이 선천적 인지 밸런스의 왜곡에 있습니다.`;

  let title1 = "", p1 = "", title2 = "", p2 = "", title3 = "", p3 = "", title4 = "🎯 VVIP 핵심 요약 및 처방 상징", p4 = "", title5 = "👑 에필로그: VVIP 멘탈 코어 가이드", p5 = "";

  let symbolsToUse = lackProp?.symbols || [];

  if (menuId === 1) { 
    title1 = "✨ [VVIP 명식 해단식] 선천 인지 필터의 정밀 해부"; p1 = introP1_Menu1;
    title2 = "⚖️ [운기의 밸런스 분석] 지적 흡수력과 정보 처리 병목점"; 
    p2 = `번뜩이는 통찰력과 극강의 몰입도는 원국 내 가장 풍부한 '${excessEl}' 기운에서 발현됩니다. 이 에너지가 알파파와 공명하는 순간, 남들이 수개월에 걸쳐 이해할 복잡한 개념의 뼈대를 단숨에 관통해 냅니다.\n\n그러나 지적 성취를 방해하는 핵심 병목은 '${saju.lacking}' 기운의 결핍으로 인한 '정보 저장소의 누수 현상'입니다. 활자를 눈으로 바를 땐 다 아는 것 같지만 뇌 신경망에 단단히 결박되지 않아 실전 연산에서 렉이 걸립니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 1등급 인지 뼈대 구축술"; 
    p3 = (SOLUTION_MATRIX[1] || {})[saju.lacking] || (SOLUTION_MATRIX[1] || {})["수(물)"];
    p4 = `인지 밸런스의 왜곡을 방치한 채 문제집만 푸는 것은 밑빠진 독에 물을 붓는 것입니다. 사주 원국에 결핍된 주파수의 복습 템플릿을 이식하여 뇌 신경망을 정돈하십시오.`;
    p5 = `세상이 규격화해 놓은 얄팍한 평균의 기준에 본인을 억지로 욱여넣으며 자책하는 감정 낭비를 오늘부로 영구 중단하십시오. 본원인 ${dm.name}의 거친 생명력을 믿고 나만의 인지 뼈대를 세우십시오.`;
  } else if (menuId === 2) { 
    title1 = "✨ [VVIP 명식 해단식] 지식 가공 및 인출(Output) 엔진 해부";
    p1 = `${name}님의 사주 원국에 각인된 '정보 출력 회로'를 최신 인지과학 관점에서 심층 해부합니다. 당신의 지적 자아인 '${dm.name}'은 단순히 남들이 떠먹여 주는 활자를 수동적으로 적재해 두는 창고형 뇌 구조가 결코 아닙니다. 파편화된 외부 지식을 본인만의 예리한 필터로 분해하고 재조합하여 완전히 새로운 솔루션으로 뱉어내는 압도적인 '가공 공장형' 명식입니다.\n\n이러한 명식 그릇을 지닌 분에게 해설지를 토시 하나 틀리지 않고 베껴 적으라고 강요하는 것은, 초고성능 슈퍼컴퓨터에 도스(DOS) 운영체제를 깔아놓고 왜 연산이 느리냐고 윽박지르는 것과 같은 참혹한 자해 행위입니다. 당신의 뇌는 본인이 직접 목차를 설계하고 남에게 뱉어낼 수 있는 수준의 '능동적 출력 장악력'을 확보했을 때 비로소 시냅스가 폭발적으로 확장됩니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 식상(食傷)·관성(官星)의 유체 마비 기전";
    p2 = `직관 스위치가 점화되는 순간 복잡한 공식의 출제 의도를 0.1초 만에 꿰뚫어 보는 연산력은 풍부한 주 기운 덕분입니다.\n\n그러나 결정적인 순간마다 발목을 잡는 주범은 '${saju.lacking}' 기운 결핍으로 인한 '인출 스레드의 일시 정지 현상'입니다. 뇌 속에 지식은 가득 차 있으나 바깥으로 끄집어내는 유체 파동이 꼬여있어, 압박감이 심한 전장만 들어가면 혀와 손끝이 굳어버리는 억울한 슬럼프를 겪게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 아웃풋 3대 외과 수술법";
    p3 = (SOLUTION_MATRIX[2] || {})[saju.lacking] || (SOLUTION_MATRIX[2] || {})["수(물)"];
    p4 = `지식을 머릿속에 가두어두는 수동적 오만함을 찢어 발기십시오. 내 사주에 들어맞는 아웃풋 중심의 잔혹한 인출 훈련만이 실전 함정을 비웃는 유일한 무기가 됩니다.`;
    p5 = `당신의 가공 엔진은 험난한 실전 프로젝트 현장에서 개념을 라이브로 뱉어낼 때 비로소 그 경이로운 진가를 발휘합니다. 골방에서의 묵묵한 인출 훈련이 영광스러운 합격증으로 증명될 것입니다.`;
  } else if (menuId === 3) { 
    title1 = "✨ [VVIP 명식 해단식] 공간 파동 역학과 뇌파 공명 주파수 해독";
    p1 = `사주 명리학의 핵심 원리인 '물상대체론(物象代替論)'과 현대 환경심리학의 '공간 파동 역학' 관점에서 ${name}님의 데스크 환경을 심층 해부합니다. 일간 '${dm.name}'의 생명력을 품고 태어난 당신의 뇌 신경계는 주변에 놓인 사물의 물리적 재질과 주파수에 본능적이고도 폭력적으로 반응하는 뚜렷한 특성을 지니고 있습니다.\n\n당신이 하루의 절반 이상을 머무는 책상과 공부방은 단순히 가구가 놓여있는 죽어있는 물리적 컨테이너가 아닙니다. 사물이 내뿜는 고유의 오행 파동과 당신의 생체 에너지가 끊임없이 충돌하고 교류하는 거대한 '유기체적 뇌파 증폭 장치'입니다. 특정 공간에만 들어가면 유독 가슴이 답답하고 책을 펼치기조차 싫어진다면, 이는 당신의 의지력 부재가 아니라 방 안의 기운이 사주 원국의 취약점을 예리하게 찌르며 알파파 생성을 강제로 방해하고 있기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 진공 알파파 스위치와 상극 노이즈의 충돌";
    p2 = `최상의 컨디션에서 뿜어져 나오는 경이로운 집중력은 사주 원국과 공간의 풍수 에너지가 완벽한 공명(Resonance) 궤도에 진입했을 때 발현됩니다.\n\n그러나 능률을 나락으로 끌어내리는 방해꾼은 사주에 텅 비어있는 '${saju.lacking}' 기운을 더욱 메마르게 억누르는 '상극의 흉물 노이즈'들입니다. 원국과 충돌하는 이질적인 소품이나 정돈되지 않은 전선 가닥들이 데스크 주변을 장악하는 순간, 코르티솔 독소가 분비되며 극심한 산만함에 빠집니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 공간을 지배하는 3대 데스크 결계술";
    p3 = (SOLUTION_MATRIX[3] || {})[saju.lacking] || (SOLUTION_MATRIX[3] || {})["수(물)"];
    p4 = `책상 위의 작은 사물 파동 하나를 집요하게 제어하는 외과 수술적 조치가 뇌 신경망의 진공 몰입 상태를 열어젖히는 절대적인 운명의 닻이 됩니다.`;
    p5 = `집중이 안 될 때 본인의 멘탈을 탓하며 자책하는 감정 낭비를 당장 멈추십시오. 능률 추락은 의지력 부재가 아니라 공간의 상극 파동이 뇌를 찌르고 있기 때문입니다. 처방된 결계를 방 안에 완벽히 이식하십시오.`;
  } else if (menuId === 4) { 
    title1 = "✨ [VVIP 명식 해단식] 시신경 광학 파장과 사주 조후(調候) 조율의 역학";
    p1 = `시신경을 통해 실시간으로 흡수되는 시각적 색채의 주파수가 사주 원국의 '조후(調候: 온도와 습도의 완벽한 생체 밸런스)'에 미치는 파괴적인 영향력을 심층 해부합니다. 일간 '${dm.name}'의 핏줄을 이어받은 ${name}님의 시신경 신경망은 시야에 맺히는 특정 색상의 파장 길이에 따라 뇌파의 알파파 활성도와 생체 열기가 드라마틱하게 요동치는 정밀한 인지 체계를 지니고 있습니다.\n\n공부방과 데스크의 메인 컬러 계열은 단순히 공간을 보기 좋게 꾸미는 인테리어 장식이 결코 아닙니다. 당신의 얼어붙은 지적 포텐셜을 따뜻하게 활활 타오르게 하거나, 과열된 전두엽을 부드럽게 식혀주는 생명 유지 장치이자 운명의 파장입니다. 책상 앞에만 앉으면 눈이 시리고 원인 모를 두통과 피로감이 몰려온다면, 이는 방 안을 채우고 있는 상극(相剋)의 컬러 주파수가 사주 원국의 취약한 조후 뼈대를 날카롭게 난도질하고 있기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 시각 색채 독소와 바이오-써멀(Bio-thermal) 공명점";
    p2 = `사주에 내재된 기운과 공간의 색채 주파수가 완벽한 화음을 이루며 공명할 때 전두엽의 생체 열기가 완벽한 36.5도 평온 상태를 유지합니다.\n\n그러나 피로를 유발하는 주범은 원국의 온도를 지글지글 끓게 하거나 꽁꽁 얼어붙게 만드는 '상극 계열의 자극적인 채도 공해'들입니다. 시야를 어지럽히는 공격적인 원색 소품들이 메인 시야에 방치되어 있으면 시신경이 에너지를 강제로 수탈당하며 극심한 조후 붕괴를 겪습니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 시각 주파수 동기화를 위한 컬러 해킹술";
    p3 = (SOLUTION_MATRIX[4] || {})[saju.lacking] || (SOLUTION_MATRIX[4] || {})["수(물)"];
    p4 = `공간을 채우는 광학 주파수의 정밀한 쿨링 및 워밍업 조율이 사주 원국의 뼈아픈 조후 결핍과 맞물려 떨어지는 순간, 뇌는 완벽한 평정심의 초공간으로 진입합니다.`;
    p5 = `무질서하고 자극적인 시각적 원색 공해로부터 본인의 시신경을 강박적으로 보호하는 통제의 제왕이 되십시오. 빛과 파장으로 완벽하게 쉴드가 쳐진 요새 안에서 경이로운 비상을 이루어내십시오.`;
  } else if (menuId === 5) { 
    title1 = "✨ [VVIP 명식 해단식] 자본주의 먹이사슬의 대체불가 포텐셜 해부";
    p1 = `피도 눈물도 없이 굴러가는 냉혹한 자본주의 정글 생태계에서, ${name}님의 사주 명식 그릇이 어떻게 거대한 부(富)와 막강한 사회적 영향력을 독점적으로 창출해 낼 수 있는지 심층 해부합니다. 선천적으로 부여받은 일간 '${dm.name}'은 당신이 이 세상에 태어날 때 손에 쥐고 나온 가장 날카롭고 잔혹한 생존 무기입니다.\n\n당신은 거대한 기업의 평범한 톱니바퀴 부품으로 소모되다가 조용히 버려질 얄팍한 평균의 그릇이 결코 아닙니다. 조직의 기존 낡은 룰과 시장의 판도를 밑바닥부터 뒤흔들며, 본인만의 독보적인 대체불가 세계관으로 시장 전체를 제패할 수 있는 거대한 야수적 포텐셜을 원국 중심에 품고 있습니다. 남들이 정해놓은 안전하고 지루한 트랙을 벗어나는 순간 비로소 심장의 엔진이 가동되는 완성형 원석입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 노동 시장의 포식자 포지셔닝과 십성 붕괴 리스크";
    p2 = `커리어 전장에서 남들을 완벽하게 씹어먹으며 돋보일 수 있는 핵심 동력은 원국 내 가장 폭발적인 '${excessEl}' 기운의 무기화에 있습니다.\n\n그러나 커리어 상승을 가로막는 가장 무서운 함정은 '${saju.lacking}' 기운이 결핍된 직무를 억지로 연기하며 수행할 때 발생합니다. 원국과 소통되지 않는 상극의 직군에 갇혀 억지로 전두엽을 쥐어짜면, 장점은 퇴색되고 예민함과 독선적 아집만이 부각되어 깊은 번아웃과 잦은 이직이라는 슬럼프에 직면합니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 독점적 몸값 쟁취를 위한 커리어 프로토콜";
    p3 = (SOLUTION_MATRIX[5] || {})[saju.lacking] || (SOLUTION_MATRIX[5] || {})["수(물)"];
    p4 = `상위 0.1%의 거대한 부의 축적은 뻔한 스펙 한 줄 경쟁에서 오지 않습니다. 내 사주의 폭력적인 강점과 뼈아픈 결핍이 격렬하게 융합하여 만들어내는 '대체 불가능한 희소성'에 세상의 모든 돈이 쏟아집니다.`;
    p5 = `회사가 매월 쥐어주는 마취제 같은 월급봉투에 안주하여 야수의 발톱을 숨기는 오만함을 경계하십시오. 진짜 사회적 안정이란 그 누구도 감히 나를 대체할 수 없는 '실력의 잔혹한 예리함'에서 비로소 완성됩니다.`;
  } else if (menuId === 6) { 
    title1 = "✨ [VVIP 명식 해단식] 인간관계의 보이지 않는 권력 역학 관계 해독";
    p1 = `단순한 표면적 친분이나 혈연 관계를 완벽하게 초월하여, 집단 및 조직 내에서 보이지 않게 작동하는 '인간관계의 권력 역학 관계'와 당신이 무의식적으로 뿜어내는 '리더십의 아우라'를 명리학의 메스로 심층 해부합니다. 원국 중심에 똬리를 튼 일간 '${dm.name}'은 수많은 군중 속에 조용히 섞여 있어도 타인의 시선을 강제로 강탈하며 서열의 우위를 점하는 선천적 낙인입니다.\n\n당신은 억지로 목소리를 높이거나 가짜 권위로 카리스마를 연기하지 않아도, 공간의 공기 흐름 자체를 본인 중심의 자기장으로 부드럽게 왜곡시키는 특수한 마성을 타고났습니다. 허세와 속 빈 강정 같은 가짜 리더들이 판치는 혼탁한 세상 속에서, 당신의 신경망 깊은 곳에는 진짜 무리를 지배하고 부릴 줄 아는 완성형 제왕의 핏줄이 흐르고 있습니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 집단 자기장 장악력과 고독한 폭군의 양날의 검";
    p2 = `협상 테이블에서 타인의 논리를 무장 해제시키고 공기를 지배하는 압도적 장악력은 넘쳐흐르는 주 기운의 자기장 덕분입니다.\n\n그러나 이 통치 리더십을 한순간에 붕괴시키고 '고독한 폭군'으로 전락시키는 아킬레스건은 '${saju.lacking}' 기운의 극심한 결핍에 있습니다. 타인의 감정 주파수에 공명하는 소통 파동이 고갈되는 순간, 서늘한 카리스마는 피도 눈물도 없는 '독선과 아집'으로 주변에 왜곡 전달되며 참혹한 배신을 겪습니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 사람의 마음을 묶어둘 제왕적 장악술";
    p3 = (SOLUTION_MATRIX[6] || {})[saju.lacking] || (SOLUTION_MATRIX[6] || {})["수(물)"];
    p4 = `진정으로 무리를 부리는 위대한 통치력은 포장된 강압적 연기에서 나오지 않습니다. 본인의 가장 뼈아픈 결핍마저도 서늘하게 인지하고 타인의 감정을 품어내는 '부드러운 통제력'에서 나옵니다.`;
    p5 = `타인에게 얕보이지 않으려 억지로 가시를 세우는 얄팍한 방어 기제를 오늘부로 소각하십시오. 타인의 감정적 주파수를 여유롭게 품어내는 작은 빈틈이야말로 사람들을 당신 곁에 영구 박제하는 흉포한 중력이 됩니다.`;
  } else if (menuId === 7) { 
    title1 = "✨ [VVIP 명식 해단식] 선천 청각 필터와 언어 주파수 수용 기전";
    p1 = `${timePhrase} 정밀 파싱한 결과, ${name}님의 명식 본원은 [ ${dm.name} ]의 파동으로 세팅되어 있습니다. 이 기질의 상대방에게 언어란 단순한 '소리 정보의 전달'이 결코 아닙니다. 귓가에 꽂히는 음색, 어조의 미세한 높낮이, 그리고 활자 이면에 숨겨진 '나를 통제하려는 얄팍한 의도'를 0.1초 만에 동물적으로 감지해 내는 초정밀 레이더망이 가동되고 있습니다.\n\n특히 원국 내 오행 분포가 [ ${elementCountsStr}] 로 구성된 바, 특정 에너지의 쏠림 현상으로 인해 일방적인 지시나 억압성 훈계를 '나의 존재 자체에 대한 물리적 공격'으로 왜곡해서 받아들이는 청각 필터 병목을 겪고 있습니다. 대화 도중 갑자기 입을 다무는 것은 고집이 아니라 본인의 과열된 뇌파를 지키기 위한 본능적인 생존 방어 기제임을 이해하셔야 대화의 실마리가 풀립니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 잔소리 독소의 축적과 시냅스 단절 현상";
    p2 = `현재 대화에서 뿜어져 나오는 까칠한 방어막이나 차가운 무반응은 원국 내 결핍된 '${saju.lacking}' 기운의 소통 회로가 꽉 막혀있기 때문입니다. 이 에너지가 순환되지 못하면, 아무리 애정을 담아 "다 너 잘되라고 하는 소리야"라고 설득해도 상대방의 전두엽에는 '코르티솔(스트레스 독소) 스파크'만 튈 뿐 내용이 전혀 각인되지 않고 휘발됩니다.\n\n반대로 원국에서 가장 강력한 '${excessEl}' 기운의 자존심을 영악하게 건드려주는 주파수 언어를 구사할 때, 상대방의 뇌는 완벽하게 무장 해제되며 당신을 '나를 통찰해 주는 유일한 아군'으로 인식하게 됩니다. 말의 내용보다 '말을 담는 그릇의 형태'를 전면 개조해야 하는 지점입니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 상대의 뇌를 여는 3대 필승 대화 프로토콜";
    p3 = (SOLUTION_MATRIX[7] || {})[saju.lacking] || (SOLUTION_MATRIX[7] || {})["수(물)"];
    p4 = `대화의 진짜 승리는 상대를 논리로 굴복시켜 무릎 꿇리는 것에 있지 않습니다. 상대의 명식에 뚫려있는 결핍 주파수를 나의 '차분한 어조'로 채워주고, 통제권을 양도하는 척 뇌를 해킹하는 '소프트파워 화법'에 모든 열쇠가 있습니다.`;
    p5 = `본인이 느끼는 초조함을 언어적 가시로 뱉어내는 악순환을 오늘부로 영구 소각하십시오. 상대의 고유한 언어 필터를 넉넉하게 품어주는 단단한 언어적 요새 안에서 상대는 스스로 무장을 해제할 것입니다. 당신의 결정적 첫 마디가 관계의 판도를 바꿉니다.`;
  }

  if (menuId === 7) {
    title4 = "🎯 VVIP 대화법 핵심 요약 및 소통 앵커";
    symbolsToUse = [
      { emoji: "🤐", label: "3초 완충 버퍼" },
      { emoji: "🛡️", label: "자존심 쉴드" },
      { emoji: "🔀", label: "선택권 프레임" }
    ];
  }

  return [
    { id: "s1", title: title1, paragraphs: p1.split("\n\n") },
    { id: "s2", title: title2, paragraphs: p2.split("\n\n") },
    { id: "s3", title: title3, isHighlight: true, paragraphs: p3.split("\n\n") },
    { id: "s4", title: title4, isSummary: true, paragraphs: [p4], symbols: symbolsToUse },
    { id: "s5", title: title5, paragraphs: p5.split("\n\n") }
  ];
};

export default function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [showReviewsExpanded, setShowReviewsExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPrintingLock, setIsPrintingLock] = useState(false); 
  const paymentTimerRef = useRef<any>(null);

  const [userInfo, setUserInfo] = useState(() => {
    try { 
      const backed = JSON.parse(localStorage.getItem('sajuApp_tempForm') || 'null');
      return backed || { name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false, email: '', phone: '' };
    } catch { 
      return { name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false, email: '', phone: '' }; 
    }
  });

  const [userSaju, setUserSaju] = useState<any>({ dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', pillars: [], counts: {}, isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: false });
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  const getKidStorageKey = (name: string, date: string) => {
    const clean = (name || "").replace(/[^a-zA-Z0-9가-힣]/g, '').trim();
    return `sajuApp_unlocked_${clean}_${date}`;
  };

  const [unlockedMenus, setUnlockedMenus] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (showTerms || showPrivacy) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showTerms, showPrivacy]);

  useEffect(() => {
    if (!(window as any).PortOne) {
      const script = document.createElement('script');
      script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => { document.body.style.overflow = 'auto'; };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    const handleFocus = () => setIsProcessing(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    if (userInfo.name || userInfo.birthDate) {
      try { localStorage.setItem('sajuApp_tempForm', JSON.stringify(userInfo)); } catch (e) {}
    }
  }, [userInfo]);

  useEffect(() => {
    setTimeout(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, 50);
  }, [currentView, selectedMenu]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      setIsProcessing(false); setIsNavigating(false);
      if (currentView === 'result') {
        setSelectedMenu(null);
        setCurrentView('menu');
        window.history.pushState(null, "", window.location.href);
      } else if (currentView === 'menu') {
        setCurrentView('intro');
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const handlePaymentSuccess = async (savedUserInfo: any, savedUserSaju: any, savedMenu: any) => {
    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);

    setUserInfo(savedUserInfo); setUserSaju(savedUserSaju); setSelectedMenu(savedMenu);
    const kidKey = getKidStorageKey(savedUserInfo.name, savedUserInfo.birthDate);
    
    setUnlockedMenus(prev => {
      let existing = [];
      try { existing = JSON.parse(localStorage.getItem(kidKey) || '[]'); } catch(e) {}
      const nextUnlocked = Array.from(new Set([...existing, ...prev, savedMenu?.id]));
      try { localStorage.setItem(kidKey, JSON.stringify(nextUnlocked)); } catch(e) {}
      return nextUnlocked;
    });
    
    setCurrentView('result');

    try {
      const dbPromise = addDoc(collection(db, "paid_customers"), {
        customerName: savedUserInfo.name,
        birthDate: savedUserInfo.birthDate,
        purchasedMenu: (savedMenu?.title || "").replace(/\n/g, ' '),
        sajuDayMaster: savedUserSaju.dayMaster,
        paymentAmount: savedUserInfo.name === '테스트' ? 0 : 1000,
        paymentDate: new Date().toISOString()
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Blocked")), 3000));
      Promise.race([dbPromise, timeoutPromise]).catch(() => {});
    } catch(e) {}

    alert("🎉 결제가 완료되었습니다!\n프라이빗 사주 컨설팅 결과를 확인하세요.");
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const portonePaymentId = urlParams.get('paymentId');
    const isSuccess = urlParams.get('success');

    if (isSuccess === 'true' || !!portonePaymentId) {
      const lockKey = `processed_${portonePaymentId}`;
      if (sessionStorage.getItem(lockKey)) return;
      sessionStorage.setItem(lockKey, 'true');

      const myToken = sessionStorage.getItem('saju_pg_token');
      let savedUserInfo = { name: '' };
      try { savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo') || '{}'); } catch(e) {}
      
      if (savedUserInfo.name !== '테스트' && portonePaymentId !== myToken) {
        alert("⚠️ 비정상적인 결제 접근이거나 세션이 만료되었습니다.");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      try {
        const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju') || '{}');
        const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu') || '{}');
        if (savedUserInfo.name && savedMenu?.id) {
          handlePaymentSuccess(savedUserInfo, savedUserSaju, savedMenu);
        }
      } catch(e) {}
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchSajuFromAPI = async (dateStr: string, timeStr: string, isUnknown: boolean, calType: string) => {
    return new Promise(async (resolve) => {
      if (!(window as any).Lunar) {
        await new Promise((res) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
          script.onload = () => res(true); script.onerror = () => res(false);
          document.head.appendChild(script);
        });
      }

      setTimeout(() => {
        try {
          if (!(window as any).Lunar) throw new Error("No Lunar API");

          const [year, rawMonth, rawDay] = dateStr.split('-').map(Number);
          const [hour, minute] = !isUnknown && timeStr ? timeStr.split(':').map(Number) : [12, 0];

          let month = rawMonth; let day = rawDay;
          if (calType === 'solar') {
            const maxSolar = new Date(year, month, 0).getDate();
            if (day > maxSolar) day = maxSolar;
          } else {
            if (day > 30) day = 30;
          }

          const isNightRollover = !isUnknown && (hour >= 23 || (hour === 0 && minute <= 30));
          const parseMonth = calType === 'leap' ? -Math.abs(month) : month;

          let lunarObj;
          try {
            lunarObj = (calType === 'lunar' || calType === 'leap') 
              ? (window as any).Lunar.fromYmdHms(year, parseMonth, day, hour, minute, 0)
              : (window as any).Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
          } catch {
            lunarObj = (window as any).Lunar.fromYmdHms(year, Math.abs(month), day, hour, minute, 0);
          }

          const bazi = lunarObj.getEightChar();
          const yG = bazi.getYearGan(); const yZ = bazi.getYearZhi();
          const mG = bazi.getMonthGan(); const mZ = bazi.getMonthZhi();
          const dG = bazi.getDayGan(); const dZ = bazi.getDayZhi();
          const tG = bazi.getTimeGan(); const tZ = bazi.getTimeZhi();

          const pillars = [
            { tH: yG, tK: GAN_KOR[yG] || '', bH: yZ, bK: ZHI_KOR[yZ] || '' },
            { tH: mG, tK: GAN_KOR[mG] || '', bH: mZ, bK: ZHI_KOR[mZ] || '' },
            { tH: dG, tK: GAN_KOR[dG] || '', bH: dZ, bK: ZHI_KOR[dZ] || '' },
            { tH: isUnknown ? '?' : tG, tK: isUnknown ? '' : (GAN_KOR[tG] || ''), bH: isUnknown ? '?' : tZ, bK: isUnknown ? '' : (ZHI_KOR[tZ] || '') }
          ];

          const els: Record<string, number> = {'목(나무)':0, '화(불)':0, '토(흙)':0, '금(쇠)':0, '수(물)':0};
          const chars = isUnknown ? [yG, yZ, mG, mZ, dG, dZ] : [yG, yZ, mG, mZ, dG, dZ, tG, tZ];
          chars.forEach(c => { const el = charToElement(c); if(el) els[el]++; });

          const dm = dG; const main = charToElement(dm) || '목(나무)';
          
          let excess = '목(나무)'; let minCnt = 99; let maxCnt = -1;
          for (const [el, count] of Object.entries(els)) {
            if (count > maxCnt) { maxCnt = count; excess = el; }
            if (count < minCnt) { minCnt = count; }
          }

          const yongshinWeight: Record<string, Record<string, number>> = {
            '목(나무)': { '금(쇠)': 5, '화(불)': 4, '토(흙)': 2, '수(물)': -5, '목(나무)': -5 },
            '화(불)': { '수(물)': 5, '토(흙)': 4, '금(쇠)': 2, '목(나무)': -5, '화(불)': -5 },
            '토(흙)': { '목(나무)': 5, '금(쇠)': 4, '수(물)': 2, '화(불)': -5, '토(흙)': -5 },
            '금(쇠)': { '화(불)': 5, '수(물)': 4, '목(나무)': 2, '토(흙)': -5, '금(쇠)': -5 },
            '수(물)': { '토(흙)': 5, '목(나무)': 4, '화(불)': 2, '금(쇠)': -5, '수(물)': -5 },
          };

          const weights = yongshinWeight[excess] || yongshinWeight['목(나무)'];
          const candidateElements = Object.keys(els).filter(el => el !== excess);
          
          candidateElements.sort((a, b) => {
            const scoreA = (weights[a] || 0) - (els[a] * 2);
            const scoreB = (weights[b] || 0) - (els[b] * 2);
            return scoreB - scoreA; 
          });
          const lacking = candidateElements[0] || '수(물)';

          const isExtremelyBiased = maxCnt >= 4;
          const isRelativelyBalanced = (maxCnt - minCnt <= 1);

          resolve({ dayMaster: dm, main: main, lacking: lacking, excessive: excess, pillars: pillars, counts: els, isNightRollover, isExtremelyBiased, isRelativelyBalanced });
        } catch (error) {
          resolve({ 
            dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', 
            pillars: [{ tH: '?', tK: '연', bH: '?', bK: '연' }, { tH: '?', tK: '월', bH: '?', bK: '월' }, { tH: '?', tK: '일', bH: '?', bK: '일' }, { tH: '?', tK: '시', bH: '?', bK: '시' }], 
            counts: {'목(나무)':3, '수(물)':0}, isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: false 
          });
        }
      }, 300);
    });
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = userInfo.name.trim().slice(0, 10);
    if (!safeName) return alert("정확한 이름을 입력해주세요.");
    if (!userInfo.birthDate) return alert("생년월일을 입력해주세요.");
    
    const bYear = parseInt(userInfo.birthDate.split('-')[0], 10);
    if (bYear < 1901 || bYear > 2049) return alert("1901년 ~ 2049년 사이의 생년월일만 정밀 연산이 가능합니다.");

    if (!userInfo.isTimeUnknown && !userInfo.birthTime) return alert("태어난 시간을 입력하거나 '모름'에 체크해주세요.");
    
    const safeTime = userInfo.isTimeUnknown ? "12:00" : userInfo.birthTime;
    
    setIsProcessing(true); setImgFailed(false); 
    setCurrentView('calculating');
    const sajuResult: any = await fetchSajuFromAPI(userInfo.birthDate, safeTime, userInfo.isTimeUnknown, userInfo.calendarType);
    setUserSaju(sajuResult);

    const kidKey = getKidStorageKey(safeName, userInfo.birthDate);
    let kidUnlocked = [];
    try { kidUnlocked = JSON.parse(localStorage.getItem(kidKey) || '[]'); } catch(e) {}
    setUnlockedMenus(kidUnlocked);

    setIsProcessing(false);
    setCurrentView('menu');
  };

  const handleMenuSelect = (menu: any) => {
    if (isNavigating) return; 
    setIsNavigating(true);
    setSelectedMenu(menu);
    setIsProcessing(true);
    setCurrentView('result');
    setTimeout(() => { setIsProcessing(false); setIsNavigating(false); }, 700);
  };

  const handleBackFromResult = () => {
    setIsProcessing(false); setIsNavigating(false);
    setSelectedMenu(null);
    setCurrentView('menu');
  };

  const handlePayment = async (method = '카드') => {
    const cleanEmail = userInfo.email.trim().toLowerCase();
    const cleanPhone = userInfo.phone.replace(/[^0-9]/g, '');

    if (!cleanEmail || !cleanPhone) return alert("안전한 결제 내역 발송을 위해\n이메일과 휴대폰 번호를 올바르게 입력해주세요.");
    if (/[^\x00-\x7F]/.test(cleanEmail)) return alert("이메일 주소에 한글이나 특수문자가 포함될 수 없습니다. 다시 확인해주세요.");

    if (isProcessing) return; 
    setIsProcessing(true);

    if (userInfo.name === '테스트') {
      alert("🛠️ 개발자 테스트 모드: 결제를 건너뛰고 VVIP 리포트를 오픈합니다.");
      await handlePaymentSuccess(userInfo, userSaju, selectedMenu);
      setIsProcessing(false);
      return;
    }

    const paymentId = `payment_${new Date().getTime()}`;
    sessionStorage.setItem('saju_pg_token', paymentId);

    try { localStorage.setItem('sajuApp_userInfo', JSON.stringify({...userInfo, email: cleanEmail, phone: cleanPhone})); } catch(e) {}
    try { localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju)); } catch(e) {}
    try { localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu)); } catch(e) {}

    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    paymentTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 10000);

    try {
      if (!(window as any).PortOne) return alert("결제 모듈이 차단되었습니다. 폰에 설치된 '광고 차단 앱(AdGuard 등)'이나 '데이터 절약 모드'를 잠시 끄고 새로고침 해주세요!");
      
      const response = await (window as any).PortOne.requestPayment({
        storeId: "store-ec48c4ea-79d3-4eaa-a2e8-3511a8dafb66",
        channelKey: "channel-key-5cf13f4a-9e21-4d0b-acd7-3092fc702f11",
        paymentId: paymentId,
        orderName: `VVIP 사주 컨설팅 - ${selectedMenu?.title.replace('\n', ' ')}`,
        totalAmount: 1000,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: window.location.origin + window.location.pathname + '?paymentId=' + paymentId + '&success=true',
        customer: { fullName: userInfo.name, email: cleanEmail, phoneNumber: cleanPhone },
      });

      if (response && !response.code) {
        await handlePaymentSuccess(userInfo, userSaju, selectedMenu);
      } else if (response && response.code !== 'FAILURE_TYPE_PG' && !response.code.includes('USER_CANCEL') && !response.code.includes('user_cancel')) {
        alert(`결제 중지: ${response.message || '승인이 취소되었습니다.'}`);
        if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
        setIsProcessing(false);
      } else {
        if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
        setIsProcessing(false);
      }
    } catch (error) {
      alert("결제 처리 중 오류가 발생했습니다.");
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
      setIsProcessing(false);
    }
  };

  const downloadVVIPReport = () => {
    const isKakao = /KAKAOTALK/i.test(navigator.userAgent);
    if (isKakao) {
      alert("📢 카카오톡 내부 브라우저에서는 PDF 저장 기능이 기술적으로 차단되어 있습니다.\n\n화면 우측 하단의 [ ⋮ ] 버튼을 눌러 '다른 브라우저로 열기(사파리/크롬)'를 하신 뒤 저장해주세요!\n(결제하신 내역은 그대로 안전하게 유지됩니다)");
      return;
    }
    if (isPrintingLock) return;
    setIsPrintingLock(true);
    setTimeout(() => { window.print(); setIsProcessing(false); }, 150);
    setTimeout(() => { setIsPrintingLock(false); }, 5000); 
  };

  const handleCopyLink = async () => {
    const studyType = CHILD_STUDY_MAP[userSaju.dayMaster] || CHILD_STUDY_MAP["甲"];
    const textToCopy = `[대치동 시크릿 기질 컨설팅]\n우리아이 사주 공부유형 진단 완료! 🌙\n\n👤 이름: ${userInfo.name}\n✨ 기질 유형: ${studyType.title}\n\n우리 아이의 타고난 천재성과 공부법을 무료로 확인해보세요!\n👉 https://${window.location.host}?utm_source=viral_share`;

    const executeFallbackCopy = () => {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy); dummy.value = textToCopy; dummy.select();
      document.execCommand("copy"); document.body.removeChild(dummy);
      alert('✨ 우리 아이 기질 분석 결과가 클립보드에 복사되었습니다!\n단톡방이나 SNS에 붙여넣기 해보세요.');
    };

    if (navigator.share) {
      try {
        await navigator.share({ title: '우리 아이 기질 분석', text: textToCopy });
      } catch (err) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => alert('✨ 결과가 클립보드에 복사되었습니다!')).catch(() => executeFallbackCopy());
        } else { executeFallbackCopy(); }
      }
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => alert('✨ 결과가 클립보드에 복사되었습니다!')).catch(() => executeFallbackCopy());
      } else { executeFallbackCopy(); }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pName = params.get('n'); const pDate = params.get('d');
    if (pName && pDate) {
      setUserInfo(prev => ({
        ...prev, name: safeDecode(pName), birthDate: pDate,
        birthTime: safeDecode(params.get('t')), calendarType: params.get('c') || 'solar',
        isTimeUnknown: params.get('u') === 'true'
      }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const currentStudyType = CHILD_STUDY_MAP[userSaju.dayMaster] || CHILD_STUDY_MAP["甲"];

  return (
    <div className="min-h-screen text-[rgba(255,255,255,0.88)] font-sans relative bg-[#021027] print:bg-white print:text-black print:block print:min-h-0 print:h-auto">
      <Starfield />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', serif; }
        .font-sans { font-family: 'Noto Sans KR', sans-serif; }
        button, input, select, [onClick], .cursor-pointer { touch-action: manipulation !important; }
        @keyframes twinkle { 0%, 100% { transform: scale(1); } 50% { opacity: 0.9 !important; transform: scale(1.3); } }
        @keyframes ndrift { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-15px) scale(1.05); } 66% { transform: translate(-10px,20px) scale(0.95); } }
        @keyframes ndrift-reverse { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-10px,20px) scale(0.95); } 66% { transform: translate(20px,-15px) scale(1.05); } }
        @keyframes mfloat { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-8px) rotate(4deg); } }
        @keyframes gpulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; } 50% { transform: translate(-50%,-50%) scale(1.5); opacity: 1; } }
        @keyframes sbtn { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes obounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-10px); opacity: 1; } }
        @keyframes ficon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .glass-card { background: rgba(255,255,255,0.055); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
        .glass-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent); }
        .text-gradient-gold { background: linear-gradient(135deg, #fff 0%, #E8C87A 50%, #F5B8C8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-gradient-lavender { background: linear-gradient(90deg, #fff, #B8A8E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        @media print {
          @page { margin: 15mm; size: A4; }
          * { letter-spacing: -0.02em !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          html, body, #root, .min-h-screen { display: block !important; position: static !important; height: auto !important; min-height: 0 !important; overflow: visible !important; background-color: #FDFBF7 !important; color: #111625 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; background-color: #FDFBF7 !important; color: #111625 !important; }
          .print-cover { page-break-after: always; min-height: 260mm; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #E8C87A; padding: 40px; margin: 20px; box-sizing: border-box; }
          h5 { page-break-after: avoid !important; break-after: avoid !important; }
          .print-section { page-break-inside: avoid; margin-bottom: 30px; box-decoration-break: clone; }
        }
      `}} />

      {/* ================================================================= */}
      {/* 📱 모바일/PC 웹사이트 화면 (no-print) */}
      {/* ================================================================= */}
      <div className="no-print relative z-10">
        {currentView === 'intro' && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 max-w-md mx-auto">
            
            <div className="w-full bg-[#E8C87A]/20 border border-[#E8C87A]/50 text-[#E8C87A] text-[11.5px] p-3.5 rounded-xl mb-6 text-center leading-relaxed backdrop-blur-sm shadow-lg break-keep">
              ⚠️ <strong className="text-white">카카오톡, 인스타그램</strong> 등 내부 창에서는 결제 오류가 발생할 수 있습니다.<br/>
              화면 우측 하단(또는 상단)의 <strong className="text-white">[ ⋮ ] 점 세 개</strong> 버튼을 눌러 반드시<br/>
              <strong className="text-white underline">'다른 브라우저로 열기'</strong>(Safari, Chrome 등)를 선택해 주세요.
            </div>

            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <span className="text-6xl drop-shadow-[0_0_18px_rgba(212,168,67,0.6)] animate-[mfloat_4s_ease-in-out_infinite] block">🌙</span>
                <div className="absolute w-[100px] h-[100px] top-1/2 left-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,168,67,0.25)_0%,transparent_70%)] animate-[gpulse_3s_ease-in-out_infinite]" style={{ transform: 'translate(-50%, -50%)'}}></div>
              </div>
              
              <div className="inline-flex items-center gap-1.5 bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.4)] text-[#E8C87A] text-[10.5px] tracking-[2.5px] px-4 py-1.5 rounded-full mb-3.5 font-serif before:content-['✦'] before:text-[8px] after:content-['✦'] after:text-[8px]">
                VIP PRIVATE CONSULTING
              </div>

              <h1 className="font-serif text-[27px] font-black leading-[1.35] mb-2 text-gradient-gold">
                대치동 엄마들의 시크릿<br/>프라이빗 사주 컨설팅
              </h1>
              <p className="text-[rgba(255,255,255,0.42)] text-[12.5px] leading-[1.85]">
                상위 0.1%가 몰래 참고한다는 타고난 그릇 분석과<br/>완벽하게 채워주는 VVIP 맞춤 학습 처방전 🗝️
              </p>
            </div>

            <div className={`w-full glass-card rounded-[24px] p-6 relative overflow-hidden ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}>
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold mb-2 flex items-center gap-1">👤 이름</label>
                  <input type="text" placeholder="이름을 입력해주세요" required maxLength={10}
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-4 py-3.5 outline-none"
                    value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">🗓 생년월일</label>
                    <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-0.5 gap-0.5">
                      {['solar', 'lunar', 'leap'].map(type => (
                        <button key={type} type="button" onClick={() => setUserInfo({...userInfo, calendarType: type})}
                          className={`text-[9.5px] font-bold px-2 py-1 rounded transition-colors ${userInfo.calendarType === type ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-gray-400'}`}>
                          {type === 'solar' ? '양력' : type === 'lunar' ? '음력' : '윤달'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="date" required
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-3 py-3.5 outline-none [color-scheme:dark]"
                    value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">⏰ 태어난 시</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#E8C87A]"
                        checked={userInfo.isTimeUnknown} onChange={(e) => setUserInfo({...userInfo, isTimeUnknown: e.target.checked, birthTime: e.target.checked ? '' : userInfo.birthTime})} />
                      <span className={`text-[10.5px] font-bold ${userInfo.isTimeUnknown ? 'text-[#E8C87A]' : 'text-gray-400'}`}>모름</span>
                    </label>
                  </div>
                  <input type="time" disabled={userInfo.isTimeUnknown}
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-3 py-3.5 outline-none [color-scheme:dark] disabled:opacity-30"
                    value={userInfo.birthTime} onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={isProcessing} className="w-full mt-4 p-[15px] rounded-2xl text-[#1A1530] font-serif font-bold text-[16px] tracking-[0.5px] bg-[linear-gradient(135deg,#C89830,#E8C050,#D4A843)] shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                  ✨ 비밀 학습 컨설팅 확인하러가기
                </button>
              </form>
            </div>
          </div>
        )}

        {currentView === 'calculating' && (
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <div className="w-8 h-8 border-4 border-[#E8C87A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="font-serif text-lg font-bold text-[#E8C87A]">운명의 궤적을 분석 중입니다...</h2>
          </div>
        )}

        {currentView === 'menu' && (
          <div className="min-h-screen pt-8 px-5 pb-16 max-w-md mx-auto">
            <h2 className="font-serif text-lg font-bold text-[#E8C87A] mb-4 text-center">
              🌟 <span className="max-w-[130px] truncate align-middle inline-block">{userInfo.name}</span> 님의 사주 진단 결과
            </h2>
            
            {userSaju.isNightRollover && (
              <div className="bg-[#D4A843]/10 border border-[#D4A843]/40 text-[#D4A843] text-[10.5px] py-1 px-3 rounded-full mb-3 text-center font-bold">
                🌙 명리학 [야자시/조자시] 보정 좌표 적용 완료
              </div>
            )}

            <div className="glass-card rounded-2xl p-4 mb-4 overflow-x-auto">
              <div className="flex justify-around text-center min-w-[280px]">
                {userSaju.pillars.map((pillar: any, idx: number) => (
                  <div key={idx} className="flex flex-col justify-center px-2">
                    <div className="text-xl font-serif font-bold text-white leading-none">{pillar.tH}</div>
                    <div className="text-[10px] text-[#E8C87A] mb-1 font-sans">{pillar.tK}</div>
                    <div className="text-xl font-serif font-bold text-white leading-none">{pillar.bH}</div>
                    <div className="text-[10px] text-[#E8C87A] font-sans">{pillar.bK}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1530] rounded-[24px] p-6 relative mb-4 overflow-hidden text-center text-white shadow-xl border border-[#D4A843]/30">
              <span className="text-4xl block mb-2">{currentStudyType.emoji}</span>
              <div className="text-xs text-[#E8C87A] font-bold tracking-wider mb-1">십성(사주 성분) 기반 기질 매칭</div>
              <div className="text-xl font-bold text-gradient-gold mb-3 break-keep">{currentStudyType.title}</div>
              <p className="text-[13px] text-gray-300 bg-white/5 p-3.5 rounded-xl leading-relaxed break-keep mb-6 border border-white/5">{currentStudyType.trait}</p>
              
              <div className="relative inline-block w-full max-w-[280px] mx-auto my-2">
                <div className="absolute inset-0 bg-[#D4A843] rounded-2xl blur-2xl opacity-35 animate-pulse"></div>
                {!imgFailed ? (
                  <img 
                    src={currentStudyType.imgUrl} 
                    alt={currentStudyType.title} 
                    onError={() => setImgFailed(true)} 
                    style={{ width: '100%', maxWidth: '280px', height: 'auto', maxHeight: '450px', objectFit: 'contain' }} 
                    className="relative z-10 rounded-2xl border-2 border-[#D4A843]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-[1.03]" 
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#D4A843]/50 rounded-2xl w-full bg-[#0D0B1A] shadow-2xl">
                    <div className="w-14 h-14 rounded-full border border-[#D4A843] flex items-center justify-center text-[#D4A843] text-2xl mb-2 font-serif">✦</div>
                    <span className="text-sm text-[#D4A843] font-bold tracking-widest">[ {currentStudyType.title.split('[')[1] || "프라이빗 기질 엠블럼"}</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#E8C87A]/50 font-serif tracking-widest mt-4 block">✦ DESTINY ARCHETYPE CARD ✦</span>
            </div>

            <div className="bg-white border border-[#EAE1D8] rounded-2xl p-3.5 text-center mb-8 shadow-md">
              <button onClick={handleCopyLink} className="w-full bg-[#1b2d4a] text-[#E8C87A] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <Share2 size={16} style={{ flexShrink: 0 }} /> 우리 아이 기질 결과 단톡방에 자랑하기
              </button>
            </div>

            <div className="mt-8 mb-4 flex items-center justify-between">
              <h3 className="font-serif text-[16px] font-black text-white flex items-center gap-1.5"><Lock size={16} className="text-[#E8C87A]"/> VVIP 심층 분석 리포트</h3>
              <span className="text-[10px] text-gray-400">결제 후 오픈</span>
            </div>

            <div className="space-y-4">
              {MENU_LIST.map((menu) => {
                const Icon = menu.icon;
                const isUnlocked = unlockedMenus.includes(menu.id);
                const previewText = PREVIEW_DATA[menu.id] ? PREVIEW_DATA[menu.id](userInfo, userSaju) : "";

                return (
                  <div 
                    key={menu.id} 
                    onClick={() => handleMenuSelect(menu)} 
                    className="bg-[#111625] border border-[#D4A843]/30 rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 hover:border-[#D4A843] shadow-lg relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${menu.bar}`}></div>
                    
                    <div className="flex items-center justify-between mb-2 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#D4A843]/10 border border-[#D4A843]/20 flex-shrink-0">
                          <Icon size={18} className="text-[#D4A843]" />
                        </div>
                        <h4 className="font-serif text-sm font-bold text-white whitespace-pre-line leading-tight">{menu.title.replace('\n', ' ')}</h4>
                      </div>
                      
                      {isUnlocked ? (
                        <span className="text-[10px] font-black text-[#021027] bg-[#D4A843] px-2.5 py-1 rounded-full shadow-sm flex-shrink-0">🔓 열람 가능</span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#E8607A] bg-[#E8607A]/10 border border-[#E8607A]/30 px-2.5 py-0.5 rounded-full flex-shrink-0">🔒 결제 후 오픈</span>
                      )}
                    </div>

                    <div className="pl-2 pr-1 mb-3.5">
                      <p className="text-[12.5px] text-gray-300 leading-relaxed line-clamp-2 font-normal">
                        {previewText}
                      </p>
                    </div>

                    <div className="w-full bg-[#021027] group-hover:bg-[#D4A843] group-hover:text-[#021027] text-[#D4A843] border border-[#D4A843]/30 rounded-xl py-2.5 px-4 text-center text-xs font-bold transition-colors flex items-center justify-center gap-1">
                      {isUnlocked ? "✨ 심층 분석 리포트 본문 전체 읽기 ➔" : "🔒 1,000원 특가로 본문 전체 열람하기 ➔"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. RESULT VIEW */}
        {currentView === 'result' && selectedMenu && (
          <div className="relative z-20 min-h-screen min-h-[750px] bg-[#FDFBF7] text-[#1A1530] pb-12 animate-[sup_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            
            <div className={`absolute inset-0 z-50 bg-[#021027]/85 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 ${isProcessing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="w-12 h-12 border-4 border-[#D4A843] border-t-transparent rounded-full animate-spin mb-3"></div>
              <span className="text-xs font-serif tracking-widest text-[#E8C87A] animate-pulse">✦ VVIP 운명 궤적 정밀 동기화 중 ✦</span>
            </div>

            <div className="px-4 py-4 flex items-center sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur border-b border-[#EAE1D8] print:hidden">
              <button onClick={handleBackFromResult} className="p-1.5 border rounded-full mr-3 bg-white shadow-sm"><ChevronLeft size={18}/></button>
              <h2 className="font-black text-[15px] flex-1 text-center pr-6 text-[#021027]">
                {selectedMenu.title.replace('\n',' ')}
              </h2>
            </div>

            <div className="max-w-md mx-auto w-full p-5">
              
              {!unlockedMenus.includes(selectedMenu.id) && (
                <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FFF5EB] border-2 border-[#E8C87A] rounded-2xl p-5 shadow-sm mb-6 relative overflow-hidden print:hidden">
                  <div className="absolute top-0 right-0 bg-[#D4A843] text-[#021027] text-[9.5px] font-black px-3 py-1 rounded-bl-lg tracking-wider">
                    REPORT TEASER
                  </div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-xl">💡</span>
                    <h3 className="text-xs font-black text-[#D4A843] tracking-tight">리포트 핵심 요약 미리보기</h3>
                  </div>
                  <p className="text-[13.5px] text-[#2A1530] leading-[1.8] font-bold break-keep text-justify whitespace-pre-line bg-white/60 p-3.5 rounded-xl border border-[#E8C87A]/30">
                    {PREVIEW_DATA[selectedMenu.id] ? PREVIEW_DATA[selectedMenu.id](userInfo, userSaju) : "분석 요약을 불러옵니다."}
                  </p>
                </div>
              )}

              {unlockedMenus.includes(selectedMenu.id) && (
                <div className="mb-6 bg-[#1b2d4a] text-white p-4 rounded-2xl shadow-lg border border-[#243b5e] break-keep print:hidden">
                  <p className="text-xs font-bold text-[#FEE500] mb-2 flex items-center gap-1"><Download size={14}/> 안드로이드 / 아이폰 PDF 영구 저장법</p>
                  <ol className="text-[11px] space-y-1 text-gray-200 pl-3 list-decimal">
                    <li>아래 <strong>[PDF 저장]</strong> 버튼을 클릭합니다.</li>
                    <li>상단 프린터 선택창에서 <strong className="text-[#E8C87A]">"PDF 파일로 저장"</strong>을 고르세요.</li>
                    <li>화면 우측의 <strong className="text-[#FEE500]">노란색 PDF 아이콘</strong>을 누르면 다운로드됩니다.</li>
                  </ol>
                  <button onClick={downloadVVIPReport} disabled={isPrintingLock} className="w-full mt-3 bg-gradient-to-r from-[#D4A843] to-[#E8C050] text-[#1A1530] font-black py-3 rounded-xl shadow active:scale-95 transition-transform disabled:opacity-50">
                    📥 {isPrintingLock ? "PDF 문서 변환 중..." : "10,000자급 VVIP 리포트 PDF 저장"}
                  </button>
                </div>
              )}

              {!unlockedMenus.includes(selectedMenu.id) ? (
                <div className="space-y-5 print:hidden">
                  <div className="bg-gradient-to-r from-[#111625] to-[#1A1530] border border-[#D4A843]/40 rounded-2xl p-6 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#D4A843]/10 rounded-full blur-xl"></div>
                    <span className="text-4xl block mb-2 animate-bounce">🔒</span>
                    <h4 className="font-serif text-[#E8C87A] text-lg font-bold mb-1">본문 정밀 분석 잠김</h4>
                    <p className="text-xs text-gray-300 break-keep leading-relaxed px-2">
                      위 요약본의 더 자세한 상위 0.1% 솔루션을 확인하시려면<br/>아래 결제하기를 통해 리포트를 영구 오픈해 주세요.
                    </p>
                  </div>

                  <div className="bg-[#111625] text-white rounded-2xl p-4 border border-gray-800 transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="text-xs font-bold text-[#E8C87A]">💬 맘카페 내돈내산 리얼 후기</div>
                      <button onClick={() => setShowReviewsExpanded(!showReviewsExpanded)} type="button" className="text-[11px] text-gray-400 underline">
                        {showReviewsExpanded ? "접기 ▴" : "전체 후기 보기 ▾"}
                      </button>
                    </div>
                    <div className={`space-y-2 overflow-hidden transition-all ${showReviewsExpanded ? 'max-h-[800px]' : 'max-h-[190px]'}`}>
                      {REVIEWS.map(r => (
                        <div key={r.id} className="bg-white/5 p-2.5 rounded-xl border border-white/5 break-keep">
                          <div className="text-[10px] text-gray-400 font-bold mb-0.5">{r.author} ({r.type})</div>
                          <div>{r.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border rounded-2xl p-4 text-center shadow-sm relative">
                    <div className="text-xs text-gray-400 line-through mb-0.5">정가 10,000원</div>
                    <div className="text-2xl font-serif font-black text-[#E8607A] mb-3">1,000원 <span className="text-xs bg-[#E8607A] text-white px-2 py-0.5 rounded-full font-sans">90% 특가</span></div>
                    <input type="email" required placeholder="결제 내역 받을 이메일" value={userInfo.email} onChange={e=>setUserInfo({...userInfo, email: e.target.value})} className="w-full border rounded-xl p-3 text-[16px] md:text-xs mb-2 outline-none" />
                    <input type="tel" required placeholder="휴대폰 번호 (자유롭게 입력)" value={userInfo.phone} onChange={e=>setUserInfo({...userInfo, phone: e.target.value})} className="w-full border rounded-xl p-3 text-[16px] md:text-xs mb-4 outline-none" />
                    
                    <button onClick={() => handlePayment('카드')} disabled={isProcessing} className="w-full bg-[#FEE500] text-black font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition-transform disabled:opacity-50">
                      💳 원본 포트원 안전 결제하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section: any, idx: number) => {
                    if (section.isSummary) {
                      return (
                        <div key={idx} className="bg-white border-[2.5px] border-[#E8C87A] rounded-[20px] p-[24px_20px] shadow-md my-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-[6px] bg-[linear-gradient(90deg,#D4A843,#E8C050,#F5EAD0)]"></div>
                          <h4 className="font-serif text-[16px] font-black text-[#D4A843] mb-4 text-center flex items-center justify-center gap-2"><Crown size={18} /> {section.title}</h4>
                          <div className="bg-[#FFFDF9] border border-[#F5EAD0] rounded-xl p-4 mb-4 text-center">
                            <p className="text-[13.5px] text-[#4A3B32] font-bold leading-[1.8] break-keep">{section.paragraphs[0]}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 print:grid print:grid-cols-5 print:gap-2 justify-items-center mt-6">
                            {section.symbols?.map((sym: any, sIdx: number) => (
                              <div key={sIdx} className="flex flex-col items-center max-w-[80px]">
                                <div className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center text-[24px] shadow-sm border border-[#E8C87A]/40 mb-2">{sym.emoji}</div>
                                <span className="text-[9.5px] font-bold text-[#5A4080] bg-[#F5F0FF] px-2 py-0.5 rounded-full border border-[#E0D8F0] break-keep leading-tight">{sym.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={`rounded-[18px] p-[24px_20px] border ${section.isHighlight ? 'bg-gradient-to-br from-[#FFF8F4] to-[#F8F4FF] border-[#E8C87A]/60 shadow-md' : 'bg-white shadow-sm border-gray-200'}`}>
                        <h4 className="font-serif text-[15px] font-black mb-4 text-[#D4A843]">{section.title}</h4>
                        {section.paragraphs.map((text: string, pIdx: number) => {
                          if (text.startsWith('【')) {
                            return <h5 key={pIdx} className="font-serif text-[14.5px] font-black text-[#A84050] mt-7 mb-2.5 bg-[#FFF8F4] inline-block px-3 py-1.5 rounded-lg border-l-[3.5px] border-[#C87090] shadow-sm" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>{text.replace('【', '').replace('】', '')}</h5>;
                          }
                          return <p key={pIdx} className="text-[13.5px] text-[#2A1530] leading-[1.85] mb-4 last:mb-0 text-justify break-keep whitespace-pre-line">{text}</p>;
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="relative z-20 bg-[#1A1530]/80 border-t border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] text-[11px] p-6 pb-12 mt-12 break-keep font-sans print:hidden">
          <div className="max-w-md mx-auto">
            <div className="flex gap-4 mb-4 font-bold text-[rgba(255,255,255,0.7)] text-[12px] px-4">
              <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">이용약관</button>
              <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">개인정보처리방침</button>
            </div>
            <div className="space-y-1.5 leading-relaxed px-4">
              <p>상호: 해피메리벨 | 대표: 차미미</p>
              <p>사업자등록번호: 398-34-01425</p>
              <p>통신판매업 신고번호: 제 2026-인천남동-0123 호</p>
              <p>사업장 소재지: 인천광역시 남동구 호구포로900번길 20-4, 3층 301호</p>
              <p>고객센터: 010-4618-7383 | 이메일: diak83@gmail.com</p>
            </div>
            <p className="mt-5 text-[10px] text-[rgba(255,255,255,0.3)] px-4">© 2026 Happy Merry Bell. All rights reserved.</p>
          </div>
        </footer>

        {showPrivacy && (
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans print:hidden touch-none">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative text-black pointer-events-auto">
              <h3 className="text-lg font-bold text-black mb-4 border-b pb-2 border-gray-300">개인정보처리방침</h3>
              <div className="text-xs space-y-3 leading-relaxed">
                <p className="font-bold text-black">■ 개인정보 처리업무의 위탁</p>
                <p className="text-black">해피메리벨(이하 '회사')은 원활한 서비스 제공 및 안전한 결제 처리를 위하여 다음과 같이 개인정보 처리업무를 외부 전문업체에 위탁하고 있습니다.</p>
                <ul className="list-disc pl-4 space-y-1 bg-gray-100 p-2.5 rounded-lg border border-gray-300 text-black">
                  <li><span className="font-bold text-black">수탁자:</span> (주)코리아포트원, 토스페이먼츠(주)</li>
                  <li><span className="font-bold text-black">위탁 업무:</span> 전자결제 수단을 통한 결제 대행 서비스 및 도용 방지</li>
                  <li><span className="font-bold text-black">보유 및 이용기간:</span> 회원 탈퇴 시 또는 위탁 계약 종료 시까지</li>
                </ul>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="w-full mt-6 bg-[#1A1530] text-white py-3 rounded-xl font-bold text-sm transition-colors hover:bg-opacity-90">
                확인 및 닫기
              </button>
            </div>
          </div>
        )}

        {showTerms && (
          <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans print:hidden touch-none">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative text-black pointer-events-auto">
              <h3 className="text-lg font-bold text-black mb-4 border-b pb-2 border-gray-300">서비스 이용약관</h3>
              <div className="text-xs space-y-3 leading-relaxed">
                <p className="font-bold text-black">■ 제1조 (목적)</p>
                <p className="text-black">본 약관은 프라이빗 사주 컨설팅 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.</p>
                <p className="font-bold text-black mt-4">■ 제2조 (서비스 제공 기간)</p>
                <p className="text-black">회사는 고객이 결제를 완료한 시점부터 30일 동안 웹사이트를 통한 결과지 열람 및 다운로드 기능을 제공합니다. 30일 경과 후 데이터는 자동 파기됩니다.</p>
                <p className="font-bold text-black mt-4">■ 제3조 (취소 및 환불 규정)</p>
                <p className="text-black">본 서비스는 구매와 동시에 결과가 노출되는 디지털 콘텐츠 특성상 결제 후 원칙적으로 취소 및 환불이 불가능합니다.</p>
              </div>
              <button onClick={() => setShowTerms(false)} className="w-full mt-6 bg-[#1A1530] text-white py-3 rounded-xl font-bold text-sm transition-colors hover:bg-opacity-90">
                확인 및 닫기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 🖨️ 인쇄/PDF 저장용 숨겨진 화면 (A4 출력 표준 포맷 완전 가동) */}
      {/* ================================================================= */}
      {currentView === 'result' && selectedMenu?.id && unlockedMenus.includes(selectedMenu.id) && (
        <div className="hidden print:block font-serif w-full text-[#111625] bg-[#FDFBF7]">
          
          <div className="print-cover bg-white">
            <div className="w-[72px] h-[72px] rounded-full border-2 border-[#C89830] flex items-center justify-center mb-6 bg-[#FDFBF7] shadow-inner mx-auto relative overflow-hidden">
              <div className="absolute w-[40px] h-[40px] rounded-full bg-[#C89830] opacity-20 blur-md"></div>
              <span className="text-[32px] text-[#C89830] relative z-10 leading-none" style={{textShadow: '0 2px 4px rgba(200,152,48,0.3)'}}>✦</span>
            </div>
            <div className="text-[#C89830] tracking-[3px] font-bold text-xs mb-4">VIP PRIVATE CONSULTING REPORT</div>
            <h1 className="text-[28px] font-black leading-snug mb-10 text-center border-b-2 border-[#C89830] pb-6">해피메리벨 프라이빗 사주 컨설팅<br/>초정밀 운명 분석 보고서</h1>
            <div className="text-left w-full max-w-sm mb-12 space-y-2 mx-auto text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-1.5">
                <span className="text-[#C89830] font-bold whitespace-nowrap">대상자</span>
                <span className="max-w-[180px] truncate whitespace-nowrap text-right">{userInfo.name.replace(/\s+/g, '')} 님</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">생년월일</span><span>{userInfo.birthDate} ({userInfo.calendarType === 'solar' ? '양력' : userInfo.calendarType === 'lunar' ? '음력' : '윤달'})</span></div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">일간 기운</span><span>{userSaju.dayMaster} ({(DAY_MASTERS[userSaju.dayMaster]||{}).name})</span></div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">선택 리포트</span><span>{selectedMenu.title.replace('\n', ' ')}</span></div>
            </div>
            <div className="text-gray-400 text-[10px] tracking-widest text-center">HAPPY MERRY BELL</div>
          </div>

          <div className="p-10 bg-[#FDFBF7]">
            {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section: any, idx: number) => (
              <div key={idx} className="print-section mb-10">
                <h2 className="text-[14pt] font-black text-[#111625] border-l-[5px] border-[#C89830] pl-3 mb-4">{section.title}</h2>
                {section.paragraphs.map((p: string, pIdx: number) => {
                  if (p.startsWith('【')) {
                    return <h5 key={pIdx} className="text-[11pt] font-black text-[#A84050] mt-6 mb-2" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>{p}</h5>;
                  }
                  return <p key={pIdx} className="text-[10pt] leading-[1.7] mb-3 text-[#333] text-justify break-keep whitespace-pre-line">{p}</p>;
                })}

                {section.isSummary && section.symbols && (
                  <div className="flex justify-center gap-6 mt-8">
                    {section.symbols.map((sym: any, sIdx: number) => (
                      <div key={sIdx} className="flex flex-col items-center text-center max-w-[80px]">
                        <div className="w-[52px] h-[52px] rounded-full border border-[#C89830] flex items-center justify-center text-[24px] mb-1.5 bg-white shadow-sm">
                          {sym.emoji}
                        </div>
                        <span className="text-[8.5pt] font-bold text-[#111625] px-2.5 py-0.5 bg-[#F0EBE1] rounded-full border border-[#d6d0c4] break-keep leading-tight">
                          {sym.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-12 pt-6 border-t border-[#D4A843] text-[7.5pt] text-gray-400 leading-relaxed">
              ■ 소비자 유의사항 고지: 본 리포트는 구매와 동시에 디지털 결과가 노출되는 지식 콘텐츠 특성상 환불이 불가능합니다. 데이터는 30일 후 자동 영구 파기됩니다.<br/>
              © 2026 Happy Merry Bell. All rights reserved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
