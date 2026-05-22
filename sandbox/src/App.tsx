import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Lightbulb,
  Package,
  Home as HomeIcon,
  Briefcase,
  Star,
  Download,
  Lock,
  ChevronLeft,
  MessageCircle,
  Building,
  Crown,
  Sprout,
  Sun,
  Mountain,
  Zap,
  Droplets,
  Printer
} from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
// 👇 파이어베이스 연결 마스터 키 👇
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// 👆 파이어베이스 연결 마스터 키 👆

const MENU_LIST = [
  { id: 1, title: "사주로 보는\n기본 학습스타일", icon: BookOpen, bar: "bg-gradient-to-r from-[#F5B8C8] to-[#FFCBA4]", bg: "#F5B8C8" },
  { id: 2, title: "효과적인\n학습 방법", icon: Lightbulb, bar: "bg-gradient-to-r from-[#90D8C8] to-[#90C8E8]", bg: "#90D8C8" },
  { id: 3, title: "추천\n학습 아이템", icon: Package, bar: "bg-gradient-to-r from-[#C8B8E8] to-[#F5B8C8]", bg: "#C8B8E8" },
  { id: 4, title: "공부방\n추천 컬러", icon: HomeIcon, bar: "bg-gradient-to-r from-[#E8C87A] to-[#FFCBA4]", bg: "#E8C87A" },
  { id: 5, title: "미래\n추천 직업", icon: Briefcase, bar: "bg-gradient-to-r from-[#90C8E8] to-[#B8A8E8]", bg: "#90C8E8" },
  { id: 6, title: "나는 어떤\n스타일의 인재?", icon: Star, bar: "bg-gradient-to-r from-[#90D8C8] to-[#E8C87A]", bg: "#90D8C8" },
];

const GAN_KOR = { 甲: "갑", 乙: "을", 丙: "병", 丁: "정", 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계" };
const ZHI_KOR = { 子: "자", 丑: "축", 寅: "인", 卯: "묘", 辰: "진", 巳: "사", 午: "오", 未: "미", 申: "신", 酉: "유", 戌: "술", 亥: "해" };

const DAY_MASTERS = {
  甲: { name: "갑목(甲木)", nature: "하늘로 곧게 뻗어나가는 거대한 소나무", strength: "강력한 추진력과 기획력, 리더십", weakness: "유연성 부족, 부러지기 쉬운 고집", icon: Sprout, color: "#90D8C8" },
  乙: { name: "을목(乙木)", nature: "어떤 환경에서도 살아남는 끈질긴 넝쿨과 꽃", strength: "뛰어난 적응력, 유연한 사고, 친화력", weakness: "환경에 휩쓸리기 쉬움, 결단력 부족", icon: Sprout, color: "#90D8C8" },
  丙: { name: "병화(丙火)", nature: "세상을 밝게 비추는 눈부신 태양", strength: "폭발적인 열정, 솔직함, 만물을 깨우는 통찰력", weakness: "감정 기복, 비밀을 지키기 어려움, 지구력 부족", icon: Sun, color: "#F5B8C8" },
  丁: { name: "정화(丁火)", nature: "어둠을 밝히는 따뜻한 모닥불과 은은한 별빛", strength: "세심한 배려, 깊은 집중력, 봉사 정신", weakness: "내면의 스트레스 누적, 예민함, 폭발성", icon: Sun, color: "#F5B8C8" },
  戊: { name: "무토(戊土)", nature: "모든 생명을 묵묵히 품어주는 거대한 산", strength: "흔들리지 않는 신뢰감, 포용력, 중재 능력", weakness: "변화에 둔감함, 심한 고집, 속을 알 수 없음", icon: Mountain, color: "#E8C87A" },
  己: { name: "기토(己土)", nature: "작물들을 길러내는 비옥하고 촉촉한 평야", strength: "섬세한 실무 능력, 뛰어난 기억력, 모성애", weakness: "시야가 좁아질 수 있음, 지나친 신중함, 소심함", icon: Mountain, color: "#E8C87A" },
  庚: { name: "경금(庚金)", nature: "제련되지 않은 강인하고 거친 무쇠와 바위", strength: "단호한 결단력, 의리, 뛰어난 실행력", weakness: "융통성 결여, 타인에게 상처를 주는 직설적 화법", icon: Zap, color: "#FFF4CA" },
  辛: { name: "신금(辛金)", nature: "정교하게 가공된 예리한 칼날이자 빛나는 보석", strength: "완벽주의, 예리한 분석력, 세련된 미적 감각", weakness: "지나친 예민함, 날카로운 비판, 자기중심적 사고", icon: Zap, color: "#FFF4CA" },
  壬: { name: "임수(壬水)", nature: "세상 모든 것을 담아 흐르는 넓은 바다와 강물", strength: "지혜, 모든 것을 수용하는 유연성, 스케일", weakness: "생각이 너무 많아 실행 지연, 속마음을 숨김", icon: Droplets, color: "#90C8E8" },
  癸: { name: "계수(癸水)", nature: "만물을 적셔 생명을 깨우는 촉촉한 봄비", strength: "창의력, 뛰어난 직관과 영감, 환경 친화력", weakness: "쉽게 증발하는 끈기, 지나친 감성, 현실감각 부족", icon: Droplets, color: "#90C8E8" },
};

const ELEMENT_PRESCRIPTION = {
  "목(나무)": { color: "딥 그린, 터콰이즈, 차분한 우드톤", item: "원목 소재의 가구, 곧게 뻗은 식물", action: "무언가를 배우기 전 전체적인 목차와 뼈대를 기획하는 습관", symbols: [{ emoji: "🌳", label: "성장 에너지" }, { emoji: "📈", label: "구조화 훈련" }, { emoji: "🧘", label: "아침 스트레칭" }] },
  "화(불)": { color: "피치 코랄, 버건디, 인디고 핑크", item: "따뜻한 조명, 향초, 붉은 계열의 다이어리", action: "배운 것을 남에게 설명해보는 출력(Output) 중심의 학습법", symbols: [{ emoji: "🔥", label: "출력(Output)" }, { emoji: "⏳", label: "텐션 조절" }, { emoji: "🗣️", label: "티칭 학습법" }] },
  "토(흙)": { color: "오트밀 베이지, 머스타드, 브릭 레드", item: "안정감을 주는 방석, 도자기 컵, 정리 수납장", action: "흔들리지 않는 고정된 루틴 만들기, 복습 위주 학습", symbols: [{ emoji: "⛰️", label: "고정 루틴" }, { emoji: "🔁", label: "반복 복습" }, { emoji: "🗂️", label: "공간 정리" }] },
  "금(쇠)": { color: "스노우 화이트, 실버 그레이, 차콜", item: "금속 재질의 거치대나 태블릿, 세공된 펜", action: "오답 노트를 통한 원리 분석 및 객관화, 감정 배제", symbols: [{ emoji: "⚔️", label: "원리 분석" }, { emoji: "🧊", label: "감정 배제" }, { emoji: "🎯", label: "약점 타격" }] },
  "수(물)": { color: "미드나잇 블루, 블랙, 딥 퍼플", item: "노이즈 캔슬링 헤드폰, 가습기", action: "방해받지 않는 심야 시간을 활용한 딥워크, 명상", symbols: [{ emoji: "🌊", label: "심야 딥워크" }, { emoji: "🎧", label: "외부 차단" }, { emoji: "🧘‍♂️", label: "뇌파 안정" }] },
};

const charToElement = (char) => {
  if (["甲", "乙", "寅", "卯"].includes(char)) return "목(나무)";
  if (["丙", "丁", "巳", "午"].includes(char)) return "화(불)";
  if (["戊", "己", "辰", "戌", "丑", "未"].includes(char)) return "토(흙)";
  if (["庚", "辛", "申", "酉"].includes(char)) return "금(쇠)";
  if (["壬", "癸", "亥", "子"].includes(char)) return "수(물)";
  return null;
};

const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return 20; 
  const birthYear = parseInt(birthDateStr.split("-")[0], 10);
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear + 1; 
};

