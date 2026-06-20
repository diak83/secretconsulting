import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, Lightbulb, Package, Home as HomeIcon, Briefcase, Star,
  Download, Lock, ChevronLeft, MessageCircle, Building, Crown, Sprout,
  Sun, Mountain, Zap, Droplets, Share2, Copy
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

const ELEMENT_PRESCRIPTION: Record<string, any> = {
  "목(나무)": { color: "딥 그린, 터콰이즈, 차분한 우드톤", item: "원목 소재의 가구, 곧게 뻗은 식물(스투키, 개운죽), 나무 재질의 만년필", action: "무언가를 배우기 전 전체적인 목차와 뼈대를 기획하는 습관, 아침 스트레칭", job: "기획, 교육, IT 개발, 출판, 건축 기획", symbols: [{ emoji: "🌳", label: "성장 에너지" }, { emoji: "📈", label: "구조화 훈련" }, { emoji: "🧘", label: "아침 스트레칭" }] },
  "화(불)": { color: "피치 코랄, 버건디, 인디고 핑크", item: "밝기 조절이 가능한 따뜻한 조명, 향초, 붉은 계열의 다이어리나 태블릿 케이스", action: "배운 것을 남에게 설명해보는 출력(Output) 중심의 학습법, 타이머를 활용한 텐션 조절", job: "방송, 미디어 홍보, 마케팅, 디자이너, 심리 상담", symbols: [{ emoji: "🔥", label: "출력(Output)" }, { emoji: "⏳", label: "텐션 조절" }, { emoji: "🗣️", label: "티칭 학습법" }] },
  "토(흙)": { color: "오트밀 베이지, 머스타드, 브릭 레드", item: "안정감을 주는 푹신하고 넓은 방석, 도자기 컵, 정리정돈을 위한 모듈형 수납장", action: "흔들리지 않는 고정된 루틴(매일 같은 시간, 같은 장소) 만들기, 복습 위주의 학습", job: "행정, 금융 컨설팅, 부동산 관리, HR(인사), 상담", symbols: [{ emoji: "⛰️", label: "고정 루틴" }, { emoji: "🔁", label: "반복 복습" }, { emoji: "🗂️", label: "공간 정리" }] },
  "금(쇠)": { color: "스노우 화이트, 실버 그레이, 차콜", item: "차가운 금속 재질의 노트북 거치대나 태블릿, 정교하게 세공된 펜, 맑은 소리가 나는 풍경", action: "오답 노트를 통한 원리 분석 및 객관화, 감정을 배제한 논리적 구조화 학습", job: "법조계, 금융/데이터 분석, 의료(외과/치과), 정밀 공학", symbols: [{ emoji: "⚔️", label: "원리 분석" }, { emoji: "🧊", label: "감정 배제" }, { emoji: "🎯", label: "약점 타격" }] },
  "수(물)": { color: "미드나잇 블루, 블랙, 딥 퍼플", item: "잔잔한 백색소음을 듣기 위한 고급 노이즈 캔슬링 헤드폰, 가습기, 물결 모양의 소품", action: "방해받지 않는 심야 시간(자시, 23~01시)을 활용한 딥워크, 명상을 통한 뇌 휴식", job: "기획/전략, 심리 연구, 작가, 철학/역사학자, 무역", symbols: [{ emoji: "🌊", label: "심야 딥워크" }, { emoji: "🎧", label: "외부 차단" }, { emoji: "🧘‍♂️", label: "뇌파 안정" }] },
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
  { id: 3, author: "목동 성민맘", type: "경주마형 / 고1", content: "경주마형은 추상적 목표 안 통한다는 말 정답입니다. 가이드대로 주간 단위 보상 걸어주니까 밤새서 공부합니다." }
];

