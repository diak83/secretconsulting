import React, { useState, useEffect, useRef } from "react";
import { DM_REPORT_DATA } from "./DM_REPORT_DATA";
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

// 🔥 [VVIP 퀀텀 에세이 매트릭스 1]: 일간(DM)별 완전히 차별화된 심층 논문 텍스트 🔥
const DM_MATRIX: Record<string, any> = {
  甲: { 
    name: "갑목(甲木)", nature: "하늘을 뚫고 오르는 거대한 소나무", 
    p1_style: "하늘을 향해 수직으로 뻗어나가는 '갑목(甲木)'의 선천적 황경 좌표를 부여받은 본원의 소유자입니다. 이 명식의 전두엽은 타인이 일방적으로 정해놓은 규격화된 지시나 기계적인 주입식 루틴을 강요받을 때 인지 필터가 극심한 거부감을 일으키며 뇌파를 강제로 꺼버리는 뚜렷한 생존 기제를 지닙니다. 즉, 본인이 전체 맥락을 납득하고 설계한 거대한 '이해의 뼈대'가 세워져야만 비로소 지적 호기심의 스위치가 점화되는 고급 원석입니다.",
    p5_style: "세상이 규격화해 놓은 얄팍한 평균의 기준에 아이를 억지로 욱여넣으며 자책하는 감정 낭비를 오늘부로 영구 중단하십시오. 갑목 본원의 거친 자생력을 믿고, 스스로 '왜 이 과목의 정점에 서야 하는가'에 대한 거시적 대의명분을 쥐어주십시오. 온 세상이 아이의 날카로운 주도력 앞에 무릎 꿇을 것입니다.",
    talk_intro: "청각 신경망이 타인의 '명령과 제어 언어'에 극도로 날카롭게 반응하는 독립적 일간입니다. 부모가 무의식적으로 뱉는 \"이거 당장 해라\"라는 억압성 서술어가 귓가에 꽂히는 순간, 아이의 편도체는 지적 교감을 끊고 전투 준비를 시작합니다.",
    talk_rule: "아이의 가능성과 주체성을 얕잡아보는 『네가 끝까지 제대로 할 수나 있겠어?』 식의 존재 스크래치 발언을 영구 봉인하십시오."
  },
  乙: { 
    name: "을목(乙木)", nature: "척박한 바위도 뚫고 번식하는 끈질긴 넝쿨", 
    p1_style: "수평으로 영역을 쉴 새 없이 넓혀가며 생태계를 장악하는 '을목(乙木)'의 유기체적 핏줄을 이어받았습니다. 이 신경망 회로는 홀로 고독하게 독서실에 갇혀 문제집과 씨름할 때 지적 포텐셜이 완벽하게 질식하며, [주변의 면학 공기와 스터디 멤버들의 텐션]에 뇌파 전체가 실시간으로 동기화되는 뛰어난 정서적 흡수 체계를 지녔습니다. 훌륭한 멘토와 경쟁자 그룹에 던져둘 때 성취도가 퀀텀 점프합니다.",
    p5_style: "주변 환경과 친구들에게 쉽게 휩쓸린다고 아이를 다그치지 마십시오. 을목의 유연함은 나약함이 아니라 가장 흉포하고 위대한 생존 적응력입니다. 따뜻한 정서적 지지와 맑은 텐션을 뿜어내는 면학 공기만 먹여준다면, 넝쿨은 기어이 거대한 킬러 문항의 바위를 부수고 정상을 뒤덮을 것입니다.",
    talk_intro: "말의 표면적 내용보다 '말을 뱉는 부모의 미세한 표정과 공기'를 먼저 파싱하는 초민감형 정서 주파수의 소유자입니다. 애정이 누락된 차가운 팩트 앞에서는 마음의 문을 닫습니다.",
    talk_rule: "형제나 엄친아를 등판시켜 존재 가치를 지워버리는 『누구 반만이라도 닮아봐라』 식의 비교 자극 언어를 영구 소각하십시오."
  },
  丙: { 
    name: "병화(丙火)", nature: "세상을 환하게 비추는 정오의 눈부신 태양", 
    p1_style: "명리학적 천경 좌표 스캔 결과, 세상을 환하게 비추는 '병화(丙火)'의 에너지를 핵심 코어로 세팅받았습니다. 이 지적 연산 시스템은 [타인의 열광적인 주목과 도파민 펌핑]을 연료로 가동되는 화려한 출력(Output) 특화 엔진입니다. 골방에서 조용히 정답을 맞히는 것만으로는 뇌파가 흥분하지 않으며, 칠판 앞이나 스터디 그룹에서 남에게 일타강사처럼 가르치며 설명할 때 지능이 4배 이상 수직 상승합니다.",
    p5_style: "감정 기복이 심하고 쉽게 달아오른다는 약점을 인위적으로 억누르려 들지 마십시오. 정오의 태양은 원래 뜨겁고 강렬하게 타오르는 법입니다. 아이의 사소한 개념 정복마저도 무대 위의 주인공처럼 융단폭격하듯 인정해 주십시오. 끓어오르는 도파민 스파크가 입시의 장벽을 가볍게 녹여버릴 것입니다.",
    talk_intro: "인정과 과시욕이 뇌 신경계를 연결하는 핵심 전선인 명식입니다. 부모의 무미건조한 반응이나 자신의 열정이 묵살당하는 뉘앙스를 감지하는 순간 연산 스레드가 정지됩니다.",
    talk_rule: "아이의 부푼 지적 호기심을 현실의 잣대로 짓밟는 『쓸데없는 짓 말고 교과서나 봐』 식의 사고 정지 언어를 절대 봉인하십시오."
  },
  丁: { 
    name: "정화(丁火)", nature: "어둠을 파고드는 예리한 심야의 모닥불", 
    p1_style: "고요한 심야의 어둠 속에서 핀셋처럼 예리하게 타오르는 '정화(丁火)'의 영혼을 품고 태어났습니다. 이 인지 그릇은 한 번 꽂힌 과목이나 개념의 밑바닥을 기어이 발라내고야 마는 [외과수술적 집요함]의 대가입니다. 시끄럽고 산만한 낮 시간대의 주입식 수업에서는 생체 에너지를 아끼며 방어적으로 작동하다가, 외부 개입이 완벽히 차단된 밤 10시 이후의 심야 진공 상태에서 경이로운 딥워크 연산력을 발휘합니다.",
    p5_epilogue: "남들처럼 아침 일찍 일어나 억지로 책상에 앉는 평균의 아침형 바이오리듬을 강요하지 마십시오. 아이의 뇌파는 밤의 고요함 속에서 가장 날카롭게 빛납니다. 스스로 몰입의 요새를 가동할 수 있도록 심야의 독립적인 시공간을 철저히 보장해 주십시오.",
    talk_intro: "표면적으로는 차분하게 \"네\" 하고 순응하지만 내면에는 날카로운 논리적 검증기를 가동하고 있는 외유내강형 청각 필터입니다. 명분이 없는 강요는 속으로 완벽히 비웃습니다.",
    talk_rule: "논리적 인과관계를 생략한 채 부모의 나이와 권위만 들이대는 『엄마가 하라면 토 달지 말고 해』 식의 독재 언어를 소각하십시오."
  },
  戊: { 
    name: "무토(戊土)", nature: "천 년의 세월을 흔들림 없이 버텨낸 거대 산맥", 
    p1_style: "만물을 묵묵히 품어내며 세월을 견디는 '무토(戊土)'의 핏줄을 이어받은 대기만성형 코어 그릇입니다. 얕은 잔재주와 벼락치기 요령을 본능적으로 경멸하며, 오직 [매일 정해진 시간, 정해진 장소의 완벽한 고정 루틴]이 뇌 신경망에 층층이 퇴적될 때 그 누구도 넘볼 수 없는 거대한 지적 산맥을 군림하는 무서운 뒷심의 최강자입니다.",
    p5_style: "초반에 새로운 개념을 소화하는 보폭이 남들보다 다소 무겁고 느려 보인다고 초조해하지 마십시오. 얄팍한 모래성은 빨리 쌓지만 금방 무너지고, 거대한 태산은 오래 걸리지만 영원히 그 자리에 남습니다. 아이의 우직한 뚝심을 절대적인 신뢰의 눈빛으로 호위해 주십시오.",
    talk_intro: "말수가 적고 감정 표현에 서툴지만, 한 번 신뢰를 준 부모의 묵직하고 일관된 말 한마디를 평생의 생존 닻으로 삼는 신중한 청각 레이더를 지녔습니다.",
    talk_rule: "아침저녁으로 부모의 감정에 따라 기준이 바뀌며 아이의 토대를 흔드는 『너 그럴 줄 알았다』 식의 가벼운 질책을 영구 봉인하십시오."
  },
  己: { 
    name: "기토(己土)", nature: "모든 지식을 층층이 배양해 내는 비옥한 평야", 
    p1_style: "방대한 지식의 분류와 정밀한 데이터화에 타고난 천재성을 지닌 '기토(己土)'의 명식 구조입니다. 탁월한 기억력과 디테일을 잡아내는 섬세함을 지녔으나, 선천적으로 [틀리는 것과 오답에 대한 극심한 완벽주의적 공포]가 각인되어 있어 완벽한 안전망이 보장되지 않으면 연필을 쥐기조차 두려워하는 슬럼프에 빠지기 쉽습니다. 심리적 쿠션 제공이 핵심 과제입니다.",
    p5_style: "문제를 틀려 오답을 마주했을 때 미간을 찌푸리는 부모의 미세한 표정 변화가 아이의 전두엽을 얼어붙게 만듭니다. '틀려도 괜찮아, 오답은 평야를 거름지게 할 비료일 뿐이야'라는 정서적 안전 결계를 쳐주십시오. 공포가 사라진 평야에서는 수많은 지식의 열매가 만개할 것입니다.",
    talk_intro: "상대방의 말씨에 담긴 미세한 비판적 뉘앙스를 핀셋처럼 추출해 내어 스스로를 갉아먹는 자책 회로로 가동하는 초민감형 수용 체계를 지녔습니다.",
    talk_rule: "아이의 뼈아픈 실수를 직설적으로 난도질하는 『거봐, 엄마가 하라는 대로 안 하더니 틀렸지?』 식의 사후 비판을 완벽히 도려내십시오."
  },
  庚: { 
    name: "경금(庚金)", nature: "감정을 배제한 차갑고 날카로운 정예 무쇠", 
    p1_style: "목표물이 확인되면 감정을 소거하고 정밀하게 돌진하는 '경금(庚金)'의 강인한 기질을 세팅받았습니다. '훌륭한 교양인이 되어야지' 같은 추상적이고 감성적인 동기부여는 전두엽에서 완벽한 소음으로 소거되며, 오직 [눈앞에 명확하게 수치화된 단기 타겟과 즉각적인 보상 당근]이 하달될 때만 전투 텐션이 수직 상승하는 실전 모의고사형 전투기입니다.",
    p5_style: "아이에게 구구절절 감정적인 눈물로 호소하는 잔소리 노동력을 당장 멈추십시오. 정예 무쇠는 뜨거운 눈물로 제련되지 않고 차가운 망치질과 정확한 수치로 단련됩니다. 간결한 목표와 명확한 보상 프레임만 설계해 준다면, 아이는 평가의 전장에서 출제자의 장벽을 무자비하게 썰어버릴 것입니다.",
    talk_intro: "말의 서론이 길어지거나 감정적 호소가 섞이는 순간 청각 신경을 오프라인으로 끄고 차단해 버리는 극도로 효율 중심적인 언어 필터를 가졌습니다.",
    talk_rule: "인과관계 없이 눈물과 한숨으로 들이대는 『엄마가 너 뒷바라지하느라 얼마나 고생하는데』 식의 죄책감 주입 화법을 영구 소각하십시오."
  },
  辛: { 
    name: "신금(辛金)", nature: "작은 흠집조차 허용하지 않는 초정밀 수술용 메스", 
    p1_style: "개념의 논리적 빈틈을 핀셋처럼 발라내는 '신금(辛金)'의 고귀한 영혼을 부여받았습니다. 대한민국 상위 0.1% 수능 킬러 문항 정복에 가장 특화된 정밀한 시냅스를 지녔으나, 타인이 일방적으로 떠먹여 주는 주입식 평균화 교육을 본능적으로 혐오하며 자신의 까칠한 지적 예민함을 존중받지 못할 때 펜을 꺾어버리는 가시 돋친 원석입니다.",
    p5_style: "아이의 날카롭고 비판적인 질문을 '부모에 대한 반항이나 말대꾸'로 오인하여 억누르지 마십시오. 그 서늘한 예민함이야말로 시험장에서 남들이 보지 못하는 정답의 실마리를 포착해 내는 운명의 메스입니다. 아이의 까칠한 천재성을 다정하고 우아하게 에스코트하십시오.",
    talk_intro: "상대방의 말속에 숨긴 미세한 가식이나 자신을 통제하려는 얄팍한 뉘앙스를 0.01초 만에 스캔하여 마음의 자물쇠를 걸어 잠그는 고성능 레이더망입니다.",
    talk_rule: "아이의 정당한 의구심을 말대꾸로 치환하여 찍어 누르는 『어디서 어른한테 따박따박 말대꾸야?』 식의 언어적 억압을 절대 봉인하십시오."
  },
  壬: { 
    name: "임수(壬水)", nature: "거대한 해류의 흐름을 설계하는 깊은 심연의 바다", 
    p1_style: "파편화된 단순 암기를 극도로 경멸하고 지식의 [근원적인 원리와 거시적인 빅픽처 맥락]을 완벽하게 관통해야만 뇌가 비로소 가동되는 '임수(壬水)'의 명식입니다. 공식의 도출 배경을 설명해 주지 않고 무작정 '풀이법 외워'라고 윽박지르면 뇌 신경망이 파업에 돌입하며, 해당 과목의 전체 지도를 먼저 펼쳐 납득시켜야 지능이 회전하는 심연의 학자입니다.",
    p5_style: "아이가 멍하니 허공을 보며 진도를 안 나간다고 윽박지르지 마십시오. 바다는 표면이 잔잔해 보여도 심연에서는 거대한 해류의 물길을 설계하고 있는 법입니다. 얄팍한 문제 풀이 스킬을 주입하는 대신, 이 지식이 세상의 어떤 진리와 연결되는지 거대한 지적 화두를 던져주십시오.",
    talk_intro: "자신의 깊고 복잡한 사고 체계를 얕은 잣대로 속단당하는 것을 극도로 꺼리며, 지적인 대등함을 전제로 한 수평적 토론 주파수를 갈망합니다.",
    talk_rule: "아이의 깊은 고민을 헛소리로 치부해 버리는 『쓸데없는 잡생각 할 시간에 영어 단어 하나 더 외워』 식의 사고 정지 언어를 소각하십시오."
  },
  癸: { 
    name: "계수(癸水)", nature: "틀을 깨부수며 어디로든 스며드는 촉촉한 영감의 비", 
    p1_style: "기존의 정형화된 공식을 비틀어 남들이 상상조차 못 한 기발한 패턴으로 정답을 찍어내는 '계수(癸水)'의 돌연변이 천재형 명식입니다. 가만히 앉아 정적이고 수동적으로 강사의 활자만 받아 적는 주입식 환경은 아이의 영재성을 완벽하게 질식시키며, 수평적인 문답과 엉뚱한 상상력이 허용되는 자유로운 무대에서 뇌파가 최고조로 활성화됩니다.",
    p5_style: "남들과 똑같은 정석적인 방식으로 해설지를 풀지 않는다고 아이의 궤적을 규격화하려 들지 마십시오. 계수의 영재성은 규격을 파괴하는 틈새에서 뿜어져 나옵니다. 아이의 기발하고 기괴한 풀이 패턴을 경이로운 눈빛으로 감상해 주십시오. 압도적 도약은 거기서 출발합니다.",
    talk_intro: "딱딱하고 일방적인 훈계성 잔소리가 귓가에 울리면 청각 신경을 강제로 오프라인으로 끄고 자체 명상에 들어가는 회피형 방어 기제를 지녔습니다.",
    talk_rule: "아이의 기발한 발상을 정색하며 자르는 『제발 튀지 말고 남들 하는 것만큼만 평범하게 해』 식의 평균화 주파수를 영구 유배 보내십시오."
  }
};

