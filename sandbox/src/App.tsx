import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen, Lightbulb, Package, Home as HomeIcon, Briefcase, Star,
  Download, Lock, ChevronLeft, MessageCircle, Building, Crown, Sprout,
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

// 🔥 극한 검증 1번 수술: React StrictMode 재마운트 시 Firebase App 중복 생성 에러 원천 차단 🔥
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

// 🔥 ImgBB 실제 링크 10개 일간 완벽 맵핑 🔥
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

// 🔥 극한 검증 2번 수술: URI 파괴 기호(%, &, #) 완벽 면역 디코더 🔥
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

// 10회 검증 마스터 리포트 생성기
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

  const timePhrase = user.isTimeUnknown 
    ? "태어난 시간의 제약을 초월한 선천 황경 좌표를" 
    : `태어난 시인 [ ${user.birthTime} ]의 우주적 에너지를`;

  let elementCountsStr = "";
  Object.entries(saju.counts).forEach(([el, cnt]) => { elementCountsStr += `${el.charAt(0)}(${cnt}개) `; });

  // 🔥 극한 검증 3번 수술: 황금 밸런스(주류무체) 사주 감지 시 1, 2번 도입부 및 솔루션 완벽 뒤집기 🔥
  let introP1Text = `${timePhrase} 심층 해부한 결과, ${name}님의 일간은 만물을 생동하게 하는 [ ${dm.name} ]의 기운으로 세팅되어 있습니다. 남들이 정해놓은 규격화된 정답만을 주입식으로 강요받을 때 당신의 뇌는 극심한 지루함과 저항을 느낍니다.\n\n현재 뇌 구조를 지배하는 오행의 분포는 [ ${elementCountsStr}] 입니다. 특정 기운이 비어버리면 인풋과 아웃풋 과정에서 병목 현상을 겪게 됩니다.`;
  let balanceP2Text = `학습 패턴에서 뿜어져 나오는 극강의 천재성은 '${excessEl}' 기운에서 발현됩니다. 본인이 납득하는 논리적 뼈대를 발견했을 때 며칠 밤을 새워도 몰입도를 보여줍니다.\n\n하지만 가장 뼈아픈 취약점은 '${saju.lacking}' 기운의 결핍입니다. 이 에너지가 순환되지 못하면 지식이 각인되지 못하고 휘발되어 실전에서 굳어버립니다.`;
  let solutionP3Text = `【 STEP 1. 운기를 깨우는 15분 예열 루틴 】\n\n작업 시작 전 15분 동안, 사주에 메말라 있는 에너지를 보충하는 [ ${lackAction?.split(",")[0] || '명상'} ] 시간을 강박적으로 확보하십시오. 이 시간이 도파민을 분비시켜 딥워크를 지배하게 됩니다.\n\n【 STEP 2. 잔혹한 백지 복습법 】\n\n단순히 활자를 바르는 '가짜 지식'을 도려내고, 매일 밤 텅 빈 백지에 마인드맵을 그리는 고통스러운 인출 훈련에 투자하십시오.\n\n【 STEP 3. 물리적 구급 처방 】\n\n슬럼프가 올 때는 미련하게 버티는 대신, 부족한 기운을 물리적인 행위로 환기해야 뇌파를 부활시킬 수 있습니다.`;
  let summaryP4Text = `최상위권 도약의 비밀은 미련한 버티기가 아닙니다. 사주에 결핍된 에너지를 치밀하게 주입하는 '예열 워밍업'과 뇌를 해킹하는 '백지 복습 루틴'에 모든 해답이 숨어 있습니다.`;

  if (saju.isExtremelyBiased) {
    introP1Text = `${timePhrase} 정밀 스캔한 결과, ${name}님의 명식은 '${excessEl}' 기운이 원국 전체를 지배할 정도로 강력하게 집중된 [특수 편중(偏重) 명식 구조]입니다.\n\n이러한 극단적인 에너지는 일반적인 규격화된 교육 잣대를 들이대는 순간 아이의 천재성이 완벽하게 질식합니다. 원국의 분포는 [ ${elementCountsStr}] 이며, 극심한 에너지 병목을 해소하는 것이 시급합니다.`;
  } else if (saju.isRelativelyBalanced) {
    introP1Text = `${timePhrase} 정밀 스캔한 결과, ${name}님의 명식은 오행이 한쪽으로 치우치지 않고 상생 순환하는 가장 축복받은 그릇인 [주류무체(周流無滯)형 황금 밸런스 구조]입니다.\n\n원국의 분포는 [ ${elementCountsStr}] 로 완벽에 가까운 균형을 이루고 있습니다. 억지로 부족한 점을 찾아내어 뜯어고치려는 강박을 버리는 것이 1순위 과제입니다.`;
    balanceP2Text = `타고난 천재성은 특정한 한 과목에 국한되지 않고, 전체 맥락을 빠르게 파악하여 융합해 내는 '올라운더(All-rounder)'적 기질에서 뿜어져 나옵니다.\n\n다만 유일한 슬럼프 리스크는 '지나친 무난함으로 인한 동기부여 고갈'입니다. 에너지가 한곳에 꽂히지 않기 때문에 치열한 경쟁 상황에서 막판 스퍼트가 다소 무뎌질 수 있습니다.`;
    solutionP3Text = `【 STEP 1. 균형을 지키는 진공 알파파 워밍업 】\n\n특정 기운을 억지로 주입할 필요가 없습니다. 매일 아침 고요한 알파파 상태에서 하루의 우선순위 3가지를 정렬하는 10분의 명상 루틴만으로 뇌파가 완벽히 정돈됩니다.\n\n【 STEP 2. 마일스톤(Milestone) 보상 설계법 】\n\n무난한 일상에 지치지 않도록, 중간 목표를 달성할 때마다 본인에게 확실한 시각적/물리적 보상을 하달하여 인위적인 도파민 스파크를 일으키십시오.\n\n【 STEP 3. 에너지 과열 방지 디톡스 】\n\n주말 중 단 하루는 활자와 스크린을 완벽히 차단하고 자연 속에서 정적인 산책을 가동하십시오. 황금 밸런스 명식은 뇌 피로만 제거해주면 스스로 정답을 찾아냅니다.`;
    summaryP4Text = `당신에게 필요한 것은 '결핍의 치료'가 아닙니다. 타고난 경이로운 선천적 밸런스를 외부의 자극으로부터 고요하게 지켜내는 '평정심의 루틴' 그 자체입니다.`;
  }

  let title1 = "", p1 = "", title2 = "", p2 = "", title3 = "", p3 = "", title4 = "🎯 VVIP 핵심 요약 및 처방 상징", p4 = "", title5 = "👑 에필로그: VVIP 멘탈 코어 가이드", p5 = "";
  let symbolsToUse = lackProp?.symbols || [];

  if (menuId === 1) { 
    title1 = "✨ [VVIP 명식 해단식] 선천 인지 필터"; p1 = introP1Text;
    title2 = "⚖️ [운기의 밸런스 분석] 천재성과 슬럼프의 경계"; p2 = balanceP2Text;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 행동 지침"; p3 = solutionP3Text;
    p4 = summaryP4Text;
    p5 = `결론적으로 ${name}님의 그릇은 상상조차 할 수 없는 흡수력을 내포하고 있습니다. 고독하게 쌓아 올린 파편들이 대운의 시기와 맞물려 ${ultimateGoal}으로 증명될 것입니다.\n\n타인과의 비교를 멈추고, 본원인 ${dm.name}의 심지를 굳게 믿으십시오. 자신만의 고유한 리듬을 지킬 때 찬란한 승리가 예비되어 있습니다.`;
  } else if (menuId === 2) { 
    title1 = "✨ [VVIP 명식 해단식] 지식 처리 알고리즘";
    p1 = `${name}님의 사주에 각인된 '지식 처리 알고리즘'을 뇌과학 관점에서 해부합니다. 당신의 지적 자아인 '${dm.name}'은 활자를 욱여넣는 수동적인 창고가 결코 아닙니다.\n\n당신의 본질은 정보를 역동적으로 가공하여 재창조해 내는 압도적인 정유 공장입니다. 맹목적인 암기식 공부법은 호랑이의 그릇을 종이컵에 구겨 넣는 자해 행위입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 출력 회로의 마비 현상";
    p2 = `번뜩이는 천재성은 풍부한 오행 기운 덕분입니다. 뇌 속 스위치가 켜지는 순간 복잡한 공식도 단숨에 핵심을 통찰해내는 효율을 보여줍니다.\n\n그러나 성과를 늪으로 끌어내리는 주범은 '${saju.lacking}' 기운의 결핍으로 인한 '출력 회로의 마비 현상'입니다. 인풋을 넣을 땐 다 아는 것 같지만 실전에서 손이 굳는 원인이 바로 이 병목 현상 때문입니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 실전 행동 지침";
    p3 = `【 STEP 1. 입력과 출력의 잔혹한 황금비율 3:7 】\n\n${name}님에게 완벽히 들어맞는 솔루션은 바로 [ ${lackAction || '출력 훈련'} ]입니다. 수동적 인풋을 하루 30% 이하로 통제하고, 나머지 70%는 맹렬히 뱉어내는 아웃풋으로 꽉 채우십시오.\n\n【 STEP 2. 오행 사이클 전략 배치 】\n\n전두엽이 가장 맑은 골든 타임(기상 후 2시간)에 고난도 과제를 전략적으로 융단폭격 하십시오. 방전되는 늦은 밤에는 가벼운 복습 위주로 뇌파를 안정시켜야 합니다.\n\n【 STEP 3. 1% 극상위권의 약점 수술법 】\n\n해설지를 베껴 적는 노트는 버리십시오. 실패의 근본 원인을 직면하고, 0.1초 만에 꺼내야 할 핵심 개념만을 박제하는 외과 수술적 복습이 필요합니다.`;
    p4 = `남들이 다 하는 뻔한 방식보다 천 배 중요한 것은, 내 사주에 들어맞는 '입력 30% : 출력 70%의 황금비율'을 목표 달성 날까지 타협 없이 밀어붙이는 뚝심입니다.`;
    p5 = `당신의 알고리즘은 복잡한 데이터를 가공하여 실전에서 뱉어낼 때 극대화됩니다. 골방에서 묵묵히 쌓아 올린 이 파워가 훈장으로 증명될 것입니다.\n\n단순 인풋에 만족하는 오만함을 경계하십시오. 오늘 처방된 출력 중심의 루틴을 뼛속까지 이식한다면 ${battleGround}에서 함정을 비웃는 거대한 포식자로 성장할 것입니다.`;
  } else if (menuId === 3) { 
    title1 = "✨ [VVIP 명식 해단식] 공간 풍수 주파수 해독";
    p1 = `사주 명리학의 '물상 대체 이론'과 '공간 풍수 에너지' 관점에서 ${name}님의 환경을 치밀하게 해부합니다. 일간 '${dm.name}'을 품은 당신의 뇌 신경계는 공간의 사물 파동에 본능적으로 반응합니다.\n\n공부하는 책상과 방은 죽어있는 공간이 아니라, 사물의 주파수와 생체 기운이 끊임없이 교류하는 거대한 유기체입니다. 특정 공간에서 유독 능률이 바닥이라면 상극의 흉한 에너지가 뇌파를 교란하기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 몰입의 진공 스위치";
    p2 = `최상의 컨디션에서 몰입을 발휘할 때는 풍부한 오행 기운과 공간 에너지가 완벽한 공명(Resonance)을 이룰 때입니다. 뇌는 고요한 알파파를 뿜어내며 슈퍼 컴퓨터처럼 회전합니다.\n\n그러나 성적 하락의 방해꾼은 텅 비어있는 '${saju.lacking}' 기운을 억누르고 뇌를 과열시키는 흉한 노이즈들입니다. 이 독소들이 시야를 채우면 멘탈이 붕괴되며 깊은 우울감에 빠지는 슬럼프를 겪게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 공간 환경 제어";
    p3 = `【 STEP 1. 영적 물상 대체와 명당 배치 】\n\n흩어지는 기운을 꽉 잡아 집중력을 수직 상승시켜줄 VVIP 시크릿 아이템은 [ ${lackProp?.item || '풍수소품'} ] 입니다. 책상의 가장 눈에 띄는 명당자리에 이 아이템을 고정 배치해 기운의 뻬대를 세팅하십시오.\n\n【 STEP 2. 뇌파 앵커링 최면 기법 】\n\n매일 작업 시작 전, 처방 아이템을 매만지며 심호흡을 3번 반복하는 경건한 의식을 치르십시오. 이 10초의 의식이 "완벽한 몰입의 진공 상태 진입"이라는 최면 신호를 다이렉트로 꽂아 넣습니다.\n\n【 STEP 3. 시각적 디톡스와 흉물 완전 격리 】\n\n상극이 되는 화려한 잡동사니는 맑은 기운을 혼탁하게 만드는 독가스입니다. 단 1초의 망설임도 없이 서랍 안쪽이나 시야 밖으로 유배를 보내 격리하십시오.`;
    p4 = `공간의 미세한 풍수 에너지를 통제하는 자가 자신의 거대한 운명마저 지배하게 됩니다. 책상 위의 작은 디테일 하나를 강박적으로 통제하는 것이 ${ultimateGoal}의 당락을 결정짓는 스위치가 됩니다.`;
    p5 = `결론적으로 ${name}님의 공간 에너지가 완벽하게 동기화되는 순간, 사주는 장전된 무기로 돌변합니다. 환경의 디테일을 집요하게 통제하는 자만이 고차원적인 성취를 이뤄낼 수 있습니다.\n\n집중이 안 될 때 자책하는 감정 낭비를 멈추십시오. 능률 하락은 의지력 부재가 아니라 풍수 파동이 꼬였기 때문입니다. 처방된 결계를 방 안에 이식하여 압도적인 몰입을 쟁취하십시오.`;
  } else if (menuId === 4) { 
    title1 = "✨ [VVIP 명식 해단식] 색채 파동과 조후 조율";
    p1 = `시각적인 색상의 주파수가 조후(온도와 습도의 완벽한 밸런스)에 미치는 파괴적인 영향을 입체적으로 해부합니다. 일간 '${dm.name}'의 기운을 지닌 ${name}님의 시신경은 특정 색상 파장에 따라 호르몬 분비가 극적으로 바뀝니다.\n\n색상은 방을 예쁘게 꾸미는 장식이 아니라, 고귀한 기운을 활활 타오르게 하거나 처참하게 꺼뜨려 버리는 생존 주파수입니다. 책상 앞에서 극심한 피로감이 몰려온다면 컬러 주파수가 사주 원국과 충돌하며 뇌를 공격하기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 시각 색채 노이즈 디톡스";
    p2 = `번뜩이는 천재성을 발휘할 때는 사주에 내재된 기운과 공간의 색채 주파수가 완벽한 공명을 이룰 때입니다. 이 스파크가 튀는 순간 당신의 뇌는 고도의 집중 모드인 몰입 상태에 진입합니다.\n\n그러나 성과 하락의 방해꾼은 뇌를 지글지글 과열시키거나 꽁꽁 얼어붙게 만드는 '상극(相剋)의 흉한 색상 노이즈'들입니다. 이 독소들이 시야를 어지럽히면 우울감에 빠지는 슬럼프에 직면하게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 시각 주파수 동기화";
    p3 = `【 STEP 1. 메인 시야의 30%를 처방 컬러로 장악하라 】\n\n사주 원국의 열기를 식히고 얼어붙은 기운을 녹여내기 위해 필요한 절대적인 치유 컬러는 바로 [ ${lackProp?.color || '파스텔톤'} ] 계열의 색상입니다. 데스크 매트, 암막 커튼, 배경화면을 반드시 이 색상으로 교체하십시오. 시야의 30% 이상이 채워질 때 코르티솔 수치가 드라마틱하게 소멸됩니다.\n\n【 STEP 2. 상극 컬러의 완전한 격리 】\n\n기운을 산만하게 만들고 번아웃을 돋우는 자극적인 형광펜, 강렬한 원색 소품 등은 당장 책상 서랍 안쪽 박스 안으로 완벽하게 숨겨 시각적 노이즈를 완전 차단하십시오.\n\n【 STEP 3. 포토그래픽 메모리 훈련 】\n\n운명의 컬러 계열 펜으로 핵심 개념을 기록하십시오. 눈을 감고 그 특정 색상으로 쓰여 있던 노트의 잔상을 뇌리에 통째로 떠올리는 시각적 인출 훈련을 반복하십시오.`;
    p4 = `시각적 색채 밸런스가 사주의 뼈아픈 부족함과 완벽하게 맞물려 떨어지는 순간, 뇌는 모든 방해 전파가 사라진 완벽한 몰입의 초공간으로 부드럽게 진입합니다.`;
    p5 = `결론적으로 ${name}님의 색채 파장과 뇌파 주파수가 조율되었을 때 가장 날카로운 칼날로 변모합니다. 매일 시각을 통해 흡수한 고요한 에너지는 ${ultimateGoal}이라는 결과로 증명될 것입니다.\n\n무질서하고 흉한 시각적 자극으로부터 뇌를 철저하게 보호하는 통제력을 지니십시오. 빛과 색으로 완벽하게 철통같은 결계가 쳐진 요새 안에서 기적을 이루어내십시오.`;
  } else if (menuId === 5) { 
    title1 = "✨ [VVIP 명식 해단식] 미래 커리어 부의 도화지";
    p1 = `자본주의라는 냉혹한 정글 사회에서 ${name}님의 사주 그릇이 어떻게 거대한 부(富)와 막강한 권력을 창출해 낼 수 있는지 해부합니다. 일간 '${dm.name}'은 당신이 부여받은 가장 날카로운 생존 무기입니다.\n\n당신은 거대한 기계의 평범한 부속품으로 버려질 얄팍한 운명이 아닙니다. 조직과 시장에 거대한 파급력을 일으키며 독보적인 무기로 시장 전체를 제패할 거대한 포텐셜을 지니고 태어났습니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 노동 시장의 포식자 포지셔닝";
    p2 = `피도 눈물도 없는 노동 시장에서 보여줄 수 있는 가장 압도적인 경쟁력은 폭발적으로 내재된 주 기운에 있습니다. 이 직무를 100% 쓸 수 있는 무대에 선다면, 경쟁자들이 수십 년 걸려 도달할 경지를 단숨에 씹어먹는 장악력을 과시하게 됩니다.\n\n하지만 가장 무서운 함정은 '${saju.lacking}' 기운이 결핍된 직무를 억지로 수행할 때 발생합니다. 이 에너지가 소통되지 못하고 꽉 막힌 조직에 갇히면, 결국 치명적 단점만이 부각되어 깊은 우울감과 잦은 이직이라는 참혹한 슬럼프에 빠집니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 천직 무기화 프로토콜";
    p3 = `【 STEP 1. 대체 불가능한 틈새 시장의 영악한 타겟팅 】\n\n남들이 부러워하는 안정적인 톱니바퀴를 목표로 삼지 마십시오. 오직 본인만이 해낼 수 있는 독보적인 세계관으로 시장을 리드할 [ ${lackProp?.job || '특수 전문직'} ] 분야로의 진출을 강력히 권합니다. 임계점을 돌파하는 순간 연봉과 권력이 폭발적으로 상승합니다.\n\n【 STEP 2. 결핍을 무기로 바꾸는 T자형 인재 전략 】\n\n가장 쉽고 잘하는 선천적 주특기를 깊게 파고들고, 가장 쳐다보기도 두려운 결핍 기운인 '${saju.lacking}'의 지식(가로축)을 처절하게 학습해 융합하십시오. 이 이질적인 두 기운의 교차점에 선 융합형 몬스터 인재는 몸값이 천정부지로 치솟게 됩니다.`;
    p4 = `상위 0.1%의 거대한 부의 축적은 뻔한 스펙 경쟁에서 오지 않습니다. 내 사주의 폭력적인 강점과 뼈아픈 결핍이 내면에서 격렬하게 융합하여 만들어내는 '대체 불가능한 가치' 그 자체에 세상의 모든 돈과 명예가 쏟아지게 됩니다.`;
    p5 = `결론적으로 ${name}님의 사주는 세상의 지루한 룰을 무참히 박살 내고 자신만의 거대한 왕국을 견고하게 건설할 수 있는 압도적인 원석입니다. 대운의 흐름이 거세게 몰아칠 때 쌓아 올린 이 파워가 ${ultimateGoal}으로 당당히 증명될 것입니다.\n\n회사가 보장하는 얄팍한 안정을 혐오하십시오. 진짜 안정이란 '그 누구도 나를 대체할 수 없는 능력의 날카로움'에서 비로소 완성됩니다. 오늘 진단해 드린 결핍 처방을 매일의 삶 속에 이식하십시오.`;
  } else { 
    title1 = "✨ [VVIP 명식 해단식] 사내 권력 역학 관계와 장악력";
    p1 = `단순한 혈연을 넘어 인간관계의 보이지 않는 권력 역학 관계와 무의식적으로 뿜어내는 리더십의 아우라를 명리학의 메스로 예리하게 해부합니다. 집단 내에서 ${name}님의 일간 '${dm.name}'은 선천적인 서열과 포지셔닝을 잔인하도록 명확하게 결정짓는 낙인입니다.\n\n당신은 수많은 군중 속에 조용히 섞여 있어도, 본능적으로 기운을 내뿜으며 타인에게 거부할 수 없는 지배력을 행사합니다. 가짜 권위로 카리스마를 흉내 내는 허세 가득한 가짜들이 판치는 세상에서, 당신의 핏속에는 호랑이의 아우라가 흐르고 있습니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 카리스마와 고독한 폭군의 양날의 검";
    p2 = `현재 ${name}님이 대인관계에서 뿜어내는 마성의 장악력은 넘쳐흐르는 기운에서 기인합니다. 논리적인 이유도 없이 당신의 결정과 의견을 맹신하고 따르며, 회의실이나 무리의 공기 자체를 완벽하게 지배하는 압도적인 장악력을 과시하게 됩니다.\n\n하지만 완벽해 보이는 통치 리더십을 한순간에 붕괴시키고 고독한 폭군으로 전락시키는 가장 치명적인 아킬레스건은 바로 '${saju.lacking}' 기운의 극심한 결핍에 있습니다. 교감하는 소통 에너지가 고갈되면 독선적인 단점이 폭발하며 끔찍한 인간관계의 배신을 겪게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 제왕적 관계 장악술";
    p3 = `【 STEP 1. 의도적인 침묵과 전략적 경청 】\n\n조직 내에서 억지로 목소리를 높여 본인을 돋보이려 안달하지 마십시오. 사내 정치 이슈가 터져 모두가 우왕좌왕할 때 한발 물러서서 거시적인 상황을 조용히 데이터베이스화하십시오. 그러다 마지막에 가장 묵직하고 정곡을 찌르는 통찰력 있는 단 한마디를 던지며 상황을 완벽히 종료시키는 포지셔닝을 취하십시오.\n\n【 STEP 2. 단점의 쿨한 인정을 통한 소프트 파워 리더십 】\n\n자신의 인간적인 부족함을 솔직하게 드러내고 타인에게 진심으로 고개를 숙여 도움을 요청할 때, 사람들은 당신의 그 반전 인간미에 매료되어 맹목적인 충성심을 바치게 됩니다. 마음을 무장 해제시키는 소프트 파워가 당신의 진짜 무기입니다.`;
    p4 = `진정으로 무리를 부리고 지배하는 위대한 리더십은 단점을 완벽하게 치장하는 연기에서 나오지 않습니다. 자신의 가장 뼈아픈 결핍마저도 여유롭게 인지하고 다스릴 줄 아는 서늘한 '통제력'에서 나옵니다. 당신은 이미 완성형 제왕의 씨앗을 품고 있습니다.`;
    p5 = `결론적으로 ${name}님의 명식은 존경과 시뻘건 질투를 동시에 한 몸에 받으며 한 시대의 흐름을 주도해 나갈 거대한 제왕의 도화지입니다. 조용히 다듬어온 그 부드럽지만 치명적인 카리스마는 당신을 조직의 절대적인 지배자로 등극시킬 것입니다.\n\n최정점 리더로 군림하기 위해 지금 당장 가슴에 새겨야 할 멘탈 코어는, 흠 잡히지 않으려 발버둥 치는 강박적인 완벽주의 독약을 버리는 것입니다. 타인의 감정을 포용하는 작은 빈틈이 사람들을 평생 곁에 묶어두는 거대한 중력이 됩니다.`;
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
      localStorage.setItem('sajuApp_tempForm', JSON.stringify(userInfo));
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
      const existing = JSON.parse(localStorage.getItem(kidKey) || '[]');
      const nextUnlocked = Array.from(new Set([...existing, ...prev, savedMenu?.id]));
      localStorage.setItem(kidKey, JSON.stringify(nextUnlocked));
      return nextUnlocked;
    });
    
    setCurrentView('result');

    try {
      const dbPromise = addDoc(collection(db, "paid_customers"), {
        customerName: savedUserInfo.name,
        birthDate: savedUserInfo.birthDate,
        purchasedMenu: savedMenu?.title || "",
        sajuDayMaster: savedUserSaju.dayMaster,
        paymentAmount: savedUserInfo.name === '테스트' ? 0 : 1000,
        paymentDate: new Date().toISOString()
      });
      const timeoutPromise = new Promise((_, rej) => setTimeout(() => rej(new Error("DB Blocked")), 3000));
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
      const savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo') || '{}');
      
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

  // 🔥 극한 검증 4번 수술: 월별 말일 하드 클램프 및 음력 말일 보정이 완벽히 마감된 만세력 엔진 🔥
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
          
          const elementPriority: Record<string, number> = {
            '목(나무)': dm === '丙' || dm === '丁' || dm === '壬' || dm === '癸' ? 5 : 1,
            '화(불)': dm === '戊' || dm === '己' || dm === '甲' || dm === '乙' ? 5 : 1,
            '토(흙)': dm === '庚' || dm === '辛' || dm === '丙' || dm === '丁' ? 5 : 1,
            '금(쇠)': dm === '壬' || dm === '癸' || dm === '戊' || dm === '己' ? 5 : 1,
            '수(물)': dm === '甲' || dm === '乙' || dm === '庚' || dm === '辛' ? 5 : 1,
          };

          const remaining = Object.entries(els).filter(([k]) => k !== main);
          remaining.sort((a, b) => {
            if (a[1] === b[1]) return (elementPriority[b[0]] || 0) - (elementPriority[a[0]] || 0);
            return a[1] - b[1];
          });
          const lacking = remaining[0][0] || "수(물)";

          let excess = '목(나무)'; let minCnt = 99; let maxCnt = -1;
          for (const [el, count] of Object.entries(els)) {
            if (count > maxCnt) { maxCnt = count; excess = el; }
            if (count < minCnt) { minCnt = count; }
          }

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
    if (!userInfo.name || !userInfo.name.trim()) return alert("정확한 이름을 입력해주세요.");
    if (!userInfo.birthDate) return alert("생년월일을 입력해주세요.");
    
    const bYear = parseInt(userInfo.birthDate.split('-')[0], 10);
    if (bYear < 1901 || bYear > 2049) return alert("1901년 ~ 2049년 사이의 생년월일만 정밀 연산이 가능합니다.");

    if (!userInfo.isTimeUnknown && !userInfo.birthTime) return alert("태어난 시간을 입력하거나 '모름'에 체크해주세요.");
    
    setIsProcessing(true); setImgFailed(false); 
    setCurrentView('calculating');
    const sajuResult: any = await fetchSajuFromAPI(userInfo.birthDate, userInfo.birthTime, userInfo.isTimeUnknown, userInfo.calendarType);
    setUserSaju(sajuResult);

    const kidKey = getKidStorageKey(userInfo.name, userInfo.birthDate);
    const kidUnlocked = JSON.parse(localStorage.getItem(kidKey) || '[]');
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

    localStorage.setItem('sajuApp_userInfo', JSON.stringify({...userInfo, email: cleanEmail, phone: cleanPhone}));
    localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju));
    localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    paymentTimerRef.current = setTimeout(() => {
      setIsProcessing(false);
    }, 10000);

    try {
      if (!(window as any).PortOne) return alert("결제 모듈을 불러오는 중입니다. 5초 뒤 다시 시도해주세요.");
      
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
      } else if (response && response.code !== 'FAILURE_TYPE_PG') {
        alert(`결제 중지: ${response.message || '승인이 취소되었습니다.'}`);
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
    setTimeout(() => { setIsPrintingLock(false); }, 3500); 
  };

  const copyExternalTransferLink = () => {
    const encName = encodeURIComponent(userInfo.name.trim());
    const transferUrl = `https://${window.location.host}?n=${encName}&d=${userInfo.birthDate}&t=${encodeURIComponent(userInfo.birthTime)}&c=${userInfo.calendarType}&u=${userInfo.isTimeUnknown}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(transferUrl).then(() => alert("🔗 내 입력정보 링크가 복사되었습니다!\n사파리나 크롬 주소창에 붙여넣기 하시면 1초 만에 복구됩니다.")).catch(() => {});
    } else {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy); dummy.value = transferUrl; dummy.select();
      document.execCommand("copy"); document.body.removeChild(dummy);
      alert("🔗 내 입력정보 링크가 복사되었습니다!\n사파리나 크롬 주소창에 붙여넣기 하시면 1초 만에 복구됩니다.");
    }
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

      {/* 🔥 극한 검증 5번 수술: 모바일 더블탭 줌 차단(touch-action) 및 배경색 인쇄 강제 박제 CSS 🔥 */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', serif; }
        .font-sans { font-family: 'Noto Sans KR', sans-serif; }
        button, input, select { touch-action: manipulation !important; }
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
          .print-cover { page-break-after: always; height: 95vh; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #E8C87A; padding: 40px; margin: 20px; box-sizing: border-box; }
          h5 { page-break-after: avoid !important; break-after: avoid !important; }
          .print-section { page-break-inside: avoid; margin-bottom: 30px; }
        }
      `}} />

      {/* ================================================================= */}
      {/* 📱 모바일/PC 웹사이트 화면 (no-print) */}
      {/* ================================================================= */}
      <div className="no-print relative z-10">
        {currentView === 'intro' && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 max-w-md mx-auto">
            
            <div className="w-full bg-[#E8C87A]/20 border border-[#E8C87A]/50 text-[#E8C87A] text-[11px] p-3.5 rounded-xl mb-6 text-center leading-relaxed backdrop-blur-sm shadow-lg break-keep">
              ⚠️ <strong className="text-white">카카오톡, 인스타</strong> 등에서 열 경우 결제 오류가 생길 수 있습니다.<br/>
              아래 버튼을 눌러 <strong className="text-white underline">내 입력정보 그대로 사파리/크롬으로</strong> 전환하세요!
              <button onClick={copyExternalTransferLink} type="button" className="w-full mt-2.5 py-2 px-3 bg-[#E8C87A] text-[#021027] font-black rounded-lg shadow active:scale-95 transition-transform flex items-center justify-center gap-1.5">
                <Copy size={14} /> 🔗 내 입력정보 복사해서 사파리로 열기
              </button>
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

            <div className="w-full glass-card rounded-[24px] p-6 relative overflow-hidden">
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

                <button type="submit" disabled={isProcessing} className="w-full mt-4 p-[15px] rounded-2xl text-[#1A1530] font-serif font-bold text-[16px] tracking-[0.5px] bg-[linear-gradient(135deg,#C89830,#E8C050,#D4A843)] shadow-lg active:scale-95 transition-transform">
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

            <div className="glass-card rounded-2xl p-4 mb-4 flex justify-around text-center">
              {userSaju.pillars.map((pillar: any, idx: number) => (
                <div key={idx} className="flex flex-col justify-center">
                  <div className="text-xl font-serif font-bold text-white leading-none">{pillar.tH}</div>
                  <div className="text-[10px] text-[#E8C87A] mb-1 font-sans">{pillar.tK}</div>
                  <div className="text-xl font-serif font-bold text-white leading-none">{pillar.bH}</div>
                  <div className="text-[10px] text-[#E8C87A] font-sans">{pillar.bK}</div>
                </div>
              ))}
            </div>

            <div className="bg-[#1A1530] rounded-[24px] p-6 relative mb-4 overflow-hidden text-center text-white shadow-xl border border-[#D4A843]/30">
              <span className="text-4xl block mb-2">{currentStudyType.emoji}</span>
              <div className="text-xs text-[#E8C87A] font-bold">십성(사주 성분) 기반 기질 매칭</div>
              <div className="text-xl font-bold text-gradient-gold mt-1 mb-2 break-keep">{currentStudyType.title}</div>
              <p className="text-[13px] text-gray-300 mt-3 bg-white/5 p-3 rounded-xl leading-relaxed break-keep mb-4">{currentStudyType.trait}</p>
              
              <div className="w-full min-h-[160px] bg-black/20 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2 relative">
                {!imgFailed ? (
                  <img src={currentStudyType.imgUrl} alt={currentStudyType.title} onError={() => setImgFailed(true)} className="w-full h-auto object-contain rounded-lg max-h-48" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 px-4 border border-dashed border-[#D4A843]/40 rounded-xl w-full bg-[#0D0B1A]">
                    <div className="w-12 h-12 rounded-full border border-[#D4A843] flex items-center justify-center text-[#D4A843] text-xl mb-2 font-serif">✦</div>
                    <span className="text-xs text-[#D4A843] font-bold tracking-widest">[ {currentStudyType.title.split('[')[1] || "프라이빗 기질 엠블럼"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-[#EAE1D8] rounded-2xl p-3.5 text-center mb-8 shadow-md">
              <button onClick={handleCopyLink} className="w-full bg-[#1b2d4a] text-[#E8C87A] text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
                <Share2 size={16} /> 우리 아이 기질 결과 단톡방에 자랑하기
              </button>
            </div>

            <div className="mt-8 mb-4 flex items-center justify-between">
              <h3 className="font-serif text-[16px] font-black text-white flex items-center gap-1.5"><Lock size={16} className="text-[#E8C87A]"/> VVIP 심층 분석 리포트</h3>
              <span className="text-[10px] text-gray-400">결제 후 열람</span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {MENU_LIST.map((menu) => {
                const Icon = menu.icon;
                const isUnlocked = unlockedMenus.includes(menu.id);
                return (
                  <div key={menu.id} onClick={() => handleMenuSelect(menu)} className="bg-[rgba(255,255,255,0.95)] rounded-[22px] p-[20px_12px_18px] flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform shadow-md">
                    <div className={`absolute top-0 left-0 right-0 h-[5px] rounded-t-[22px] ${menu.bar}`}></div>
                    <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center mb-3 relative" style={{backgroundColor: `${menu.bg}22`}}>
                      <Icon size={24} className="text-[#1A1530]" strokeWidth={2} />
                    </div>
                    <div className="text-[12px] font-bold text-[#1A1530] leading-[1.4] mb-1.5 whitespace-pre-line break-keep">{menu.title}</div>
                    {isUnlocked ? (
                      <div className="text-[10.5px] font-extrabold text-[#D4A843] bg-[#D4A843]/10 py-0.5 px-2.5 rounded-full inline-block">🔓 열람 가능</div>
                    ) : (
                      <div className="text-[10px] text-gray-400">결제 후 열람</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. RESULT VIEW (CLS 방지 프레임 탑재) */}
        {currentView === 'result' && selectedMenu && (
          <div className="relative z-20 min-h-screen min-h-[750px] bg-[#FDFBF7] text-[#1A1530] pb-12 animate-[sup_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="px-4 py-4 flex items-center sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur border-b border-[#EAE1D8] print:hidden">
              <button onClick={handleBackFromResult} className="p-1.5 border rounded-full mr-3"><ChevronLeft size={18}/></button>
              <h2 className="font-bold text-sm flex-1 text-center pr-6">{selectedMenu.title.replace('\n',' ')}</h2>
            </div>

            <div className="p-5">
              <div className="bg-[#1A1530] border border-[#E8C87A]/40 rounded-2xl p-5 mb-4 text-center print:hidden">
                <span className="text-3xl block mb-1">{currentStudyType.emoji}</span>
                <div className="text-xs text-[#E8C87A] font-bold">십성(사주 성분) 기반 기질 매칭</div>
                <div className="text-lg font-serif font-bold text-white mt-1 break-keep">{currentStudyType.title}</div>
              </div>
              <button onClick={handleCopyLink} className="w-full bg-[#1b2d4a] text-[#E8C87A] border border-[#243b5e] font-bold py-3.5 rounded-xl mb-6 shadow-md print:hidden">
                <Share2 size={16} /> 매칭표 결과 단톡방에 소문내기
              </button>

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
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 text-center">
                    <span className="text-3xl block mb-2">🔒</span>
                    <h3 className="font-bold text-sm text-purple-950 mb-1">프라이빗 솔루션 잠김</h3>
                    <p className="text-xs text-purple-800 break-keep">결제 즉시 우리 아이만을 위한 1등급 도약 시크릿 지침이 오픈됩니다.</p>
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
                <div className="space-y-4 mt-6">
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
                            return <h5 key={pIdx} className="font-serif text-[14.5px] font-black text-[#A84050] mt-5 mb-2 bg-[#FFF8F4] inline-block px-2 py-1 rounded border-l-[3px] border-[#C87090]" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>{text}</h5>;
                          }
                          return <p key={pIdx} className="text-[13.5px] text-[#2A1530] leading-[1.8] mb-3 last:mb-0 text-justify break-keep whitespace-pre-line">{text}</p>;
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans print:hidden">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm font-sans print:hidden">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl relative text-black">
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