const PREVIEW_DATA: Record<number, any> = {
  1: (user: any, saju: any) => `사주 명리학의 정밀 분석 결과, ${user.name}님은 ${DAY_MASTERS[saju.dayMaster]?.name || "태양"}의 기운을 타고났습니다.\n상위 1%가 가진 본능적 직관을 가졌지만, 특정 오행의 불균형으로 인해 현재의 성취에 한계를 느낄 수 있습니다.`,
  2: (user: any, saju: any) => {
    const age = calculateAge(user.birthDate);
    if (age <= 7) return `현재 ${age}세 유아기인 ${user.name} 아이에게 억지로 주입하는 교육은 사주의 기운을 질식시킵니다.\n명리학적으로 분석한 가장 완벽한 두뇌 발달과 영재성 발현의 치트키는 전혀 다른 곳에 있습니다.`;
    if (age <= 13) return `현재 ${age}세 초등 시기인 ${user.name} 학생의 평생 공부 그릇이 결정되는 골든타임입니다.\n명리학적으로 분석한 자기주도학습의 완성을 위한 시크릿 치트키는 무엇일까요?`;
    if (age <= 19) return `현재 ${age}세 수험생인 ${user.name} 학생에게 대치동식 스파르타 교육은 오히려 독이 될 수 있습니다.\n명리학적으로 분석한 1등급 도약을 위한 가장 완벽한 성적 향상의 치트키는 전혀 다른 곳에 있습니다.`;
    return `현재 성인(${age}세)인 ${user.name}님에게 10대 시절의 단순 암기법은 더 이상 통하지 않습니다.\n명리학적으로 분석한 자격증/고시/직무 등 실전 아웃풋을 극대화할 어른의 치트키는...`;
  },
  3: (user: any) => `주변 환경과 물건(풍수)의 미세한 변화가 현재 사주에 막혀있는 에너지를 크게 뚫어줍니다.\n${user.name}님의 집중력을 비약적으로 끌어올리기 위해 반드시 책상 위에 두어야 할 시크릿 아이템은...`,
  4: () => `시각적 에너지는 오행을 뇌파로 전달하는 가장 강력한 매개체입니다.\n현재 사주 원국의 열기를 식히고/얼어붙은 기운을 녹여내기 위해 필요한 절대적인 운명의 컬러는...`,
  5: () => `타고난 재능을 영리하게 활용할 때 평범한 삶을 넘어 사회적으로 압도적인 성공을 쟁취합니다.\n현재 명식 구조상 향후 10년 뒤 가장 크게 대성할 수 있는 구체적인 직업군과 그 이유는...`,
  6: (user: any) => `어떤 무리에 있더라도 반드시 분위기를 장악하거나 신뢰를 얻는 고유의 아우라가 있습니다.\n${user.name}님 본인도 미처 완벽히 자각하지 못했던 무의식 속 잠재력과 리더십의 본질은...`,
};

