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

const DM_MATRIX: Record<string, any> = {
  甲: { name: "갑목(甲木)", nature: "하늘을 뚫고 오르는 거대한 소나무", core: "타인의 통제나 억압을 극도로 혐오하며, 본인이 납득한 목표를 향해 불도저처럼 밀어붙이는 개척자적 자아를 세팅받았습니다.", talk: "직접적인 명령이나 통제 언어에 전두엽이 가장 먼저 닫히며 반발심이 폭발하는 주파수를 지녔습니다.", weakness: "유연성 부재와 타협 거부" },
  乙: { name: "을목(乙木)", nature: "척박한 바위도 뚫고 번식하는 끈질긴 넝쿨", core: "주변 환경과 공기에 완벽하게 동기화되는 스펀지 같은 흡수력을 지녔으며, 강압적인 압박보다 유연한 분위기 속에서 천재성이 폭발합니다.", talk: "자신의 감정을 인정받지 못한다고 느낄 때 귀를 닫아버리며, 따뜻한 교감 주파수에 가장 긍정적으로 반응합니다.", weakness: "타인의 시선에 의한 주체성 흔들림" },
  丙: { name: "병화(丙火)", nature: "세상을 환하게 비추는 눈부신 태양", core: "타인의 시선과 칭찬을 도파민 삼아 폭발적으로 성장하며, 스스로 주도하여 남에게 설명하고 과시할 때 지적 능력이 극대화됩니다.", talk: "본인의 자존심을 긁거나 남과 비교하는 순간 이성적 판단을 멈추고 감정의 불덩이로 변모하는 레이더를 가졌습니다.", weakness: "감정 기복에 따른 극단적 컨디션 난조" },
  丁: { name: "정화(丁火)", nature: "어둠을 파고드는 예리한 심야의 모닥불", core: "한 번 꽂힌 대상에 대해 끝을 보는 집요함과 완벽주의를 타고났으며, 남들이 방해하지 않는 고요한 시공간에서 잠재력이 만개합니다.", talk: "표면적으로는 순응하는 척하지만 내면에 논리적 의구심을 날카롭게 품고 있어, 강압적 명분에는 결코 굴복하지 않습니다.", weakness: "내면의 스트레스 누적과 예민함" },
  戊: { name: "무토(戊土)", nature: "흔들림 없이 만물을 품어내는 거대한 태산", core: "얕은 잔재주를 혐오하며 우직하고 묵묵하게 본인만의 루틴을 쌓아 올릴 때 누구도 넘볼 수 없는 거대한 성취를 쟁취하는 그릇입니다.", talk: "급격한 변화나 잦은 잔소리에 피로감을 느끼며, 한 번 믿음을 준 존재의 묵직한 조언만을 선별하여 흡수합니다.", weakness: "변화에 대한 둔감함과 아집" },
  己: { name: "기토(己土)", nature: "모든 지식을 배양해 내는 비옥한 평야", core: "비상한 기억력과 디테일을 잡아내는 섬세함을 타고났으나, 틀리는 것에 대한 두려움이 커서 완벽한 안전망이 주어져야 실력을 발휘합니다.", talk: "본인의 실수를 예리하게 찌르는 팩트 폭격에 심하게 상처받으며, 다정하고 포용적인 쿠션 언어를 필요로 합니다.", weakness: "실패에 대한 공포와 지나친 신중함" },
  庚: { name: "경금(庚金)", nature: "강인한 무쇠", strength: "결단력, 실행력", core: "확실한 보상과 즉각적인 결과물이 주어질 때 눈빛이 돌변하는 실전파 경주마로, 추상적인 목표보다 현실적인 타겟을 부숴나가는 데 능합니다.", talk: "감정적인 호소나 비논리적인 잔소리를 완벽한 소음으로 차단하며, 간결하고 명확한 목표 지향적 화법에만 반응합니다.", weakness: "공감 능력 부재와 지나친 결과 중심주의" },
  辛: { name: "신금(辛金)", nature: "작은 흠집도 용납하지 않는 예리한 보석", core: "고도의 예민함과 날카로운 직관력으로 지식의 빈틈을 핀셋처럼 짚어내며, 획일적인 교육을 거부하는 초정밀 완벽주의자입니다.", talk: "가장 미세한 어조의 변화나 자신을 무시하는 듯한 뉘앙스를 0.1초 만에 감지하고 마음의 문을 차갑게 닫아버립니다.", weakness: "자기중심적 방어 기제와 날카로움" },
  壬: { name: "임수(壬水)", nature: "거대한 흐름을 관망하는 깊고 넓은 바다", core: "단순 암기를 경멸하고 지식의 근원적인 원리와 거시적인 빅픽처를 이해해야만 비로소 시냅스가 연결되는 심연의 설계자입니다.", talk: "본인의 깊은 생각을 얕은 잣대로 평가받는 것을 혐오하며, 독립적인 사고 시간을 보장해 주는 대화법을 갈망합니다.", weakness: "생각이 너무 많아 실행이 지연되는 병목" },
  癸: { name: "계수(癸水)", nature: "어디로든 스며들어 틀을 깨는 촉촉한 봄비", core: "남들이 생각지 못한 기발한 패턴으로 정답을 유추해 내는 직관적 천재성이 다분하며, 가만히 앉아 듣기만 하는 환경에서 뇌가 굳어버립니다.", talk: "규칙을 강요하는 억압적 언어에 가장 먼저 질식하며, 상상력을 존중해 주는 부드러운 유도 질문에 천재성을 드러냅니다.", weakness: "지구력 고갈과 쉬운 피로감" }
};

const EXCESS_MATRIX: Record<string, any> = {
  "목(나무)": { power: "지적 호기심이 폭발적으로 팽창하며, 한 번 시작한 과제에 대해 놀라운 속도로 지식의 뼈대를 확장해 나가는 무한한 흡수력", risk: "너무 많은 것에 관심이 쏠려 정작 중요한 핵심 마무리가 흐지부지되는 산만함" },
  "화(불)": { power: "복잡하게 꼬인 문제의 핵심을 0.1초 만에 직관적으로 꿰뚫어 보고, 이를 타인에게 완벽한 논리로 출력(설명)해 내는 폭발적인 인출 능력", risk: "감정의 기복에 따라 컨디션이 극과 극을 달리며, 흥미를 잃는 순간 뇌파가 차갑게 식어버리는 현상" },
  "토(흙)": { power: "남들이 포기하는 지루한 구간에서도 흔들림 없이 엉덩이 힘으로 버텨내며 거대한 데이터베이스를 뇌 속에 차곡차곡 쌓아 올리는 극강의 지구력", risk: "새로운 트렌드나 풀이 방식의 변화를 유연하게 수용하지 못하고 기존의 비효율적 방식에 집착하는 고집" },
  "금(쇠)": { power: "감정에 휩쓸리지 않고 차가운 이성으로 상황을 객관화하며, 고난도 킬러 문항의 함정이나 비즈니스의 치명적 오류를 예리하게 썰어내는 분석력", risk: "결과와 보상에만 지나치게 집착하여 과정을 생략하려 들거나, 타인과의 타협을 거부하는 독단적 고립" },
  "수(물)": { power: "표면적인 활자에 얽매이지 않고 학문의 깊은 뿌리와 거시적인 통찰력을 끄집어내며, 소음이 차단된 심야 시간에 슈퍼컴퓨터처럼 작동하는 딥워크 연산력", risk: "행동으로 뱉어내기 전 생각의 심연에 너무 깊이 빠져들어 실행(Action) 타이밍을 놓치고 지연시키는 병목" }
};