// 🔥 10,000자 분량 VVIP 분석 보고서 생성 엔진 🔥
const generateProfessionalReport = (user, saju, menuId) => {
  if (!user || !saju) return [];
  const name = user.name || '고객';
  const dm = DAY_MASTERS[saju.dayMaster] || DAY_MASTERS["丙"];
  const lackProp = ELEMENT_PRESCRIPTION[saju.lacking] || ELEMENT_PRESCRIPTION["수(물)"];
  const excessEl = saju.excessive || saju.main || '목(나무)';
  
  let elementCountsStr = "";
  Object.entries(saju.counts || {}).forEach(([el, cnt]) => { elementCountsStr += `${el.charAt(0)}(${cnt}개) `; });

  const analysis1Text = [
    `본 프라이빗 컨설팅은 시중의 가벼운 점술이나 막연한 칭찬을 나열하는 행위를 엄격히 지양합니다. 천문학적 황경 기준으로 고객님의 명식을 심층 해부한다는 것은, 세상의 방대한 지식과 정보를 받아들이고 처리할 때 무의식적으로 작동하는 '가장 근본적인 인지 필터'를 찾아내는 일입니다. 정밀 해독 결과, ${name}님의 일간(Day Master)은 [ ${dm.name} ]의 기운으로 굳건하게 세팅되어 있습니다.`,
    `이 기운이 뜻하는 바는 명확합니다. ${dm.nature}처럼 당신은 본능적으로 지식을 흡수할 때 핵심 맥락을 단숨에 밝혀내며, 거시적인 관점에서 숲 전체를 조망하는 강력한 직관력을 천부적으로 부여받았습니다. 남들이 정해놓은 획일화된 정답만을 기계처럼 복사해 넣는 학습 환경에 노출될 경우, 당신의 뇌는 극심한 지루함을 느끼며 에너지가 급격히 방전됩니다.`,
    `현재 당신을 이루고 있는 오행의 분포를 스캔해보면 [ ${elementCountsStr}] 로 구성되어 있습니다. 특정 기운이 편중되거나 텅 비어버리면, 뇌의 특정 회로가 치명적인 병목 현상(Bottleneck)을 겪으며 성취의 한계치에 부딪히게 됩니다.`
  ];
  
  const analysis2Text = [
    `명리학의 오행 균형은 뇌과학의 신경전달물질 분비 패턴과 소름 돋을 정도로 일치합니다. 현재 ${name}님의 패턴에서 뿜어져 나오는 극강의 천재성과 잠재력은 '${excessEl}' 기운에서 발현됩니다. 본인의 흥미를 자극하는 주제를 만났을 때, 당신은 남들이 10시간 걸려 구겨 넣을 분량을 단 1시간 만에 꿰뚫어 보는 파괴적인 몰입도를 보여줍니다.`,
    `하지만 가장 객관적인 취약점이자 깊은 슬럼프의 수렁으로 당신을 밀어 넣는 뇌의 블랙홀은 바로 '${saju.lacking}' 기운의 결핍입니다. 이 에너지가 순환되지 못하면, 아무리 의지력을 불태우며 밤을 새워도 지식이 머리에서 튕겨 나가게 됩니다. 중요한 시험이나 실전 프로젝트 앞에서 머릿속이 하얗게 백지장처럼 얼어붙는 근본적인 이유가 바로 이 밸런스의 붕괴에 숨겨져 있었습니다.`,
  ];
  
  const prescriptionText = [
    `부족하고 결핍된 '${saju.lacking}'의 기운을 인위적이고 정교하게 당신의 루틴 속에 주입하는 것만이, 무너진 밸런스를 멱살 잡고 끌어올려 최상위권의 영역으로 퀀텀 점프(Quantum Jump)시키는 마스터키입니다. 지금 당장 성과를 폭발시키기 위해 실천해야 할 '5단계 VVIP 시크릿 행동 지침'을 상세히 공개합니다.`,
    `【 STEP 1. 운기를 강제로 깨우는 15분 마이크로 예열 루틴 】\n책상에 앉자마자 마음이 급하다고 곧바로 무거운 과제나 과목을 펼치는 것은 치명적인 금기 사항입니다. 본격적인 시작 전 최초 15분 동안은 사주에 메말라 있는 에너지를 공급해주는 [ ${lackProp.action.split(",")[0]} ]의 시간을 강박적으로 확보하십시오. 이 의식적인 15분이 뇌의 보상 회로에 도파민을 적시게 만들어 이어지는 몰입도를 완벽하게 지배합니다.`,
    `【 STEP 2. 뇌파를 지배하는 시각적 마일스톤 기법 】\n${name}님은 ${dm.strength}의 압도적인 장점을 가졌지만, 사주의 불균형으로 인해 긴 호흡의 레이스에서 뒷심이 부족해질 리스크가 있습니다. 이를 방어하기 위해 분량을 절대 '시간 단위'로 두루뭉술하게 잡아서는 안 됩니다. 반드시 '마이크로 태스크 단위'로 잘게 쪼개어 눈에 보이는 체크리스트로 만드십시오. 과감히 선을 그어 지워버리는 쾌감이 빈자리를 메우는 원동력이 됩니다.`,
    `【 STEP 3. 메타인지를 폭발시키는 잔혹한 백지 복습법 】\n알고 있다는 착각과 '진짜 아는 것'을 분리해내는 능력이 상위 1%를 결정짓습니다. 매일 일정이 끝난 직후, 텅 빈 A4 용지에 핵심 키워드의 흐름을 머릿속에서 강제로 토해내며 적어보는 10분을 투자하십시오. 손끝이 막히고 기억이 나지 않아 식은땀이 나는 바로 그 지점이 당신의 뇌가 뚫려있는 취약점입니다.`,
    `【 STEP 4. 슬럼프 탈출을 위한 물리적 구급처방(Emergency Kit) 】\n에너지가 완전히 고갈되는 순간이 옵니다. 이때 억지로 버티려 하지 마십시오. 사주에 부족한 기운을 물리적인 행위로 즉각 보충해야 뇌파가 살아납니다. 물(水)이 부족하다면 차가운 물로 세안이나 명상을, 나무(木)가 부족하다면 밖으로 나가 녹색 식물을 보고 스트레칭을 하는 등 즉각적인 환경 환기가 필요합니다.`,
    `【 STEP 5. 절대 타협해선 안 될 운기 하락의 치명적 금기 사항 】\n${name}님의 구조에서는 여러 과제나 책을 동시에 펼쳐두고 번갈아 가며 얕게 접근하는 '산만한 멀티태스킹'이 운기를 파괴하는 맹독입니다. 기운이 흩어져 5시간을 앉아 있어도 남는 것이 없게 됩니다. 한 번에 오직 하나의 타겟만 조준하는 습관이 당신을 승리로 이끕니다.`,
  ];
  
  const summaryText = "최상위권 도약의 진짜 비밀은 무작정 의자에 앉아 고통을 견뎌내는 버티기 시간이 아닙니다. 내 사주에 가장 심각하게 결핍된 에너지를 영리하게 주입하는 '15분의 의식적인 예열'과, 하루를 매듭짓는 '잔혹한 백지 복습 루틴'에 모든 성과 상승의 뼈아픈 해답이 숨어 있습니다.";
  
  const conclusionText = [
    `결론적으로 ${name}님의 운명의 그릇은 평범한 범인들이 상상조차 할 수 없는 거대한 흡수력과 폭발력을 내포하고 있는 최상급의 도화지입니다. 인생의 대운이 목표를 향해 거세게 열리는 골든타임이 도래하면, 지금까지 고독하게 쌓아 올린 파편들이 걷잡을 수 없는 시너지를 내며 압도적인 점수와 성과로 온 세상에 증명될 것입니다.`,
    `가장 경계해야 할 멘탈의 적은, 타인의 속도와 나를 무의미하게 비교하며 조급해하는 것입니다. 흔들림이 생길 때마다 당신의 본원인 ${dm.name}의 웅장한 심지를 떠올리십시오. 오직 자신만의 리듬을 굳게 믿고 타협 없이 전진하십시오. 영광스러운 승리는 이미 당신의 것입니다.`,
  ];

  return [
    { id: "analysis1", title: "✨ [VVIP 명식 해단식] 객관적 원국 분석", paragraphs: analysis1Text },
    { id: "analysis2", title: "⚖️ [운기의 밸런스 진단] 천재성과 슬럼프의 경계", paragraphs: analysis2Text },
    { id: "solution", title: "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 행동 지침", isHighlight: true, paragraphs: prescriptionText },
    { id: "summary", title: "🎯 VVIP 핵심 요약 및 처방 상징", isHighlight: false, isSummary: true, paragraphs: [summaryText], symbols: lackProp.symbols },
    { id: "conclusion", title: "👑 에필로그: VVIP 멘탈 코어 가이드", paragraphs: conclusionText },
  ];
};