// 🔥 [VVIP 퀀텀 에세이 매트릭스 2]: (과다 기운 $\times$ 결핍 처방) 교차 조립용 심층 본문 🔥
const EXCESS_MATRIX: Record<string, any> = {
  "목(나무)": { power: "지적 호기심이 쉴 새 없이 팽창하여 새로운 개념의 뼈대를 스펀지처럼 빨아들이는 [압도적인 지식 스케치 능력]을 과시합니다." },
  "화(불)": { power: "출제자의 의도를 0.1초 만에 직관적으로 꿰뚫어 보고 이를 타인에게 완벽한 언어로 설명해 내는 [폭발적인 인출 연산력]을 뿜어냅니다." },
  "토(흙)": { power: "남들이 나가떨어지는 지루한 반복 구간에서도 미동조차 하지 않고 엉덩이 코어로 버텨내는 [난공불락의 데이터 누적 지구력]을 보여줍니다." },
  "금(쇠)": { power: "감정에 휘둘리지 않는 서늘한 메타인지로 자신의 취약점과 킬러 문항의 함정을 냉혹하게 썰어내는 [외과수술적 논리 분석력]을 자랑합니다." },
  "수(물)": { power: "표면적 활자 이면에 숨은 학문의 근원적 맥락을 통째로 파싱하여 소음이 차단된 심야 시간에 슈퍼컴퓨터처럼 돌리는 [심연의 딥워크 몰입도]를 발휘합니다." }
};

