// 👇 여기서부터 파일 맨 끝까지 덮어쓰기 하세요! 👇
export default function SajuLearningApp() {
  const [currentView, setCurrentView] = useState('intro');
  const [userInfo, setUserInfo] = useState({ name: '', birthDate: '', birthTime: '', calendarType: 'solar', isTimeUnknown: false });
  const [userSaju, setUserSaju] = useState({ dayMaster: '', main: '', lacking: '', excessive: '', pillars: [], counts: {} });
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [unlockedMenus, setUnlockedMenus] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔥 [새로 추가됨] 결제가 끝나고 돌아왔을 때, 원래 화면을 복구하는 마법의 로직
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');
    const isFail = urlParams.get('fail');

    if (isSuccess === 'true') {
      // 1. 페이지가 넘어가기 전 로컬 스토리지에 숨겨둔 정보들을 다시 꺼내옵니다.
      const savedUserInfo = JSON.parse(localStorage.getItem('sajuApp_userInfo'));
      const savedUserSaju = JSON.parse(localStorage.getItem('sajuApp_userSaju'));
      const savedMenu = JSON.parse(localStorage.getItem('sajuApp_selectedMenu'));

      if (savedUserInfo && savedUserSaju && savedMenu) {
        setUserInfo(savedUserInfo);
        setUserSaju(savedUserSaju);
        setSelectedMenu(savedMenu);
        setUnlockedMenus([savedMenu.id]); // 결제된 메뉴 잠금 해제!
        setCurrentView('result'); // 바로 결과 화면으로 쏴줍니다.
        
        alert("🎉 테스트 결제가 성공적으로 완료되었습니다!\n(테스트 환경이므로 실제 돈은 빠져나가지 않았습니다.)");
      }
      
      // 2. URL 끝에 붙은 너저분한 결제 기록(success=true) 지워주기
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
          alert("만세력 계산 중 오류가 발생했습니다. 다시 시도해주세요.");
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

  // 🔥 [새로 변경됨] 진짜 토스페이먼츠 결제창을 띄우는 함수!
  const handlePayment = async (method = '카드') => {
    // 1. 토스 결제창으로 넘어가면 우리 사이트가 일시적으로 꺼지기 때문에, 지금 데이터를 안전한 곳(로컬 스토리지)에 백업해둡니다.
    localStorage.setItem('sajuApp_userInfo', JSON.stringify(userInfo));
    localStorage.setItem('sajuApp_userSaju', JSON.stringify(userSaju));
    localStorage.setItem('sajuApp_selectedMenu', JSON.stringify(selectedMenu));

    // 2. 대표님의 클라이언트 키로 토스페이먼츠를 부릅니다.
    const clientKey = 'test_ck_lpP2YxJ4K877JAdv7KX8RGZwXLOb'; 
    const tossPayments = await loadTossPayments(clientKey);

    // 3. 결제창 팝업 띄우기
    tossPayments.requestPayment(method, {
      amount: 1000,
      orderId: 'order_' + new Date().getTime(), // 겹치지 않는 무작위 주문번호 생성
      orderName: `VVIP 사주 컨설팅 - ${selectedMenu.title.replace('\n', ' ')}`,
      customerName: userInfo.name || '고객',
      // 결제가 끝나면 현재 주소 뒤에 ?success=true를 붙여서 다시 우리 사이트로 돌아오게 만듭니다.
      successUrl: window.location.origin + window.location.pathname + '?success=true',
      failUrl: window.location.origin + window.location.pathname + '?fail=true',
    }).catch(function (error) {
      if (error.code === 'USER_CANCEL') {
        alert("결제를 취소하셨습니다.");
      }
    });
  };

  return (
    <div className="min-h-screen text-[rgba(255,255,255,0.88)] font-sans relative">
      <Starfield />

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap');
        .font-serif { font-family: 'Noto Serif KR', serif; }
        .font-sans { font-family: 'Noto Sans KR', sans-serif; }
        @keyframes twinkle { 0%, 100% { transform: scale(1); } 50% { opacity: 0.9 !important; transform: scale(1.3); } }
        @keyframes ndrift { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-15px) scale(1.05); } 66% { transform: translate(-10px,20px) scale(0.95); } }
        @keyframes ndrift-reverse { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-10px,20px) scale(0.95); } 66% { transform: translate(20px,-15px) scale(1.05); } }
        @keyframes mfloat { 0%, 100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-8px) rotate(4deg); } }
        @keyframes gpulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.7; } 50% { transform: translate(-50%,-50%) scale(1.5); opacity: 1; } }
        @keyframes sbtn { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes sweep { to { transform: translateX(100%); } }
        @keyframes obounce { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-10px); opacity: 1; } }
        @keyframes ficon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .glass-card { background: rgba(255,255,255,0.055); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.12); }
        .glass-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent); }
        .text-gradient-gold { background: linear-gradient(135deg, #fff 0%, #E8C87A 50%, #F5B8C8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-gradient-lavender { background: linear-gradient(90deg, #fff, #B8A8E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />

      {/* 1. INTRO VIEW */}
      {currentView === 'intro' && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
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
            <p className="text-[rgba(255,255,255,0.42)] text-[12.5px] leading-[1.85] tracking-[0.3px]">
              상위 0.1%가 몰래 참고한다는 타고난 그릇 분석과<br/>완벽하게 채워주는 VVIP 맞춤 학습 처방전 🗝️
            </p>
          </div>

          <div className="w-full max-w-sm glass-card rounded-[24px] p-6 relative overflow-hidden">
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold mb-2 flex items-center gap-1">👤 이름</label>
                <input type="text" placeholder="이름을 입력해주세요" required
                  className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-4 py-3.5 outline-none transition-colors focus:border-[rgba(212,168,67,0.5)] placeholder-[rgba(255,255,255,0.28)]"
                  value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#E8C87A] text-[10.5px] tracking-[1px] font-semibold flex items-center gap-1">🗓 생년월일</label>
                  <div className="flex bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-0.5 gap-0.5">
                    {[
                      { id: 'solar', label: '양력' },
                      { id: 'lunar', label: '음력' },
                      { id: 'leap', label: '윤달' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setUserInfo({...userInfo, calendarType: type.id})}
                        className={`text-[9.5px] font-bold px-2 py-1 rounded-md transition-colors ${userInfo.calendarType === type.id ? 'bg-[#E8C87A] text-[#1A1530]' : 'text-[rgba(255,255,255,0.5)] hover:text-white'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input type="date" required
                  className="w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-3 py-3.5 outline-none transition-colors focus:border-[rgba(212,168,67,0.5)] [color-scheme:dark]"
                  value={userInfo.birthDate} onChange={(e) => setUserInfo({...userInfo, birthDate: e.target.value})}
                />
              </div>

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
                  className={`w-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-xl text-white text-[13.5px] px-3 py-3.5 outline-none transition-colors focus:border-[rgba(212,168,67,0.5)] [color-scheme:dark] ${userInfo.isTimeUnknown ? 'opacity-30 cursor-not-allowed' : ''}`}
                  value={userInfo.birthTime} onChange={(e) => setUserInfo({...userInfo, birthTime: e.target.value})}
                />
              </div>

              <button type="submit"
                className="w-full mt-4 p-[15px] rounded-2xl text-[#1A1530] font-serif font-bold text-[16px] tracking-[0.5px] cursor-pointer relative overflow-hidden transition-transform active:scale-[0.97] shadow-[0_8px_32px_rgba(212,168,67,0.22)] bg-[linear-gradient(135deg,#C89830,#E8C050,#D4A843)] bg-[length:200%_200%] animate-[sbtn_3s_ease-in-out_infinite]"
              >
                ✨ 비밀 학습 컨설팅 확인하러가기
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] -translate-x-full animate-[sweep_2.5s_ease-in-out_infinite_1s]"></div>
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
            <div className="w-3 h-3 rounded-full bg-[#7EC8B8] animate-[obounce_1.2s_ease-in-out_infinite]" style={{animationDelay: '0.45s'}}></div>
          </div>
          <h2 className="font-serif text-[18px] font-black text-white mb-2 text-gradient-lavender">숨겨진 비밀을 분석 중이에요 🌙</h2>
          <p className="text-[#A090C0] text-[12.5px] text-center">타고난 운명의 궤적을 추적하여<br/>{userInfo.name}님만의 잠재력을 분석하고 있습니다.</p>
        </div>
      )}

      {/* 3. MENU VIEW */}
      {currentView === 'menu' && (
        <div className="relative z-10 min-h-screen pt-8 px-5 pb-16">
          <div className="mb-6">
            <h2 className="font-serif text-[18px] font-black text-gradient-lavender mb-1">🌟 VVIP 프라이빗 분석 메뉴</h2>
            <p className="text-[11px] text-[rgba(255,255,255,0.42)]">원하시는 심층 분석 항목을 선택해 주세요</p>
          </div>

          <div className="glass-card mb-6 p-4 text-center rounded-2xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[rgba(212,168,67,0.15)] border border-[rgba(212,168,67,0.5)] text-[#E8C87A] text-[10px] tracking-widest px-3 py-1 rounded-full font-serif">
              명식 진단 완료
            </div>
            <p className="font-serif text-[15px] font-black text-white mt-3 mb-3">
              <span className="text-[#E8C87A]">{userInfo.name}</span> 님의 사주 팔자
            </p>
            <div className="flex justify-center gap-2 w-full px-2">
              {userSaju.pillars.map((pillar, idx) => (
                <div key={idx} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded px-2 py-2 flex flex-col items-center shadow-lg flex-1">
                  <div className="flex items-end gap-[2px] mb-1">
                    <span className="text-white font-serif font-black text-lg leading-none">{pillar.tH}</span>
                    <span className="text-[#E8C87A] font-sans font-bold text-[10px] leading-[1.2]">{pillar.tK}</span>
                  </div>
                  <div className="flex items-end gap-[2px]">
                    <span className="text-white font-serif font-black text-lg leading-none">{pillar.bH}</span>
                    <span className="text-[#E8C87A] font-sans font-bold text-[10px] leading-[1.2]">{pillar.bK}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {MENU_LIST.map((menu, i) => {
              const Icon = menu.icon;
              return (
                <div key={menu.id} onClick={() => { setSelectedMenu(menu); setCurrentView('result'); }}
                  className="bg-[rgba(255,255,255,0.95)] rounded-[22px] p-[20px_12px_18px] flex flex-col items-center text-center cursor-pointer relative shadow-[0_4px_24px_rgba(13,11,26,0.12)] overflow-hidden transition-all hover:-translate-y-1 active:scale-95"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[5px] rounded-t-[22px] ${menu.bar}`}></div>
                  <div className="absolute w-[80px] h-[80px] rounded-full opacity-10 -bottom-5 -right-5" style={{backgroundColor: menu.bg}}></div>
                  
                  <div className="w-[48px] h-[48px] rounded-2xl flex items-center justify-center mb-3 relative" style={{backgroundColor: `${menu.bg}22`}}>
                    <Icon size={24} className="text-[#1A1530] relative z-10 animate-[ficon_3s_ease-in-out_infinite]" style={{animationDelay: `${i * 0.3}s`}} strokeWidth={2} />
                  </div>
                  
                  <div className="text-[12px] font-bold text-[#1A1530] leading-[1.4] mb-1.5 whitespace-pre-line">{menu.title}</div>
                  <div className="text-[10px] text-[#888] mb-1 break-keep">나만의 맞춤 솔루션</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. RESULT VIEW */}
      {currentView === 'result' && (
        <div className="relative z-20 min-h-screen bg-[#FDFBF7] text-[#1A1530] pb-12 animate-[sup_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="px-4 py-4 flex items-center sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur border-b border-[#EAE1D8]">
            <button onClick={() => setCurrentView('menu')} className="p-2 mr-2 bg-white border border-[#EAE1D8] rounded-full text-[#1A1530] shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-[15px] font-black flex-1 text-center pr-10 font-sans whitespace-pre-line leading-tight">
              {selectedMenu.title.replace('\n', ' ')}
            </h2>
          </div>

          <div className="max-w-md mx-auto w-full p-5 mt-2">
            
            <p className="text-center text-[#A090C0] font-bold text-[11px] tracking-widest mb-3 uppercase">Destiny Card</p>

            {/* 메인 타로 카드 */}
            <div className="bg-[#1A1530] rounded-[24px] shadow-[0_8px_32px_rgba(26,21,48,0.3)] p-6 relative mb-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,67,0.15),transparent_60%)]"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <h3 className="font-serif text-[#E8C87A] text-xl mb-4 text-center tracking-widest">{DAY_MASTERS[userSaju.dayMaster].name}</h3>
                
                <div className="w-[120px] h-[120px] rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(212,168,67,0.3)] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,168,67,0.15)] relative">
                  <div className="absolute inset-0 rounded-full bg-[rgba(212,168,67,0.2)] blur-xl"></div>
                  {React.createElement(DAY_MASTERS[userSaju.dayMaster].icon, { size: 56, className: "text-[#E8C87A] relative z-10", strokeWidth: 1.5 })}
                </div>

                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl p-3 text-center mb-5 w-full">
                  <p className="text-[rgba(255,255,255,0.9)] font-medium text-[12px] leading-relaxed break-keep">
                    저는 <span className="text-[#E8C87A] font-bold">[{DAY_MASTERS[userSaju.dayMaster].nature}]</span> 의 기운을 품고 태어났습니다.
                  </p>
                </div>

                <h1 className="text-3xl font-black text-white tracking-[0.2em] mb-4 font-serif drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                  {userSaju.main.split('(')[0]}
                </h1>
              </div>
            </div>

            {/* 미리보기 (항상 노출) */}
            <div className="bg-[linear-gradient(135deg,#FFF8F0,#FEF0F8)] border-[1.5px] border-[#F5D8C8] rounded-[18px] p-[18px_16px] mb-4">
              <div className="inline-flex items-center gap-1 bg-[linear-gradient(135deg,#D4A843,#E8C050)] text-[#1A1530] text-[9.5px] font-bold px-[10px] py-[3px] rounded-full mb-2.5 tracking-[0.5px]">
                ✦ 핵심 진단 (미리보기)
              </div>
              <p className="text-[13.5px] text-[#2A1530] leading-[1.8] font-medium break-keep whitespace-pre-line">
                {PREVIEW_DATA[selectedMenu.id](userInfo, userSaju)}
              </p>
            </div>

            {/* 잠금/결제 UI or 전체 결과 */}
            {!unlockedMenus.includes(selectedMenu.id) ? (
              <div className="mt-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#D4A843] animate-bounce" style={{animationDelay: '0s'}}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E8849A] animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#B8A8E8] animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-[13px] text-[#5A4080] font-bold mt-2">별의 기운을 해석하는 중입니다...</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-[linear-gradient(135deg,#F8F4FF,#F4F8FF)] border-[1.5px] border-dashed border-[#C8B8E8] rounded-[18px] p-[18px_16px] mb-6 relative overflow-hidden">
                      <div className="blur-[5px] select-none opacity-60">
                        <p className="text-[13px] text-[#888] leading-[1.8]">
                          사주에 숨겨진 비밀을 모두 알려드릴게요. 이 공간에는 맞춤형 학습 처방, 운기를 올리는 방법, 부족한 오행을 채우는 비밀스러운 조언들이 가득 담겨있습니다. 결제 후 마법 같은 솔루션을 확인해보세요.
                        </p>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5px]">
                        <div className="text-[24px]">🔒</div>
                        <div className="text-[12px] text-[#5A4080] font-bold bg-white/80 px-3 py-1 rounded-full shadow-sm">전체 분석은 결제 후 열람</div>
                      </div>
                    </div>

                    <div className="text-center mb-5">
                      <h3 className="font-serif text-[16px] font-black text-[#1A1530] mb-2">✨ 전체 분석 열람하기</h3>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-[13px] text-[#C0B0C0] line-through">10,000원</span>
                        <span className="text-[26px] font-black text-[#E8607A] font-serif">1,000</span>
                        <span className="text-[13px] text-[#5A4080] font-bold">원</span>
                        <span className="inline-block bg-[#E8607A] text-white text-[10px] font-bold px-[8px] py-[2px] rounded-full ml-1 align-middle">90% 할인</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <button onClick={() => handlePayment('카드')} className="w-full bg-[#FEE500] text-[#3C1E1E] p-[14px] rounded-[16px] font-bold text-[14px] flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-sm">
                        <MessageCircle size={18} fill="#3C1E1E" /> 테스트 카드 결제해보기
                      </button>
                      <button onClick={() => handlePayment('가상계좌')} className="w-full bg-[linear-gradient(135deg,#2D2550,#4A3580)] text-white p-[14px] rounded-[16px] font-bold text-[14px] flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-md">
                        <Building size={18} /> 테스트 가상계좌 (계좌이체)
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-[sup_0.4s_ease-out_forwards]">
                {generateProfessionalReport(userInfo, userSaju, selectedMenu.id).map((section, idx) => {
                  
                  // 요약 섹션 특수 렌더링
                  if (section.isSummary) {
                    return (
                      <div key={idx} className="bg-white border-[2.5px] border-[#E8C87A] rounded-[20px] p-[24px_20px] shadow-[0_6px_20px_rgba(212,168,67,0.2)] my-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[6px] bg-[linear-gradient(90deg,#D4A843,#E8C050,#F5EAD0)]"></div>
                        <h4 className="font-serif text-[17px] font-black text-[#D4A843] mb-5 text-center flex items-center justify-center gap-2">
                          <Crown size={20} className="text-[#D4A843]" /> {section.title}
                        </h4>
                        
                        <div className="bg-[#FFFDF9] border border-[#F5EAD0] rounded-xl p-5 mb-6 relative">
                          <div className="absolute -top-3 -left-2 text-[30px] text-[#E8C87A]/40 font-serif">"</div>
                          <p className="text-[14px] text-[#4A3B32] font-bold leading-[1.9] text-center break-keep relative z-10 px-2">
                            {section.paragraphs[0]}
                          </p>
                          <div className="absolute -bottom-5 -right-2 text-[30px] text-[#E8C87A]/40 font-serif">"</div>
                        </div>

                        <div className="flex justify-center gap-6 mt-6">
                          {section.symbols.map((sym, sIdx) => (
                            <div key={sIdx} className="flex flex-col items-center">
                              <div className="w-[56px] h-[56px] bg-white rounded-full flex items-center justify-center text-[26px] shadow-md border-[2px] border-[#E8C87A]/40 mb-3 transform hover:scale-110 transition-transform">
                                {sym.emoji}
                              </div>
                              <span className="text-[11px] font-bold text-[#5A4080] bg-[#F5F0FF] px-3 py-1 rounded-full border border-[#E0D8F0] shadow-sm">{sym.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 일반 섹션 렌더링
                  return (
                    <div key={idx} className={`rounded-[18px] p-[24px_20px] ${section.isHighlight ? 'bg-[linear-gradient(135deg,#FFF8F4,#F8F4FF)] border-[2px] border-[#E8C87A]/60 shadow-lg' : 'bg-white shadow-sm border border-gray-200'}`}>
                      <h4 className={`font-serif text-[16px] font-black mb-5 flex items-center gap-2 ${section.isHighlight ? 'text-[#D4A843]' : 'text-[#C87090]'}`}>
                        {section.title}
                      </h4>
                      {section.paragraphs.map((text, pIdx) => {
                        // 【 STEP ... 】 형식의 텍스트는 시각적으로 완전히 분리된 소제목 디자인으로 렌더링
                        const isSubtitle = text.startsWith('【') && text.endsWith('】');
                        if (isSubtitle) {
                          return (
                            <h5 key={pIdx} className="font-serif text-[15px] font-black text-[#A84050] mt-8 mb-3 bg-[#FFF8F4] inline-block px-3.5 py-1.5 rounded-lg border-l-[4px] border-[#C87090] shadow-sm">
                              {text.replace('【', '').replace('】', '')}
                            </h5>
                          );
                        }

                        // 일반 문단 렌더링
                        return (
                          <p key={pIdx} className="text-[14.5px] text-[#2A1530] leading-[1.9] mb-4 last:mb-0 break-keep text-justify">
                            {text}
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
    </div>
  );
}