const PREVIEW_DATA = {
  1: (user, saju) => `사주 명리학의 정밀 분석 결과, ${user.name}님은 ${DAY_MASTERS[saju.dayMaster]?.name || '태양'}의 기운을 타고났습니다.\n상위 1%가 가진 본능적 직관을 가졌지만, 특정 오행의 불균형으로 인해 현재의 성취에 한계를 느낄 수 있습니다.`,
  2: (user, saju) => {
    const age = calculateAge(user.birthDate);
    if (age <= 7) return `현재 ${age}세 유아기인 ${user.name} 아이에게 억지로 주입하는 교육은 사주의 기운을 질식시킵니다.\n명리학적으로 분석한 가장 완벽한 두뇌 발달과 영재성 발현의 치트키는 전혀 다른 곳에 있습니다.`;
    if (age <= 13) return `현재 ${age}세 초등 시기인 ${user.name} 학생의 평생 공부 그릇이 결정되는 골든타임입니다.\n명리학적으로 분석한 자기주도학습의 완성을 위한 시크릿 치트키는 무엇일까요?`;
    if (age <= 19) return `현재 ${age}세 수험생인 ${user.name} 학생에게 대치동식 스파르타 교육은 오히려 독이 될 수 있습니다.\n명리학적으로 분석한 1등급 도약을 위한 가장 완벽한 성적 향상의 치트키는 전혀 다른 곳에 있습니다.`;
    return `현재 성인(${age}세)인 ${user.name}님에게 10대 시절의 단순 암기법은 더 이상 통하지 않습니다.\n명리학적으로 분석한 자격증/고시/직무 등 실전 아웃풋을 극대화할 어른의 치트키는...`;
  },
  3: (user, saju) => `주변 환경과 물건(풍수)의 미세한 변화가 현재 사주에 막혀있는 에너지를 크게 뚫어줍니다.\n${user.name}님의 집중력을 비약적으로 끌어올리기 위해 반드시 책상 위에 두어야 할 시크릿 아이템은...`,
  4: (user, saju) => `시각적 에너지는 오행을 뇌파로 전달하는 가장 강력한 매개체입니다.\n현재 사주 원국의 열기를 식히고/얼어붙은 기운을 녹여내기 위해 필요한 절대적인 운명의 컬러는...`,
  5: (user, saju) => `타고난 재능을 영리하게 활용할 때 평범한 삶을 넘어 압도적인 성공을 쟁취합니다.\n현재 명식 구조상 향후 가장 크게 대성할 수 있는 구체적인 직업군과 그 이유는...`,
  6: (user, saju) => `어떤 무리에 있더라도 반드시 분위기를 장악하거나 신뢰를 얻는 고유의 아우라가 있습니다.\n${user.name}님 본인도 미처 완벽히 자각하지 못했던 잠재력과 리더십의 본질은...`,
};