const LACK_MATRIX: Record<string, any> = {
  "목(나무)": { 
    pain: "머릿속에 입력된 지식의 파편은 넘쳐나지만, 이를 목차화하여 기획하고 실행으로 옮기는 '시작의 뼈대 에너지'가 심각하게 방전되어 있습니다. 책을 펼치기까지의 예열 시간이 너무 길어 인풋 대비 아웃풋 병목이 발생합니다.", 
    step1: "【 무조건적인 A4 백지 목차 스케치 선행 】 본문을 읽기 전, 텅 빈 백지에 오늘 정복할 단원의 목차 뼈대만 10분 동안 거칠게 그려내는 '외과수술적 뼈대 세우기'를 강박 루틴으로 이식하십시오.", 
    step2: "【 시각적 바이오 성장 파동 주입 】 책상 앞 메인 시야에 위로 곧게 뻗은 생화 식물(스투키 등)을 배치하여 방전된 목(木) 기운의 생명력을 시신경에 실시간 링거 주입해야 합니다.", 
    step3: "【 10분 마이크로 앵커링 출발법 】 거창한 계획표를 찢어버리십시오. '딱 10분만 연필 쥐고 덮는다'는 가벼운 뇌파 해킹으로 굳어있는 실행 스위치를 인위적으로 점화시키십시오." 
  },
  "화(불)": { 
    pain: "지식을 머릿속에 적재하는 인풋 회로는 훌륭하나, 이를 시험장이라는 압박 공간에서 밖으로 내뱉고 증명하는 '출력(Output) 생체 전선'이 끊겨 있어 결정적인 순간 머릿속이 하얗게 굳어버리는 블랙아웃 슬럼프를 겪습니다.", 
    step1: "【 잔혹한 화이트보드 1타강사 인출법 】 눈으로 해설지를 바르는 가짜 공부를 당장 소각하십시오. 교재를 덮고 텅 빈 화이트보드 앞에서 허공에 대고 입으로 설명하지 못하는 지식은 100% 가짜 암기입니다.", 
    step2: "【 데스크 조명 온도 웜톤(Warm) 개조술 】 전두엽을 차갑게 얼리는 백색 형광등을 끄고, 은은하고 따뜻한 주황빛(3000K급) 스탠드 조명을 켜서 시신경을 통해 사주의 조후 열기를 강제 주입하십시오.", 
    step3: "【 도파민 펌핑 15초 예열 의식 】 연산을 시작하기 직전, 심박수를 미세하게 올려주는 경쾌한 템포의 음악을 딱 15초간 듣고 뇌 신경계에 인위적인 흥분 스파크를 튀기십시오." 
  },
  "토(흙)": { 
    pain: "지식을 단단하게 붙잡아두는 멘탈의 토대가 메말라 있어, 주변의 작은 소음이나 감정 기복에 집중력이 모래성처럼 바사삭 흩어지며 어제 외운 공식이 오늘 휘발되는 극심한 유지력 누수를 겪고 있습니다.", 
    step1: "【 시공간의 완벽한 기계적 앵커링 】 기분에 따라 스터디카페와 집을 오가는 동선을 소각하십시오. 매일 토시 하나 틀리지 않은 동일한 시간, 동일한 의자에 앉아 뇌가 해당 공간을 '연산 감옥'으로 자동 인식하게 잠그십시오.", 
    step2: "【 물리적 발바닥 접지(Grounding) 루틴 】 집중이 흩어질 때 펜을 놓지 마시고, 신발을 벗은 채 양 발바닥을 바닥에 10초간 무겁게 밀착시켜 지구의 중력 파동을 뇌파로 끌어올리는 훈련을 하십시오.", 
    step3: "【 시각적 상극 노이즈 디톡스 】 시야의 30%를 차지하는 매트나 커튼을 묵직한 오트밀 베이지나 브릭 톤으로 강제 통일하여 들뜨는 시신경 신경망을 차분하게 눌러주어야 합니다." 
  },
  "금(쇠)": { 
    pain: "공부하는 과정 자체는 나쁘지 않으나, 냉혹하게 정답을 마킹하고 자신의 논리적 실수를 인정하여 오답을 도려내는 '결단과 맺음의 에너지'가 부족하여 항상 2점짜리 실수로 등급이 미끄러지는 아킬레스건을 품고 있습니다.", 
    step1: "【 감정 진공 핀셋 오답 박제술 】 틀린 문제 앞에서 아쉬워하는 감정 회로를 차단하십시오. '내가 어느 지점의 논리를 누락했는가'를 딱 한 줄의 건조한 팩트로 기록하는 차가운 메스질이 필요합니다.", 
    step2: "【 뽀모도로 데드라인 타이머 인젝션 】 세월아 네월아 앉아있는 엉덩이 흉내를 멈추십시오. 25분 초집중 후 알람이 울리면 펜을 던지는 기계적 제약을 통해 뇌에 '전장(Battlefield)'의 긴장감을 각인시키십시오.", 
    step3: "【 메탈릭 물상 결계 구축 】 책상 위 메인 시야에 차갑고 무거운 스틸(Steel) 재질의 독서대나 아날로그 메탈 시계를 배치하여 원국에 부족한 금(金) 기운의 날카로움을 수혈받으십시오." 
  },
  "수(물)": { 
    pain: "표면적인 풀이법 암기에만 급급할 뿐 학문의 깊은 뿌리까지 파고드는 '이해의 심연 에너지'가 꽉 막혀있어, 조금만 낯선 변형 킬러 문항이 출제되면 시냅스 연결이 뚝 끊기며 멘탈이 정지하는 현상을 보입니다.", 
    step1: "【 심야 딥워크(Deep-work) 절대 고립 결계 】 전두엽 주변의 방해 전파가 가장 깨끗하게 소거되는 밤 10시 이후의 고요한 2시간을 강박적으로 확보하십시오. 이때는 스마트폰을 베란다에 유배 보내야 합니다.", 
    step2: "【 수면등 기반 하루 백지 스캔 명상 】 잠들기 직전 15분, 조도를 낮춘 방 안에서 오늘 공부한 핵심 공식의 뼈대를 눈을 감고 머릿속 스크린에 인쇄해 보는 정적인 복기 의식을 치르십시오.", 
    step3: "【 시각적 공해 소품 완전 격리술 】 화려한 캐릭터 문구류나 채도가 높은 잡동사니는 뇌파를 산만하게 찢는 공해입니다. 데스크 위를 무채색의 진공 상태로 완벽히 소거하십시오." 
  }
};