const LACK_MATRIX: Record<string, any> = {
  "목(나무)": { pain: "머릿속에 파편화된 지식은 많으나 이를 체계적인 목차(뼈대)로 기획하고 구조화하는 시작의 에너지가 심각하게 고갈되어 있습니다.", step1: "【 무조건적인 목차 스케치 의식 】 어떤 과제든 본문부터 읽지 마십시오. 시작 전 10분간 A4 용지에 전체 뼈대와 목차만 거칠게 그려내는 구조화 훈련이 뇌파를 깨웁니다.", step2: "【 시각적 동기부여 세팅 】 책상 앞 메인 시야에 곧게 뻗은 식물(스투키 등)을 배치하여 성장 파동을 시신경에 강제 주입하십시오.", step3: "【 10분 컷 마이크로 시작법 】 거창한 계획은 독입니다. '딱 10분만 하고 덮는다'는 가벼운 최면으로 굳어있는 실행 스위치를 점화시켜야 합니다." },
  "화(불)": { pain: "인풋(Input)은 완벽하지만, 이를 밖으로 끄집어내어 표현하고 증명하는 출력(Output) 회로가 막혀 실전에서 하얗게 블랙아웃되는 치명적 병목을 겪습니다.", step1: "【 잔혹한 화이트보드 티칭법 】 활자를 눈으로 바르는 공부를 즉각 중단하십시오. 책을 덮고 벽에 대고 강사처럼 소리 내어 설명하지 못하는 지식은 100% 가짜입니다.", step2: "【 조명 온도 조절 디톡스 】 뇌를 차갑게 얼리는 백색 형광등을 끄고, 은은하고 따뜻한 웜톤(주황빛) 스탠드를 활용해 시신경에 인위적인 열기를 주입하십시오.", step3: "【 감정적 예열 의식 】 작업 돌입 전, 본인의 심박수를 미세하게 높일 수 있는 빠르고 경쾌한 리듬의 음악을 딱 1곡만 듣고 뇌에 도파민 스파크를 일으키십시오." },
  "토(흙)": { pain: "지식을 붙잡아두는 끈기와 토대가 메말라 있어, 분위기나 감정에 따라 집중력이 요동치며 어제 외운 내용이 오늘 증발하는 모래성 현상이 발생합니다.", step1: "【 지독한 환경 통제와 고정 루틴 】 기분 따라 장소를 옮기는 것은 자해 행위입니다. 매일 완벽히 동일한 시간, 동일한 의자에 앉아 뇌가 공간을 기계적으로 인식하게 만드십시오.", step2: "【 발바닥 접지(Grounding) 최면 】 공부 중 집중력이 날아갈 때, 신발을 벗고 두 발바닥을 바닥에 단단히 밀착시킨 채 10초간 묵직한 중력을 느끼는 앵커링을 가동하십시오.", step3: "【 컬러 파장 디톡스 】 방 안의 시야 30% 이상을 묵직하고 안정감을 주는 오트밀 베이지나 브릭 계열의 색상으로 교체하여 요동치는 시신경을 억눌러야 합니다." },
  "금(쇠)": { pain: "과정을 즐기지만 결과를 맺고 오답을 냉혹하게 도려내는 맺음의 에너지가 부족하여, 늘 2% 부족한 성취와 아쉬운 마무리를 반복하게 됩니다.", step1: "【 감정 배제 팩트 폭격 오답법 】 틀린 문제 앞에서 자책하는 감정 낭비를 소각하십시오. 실수한 원인을 '단 1줄의 차가운 팩트'로 박제하는 냉혹한 분석만이 살길입니다.", step2: "【 뽀모도로(Pomodoro) 단기 결전 】 시간을 늘어지게 쓰지 마십시오. 25분 초집중 후 5분 휴식이라는 기계적인 타이머를 도입해 인위적인 데드라인 압박감을 뇌에 꽂아 넣으십시오.", step3: "【 금속성 물상 대체술 】 책상 위 가장 눈에 띄는 명당에 묵직한 스틸(Steel) 재질의 거치대나 메탈 시계를 배치하여 부족한 결단력 파동을 흡수하십시오." },
  "수(물)": { pain: "지식의 깊은 원리를 탐구하는 심연의 에너지가 부족하여, 수박 겉핥기식의 얕은 이해에 머무르며 외부의 작은 소음에도 멘탈이 쉽게 바사삭 붕괴됩니다.", step1: "【 외부 차단 심야 딥워크(Deep-work) 결계 】 전두엽이 가장 안정화되는 늦은 밤 고요한 시간대를 강박적으로 확보하십시오. 이 시간만큼은 세상과 단절된 완벽한 고립이 필요합니다.", step2: "【 수면등 명상 루틴 】 잠들기 직전 15분, 방안의 불을 끄고 은은한 수면등 아래서 오늘 흡수한 지식을 머릿속 캔버스에 띄워보는 차분한 인출 의식을 치르십시오.", step3: "【 시각 노이즈 강제 삭제 】 화려하고 복잡한 패턴의 소품은 당신의 뇌파를 찢는 독가스입니다. 책상 위를 미니멀리즘의 극치로 비워내고 차분한 블루 계열로 시야를 정돈하십시오." }
};

