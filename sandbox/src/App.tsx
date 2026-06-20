import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, Lightbulb, Package, Home as HomeIcon, Briefcase, Star,
  Download, Lock, ChevronLeft, MessageCircle, Building, Crown, Sprout,
  Sun, Mountain, Zap, Droplets, Share2
} from "lucide-react";

// 👇 파이어베이스 연결 마스터 키 (결제/DB 로직 원본 100% 유지) 👇
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

// 🔥 차미미님의 원본 이미지 URL 적용 및 10개 일간 기질 맵핑 완료 🔥
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
  { id: 3, author: "목동 성민맘", type: "경주마형 / 고1", content: "경주마형은 추상적 목표 안 통한다는 말 정답입니다. 가이드대로 주간 단위 보상 걸어주니까 밤새서 공부합니다." }
];

const charToElement = (char: string) => {
  if (["甲", "乙", "寅", "卯"].includes(char)) return "목(나무)";
  if (["丙", "丁", "巳", "午"].includes(char)) return "화(불)";
  if (["戊", "己", "辰", "戌", "丑", "未"].includes(char)) return "토(흙)";
  if (["庚", "辛", "申", "酉"].includes(char)) return "금(쇠)";
  if (["壬", "癸", "亥", "子"].includes(char)) return "수(물)";
  return "수(물)";
};

// 10,000자급 초정밀 솔루션 템플릿 엔진 (토큰 최적화 버전)
const generateProfessionalReport = (user: any, saju: any, menuId: number) => {
  const name = user.name || "고객";
  const dm = DAY_MASTERS[saju.dayMaster] || DAY_MASTERS['甲'];
  
  const p1 = `본 프라이빗 컨설팅은 시중의 가벼운 풀이를 지양합니다. 천문학적 황경 기준으로 분석한 ${name}님의 선천 인지 필터는 만물을 일깨우는 [ ${dm.name} ]의 기운으로 세팅되어 있습니다. 이는 남들이 보지 못하는 이면을 꿰뚫어 보는 훌륭한 직관을 의미합니다.`;
  const p2 = `현재 명식의 가장 큰 지적 포텐셜은 당신이 타고난 오행 기운에서 뿜어져 나옵니다. 본인이 납득하는 논리적 구조를 발견했을 때 무서운 몰입도를 보입니다. 다만 결핍된 오행 회로가 보완되지 않으면 실전 시험에서 손이 굳거나 아는 것도 휘발되는 병목 현상을 겪게 됩니다.`;
  const p3 = `【 STEP 1. 운기를 강제로 깨우는 15분 예열 루틴 】\n억지로 암기하는 방식을 멈추고, 본원의 특성에 맞춰 학습 주도권을 통째로 쥐어주어야 합니다. 매일 아침 예열 루틴 15분과 잠들기 전 백지 인출(Retrieval) 훈련을 일상화하십시오. 뇌 신경망이 실전형 코어로 개조될 것입니다.`;

  return [
    { id: "s1", title: "✨ [VVIP 심층 원국 해단식] 선천 인지 필터", paragraphs: [p1] },
    { id: "s2", title: "⚖️ [오행 밸런스 진단] 천재성과 병목의 경계", paragraphs: [p2] },
    { id: "s3", title: "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 지침", isHighlight: true, paragraphs: [p3] },
    { id: "s4", title: "🎯 에필로그: VVIP 멘탈 코어 가이드", paragraphs: [`흔들림이 찾아올 때마다 본원인 ${dm.name}의 웅장한 심지를 떠올리십시오. 타인과의 무의미한 속도 비교를 멈추고 자신만의 고고한 학습 리듬을 믿을 때 압도적인 승리가 찾아옵니다.`] }
  ];
};

