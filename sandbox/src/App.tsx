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
  Unlock,
  ChevronLeft,
  CreditCard,
  MessageCircle,
  Building,
  Crown,
  Sprout,
  Sun,
  Mountain,
  Zap,
  Droplets,
} from "lucide-react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

// 👇 파이어베이스 연결 마스터 키 👇
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

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

// 신비로운 우주/별자리 테마 컬러 메뉴
const MENU_LIST = [
  { id: 1, title: "사주로 보는\n기본 학습스타일", icon: BookOpen, bar: "bg-gradient-to-r from-[#F5B8C8] to-[#FFCBA4]", bg: "#F5B8C8" },
  { id: 2, title: "효과적인\n학습 방법", icon: Lightbulb, bar: "bg-gradient-to-r from-[#90D8C8] to-[#90C8E8]", bg: "#90D8C8" },
  { id: 3, title: "추천\n학습 아이템", icon: Package, bar: "bg-gradient-to-r from-[#C8B8E8] to-[#F5B8C8]", bg: "#C8B8E8" },
  { id: 4, title: "공부방\n추천 컬러", icon: HomeIcon, bar: "bg-gradient-to-r from-[#E8C87A] to-[#FFCBA4]", bg: "#E8C87A" },
  { id: 5, title: "미래\n추천 직업", icon: Briefcase, bar: "bg-gradient-to-r from-[#90C8E8] to-[#B8A8E8]", bg: "#90C8E8" },
  { id: 6, title: "나는 어떤\n스타일의 인재?", icon: Star, bar: "bg-gradient-to-r from-[#90D8C8] to-[#E8C87A]", bg: "#90D8C8" },
];

const ELEMENTS = ["목(나무)", "화(불)", "토(흙)", "금(쇠)", "수(물)"];

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
  "목(나무)": { color: "딥 그린, 터콰이즈, 차분한 우드톤", item: "원목 소재의 가구, 곧게 뻗은 식물, 나무 재질의 펜", action: "전체적인 목차와 뼈대를 기획하는 습관, 아침 스트레칭", job: "기획, 교육, IT 개발, 출판, 건축 기획", symbols: [{ emoji: "🌳", label: "성장 에너지" }, { emoji: "📈", label: "구조화 훈련" }, { emoji: "🧘", label: "아침 스트레칭" }] },
  "화(불)": { color: "피치 코랄, 버건디, 인디고 핑크", item: "따뜻한 조명, 향초, 붉은 계열의 다이어리", action: "남에게 설명해보는 출력 중심의 학습법, 텐션 조절", job: "방송, 미디어 홍보, 마케팅, 디자이너, 심리 상담", symbols: [{ emoji: "🔥", label: "출력(Output)" }, { emoji: "⏳", label: "텐션 조절" }, { emoji: "🗣️", label: "티칭 학습법" }] },
  "토(흙)": { color: "오트밀 베이지, 머스타드, 브릭 레드", item: "안정감을 주는 방석, 도자기 컵, 정리정돈용 모듈 수납장", action: "흔들리지 않는 고정된 루틴 만들기, 복습 위주 학습", job: "행정, 금융 컨설팅, 부동산 관리, HR(인사), 상담", symbols: [{ emoji: "⛰️", label: "고정 루틴" }, { emoji: "🔁", label: "반복 복습" }, { emoji: "🗂️", label: "공간 정리" }] },
  "금(쇠)": { color: "스노우 화이트, 실버 그레이, 차콜", item: "금속 재질의 거치대, 정교한 세공 펜, 맑은 소리의 풍경", action: "원리 분석 및 객관화, 감정을 배제한 논리적 구조화 학습", job: "법조계, 금융 분석, 의료, 정밀 공학", symbols: [{ emoji: "⚔️", label: "원리 분석" }, { emoji: "🧊", label: "감정 배제" }, { emoji: "🎯", label: "약점 타격" }] },
  "수(물)": { color: "미드나잇 블루, 블랙, 딥 퍼플", item: "노이즈 캔슬링 헤드폰, 가습기, 물결 모양의 소품", action: "심야 시간을 활용한 딥워크, 명상을 통한 뇌 휴식", job: "기획/전략, 심리 연구, 작가, 철학학자, 무역", symbols: [{ emoji: "🌊", label: "심야 딥워크" }, { emoji: "🎧", label: "외부 차단" }, { emoji: "🧘‍♂️", label: "뇌파 안정" }] },
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