const ELEMENT_PRESCRIPTION: Record<string, any> = {
  "목(나무)": { color: "딥 그린, 터콰이즈", item: "원목 소재 가구, 뻗은 식물(스투키)", job: "기획, 교육, IT 개발, 건축", symbols: [{ emoji: "🌳", label: "성장 에너지" }, { emoji: "📈", label: "구조화 훈련" }] },
  "화(불)": { color: "피치 코랄, 인디고 핑크", item: "따뜻한 조명, 붉은 계열 소품", job: "방송, 미디어, 마케팅, 디자이너", symbols: [{ emoji: "🔥", label: "출력(Output)" }, { emoji: "🗣️", label: "티칭 학습법" }] },
  "토(흙)": { color: "오트밀 베이지, 브릭 레드", item: "푹신한 방석, 도자기, 정리 수납장", job: "행정, 금융 컨설팅, 부동산", symbols: [{ emoji: "⛰️", label: "고정 루틴" }, { emoji: "🗂️", label: "공간 정리" }] },
  "금(쇠)": { color: "스노우 화이트, 실버 그레이", item: "금속 재질의 거치대, 정교한 펜", job: "법조계, 데이터 분석, 의료", symbols: [{ emoji: "⚔️", label: "원리 분석" }, { emoji: "🧊", label: "감정 배제" }] },
  "수(물)": { color: "미드나잇 블루, 딥 퍼플", item: "노이즈 캔슬링 헤드폰, 가습기", job: "기획/전략, 심리 연구, 무역", symbols: [{ emoji: "🌊", label: "심야 딥워크" }, { emoji: "🎧", label: "외부 차단" }] },
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

// 입력값 안전 디코더
const safeDecode = (str: any) => {
  if (!str) return '';
  try { return decodeURIComponent(String(str)); } catch { return String(str || ''); }
};

const charToElement = (char: string) => {
  if (["甲", "乙", "寅", "卯"].includes(char)) return "목(나무)";
  if (["丙", "丁", "巳", "午"].includes(char)) return "화(불)";
  if (["戊", "己", "辰", "戌", "丑", "未"].includes(char)) return "토(흙)";
  if (["庚", "辛", "申", "酉"].includes(char)) return "금(쇠)";
  if (["壬", "癸", "亥", "子"].includes(char)) return "수(물)";
  return "수(물)";
};

const calculateAge = (birthDateStr: any) => {
  if (!birthDateStr) return 20; 
  const birthYear = parseInt(String(birthDateStr).split("-")[0], 10);
  const currentYear = new Date().getFullYear();
  return isNaN(birthYear) ? 20 : (currentYear - birthYear + 1); 
};

// 🔥 모든 변수에 DM_MATRIX 호환 및 안전 폴백 장착 완료 🔥
const PREVIEW_DATA: Record<number, any> = {
  1: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `명리학적 선천 황경 좌표 스캔 결과, ${u?.name || '고객'}님은 [${dm}·${dmObj.name}]의 지적 자아를 세팅받았습니다.\n${(dmObj.p1_style || '').slice(0, 80)}...\n원국 내 '${s?.lacking || '수(물)'}' 기운의 결핍으로 인해 인풋 대비 아웃풋 병목을 겪고 있습니다. 이 병목을 뚫어낼 선천 맞춤형 '예열 스위치'의 정체는 바로...`;
  },
  2: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `현재 ${u?.name || '고객'}님에게 남들과 똑같은 암기식 인강을 강요하는 것은 ${dmObj.name}의 잠재력을 질식시키는 행위입니다.\n원국 구조상 지식을 완벽히 내 것으로 박제하기 위해서는 반드시 이 일간만의 고유한 인출 훈련 회로가 가동되어야 합니다. 당신의 뇌 회로에 최적화된 '골든타임 학습법'은 바로...`;
  },
  3: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `사주 '물상대체론' 관점에서 ${dmObj.name}의 기운을 품은 책상 환경은 일반적인 셋업과 전혀 달라야 합니다.\n${u?.name || '고객'}님의 사주 원국에 가장 강력하게 공명하며 고요한 알파파 집중 모드를 가동할 책상 위 명당 소품은 바로...`;
  },
  4: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `시신경을 통해 흡수되는 색채의 파장은 ${dmObj.name}의 조후(온도와 습도 밸런스)를 결정짓는 생존 주파수입니다.\n${u?.name || '고객'}님이 책상 앞에서 피로감을 겪는 이유는 상극 컬러 독소 때문이며, 시야의 30%를 장악해 전두엽을 안정시킬 운명의 치유 컬러 계열은...`;
  },
  5: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `냉혹한 경쟁 자본주의 시장에서 ${dmObj.name}의 기운을 타고난 ${u?.name || '고객'}님이 남들을 압도할 수 있는 선천적 생존 무기는 따로 있습니다.\n평범한 톱니바퀴 부품이 아닌, 시장의 룰을 뒤흔들며 독보적인 몸값을 쟁취할 수 있는 대체불가 전문 직군은...`;
  },
  6: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    return `군중 속에서도 ${dmObj.name}을 부여받은 ${u?.name || '고객'}님에게는 타인에게 거부할 수 없는 지배력과 신뢰를 뿜어내는 선천적 리더십 주파수가 존재합니다.\n사람들의 마음을 완벽하게 무장 해제시켜 평생 내 편으로 묶어둘 제왕적 소프트파워의 핵심은...`;
  },
  7: (u: any, s: any) => {
    const dm = s?.dayMaster || '甲';
    const dmObj = DM_MATRIX[dm] || DM_MATRIX['甲'];
    // ✅ 버그 수정: 기존 코드의 talkObj(미정의 변수) 제거 → dmObj에서 직접 참조
    return `명리학적으로 일간 '${dm}'을 지닌 ${u?.name || '고객'}님의 뇌는 상대방이 뱉는 '특정 단어 파장'에 따라 전두엽이 열리거나 완벽하게 닫히는 양극단의 수용성을 보입니다.\n${(dmObj.talk_intro || '').slice(0, 80)}...\n상대방의 반항심을 0.1초 만에 무장 해제시키고 스스로 책상에 앉게 만들 '결정적 첫 마디'의 정체는 바로...`;
  },
};

// 🔥 [1차/2차 수술 완료]: 1만자급 대치동 1타 전문 컨설팅 논문 렌더링 엔진 🔥
// 🔥 [보강 개조 완료]: 요약 및 에필로그 3배 자동 팽창 렌더링 엔진 🔥
const generateProfessionalReport = (user: any, saju: any, menuId: number) => {
  const safeUser = user || {};
  const safeSaju = saju || {};
  const dm = safeSaju?.dayMaster || '甲';
  const lack = safeSaju?.lacking || '수(물)';
  const excess = safeSaju?.excessive || safeSaju?.main || '목(나무)';

  const dmData = DM_REPORT_DATA[dm]?.[menuId];
  if (!dmData) return [{ id: "s_fallback", title: "✨ 분석 중", paragraphs: ["데이터를 불러오는 중입니다."] }];

  const excessObj = EXCESS_MATRIX[excess] || EXCESS_MATRIX['목(나무)'];
  const lackObj   = LACK_MATRIX[lack]     || LACK_MATRIX['수(물)'];

  let elementCountsStr = "";
  if (safeSaju?.counts && typeof safeSaju.counts === 'object') {
    Object.entries(safeSaju.counts).forEach(([el, cnt]) => { elementCountsStr += `${el.charAt(0)}(${cnt}개) `; });
  }

  const p1Full = `${dmData.p1}\n\n현재 원국 오행 분포는 [ ${elementCountsStr.trim()} ] 로 스캔됩니다. 이 선천적 에너지 편향성이 일간의 작업 템포에 결정적인 기준점이 됩니다.`;
  const p2Full = `${dmData.p2}\n\n원국에서 가장 풍부한 '${excess}' 기운의 영향: ${excessObj.power}\n\n동시에 원국 내 결핍된 '${lack}' 기운의 영향: ${lackObj.pain}`;
  const p3Full = dmData.p3;

  // 🔥 [합성 1] VVIP 핵심 요약 및 처방 상징 (3단 매트릭스 자동 결속) 🔥
  const summaryParagraphs = [
    `【 1단계: 명식 코어 관통 】\n${dmData.summaryP || ''}`,
    `【 2단계: 상위 0.1% 생존 앵커링 】\n현재 타고난 '${dm}'의 연산 스레드가 세상의 기준에 꺾이지 않고 100% 가동되기 위해서는, 일상 속에서 불필요한 마이크로 노이즈를 완전히 차단해야 합니다. 위에서 제시한 솔루션은 단순한 조언이 아닌, 명식의 생존을 좌우하는 '절대적 행동 강령'입니다.`,
    `【 3단계: 데일리 몰입 주파수 동기화 】\n아래의 처방 상징(Symbol)을 스마트폰 배경화면이나 책상 가장 잘 보이는 곳에 시각적으로 박제해 두십시오. 시신경이 이 상징을 포착할 때마다 전두엽은 자동으로 최적의 몰입 알파파 상태로 재부팅됩니다.`
  ];

  // 🔥 [합성 2] 에필로그: VVIP 멘탈 코어 가이드 (심층 에세이 자동 결속) 🔥
  const epilogueParagraphs = [
    `${dmData.epilogue || ''}`,
    `👑 [마스터 차미미의 프라이빗 코어 메시지]\n"타인의 잣대와 세상이 정해놓은 얄팍한 평균의 속도에 흔들리지 마십시오. 위대한 건축물은 남들의 눈치를 보며 지어지지 않습니다. 당신이 품고 있는 이 압도적인 명식의 그릇을 온전히 신뢰하는 것, 압도적 도약은 오직 그 절대적 믿음 위에서만 피어납니다."`,
    `⚠️ [데이터 보안 및 열람 기한 안내]\n본 하이엔드 리포트는 고객님의 소중한 명식 자산을 보호하기 위해, 열람 시작일로부터 정확히 30일 후 DB에서 영구 소각(Auto-destruction) 처리됩니다. 기한이 만료되기 전 반드시 상단의 [PDF 영구 저장] 버튼을 눌러 개인 디바이스에 안전하게 박제해 두시기 바랍니다.`
  ];

  const summarySymbols = (dmData.symbols && dmData.symbols.length > 0)
    ? dmData.symbols
    : [{ emoji: "✦", label: "핵심 포인트" }, { emoji: "✦", label: "실천 전략" }];

  return [
    { id: "s1", title: dmData.title1, paragraphs: p1Full.split("\n\n").filter(Boolean) },
    { id: "s2", title: dmData.title2, paragraphs: p2Full.split("\n\n").filter(Boolean) },
    { id: "s3", title: dmData.title3, isHighlight: true, paragraphs: p3Full.split("\n\n").filter(Boolean) },
    { id: "s4", title: "🎯 VVIP 핵심 요약 및 처방 상징", isSummary: true, paragraphs: summaryParagraphs, symbols: summarySymbols },
    { id: "s5", title: "👑 에필로그: VVIP 멘탈 코어 가이드", paragraphs: epilogueParagraphs }
  ];
};


  