const generateProfessionalReport = (user: any, saju: any, menuId: number) => {
  const name = user.name || "고객";
  const dm = DAY_MASTERS[saju.dayMaster] || DAY_MASTERS['甲'];
  const elName = saju.main || "나무";

  const p1 = `본 프라이빗 컨설팅은 시중의 가벼운 풀이를 지양합니다. 천문학적 황경 기준으로 분석한 ${name}님의 선천 인지 필터는 만물을 일깨우는 [ ${dm.name} ]의 기운으로 세팅되어 있습니다. 이는 남들이 보지 못하는 이면을 꿰뚫어 보는 훌륭한 직관을 의미합니다.`;
  const p2 = `현재 명식의 가장 큰 지적 포텐셜은 '${elName}' 기운에서 뿜어져 나옵니다. 본인이 납득하는 논리적 구조를 발견했을 때 무서운 몰입도를 보입니다. 다만 결핍된 오행 회로가 보완되지 않으면 실전 시험에서 손이 굳거나 아는 것도 휘발되는 병목 현상을 겪게 됩니다.`;
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

  // 🌟 [핵심 수정 스크립트 수록]: 화면 상태 및 메뉴 분기가 바뀔 때마다 스크롤을 무조건 맨 위로 고정 🌟
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
          resolve({ dayMaster: '庚', main: '금(쇠)', lacking: '화(불)', excessive: '금(쇠)', pillars: [{tH:'丙',tK:'병',bH:'午',bK:'오'},{tH:'庚',tK:'경',bH:'子',bK:'자'},{tH:'戊',tK:'무',bH:'戌',bK:'술'},{tH:'壬',tK:'임',bH:'午',bK:'오'}], counts: {'금(쇠)':3} });
        } catch (e) {
          resolve({ dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', pillars: [], counts: {} });
        }
      }, 400);
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
    
    if (userInfo.name === '테스트') {
      alert("🛠️ 개발자 테스트 모드: 결제를 건너뛰고 VVIP 리포트를 오픈합니다.");
      await handlePaymentSuccess(userInfo, userSaju, selectedMenu);
      return;
    }

    localStorage.setItem('sajuApp_userInfo', JSON.stringify(userInfo));
    localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju));
    localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

    const paymentId = `payment_${new Date().getTime()}`;

    try {
      if (!(window as any).PortOne) return alert("결제 모듈을 불러오는 중입니다.");
      
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
    const st = CHILD_STUDY_MAP[userSaju?.dayMaster] || CHILD_STUDY_MAP["甲"];
    const txt = `[대치동 시크릿 사주 컨설팅]\n우리아이 공부유형 진단 완료! 🌙\n\n👤 이름: ${userInfo.name}\n✨ 기질: ${st.title}\n\n우리아이 천재성 확인하기 👉 ${window.location.origin}`;
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea); textarea.value = txt; textarea.select();
    document.execCommand("copy"); document.body.removeChild(textarea);
    alert("결과가 복사되었습니다! 맘카페나 단톡방에 공유해보세요.");
  };

  const currentStudyType = CHILD_STUDY_MAP[userSaju?.dayMaster] || CHILD_STUDY_MAP["甲"];

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
            <div className="w-full bg-[#E8C87A]/20 border border-[#E8C87A]/50 text-[#E8C87A] text-[11px] p-3 rounded-xl mb-6 text-center leading-relaxed break-keep shadow-lg">
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-xs font-bold flex items-center gap-1">🗓 생년월일</label>
                    <div className="flex bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-lg p-0.5 gap-0.5">
                      {[
                        { id: 'solar', label: '양력' },
                        { id: 'lunar', label: '음력' },
                        { id: 'leap', label: '윤달' }
                      ].map(type => (
                        <button key={type.id} type="button" onClick={() => setUserInfo({...userInfo, calendarType: type.id})}
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition-colors ${userInfo.calendarType === type.id ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-gray-400'}`}>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="date" required value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white text-sm outline-none [color-scheme:dark]" />
                </div>

                {/* 🌟 원상 복구된 태어난 시간 마스터 필드 구역 🌟 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
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
                <div key={idx}>
                  <div className="text-xl font-serif font-bold text-white">{p.tH}</div>
                  <div className="text-xs text-[#E8C87A]">{p.bH}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1530] border border-[#E8C87A]/40 rounded-2xl p-5 mb-4 text-center">
              <span className="text-3xl block mb-1">{currentStudyType.emoji}</span>
              <div className="text-xs text-[#E8C87A] font-bold">십성(사주 성분) 기반 기질 매칭</div>
              <div className="text-lg font-serif font-bold text-white mt-1 mb-2 break-keep">{currentStudyType.title}</div>
              <p className="text-xs text-gray-300 bg-white/5 p-3 rounded-xl break-keep mb-3">{currentStudyType.trait}</p>
              <div className="w-full min-h-[160px] bg-white/5 rounded-xl flex items-center justify-center overflow-hidden border border-white/10">
                <img src={currentStudyType.imgUrl} alt="기질 이미지" className="w-full h-auto object-cover max-h-48" />
              </div>
            </div>

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
              {unlockedMenus.includes(selectedMenu.id) && (
                <div className="mb-6 bg-[#1b2d4a] text-white p-4 rounded-2xl shadow-lg border border-[#243b5e] break-keep">
                  <p className="text-xs font-bold text-[#90C8E8] mb-2 flex items-center gap-1"><Download size={14}/> 안드로이드 / 아이폰 PDF 영구 저장법</p>
                  <ol className="text-[11px] space-y-1.5 text-gray-200 pl-3 list-decimal">
                    <li>아래 <strong>[PDF 저장]</strong> 버튼을 누르면 인쇄창이 뜹니다.</li>
                    <li>프린터 선택창에서 {"'PDF 파일로 저장'"}을 고르세요.</li>
                    <li>화면 우측의 노란색 PDF 아이콘을 누르면 다운로드됩니다.</li>
                  </ol>
                  <button onClick={downloadVVIPReport} className="w-full mt-4 bg-gradient-to-r from-[#D4A843] to-[#E8C050] text-[#1A1530] font-black py-3.5 rounded-xl shadow">
                    📥 10,000자급 VVIP 리포트 PDF 저장
                  </button>
                </div>
              )}

              {!unlockedMenus.includes(selectedMenu.id) ? (
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
                          <div className="text-[10px] text-gray-400 font-bold mb-0.5">{r.author}</div>
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
              ) : (
                <div className="space-y-4">
                  {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section: any, idx: number) => (
                    <div key={idx} className={`rounded-[18px] p-[24px_20px] ${section.isHighlight ? 'bg-gradient-to-br from-[#FFF8F4] to-[#F8F4FF] border-[2px] border-[#E8C87A]/60 shadow-lg' : 'bg-white shadow-sm border border-gray-200'}`}>
                      <h4 className="font-serif text-[16px] font-black mb-4 text-[#D4A843]">{section.title}</h4>
                      {section.paragraphs.map((text: string, pIdx: number) => (
                        <p key={pIdx} className="text-[14px] text-[#2A1530] leading-[1.8] text-justify break-keep">{text}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 🖨️ 인쇄 전용 VVIP 리포트 DOM (인쇄시 노출) */}
      {currentView === 'result' && selectedMenu?.id && unlockedMenus.includes(selectedMenu.id) && (
        <div className="print-only hidden font-serif w-full text-[#111625] bg-[#FDFBF7] p-8">
          <h1 className="text-2xl font-black mb-6 border-b pb-4">대치동 시크릿 사주 분석 보고서</h1>
          <div className="mb-6 text-xs space-y-1">
            <div>대상자: {userInfo.name} 님 ({userInfo.birthDate})</div>
            <div>일간 기운: {userSaju.dayMaster} ({DAY_MASTERS[userSaju.dayMaster]?.name})</div>
          </div>
          {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((s: any, idx: number) => (
            <div key={idx} className="mb-6">
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-900 text-justify">{s.paragraphs[0]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