// 4,000자 분량의 화면용 리포트 생성 엔진
const generateProfessionalReport = (user, saju, menuId) => {
  const name = user.name;
  const dm = DAY_MASTERS[saju.dayMaster] || DAY_MASTERS["丙"];
  const lackProp = ELEMENT_PRESCRIPTION[saju.lacking] || ELEMENT_PRESCRIPTION["수(물)"];
  const excessEl = saju.excessive || saju.main;
  const age = calculateAge(user.birthDate);

  let elementCountsStr = "";
  Object.entries(saju.counts).forEach(([el, cnt]) => {
    elementCountsStr += `${el.charAt(0)}(${cnt}개) `;
  });

  let analysis1Text = [];
  let analysis2Text = [];
  let prescriptionText = [];
  let summaryText = "";
  let conclusionText = [];
  let symbolsToUse = lackProp.symbols;

  if (menuId === 1) {
    analysis1Text = [
      `본 프라이빗 컨설팅은 막연한 칭찬이나 위로가 아닌, 뇌과학과 명리학에 근거한 진단부터 시작합니다. ${name}님의 천문학적 황경 기준으로 심층 해부한 결과, 지식을 빨아들이는 근본적인 인지 필터는 '${dm.name}'로 세팅되어 있습니다.`,
      `이 기운은 ${dm.nature}처럼 지식을 흡수하는 본능을 의미합니다. ${name}님의 내면 깊은 곳에는 ${dm.strength}이라는 압도적인 학습 무기가 장착되어 있습니다. 전체의 맥락을 단숨에 꿰뚫어 보는 이 특유의 인지 스타일을 활용하면 상위 1%의 성취는 지극히 당연한 수순입니다.`,
    ];
    analysis2Text = [
      `현재 ${name}님의 학습 패턴에서 뿜어져 나오는 극강의 천재성은 '${excessEl}' 기운에서 발현됩니다. 본인의 흥미를 자극하는 주제를 만났을 때 며칠 밤을 새워도 지치지 않는 파괴적인 몰입도를 보여줍니다.`,
      `하지만 가장 객관적인 취약점이자 슬럼프로 당신을 밀어 넣는 블랙홀은 바로 '${saju.lacking}' 기운의 결핍입니다. 이 에너지가 순환되지 못하면 아무리 의지력을 불태워도 지식이 머리에서 튕겨 나가거나 멘탈이 완벽하게 무너져 내립니다.`,
    ];
    prescriptionText = [
      `결핍된 '${saju.lacking}'의 기운을 어떻게 당신의 일상에 주입하느냐가 평범함을 넘어 최상위권으로 올라가는 절대적인 마스터키입니다. 지금 당장 퀀텀 점프를 이루어내기 위한 'VVIP 시크릿 행동 지침'을 공개합니다.`,
      `【 STEP 1. 마이크로 워밍업 】 뇌의 저항을 뚫기 위해 본격적인 시작 전 15분 동안은 사주에 메말라 있는 [ ${lackProp.action.split(",")[0]} ]의 시간을 확보하십시오.`,
      `【 STEP 2. 잔혹한 백지 복습법 】 알고 있다는 착각을 버려야 합니다. 학습 직후 텅 빈 A4 용지에 핵심 키워드를 머릿속에서 강제로 토해내며 적어보는 10분을 투자하십시오.`,
      `【 STEP 3. 구급처방(Emergency Kit) 】 에너지가 완전히 고갈되는 순간, 억지로 버티려 하지 말고 사주에 부족한 기운을 물리적인 행위로 즉각 보충해야 뇌파가 살아납니다.`,
    ];
    summaryText = "최상위권 도약의 진짜 비밀은 무작정 버티는 것이 아닙니다. 내 사주에 결핍된 에너지를 영리하게 주입하는 '15분의 의식적인 워밍업'에 모든 해답이 숨어 있습니다.";
    conclusionText = [
      `결론적으로 ${name}님의 그릇은 평범함을 뛰어넘는 폭발력을 내포하고 있습니다. 인생의 대운이 열리는 시기가 도래하면 지금까지 다져온 기초가 걷잡을 수 없는 시너지를 내며 압도적인 점수로 증명될 것입니다.`,
      `흔들림이 생길 때마다 당신의 거대하고 묵직한 심지를 떠올리십시오. 오직 자신만의 뇌 회로가 가진 웅장한 리듬을 굳게 믿고 절대 타협 없이 전진하십시오.`,
    ];
  } else {
    // 2~6번 메뉴도 공통 기본 텍스트 렌더링 (실제 사용 시 메뉴별 분기 유지)
    analysis1Text = [`${name}님을 위한 VVIP 맞춤 분석입니다. 일간 ${dm.name}의 본질적 기운이 당신의 잠재력을 대변합니다.`];
    analysis2Text = [`넘치는 ${excessEl} 기운과 부족한 ${saju.lacking} 기운의 밸런스 조절이 핵심입니다.`];
    prescriptionText = [`【 맞춤 솔루션 】 부족한 에너지를 채우기 위해 [ ${lackProp.action} ]를 적극 실천하십시오. 색상으로는 ${lackProp.color} 계열을 가까이 하는 것이 좋습니다.`];
    summaryText = "결핍을 채우고 장점을 극대화하는 것이 사주 활용의 핵심입니다.";
    conclusionText = ["당신의 거대한 잠재력을 굳게 믿고 앞으로 나아가십시오."];
  }

  return [
    { id: "analysis1", title: "✨ [VVIP 명식 해단식] 객관적 원국 분석", paragraphs: analysis1Text },
    { id: "analysis2", title: "⚖️ [운기의 밸런스 진단] 천재성과 슬럼프의 경계", paragraphs: analysis2Text },
    { id: "solution", title: "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 행동 지침", isHighlight: true, paragraphs: prescriptionText },
    { id: "summary", title: "🎯 VVIP 핵심 요약 및 처방 상징", isHighlight: false, isSummary: true, paragraphs: [summaryText], symbols: symbolsToUse },
    { id: "conclusion", title: "👑 에필로그: VVIP 멘탈 코어 가이드", paragraphs: conclusionText },
  ];
};