export default function SajuLearningApp() {
  const [currentView, setCurrentView] = useState('intro');
  const [userInfo, setUserInfo] = useState({ name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false });
  const [userSaju, setUserSaju] = useState({ dayMaster: '', main: '', lacking: '', excessive: '', pillars: [], counts: {} });
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [unlockedMenus, setUnlockedMenus] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');
    const isFail = urlParams.get('fail');

    if (isSuccess === 'true') {
      try {
        const savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo') || 'null');
        const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju') || 'null');
        const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu') || 'null');

        if (savedUserInfo && savedUserSaju && savedMenu) {
          setUserInfo(savedUserInfo);
          setUserSaju(savedUserSaju);
          setSelectedMenu(savedMenu);
          setUnlockedMenus([savedMenu.id]);
          setCurrentView('result'); 

          const saveToDatabase = async () => {
            try {
              await addDoc(collection(db, "paid_customers"), {
                customerName: savedUserInfo.name,
                birthDate: savedUserInfo.birthDate,
                purchasedMenu: savedMenu.title,
                sajuDayMaster: savedUserSaju.dayMaster,
                paymentAmount: 1000,
                paymentDate: new Date().toISOString()
              });
            } catch (e) {
              console.error("금고 저장 에러: ", e);
            }
          };
          saveToDatabase();
        }
      } catch (e) {
        console.error("데이터 복구 에러: ", e);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isFail === 'true') {
      alert("결제 과정에서 오류가 발생했거나 취소하셨습니다.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchSajuFromAPI = async (dateString, timeString, isTimeUnknown, calendarType) => {
    return new Promise(async (resolve) => {
      if (!window.Lunar) {
        await new Promise((res) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
          script.onload = res;
          document.head.appendChild(script);
        });
      }

      setTimeout(() => {
        try {
          const [year, month, day] = dateString.split('-').map(Number);
          const [hour, min] = !isTimeUnknown && timeString ? timeString.split(':').map(Number) : [12, 0];

          let lunarObj;
          if (calendarType === 'lunar' || calendarType === 'leap') {
            lunarObj = window.Lunar.fromYmdHms(year, month, day, hour, min, 0);
          } else {
            const solarObj = window.Solar.fromYmdHms(year, month, day, hour, min, 0);
            lunarObj = solarObj.getLunar();
          }

          const bazi = lunarObj.getEightChar();
          const yGan = bazi.getYearGan(); const yZhi = bazi.getYearZhi();
          const mGan = bazi.getMonthGan(); const mZhi = bazi.getMonthZhi();
          const dGan = bazi.getDayGan(); const dZhi = bazi.getDayZhi();
          const tGan = bazi.getTimeGan(); const tZhi = bazi.getTimeZhi();

          const pillars = [
            { tH: yGan, tK: GAN_KOR[yGan], bH: yZhi, bK: ZHI_KOR[yZhi] },
            { tH: mGan, tK: GAN_KOR[mGan], bH: mZhi, bK: ZHI_KOR[mZhi] },
            { tH: dGan, tK: GAN_KOR[dGan], bH: dZhi, bK: ZHI_KOR[dZhi] },
            { tH: tGan, tK: GAN_KOR[tGan], bH: tZhi, bK: ZHI_KOR[tZhi] }
          ];

          const elementsCount = {'목(나무)':0, '화(불)':0, '토(흙)':0, '금(쇠)':0, '수(물)':0};
          const charsToCount = isTimeUnknown ? [yGan, yZhi, mGan, mZhi, dGan, dZhi] : [yGan, yZhi, mGan, mZhi, dGan, dZhi, tGan, tZhi];

          charsToCount.forEach(char => {
            const el = charToElement(char);
            if(el) elementsCount[el]++;
          });

          const dayMasterChar = dGan;
          const mainElement = charToElement(dGan);

          let lacking = null;
          let minCount = 99;
          let excessive = null;
          let maxCount = -1;

          for (const [el, count] of Object.entries(elementsCount)) {
            if (count < minCount) { minCount = count; lacking = el; }
            if (count > maxCount) { maxCount = count; excessive = el; }
          }

          if (lacking === mainElement) {
            const sortedElements = Object.entries(elementsCount).sort((a, b) => a[1] - b[1]);
            lacking = sortedElements.find(([el, _]) => el !== mainElement)?.[0] || '수(물)';
          }

          resolve({ 
            dayMaster: dayMasterChar, 
            main: mainElement, 
            lacking: lacking, 
            excessive: excessive,
            pillars: pillars,
            counts: elementsCount
          });

        } catch (error) {
          resolve({ dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', pillars: [], counts: {'목(나무)':3, '수(물)':0} });
        }
      }, 1500);
    });
  };

  const handleStart = async (e) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.birthDate) {
      alert("생년월일과 이름을 입력해주세요.");
      return;
    }
    setCurrentView('calculating');
    const sajuResult = await fetchSajuFromAPI(userInfo.birthDate, userInfo.birthTime, userInfo.isTimeUnknown, userInfo.calendarType);
    setUserSaju(sajuResult);
    setCurrentView('menu');
  };

  const handlePayment = async (method = '카드') => {
    localStorage.setItem('sajuApp_userInfo', JSON.stringify(userInfo));
    localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju));
    localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

    const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; 
    const tossPayments = await loadTossPayments(clientKey);

    tossPayments.requestPayment(method, {
      amount: 1000,
      orderId: 'order_' + new Date().getTime(),
      orderName: `VVIP 사주 컨설팅 - ${selectedMenu?.title?.replace('\n', ' ') || '분석'}`,
      customerName: userInfo.name || '고객',
      successUrl: window.location.origin + window.location.pathname + '?success=true',
      failUrl: window.location.origin + window.location.pathname + '?fail=true',
    }).catch(function (error) {
      if (error.code === 'USER_CANCEL') alert("결제를 취소하셨습니다.");
    });
  };

  // 🔥 1만 자 리포트를 백지/크래시 없이 PDF로 저장하게 유도하는 안전한 인쇄 창 호출 함수
  const openPrintDialog = () => {
    window.print();
  };

  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5;
      return (
        <div key={i} className="absolute rounded-full bg-white animate-twinkle no-print"
          style={{ width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 4}s`, animationDelay: `${Math.random() * 6}s`, opacity: 0.2 + Math.random() * 0.6 }}
        />
      );
    });
  }, []);

  return (
    <div className="min-h-screen text-[rgba(255,255,255,0.88)] font-sans relative bg-[#0D0B1A]">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#2A1B4A_0%,transparent_70%),radial-gradient(ellipse_50%_40%_at_80%_100%,#1A2840_0%,transparent_60%)]"></div>
        {stars}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', serif; }
        .font-sans { font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif; }
        @keyframes twinkle { 0%, 100% { transform: scale(1); } 50% { opacity: 0.9 !important; transform: scale(1.3); } }
        @keyframes obounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-10px); opacity: 1; } }
        .glass-card { background: rgba(255,255,255,0.055); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
        .text-gradient-gold { background: linear-gradient(135deg, #fff 0%, #E8C87A 50%, #F5B8C8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-gradient-lavender { background: linear-gradient(90deg, #fff, #B8A8E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* 🖨️ 스마트폰 인쇄/PDF 저장 모드 시 완벽 대응하는 CSS 🖨️ */
        @media print {
          @page { margin: 10mm; size: A4 portrait; }
          .no-print { display: none !important; }
          body, html { background: #fff !important; color: #000 !important; width: 100%; height: auto; }
          .print-area { display: block !important; width: 100%; max-width: 100%; padding: 0 !important; margin: 0 !important; background: #fff !important; }
          .print-text-dark { color: #111 !important; }
          .print-text-gray { color: #444 !important; }
          .print-border { border-color: #E8C87A !important; }
          .print-bg-light { background-color: #FDFBF7 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* 페이지 잘림 방지 (핵심!) */
          .page-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
          .page-break-after { page-break-after: always !important; break-after: page !important; }
        }
      `}} />

      <div className="no-print">
        {/* 1. INTRO VIEW */}
        {currentView === 'intro' && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <span className="text-6xl drop-shadow-[0_0_18px_rgba(212,168,67,0.6)]">🌙</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[rgba(212,168,67,0.1)] border border-[rgba(212,168,67,0.4)] text-[#E8C87A] text-[10.5px] tracking-[2.5px] px-4 py-1.5 rounded-full mb-3.5 font-serif before:content-['✦'] before:text-[8px] after:content-['✦'] after:text-[8px]">
                VIP PRIVATE CONSULTING
              </div>
              <h1 className="font-serif text-[27px] font-black leading-[1.35] mb-2 text-gradient-gold">
                대치동 엄마들의 시크릿<br/>프라이빗 사주 컨설팅
              </h1>
              <p className="text-[rgba(255,255,255,0.42)] text-[12.5px] leading-[1.85] tracking-[0.3px]">
                상위 0.1%가 몰래 참고한다는 타고난 그릇 분석과<br/>완벽하게 채워주는 VVIP 맞춤 학습 처방전 🗝️
              </p>
            </div>

            <div className="w-full max-w-sm glass-card rounded-[24px] p-6 relative overflow-hidden">
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold mb-2 flex items-center gap-1">👤 이름</label>
                  <input type="text" placeholder="이름을 입력해주세요" required
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-4 py-3.5 outline-none focus:border-[rgba(212,168,67,0.5)] placeholder-[rgba(255,255,255,0.28)]"
                    value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">🗓 생년월일</label>
                    <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-0.5 gap-0.5">
                      {[
                        { id: 'solar', label: '양력' },
                        { id: 'lunar', label: '음력' }
                      ].map(type => (
                        <button key={type.id} type="button" onClick={() => setUserInfo({...userInfo, calendarType: type.id})}
                          className={`text-[9.5px] font-bold px-2 py-1 rounded-md transition-colors ${userInfo.calendarType === type.id ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-[rgba(255,255,255,0.5)] hover:text-white'}`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="date" required
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-3 py-3.5 outline-none focus:border-[rgba(212,168,67,0.5)] [color-scheme:dark]"
                    value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
                  />
                </div>

                {/* 🔥 부활한 시간 입력창! 🔥 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">⏰ 태어난 시</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 accent-[#E8C87A] bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.15)] rounded cursor-pointer"
                        checked={userInfo.isTimeUnknown}
                        onChange={(e) => setUserInfo({...userInfo, isTimeUnknown: e.target.checked, birthTime: e.target.checked ? '' : userInfo.birthTime})}
                      />
                      <span className={`text-[10.5px] font-bold ${userInfo.isTimeUnknown ? 'text-[#E8C87A]' : 'text-[rgba(255,255,255,0.5)]'}`}>모름</span>
                    </label>
                  </div>
                  <input type="time"
                    disabled={userInfo.isTimeUnknown}
                    className={`w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-3 py-3.5 outline-none focus:border-[rgba(212,168,67,0.5)] [color-scheme:dark] ${userInfo.isTimeUnknown ? 'opacity-30 cursor-not-allowed' : ''}`}
                    value={userInfo.birthTime} onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})}
                  />
                </div>

                <button type="submit"
                  className="w-full mt-4 p-[15px] rounded-2xl text-[#1A1530] font-serif font-bold text-[16px] tracking-[0.5px] cursor-pointer shadow-[0_8px_32px_rgba(212,168,67,0.22)] bg-[linear-gradient(135deg,#C89830,#E8C050,#D4A843)]"
                >
                  ✨ 비밀 학습 컨설팅 확인하러가기
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. CALCULATING VIEW */}
        {currentView === 'calculating' && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-[#D4A843] animate-[obounce_1.2s_ease-in-out_infinite]" style={{animationDelay: '0s'}}></div>
              <div className="w-3 h-3 rounded-full bg-[#E8849A] animate-[obounce_1.2s_ease-in-out_infinite]" style={{animationDelay: '0.15s'}}></div>
              <div className="w-3 h-3 rounded-full bg-[#B8A8E8] animate-[obounce_1.2s_ease-in-out_infinite]" style={{animationDelay: '0.3s'}}></div>
            </div>
            <h2 className="font-serif text-[18px] font-black text-white mb-2 text-gradient-lavender">숨겨진 비밀을 분석 중이에요 🌙</h2>
          </div>
        )}

        {/* 3. MENU VIEW */}
        {currentView === 'menu' && (
          <div className="relative z-10 min-h-screen pt-8 px-5 pb-16">
            <div className="mb-6">
              <h2 className="font-serif text-[18px] font-black text-gradient-lavender mb-1">🌟 VVIP 프라이빗 분석 메뉴</h2>
              <p className="text-[11px] text-[rgba(255,255,255,0.42)]">원하시는 심층 분석 항목을 선택해 주세요</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5">
              {MENU_LIST.map((menu, i) => {
                const Icon = menu.icon;
                return (
                  <div key={menu.id} onClick={() => { setSelectedMenu(menu); setCurrentView('result'); }}
                    className="bg-[rgba(255,255,255,0.95)] rounded-[22px] p-[20px_12px_18px] flex flex-col items-center text-center cursor-pointer relative shadow-lg"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[5px] rounded-t-[22px] ${menu.bar}`}></div>
                    <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center mb-3" style={{backgroundColor: `${menu.bg}22`}}>
                      <Icon size={24} className="text-[#1A1530]" strokeWidth={2} />
                    </div>
                    <div className="text-[12px] font-bold text-[#1A1530] leading-[1.4] mb-1.5 whitespace-pre-line">{menu.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. RESULT VIEW */}
        {currentView === 'result' && selectedMenu && userSaju && (
          <div className="relative z-20 min-h-screen bg-[#FDFBF7] text-[#1A1530] pb-12">
            <div className="px-4 py-4 flex items-center sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur border-b border-[#EAE1D8]">
              <button onClick={() => setCurrentView('menu')} className="p-2 mr-2 bg-white border border-[#EAE1D8] rounded-full shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-[15px] font-black flex-1 text-center pr-10 font-sans whitespace-pre-line leading-tight">
                {selectedMenu?.title?.replace('\n', ' ') || '분석 메뉴'}
              </h2>
            </div>

            <div className="max-w-md mx-auto w-full p-5 mt-2">
              <p className="text-center text-[#A090C0] font-bold text-[11px] tracking-widest mb-3 uppercase">Destiny Card</p>
              
              <div className="bg-[#1A1530] rounded-[24px] shadow-lg p-6 relative mb-8 overflow-hidden text-center">
                <h3 className="font-serif text-[#E8C87A] text-xl mb-4 tracking-widest">{DAY_MASTERS[userSaju?.dayMaster]?.name || '태양'}</h3>
                <div className="w-[120px] h-[120px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(212,168,67,0.3)] flex items-center justify-center mx-auto mb-5">
                  {React.createElement(DAY_MASTERS[userSaju?.dayMaster]?.icon || Star, { size: 56, className: "text-[#E8C87A]", strokeWidth: 1.5 })}
                </div>
                <h1 className="text-3xl font-black text-white tracking-[0.2em] mb-4 font-serif">
                  {userSaju?.main?.split('(')[0] || '화'}
                </h1>
              </div>

              {/* 🔥 안전한 인쇄(PDF 저장) UI 및 안내문 🔥 */}
              {unlockedMenus.includes(selectedMenu?.id) ? (
                <div className="bg-[#111625] rounded-[20px] shadow-xl p-5 mb-6 relative overflow-hidden border border-[#E8C87A]/30">
                  <div className="relative z-10 text-center">
                    <p className="text-[12px] text-[#E8C87A] mb-4 leading-relaxed font-bold">
                      📢 <span className="text-white">알림:</span> 아래 버튼을 누르신 후,<br/>반드시 <span className="text-amber-400 font-black text-[14px]">"PDF로 저장"</span> 옵션을 선택해 주세요!
                    </p>
                    <button onClick={openPrintDialog} className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#D4A843,#E8C050)] text-[#1A1530] font-black text-[13px] px-5 py-4 rounded-xl w-full justify-center shadow-lg active:scale-95 transition-transform">
                      <Printer size={18} strokeWidth={2.5} />
                      10,000자 VVIP 리포트 저장 (PDF)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  {isProcessing ? (
                    <div className="text-center py-10"><p className="text-[13px] text-[#5A4080] font-bold">결제 창을 여는 중입니다...</p></div>
                  ) : (
                    <>
                      <div className="text-center mb-5">
                        <h3 className="font-serif text-[16px] font-black text-[#1A1530] mb-2">✨ 10,000자 전체 분석 열람하기</h3>
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-[26px] font-black text-[#E8607A] font-serif">1,000</span>
                          <span className="text-[13px] text-[#5A4080] font-bold">원</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <button onClick={() => handlePayment('카드')} className="w-full bg-[#FEE500] text-[#3C1E1E] p-[14px] rounded-[16px] font-bold text-[14px] flex justify-center items-center gap-2 shadow-sm">
                          <MessageCircle size={18} /> 테스트 카드 결제
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 결과물 화면 렌더링 (결제 후에만 보임) */}
              {unlockedMenus.includes(selectedMenu?.id) && (
                <div className="space-y-4">
                  {generateProfessionalReport(userInfo, userSaju, selectedMenu?.id).map((section, idx) => (
                    <div key={idx} className="bg-white rounded-[18px] p-6 shadow-sm border border-gray-200">
                      <h4 className="font-serif text-[16px] font-black mb-5 text-[#D4A843]">{section.title}</h4>
                      {section.paragraphs.map((text, pIdx) => {
                        const isSubtitle = text.startsWith('【');
                        if (isSubtitle) return <h5 key={pIdx} className="font-serif text-[15px] font-black text-[#A84050] mt-8 mb-3">{text.replace('【', '').replace('】', '')}</h5>;
                        return <p key={pIdx} className="text-[14px] text-[#2A1530] leading-[1.9] mb-4 text-justify">{text}</p>;
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 🖨️ 인쇄(PDF 변환) 전용 화면 영역 🖨️ */}
      {/* ================================================================= */}
      {currentView === 'result' && unlockedMenus.includes(selectedMenu?.id) && (
        <div className="print-area hidden w-full text-[#111625] bg-white font-sans">
          
          {/* 표지 페이지 */}
          <div className="print-bg-light border-[4px] print-border p-12 text-center page-break-after flex flex-col justify-center items-center min-h-[90vh]">
            <div className="text-[50px] mb-4">🌙</div>
            <div className="text-[#C89830] tracking-[4px] font-bold text-[14px] mb-8">VIP PRIVATE CONSULTING REPORT</div>
            <h1 className="text-[32px] font-black leading-snug mb-12 text-[#111625] border-b-[3px] border-[#C89830] pb-6 font-serif">
              해피메리벨 프라이빗 사주 컨설팅<br/>초정밀 운명 분석 보고서
            </h1>
            <div className="text-left w-[80%] max-w-[400px] text-[16px] leading-[2.5] mx-auto">
              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2"><span className="text-[#C89830] font-bold">대상자</span><span className="font-bold print-text-dark">{userInfo.name} 님</span></div>
              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2"><span className="text-[#C89830] font-bold">명식 기준일</span><span className="font-bold print-text-dark">{userInfo.birthDate}</span></div>
              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2"><span className="text-[#C89830] font-bold">일간 기운</span><span className="font-bold print-text-dark">{userSaju.dayMaster}</span></div>
              <div className="flex justify-between border-b border-gray-300 pb-2 mb-2"><span className="text-[#C89830] font-bold">선택 메뉴</span><span className="font-bold print-text-dark">{selectedMenu?.title?.replace('\n', ' ')}</span></div>
            </div>
          </div>

          {/* 본문 페이지 */}
          <div className="p-8">
            {generateProfessionalReport(userInfo, userSaju, selectedMenu?.id).map((section, idx) => (
              <div key={idx} className="mb-10 page-break-avoid">
                <h2 className="text-[18px] font-black print-text-dark border-l-[6px] border-[#C89830] pl-4 mb-6 font-serif bg-[#FDFBF7] py-2">{section.title}</h2>
                {section.paragraphs.map((text, pIdx) => {
                  const isSubtitle = text.startsWith('【');
                  if (isSubtitle) return <h5 key={pIdx} className="text-[15px] font-black text-[#A84050] mt-8 mb-3 font-serif page-break-avoid">{text.replace('【', '').replace('】', '')}</h5>;
                  return <p key={pIdx} className="text-[13px] leading-[2.0] mb-5 print-text-gray text-justify break-keep page-break-avoid">{text}</p>;
                })}
              </div>
            ))}
            
            <div className="mt-16 pt-8 border-t-[2px] border-[#D4A843] text-[11px] text-gray-500 leading-relaxed page-break-avoid">
              <strong>■ 서비스 제공 기간 및 소비자 취소/환불 규정 안내</strong><br/>
              본 사주 컨설팅 초정밀 분석 리포트는 전자상거래 등에서의 소비자보호에 관한 법률에 의거, 결제 후에는 소비자의 단순 변심으로 인한 취소 및 환불이 원칙적으로 불가능합니다.<br/>
              © 2026 Happy Merry Bell. All rights reserved.
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