const TALK_PRESCRIPTION: Record<string, any> = {
  "목(나무)": { pain: "자신의 성장을 방해받는다고 느낄 때 분노하며, 미래의 목표를 깎아내리는 단어에 0.1초 만에 뇌파를 닫습니다.", rule: "상대의 가능성을 의심하는 '네가 과연 할 수 있겠어?' 식의 발언을 영구 봉인하십시오." },
  "화(불)": { pain: "타인에게 인정받지 못하고 감정이 무시당할 때 폭발하며, 논리로 감정을 누르려 들면 극단적인 반항심이 솟구칩니다.", rule: "상대의 감정을 먼저 100% 수용한 뒤에 팩트를 전달하는 '쿠션 화법'을 반드시 장착하십시오." },
  "토(흙)": { pain: "갑작스러운 변화나 안정감을 뒤흔드는 일방적 지시를 혐오하며, 신뢰가 깨진 상대의 말은 완벽한 소음으로 차단합니다.", rule: "충분한 시간적 여유를 주고, 일관되고 묵직한 어조로 인과관계를 설명해야만 설득됩니다." },
  "금(쇠)": { pain: "비논리적인 감정 호소나 앞뒤가 안 맞는 잔소리를 경멸하며, 목표가 불분명한 훈계는 즉시 귓등으로 튕겨냅니다.", rule: "서론을 길게 빼지 마십시오. 감정을 철저히 배제하고 'A를 하면 B를 얻는다'는 명확한 팩트만 던지십시오." },
  "수(물)": { pain: "생각할 틈을 주지 않고 답변을 채근하거나 통제하려 들면, 심연으로 숨어버리듯 입을 닫고 완벽한 무반응으로 일관합니다.", rule: "질문을 던진 뒤 절대 재촉하지 마십시오. 스스로 답을 꺼낼 때까지 침묵으로 기다려주는 여백이 필요합니다." }
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
  "庚": { title: "보상이 확실해야 뛰는 [실전파 경주마형]", emoji: "🎯", trait: "눈앞에 확실한 보상(당근)이 주어져야 눈빛이 바뀝니다. 추상적인 동기부여는 통하지 않으며, 실전 모의고사 훈련 시 텐션이 오릅니다.", imgUrl: "https://i.ibb.co/bjPmLzZx/image.png" },
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

// 🔥 안전 디코더 🔥
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

// 🔥 오픈 루프 심리 해킹 티저 딕셔너리 🔥
const PREVIEW_DATA: Record<number, any> = {
  1: (user: any, saju: any) => `명리학적 선천 황경 좌표 스캔 결과, ${user.name}님은 만물을 뚫고 오르는 [${saju?.dayMaster}·${(DAY_MASTERS[saju?.dayMaster || '甲']||{}).name}]의 지적 자아를 세팅받았습니다.\n정해진 룰을 강요받을 때 전두엽이 굳어버리며, 원국 내 '${saju?.lacking}' 기운의 심각한 결핍으로 인해 인풋 대비 아웃풋 병목을 겪고 있습니다. 이 병목을 단 15분 만에 뚫어낼 선천 맞춤형 '예열 스위치'의 정체는 바로...`,
  2: (user: any) => `현재 ${user.name}님에게 남들과 똑같은 암기식 인강을 강요하는 것은 호랑이를 종이컵에 가두는 자해 행위입니다.\n원국 구조상 지식을 완벽히 내 것으로 박제하기 위해서는 반드시 [입력 30% : 출력 70%]의 외과수술적 인출 훈련 회로가 가동되어야 합니다. 당신의 뇌 회로에 최적화된 '골든타임 과목 배치술'은 바로...`,
  3: (user: any) => `사주 명리학의 '물상대체론' 관점에서 방의 풍수 파동이 꼬여있으면 아무리 의지력이 강해도 능률이 바닥으로 추락합니다.\n${user.name}님의 사주 원국에 얼어붙은 기운을 순식간에 녹여내고 고요한 알파파 집중 모드를 가동할 책상 위 명당 소품은 바로...`,
  4: () => `시신경을 통해 흡수되는 색채의 파장은 사주의 조후(온도와 습도 밸런스)를 결정짓는 생존 주파수입니다.\n책상 앞에서 극심한 피로감과 번아웃을 겪는 이유는 상극 컬러 독소 때문이며, 시야의 30%를 장악해 전두엽을 식혀줄 운명의 치유 컬러 계열은...`,
  5: (user: any) => `냉혹한 경쟁 자본주의 시장에서 ${user.name}님이 남들을 완벽히 압도할 수 있는 선천적 생존 무기는 따로 있습니다.\n평범한 톱니바퀴 부품으로 버려지지 않고 시장 전체의 룰을 뒤흔들며 독보적인 몸값을 쟁취할 수 있는 대체불가 전문 직군은...`,
  6: () => `군중 속에 고요히 섞여 있어도 타인에게 거부할 수 없는 지배력과 신뢰를 뿜어내는 선천적 권력 서열 주파수가 존재합니다.\n독선적인 폭군으로 붕괴되지 않고 사람들의 마음을 완벽하게 무장 해제시켜 평생 내 편으로 묶어둘 제왕적 소프트파워의 핵심은...`,
  7: (user: any, saju: any) => `명리학적으로 일간 '${saju?.dayMaster}'을 지닌 ${user.name}님의 뇌는 상대방이 뱉는 '특정 단어 파장'에 따라 전두엽이 열리거나 완벽하게 닫히는 양극단의 수용성을 보입니다.\n상대방의 반항심을 0.1초 만에 무장 해제시키고 스스로 책상에 앉게 만들 부모의 '결정적 첫 마디'의 정체는 바로...`,
};

// 🔥 1,750종 고유 결과지 동적 렌더링 퀀텀 매트릭스 에세이 조립 엔진 🔥
const generateProfessionalReport = (user: any, saju: any, menuId: number) => {
  const name = user?.name || "고객";
  const dmObj = DM_MATRIX[saju?.dayMaster] || DM_MATRIX['甲'];
  const lackObj = LACK_MATRIX[saju?.lacking] || LACK_MATRIX['수(물)'];
  const excessObj = EXCESS_MATRIX[saju?.excessive || saju?.main] || EXCESS_MATRIX['목(나무)'];
  const talkObj = TALK_PRESCRIPTION[saju?.lacking] || TALK_PRESCRIPTION['수(물)'];
  
  const userAge = calculateAge(user?.birthDate);
  const battleGround = userAge >= 20 ? "실전 비즈니스와 프로젝트 평가의 전장" : "잔혹한 입시와 수능의 전장";
  const ultimateGoal = userAge >= 20 ? "압도적 커리어 성과 도출" : "극상위권 1등급 도약";
  const timePhrase = user?.isTimeUnknown ? "태어난 시간의 제약을 초월한 선천 황경 좌표를" : `태어난 시인 [ ${user?.birthTime} ]의 우주적 에너지를`;

  let elementCountsStr = "";
  if (saju?.counts) {
    Object.entries(saju.counts).forEach(([el, cnt]) => { elementCountsStr += `${el.charAt(0)}(${cnt}개) `; });
  }

  let title1 = "", p1 = "", title2 = "", p2 = "", title3 = "", p3 = "", title4 = "🎯 VVIP 핵심 요약 및 처방 상징", p4 = "", title5 = "👑 에필로그: VVIP 멘탈 코어 가이드", p5 = "";
  let symbolsToUse = ELEMENT_PRESCRIPTION[saju?.lacking]?.symbols || [];

  if (menuId === 1) { 
    title1 = "✨ [VVIP 명식 해단식] 선천 인지 필터의 정밀 해부";
    p1 = `${timePhrase} 정밀 파싱한 결과, ${name}님의 명식 본원은 ${dmObj.nature}의 기운을 핵심 뼈대로 세팅받았습니다. \n\n${dmObj.core} \n\n현재 원국을 지배하고 있는 오행의 분포를 스캔해 보면 [ ${elementCountsStr}] 로 구성되어 있습니다. 사주 명리학에서 특정 기운이 이처럼 쏠리거나 비어버리는 불균형은 지식의 입력(Input)과 출력(Output) 과정에서 치명적인 생체 에너지 병목 현상을 일으킵니다.`;
    
    title2 = "⚖️ [운기의 밸런스 분석] 극강의 천재성과 블랙아웃 슬럼프의 경계";
    p2 = `현재 ${name}님의 지적 패턴에서 뿜어져 나오는 번뜩이는 통찰력과 극강의 몰입도는 원국 내 가장 풍부한 '${saju?.excessive}' 기운에서 발현됩니다. ${excessObj.power}의 천재성을 보입니다.\n\n그러나 성과를 늪으로 끌어내리는 가장 뼈아픈 아킬레스건은 바로 '${saju?.lacking}' 기운의 완전한 결핍입니다. ${lackObj.pain} 평소 인강이나 교재를 볼 때는 완벽하게 다 아는 것 같지만, 막상 고도의 압박감이 지배하는 ${battleGround}에 들어서는 순간 머릿속이 하얗게 굳어버리는 '블랙아웃(Black-out)' 현상을 겪게 됩니다.`;
    
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 1등급 도약을 위한 3대 행동 프로토콜";
    p3 = `${lackObj.step1}\n\n${lackObj.step2}\n\n${lackObj.step3}`;
    
    p4 = `최상위권 0.1%의 압도적인 성취는 미련한 시간 싸움에서 오지 않습니다. 사주 원국에 치명적으로 결핍된 에너지를 치밀하게 주입하는 '예열 워밍업'과 뇌 신경망을 해킹하는 본인만의 루틴을 타협 없이 지켜낼 때 기적이 일어납니다.`;
    p5 = `결론적으로 ${name}님의 명식 도화지는 기존의 지루하고 낡은 룰을 무참히 짓밟고 본인만의 거대한 왕국을 견고하게 세울 수 있는 폭발적인 포텐셜의 원석입니다. 골방에서 칼을 갈며 고독하게 쌓아 올린 이 지적 파워가 대운의 강력한 흐름과 맞물리는 순간, ${ultimateGoal}이라는 찬란한 현실의 결실로 당당하게 증명될 것입니다.\n\n세상이 규격화해 놓은 얄팍한 평균의 기준에 본인을 억지로 욱여넣으며 자책하는 감정 낭비를 오늘부로 영구 중단하십시오. 본원인 ${dmObj.name}의 거친 생명력을 믿고, 오늘 하달된 맞춤형 결핍 처방을 매일의 루틴 속에 독하게 이식하십시오. 온 세상이 당신의 날카로운 가치 앞에 무릎 꿇을 것입니다.`;
    
    if (saju?.isExtremelyBiased) {
      p1 = `${timePhrase} 정밀 스캔한 결과, ${name}님의 명식은 '${saju?.excessive}' 기운이 원국 전체를 지배할 정도로 강력하게 집중된 [특수 편중(偏重) 명식 구조]입니다.\n\n이러한 극단적인 에너지는 일반적인 규격화된 교육 잣대를 들이대는 순간 아이의 천재성이 완벽하게 질식합니다. 원국의 분포는 [ ${elementCountsStr}] 이며, 극심한 에너지 병목을 해소하는 것이 시급합니다.`;
    } else if (saju?.isRelativelyBalanced) {
      p1 = `${timePhrase} 정밀 스캔한 결과, ${name}님의 명식은 오행이 한쪽으로 치우치지 않고 상생 순환하는 가장 축복받은 그릇인 [주류무체(周流無滯)형 황금 밸런스 구조]입니다.\n\n원국의 분포는 [ ${elementCountsStr}] 로 완벽에 가까운 균형을 이루고 있습니다. 억지로 부족한 점을 찾아내어 뜯어고치려는 강박을 버리는 것이 1순위 과제입니다.`;
      p2 = `타고난 천재성은 특정한 한 과목에 국한되지 않고, 전체 맥락을 빠르게 파악하여 융합해 내는 '올라운더(All-rounder)'적 기질에서 뿜어져 나옵니다.\n\n다만 유일한 슬럼프 리스크는 '지나친 무난함으로 인한 동기부여 고갈'입니다. 에너지가 한곳에 꽂히지 않기 때문에 치열한 경쟁 상황에서 막판 스퍼트가 다소 무뎌질 수 있습니다.`;
      p3 = `【 STEP 1. 균형을 지키는 진공 알파파 워밍업 】\n특정 기운을 억지로 주입할 필요가 없습니다. 매일 아침 고요한 알파파 상태에서 하루의 우선순위 3가지를 정렬하는 10분의 명상 루틴만으로 뇌파가 완벽히 정돈됩니다.\n\n【 STEP 2. 마일스톤(Milestone) 보상 설계법 】\n무난한 일상에 지치지 않도록, 중간 목표를 달성할 때마다 본인에게 확실한 시각적/물리적 보상을 하달하여 인위적인 도파민 스파크를 일으키십시오.\n\n【 STEP 3. 에너지 과열 방지 디톡스 】\n주말 중 단 하루는 활자와 스크린을 완벽히 차단하고 자연 속에서 정적인 산책을 가동하십시오. 황금 밸런스 명식은 뇌 피로만 제거해주면 스스로 정답을 찾아냅니다.`;
      p4 = `당신에게 필요한 것은 '결핍의 치료'가 아닙니다. 타고난 경이로운 선천적 밸런스를 외부의 자극으로부터 고요하게 지켜내는 '평정심의 루틴' 그 자체입니다.`;
    }
  } else if (menuId === 2) { 
    title1 = "✨ [VVIP 명식 해단식] 지식 처리 알고리즘의 인지과학적 해부";
    p1 = `${name}님의 사주 원국에 각인된 '정보의 입력(Input)과 출력(Output) 알고리즘'을 최신 인지과학 관점에서 심층 해부합니다. 당신의 지적 자아인 '${dmObj.name}'은 단순히 남들이 떠먹여 주는 활자를 수동적으로 적재해 두는 창고형 뇌 구조가 결코 아닙니다.\n\n파편화된 외부 지식을 본인만의 예리한 필터로 역동적으로 분해하고 재조합하여 완전히 새로운 솔루션으로 정유해 내는 압도적인 '가공 공장형' 명식입니다. 이러한 명식 그릇을 지닌 분에게 강사의 풀이 방식을 토시 하나 틀리지 않고 암기하라고 강요하는 것은, 초고성능 슈퍼컴퓨터에 도스(DOS) 운영체제를 깔아놓고 왜 연산이 느리냐고 윽박지르는 것과 같은 참혹한 자해 행위입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 아웃풋 회로의 병목 현상과 실전 마비 기전";
    p2 = `현재 학습이나 업무 과정에서 가끔씩 뿜어져 나오는 소름 돋는 문제 해결 능력은 원국 내에 자리 잡은 풍부한 '${saju?.excessive}' 오행 기운 덕분입니다. ${excessObj.power}의 직관 스위치가 점화되는 순간, 남들이 공식에 대입해 가며 한 세월을 보낼 때 당신은 이미 정답의 종착역에 도달해 있는 경이로운 연산 속도를 보여줍니다.\n\n그러나 결정적인 성과 도출의 순간마다 발목을 강하게 부여잡는 주범은 바로 '${saju?.lacking}' 기운의 결핍으로 인한 '출력 회로의 일시적 마비 현상'입니다. ${lackObj.pain} 이는 입력된 정보를 바깥으로 매끄럽게 인출(Output)해 내는 명리학적 '식상(食傷)' 또는 '관성(官星)'의 유체 밸런스가 꽉 막혀있기 때문입니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 아웃풋 극대화를 위한 3대 인출 복습법";
    p3 = `【 STEP 1. 인풋과 아웃풋의 잔혹한 황금비율 3:7 정립 】\n오늘부터 수동적으로 강의를 듣거나 활자를 읽는 인풋(Input) 시간을 하루 전체 공부량의 30% 이하로 강제 동결하십시오. 나머지 70%의 시간은 오직 교재를 덮고 텅 빈 화이트보드나 백지 위에서 본인의 입과 손으로 맹렬히 뱉어내는 아웃풋 훈련으로만 빽빽하게 채우셔야 합니다.\n\n【 STEP 2. 오행 바이오리듬 기반의 '킬러 과목 전략 배치술' 】\n전두엽의 생체 에너지가 가장 맑고 강력하게 차오르는 골든 타임(기상 직후 2시간)에 본인이 가장 혐오하고 쳐다보기도 두려워하는 고난도 킬러 문항을 융단폭격하듯 배치하십시오. 전두엽이 방전되는 늦은 밤 시간대에는 억지로 새로운 개념을 주입하지 마시고 가벼운 오답 노트 정독 위주로 뇌파를 쿨링시켜야 바이오리듬이 유지됩니다.\n\n【 STEP 3. 0.1% 극상위권의 '핀셋 개념 박제 오답법' 】\n해설지의 긴 풀이 과정을 예쁜 글씨로 필기하며 노동력을 낭비하는 오답 노트는 당장 쓰레기통에 버리십시오. 틀린 문제의 표면적 실수를 직면하는 것을 넘어, "내가 어느 지점의 논리적 연결 고리를 누락해서 뇌파가 멈췄는가?"를 한 문장으로 정의하고 그 핵심 핀셋 개념만을 외과 수술하듯 박제해야 실전에서 손이 굳지 않습니다.`;
    p4 = `남들이 다 하는 뻔하고 지루한 풀이법을 수집하는 것보다 천 배 중요한 것은, 내 사주 원국에 완벽하게 들어맞는 '입력 30% : 출력 70%의 아웃풋 황금비율'을 목표 달성 날까지 타협 없이 밀어붙이는 지독한 뚝심입니다.`;
    p5 = `당신의 지식 가공 엔진은 파편화된 복잡한 데이터를 가공하여 냉혹한 실전 현장에서 거침없이 뱉어낼 때 비로소 그 진가를 발휘합니다. 골방에서 묵묵히 시냅스를 연결하며 쌓아 올린 이 지적 파워가 ${ultimateGoal}이라는 영광스러운 훈장으로 당당히 증명될 것입니다.\n\n단순히 유명 인강 커리큘럼을 완강했다는 얄팍한 안도감에 취해 전두엽의 스위치를 끄는 오만함을 경계하십시오. 오늘 하달된 아웃풋 중심의 잔혹한 인출 루틴을 뼛속까지 이식한다면, 당신은 ${battleGround}에서 출제자의 얄팍한 함정을 비웃으며 유유히 합격증을 거머쥐는 거대한 지적 포식자로 우뚝 설 것입니다.`;
  } else if (menuId === 3) { 
    title1 = "✨ [VVIP 명식 해단식] 공간 풍수 주파수와 뇌 신경망의 공명 해독";
    p1 = `사주 명리학의 핵심 원리인 '물상대체론(物象代替論)'과 현대 환경심리학의 '공간 파동 역학' 관점에서 ${name}님의 데스크 환경을 심층 해부합니다. 일간 '${dmObj.name}'의 생명력을 품고 태어난 당신의 뇌 신경계는 주변에 놓인 사물의 물리적 재질과 주파수에 본능적이고도 폭력적으로 반응하는 뚜렷한 특성을 지니고 있습니다.\n\n당신이 하루의 절반 이상을 머무는 책상과 공부방은 단순히 가구가 놓여있는 죽어있는 물리적 컨테이너가 아닙니다. 사물이 내뿜는 고유의 오행 파동과 당신의 생체 에너지가 끊임없이 충돌하고 교류하는 거대한 '유기체적 뇌파 증폭 장치'입니다. 특정 공간에만 들어가면 유독 가슴이 답답하고 책을 펼치기조차 싫어진다면, 이는 당신의 의지력 부재가 아니라 방 안의 기운이 사주 원국의 취약점을 예리하게 찌르며 알파파 생성을 강제로 방해하고 있기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 몰입의 알파파 진공 스위치와 상극 노이즈";
    p2 = `최상의 컨디션에서 뿜어져 나오는 경이로운 집중력과 슈퍼컴퓨터 같은 연산 속도는 당신의 사주 원국과 공간의 풍수 에너지가 완벽한 공명(Resonance) 궤도에 진입했을 때 발현됩니다. 이 스파크가 튀는 순간, 전두엽 주변의 노이즈가 완벽하게 진공 청소되며 수 시간 동안 미동조차 하지 않는 극강의 알파파 딥워크 상태를 경험하게 됩니다.\n\n그러나 성적과 업무 효율을 늪으로 끌어내리는 방해꾼은 바로 사주 원국에 텅 비어있는 '${saju?.lacking}' 기운을 더욱 메마르게 억누르고 뇌파를 지글지글 과열시키는 '상극(相剋)의 흉물 노이즈'들입니다. 원국과 충돌하는 이질적인 소품이나 산만한 시각적 독소들이 데스크 주변을 장악하는 순간, 시신경을 통해 스트레스 호르몬인 코르티솔이 과다 분비되며 극심한 무기력증과 깊은 블랙아웃 슬럼프에 직면하게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 환경을 지배하는 3대 데스크 결계 구축술";
    p3 = `【 STEP 1. 영적 물상 대체와 '결핍 오행 소품 명당 고정술' 】\n사주 원국에 흩어지는 기운을 꽉 부여잡아 집중력을 수직 상승시켜 줄 VVIP 시크릿 대체 아이템은 바로 [ ${ELEMENT_PRESCRIPTION[saju?.lacking || '수(물)']?.item || '풍수 처방 소품'} ]입니다. 책상에 앉았을 때 메인 시야가 가장 먼저 닿는 눈높이의 명당자리에 이 처방 소품을 신전의 엠블럼처럼 견고하게 고정 배치하여 기운의 뼈대부터 바로 세우십시오.\n\n【 STEP 2. 전두엽 알파파를 깨우는 '10초 몰입 앵커링 의식' 】\n매일 공부이나 프로젝트 연산을 시작하기 직전, 책상 위에 놓인 처방 소품을 양손으로 가만히 감싸 쥐고 코로 깊은 숨을 3회 들이마시는 경건한 앵커링(Anchoring) 의식을 치르십시오. 이 10초간의 물리적 루틴이 당신의 무의식 신경계에 "방해 전파가 차단된 완벽한 몰입의 초공간 진입"이라는 최면 신호를 다이렉트로 각인시킵니다.\n\n【 STEP 3. 시각적 독소 완전 격리와 '흉물 유배술' 】\n상극이 되는 화려한 패턴의 잡동사니나 정돈되지 않은 전선 가닥들은 맑은 생체 에너지를 갉아먹는 시각적 독가스입니다. 단 1초의 망설임도 없이 서랍 안쪽 깊은 곳이나 시야가 절대 닿지 않는 방 밖의 베란다로 완벽하게 격리 유배를 보내셔야 합니다.`;
    p4 = `공간이 내뿜는 미세한 풍수 파동을 치밀하게 제어하는 자가 본인의 거대한 운명마저 지배하게 됩니다. 책상 위의 작은 디테일 하나를 강박적으로 통제하는 외과 수술적 조치가 ${ultimateGoal}의 당락을 결정짓는 운명의 스위치가 됨을 뼛속 깊이 새기십시오.`;
    p5 = `결론적으로 ${name}님의 공간 에너지가 완벽하게 동기화되는 순간, 사주는 장전된 무기로 돌변합니다. 환경의 디테일을 집요하게 통제하는 자만이 고차원적인 성취를 이뤄낼 수 있습니다.\n\n집중이 안 될 때 자책하는 감정 낭비를 멈추십시오. 능률 하락은 의지력 부재가 아니라 풍수 파동이 꼬였기 때문입니다. 처방된 결계를 방 안에 이식하여 압도적인 몰입을 쟁취하십시오.`;
  } else if (menuId === 4) { 
    title1 = "✨ [VVIP 명식 해단식] 시신경 파장과 사주 조후(調候) 조율의 역학";
    p1 = `시신경을 통해 실시간으로 흡수되는 시각적 색채의 주파수가 사주 원국의 '조후(調候: 온도와 습도의 완벽한 생체 밸런스)'에 미치는 파괴적인 영향력을 심층 해부합니다. 일간 '${dmObj.name}'의 핏줄을 이어받은 ${name}님의 시신경 신경망은 시야에 맺히는 특정 색상의 파장 길이에 따라 뇌파의 알파파 활성도와 스트레스 호르몬 분비량이 드라마틱하게 요동치는 정밀한 인지 체계를 지니고 있습니다.\n\n공부방과 데스크의 메인 컬러 계열은 단순히 공간을 보기 좋게 꾸미는 인테리어 장식이 결코 아닙니다. 당신의 얼어붙은 지적 포텐셜을 따뜻하게 활활 타오르게 하거나, 과열된 전두엽을 부드럽게 식혀주는 생명 유지 장치이자 운명의 파장입니다. 책상 앞에서 극심한 피로감이 몰려온다면 컬러 주파수가 사주 원국과 충돌하며 뇌를 공격하기 때문입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 시각 색채 노이즈 독소와 몰입 공명점";
    p2 = `당신의 뇌 회로가 극강의 쾌감을 느끼며 번뜩이는 아이디어를 쏟아낼 때는 사주에 내재된 주 기운과 공간의 색채 주파수가 완벽한 화음을 이루며 공명(Resonance)할 때입니다. 이 주파수 스파크가 튀는 순간, 뇌는 모든 시각적 노이즈를 스스로 차단하고 고도의 몰입 모드인 진공 알파파 상태로 부드럽게 미끄러져 들어갑니다.\n\n그러나 지적 성취를 방해하고 전두엽을 방전시키는 핵심 원인은 바로 원국의 열기를 지글지글 끓게 하거나 꽁꽁 얼어붙게 만드는 '상극 계열의 자극적인 원색 노이즈'들입니다. 시야를 혼탁하게 만드는 흉한 주파수의 형광펜이나 공격적인 채도의 소품들이 메인 시야에 방치되어 있으면, 시신경이 지속적으로 뇌파를 공격받으며 극심한 번아웃과 하얀 블랙아웃 늪에 빠지게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 시각 주파수 동기화를 위한 3대 컬러 해킹 프로토콜";
    p3 = `【 STEP 1. 메인 시야 30%를 '운명의 치유 컬러'로 장악하라 】\n사주 원국의 병목을 뚫어주고 뇌파를 쿨링시켜 줄 절대적인 운명의 치유 컬러는 바로 [ ${ELEMENT_PRESCRIPTION[saju?.lacking || '수(물)']?.color || '파스텔 톤'} ] 계열의 색상입니다. 책상 앞에 앉았을 때 시야의 30% 이상을 차지하는 대형 데스크 매트, 암막 커튼, 아이패드 및 PC 배경화면을 반드시 이 치유 컬러 주파수로 강제 통일하십시오. 시야가 처방 주파수로 채워질 때 전두엽의 코르티솔 독소가 0.1초 만에 소멸됩니다.\n\n【 STEP 2. 뇌파를 찢는 '상극 컬러 독소의 완벽한 유배술' 】\n사주 원국의 기운을 산만하게 흩어놓고 시신경을 피로하게 만드는 강렬한 채도의 원색 소품이나 자극적인 형광펜 가닥들은 전두엽을 공격하는 시각적 흉기입니다. 단 한 순간의 타협도 없이 책상 서랍 안쪽 깊은 곳이나 불투명한 수납 박스 안으로 완벽하게 격리하여 시각적 노이즈를 100% 진공 차단하셔야 합니다.\n\n【 STEP 3. 시각 주파수 각인 기반의 '포토그래픽 메모리 필기술' 】\n시험장이나 실전 발표 현장에서 하얗게 블랙아웃되는 기억을 복원하기 위해, 핵심 공식과 킬러 개념은 반드시 운명의 치유 컬러 계열 펜으로만 정제하여 필기하십시오. 눈을 감았을 때 그 특정 색상의 파장으로 쓰여 있던 노트의 잔상을 뇌리에 통째로 스캔하듯 인출해 내는 시각 주파수 연상 훈련을 반복하십시오.`;
    p4 = `시각적 색채 밸런스가 사주의 뼈아픈 부족함과 완벽하게 맞물려 떨어지는 순간, 뇌는 모든 방해 전파가 사라진 완벽한 몰입의 초공간으로 부드럽게 진입합니다.`;
    p5 = `결론적으로 ${name}님의 시신경 주파수와 데스크의 색채 파장이 명리학적 조후에 맞게 세팅되었을 때, 당신의 사주 원석은 가장 날카롭고 우아한 명검으로 변모합니다. 매일 눈을 통해 조용히 흡수한 이 고귀한 색채 에너지는 냉혹한 평가의 전장에서 압도적인 점수와 성과라는 훈장으로 당당히 증명될 것입니다.\n\n무질서하고 자극적인 시각적 공해로부터 본인의 전두엽을 강박적으로 보호하는 통제의 제왕이 되십시오. 빛과 파장으로 완벽하게 쉴드가 쳐진 나만의 지적 요새 안에서 세상이 깜짝 놀랄 경이로운 도약을 이루어내십시오.`;
  } else if (menuId === 5) { 
    title1 = "✨ [VVIP 명식 해단식] 자본주의 먹이사슬의 대체불가 포텐셜 해부";
    p1 = `피도 눈물도 없이 굴러가는 냉혹한 자본주의 정글 생태계에서, ${name}님의 사주 명식 그릇이 어떻게 거대한 부(富)와 막강한 사회적 영향력을 독점적으로 창출해 낼 수 있는지 심층 해부합니다. 선천적으로 부여받은 일간 '${dmObj.name}'은 당신이 이 세상에 태어날 때 손에 쥐고 나온 가장 날카롭고 잔혹한 생존 무기입니다.\n\n당신은 거대한 기업의 평범한 톱니바퀴 부품으로 소모되다가 조용히 버려질 얄팍한 평균의 그릇이 결코 아닙니다. 조직의 기존 낡은 룰과 시장의 판도를 밑바닥부터 뒤흔들며, 본인만의 독보적인 대체불가 세계관으로 시장 전체를 제패할 수 있는 거대한 야수적 포텐셜을 원국 중심에 품고 있습니다. 남들이 정해놓은 안전하고 지루한 트랙을 벗어나는 순간 비로소 심장의 엔진이 가동되는 완성형 원석입니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 노동 시장의 포식자 포지셔닝과 십성 마비 리스크";
    p2 = `치열한 스펙 경쟁이 펼쳐지는 커리어 전장에서 당신이 경쟁자들을 완벽하게 씹어먹으며 돋보일 수 있는 핵심 동력은 원국 내 가장 폭발적인 '${excessEl}' 기운에 있습니다. ${excessObj.power} 이 주특기 에너지를 100% 가동할 수 있는 무대에 서는 순간, 남들이 수십 년의 짬바를 채워야 도달할 수 있는 전문성의 경지를 단숨에 관통해 내는 압도적인 퍼포먼스를 과시하게 됩니다.\n\n그러나 커리어의 수직 상승을 가로막고 깊은 늪으로 끌어내리는 가장 무서운 함정은 바로 '${saju?.lacking}' 기운이 결핍된 직무를 억지로 연기하며 수행할 때 발생합니다. ${lackObj.pain} 원국과 소통되지 않는 상극의 직군에 갇혀 억지로 전두엽을 쥐어짜면, 결국 본인의 장점은 퇴색되고 예민함과 독선적인 단점만이 수면 위로 부각되어 깊은 번아웃과 잦은 이직이라는 참혹한 커리어 슬럼프에 직면하게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 독점적 몸값 쟁취를 위한 3대 커리어 프로토콜";
    p3 = `【 STEP 1. 평균의 함정을 비웃는 '대체불가 특수 틈새 독점술' 】\n남들이 부러워하는 대기업의 안정적인 부품 포지션이나 뻔한 전문직 타이틀에 만족하는 얄팍한 목표를 당장 소각하십시오. 오직 ${name}님 본인만이 뿜어낼 수 있는 광기 어린 세계관으로 시장의 룰을 새로 정의할 [ ${ELEMENT_PRESCRIPTION[saju?.lacking || '수(물)']?.job || '특수 전문 융합 분야'} ]로의 진출을 강력히 제안합니다. 임계점을 돌파하는 순간 몸값이 천정부지로 폭등합니다.\n\n【 STEP 2. 약점을 흉기로 치환하는 '외과 수술적 T자형 인재 전략' 】\n선천적으로 타고나 가장 쉽고 비상하게 회전하는 주특기 기운(세로축)을 세계 최고 수준으로 날카롭게 연마함과 동시에, 평소 쳐다보기도 두려워했던 결핍 오행 '${saju?.lacking}'의 비즈니스 지식(가로축)을 처절하게 학습하여 뇌에 강제 융합하십시오. 이 이질적인 두 에너지의 교차점에 선 융합형 몬스터 인재는 시장에서 부르는 게 값이 됩니다.\n\n【 STEP 3. 대운 변곡점 기반의 '결정적 승부수 타이밍 설계' 】\n사주 명리학에서 커리어의 판도가 수직으로 점프하는 거대한 대운의 변곡점이 도래하기 전까지는 섣불리 조직을 탈출하거나 멘탈을 소모하지 마십시오. 현재의 포지션에서 칼을 갈며 나만의 정밀한 데이터베이스와 인맥을 조용히 흡수하다가, 운기의 물길이 완벽하게 열리는 골든 타이밍에 묵직한 출사표를 던져 판을 장악하셔야 합니다.`;
    p4 = `상위 0.1%의 거대한 부의 축적과 명예는 뻔한 스펙 한 줄을 더 적는 경쟁에서 오지 않습니다. 내 사주 원국의 폭력적인 강점과 뼈아픈 결핍이 내면에서 격렬하게 융합하여 만들어내는 '대체 불가능한 가치' 그 자체에 세상의 모든 돈이 쏟아집니다.`;
    p5 = `결론적으로 ${name}님의 사주는 세상의 지루한 룰을 무참히 박살 내고 자신만의 거대한 왕국을 견고하게 건설할 수 있는 압도적인 원석입니다. 대운의 흐름이 거세게 몰아칠 때 쌓아 올린 이 파워가 ${ultimateGoal}으로 당당히 증명될 것입니다.\n\n회사가 보장하는 얄팍한 안정을 혐오하십시오. 진짜 안정이란 '그 누구도 나를 대체할 수 없는 능력의 날카로움'에서 비로소 완성됩니다. 오늘 진단해 드린 결핍 처방을 매일의 삶 속에 이식하십시오.`;
  } else if (menuId === 6) { 
    title1 = "✨ [VVIP 명식 해단식] 인간관계의 보이지 않는 권력 역학 관계 해독";
    p1 = `단순한 표면적 친분이나 혈연 관계를 완벽하게 초월하여, 집단 및 조직 내에서 보이지 않게 작동하는 '인간관계의 권력 역학 관계'와 당신이 무의식적으로 뿜어내는 '리더십의 아우라'를 명리학의 메스로 심층 해부합니다. 원국 중심에 똬리를 튼 일간 '${dmObj.name}'은 수많은 군중 속에 조용히 섞여 있어도 타인의 시선을 강제로 강탈하며 서열의 우위를 점하는 선천적 낙인입니다.\n\n당신은 억지로 목소리를 높이거나 가짜 권위로 카리스마를 연기하지 않아도, 공간의 공기 흐름 자체를 본인 중심의 자기장으로 부드럽게 왜곡시키는 특수한 마성을 타고났습니다. 허세와 속 빈 강정 같은 가짜 리더들이 판치는 혼탁한 세상 속에서, 당신의 신경망 깊은 곳에는 진짜 무리를 지배하고 부릴 줄 아는 완성형 제왕의 핏줄이 흐르고 있습니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 대인 장악력의 마성과 고독한 폭군의 양날의 검";
    p2 = `현재 대인관계나 비즈니스 협상 테이블에서 타인의 논리를 무장 해제시키고 판을 주도하는 압도적인 장악력은 넘쳐흐르는 주 기운에서 기인합니다. 상대방은 뚜렷한 논리적 근거가 없음에도 불구하고 당신의 확에 찬 눈빛과 서늘한 여유에 매료되어 맹목적으로 고개를 끄덕이게 됩니다. 회의실이나 사교 모임의 주도권이 언제나 당신의 손아귀로 빨려 들어오는 경이로운 중력의 원천입니다.\n\n그러나 완벽해 보이는 이 통치 리더십을 한순간에 붕괴시키고 주변 사람들을 떠나보내 '고독한 폭군'으로 전락시키는 치명적인 아킬레스건은 바로 '${saju?.lacking}' 기운의 극심한 결핍에 있습니다. 타인의 감정적 주파수에 공명하고 교감하는 생체 소통 에너지가 고갈되는 순간, 당신의 서늘한 카리스마는 피도 눈물도 없는 '독선과 아집'으로 주변에 왜곡되어 전달되며 참혹한 관계의 단절과 배신을 겪게 됩니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 사람의 마음을 영구 박제하는 3대 제왕적 장악술";
    p3 = `【 STEP 1. 의도적인 침묵과 '결정적 1초의 정곡 발언술' 】\n조직 내에서 억지로 본인의 존재감을 드러내려 말을 많이 하며 패를 보여주지 마십시오. 사내 정치 이슈나 갈등이 터져 모두가 감정적으로 흥분해 있을 때, 한발 물러서서 상황을 고요한 데이터베이스로 분석하십시오. 그리고 회의가 끝나갈 무렵, 가장 묵직하고 정곡을 찌르는 서늘한 단 한마디를 던지며 상황을 완벽히 종료시키는 제왕적 포지션을 취하셔야 합니다.\n\n【 STEP 2. 인간적 빈틈의 전략적 노출과 '소프트파워 포용술' 】\n흠집 하나 잡히지 않으려 발버둥 치는 강박적인 완벽주의의 가면을 가끔씩 의도적으로 벗어 던지십시오. 본인의 사소하고 인간적인 취약점을 타인에게 쿨하게 오픈하고 진심으로 고개를 숙여 도움을 청할 때, 사람들은 당신의 그 '반전 인간미'에 완벽하게 무장 해제되어 평생 변치 않는 충성심을 바치게 됩니다.\n\n【 STEP 3. 시기심을 충성으로 치환하는 '명예 양도 프로토콜' 】\n당신의 빛나는 아우라는 필연적으로 주변 소인배들의 시뻘건 질투와 시기심을 자극합니다. 프로젝트가 성공했을 때 표면적인 영광과 박수갈채를 과감하게 아랫사람이나 협업자들에게 100% 양도하십시오. 명예를 양보받은 이들은 감복하여 당신을 조직의 영원한 대체불가 리더로 스스로 받들어 모시게 됩니다.`;
    p4 = `진정으로 무리를 지배하고 부리는 위대한 통치력은 완벽하게 포장된 강압적 연기에서 나오지 않습니다. 본인의 가장 뼈아픈 결핍마저도 서늘하게 인지하고 타인의 감정을 품어내는 '부드러운 통제력'에서 나옵니다. 당신은 이미 완성형 제왕입니다.`;
    p5 = `결론적으로 ${name}님의 명식 도화지는 대중의 열광적인 존경과 서늘한 시기심을 동시에 한 몸에 받으며 한 시대의 흐름을 본인의 의도대로 비틀어 버릴 수 있는 거대한 제왕의 원석입니다. 조용히 다듬어온 그 부드럽지만 치명적인 카리스마는 당신을 피할 수 없는 조직의 절대적인 통치자로 등극시킬 것입니다.\n\n타인에게 얕보이지 않으려 억지로 가시를 세우는 얄팍한 방어 기제를 오늘부로 완벽히 소각하십시오. 타인의 감정적 주파수를 여유롭게 품어내는 작은 빈틈이야말로 사람들을 당신 곁에 영구 박제하는 가장 거대하고 흉포한 중력이 됩니다. 제왕의 왕관을 쓰고 당당하게 군림하십시오.`;
  } else if (menuId === 7) { 
    title1 = "✨ [VVIP 명식 해단식] 선천 청각 필터와 언어 주파수 수용 기전";
    p1 = `${timePhrase} 정밀 파싱한 결과, ${name}님의 명식 본원은 [ ${dmObj.name} ]의 파동으로 세팅되어 있습니다. 이 기질의 상대방에게 언어란 단순한 '소리 정보의 전달'이 결코 아닙니다. 귓가에 꽂히는 음색, 어조의 미세한 높낮이, 그리고 활자 이면에 숨겨진 '나를 통제하려는 얄팍한 의도'를 0.1초 만에 동물적으로 감지해 내는 초정밀 레이더망이 가동되고 있습니다.\n\n${dmObj.talk}\n\n특히 원국 내 오행 분포가 [ ${elementCountsStr}] 로 구성된 바, 특정 에너지의 쏠림 현상으로 인해 일방적인 지시나 억압성 훈계를 '나의 존재 자체에 대한 물리적 공격'으로 왜곡해서 받아들이는 청각 필터 병목을 겪고 있습니다. 대화 도중 갑자기 입을 다무는 것은 고집이 아니라 본인의 과열된 뇌파를 지키기 위한 본능적인 생존 방어 기제임을 이해하셔야 대화의 실마리가 풀립니다.`;
    title2 = "⚖️ [운기의 밸런스 분석] 잔소리 독소의 축적과 시냅스 단절 현상";
    p2 = `현재 대화에서 뿜어져 나오는 까칠한 방어막이나 차가운 무반응은 원국 내 결핍된 '${saju?.lacking}' 기운의 소통 회로가 꽉 막혀있기 때문입니다. ${talkObj.pain} 아무리 애정을 담아 "다 너 잘되라고 하는 소리야"라고 설득해도 상대방의 전두엽에는 '코르티솔(스트레스 독소) 스파크'만 튈 뿐 내용이 전혀 각인되지 않고 허공으로 휘발됩니다.\n\n반대로 원국에서 가장 강력한 '${excessEl}' 기운의 자존심을 영악하게 건드려주는 주파수 언어를 구사할 때, 상대방의 뇌는 완벽하게 무장 해제되며 당신을 '나를 통찰해 주는 유일한 아군'으로 인식하게 됩니다. 말의 내용보다 '말을 담는 그릇의 형태'를 전면 개조해야 하는 지점입니다.`;
    title3 = "🗝️ [VVIP 프라이빗 시크릿 솔루션] 상대의 뇌를 여는 3대 필승 대화 프로토콜";
    p3 = `【 STEP 1. '통제 언어'를 '선택권 부여 주파수'로 치환하라 】\n"이거 공부했어?"라는 추궁성 제어 언어 대신, [ ${saju?.dayMaster === '甲' || saju?.dayMaster === '庚' ? '"오늘 수학 A단원 먼저 깰래, 영어 B단원 먼저 깰래?"' : '"오늘 10분만 창문 열고 환기하고 시작할까, 지금 빡 집중해서 끝내고 밤에 푹 쉴까?"'} ]라는 '가짜 선택권 프레임'을 설계해 하달하십시오. 상대의 전두엽이 '내가 스스로 결정했다'고 착각하는 순간, 편도체의 반항 스위치가 0.1초 만에 영구 소멸됩니다.\n\n【 STEP 2. 3초 침묵의 뇌파 완충(Buffer) 법칙 】\n상대가 가시 돋친 말을 뱉을 때 즉각 반박하는 것은 상대의 전투력에 기름을 붓는 행위입니다. 입술을 닫고 상대의 미간을 차분히 응시하며 속으로 천천히 3초를 세는 완충 루틴을 확보하십시오. 이 서늘하고 묵직한 3초의 물리적 침묵이 상대의 과열된 뇌파를 강제로 냉각시키고, 이어지는 부모의 첫마디에 제왕적인 무게감을 각인시킵니다.\n\n【 STEP 3. 절대 상극의 '금기어 영구 봉인술' 】\n명식 구조상 뇌파를 찢어버리는 최악의 상극 화법은 바로 이것입니다. 👉 [ ${talkObj.rule} ] 혀끝까지 이 문장이 차오르는 찰나, 입술을 깨물어서라도 완벽하게 삼켜내어 영구 유배 보내셔야만 부모·자식 간의 지적 연결 고리가 보존됩니다.`;
    p4 = `대화의 진짜 승리는 상대를 논리로 굴복시켜 무릎 꿇리는 것에 있지 않습니다. 상대의 명식에 뚫려있는 결핍 주파수를 나의 '차분한 어조'로 채워주고, 통제권을 양도하는 척 뇌를 해킹하는 '소프트파워 화법'에 모든 열쇠가 있습니다.`;
    p5 = `결론적으로 ${name}님의 명식은 상대방이 어떤 언어 주파수를 먹여 키우느냐에 따라 사사건건 부딪치는 트러블 메이커가 될 수도, 판을 주도하는 압도적 우군이 될 수도 있는 극단적인 증폭 그릇입니다.\n\n본인이 느끼는 초조함을 언어적 가시로 뱉어내는 악순환을 오늘부로 영구 소각하십시오. 상대의 고유한 언어 필터를 넉넉하게 품어주는 단단한 언어적 요새 안에서 상대는 스스로 무장을 해제할 것입니다. 당신의 결정적 첫 마디가 관계의 판도를 바꿉니다.`;
  }

  if (menuId === 7) {
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
  const [isPgLoaded, setIsPgLoaded] = useState(false);
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
    if (userInfo.name || userInfo.birthDate) {
      try { localStorage.setItem('sajuApp_tempForm', JSON.stringify(userInfo)); } catch (e) {}
    }
  }, [userInfo]);

  useEffect(() => {
    setTimeout(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); }, 50);
  }, [currentView, selectedMenu]);

  // 🔥 2번 수술: pushState 에러 시 앱 즉사 방어 try-catch 래퍼 🔥
  useEffect(() => {
    try { window.history.pushState(null, "", window.location.href); } catch(e) {}
    const handlePopState = (e: any) => {
      setIsProcessing(false); setIsNavigating(false);
      if (currentView === 'result') {
        setSelectedMenu(null);
        setCurrentView('menu');
        try { window.history.pushState(null, "", window.location.href); } catch(e) {}
      } else if (currentView === 'menu') {
        setCurrentView('intro');
        try { window.history.pushState(null, "", window.location.href); } catch(e) {}
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

    setUserInfo(savedUserInfo); setUserSaju(savedUserSaju); setSelectedMenu(savedMenu);
    const kidKey = getKidStorageKey(savedUserInfo.name, savedUserInfo.birthDate);
    
    setUnlockedMenus(prev => {
      let existing = [];
      try { 
        const parsed = JSON.parse(localStorage.getItem(kidKey) || '[]'); 
        // 🔥 1번 수술: 스토리지에 문자열이나 객체가 들어있어 includes() 에러를 내는 대참사 방어 🔥
        existing = Array.isArray(parsed) ? parsed : [];
      } catch(e) {}
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
            pillars: [{ tH: '?', tK: '연', bH: '?', bK: '연' }, { tH: '?', tK: '월', bH: '?', bK: '월' }, { tH: '?', tK: '일', bH: '?', bK: '일' }, { tH: '?', tK: '시', bH: '?', bK: '시' }], 
            counts: {'목(나무)':3, '수(물)':0}, isNightRollover: false, isExtremelyBiased: false, isRelativelyBalanced: false 
          });
        }
      }, 300);
    });
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = (userInfo.name || '').replace(/\s+/g, ' ').trim().slice(0, 10);
    if (!safeName) return alert("정확한 이름을 입력해주세요.");
    if (!userInfo.birthDate) return alert("생년월일을 입력해주세요.");
    
    const bYear = parseInt(userInfo.birthDate.split('-')[0], 10);
    if (bYear < 1901 || bYear > 2049) return alert("1901년 ~ 2049년 사이의 생년월일만 정밀 연산이 가능합니다.");

    if (!userInfo.isTimeUnknown && !userInfo.birthTime) return alert("태어난 시간을 입력하거나 '모름'에 체크해주세요.");
    
    const safeTime = userInfo.isTimeUnknown ? "12:00" : userInfo.birthTime;
    
    setIsProcessing(true); setImgFailed(false); 
    setCurrentView('calculating');
    const sajuResult: any = await fetchSajuFromAPI(userInfo.birthDate, safeTime, userInfo.isTimeUnknown, userInfo.calendarType);
    
    setUserInfo(prev => ({...prev, name: safeName}));
    setUserSaju(sajuResult);

    const kidKey = getKidStorageKey(safeName, userInfo.birthDate);
    let kidUnlocked = [];
    try { 
      const parsed = JSON.parse(localStorage.getItem(kidKey) || '[]'); 
      kidUnlocked = Array.isArray(parsed) ? parsed : [];
    } catch(e) {}
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
    if (/[^\x00-\x7F]/.test(cleanEmail)) return alert("이메일 주소에 한글이나 특수문자가 포함될 수 없습니다. 영문 이메일로 다시 확인해주세요.");

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

  const copyExternalTransferLink = () => {
    const encName = encodeURIComponent((userInfo.name || '').trim().slice(0, 10));
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
      } catch (err: any) {
        if (err.name !== 'AbortError') {
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pName = params.get('n'); const pDate = params.get('d');
    if (pName && pDate) {
      setUserInfo(prev => ({
        ...prev, name: safeDecode(pName).slice(0, 10), birthDate: pDate,
        birthTime: safeDecode(params.get('t')), calendarType: params.get('c') || 'solar',
        isTimeUnknown: params.get('u') === 'true'
      }));
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch(e) {}
    }
  }, []);

  const currentStudyType = CHILD_STUDY_MAP[userSaju.dayMaster] || CHILD_STUDY_MAP["甲"];

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
          <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center">
            <div className="w-8 h-8 border-4 border-[#E8C87A] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="font-serif text-lg font-bold text-[#E8C87A]">운명의 궤적을 분석 중입니다...</h2>
          </div>
        )}

        {currentView === 'menu' && (
          <div className="min-h-[100dvh] pt-8 px-5 pb-16 max-w-md mx-auto">
            <h2 className="font-serif text-lg font-bold text-[#E8C87A] mb-4 text-center">
              🌟 <span className="max-w-[130px] truncate align-middle inline-block">{userInfo.name}</span> 님의 사주 진단 결과
            </h2>
            
            {userSaju.isNightRollover && (
              <div className="bg-[#D4A843]/10 border border-[#D4A843]/40 text-[#D4A843] text-[10.5px] py-1 px-3 rounded-full mb-3 text-center font-bold">
                🌙 명리학 [야자시/조자시] 보정 좌표 적용 완료
              </div>
            )}

            {/* 🔥 3번 수술: 기둥이 비어있어도 화면이 박살나지 않는 안전 폴백 맵핑 🔥 */}
            <div className="glass-card rounded-2xl p-4 mb-4 overflow-x-auto">
              <div className="flex justify-around text-center min-w-[280px]">
                {(userSaju.pillars || []).map((pillar: any, idx: number) => (
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
              
              <div className="relative inline-block w-full max-w-[300px] mx-auto my-2">
                <div className="absolute inset-0 bg-[#D4A843] rounded-2xl blur-2xl opacity-35 animate-pulse"></div>
                {!imgFailed ? (
                  <img 
                    src={currentStudyType.imgUrl} 
                    alt={currentStudyType.title} 
                    onError={() => setImgFailed(true)} 
                    style={{ width: '100%', maxWidth: '300px', height: 'auto', maxHeight: '450px', objectFit: 'contain' }} 
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
                    className={`bg-[#111625] border border-[#D4A843]/30 rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 hover:border-[#D4A843] shadow-lg relative overflow-hidden group ${
                      menu.id === 7 ? "bg-gradient-to-r from-[#1A1530] to-[#2A1E14] border-2 border-[#D4A843]/50" : ""
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${menu.bar}`}></div>
                    
                    <div className="flex items-center justify-between mb-2 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#D4A843]/10 border border-[#D4A843]/20 flex-shrink-0">
                          <Icon size={18} className="text-[#D4A843]" style={{ flexShrink: 0 }} />
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
          <div className="relative z-20 min-h-[100dvh] min-h-[750px] bg-[#FDFBF7] text-[#1A1530] pb-12 animate-[sup_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
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
                    📥 {isPrintingLock ? "🖨️ 인쇄 엔진 냉각 중... (5초 후 활성화)" : "10,000자급 VVIP 리포트 PDF 저장"}
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

                  <div className={`bg-white border rounded-2xl p-4 text-center shadow-sm relative ${isProcessing ? 'pointer-events-none opacity-80 select-none' : ''}`}>
                    <div className="text-xs text-gray-400 line-through mb-0.5">정가 10,000원</div>
                    <div className="text-2xl font-serif font-black text-[#E8607A] mb-3">1,000원 <span className="text-xs bg-[#E8607A] text-white px-2 py-0.5 rounded-full font-sans">90% 특가</span></div>
                    <input type="email" required placeholder="결제 내역 받을 이메일" value={userInfo.email} onChange={e=>setUserInfo({...userInfo, email: e.target.value})} className="w-full border rounded-xl p-3 text-[16px] md:text-xs mb-2 outline-none" />
                    <input type="tel" required placeholder="휴대폰 번호 (자유롭게 입력)" value={userInfo.phone} onChange={e=>setUserInfo({...userInfo, phone: e.target.value})} className="w-full border rounded-xl p-3 text-[16px] md:text-xs mb-4 outline-none" />
                    
                    <button onClick={() => handlePayment('카드')} disabled={isProcessing || !isPgLoaded} className="w-full bg-[#FEE500] text-black font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition-transform disabled:opacity-50">
                      💳 {isPgLoaded ? "원본 포트원 안전 결제하기" : "PG 모듈 안전 로딩 중..."}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section: any, idx: number) => {
                    if (section.isSummary) {
                      return (
                        <div key={idx} className="bg-white border-[2.5px] border-[#E8C87A] rounded-[20px] p-[24px_20px] shadow-md my-6 relative overflow-hidden print:break-inside-avoid">
                          <div className="absolute top-0 left-0 w-full h-[6px] bg-[linear-gradient(90deg,#D4A843,#E8C050,#F5EAD0)]"></div>
                          <h4 className="font-serif text-[16px] font-black text-[#D4A843] mb-4 text-center flex items-center justify-center gap-2"><Crown size={18} /> {section.title}</h4>
                          <div className="bg-[#FFFDF9] border border-[#F5EAD0] rounded-xl p-4 mb-4 text-center">
                            <p className="text-[13.5px] text-[#4A3B32] font-bold leading-[1.8] break-keep">{section.paragraphs[0]}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid print:grid-cols-3 print:gap-2 justify-items-center mt-6">
                            {section.symbols?.map((sym: any, sIdx: number) => (
                              <div key={sIdx} className="flex flex-col items-center max-w-[80px]">
                                <div className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center text-[24px] shadow-sm border border-[#E8C87A]/40 mb-2">{sym.emoji}</div>
                                <span className="text-[9.5px] font-bold text-[#5A4080] bg-[#F5F0FF] px-2 py-0.5 rounded-full border border-[#E0D8F0] break-keep leading-tight text-center">{sym.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} className={`rounded-[18px] p-[24px_20px] border ${section.isHighlight ? 'bg-gradient-to-br from-[#FFF8F4] to-[#F8F4FF] border-[#E8C87A]/60 shadow-md print:break-inside-avoid' : 'bg-white shadow-sm border-gray-200'}`}>
                        <h4 className="font-serif text-[15px] font-black mb-4 text-[#D4A843] print:break-after-avoid">{section.title}</h4>
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