export default function App() {
  const [currentView, setCurrentView] = useState('intro');
  const [showReviewsExpanded, setShowReviewsExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPrintingLock, setIsPrintingLock] = useState(false); 
  const [isPgLoaded, setIsPgLoaded] = useState(false);
  const paymentTimerRef = useRef<any>(null);

  const [userInfo, setUserInfo] = useState(() => {
    try { 
      const backed = JSON.parse(localStorage.getItem('sajuApp_tempForm') || 'null');
      if (backed && typeof backed === 'object' && !Array.isArray(backed)) {
        return {
          name: String(backed.name || ''),
          birthDate: String(backed.birthDate || ''),
          birthTime: String(backed.birthTime || ''),
          calendarType: String(backed.calendarType || 'solar'),
          isTimeUnknown: Boolean(backed.isTimeUnknown),
          email: String(backed.email || ''),
          phone: String(backed.phone || '')
        };
      }
    } catch {}
    return { name: '', birthDate: '', birthTime: '12:00', calendarType: 'solar', isTimeUnknown: false, email: '', phone: '' };
  });

  const [userSaju, setUserSaju] = useState<any>({ 
    dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', 
    pillars: [
      { tH: '甲', tK: '갑', bH: '子', bK: '자' },
      { tH: '乙', tK: '을', bH: '丑', bK: '축' },
      { tH: '丙', tK: '병', bH: '寅', bK: '인' },
      { tH: '丁', tK: '정', bH: '卯', bK: '묘' }
    ], 
    counts: {'목(나무)':2, '화(불)':2, '토(흙)':2, '금(쇠)':1, '수(물)':1}, 
    isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: true 
  });
  
  const [selectedMenu, setSelectedMenu] = useState<any>(null);

  const getKidStorageKey = (name: string, date: string) => {
    const clean = String(name || "").replace(/[^a-zA-Z0-9가-힣]/g, '').trim();
    return `sajuApp_unlocked_${clean}_${date}`;
  };

  const [unlockedMenus, setUnlockedMenus] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    try { 
      const backed = JSON.parse(localStorage.getItem('sajuApp_tempForm') || 'null');
      if (backed && typeof backed === 'object' && !Array.isArray(backed)) {
        setUserInfo(prev => ({
          ...(prev || {}),
          name: String(backed?.name || ''),
          birthDate: String(backed?.birthDate || ''),
          birthTime: String(backed?.birthTime || '12:00'),
          calendarType: String(backed?.calendarType || 'solar'),
          isTimeUnknown: Boolean(backed?.isTimeUnknown),
          email: String(backed?.email || ''),
          phone: String(backed?.phone || '')
        }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (showTerms || showPrivacy) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showTerms, showPrivacy]);

  useEffect(() => {
    if ((window as any).PortOne) {
      setIsPgLoaded(true);
      return;
    }
    if (document.getElementById('portone-sdk')) return; 
    const script = document.createElement('script');
    script.id = 'portone-sdk';
    script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
    script.async = true;
    script.onload = () => setIsPgLoaded(true);
    script.onerror = () => console.warn("PG SDK Load failed");
    document.head.appendChild(script);
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
    if (userInfo?.name || userInfo?.birthDate) {
      try { 
        const cleanInfo = { ...userInfo, name: String(userInfo.name || '').replace(/\s+/g, ' ').trim() };
        localStorage.setItem('sajuApp_tempForm', JSON.stringify(cleanInfo)); 
      } catch {}
    }
  }, [userInfo]);

  useEffect(() => {
    setTimeout(() => { try { window.scrollTo(0, 0); } catch{} }, 50);
  }, [currentView, selectedMenu]);

  useEffect(() => {
    try { window.history.pushState(null, "", window.location.href); } catch {}
    const handlePopState = (e: any) => {
      setIsProcessing(false); setIsNavigating(false);
      if (currentView === 'result') {
        setSelectedMenu(null);
        setCurrentView('menu');
        try { window.history.pushState(null, "", window.location.href); } catch {}
      } else if (currentView === 'menu') {
        setCurrentView('intro');
        try { window.history.pushState(null, "", window.location.href); } catch {}
      }
    };
    
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) { setIsProcessing(false); setIsNavigating(false); }
    };
    
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [currentView]);

  const handlePaymentSuccess = async (savedUserInfo: any, savedUserSaju: any, savedMenu: any) => {
    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);

    const validUser = (savedUserInfo && typeof savedUserInfo === 'object') ? savedUserInfo : { name: '' };
    setUserInfo(validUser); setUserSaju(savedUserSaju); setSelectedMenu(savedMenu);
    
    const kidKey = getKidStorageKey(validUser?.name || '', validUser?.birthDate || '');
    
    setUnlockedMenus(prev => {
      let existing = [];
      try { 
        const parsed = JSON.parse(localStorage.getItem(kidKey) || '[]'); 
        existing = Array.isArray(parsed) ? parsed : [];
      } catch {}
      const nextUnlocked = Array.from(new Set([...existing, ...(prev || []), savedMenu?.id]));
      try { localStorage.setItem(kidKey, JSON.stringify(nextUnlocked)); } catch {}
      return nextUnlocked;
    });
    
    setCurrentView('result');

    try {
      const dbPromise = addDoc(collection(db, "paid_customers"), {
        customerName: validUser?.name || '',
        birthDate: validUser?.birthDate || '',
        purchasedMenu: String(savedMenu?.title || "").replace(/\n/g, ' '),
        sajuDayMaster: savedUserSaju?.dayMaster || '甲',
        paymentAmount: validUser?.name === '차미미마스터' ? 0 : 1000,
        paymentDate: new Date().toISOString()
      });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Blocked")), 3000));
      Promise.race([dbPromise, timeoutPromise]).catch(() => {});
    } catch {}

    alert("🎉 결제가 완료되었습니다!\n프라이빗 사주 컨설팅 결과를 확인하세요.");
  };

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const portonePaymentId = urlParams.get('paymentId');
      const isSuccess = urlParams.get('success');

      if (isSuccess === 'true' || !!portonePaymentId) {
        const lockKey = `processed_${portonePaymentId}`;
        if (sessionStorage.getItem(lockKey)) return;
        sessionStorage.setItem(lockKey, 'true');

        const myToken = sessionStorage.getItem('saju_pg_token');
        let savedUserInfo: any = { name: '' };
        try { 
          const rawObj = JSON.parse(localStorage.getItem('sajuApp_userInfo') || '{}'); 
          savedUserInfo = (rawObj && typeof rawObj === 'object') ? rawObj : { name: '' };
        } catch {}
        
        if (savedUserInfo?.name !== '차미미마스터' && portonePaymentId !== myToken) {
          alert("⚠️ 비정상적인 결제 접근이거나 세션이 만료되었습니다.");
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        try {
          const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju') || '{}');
          const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu') || '{}');
          if (savedUserInfo?.name && savedMenu?.id) {
            handlePaymentSuccess(savedUserInfo, savedUserSaju, savedMenu);
          }
        } catch {}
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {}
  }, []);

  const fetchSajuFromAPI = async (dateStr: string, timeStr: string, isUnknown: boolean, calType: string) => {
    return new Promise(async (resolve) => {
      if (!(window as any).Lunar) {
        if (!document.getElementById('lunar-script')) {
          await new Promise((res) => {
            const script = document.createElement('script');
            script.id = 'lunar-script';
            script.src = 'https://cdn.jsdelivr.net/npm/lunar-javascript/lunar.js';
            script.onload = () => res(true); 
            script.onerror = () => { alert("통신이 원활하지 않습니다. 새로고침 후 다시 시도해주세요."); res(false); };
            document.head.appendChild(script);
          });
        }
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

          const isNightRollover = !isUnknown && hour === 23;
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
          const lacking = (remaining.length > 0 && remaining[0]) ? remaining[0][0] : "수(물)";

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
            pillars: [{ tH: '甲', tK: '갑', bH: '子', bK: '자' }, { tH: '乙', tK: '을', bH: '丑', bK: '축' }, { tH: '丙', tK: '병', bH: '寅', bK: '인' }, { tH: '丁', tK: '정', bH: '卯', bK: '묘' }], 
            counts: {'목(나무)':2, '화(불)':2, '토(흙)':2, '금(쇠)':1, '수(물)':1}, isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: true 
          });
        }
      }, 300);
    });
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = String(userInfo?.name || '').replace(/\s+/g, ' ').trim().slice(0, 10);
    if (!safeName) return alert("정확한 이름을 입력해주세요.");
    if (!userInfo?.birthDate) return alert("생년월일을 입력해주세요.");
    
    const bYear = parseInt(String(userInfo.birthDate).split('-')[0], 10);
    if (isNaN(bYear) || bYear < 1901 || bYear > 2049) return alert("1901년 ~ 2049년 사이의 생년월일만 정밀 연산이 가능합니다.");

    const safeTime = userInfo?.isTimeUnknown ? "12:00" : (userInfo?.birthTime || "12:00");
    
    setIsProcessing(true); setImgFailed(false); 
    setCurrentView('calculating');

    try {
      const sajuResult: any = await fetchSajuFromAPI(userInfo.birthDate, safeTime, Boolean(userInfo?.isTimeUnknown), userInfo?.calendarType || 'solar');
      
      setUserInfo(prev => ({ ...(prev || {}), name: safeName }));
      setUserSaju(sajuResult || {
        dayMaster: '甲', main: '목(나무)', lacking: '수(물)', excessive: '목(나무)', 
        pillars: [{ tH: '？', tK: '？', bH: '？', bK: '？' }], counts: {}, isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: true
      });

      const kidKey = getKidStorageKey(safeName, userInfo.birthDate);
      let kidUnlocked = [];
      try { 
        const parsed = JSON.parse(localStorage.getItem(kidKey) || '[]'); 
        kidUnlocked = Array.isArray(parsed) ? parsed : [];
      } catch {}
      setUnlockedMenus(kidUnlocked);

    } catch (err) {
      alert("연산 병목이 발생했습니다. 안전 폴백 모드로 결과를 오픈합니다.");
    } finally {
      setIsProcessing(false);
      setCurrentView('menu');
    }
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
    const cleanEmail = String(userInfo?.email || '').trim().toLowerCase();
    const cleanPhone = String(userInfo?.phone || '').replace(/[^0-9]/g, '');

    if (!cleanEmail || !cleanPhone) return alert("안전한 결제 내역 발송을 위해\n이메일과 휴대폰 번호를 올바르게 입력해주세요.");
    if (/[^\x00-\x7F]/.test(cleanEmail)) return alert("이메일 주소에 한글이나 특수문자가 포함될 수 없습니다. 영문 이메일로 다시 확인해주세요.");

    if (isProcessing) return; 
    setIsProcessing(true);

    if (userInfo?.name === '차미미마스터') {
      alert("👑 마스터 권한 확인: 결제를 건너뛰고 VVIP 리포트를 즉시 오픈합니다.");
      await handlePaymentSuccess(userInfo, userSaju, selectedMenu);
      setIsProcessing(false);
      return;
    }

    const paymentId = `payment_${new Date().getTime()}`;
    sessionStorage.setItem('saju_pg_token', paymentId);

    try { localStorage.setItem('sajuApp_userInfo', JSON.stringify({...userInfo, email: cleanEmail, phone: cleanPhone})); } catch {}
    try { localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju)); } catch {}
    try { localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu)); } catch {}

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
        orderName: `VVIP 사주 컨설팅 - ${String(selectedMenu?.title || '').replace('\n', ' ')}`,
        totalAmount: 1000,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: window.location.origin + window.location.pathname + '?paymentId=' + paymentId + '&success=true',
        customer: { fullName: userInfo?.name || '', email: cleanEmail, phoneNumber: cleanPhone },
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
    setTimeout(() => { setIsPrintingLock(false); }, 5000); 
  };

  const handleCopyLink = async () => {
    const safeSaju = userSaju || {};
    const studyType = CHILD_STUDY_MAP[safeSaju?.dayMaster || '甲'] || CHILD_STUDY_MAP["甲"];
    const textToCopy = `[대치동 시크릿 기질 컨설팅]\n우리아이 사주 공부유형 진단 완료! 🌙\n\n👤 이름: ${userInfo?.name || '고객'}\n✨ 기질 유형: ${studyType?.title || ''}\n\n우리 아이의 타고난 천재성과 공부법을 무료로 확인해보세요!\n👉 https://${window.location.host}?utm_source=viral_share`;

    const executeFallbackCopy = () => {
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy); dummy.value = textToCopy; dummy.select();
      document.execCommand("copy"); document.body.removeChild(dummy);
      alert('✨ 우리 아이 기질 분석 결과가 클립보드에 복사되었습니다!\n단톡방이나 SNS에 붙여넣기 해보세요.');
    };

    if (navigator.share) {
      try {
        await navigator.share({ title: '우리 아이 기질 분석', text: textToCopy });
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => alert('✨ 결과가 클립보드에 복사되었습니다!')).catch(() => executeFallbackCopy());
          } else { executeFallbackCopy(); }
        }
      }
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => alert('✨ 결과가 클립보드에 복사되었습니다!')).catch(() => executeFallbackCopy());
      } else { executeFallbackCopy(); }
    }
  };

  const safeSaju = userSaju || {};
  const currentStudyType = CHILD_STUDY_MAP[safeSaju?.dayMaster || '甲'] || CHILD_STUDY_MAP["甲"] || {
    title: "진단 결과", emoji: "✨", trait: "기질을 분석하고 있습니다.", imgUrl: ""
  };
  const safeUnlocked = Array.isArray(unlockedMenus) ? unlockedMenus : [];

  return (
    <div className="min-h-[100dvh] text-[rgba(255,255,255,0.88)] font-sans relative bg-[#021027] print:bg-white print:text-black print:block print:min-h-0 print:h-auto">
      <Starfield />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', 'Nanum Myeongjo', serif !important; }
        .font-sans { font-family: 'Noto Sans KR', sans-serif !important; }
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
          * { letter-spacing: -0.02em !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; font-family: 'Noto Serif KR', 'Nanum Myeongjo', serif !important; }
          html, body, #root, .min-h-screen { display: block !important; position: static !important; height: auto !important; min-height: 0 !important; overflow: visible !important; background-color: #FDFBF7 !important; color: #111625 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; background-color: #FDFBF7 !important; color: #111625 !important; }
          .print-cover { page-break-after: always; height: 95vh; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 2px solid #E8C87A; padding: 40px; margin: 20px; box-sizing: border-box; }
          h5 { page-break-after: avoid !important; break-after: avoid !important; }
          .print-section { page-break-inside: auto; margin-bottom: 30px; }
        }
      `}} />

      <div className="no-print relative z-10">
        {/* INTRO VIEW */}
        {currentView === 'intro' && (
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] px-6 py-12 max-w-md mx-auto">
            
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

            <div className={`w-full glass-card rounded-[24px] p-6 relative overflow-hidden ${isProcessing ? 'pointer-events-none opacity-80 select-none' : ''}`}>
              <form onSubmit={handleStart} className="space-y-4">
                <div>
                  <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold mb-2 flex items-center gap-1">👤 이름</label>
                  <input type="text" placeholder="이름을 입력해주세요" required maxLength={10}
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-4 py-3.5 outline-none"
                    value={userInfo?.name || ''} onChange={(e) => setUserInfo(prev => ({ ...(prev || {}), name: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">🗓 생년월일</label>
                    <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-0.5 gap-0.5">
                      {['solar', 'lunar', 'leap'].map(type => (
                        <button key={type} type="button" onClick={() => setUserInfo(prev => ({ ...(prev || {}), calendarType: type }))}
                          className={`text-[9.5px] font-bold px-2 py-1 rounded transition-colors ${userInfo?.calendarType === type ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-gray-400'}`}>
                          {type === 'solar' ? '양력' : type === 'lunar' ? '음력' : '윤달'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input type="date" required
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-3 py-3.5 outline-none [color-scheme:dark]"
                    value={userInfo?.birthDate || ''} onChange={(e) => setUserInfo(prev => ({ ...(prev || {}), birthDate: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">⏰ 태어난 시</label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-[#E8C87A]"
                        checked={Boolean(userInfo?.isTimeUnknown)} onChange={(e) => setUserInfo(prev => ({ ...(prev || {}), isTimeUnknown: e.target.checked, birthTime: e.target.checked ? '' : (prev?.birthTime || '') }))} />
                      <span className={`text-[10.5px] font-bold ${userInfo?.isTimeUnknown ? 'text-[#E8C87A]' : 'text-gray-400'}`}>모름</span>
                    </label>
                  </div>
                  <input type="time" disabled={Boolean(userInfo?.isTimeUnknown)}
                    className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[16px] md:text-[13.5px] px-3 py-3.5 outline-none [color-scheme:dark] disabled:opacity-30"
                    value={userInfo?.birthTime || ''} onChange={(e) => setUserInfo(prev => ({ ...(prev || {}), birthTime: e.target.value }))}
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
          <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center">
            <div className="w-8 h-8 border-4 border-[#E8C87A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="font-serif text-lg font-bold text-[#E8C87A]">운명의 궤적을 분석 중입니다...</h2>
          </div>
        )}

        {currentView === 'menu' && (
          <div className="min-h-[100dvh] pt-8 px-5 pb-16 max-w-md mx-auto">
            <h2 className="font-serif text-lg font-bold text-[#E8C87A] mb-4 text-center">
              🌟 <span className="max-w-[130px] truncate align-middle inline-block">{userInfo?.name || '고객'}</span> 님의 사주 진단 결과
            </h2>
            
            {Boolean(safeSaju?.isNightRollover) && (
              <div className="bg-[#D4A843]/10 border border-[#D4A843]/40 text-[#D4A843] text-[10.5px] py-1 px-3 rounded-full mb-3 text-center font-bold">
                🌙 명리학 [야자시/조자시] 보정 좌표 적용 완료
              </div>
            )}

            <div className="glass-card rounded-2xl p-4 mb-4 overflow-x-auto">
              <div className="flex justify-around text-center min-w-[280px]">
                {(Array.isArray(safeSaju?.pillars) ? safeSaju.pillars : []).map((pillar: any, idx: number) => (
                  <div key={idx} className="flex flex-col justify-center px-2">
                    <div className="text-xl font-serif font-bold text-white leading-none">{pillar?.tH || '？'}</div>
                    <div className="text-[10px] text-[#E8C87A] mb-1 font-sans">{pillar?.tK || '？'}</div>
                    <div className="text-xl font-serif font-bold text-white leading-none">{pillar?.bH || '？'}</div>
                    <div className="text-[10px] text-[#E8C87A] font-sans">{pillar?.bK || '？'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1530] rounded-[24px] p-6 relative mb-4 overflow-hidden text-center text-white shadow-xl border border-[#D4A843]/30">
              <span className="text-4xl block mb-2">{currentStudyType?.emoji || '✨'}</span>
              <div className="text-xs text-[#E8C87A] font-bold tracking-wider mb-1">십성(사주 성분) 기반 기질 매칭</div>
              <div className="text-xl font-bold text-gradient-gold mb-3 break-keep">{currentStudyType?.title || '진단 결과'}</div>
              <p className="text-[13px] text-gray-300 bg-white/5 p-3.5 rounded-xl leading-relaxed break-keep mb-6 border border-white/5">{currentStudyType?.trait || '기질을 분석하고 있습니다.'}</p>
              
              <div className="relative inline-block w-full max-w-[300px] mx-auto my-2">
                <div className="absolute inset-0 bg-[#D4A843] rounded-2xl blur-2xl opacity-35 animate-pulse"></div>
                {!imgFailed ? (
                  <img 
                    src={currentStudyType?.imgUrl || ''} 
                    alt={currentStudyType?.title || '타로카드'} 
                    onError={() => setImgFailed(true)} 
                    style={{ width: '100%', maxWidth: '300px', height: 'auto', maxHeight: '450px', objectFit: 'contain' }} 
                    className="relative z-10 rounded-2xl border-2 border-[#D4A843]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] transition-transform duration-500 hover:scale-[1.03]" 
                  />
                ) : (
                  <div className="relative z-10 flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-[#D4A843]/50 rounded-2xl w-full bg-[#0D0B1A] shadow-2xl">
                    <div className="w-14 h-14 rounded-full border border-[#D4A843] flex items-center justify-center text-[#D4A843] text-2xl mb-2 font-serif">✦</div>
                    <span className="text-sm text-[#D4A843] font-bold tracking-widest">[ {(currentStudyType?.title || '').split('[')[1] || "프라이빗 기질 엠블럼"}</span>
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
                const isUnlocked = safeUnlocked.includes(menu.id);
                const previewText = PREVIEW_DATA[menu.id] ? PREVIEW_DATA[menu.id](userInfo || {}, safeSaju || {}) : "";

                return (
                  <div 
                    key={menu.id} 
                    onClick={() => handleMenuSelect(menu)} 
                    className={`bg-[#111625] border border-[#D4A843]/30 rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 hover:border-[#D4A843] shadow-lg relative overflow-hidden group ${
                      menu.id === 7 ? "bg-gradient-to-r from-[#1A1530] to-[#2A1E14] border-2 border-[#D4A843]/50" : ""
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${menu.bar}`}></div>
                    
                    <div className="flex items-center justify-between mb-2 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#D4A843]/10 border border-[#D4A843]/20 flex-shrink-0">
                          {typeof menu?.icon === 'function' || typeof menu?.icon === 'object' ? React.createElement(menu.icon as any, { size: 18, className: "text-[#D4A843]", style: { flexShrink: 0 } }) : <span className="text-[#D4A843] font-bold text-sm">✦</span>}
                        </div>
                        <h4 className="font-serif text-sm font-bold text-white whitespace-pre-line leading-tight">{(menu?.title || '').replace('\n', ' ')}</h4>
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

{/* 4. RESULT VIEW (눈이 절대 안 아픈 KINFOLK 매거진 스타일의 웜크림 & 정제 화이트 테마) */}
        {currentView === 'result' && selectedMenu && (
          <div className="relative z-20 min-h-[100dvh] min-h-[750px] bg-[#FDFBF7] text-[#111625] pb-16 font-sans select-text animate-[sup_0.3s_cubic-bezier(0.34,1.56,0.64,1)] print:bg-white">
            
            {/* 상단 스티키 네비게이션 바 */}
            <div className="px-5 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EAE1D8] shadow-sm print:hidden">
              <button onClick={handleBackFromResult} className="p-2 bg-white hover:bg-gray-100 text-[#111625] border border-gray-200 rounded-full transition-colors">
                <ChevronLeft size={18}/>
              </button>
              <h2 className="font-serif font-black text-[16px] text-[#111625] tracking-wider text-center flex-1 px-4 truncate">
                {(selectedMenu?.title || '').replace('\n',' ')}
              </h2>
              <div className="w-8"></div>
            </div>

            <div className="max-w-xl mx-auto w-full p-5 sm:p-6 space-y-8">
              
              {Boolean(safeSaju?.isNightRollover) && (
                <div className="bg-[#C89830]/10 border border-[#C89830]/30 text-[#C89830] text-xs py-2.5 px-4 rounded-xl text-center font-bold tracking-wide print:hidden">
                  🌙 명리학 [야자시/조자시] 정밀 보정 좌표 적용 완료
                </div>
              )}

              {/* 잠김 상태일 때 보여주는 '리포트 핵심 요약 미리보기 (티저)' 박스 */}
              {!safeUnlocked.includes(selectedMenu.id) && (
                <div className="bg-white border-2 border-[#C89830]/40 rounded-2xl p-5 shadow-lg mb-6 relative overflow-hidden print:hidden">
                  <div className="absolute top-0 right-0 bg-[#C89830] text-white text-[10px] font-black px-3 py-1 rounded-bl-lg tracking-wider">
                    REPORT TEASER
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💡</span>
                    <h3 className="text-xs font-black text-[#C89830] tracking-tight">리포트 핵심 요약 미리보기</h3>
                  </div>
                  <p className="text-[13.5px] text-[#333333] leading-[1.85] font-normal break-keep text-justify whitespace-pre-line bg-[#FBF9F4] p-4 rounded-xl border border-[#EAE1D8]">
                    {PREVIEW_DATA[selectedMenu.id] ? PREVIEW_DATA[selectedMenu.id](userInfo || {}, safeSaju || {}) : "분석 요약을 불러옵니다."}
                  </p>
                </div>
              )}

              {/* 열렸을 때 보여주는 'PDF 소장 솔루션' 박스 */}
              {safeUnlocked.includes(selectedMenu.id) && (
                <div className="bg-[#111625] text-white border border-[#111625] p-5 rounded-2xl shadow-xl break-keep print:hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-[#E8C87A] tracking-widest flex items-center gap-1.5 font-serif">
                      <Download size={15}/> VVIP 리포트 영구 소장 솔루션
                    </span>
                    <span className="text-[10px] bg-[#E8C87A]/20 text-[#E8C87A] px-2.5 py-0.5 rounded-full font-bold">10,000자 단행본</span>
                  </div>
                  <p className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">
                    하단의 <strong className="text-white underline">PDF 저장</strong> 버튼을 클릭하신 후, 대상 프린터를 <strong className="text-[#E8C87A]">"PDF로 저장"</strong>으로 선택하시면 5장 분량의 프리미엄 전자책 포맷으로 완벽히 구워집니다.
                  </p>
                  <button onClick={downloadVVIPReport} disabled={isPrintingLock} className="w-full bg-gradient-to-r from-[#C89830] via-[#E8C050] to-[#C89830] text-[#111625] font-black text-sm py-3.5 rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                    📥 {isPrintingLock ? "🖨️ PDF 변환 엔진 가동 중... (잠시만 기다려주세요)" : "10,000자급 VVIP 리포트 PDF 영구 저장"}
                  </button>
                </div>
              )}

              {/* 본문 및 잠김 분기 영역 */}
              {!safeUnlocked.includes(selectedMenu.id) ? (
                /* 🔒 잠김 상태 UI (깔끔하고 고급스러운 웜크림톤) */
                <div className="space-y-5 print:hidden">
                  <div className="bg-gradient-to-r from-[#111625] to-[#1A1530] border border-[#C89830]/40 rounded-2xl p-6 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#C89830]/20 rounded-full blur-xl"></div>
                    <span className="text-4xl block mb-2 animate-bounce">🔒</span>
                    <h4 className="font-serif text-[#E8C87A] text-lg font-bold mb-1">본문 정밀 분석 잠김</h4>
                    <p className="text-xs text-gray-300 break-keep leading-relaxed px-2 font-sans">
                      위 요약본의 더 자세한 상위 0.1% 솔루션을 확인하시려면<br/>아래 결제하기를 통해 리포트를 영구 오픈해 주세요.
                    </p>
                  </div>

                  <div className="bg-white text-[#111625] rounded-2xl p-4 border border-[#EAE1D8] shadow-sm">
                    <div className="flex items-center justify-between mb-2.5 font-sans">
                      <div className="text-xs font-bold text-[#C89830]">💬 맘카페 내돈내산 리얼 후기</div>
                      <button onClick={() => setShowReviewsExpanded(!showReviewsExpanded)} type="button" className="text-[11px] text-gray-400 underline">
                        {showReviewsExpanded ? "접기 ▴" : "전체 후기 보기 ▾"}
                      </button>
                    </div>
                    <div className={`space-y-2 overflow-hidden transition-all font-sans ${showReviewsExpanded ? 'max-h-[800px]' : 'max-h-[190px]'}`}>
                      {REVIEWS.map(r => (
                        <div key={r.id} className="bg-[#FBF9F4] p-3 rounded-xl border border-[#EAE1D8] break-keep">
                          <div className="text-[10px] text-[#C89830] font-bold mb-1">{r.author} ({r.type})</div>
                          <div className="text-xs text-[#333333] leading-relaxed">{r.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`bg-white border-2 border-[#C89830]/40 rounded-2xl p-5 text-center shadow-xl relative ${isProcessing ? 'pointer-events-none opacity-80 select-none' : ''}`}>
                    <div className="text-xs text-gray-400 line-through mb-1 font-sans">정가 10,000원</div>
                    <div className="text-2xl font-serif font-black text-[#C89830] mb-4">1,000원 <span className="text-xs bg-[#C89830] text-white px-2.5 py-0.5 rounded-full font-sans font-black ml-1">90% 특가</span></div>
                    <input type="email" required placeholder="결제 내역 받을 이메일" value={userInfo?.email || ''} onChange={e=>setUserInfo(prev => ({ ...(prev || {}), email: e.target.value }))} className="w-full bg-[#FBF9F4] border border-[#EAE1D8] rounded-xl p-3.5 text-sm text-[#111625] placeholder-gray-400 mb-2.5 outline-none focus:border-[#C89830] focus:bg-white transition-all" />
                    <input type="tel" required placeholder="휴대폰 번호 (자유롭게 입력)" value={userInfo?.phone || ''} onChange={e=>setUserInfo(prev => ({ ...(prev || {}), phone: e.target.value }))} className="w-full bg-[#FBF9F4] border border-[#EAE1D8] rounded-xl p-3.5 text-sm text-[#111625] placeholder-gray-400 mb-5 outline-none focus:border-[#C89830] focus:bg-white transition-all" />
                    
                    {/* 👇 노란색 카드 결제 버튼 안전 탑재 완료 */}
                    <button onClick={() => handlePayment('카드')} disabled={isProcessing || !isPgLoaded} className="w-full bg-gradient-to-r from-[#FEE500] to-[#e6cf00] text-black font-black text-sm py-4 rounded-xl shadow-md active:scale-95 transition-all disabled:opacity-50 font-sans">
                      💳 {isPgLoaded ? "원본 포트원 안전 결제하기" : "PG 모듈 안전 로딩 중..."}
                    </button>
                  </div>
                </div>
              ) : (
                /* 🔓 열람 가능 본문 UI (눈이 절대 안 아픈 KINFOLK 매거진 웜크림 & 화이트 테마) */
                <div className="space-y-6">
                  {(Array.isArray(generateProfessionalReport(userInfo || {}, safeSaju || {}, selectedMenu.id)) ? generateProfessionalReport(userInfo || {}, safeSaju || {}, selectedMenu.id) : []).map((section: any, idx: number) => {
                    
                    // [요약 및 상징 카드 테마 - 따뜻한 베이지 & 골드 라인]
                    if (section?.isSummary) {
                      return (
                        <div key={idx} className="bg-white border-[2px] border-[#C89830] rounded-[24px] p-7 sm:p-8 shadow-lg my-10 relative overflow-hidden print:break-inside-avoid">
                          <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-[#C89830] via-[#E8C050] to-[#C89830]"></div>
                          
                          <h4 className="font-serif text-lg font-black text-[#111625] mb-6 text-center flex items-center justify-center gap-2">
                            <Crown size={20} className="text-[#C89830]" /> {section?.title || ''}
                          </h4>
                          
                          <div className="space-y-4 mb-8 text-justify font-sans">
                            {(section?.paragraphs || []).map((pText: string, pIdx: number) => (
                              <p key={pIdx} className="text-sm sm:text-[15px] text-[#333333] leading-[1.85] break-keep whitespace-pre-line bg-[#FBF9F4] p-4 rounded-xl border border-[#EAE1D8]">
                                {pText}
                              </p>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 pt-5 border-t border-[#EAE1D8]">
                            {(Array.isArray(section?.symbols) ? section.symbols : []).map((sym: any, sIdx: number) => (
                              <div key={sIdx} className="flex flex-col items-center bg-[#FBF9F4] p-3.5 rounded-2xl border border-[#EAE1D8] shadow-sm">
                                <span className="text-3xl sm:text-4xl mb-2 block">{sym?.emoji || '✦'}</span>
                                <span className="text-xs font-bold text-[#111625] break-keep text-center tracking-tight">{sym?.label || ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // [일반 본문 카드 테마 - 눈이 편안한 정제 화이트 바탕에 진회색 텍스트]
                    return (
                      <div key={idx} className={`rounded-[22px] p-7 sm:p-8 transition-all duration-300 ${
                        section?.isHighlight 
                          ? 'bg-[#FBF9F4] border-2 border-[#C89830]/60 shadow-xl' 
                          : 'bg-white border border-[#EAE1D8] shadow-sm'
                      }`}>
                        <h4 className="font-serif text-[17px] sm:text-lg font-black text-[#111625] mb-5 tracking-wide border-b border-[#EAE1D8] pb-3 flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-[#C89830] rounded-full inline-block"></span>
                          {section?.title || ''}
                        </h4>

                        {(Array.isArray(section?.paragraphs) ? section.paragraphs : []).map((text: any, pIdx: number) => {
                          const safeText = String(text || '');
                          
                          // 소제목 하이라이트 블록 【 ... 】 (촌스러운 빨간색/누런색 소각 -> 세련된 라이트 스톤 캡슐)
                          if (safeText.startsWith('【')) {
                            return (
                              <h5 key={pIdx} className="font-serif text-[15px] sm:text-[16px] font-black text-[#8C6B28] bg-[#F5F0E6] border border-[#E6DFD3] inline-block px-3.5 py-1.5 rounded-lg shadow-sm mt-8 mb-3 tracking-tight" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>
                                {safeText.replace('【', '').replace('】', '')}
                              </h5>
                            );
                          }

                          // 가독성 극대화 차콜 진회색(#333333) 텍스트
                          return (
                            <p key={pIdx} className="font-sans text-[14.5px] sm:text-[15.5px] text-[#333333] leading-[1.85] tracking-[-0.01em] mb-4 last:mb-0 text-justify break-keep whitespace-pre-line">
                              {safeText}
                            </p>
                          );
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
      {currentView === 'result' && selectedMenu?.id && safeUnlocked.includes(selectedMenu.id) && (
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
                <span className="max-w-[180px] truncate whitespace-nowrap text-right">{(userInfo?.name || '').replace(/\s+/g, '')} 님</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">생년월일</span><span>{userInfo?.birthDate || ''} ({userInfo?.calendarType === 'solar' ? '양력' : userInfo?.calendarType === 'lunar' ? '음력' : '윤달'})</span></div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">일간 기운</span><span>{safeSaju?.dayMaster || '甲'} ({(DM_MATRIX[safeSaju?.dayMaster || '甲']||{}).name || ''})</span></div>
              <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="text-[#C89830] font-bold">선택 리포트</span><span>{(selectedMenu?.title || '').replace('\n', ' ')}</span></div>
            </div>
            <div className="text-gray-400 text-[10px] tracking-widest text-center">HAPPY MERRY BELL</div>
          </div>

          <div className="p-10 bg-[#FDFBF7]">
            {(Array.isArray(generateProfessionalReport(userInfo || {}, safeSaju || {}, selectedMenu.id)) ? generateProfessionalReport(userInfo || {}, safeSaju || {}, selectedMenu.id) : []).map((section: any, idx: number) => (
              <div key={idx} className="print-section mb-10">
                <h2 className="text-[14pt] font-black text-[#111625] border-l-[5px] border-[#C89830] pl-3 mb-4">{section?.title || ''}</h2>
                {(Array.isArray(section?.paragraphs) ? section.paragraphs : []).map((p: any, pIdx: number) => {
                  const strP = String(p || '');
                  if (strP.startsWith('【')) {
                    return <h5 key={pIdx} className="text-[11pt] font-black text-[#A84050] mt-6 mb-2" style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}>{strP}</h5>;
                  }
                  return <p key={pIdx} className="text-[10pt] leading-[1.7] mb-3 text-[#333] text-justify break-keep whitespace-pre-line">{strP}</p>;
                })}

                {section?.isSummary && section?.symbols && (
                  <div className="flex justify-center gap-6 mt-8">
                    {(Array.isArray(section?.symbols) ? section.symbols : []).map((sym: any, sIdx: number) => (
                      <div key={sIdx} className="flex flex-col items-center text-center max-w-[80px]">
                        <div className="w-[52px] h-[52px] rounded-full border border-[#C89830] flex items-center justify-center text-[24px] mb-1.5 bg-white shadow-sm">
                          {sym?.emoji || '✦'}
                        </div>
                        <span className="text-[8.5pt] font-bold text-[#111625] px-2.5 py-0.5 bg-[#F0EBE1] rounded-full border border-[#d6d0c4] break-keep leading-tight">
                          {sym?.label || ''}
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
