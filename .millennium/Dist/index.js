const MILLENNIUM_IS_CLIENT_MODULE=!0,pluginName="hubcap-add";function InitializePlugins(){var e,t;let n;(e=window.PLUGIN_LIST||(window.PLUGIN_LIST={}))[pluginName]||(e[pluginName]={}),(t=window.MILLENNIUM_PLUGIN_SETTINGS_STORE||(window.MILLENNIUM_PLUGIN_SETTINGS_STORE={}))[pluginName]||(t[pluginName]={}),window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS||(window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS={}),function(e){e[e.CallServerMethod=0]="CallServerMethod"}(n||(n={}));let a=window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName],i=`Millennium.Internal.IPC.[${pluginName}]`;const l={DropDown:["string","number","boolean"],NumberTextInput:["number"],StringTextInput:["string"],FloatTextInput:["number"],CheckBox:["boolean"],NumberSlider:["number"],FloatSlider:["number"]};function o(e,t,a){return MILLENNIUM_BACKEND_IPC.postMessage(n.CallServerMethod,{pluginName:e,methodName:"__builtins__.__update_settings_value__",argumentList:{name:t,value:a}})}a.ignoreProxyFlag=!1,async function(){for(;"undefined"==typeof MainWindowBrowserManager;)await new Promise(e=>setTimeout(e,0));MainWindowBrowserManager?.m_browser?.on("message",(e,t)=>{if(e!==i)return;const{name:n,value:l}=JSON.parse(t);a.ignoreProxyFlag=!0,a.settingsStore[n]=l,o(pluginName,n,l),a.ignoreProxyFlag=!1})}();const r=e=>new Proxy(e,{set(e,t,n){if(!(t in e))throw new TypeError(`Property ${String(t)} does not exist on plugin settings`);const r=l[e[t].type],s=e[t]?.range;if(r.includes("number")&&"number"==typeof n&&(s&&(n=function(e,t,n){return Math.max(t,Math.min(n,e))}(n,s[0],s[1])),n||(n=0)),!r.includes(typeof n))throw new TypeError(`Expected ${r.join(" or ")}, got ${typeof n}`);return e[t].value=n,((e,t)=>{a.ignoreProxyFlag||(o(pluginName,e,t),"undefined"!=typeof MainWindowBrowserManager&&MainWindowBrowserManager?.m_browser?.PostMessage(i,JSON.stringify({name:e,value:t})))})(String(t),n),!0},get:(e,t)=>"__raw_get_internals__"===t?e:t in e?e[t].value:void 0});a.DefinePluginSetting=r,a.settingsStore=r({})}InitializePlugins();const __call_server_method__=(e,t)=>Millennium.callServerMethod(pluginName,e,t);function __wrapped_callable__(e){return e.startsWith("webkit:")?MILLENNIUM_API.callable((e,t)=>MILLENNIUM_API.__INTERNAL_CALL_WEBKIT_METHOD__(pluginName,e,t),e.replace(/^webkit:/,"")):MILLENNIUM_API.callable(__call_server_method__,e)}let PluginEntryPointMain=function(){return function(exports,jsx,React,MILLENNIUM){"use strict";
const getConfig=__wrapped_callable__("GetConfig");
const setApiKey=__wrapped_callable__("SetApiKey");
const getUsage=__wrapped_callable__("GetUsage");

const STRINGS={
  english:{intro:"Add games to your Steam library from their page, without another tool.",ready:"Hubcap is ready.",notInstalled:"Hubcap is not installed. Run hubcaptools once, then come back.",saved:"Saved key: ",yourKey:"Your Hubcap key",placeholder:"paste your key here",save:"Save",saving:"Saving...",savedOk:"Key saved",where:"You can find it on hubcapmanifest.com, under API Keys.",quotaReached:"Daily quota reached, try again tomorrow.",quota:"Today: {used} / {limit} downloads",quotaNone:"Quota: —",loading:"Loading..."},
  french:{intro:"Ajoute des jeux à ta bibliothèque Steam depuis leur page, sans passer par un autre logiciel.",ready:"Hubcap est prêt.",notInstalled:"Hubcap n'est pas installé. Lance hubcaptools une première fois, puis reviens ici.",saved:"Clé enregistrée : ",yourKey:"Ta clé Hubcap",placeholder:"colle ta clé ici",save:"Enregistrer",saving:"Enregistrement...",savedOk:"Clé enregistrée",where:"Tu la trouves sur hubcapmanifest.com, rubrique API Keys.",quotaReached:"Quota du jour atteint, réessaie demain.",quota:"Aujourd'hui : {used} / {limit} téléchargements",quotaNone:"Quota : —",loading:"Chargement..."},
  german:{intro:"Füge Spiele direkt von ihrer Seite zu deiner Steam-Bibliothek hinzu.",ready:"Hubcap ist bereit.",notInstalled:"Hubcap ist nicht installiert. Starte hubcaptools einmal und komm zurück.",saved:"Gespeicherter Schlüssel: ",yourKey:"Dein Hubcap-Schlüssel",placeholder:"Schlüssel hier einfügen",save:"Speichern",saving:"Wird gespeichert...",savedOk:"Schlüssel gespeichert",where:"Du findest ihn auf hubcapmanifest.com unter API Keys.",quotaReached:"Tageslimit erreicht, versuche es morgen erneut.",quota:"Heute: {used} / {limit} Downloads",quotaNone:"Limit: —",loading:"Lädt..."},
  spanish:{intro:"Añade juegos a tu biblioteca de Steam desde su página, sin otro programa.",ready:"Hubcap está listo.",notInstalled:"Hubcap no está instalado. Ejecuta hubcaptools una vez y vuelve.",saved:"Clave guardada: ",yourKey:"Tu clave de Hubcap",placeholder:"pega tu clave aquí",save:"Guardar",saving:"Guardando...",savedOk:"Clave guardada",where:"La encuentras en hubcapmanifest.com, apartado API Keys.",quotaReached:"Cuota diaria agotada, vuelve mañana.",quota:"Hoy: {used} / {limit} descargas",quotaNone:"Cuota: —",loading:"Cargando..."},
  latam:{intro:"Añade juegos a tu biblioteca de Steam desde su página, sin otro programa.",ready:"Hubcap está listo.",notInstalled:"Hubcap no está instalado. Ejecuta hubcaptools una vez y vuelve.",saved:"Clave guardada: ",yourKey:"Tu clave de Hubcap",placeholder:"pega tu clave aquí",save:"Guardar",saving:"Guardando...",savedOk:"Clave guardada",where:"La encuentras en hubcapmanifest.com, apartado API Keys.",quotaReached:"Cuota diaria agotada, vuelve mañana.",quota:"Hoy: {used} / {limit} descargas",quotaNone:"Cuota: —",loading:"Cargando..."},
  italian:{intro:"Aggiungi giochi alla tua libreria Steam dalla loro pagina, senza altri programmi.",ready:"Hubcap è pronto.",notInstalled:"Hubcap non è installato. Avvia hubcaptools una volta e torna qui.",saved:"Chiave salvata: ",yourKey:"La tua chiave Hubcap",placeholder:"incolla qui la chiave",save:"Salva",saving:"Salvataggio...",savedOk:"Chiave salvata",where:"La trovi su hubcapmanifest.com, sezione API Keys.",quotaReached:"Quota giornaliera esaurita, riprova domani.",quota:"Oggi: {used} / {limit} download",quotaNone:"Quota: —",loading:"Caricamento..."},
  portuguese:{intro:"Adiciona jogos à tua biblioteca Steam a partir da página deles, sem outro programa.",ready:"O Hubcap está pronto.",notInstalled:"O Hubcap não está instalado. Executa o hubcaptools uma vez e volta.",saved:"Chave guardada: ",yourKey:"A tua chave Hubcap",placeholder:"cola a tua chave aqui",save:"Guardar",saving:"A guardar...",savedOk:"Chave guardada",where:"Encontras em hubcapmanifest.com, secção API Keys.",quotaReached:"Quota diária atingida, tenta amanhã.",quota:"Hoje: {used} / {limit} transferências",quotaNone:"Quota: —",loading:"A carregar..."},
  brazilian:{intro:"Adicione jogos à sua biblioteca Steam direto da página deles, sem outro programa.",ready:"O Hubcap está pronto.",notInstalled:"O Hubcap não está instalado. Execute o hubcaptools uma vez e volte.",saved:"Chave salva: ",yourKey:"Sua chave Hubcap",placeholder:"cole sua chave aqui",save:"Salvar",saving:"Salvando...",savedOk:"Chave salva",where:"Você a encontra em hubcapmanifest.com, seção API Keys.",quotaReached:"Cota diária atingida, tente amanhã.",quota:"Hoje: {used} / {limit} downloads",quotaNone:"Cota: —",loading:"Carregando..."},
  russian:{intro:"Добавляйте игры в библиотеку Steam прямо со страницы игры.",ready:"Hubcap готов.",notInstalled:"Hubcap не установлен. Запустите hubcaptools один раз и вернитесь.",saved:"Сохранённый ключ: ",yourKey:"Ваш ключ Hubcap",placeholder:"вставьте ключ сюда",save:"Сохранить",saving:"Сохранение...",savedOk:"Ключ сохранён",where:"Его можно найти на hubcapmanifest.com в разделе API Keys.",quotaReached:"Дневной лимит исчерпан, попробуйте завтра.",quota:"Сегодня: {used} / {limit} загрузок",quotaNone:"Лимит: —",loading:"Загрузка..."},
  polish:{intro:"Dodawaj gry do biblioteki Steam prosto z ich strony, bez innego programu.",ready:"Hubcap jest gotowy.",notInstalled:"Hubcap nie jest zainstalowany. Uruchom hubcaptools raz i wróć.",saved:"Zapisany klucz: ",yourKey:"Twój klucz Hubcap",placeholder:"wklej tutaj klucz",save:"Zapisz",saving:"Zapisywanie...",savedOk:"Klucz zapisany",where:"Znajdziesz go na hubcapmanifest.com w sekcji API Keys.",quotaReached:"Dzienny limit wykorzystany, spróbuj jutro.",quota:"Dzisiaj: {used} / {limit} pobrań",quotaNone:"Limit: —",loading:"Ładowanie..."},
  dutch:{intro:"Voeg spellen toe aan je Steam-bibliotheek vanaf hun pagina, zonder ander programma.",ready:"Hubcap is klaar.",notInstalled:"Hubcap is niet geïnstalleerd. Start hubcaptools één keer en kom terug.",saved:"Opgeslagen sleutel: ",yourKey:"Je Hubcap-sleutel",placeholder:"plak je sleutel hier",save:"Opslaan",saving:"Opslaan...",savedOk:"Sleutel opgeslagen",where:"Je vindt hem op hubcapmanifest.com, onder API Keys.",quotaReached:"Daglimiet bereikt, probeer het morgen.",quota:"Vandaag: {used} / {limit} downloads",quotaNone:"Limiet: —",loading:"Laden..."},
  danish:{intro:"Føj spil til dit Steam-bibliotek fra deres side, uden andre programmer.",ready:"Hubcap er klar.",notInstalled:"Hubcap er ikke installeret. Kør hubcaptools én gang og kom tilbage.",saved:"Gemt nøgle: ",yourKey:"Din Hubcap-nøgle",placeholder:"indsæt din nøgle her",save:"Gem",saving:"Gemmer...",savedOk:"Nøgle gemt",where:"Du finder den på hubcapmanifest.com under API Keys.",quotaReached:"Daglig kvote nået, prøv i morgen.",quota:"I dag: {used} / {limit} downloads",quotaNone:"Kvote: —",loading:"Indlæser..."},
  swedish:{intro:"Lägg till spel i ditt Steam-bibliotek från deras sida, utan andra program.",ready:"Hubcap är redo.",notInstalled:"Hubcap är inte installerat. Kör hubcaptools en gång och kom tillbaka.",saved:"Sparad nyckel: ",yourKey:"Din Hubcap-nyckel",placeholder:"klistra in din nyckel här",save:"Spara",saving:"Sparar...",savedOk:"Nyckel sparad",where:"Du hittar den på hubcapmanifest.com under API Keys.",quotaReached:"Daglig kvot nådd, försök i morgon.",quota:"I dag: {used} / {limit} nedladdningar",quotaNone:"Kvot: —",loading:"Läser in..."},
  norwegian:{intro:"Legg til spill i Steam-biblioteket fra siden deres, uten andre programmer.",ready:"Hubcap er klar.",notInstalled:"Hubcap er ikke installert. Kjør hubcaptools én gang og kom tilbake.",saved:"Lagret nøkkel: ",yourKey:"Din Hubcap-nøkkel",placeholder:"lim inn nøkkelen din her",save:"Lagre",saving:"Lagrer...",savedOk:"Nøkkel lagret",where:"Du finner den på hubcapmanifest.com under API Keys.",quotaReached:"Daglig kvote nådd, prøv i morgen.",quota:"I dag: {used} / {limit} nedlastinger",quotaNone:"Kvote: —",loading:"Laster..."},
  finnish:{intro:"Lisää pelejä Steam-kirjastoosi niiden sivulta ilman muuta ohjelmaa.",ready:"Hubcap on valmis.",notInstalled:"Hubcap ei ole asennettu. Käynnistä hubcaptools kerran ja palaa.",saved:"Tallennettu avain: ",yourKey:"Hubcap-avaimesi",placeholder:"liitä avain tähän",save:"Tallenna",saving:"Tallennetaan...",savedOk:"Avain tallennettu",where:"Löydät sen osoitteesta hubcapmanifest.com kohdasta API Keys.",quotaReached:"Päiväkiintiö täynnä, yritä huomenna.",quota:"Tänään: {used} / {limit} latausta",quotaNone:"Kiintiö: —",loading:"Ladataan..."},
  czech:{intro:"Přidávej hry do knihovny Steam přímo z jejich stránky, bez jiného programu.",ready:"Hubcap je připraven.",notInstalled:"Hubcap není nainstalován. Spusť hubcaptools jednou a vrať se.",saved:"Uložený klíč: ",yourKey:"Tvůj klíč Hubcap",placeholder:"vlož sem klíč",save:"Uložit",saving:"Ukládání...",savedOk:"Klíč uložen",where:"Najdeš ho na hubcapmanifest.com v sekci API Keys.",quotaReached:"Denní limit vyčerpán, zkus to zítra.",quota:"Dnes: {used} / {limit} stažení",quotaNone:"Limit: —",loading:"Načítání..."},
  hungarian:{intro:"Adj hozzá játékokat a Steam-könyvtáradhoz a saját oldalukról, más program nélkül.",ready:"A Hubcap kész.",notInstalled:"A Hubcap nincs telepítve. Futtasd a hubcaptools-t egyszer, majd gyere vissza.",saved:"Mentett kulcs: ",yourKey:"A Hubcap-kulcsod",placeholder:"illeszd be a kulcsot",save:"Mentés",saving:"Mentés...",savedOk:"Kulcs mentve",where:"A hubcapmanifest.com oldalon, az API Keys alatt találod.",quotaReached:"A napi keret elfogyott, próbáld holnap.",quota:"Ma: {used} / {limit} letöltés",quotaNone:"Keret: —",loading:"Betöltés..."},
  romanian:{intro:"Adaugă jocuri în biblioteca Steam direct de pe pagina lor, fără alt program.",ready:"Hubcap este pregătit.",notInstalled:"Hubcap nu este instalat. Rulează hubcaptools o dată și revino.",saved:"Cheie salvată: ",yourKey:"Cheia ta Hubcap",placeholder:"lipește cheia aici",save:"Salvează",saving:"Se salvează...",savedOk:"Cheie salvată",where:"O găsești pe hubcapmanifest.com, la secțiunea API Keys.",quotaReached:"Limita zilnică atinsă, încearcă mâine.",quota:"Astăzi: {used} / {limit} descărcări",quotaNone:"Limită: —",loading:"Se încarcă..."},
  bulgarian:{intro:"Добавяй игри в библиотеката си в Steam направо от страницата им, без друг програм.",ready:"Hubcap е готов.",notInstalled:"Hubcap не е инсталиран. Стартирай hubcaptools веднъж и се върни.",saved:"Запазен ключ: ",yourKey:"Твоят ключ Hubcap",placeholder:"постави ключа тук",save:"Запази",saving:"Запазване...",savedOk:"Ключът е запазен",where:"Намира се на hubcapmanifest.com, раздел API Keys.",quotaReached:"Дневният лимит е изчерпан, опитай утре.",quota:"Днес: {used} / {limit} изтегляния",quotaNone:"Лимит: —",loading:"Зареждане..."},
  greek:{intro:"Πρόσθεσε παιχνίδια στη βιβλιοθήκη σου στο Steam από τη σελίδα τους, χωρίς άλλο πρόγραμμα.",ready:"Το Hubcap είναι έτοιμο.",notInstalled:"Το Hubcap δεν είναι εγκατεστημένο. Εκτέλεσε το hubcaptools μία φορά και επέστρεψε.",saved:"Αποθηκευμένο κλειδί: ",yourKey:"Το κλειδί σου Hubcap",placeholder:"επικόλλησε το κλειδί εδώ",save:"Αποθήκευση",saving:"Αποθήκευση...",savedOk:"Το κλειδί αποθηκεύτηκε",where:"Το βρίσκεις στο hubcapmanifest.com, στην ενότητα API Keys.",quotaReached:"Το ημερήσιο όριο εξαντλήθηκε, δοκίμασε αύριο.",quota:"Σήμερα: {used} / {limit} λήψεις",quotaNone:"Όριο: —",loading:"Φόρτωση..."},
  turkish:{intro:"Oyunları kendi sayfalarından Steam kitaplığına ekle, başka program olmadan.",ready:"Hubcap hazır.",notInstalled:"Hubcap kurulu değil. hubcaptools'u bir kez çalıştır ve geri dön.",saved:"Kayıtlı anahtar: ",yourKey:"Hubcap anahtarın",placeholder:"anahtarını buraya yapıştır",save:"Kaydet",saving:"Kaydediliyor...",savedOk:"Anahtar kaydedildi",where:"hubcapmanifest.com adresinde API Keys bölümünde bulabilirsin.",quotaReached:"Günlük kota doldu, yarın tekrar dene.",quota:"Bugün: {used} / {limit} indirme",quotaNone:"Kota: —",loading:"Yükleniyor..."},
  ukrainian:{intro:"Додавай ігри до бібліотеки Steam прямо зі сторінки гри, без інших програм.",ready:"Hubcap готовий.",notInstalled:"Hubcap не встановлено. Запусти hubcaptools один раз і повернись.",saved:"Збережений ключ: ",yourKey:"Твій ключ Hubcap",placeholder:"встав ключ сюди",save:"Зберегти",saving:"Збереження...",savedOk:"Ключ збережено",where:"Його можна знайти на hubcapmanifest.com у розділі API Keys.",quotaReached:"Денний ліміт вичерпано, спробуй завтра.",quota:"Сьогодні: {used} / {limit} завантажень",quotaNone:"Ліміт: —",loading:"Завантаження..."},
  japanese:{intro:"ゲームのページから直接 Steam ライブラリに追加できます。",ready:"Hubcap の準備ができました。",notInstalled:"Hubcap がインストールされていません。hubcaptools を一度起動してから戻ってください。",saved:"保存済みのキー: ",yourKey:"Hubcap キー",placeholder:"ここにキーを貼り付け",save:"保存",saving:"保存中...",savedOk:"キーを保存しました",where:"hubcapmanifest.com の API Keys にあります。",quotaReached:"本日の上限に達しました。明日お試しください。",quota:"今日: {used} / {limit} ダウンロード",quotaNone:"上限: —",loading:"読み込み中..."},
  koreana:{intro:"게임 페이지에서 바로 Steam 라이브러리에 추가할 수 있습니다.",ready:"Hubcap이 준비되었습니다.",notInstalled:"Hubcap이 설치되어 있지 않습니다. hubcaptools를 한 번 실행한 뒤 돌아오세요.",saved:"저장된 키: ",yourKey:"Hubcap 키",placeholder:"여기에 키를 붙여넣으세요",save:"저장",saving:"저장 중...",savedOk:"키를 저장했습니다",where:"hubcapmanifest.com의 API Keys에서 찾을 수 있습니다.",quotaReached:"일일 할당량을 초과했습니다. 내일 다시 시도하세요.",quota:"오늘: {used} / {limit} 다운로드",quotaNone:"할당량: —",loading:"불러오는 중..."},
  schinese:{intro:"直接从游戏页面把游戏添加到 Steam 库。",ready:"Hubcap 已就绪。",notInstalled:"Hubcap 未安装。请先运行一次 hubcaptools，然后回来。",saved:"已保存的密钥: ",yourKey:"你的 Hubcap 密钥",placeholder:"在此粘贴密钥",save:"保存",saving:"保存中...",savedOk:"密钥已保存",where:"可在 hubcapmanifest.com 的 API Keys 中找到。",quotaReached:"今日配额已用完，请明天再试。",quota:"今天: {used} / {limit} 次下载",quotaNone:"配额: —",loading:"加载中..."},
  tchinese:{intro:"直接從遊戲頁面把遊戲加入 Steam 收藏庫。",ready:"Hubcap 已就緒。",notInstalled:"Hubcap 未安裝。請先執行一次 hubcaptools，然後回來。",saved:"已儲存的金鑰: ",yourKey:"你的 Hubcap 金鑰",placeholder:"在此貼上金鑰",save:"儲存",saving:"儲存中...",savedOk:"金鑰已儲存",where:"可在 hubcapmanifest.com 的 API Keys 中找到。",quotaReached:"今日配額已用完，請明天再試。",quota:"今天: {used} / {limit} 次下載",quotaNone:"配額: —",loading:"載入中..."},
  thai:{intro:"เพิ่มเกมลงคลัง Steam ได้จากหน้าเกมโดยตรง",ready:"Hubcap พร้อมใช้งาน",notInstalled:"ยังไม่ได้ติดตั้ง Hubcap กรุณารัน hubcaptools หนึ่งครั้งแล้วกลับมา",saved:"คีย์ที่บันทึกไว้: ",yourKey:"คีย์ Hubcap ของคุณ",placeholder:"วางคีย์ที่นี่",save:"บันทึก",saving:"กำลังบันทึก...",savedOk:"บันทึกคีย์แล้ว",where:"หาได้ที่ hubcapmanifest.com ในส่วน API Keys",quotaReached:"โควตารายวันหมดแล้ว ลองใหม่พรุ่งนี้",quota:"วันนี้: {used} / {limit} ดาวน์โหลด",quotaNone:"โควตา: —",loading:"กำลังโหลด..."},
  vietnamese:{intro:"Thêm trò chơi vào thư viện Steam ngay từ trang của chúng.",ready:"Hubcap đã sẵn sàng.",notInstalled:"Hubcap chưa được cài đặt. Chạy hubcaptools một lần rồi quay lại.",saved:"Khóa đã lưu: ",yourKey:"Khóa Hubcap của bạn",placeholder:"dán khóa vào đây",save:"Lưu",saving:"Đang lưu...",savedOk:"Đã lưu khóa",where:"Bạn tìm thấy nó trên hubcapmanifest.com, mục API Keys.",quotaReached:"Đã hết hạn mức trong ngày, thử lại vào mai.",quota:"Hôm nay: {used} / {limit} lượt tải",quotaNone:"Hạn mức: —",loading:"Đang tải..."},
  indonesian:{intro:"Tambahkan game ke pustaka Steam langsung dari halamannya.",ready:"Hubcap siap.",notInstalled:"Hubcap belum terpasang. Jalankan hubcaptools sekali lalu kembali.",saved:"Kunci tersimpan: ",yourKey:"Kunci Hubcap kamu",placeholder:"tempel kunci di sini",save:"Simpan",saving:"Menyimpan...",savedOk:"Kunci tersimpan",where:"Kamu bisa menemukannya di hubcapmanifest.com, bagian API Keys.",quotaReached:"Kuota harian habis, coba lagi besok.",quota:"Hari ini: {used} / {limit} unduhan",quotaNone:"Kuota: —",loading:"Memuat..."},
};

function lang(){
  try{const value=SteamClient.Settings.GetLanguage();if(value)return String(value).toLowerCase()}catch(err){}
  return String(navigator.language||"english").toLowerCase();
}

function table(){
  const current=lang();
  if(STRINGS[current])return STRINGS[current];
  for(const key of Object.keys(STRINGS))if(current.startsWith(key.slice(0,4)))return STRINGS[key];
  return STRINGS.english;
}

function t(key,vars){
  let value=table()[key]||STRINGS.english[key];
  if(vars)for(const name of Object.keys(vars))value=value.replace("{"+name+"}",vars[name]);
  return value;
}

const inputStyle={boxSizing:"border-box",display:"block",width:"100%",maxWidth:"100%",minWidth:0,padding:"6px 8px"};
const panelStyle={boxSizing:"border-box",width:"100%",minWidth:0};

function Line({children,color}){return jsx.jsx("div",{style:{fontSize:"12px",color:color||"#8f98a0",paddingBottom:"10px"},children})}

function Panel(){
  const[state,setState]=React.useState(null);
  const[usage,setUsage]=React.useState(null);
  const[key,setKey]=React.useState("");
  const[notice,setNotice]=React.useState("");

  const refreshUsage=async()=>{
    try{
      const u=JSON.parse(await getUsage());
      setUsage(u.success?u:{error:u.error});
    }catch(err){setUsage({error:String(err)})}
  };

  const load=async()=>{
    try{
      const cfg=JSON.parse(await getConfig());
      setState(cfg);
      if(cfg.success&&cfg.apiKeySet)refreshUsage();
      else setUsage(null);
    }catch(err){setState({success:false,error:String(err)})}
  };

  React.useEffect(()=>{
    load();
    const timer=setInterval(load,15000);
    return ()=>clearInterval(timer);
  },[]);

  const save=async()=>{
    if(!key.trim())return;
    setNotice(t("saving"));
    try{
      const res=JSON.parse(await setApiKey({apiKey:key.trim()}));
      if(res.success){setKey("");setNotice(t("savedOk"));await load()}
      else setNotice(res.error||"error");
    }catch(err){setNotice(String(err))}
  };

  if(!state)return jsx.jsx("div",{children:t("loading")});

  return jsx.jsxs("div",{style:panelStyle,children:[
    jsx.jsx(Line,{children:t("intro")}),
    state.success
      ? jsx.jsx(Line,{color:"#a4d007",children:t("ready")})
      : jsx.jsx(Line,{color:"#d9534f",children:t("notInstalled")}),
    state.success&&state.apiKeySet?jsx.jsx(Line,{children:t("saved")+state.apiKeyMasked}):null,
    jsx.jsx("div",{style:{paddingBottom:"6px",fontSize:"13px"},children:t("yourKey")}),
    jsx.jsxs("div",{style:{display:"flex",gap:"8px",paddingBottom:"6px"},children:[
      jsx.jsx("input",{type:"text",value:key,placeholder:t("placeholder"),style:inputStyle,onChange:e=>setKey(e.target.value)}),
      jsx.jsx("button",{onClick:save,style:{padding:"6px 14px",whiteSpace:"nowrap"},children:t("save")}),
    ]}),
    jsx.jsx(Line,{children:t("where")}),
    notice?jsx.jsx(Line,{color:notice===t("savedOk")?"#a4d007":"#d9534f",children:notice}):null,
    usage?(usage.error
      ? jsx.jsx(Line,{color:"#d9534f",children:t("quotaReached")})
      : jsx.jsx(Line,{children:t("quota",{used:usage.dailyUsage,limit:usage.dailyLimit})}))
      : jsx.jsx(Line,{children:t("quotaNone")}),
  ]});
}

const plugin=MILLENNIUM.definePlugin(()=>({
  title:"Hubcap",
  icon:jsx.jsx(MILLENNIUM.IconsModule.Settings,{}),
  content:jsx.jsx(Panel,{}),
}));
exports.default=plugin;
Object.defineProperty(exports,"__esModule",{value:!0});return exports}({},SP_JSX_FACTORY,window.SP_REACT,window.MILLENNIUM_API)};function ExecutePluginModule(){let e=window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName];e.OnPluginConfigChange=function(t,n,a){t in e.settingsStore&&(e.ignoreProxyFlag=!0,e.settingsStore[t]=a,e.ignoreProxyFlag=!1)},MILLENNIUM_BACKEND_IPC.postMessage(0,{pluginName:pluginName,methodName:"__builtins__.__millennium_plugin_settings_parser__"}).then(async t=>{"string"==typeof t.returnValue&&(e.ignoreProxyFlag=!0,e.settingsStore=e.DefinePluginSetting(Object.fromEntries(JSON.parse(atob(t.returnValue)).map(e=>[e.functionName,e]))),e.ignoreProxyFlag=!1);let n=PluginEntryPointMain();Object.assign(window.PLUGIN_LIST[pluginName],{...n,__millennium_internal_plugin_name_do_not_use_or_change__:pluginName});let a=await n.default();var i;a&&(i=a)&&void 0!==i.title&&void 0!==i.icon&&void 0!==i.content?(window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS[pluginName]=a,MILLENNIUM_BACKEND_IPC.postMessage(1,{pluginName:pluginName})):console.warn(`Plugin ${pluginName} does not contain proper SidebarNavigation props and therefor can't be mounted by Millennium. Please ensure it has a title, icon, and content.`)})}ExecutePluginModule();