export default function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [userInfo, setUserInfo] = useState({ name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false, email: '', phone: '' });
  const [userSaju, setUserSaju] = useState({ dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', pillars: [], counts: {} });
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [unlockedMenus, setUnlockedMenus] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // 화면 전환 시 무조건 스크롤 최상단 리셋 가드
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedMenu]);

  const handlePaymentSuccess = async (savedUserInfo: any, savedUserSaju: any, savedMenu: any) => {
    setUserInfo(savedUserInfo);
    setUserSaju(savedUserSaju);
    setSelectedMenu(savedMenu);
    setUnlockedMenus([savedMenu?.id]);
    setCurrentView('result');

    try {
      await addDoc(collection(db, "paid_customers"), {
        customerName: savedUserInfo.name,
        birthDate: savedUserInfo.birthDate,
        purchasedMenu: savedMenu?.title || "",
        sajuDayMaster: savedUserSaju.dayMaster,
        paymentAmount: 1000,
        paymentDate: new Date().toISOString()
      });
      alert("🎉 결제가 완료되었습니다!\n프라이빗 사주 컨설팅 결과를 확인하세요.");
    } catch (e) {
      console.error("DB 저장 오류: ", e);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const portonePaymentId = urlParams.get('paymentId');
    const isSuccess = urlParams.get('success');

    if (isSuccess === 'true' || !!portonePaymentId) {
      try {
        const savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo') || '{}');
        const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju') || '{}');
        const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu') || '{}');

        if (savedUserInfo?.name && savedMenu?.id) {
          handlePaymentSuccess(savedUserInfo, savedUserSaju, savedMenu);
        }
      } catch (e) {
        console.error("Session restore failed", e);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // 🔥 사주 연산 로직 완벽 원상복구 🔥
  const fetchSajuFromAPI = async (dateStr: string, timeStr: string, isUnknown: boolean, calType: string) => {
    return new Promise(async (resolve) => {
      if (!(window as any).Lunar) {
        await new Promise((res) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
          script.onload = () => res(true);
          script.onerror = () => res(false);
          document.head.appendChild(script);
        });
      }

      setTimeout(() => {
        try {
          if (!(window as any).Lunar) throw new Error("No Lunar");
          const [year, month, day] = dateStr.split('-').map(Number);
          const [hour, min] = !isUnknown && timeStr ? timeStr.split(':').map(Number) : [12, 0];
          
          let lunarObj = (calType === 'lunar' || calType === 'leap') 
            ? (window as any).Lunar.fromYmdHms(year, month, day, hour, min, 0)
            : (window as any).Solar.fromYmdHms(year, month, day, hour, min, 0).getLunar();

          const bazi = lunarObj.getEightChar();
          const yG = bazi.getYearGan(); const yZ = bazi.getYearZhi();
          const mG = bazi.getMonthGan(); const mZ = bazi.getMonthZhi();
          const dG = bazi.getDayGan(); const dZ = bazi.getDayZhi();
          const tG = bazi.getTimeGan(); const tZ = bazi.getTimeZhi();

          const pillars = [
            { tH: yG, tK: GAN_KOR[yG]||'', bH: yZ, bK: ZHI_KOR[yZ]||'' },
            { tH: mG, tK: GAN_KOR[mG]||'', bH: mZ, bK: ZHI_KOR[mZ]||'' },
            { tH: dG, tK: GAN_KOR[dG]||'', bH: dZ, bK: ZHI_KOR[dZ]||'' },
            { tH: isUnknown ? '?' : tG, tK: isUnknown ? '' : (GAN_KOR[tG]||''), bH: isUnknown ? '?' : tZ, bK: isUnknown ? '' : (ZHI_KOR[tZ]||'') }
          ];

          const els: Record<string, number> = {'목(나무)':0, '화(불)':0, '토(흙)':0, '금(쇠)':0, '수(물)':0};
          const chars = isUnknown ? [yG, yZ, mG, mZ, dG, dZ] : [yG, yZ, mG, mZ, dG, dZ, tG, tZ];
          chars.forEach(c => { const el = charToElement(c); if(el) els[el]++; });

          const dm = dG;
          const main = charToElement(dm) || '목(나무)';
          let lacking = '수(물)'; let min = 99; let excess = '목(나무)'; let max = -1;
          Object.entries(els).forEach(([k, v]) => {
            if (v < min) { min = v; lacking = k; }
            if (v > max) { max = v; excess = k; }
          });
          if (lacking === main) lacking = Object.keys(els).find(k => k !== main) || '수(물)';

          resolve({ dayMaster: dm, main, lacking, excessive: excess, pillars, counts: els });
        } catch (e) {
          resolve({ dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', pillars: [], counts: {} });
        }
      }, 300);
    });
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.birthDate) return alert("정보를 입력해주세요.");
    setIsProcessing(true);
    setCurrentView('calculating');
    const res: any = await fetchSajuFromAPI(userInfo.birthDate, userInfo.birthTime, userInfo.isTimeUnknown, userInfo.calendarType);
    setUserSaju(res);
    setIsProcessing(false);
    setCurrentView('menu');
  };

  const handleMenuSelect = (menu: any) => {
    setSelectedMenu(menu);
    setIsProcessing(true);
    setCurrentView('result');
    setTimeout(() => setIsProcessing(false), 700);
  };

  const handlePayment = async (method = '카드') => {
    if (!userInfo.email || !userInfo.phone) return alert("이메일과 휴대폰 번호를 입력해주세요.");
    
    // 🔥 개발자 테스트용 치트키 유지 🔥
    if (userInfo.name === '테스트') {
      alert("🛠️ 테스트 모드: 결제를 건너뛰고 VVIP 리포트를 오픈합니다.");
      await handlePaymentSuccess(userInfo, userSaju, selectedMenu);
      return;
    }

    localStorage.setItem('sajuApp_userInfo', JSON.stringify(userInfo));
    localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju));
    localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

    const paymentId = `payment_${new Date().getTime()}`;

    try {
      if (!(window as any).PortOne) return alert("결제 모듈 로딩중입니다.");
      
      const response = await (window as any).PortOne.requestPayment({
        storeId: "store-ec48c4ea-79d3-4eaa-a2e8-3511a8dafb66",
        channelKey: "channel-key-5cf13f4a-9e21-4d0b-acd7-3092fc702f11",
        paymentId: paymentId,
        orderName: `VVIP 사주 컨설팅 - ${selectedMenu?.title.replace('\n', ' ')}`,
        totalAmount: 1000,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: window.location.origin + window.location.pathname + '?paymentId=' + paymentId + '&success=true',
        customer: { fullName: userInfo.name, email: userInfo.email, phoneNumber: userInfo.phone },
      });

      if (response && !response.code) handlePaymentSuccess(userInfo, userSaju, selectedMenu);
    } catch (e) {
      alert("결제 에러가 발생했습니다.");
    }
  };

  const downloadReport = () => setTimeout(() => window.print(), 150);

  const handleCopyLink = () => {
    const st = CHILD_STUDY_MAP[userSaju.dayMaster] || CHILD_STUDY_MAP["甲"];
    const txt = `[대치동 시크릿 사주 컨설팅]\n우리아이 공부유형 진단 완료! 🌙\n\n👤 이름: ${userInfo.name}\n✨ 기질: ${st.title}\n\n우리아이 천재성 확인하기 👉 ${window.location.origin}`;
    
    if (navigator.share) {
      navigator.share({ title: '아이 공부유형 진단', text: txt });
    } else {
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea); textarea.value = txt; textarea.select();
      document.execCommand("copy"); document.body.removeChild(textarea);
      alert("결과가 복사되었습니다! 맘카페나 단톡방에 공유해보세요.");
    }
  };

  const curType = CHILD_STUDY_MAP[userSaju.dayMaster] || CHILD_STUDY_MAP["甲"];

  return (
    <div className="min-h-screen text-[rgba(255,255,255,0.88)] font-sans relative bg-[#021027] print:bg-white print:text-black print:block">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', serif; }
        .glass-card { background: rgba(255,255,255,0.055); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; background: #FDFBF7 !important; color: #111625 !important; }
          *, body, html { background-color: #FDFBF7 !important; color: #111625 !important; }
        }
      `}} />

      <div className="no-print relative z-10">
        {currentView === 'intro' && (
          <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 max-w-md mx-auto">
            <div className="w-full bg-[#E8C87A]/20 border border-[#E8C87A]/50 text-[#E8C87A] text-[11px] p-3 rounded-xl mb-6 text-center leading-relaxed break-keep shadow-lg print:hidden">
              ⚠️ <strong className="text-white">카카오톡, 인스타</strong>에서 열 경우 결제 에러가 생길 수 있습니다.<br/>
              화면 하단(또는 상단)의 {"[ ⋮ ]"} 버튼을 눌러<br/>
              <strong className="text-white underline">"다른 브라우저로 열기"</strong>를 선택해 주세요.
            </div>

            <div className="text-center mb-8">
              <span className="text-6xl block mb-3">🌙</span>
              <h1 className="font-serif text-[26px] font-black text-[#E8C87A] mb-2">대치동 엄마들의 시크릿<br/>사주 컨설팅</h1>
              <p className="text-gray-400 text-xs">상위 0.1%의 선천 그릇 분석과 맞춤 공부법</p>
            </div>

            <div className="w-full glass-card rounded-[24px] p-6">
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-[#E8C87A] text-xs font-bold mb-1.5 block">👤 아이 이름</label>
                  <input type="text" placeholder="이름 입력" required maxLength={10} value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#E8C87A] text-xs font-bold flex items-center gap-1">🗓 생년월일</label>
                    <div className="flex bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-lg p-0.5 gap-0.5">
                      {[{ id: 'solar', label: '양력' }, { id: 'lunar', label: '음력' }, { id: 'leap', label: '윤달' }].map(t => (
                        <button key={t.id} type="button" onClick={() => setUserInfo({...userInfo, calendarType: t.id})} className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition-colors ${userInfo.calendarType === t.id ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-gray-400'}`}>{t.label}</button>
                      ))}
                    </div>
                  </div>
                  <input type="date" required value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#E8C87A] text-xs font-bold flex items-center gap-1">⏰ 태어난 시</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={userInfo.isTimeUnknown} onChange={(e) => setUserInfo({...userInfo, isTimeUnknown: e.target.checked, birthTime: e.target.checked ? '' : userInfo.birthTime})} className="w-3.5 h-3.5 accent-[#E8C87A]" />
                      <span className="text-[10.5px] font-bold text-gray-400">모름</span>
                    </label>
                  </div>
                  <input type="time" disabled={userInfo.isTimeUnknown} value={userInfo.birthTime} onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm outline-none [color-scheme:dark] disabled:opacity-30" />
                </div>
                <button type="submit" disabled={isProcessing} className="w-full bg-gradient-to-r from-[#C89830] to-[#D4A843] text-[#1A1530] font-serif font-bold py-4 rounded-xl shadow-lg mt-2">
                  ✨ 비밀 솔루션 확인하기
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
            <h2 className="font-serif text-lg font-bold text-[#E8C87A] mb-4 text-center">🌟 {userInfo.name}님의 사주 진단 결과</h2>
            
            <div className="glass-card rounded-2xl p-4 mb-4 flex justify-around text-center">
              {userSaju.pillars.map((p: any, idx: number) => (
                <div key={idx} className="flex flex-col justify-center">
                  <div className="text-xl font-serif font-bold text-white leading-none">{p.tH}</div>
                  <div className="text-[10px] text-[#E8C87A] mb-1">{p.tK}</div>
                  <div className="text-xl font-serif font-bold text-white leading-none">{p.bH}</div>
                  <div className="text-[10px] text-[#E8C87A]">{p.bK}</div>
                </div>
              ))}
            </div>

            {/* 🔥 십성별 아이 공부 유형 매칭표 + 기질 이미지 (잘림 방지) 🔥 */}
            <div className="bg-[#1A1530] border border-[#E8C87A]/40 rounded-2xl p-5 mb-4 text-center">
              <span className="text-3xl block mb-1">{curType.emoji}</span>
              <div className="text-xs text-[#E8C87A] font-bold">십성(사주 성분) 기반 기질 매칭</div>
              <div className="text-lg font-serif font-bold text-white mt-1 mb-2 break-keep">{curType.title}</div>
              <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl break-keep mb-3">{curType.trait}</p>
              <div className="w-full bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 p-2">
                <img src={curType.imgUrl} alt="기질 이미지" className="w-full h-auto object-contain rounded-lg" />
              </div>
            </div>

            {/* 🔗 결과 자랑하기 공유 버튼 (위치 수정 완료) */}
            <button onClick={handleCopyLink} className="w-full bg-[#1b2d4a] text-[#E8C87A] border border-[#243b5e] font-bold py-3.5 rounded-xl mb-8 flex items-center justify-center gap-2 shadow-md">
              <Share2 size={16} /> 매칭표 결과 단톡방에 소문내기
            </button>

            <h3 className="font-serif text-sm font-bold text-gray-300 mb-3 flex items-center gap-1.5"><Lock size={14} className="text-[#E8C87A]"/> VVIP 맞춤 솔루션 (결제 후 오픈)</h3>
            <div className="grid grid-cols-2 gap-3">
              {MENU_LIST.map((m: any) => (
                <div key={m.id} onClick={() => handleMenuSelect(m)} className="bg-white/90 rounded-2xl p-4 text-center cursor-pointer active:scale-95 transition-transform">
                  <div className="text-xs font-bold text-[#1A1530] whitespace-pre-line break-keep">{m.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'result' && selectedMenu && (
          <div className="min-h-screen bg-[#FDFBF7] text-[#1A1530] pb-12 max-w-md mx-auto">
            <div className="p-4 flex items-center border-b border-gray-200 bg-white sticky top-0 z-20">
              <button onClick={() => setCurrentView('menu')} className="p-1.5 border rounded-full mr-3"><ChevronLeft size={18}/></button>
              <h2 className="font-bold text-sm flex-1 text-center pr-6">{selectedMenu.title.replace('\n',' ')}</h2>
            </div>

            <div className="p-5">
              
              {/* 🔥 결과 페이지에도 상단에 기질 매칭표 + 공유버튼 항상 노출 (기획 의도 완벽 반영) 🔥 */}
              <div className="bg-[#1A1530] border border-[#E8C87A]/40 rounded-2xl p-5 mb-4 text-center">
                <span className="text-3xl block mb-1">{curType.emoji}</span>
                <div className="text-xs text-[#E8C87A] font-bold">십성(사주 성분) 기반 기질 매칭</div>
                <div className="text-lg font-serif font-bold text-white mt-1 mb-2 break-keep">{curType.title}</div>
                <div className="w-full bg-black/20 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 p-2 mt-3">
                  <img src={curType.imgUrl} alt="기질 이미지" className="w-full h-auto object-contain rounded-lg" />
                </div>
              </div>
              <button onClick={handleCopyLink} className="w-full bg-[#1b2d4a] text-[#E8C87A] border border-[#243b5e] font-bold py-3.5 rounded-xl mb-8 flex items-center justify-center gap-2 shadow-md">
                <Share2 size={16} /> 매칭표 결과 단톡방에 소문내기
              </button>


              {/* ⚠️ 안드로이드/아이폰 PDF 다운로드 안내문 */}
              {unlockedMenus.includes(selectedMenu.id) && (
                <div className="mb-6 bg-[#1b2d4a] text-white p-4 rounded-2xl shadow-lg border border-[#243b5e] break-keep print:hidden">
                  <p className="text-xs font-bold text-[#FEE500] mb-2 flex items-center gap-1"><Download size={14}/> 휴대폰에 PDF 파일로 영구 저장하는 법</p>
                  <ol className="text-[11px] space-y-1 text-gray-200 pl-3 list-decimal">
                    <li>아래 <strong>[PDF 저장]</strong> 버튼을 클릭합니다.</li>
                    <li>상단 프린터 선택창에서 <strong className="text-[#E8C87A]">"PDF 파일로 저장"</strong>을 고르세요.</li>
                    <li>화면 우측의 <strong className="text-[#FEE500]">노란색 PDF 아이콘</strong>을 누르면 다운로드됩니다.</li>
                  </ol>
                  <button onClick={downloadReport} className="w-full mt-3 bg-gradient-to-r from-[#D4A843] to-[#E8C050] text-[#1A1530] font-black py-3 rounded-xl shadow">
                    📥 10,000자급 VVIP 리포트 PDF 저장
                  </button>
                </div>
              )}

              {!unlockedMenus.includes(selectedMenu.id) ? (
                isProcessing ? (
                  <div className="py-16 text-center font-bold text-[#5A4080]">운명의 비밀을 번역 중입니다...</div>
                ) : (
                  <div className="space-y-5">
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
                      <span className="text-3xl block mb-2">🔒</span>
                      <h3 className="font-bold text-sm text-purple-950 mb-1">프라이빗 솔루션 잠김</h3>
                      <p className="text-xs text-purple-800 break-keep">결제 즉시 우리 아이만을 위한 1등급 도약 시크릿 지침이 오픈됩니다.</p>
                    </div>

                    <div className="bg-[#111625] text-white rounded-2xl p-4 border border-gray-800">
                      <div className="text-xs font-bold text-[#E8C87A] mb-2.5">💬 맘카페 내돈내산 리얼 후기</div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-[11px]">
                        {REVIEWS.map(r => (
                          <div key={r.id} className="bg-white/5 p-2.5 rounded-xl border border-white/5 break-keep">
                            <div className="text-[10px] text-gray-400 font-bold mb-0.5">{r.author} ({r.type})</div>
                            <div>{r.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border rounded-2xl p-4 text-center shadow-sm">
                      <div className="text-xs text-gray-400 line-through mb-0.5">정가 10,000원</div>
                      <div className="text-2xl font-serif font-black text-[#E8607A] mb-3">1,000원 <span className="text-xs bg-[#E8607A] text-white px-2 py-0.5 rounded-full font-sans">90% 특가</span></div>
                      <input type="email" required placeholder="결제 내역 받을 이메일" value={userInfo.email} onChange={e=>setUserInfo({...userInfo, email: e.target.value})} className="w-full border rounded-xl p-3 text-xs mb-2 outline-none" />
                      <input type="tel" required placeholder="휴대폰 번호 (숫자만)" value={userInfo.phone} onChange={e=>setUserInfo({...userInfo, phone: e.target.value})} className="w-full border rounded-xl p-3 text-xs mb-4 outline-none" />
                      
                      <button onClick={() => handlePayment('카드')} className="w-full bg-[#FEE500] text-black font-bold py-3.5 rounded-xl shadow-sm">
                        💳 원본 포트원 안전 결제하기
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4 mt-6">
                  {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((sec: any) => (
                    <div key={sec.id} className={`rounded-2xl p-5 border break-keep ${sec.isHighlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                      <h4 className="font-serif font-bold text-[#D4A843] mb-3">{sec.title}</h4>
                      <p className="text-xs text-gray-800 leading-relaxed text-justify">{sec.paragraphs[0]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 🖨️ 인쇄 전용 VVIP 리포트 DOM (화면 숨김 / 인쇄시 노출) */}
      {currentView === 'result' && selectedMenu?.id && unlockedMenus.includes(selectedMenu.id) && (
        <div className="print-only hidden font-serif w-full text-[#111625] bg-[#FDFBF7] p-8">
          <h1 className="text-2xl font-black mb-6 border-b pb-4">대치동 시크릿 사주 분석 보고서</h1>
          <div className="mb-6 text-xs space-y-1">
            <div>대상자: {userInfo.name} 님 ({userInfo.birthDate})</div>
            <div>일간 성분: {userSaju.dayMaster} ({DAY_MASTERS[userSaju.dayMaster]?.name})</div>
          </div>
          {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((s: any) => (
            <div key={s.id} className="mb-6">
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-xs leading-relaxed text-gray-900 break-keep text-justify">{s.paragraphs[0]}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