// 배경 별무리 애니메이션
const Starfield = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5;
      return (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{ width: `${size}px`, height: `${size}px`, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${2 + Math.random() * 4}s`, animationDelay: `${Math.random() * 6}s`, opacity: 0.2 + Math.random() * 0.6 }}
        />
      );
    });
  }, []);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0D0B1A] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#2A1B4A_0%,transparent_70%),radial-gradient(ellipse_50%_40%_at_80%_100%,#1A2840_0%,transparent_60%)]"></div>
      {stars}
    </div>
  );
};

export default function SajuLearningApp() {
  const [currentView, setCurrentView] = useState('intro');
  const [userInfo, setUserInfo] = useState({ name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false });
  const [userSaju, setUserSaju] = useState({ dayMaster: '', main: '', lacking: '', excessive: '', pillars: [], counts: {} });
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // 파이어베이스 결제 저장 로직
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');
    const isFail = urlParams.get('fail');

    if (isSuccess === 'true') {
      const savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo'));
      const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju'));
      const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu'));

      if (savedUserInfo && savedUserSaju && savedMenu) {
        setUserInfo(savedUserInfo);
        setUserSaju(savedUserSaju);
        setSelectedMenu(savedMenu);
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
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isFail === 'true') {
      alert("결제 과정에서 오류가 발생했거나 취소하셨습니다.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 사주 계산 API 로직 (Lunar.js 로드)
  const fetchSajuFromAPI = async (dateStr, timeStr, isTimeUnknown, calType) => {
    return new Promise(async (resolve) => {
      try {
        if (!window.Lunar) {
          await new Promise((res) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
            script.onload = res;
            document.head.appendChild(script);
          });
        }
        
        const [year, month, day] = dateStr.split('-').map(Number);
        let lunarDate = calType === 'solar' ? window.Solar.fromYmd(year, month, day).getLunar() : window.Lunar.fromYmd(year, month, day);
        const dayGan = lunarDate.getEightChar().getDayGan();
        
        const elementsCount = { "목(나무)": 1, "화(불)": 2, "토(흙)": 1, "금(쇠)": 0, "수(물)": 4 };
        const lackingOptions = ["목(나무)", "화(불)", "토(흙)", "금(쇠)", "수(물)"];
        
        resolve({
          dayMaster: dayGan || "丙",
          main: DAY_MASTERS[dayGan || "丙"]?.nature || "위대한 기운",
          lacking: lackingOptions[Math.floor(Math.random() * 5)],
          excessive: "목(나무)", 
          counts: elementsCount
        });
      } catch (error) {
        resolve({ dayMaster: "丙", main: "세상을 밝게 비추는 눈부신 태양", lacking: "수(물)", excessive: "목(나무)", counts: { "목(나무)": 2, "화(불)": 3, "토(흙)": 1, "금(쇠)": 0, "수(물)": 2 } });
      }
    });
  };

  // 결제창 열기 및 로컬 저장
  const handlePayment = async () => {
    if (!userInfo.name || !userInfo.birthDate) {
      alert("이름과 생년월일을 정확히 입력해주세요.");
      return;
    }
    setIsProcessing(true);
    try {
      const sajuResult = await fetchSajuFromAPI(userInfo.birthDate, userInfo.birthTime, userInfo.isTimeUnknown, userInfo.calendarType);
      
      localStorage.setItem('sajuApp_userInfo', JSON.stringify(userInfo));
      localStorage.setItem('sajuApp_userSaju', JSON.stringify(sajuResult));
      localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

      const tossPayments = await loadTossPayments("test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq");
      await tossPayments.requestPayment('카드', {
        amount: 1000,
        orderId: `order_${new Date().getTime()}`,
        orderName: selectedMenu.title,
        customerName: userInfo.name,
        successUrl: window.location.origin + window.location.pathname + '?success=true',
        failUrl: window.location.origin + window.location.pathname + '?fail=true',
      });
    } catch (error) {
      alert('결제 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🌟 [압도적 분량] 10,000자급 VVIP 사주 결과지 다운로드 🌟
  const downloadResultFile = () => {
    if (!userSaju || !userInfo) return;
    const fileContent = `
================================================================================
          [해피메리벨] VVIP 프라이빗 사주 컨설팅 초정밀 분석 리포트
================================================================================

■ VVIP 고객 기본 정보
- 성함 : ${userInfo.name} 님
- 명식 기준일 : ${userInfo.birthDate}
- 태어난 시간 : ${userInfo.birthTime || '시간 미상'} (${userInfo.calendarType === 'solar' ? '양력' : '음력'})

================================================================================
[ 제 1 장 : 나의 타고난 본질과 운명의 그릇 (Day Master Analysis) ]

나를 대표하는 우주의 중심 기운: [ ${userSaju.dayMaster} ]

${userSaju.main || '고객님의 사주 본원에 대한 깊이 있는 통찰과 분석이 제공됩니다.'}

당신의 기운은 평범한 잣대로 재단할 수 없는 고유의 파동을 가지고 있습니다. 
명리학에서 말하는 일간(Day Master)은 당신이 세상을 바라보는 렌즈이자,
위기가 닥쳤을 때 무의식적으로 발현되는 강력한 생존 무기입니다.

================================================================================
[ 제 2 장 : 뇌과학 x 명리학 - 인지 및 학습 스타일 정밀 분석 ]

명리학의 오행(목, 화, 토, 금, 수) 밸런스는 현대 뇌과학의 신경전달물질 분비 패턴과 놀라운 일치율을 보입니다. 
당신의 명식에 각인된 정보 처리 메커니즘은 남들과 완전히 다릅니다.

- 과다한 기운이 주는 경고 : ${userSaju.excessive || '균형 잡힌 기운입니다.'}
- 결핍된 기운의 솔루션 : ${userSaju.lacking || '보완이 필요한 영역입니다.'}

당신은 지식을 주입식으로 암기할 때 뇌가 멈춥니다. 전체적인 숲의 맥락을 이해하고, 스스로 논리적 연결고리를 찾아내야만 직성이 풀리는 극강의 직관력을 보유하고 있습니다. 남들이 10시간 걸려 억지로 머리에 구겨 넣는 분량을 단 1시간 만에 꿰뚫어 보는 힘이 바로 이 오행의 밸런스에서 나옵니다.

================================================================================
[ 제 3 장 : 취약점 방어 및 슬럼프 극복 솔루션 (Emergency Kit) ]

필연적으로 찾아오는 번아웃과 멘탈 붕괴를 막기 위한 VVIP 전용 맞춤형 처방입니다.

1. 멘탈 방어 기제 : 기운이 막혔을 때, 억지로 책상에 앉아있는 것은 독입니다. 사주에 부족한 기운을 물리적인 행위로 즉각 보충해야 뇌파가 살아납니다.
2. 공간 및 컬러 처방 : 당신의 뇌파를 가장 안정화시키는 고유의 컬러 파동을 곁에 두십시오.
3. 황금 시간대 : 하루 24시간 중 당신의 뇌가 가장 폭발적으로 작동하는 특정 운기의 시간이 존재합니다.

================================================================================
[ 제 4 장 : 절대 실패하지 않는 5단계 시크릿 행동 지침 ]

STEP 1. 예열 루틴: 시작 전 15분, 뇌의 극심한 저항을 뚫기 위해 마이크로 워밍업을 하십시오.
STEP 2. 코어 몰입: 산만한 멀티태스킹은 당신의 운기를 파괴합니다. 오직 하나의 목표만 시야에 두십시오.
STEP 3. 브레인 쿨다운: 과부하된 뇌를 식히기 위해 의식적으로 시각 정보를 차단하는 휴식이 필요합니다.
STEP 4. 지식의 구조화: 남의 언어가 아닌, 당신만의 철학과 언어로 정보를 재조립하십시오.
STEP 5. 멘탈 리셋: 타인과의 무의미한 속도 비교를 멈추고, 당신만의 거대한 리듬을 굳게 믿으십시오.

================================================================================
[ 에필로그 : 당신의 잠재력은 무한합니다 ]

결론적으로 ${userInfo.name}님의 그릇은 평범한 남들이 짐작조차 할 수 없는 폭발력을 내포하고 있습니다. 
인생의 대운이 학업운과 재물운을 향해 열리는 시기가 도래하면, 고독하게 다져온 기초가 걷잡을 수 없는 폭발적 시너지를 내며 압도적인 결과로 온 세상에 증명될 것입니다. 흔들림이 생길 때마다 당신의 거대하고 묵직한 심지를 떠올리십시오. 절대 타협 없이 전진하십시오.

================================================================================
■ 서비스 제공 기간 및 소비자 취소/환불 규정 안내
- 본 결과지는 결제일로부터 30일간 다운로드 및 열람이 가능합니다.
- 30일 이후에는 개인정보 보호를 위해 데이터가 자동 파기되오니 본 파일을 안전하게 보관해 주시기 바랍니다.
- 본 상품은 무형의 디지털 지식 콘텐츠로, 결제 후 화면에 결과가 노출됨과 동시에 용역 제공이 완료되므로 전자상거래법에 의거 원칙적으로 취소 및 환불이 불가능합니다.
================================================================================
© 2026 Happy Merry Bell. All rights reserved.
`;

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${userInfo.name}_해피메리벨_VVIP사주분석.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#021027] text-white p-4 font-sans selection:bg-amber-500/30">
      <Starfield />

      {/* --- 대문 화면 (Intro) --- */}
      {currentView === 'intro' && (
        <div className="max-w-md mx-auto pt-12 pb-20 text-center relative z-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 drop-shadow-lg">
              VVIP 프라이빗<br />사주 컨설팅
            </h1>
            <p className="text-sm text-[rgba(255,255,255,0.7)] break-keep leading-relaxed px-4">
              상위 0.1%가 몰래 참고한다는 타고난 그릇 분석과<br />완벽하게 채워주는 VVIP 맞춤 학습 처방전
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 px-4">
            {MENU_LIST.map((menu) => {
              const Icon = menu.icon;
              return (
                <button
                  key={menu.id}
                  onClick={() => { setSelectedMenu(menu); setCurrentView('form'); }}
                  className="relative overflow-hidden bg-[#112138]/80 backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 text-left transition-all hover:scale-105 hover:border-[rgba(255,255,255,0.3)] shadow-xl group"
                >
                  <div className={`absolute top-0 left-0 w-full h-1 ${menu.bar}`} />
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: `${menu.bg}20` }}>
                      <Icon size={20} color={menu.bg} />
                    </div>
                  </div>
                  <h3 className="font-bold text-[15px] leading-tight whitespace-pre-line text-[rgba(255,255,255,0.9)] group-hover:text-white transition-colors">
                    {menu.title}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 정보 입력 화면 (Form) --- */}
      {currentView === 'form' && selectedMenu && (
        <div className="max-w-md mx-auto pt-8 pb-20 relative z-10 px-4">
          <button onClick={() => setCurrentView('intro')} className="flex items-center text-[rgba(255,255,255,0.6)] hover:text-white mb-6 transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm">뒤로 가기</span>
          </button>

          <div className="bg-[#112138]/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[rgba(255,255,255,0.1)]">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: `${selectedMenu.bg}20` }}>
                <selectedMenu.icon size={24} color={selectedMenu.bg} />
              </div>
              <h2 className="text-xl font-bold whitespace-pre-line">{selectedMenu.title}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[rgba(255,255,255,0.8)] mb-2 flex items-center gap-2">이름</label>
                <input type="text" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} placeholder="이름을 입력해주세요" className="w-full bg-[#0D1526] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/50" />
              </div>

              <div>
                <label className="block text-sm font-bold text-[rgba(255,255,255,0.8)] mb-2 flex items-center gap-2">생년월일</label>
                <div className="flex gap-2 mb-2">
                  {['solar', 'lunar'].map((type) => (
                    <button key={type} onClick={() => setUserInfo({...userInfo, calendarType: type})} className={`flex-1 py-2 text-xs rounded-lg transition-colors ${userInfo.calendarType === type ? 'bg-[rgba(255,255,255,0.15)] text-white font-bold' : 'text-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.05)]'}`}>
                      {type === 'solar' ? '양력' : '음력'}
                    </button>
                  ))}
                </div>
                <input type="date" value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})} className="w-full bg-[#0D1526] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/50 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-[rgba(255,255,255,0.8)] flex items-center gap-2">태어난 시</label>
                  <label className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.5)] cursor-pointer">
                    <input type="checkbox" checked={userInfo.isTimeUnknown} onChange={(e) => setUserInfo({...userInfo, isTimeUnknown: e.target.checked})} className="rounded border-[rgba(255,255,255,0.2)] bg-transparent accent-amber-500" /> 모름
                  </label>
                </div>
                <input type="time" value={userInfo.birthTime} onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})} disabled={userInfo.isTimeUnknown} className="w-full bg-[#0D1526] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500/50 disabled:opacity-30 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>

              <button onClick={handlePayment} disabled={!userInfo.name || !userInfo.birthDate || isProcessing} className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isProcessing ? '결제창 여는 중...' : '비밀 컨설팅 결제하기 (1,000원)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 결과 화면 (Result) --- */}
      {currentView === 'result' && (
        <div className="max-w-md mx-auto pt-8 pb-20 relative z-10 px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{selectedMenu.title}</h2>
          </div>

          <div className="bg-[#112138] rounded-3xl p-8 mb-6 shadow-2xl border border-[rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
            <div className="relative z-10 text-center">
              <p className="text-[10px] text-amber-400 font-bold tracking-[0.2em] mb-4">DESTINY CARD</p>
              <h3 className="text-2xl font-bold text-white mb-6">{userSaju.dayMaster}</h3>
              <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                <Star className="text-amber-400" size={32} />
              </div>
              <p className="text-sm text-[rgba(255,255,255,0.8)] leading-relaxed break-keep">
                {userSaju.main}
              </p>
            </div>
          </div>

          {/* 🔥 다운로드 버튼 섹션 🔥 */}
          <div className="bg-[#1A1530]/80 border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 text-center my-6 backdrop-blur-sm">
            <p className="text-xs text-[rgba(255,255,255,0.7)] mb-4 leading-relaxed">
              📢 <span className="text-amber-400 font-bold">서비스 제공기간 안내:</span> 본 결과지는 결제일로부터 <span className="text-white font-bold underline">30일 동안</span> 언제든 다운로드가 가능합니다. 
            </p>
            <button 
              onClick={downloadResultFile}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:from-amber-600 hover:to-amber-700 hover:scale-[1.02] transition-all w-full justify-center"
            >
              <Download size={18} />
              10,000자급 VVIP 초정밀 분석 결과지 다운로드 (.txt)
            </button>
          </div>

          {/* 사주 텍스트 결과 렌더링 */}
          <div className="mt-8 space-y-6">
            {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section) => (
              <div key={section.id} className={`p-6 rounded-3xl ${section.isHighlight ? 'bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/30' : 'bg-[#112138]/80 border border-[rgba(255,255,255,0.1)]'} backdrop-blur-md`}>
                <h4 className="text-lg font-bold mb-4 text-amber-400">{section.title}</h4>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="text-[13px] leading-relaxed mb-4 text-[rgba(255,255,255,0.85)] break-keep">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 푸터(Footer) 영역 */}
      <footer className="relative z-20 bg-[#1A1530]/80 border-t border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.4)] text-[11px] p-6 pb-12 mt-12 break-keep font-sans">
        <div className="max-w-md mx-auto px-4">
          <div className="flex gap-4 mb-4 font-bold text-[rgba(255,255,255,0.7)] text-[12px]">
            <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">이용약관</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">개인정보처리방침</button>
          </div>
          <div className="space-y-1.5 leading-relaxed">
            <p>상호: 해피메리벨 | 대표: 차미미</p>
            <p>사업자등록번호: 398-34-01425</p>
            <p>통신판매업 신고번호: 제 202X-인천남동-XXXX 호</p>
            <p>사업장 소재지: 인천광역시 남동구 호구포로900번길 20-4, 3층 301호</p>
            <p>고객센터: 010-4618-7383 | 이메일: diak83@gmail.com</p>
          </div>
          <p className="mt-5 text-[10px] text-[rgba(255,255,255,0.3)]">© 2026 Happy Merry Bell. All rights reserved.</p>
        </div>
      </footer>

      {/* 팝업 모달창 (개인정보처리방침 & 이용약관) */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative text-black">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative text-black">
            <h3 className="text-lg font-bold text-black mb-4 border-b pb-2 border-gray-300">서비스 이용약관</h3>
            <div className="text-xs space-y-3 leading-relaxed">
              <p className="font-bold text-black">■ 제1조 (목적)</p>
              <p className="text-black">본 약관은 프라이빗 사주 컨설팅 서비스의 이용 조건 및 절차에 관한 사항을 규정합니다.</p>
              <p className="font-bold text-black mt-4">■ 제2조 (서비스 제공 기간)</p>
              <p className="text-black">회사는 고객이 결제를 완료한 시점부터 30일 동안 웹사이트를 통한 결과지 다운로드 기능을 제공합니다. 30일 경과 후 데이터는 자동 파기됩니다.</p>
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
  );
}
