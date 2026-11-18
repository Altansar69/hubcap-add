const MILLENNIUM_IS_CLIENT_MODULE=!1,pluginName="hubcap-add";function InitializePlugins(){var e,n;let t;(e=window.PLUGIN_LIST||(window.PLUGIN_LIST={}))[pluginName]||(e[pluginName]={}),(n=window.MILLENNIUM_PLUGIN_SETTINGS_STORE||(window.MILLENNIUM_PLUGIN_SETTINGS_STORE={}))[pluginName]||(n[pluginName]={}),window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS||(window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS={}),function(e){e[e.CallServerMethod=0]="CallServerMethod"}(t||(t={}));let o=window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName],a=`Millennium.Internal.IPC.[${pluginName}]`;const r={DropDown:["string","number","boolean"],NumberTextInput:["number"],StringTextInput:["string"],FloatTextInput:["number"],CheckBox:["boolean"],NumberSlider:["number"],FloatSlider:["number"]};o.ignoreProxyFlag=!1;const i=e=>new Proxy(e,{set(e,n,t){if(!(n in e))throw new TypeError(`Property ${String(n)} does not exist on plugin settings`);const i=r[e[n].type],l=e[n]?.range;if(i.includes("number")&&"number"==typeof t&&(l&&(t=function(e,n,t){return Math.max(n,Math.min(t,e))}(t,l[0],l[1])),t||(t=0)),!i.includes(typeof t))throw new TypeError(`Expected ${i.join(" or ")}, got ${typeof t}`);return e[n].value=t,((e,n)=>{o.ignoreProxyFlag||SteamClient.BrowserView.PostMessageToParent(a,JSON.stringify({name:e,value:n}))})(String(n),t),!0},get:(e,n)=>"__raw_get_internals__"===n?e:n in e?e[n].value:void 0});o.DefinePluginSetting=i,o.settingsStore=i({})}InitializePlugins();const __call_server_method__=(e,n)=>Millennium.callServerMethod(pluginName,e,n);function __wrapped_callable__(e){return e.startsWith("webkit:")?MILLENNIUM_API.callable((e,n)=>MILLENNIUM_API.__INTERNAL_CALL_WEBKIT_METHOD__(pluginName,e,n),e.replace(/^webkit:/,"")):MILLENNIUM_API.callable(__call_server_method__,e)}let PluginEntryPointMain=function(){return function(exports,MILLENNIUM){"use strict";
const addGame=__wrapped_callable__("AddGame");
const deleteGame=__wrapped_callable__("DeleteGame");
const addDlc=__wrapped_callable__("AddDlc");
const deleteDlc=__wrapped_callable__("DeleteDlc");
const checkLua=__wrapped_callable__("CheckLua");
const BUTTON_ID="hubcap-add-button";
const DLC_BUTTON_ID="hubcap-dlc-button";

const ICON_ADD="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='%23a4d007' d='M7 1h2v6h6v2H9v6H7V9H1V7h6z'/></svg>";
const ICON_REMOVE="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='%23c94a4a' d='M1 7h14v2H1z'/></svg>";

const STRINGS={
  english:{add:"Add to my library",remove:"Remove from my library",adding:"Adding...",removing:"Removing...",added:"Added - restart Steam",removed:"Removed - restart Steam",errKey:"Invalid Hubcap key",errQuota:"Daily quota reached",errUnavailable:"Game not available yet",errConfig:"Run hubcaptools once",errNoKey:"Add your key in the settings",errCorrupt:"Corrupted download, try again",errGeneric:"Something went wrong",drmTitle:"Extra protection",drmBody:"This game uses extra protection ({drm}). You will need to download the crack separately and apply it after installing.",continue:"Continue",cancel:"Cancel",dlc:"Unlock the DLC",dlcRemove:"Remove the DLC",dlcAdding:"Unlocking DLC...",dlcRemoving:"Removing DLC...",dlcAdded:"DLC unlocked - restart Steam",dlcRemoved:"DLC removed - restart Steam",dlcNone:"This game has no DLC"},
  french:{add:"Ajouter à ma bibliothèque",remove:"Retirer de ma bibliothèque",adding:"Ajout...",removing:"Retrait...",added:"Ajouté - redémarre Steam",removed:"Retiré - redémarre Steam",errKey:"Clé Hubcap invalide",errQuota:"Quota du jour atteint",errUnavailable:"Jeu pas encore disponible",errConfig:"Lance hubcaptools une fois",errNoKey:"Ajoute ta clé dans les réglages",errCorrupt:"Téléchargement corrompu, réessaie",errGeneric:"Une erreur est survenue",drmTitle:"Protection supplémentaire",drmBody:"Ce jeu utilise une protection supplémentaire ({drm}). Vous devrez télécharger le crack séparément et l'appliquer après l'installation.",continue:"Continuer",cancel:"Annuler",dlc:"Débloquer les DLC",dlcRemove:"Retirer les DLC",dlcAdding:"Déblocage des DLC...",dlcRemoving:"Retrait des DLC...",dlcAdded:"DLC débloqués - redémarre Steam",dlcRemoved:"DLC retirés - redémarre Steam",dlcNone:"Ce jeu n'a pas de DLC"},
  german:{add:"Zu meiner Bibliothek hinzufügen",remove:"Aus meiner Bibliothek entfernen",adding:"Wird hinzugefügt...",removing:"Wird entfernt...",added:"Hinzugefügt - Steam neu starten",removed:"Entfernt - Steam neu starten",errKey:"Ungültiger Hubcap-Schlüssel",errQuota:"Tageslimit erreicht",errUnavailable:"Spiel noch nicht verfügbar",errConfig:"hubcaptools einmal starten",errNoKey:"Schlüssel in den Einstellungen eintragen",errCorrupt:"Beschädigter Download, erneut versuchen",errGeneric:"Ein Fehler ist aufgetreten",drmTitle:"Zusätzlicher Schutz",drmBody:"Dieses Spiel nutzt zusätzlichen Schutz ({drm}). Du musst den Crack separat herunterladen und nach der Installation anwenden.",continue:"Weiter",cancel:"Abbrechen",dlc:"DLC freischalten",dlcRemove:"DLC entfernen",dlcAdding:"DLC wird freigeschaltet...",dlcRemoving:"DLC wird entfernt...",dlcAdded:"DLC freigeschaltet - Steam neu starten",dlcRemoved:"DLC entfernt - Steam neu starten",dlcNone:"Dieses Spiel hat keine DLC"},
  spanish:{add:"Añadir a mi biblioteca",remove:"Quitar de mi biblioteca",adding:"Añadiendo...",removing:"Quitando...",added:"Añadido - reinicia Steam",removed:"Quitado - reinicia Steam",errKey:"Clave de Hubcap no válida",errQuota:"Cuota diaria agotada",errUnavailable:"Juego aún no disponible",errConfig:"Ejecuta hubcaptools una vez",errNoKey:"Añade tu clave en los ajustes",errCorrupt:"Descarga corrupta, reintenta",errGeneric:"Se ha producido un error",drmTitle:"Protección adicional",drmBody:"Este juego usa protección adicional ({drm}). Tendrás que descargar el crack por separado y aplicarlo tras la instalación.",continue:"Continuar",cancel:"Cancelar",dlc:"Desbloquear los DLC",dlcRemove:"Quitar los DLC",dlcAdding:"Desbloqueando DLC...",dlcRemoving:"Quitando DLC...",dlcAdded:"DLC desbloqueados - reinicia Steam",dlcRemoved:"DLC quitados - reinicia Steam",dlcNone:"Este juego no tiene DLC"},
  latam:{add:"Añadir a mi biblioteca",remove:"Quitar de mi biblioteca",adding:"Añadiendo...",removing:"Quitando...",added:"Añadido - reinicia Steam",removed:"Quitado - reinicia Steam",errKey:"Clave de Hubcap no válida",errQuota:"Cuota diaria agotada",errUnavailable:"Juego aún no disponible",errConfig:"Ejecuta hubcaptools una vez",errNoKey:"Añade tu clave en los ajustes",errCorrupt:"Descarga corrupta, reintenta",errGeneric:"Se produjo un error",drmTitle:"Protección adicional",drmBody:"Este juego usa protección adicional ({drm}). Tendrás que descargar el crack por separado y aplicarlo tras la instalación.",continue:"Continuar",cancel:"Cancelar",dlc:"Desbloquear los DLC",dlcRemove:"Quitar los DLC",dlcAdding:"Desbloqueando DLC...",dlcRemoving:"Quitando DLC...",dlcAdded:"DLC desbloqueados - reinicia Steam",dlcRemoved:"DLC quitados - reinicia Steam",dlcNone:"Este juego no tiene DLC"},
  italian:{add:"Aggiungi alla mia libreria",remove:"Rimuovi dalla mia libreria",adding:"Aggiunta...",removing:"Rimozione...",added:"Aggiunto - riavvia Steam",removed:"Rimosso - riavvia Steam",errKey:"Chiave Hubcap non valida",errQuota:"Quota giornaliera esaurita",errUnavailable:"Gioco non ancora disponibile",errConfig:"Avvia hubcaptools una volta",errNoKey:"Aggiungi la chiave nelle impostazioni",errCorrupt:"Download corrotto, riprova",errGeneric:"Si è verificato un errore",drmTitle:"Protezione aggiuntiva",drmBody:"Questo gioco usa una protezione aggiuntiva ({drm}). Dovrai scaricare il crack separatamente e applicarlo dopo l'installazione.",continue:"Continua",cancel:"Annulla",dlc:"Sblocca i DLC",dlcRemove:"Rimuovi i DLC",dlcAdding:"Sblocco dei DLC...",dlcRemoving:"Rimozione dei DLC...",dlcAdded:"DLC sbloccati - riavvia Steam",dlcRemoved:"DLC rimossi - riavvia Steam",dlcNone:"Questo gioco non ha DLC"},
  portuguese:{add:"Adicionar à minha biblioteca",remove:"Remover da minha biblioteca",adding:"A adicionar...",removing:"A remover...",added:"Adicionado - reinicia o Steam",removed:"Removido - reinicia o Steam",errKey:"Chave Hubcap inválida",errQuota:"Quota diária atingida",errUnavailable:"Jogo ainda não disponível",errConfig:"Executa o hubcaptools uma vez",errNoKey:"Adiciona a tua chave nas definições",errCorrupt:"Download corrompido, tenta de novo",errGeneric:"Ocorreu um erro",drmTitle:"Proteção adicional",drmBody:"Este jogo usa proteção adicional ({drm}). Terás de descarregar o crack à parte e aplicá-lo após a instalação.",continue:"Continuar",cancel:"Cancelar",dlc:"Desbloquear os DLC",dlcRemove:"Remover os DLC",dlcAdding:"A desbloquear DLC...",dlcRemoving:"A remover DLC...",dlcAdded:"DLC desbloqueados - reinicia o Steam",dlcRemoved:"DLC removidos - reinicia o Steam",dlcNone:"Este jogo não tem DLC"},
  brazilian:{add:"Adicionar à minha biblioteca",remove:"Remover da minha biblioteca",adding:"Adicionando...",removing:"Removendo...",added:"Adicionado - reinicie o Steam",removed:"Removido - reinicie o Steam",errKey:"Chave Hubcap inválida",errQuota:"Cota diária atingida",errUnavailable:"Jogo ainda não disponível",errConfig:"Execute o hubcaptools uma vez",errNoKey:"Adicione sua chave nas configurações",errCorrupt:"Download corrompido, tente de novo",errGeneric:"Ocorreu um erro",drmTitle:"Proteção adicional",drmBody:"Este jogo usa proteção adicional ({drm}). Você precisará baixar o crack separadamente e aplicá-lo após a instalação.",continue:"Continuar",cancel:"Cancelar",dlc:"Desbloquear os DLC",dlcRemove:"Remover os DLC",dlcAdding:"Desbloqueando DLC...",dlcRemoving:"Removendo DLC...",dlcAdded:"DLC desbloqueados - reinicie o Steam",dlcRemoved:"DLC removidos - reinicie o Steam",dlcNone:"Este jogo não tem DLC"},
  russian:{add:"Добавить в библиотеку",remove:"Удалить из библиотеки",adding:"Добавление...",removing:"Удаление...",added:"Добавлено - перезапустите Steam",removed:"Удалено - перезапустите Steam",errKey:"Неверный ключ Hubcap",errQuota:"Дневной лимит исчерпан",errUnavailable:"Игра пока недоступна",errConfig:"Запустите hubcaptools один раз",errNoKey:"Укажите ключ в настройках",errCorrupt:"Повреждённая загрузка, повторите",errGeneric:"Произошла ошибка",drmTitle:"Дополнительная защита",drmBody:"Игра использует дополнительную защиту ({drm}). Понадобится отдельно скачать кряк и применить его после установки.",continue:"Продолжить",cancel:"Отмена",dlc:"Разблокировать DLC",dlcRemove:"Удалить DLC",dlcAdding:"Разблокировка DLC...",dlcRemoving:"Удаление DLC...",dlcAdded:"DLC разблокированы - перезапустите Steam",dlcRemoved:"DLC удалены - перезапустите Steam",dlcNone:"У этой игры нет DLC"},
  polish:{add:"Dodaj do biblioteki",remove:"Usuń z biblioteki",adding:"Dodawanie...",removing:"Usuwanie...",added:"Dodano - uruchom Steam ponownie",removed:"Usunięto - uruchom Steam ponownie",errKey:"Nieprawidłowy klucz Hubcap",errQuota:"Dzienny limit wykorzystany",errUnavailable:"Gra jeszcze niedostępna",errConfig:"Uruchom hubcaptools raz",errNoKey:"Dodaj klucz w ustawieniach",errCorrupt:"Uszkodzone pobieranie, spróbuj ponownie",errGeneric:"Wystąpił błąd",drmTitle:"Dodatkowa ochrona",drmBody:"Ta gra używa dodatkowej ochrony ({drm}). Musisz osobno pobrać crack i zastosować go po instalacji.",continue:"Kontynuuj",cancel:"Anuluj",dlc:"Odblokuj DLC",dlcRemove:"Usuń DLC",dlcAdding:"Odblokowywanie DLC...",dlcRemoving:"Usuwanie DLC...",dlcAdded:"DLC odblokowane - uruchom Steam ponownie",dlcRemoved:"DLC usunięte - uruchom Steam ponownie",dlcNone:"Ta gra nie ma DLC"},
  dutch:{add:"Toevoegen aan mijn bibliotheek",remove:"Verwijderen uit mijn bibliotheek",adding:"Toevoegen...",removing:"Verwijderen...",added:"Toegevoegd - herstart Steam",removed:"Verwijderd - herstart Steam",errKey:"Ongeldige Hubcap-sleutel",errQuota:"Daglimiet bereikt",errUnavailable:"Spel nog niet beschikbaar",errConfig:"Start hubcaptools één keer",errNoKey:"Voeg je sleutel toe in de instellingen",errCorrupt:"Beschadigde download, probeer opnieuw",errGeneric:"Er is een fout opgetreden",drmTitle:"Extra beveiliging",drmBody:"Dit spel gebruikt extra beveiliging ({drm}). Je moet de crack apart downloaden en na de installatie toepassen.",continue:"Doorgaan",cancel:"Annuleren",dlc:"DLC vrijspelen",dlcRemove:"DLC verwijderen",dlcAdding:"DLC vrijspelen...",dlcRemoving:"DLC verwijderen...",dlcAdded:"DLC vrijgespeeld - herstart Steam",dlcRemoved:"DLC verwijderd - herstart Steam",dlcNone:"Dit spel heeft geen DLC"},
  danish:{add:"Føj til mit bibliotek",remove:"Fjern fra mit bibliotek",adding:"Tilføjer...",removing:"Fjerner...",added:"Tilføjet - genstart Steam",removed:"Fjernet - genstart Steam",errKey:"Ugyldig Hubcap-nøgle",errQuota:"Daglig kvote nået",errUnavailable:"Spillet er ikke tilgængeligt endnu",errConfig:"Kør hubcaptools én gang",errNoKey:"Tilføj din nøgle i indstillingerne",errCorrupt:"Beskeden download, prøv igen",errGeneric:"Der opstod en fejl",drmTitle:"Ekstra beskyttelse",drmBody:"Dette spil bruger ekstra beskyttelse ({drm}). Du skal downloade cracket separat og anvende det efter installationen.",continue:"Fortsæt",cancel:"Annuller",dlc:"Lås DLC op",dlcRemove:"Fjern DLC",dlcAdding:"Låser DLC op...",dlcRemoving:"Fjerner DLC...",dlcAdded:"DLC låst op - genstart Steam",dlcRemoved:"DLC fjernet - genstart Steam",dlcNone:"Dette spil har ingen DLC"},
  swedish:{add:"Lägg till i mitt bibliotek",remove:"Ta bort från mitt bibliotek",adding:"Lägger till...",removing:"Tar bort...",added:"Tillagt - starta om Steam",removed:"Borttaget - starta om Steam",errKey:"Ogiltig Hubcap-nyckel",errQuota:"Daglig kvot nådd",errUnavailable:"Spelet är inte tillgängligt än",errConfig:"Kör hubcaptools en gång",errNoKey:"Lägg till din nyckel i inställningarna",errCorrupt:"Trasig nedladdning, försök igen",errGeneric:"Ett fel uppstod",drmTitle:"Extra skydd",drmBody:"Det här spelet använder extra skydd ({drm}). Du måste ladda ner cracket separat och applicera det efter installationen.",continue:"Fortsätt",cancel:"Avbryt",dlc:"Lås upp DLC",dlcRemove:"Ta bort DLC",dlcAdding:"Låser upp DLC...",dlcRemoving:"Tar bort DLC...",dlcAdded:"DLC upplåst - starta om Steam",dlcRemoved:"DLC borttaget - starta om Steam",dlcNone:"Det här spelet har ingen DLC"},
  norwegian:{add:"Legg til i biblioteket",remove:"Fjern fra biblioteket",adding:"Legger til...",removing:"Fjerner...",added:"Lagt til - start Steam på nytt",removed:"Fjernet - start Steam på nytt",errKey:"Ugyldig Hubcap-nøkkel",errQuota:"Daglig kvote nådd",errUnavailable:"Spillet er ikke tilgjengelig ennå",errConfig:"Kjør hubcaptools én gang",errNoKey:"Legg inn nøkkelen i innstillingene",errCorrupt:"Ødelagt nedlasting, prøv igjen",errGeneric:"Det oppstod en feil",drmTitle:"Ekstra beskyttelse",drmBody:"Dette spillet bruker ekstra beskyttelse ({drm}). Du må laste ned cracken separat og bruke den etter installasjonen.",continue:"Fortsett",cancel:"Avbryt",dlc:"Lås opp DLC",dlcRemove:"Fjern DLC",dlcAdding:"Låser opp DLC...",dlcRemoving:"Fjerner DLC...",dlcAdded:"DLC låst opp - start Steam på nytt",dlcRemoved:"DLC fjernet - start Steam på nytt",dlcNone:"Dette spillet har ingen DLC"},
  finnish:{add:"Lisää kirjastooni",remove:"Poista kirjastostani",adding:"Lisätään...",removing:"Poistetaan...",added:"Lisätty - käynnistä Steam uudelleen",removed:"Poistettu - käynnistä Steam uudelleen",errKey:"Virheellinen Hubcap-avain",errQuota:"Päiväkiintiö täynnä",errUnavailable:"Peli ei ole vielä saatavilla",errConfig:"Käynnistä hubcaptools kerran",errNoKey:"Lisää avain asetuksiin",errCorrupt:"Vioittunut lataus, yritä uudelleen",errGeneric:"Tapahtui virhe",drmTitle:"Lisäsuojaus",drmBody:"Tämä peli käyttää lisäsuojausta ({drm}). Sinun on ladattava crack erikseen ja käytettävä sitä asennuksen jälkeen.",continue:"Jatka",cancel:"Peruuta",dlc:"Avaa DLC",dlcRemove:"Poista DLC",dlcAdding:"Avataan DLC...",dlcRemoving:"Poistetaan DLC...",dlcAdded:"DLC avattu - käynnistä Steam uudelleen",dlcRemoved:"DLC poistettu - käynnistä Steam uudelleen",dlcNone:"Tässä pelissä ei ole DLC:tä"},
  czech:{add:"Přidat do mé knihovny",remove:"Odebrat z mé knihovny",adding:"Přidávání...",removing:"Odebírání...",added:"Přidáno - restartujte Steam",removed:"Odebráno - restartujte Steam",errKey:"Neplatný klíč Hubcap",errQuota:"Denní limit vyčerpán",errUnavailable:"Hra zatím není dostupná",errConfig:"Spusťte hubcaptools jednou",errNoKey:"Přidejte klíč v nastavení",errCorrupt:"Poškozené stahování, zkuste to znovu",errGeneric:"Došlo k chybě",drmTitle:"Dodatečná ochrana",drmBody:"Tato hra používá dodatečnou ochranu ({drm}). Crack bude nutné stáhnout zvlášť a použít po instalaci.",continue:"Pokračovat",cancel:"Zrušit",dlc:"Odemknout DLC",dlcRemove:"Odebrat DLC",dlcAdding:"Odemýkání DLC...",dlcRemoving:"Odebírání DLC...",dlcAdded:"DLC odemčeno - restartujte Steam",dlcRemoved:"DLC odebráno - restartujte Steam",dlcNone:"Tato hra nemá DLC"},
  hungarian:{add:"Hozzáadás a könyvtáramhoz",remove:"Eltávolítás a könyvtáramból",adding:"Hozzáadás...",removing:"Eltávolítás...",added:"Hozzáadva - indítsd újra a Steamet",removed:"Eltávolítva - indítsd újra a Steamet",errKey:"Érvénytelen Hubcap-kulcs",errQuota:"A napi keret elfogyott",errUnavailable:"A játék még nem elérhető",errConfig:"Futtasd a hubcaptools-t egyszer",errNoKey:"Add meg a kulcsot a beállításokban",errCorrupt:"Sérült letöltés, próbáld újra",errGeneric:"Hiba történt",drmTitle:"További védelem",drmBody:"Ez a játék további védelmet használ ({drm}). A cracket külön kell letöltened és telepítés után alkalmaznod.",continue:"Folytatás",cancel:"Mégse",dlc:"DLC feloldása",dlcRemove:"DLC eltávolítása",dlcAdding:"DLC feloldása...",dlcRemoving:"DLC eltávolítása...",dlcAdded:"DLC feloldva - indítsd újra a Steamet",dlcRemoved:"DLC eltávolítva - indítsd újra a Steamet",dlcNone:"Ennek a játéknak nincs DLC-je"},
  romanian:{add:"Adaugă în biblioteca mea",remove:"Elimină din biblioteca mea",adding:"Se adaugă...",removing:"Se elimină...",added:"Adăugat - repornește Steam",removed:"Eliminat - repornește Steam",errKey:"Cheie Hubcap invalidă",errQuota:"Limita zilnică atinsă",errUnavailable:"Jocul nu este încă disponibil",errConfig:"Rulează hubcaptools o dată",errNoKey:"Adaugă cheia în setări",errCorrupt:"Descărcare coruptă, încearcă din nou",errGeneric:"A apărut o eroare",drmTitle:"Protecție suplimentară",drmBody:"Acest joc folosește protecție suplimentară ({drm}). Va trebui să descarci crack-ul separat și să îl aplici după instalare.",continue:"Continuă",cancel:"Anulează",dlc:"Deblochează DLC-urile",dlcRemove:"Elimină DLC-urile",dlcAdding:"Se deblochează DLC-urile...",dlcRemoving:"Se elimină DLC-urile...",dlcAdded:"DLC-uri deblocate - repornește Steam",dlcRemoved:"DLC-uri eliminate - repornește Steam",dlcNone:"Acest joc nu are DLC"},
  bulgarian:{add:"Добави в библиотеката ми",remove:"Премахни от библиотеката ми",adding:"Добавяне...",removing:"Премахване...",added:"Добавено - рестартирай Steam",removed:"Премахнато - рестартирай Steam",errKey:"Невалиден ключ Hubcap",errQuota:"Дневният лимит е изчерпан",errUnavailable:"Играта още не е налична",errConfig:"Стартирай hubcaptools веднъж",errNoKey:"Добави ключ в настройките",errCorrupt:"Повредено изтегляне, опитай отново",errGeneric:"Възникна грешка",drmTitle:"Допълнителна защита",drmBody:"Тази игра използва допълнителна защита ({drm}). Ще трябва да изтеглиш крака отделно и да го приложиш след инсталацията.",continue:"Продължи",cancel:"Отказ",dlc:"Отключи DLC",dlcRemove:"Премахни DLC",dlcAdding:"Отключване на DLC...",dlcRemoving:"Премахване на DLC...",dlcAdded:"DLC отключени - рестартирай Steam",dlcRemoved:"DLC премахнати - рестартирай Steam",dlcNone:"Тази игра няма DLC"},
  greek:{add:"Προσθήκη στη βιβλιοθήκη μου",remove:"Αφαίρεση από τη βιβλιοθήκη μου",adding:"Προσθήκη...",removing:"Αφαίρεση...",added:"Προστέθηκε - επανεκκίνηση Steam",removed:"Αφαιρέθηκε - επανεκκίνηση Steam",errKey:"Μη έγκυρο κλειδί Hubcap",errQuota:"Το ημερήσιο όριο εξαντλήθηκε",errUnavailable:"Το παιχνίδι δεν είναι ακόμη διαθέσιμο",errConfig:"Εκτέλεσε το hubcaptools μία φορά",errNoKey:"Πρόσθεσε το κλειδί στις ρυθμίσεις",errCorrupt:"Κατεστραμμένη λήψη, δοκίμασε ξανά",errGeneric:"Παρουσιάστηκε σφάλμα",drmTitle:"Πρόσθετη προστασία",drmBody:"Αυτό το παιχνίδι χρησιμοποιεί πρόσθετη προστασία ({drm}). Θα χρειαστεί να κατεβάσεις το crack ξεχωριστά και να το εφαρμόσεις μετά την εγκατάσταση.",continue:"Συνέχεια",cancel:"Άκυρο",dlc:"Ξεκλείδωμα DLC",dlcRemove:"Αφαίρεση DLC",dlcAdding:"Ξεκλείδωμα DLC...",dlcRemoving:"Αφαίρεση DLC...",dlcAdded:"DLC ξεκλειδώθηκαν - επανεκκίνηση Steam",dlcRemoved:"DLC αφαιρέθηκαν - επανεκκίνηση Steam",dlcNone:"Αυτό το παιχνίδι δεν έχει DLC"},
  turkish:{add:"Kitaplığıma ekle",remove:"Kitaplığımdan kaldır",adding:"Ekleniyor...",removing:"Kaldırılıyor...",added:"Eklendi - Steam'i yeniden başlat",removed:"Kaldırıldı - Steam'i yeniden başlat",errKey:"Geçersiz Hubcap anahtarı",errQuota:"Günlük kota doldu",errUnavailable:"Oyun henüz mevcut değil",errConfig:"hubcaptools'u bir kez çalıştır",errNoKey:"Anahtarını ayarlara ekle",errCorrupt:"Bozuk indirme, tekrar dene",errGeneric:"Bir hata oluştu",drmTitle:"Ek koruma",drmBody:"Bu oyun ek koruma kullanıyor ({drm}). Crack'i ayrı indirip kurulumdan sonra uygulaman gerekecek.",continue:"Devam",cancel:"İptal",dlc:"DLC'leri aç",dlcRemove:"DLC'leri kaldır",dlcAdding:"DLC'ler açılıyor...",dlcRemoving:"DLC'ler kaldırılıyor...",dlcAdded:"DLC'ler açıldı - Steam'i yeniden başlat",dlcRemoved:"DLC'ler kaldırıldı - Steam'i yeniden başlat",dlcNone:"Bu oyunun DLC'si yok"},
  ukrainian:{add:"Додати до бібліотеки",remove:"Видалити з бібліотеки",adding:"Додавання...",removing:"Видалення...",added:"Додано - перезапустіть Steam",removed:"Видалено - перезапустіть Steam",errKey:"Недійсний ключ Hubcap",errQuota:"Денний ліміт вичерпано",errUnavailable:"Гра ще недоступна",errConfig:"Запустіть hubcaptools один раз",errNoKey:"Додайте ключ у налаштуваннях",errCorrupt:"Пошкоджене завантаження, спробуйте ще раз",errGeneric:"Сталася помилка",drmTitle:"Додатковий захист",drmBody:"Гра використовує додатковий захист ({drm}). Потрібно окремо завантажити кряк і застосувати його після встановлення.",continue:"Продовжити",cancel:"Скасувати",dlc:"Розблокувати DLC",dlcRemove:"Видалити DLC",dlcAdding:"Розблокування DLC...",dlcRemoving:"Видалення DLC...",dlcAdded:"DLC розблоковано - перезапустіть Steam",dlcRemoved:"DLC видалено - перезапустіть Steam",dlcNone:"У цієї гри немає DLC"},
  japanese:{add:"ライブラリに追加",remove:"ライブラリから削除",adding:"追加中...",removing:"削除中...",added:"追加しました - Steam を再起動",removed:"削除しました - Steam を再起動",errKey:"Hubcap キーが無効です",errQuota:"本日の上限に達しました",errUnavailable:"まだ入手できません",errConfig:"hubcaptools を一度起動してください",errNoKey:"設定でキーを登録してください",errCorrupt:"ダウンロードが壊れています。再試行してください",errGeneric:"エラーが発生しました",drmTitle:"追加の保護",drmBody:"このゲームは追加の保護 ({drm}) を使用しています。クラックを別途ダウンロードし、インストール後に適用する必要があります。",continue:"続行",cancel:"キャンセル",dlc:"DLC を解放",dlcRemove:"DLC を削除",dlcAdding:"DLC を解放中...",dlcRemoving:"DLC を削除中...",dlcAdded:"DLC を解放しました - Steam を再起動",dlcRemoved:"DLC を削除しました - Steam を再起動",dlcNone:"このゲームに DLC はありません"},
  koreana:{add:"라이브러리에 추가",remove:"라이브러리에서 제거",adding:"추가 중...",removing:"제거 중...",added:"추가됨 - Steam 재시작",removed:"제거됨 - Steam 재시작",errKey:"Hubcap 키가 유효하지 않습니다",errQuota:"일일 할당량 초과",errUnavailable:"아직 이용할 수 없는 게임입니다",errConfig:"hubcaptools를 한 번 실행하세요",errNoKey:"설정에서 키를 추가하세요",errCorrupt:"다운로드가 손상되었습니다. 다시 시도하세요",errGeneric:"오류가 발생했습니다",drmTitle:"추가 보호",drmBody:"이 게임은 추가 보호({drm})를 사용합니다. 크랙을 따로 내려받아 설치 후 적용해야 합니다.",continue:"계속",cancel:"취소",dlc:"DLC 잠금 해제",dlcRemove:"DLC 제거",dlcAdding:"DLC 잠금 해제 중...",dlcRemoving:"DLC 제거 중...",dlcAdded:"DLC 잠금 해제됨 - Steam 재시작",dlcRemoved:"DLC 제거됨 - Steam 재시작",dlcNone:"이 게임에는 DLC가 없습니다"},
  schinese:{add:"添加到库",remove:"从库中移除",adding:"添加中...",removing:"移除中...",added:"已添加 - 请重启 Steam",removed:"已移除 - 请重启 Steam",errKey:"Hubcap 密钥无效",errQuota:"今日配额已用完",errUnavailable:"该游戏尚不可用",errConfig:"请先运行一次 hubcaptools",errNoKey:"请在设置中添加密钥",errCorrupt:"下载已损坏，请重试",errGeneric:"发生错误",drmTitle:"额外保护",drmBody:"该游戏使用额外保护（{drm}）。你需要单独下载破解并在安装后应用。",continue:"继续",cancel:"取消",dlc:"解锁 DLC",dlcRemove:"移除 DLC",dlcAdding:"正在解锁 DLC...",dlcRemoving:"正在移除 DLC...",dlcAdded:"DLC 已解锁 - 请重启 Steam",dlcRemoved:"DLC 已移除 - 请重启 Steam",dlcNone:"该游戏没有 DLC"},
  tchinese:{add:"新增至收藏庫",remove:"從收藏庫移除",adding:"新增中...",removing:"移除中...",added:"已新增 - 請重新啟動 Steam",removed:"已移除 - 請重新啟動 Steam",errKey:"Hubcap 金鑰無效",errQuota:"今日配額已用完",errUnavailable:"此遊戲尚無法取得",errConfig:"請先執行一次 hubcaptools",errNoKey:"請在設定中新增金鑰",errCorrupt:"下載已損毀，請重試",errGeneric:"發生錯誤",drmTitle:"額外保護",drmBody:"此遊戲使用額外保護（{drm}）。你需要另外下載破解並在安裝後套用。",continue:"繼續",cancel:"取消",dlc:"解鎖 DLC",dlcRemove:"移除 DLC",dlcAdding:"正在解鎖 DLC...",dlcRemoving:"正在移除 DLC...",dlcAdded:"DLC 已解鎖 - 請重新啟動 Steam",dlcRemoved:"DLC 已移除 - 請重新啟動 Steam",dlcNone:"此遊戲沒有 DLC"},
  thai:{add:"เพิ่มในคลังของฉัน",remove:"ลบออกจากคลังของฉัน",adding:"กำลังเพิ่ม...",removing:"กำลังลบ...",added:"เพิ่มแล้ว - รีสตาร์ท Steam",removed:"ลบแล้ว - รีสตาร์ท Steam",errKey:"คีย์ Hubcap ไม่ถูกต้อง",errQuota:"โควตารายวันหมดแล้ว",errUnavailable:"เกมยังไม่พร้อมใช้งาน",errConfig:"รัน hubcaptools หนึ่งครั้ง",errNoKey:"เพิ่มคีย์ในการตั้งค่า",errCorrupt:"ดาวน์โหลดเสียหาย ลองอีกครั้ง",errGeneric:"เกิดข้อผิดพลาด",drmTitle:"การป้องกันเพิ่มเติม",drmBody:"เกมนี้ใช้การป้องกันเพิ่มเติม ({drm}) คุณต้องดาวน์โหลดแครกแยกและใช้หลังติดตั้ง",continue:"ดำเนินการต่อ",cancel:"ยกเลิก",dlc:"ปลดล็อก DLC",dlcRemove:"ลบ DLC",dlcAdding:"กำลังปลดล็อก DLC...",dlcRemoving:"กำลังลบ DLC...",dlcAdded:"ปลดล็อก DLC แล้ว - รีสตาร์ท Steam",dlcRemoved:"ลบ DLC แล้ว - รีสตาร์ท Steam",dlcNone:"เกมนี้ไม่มี DLC"},
  vietnamese:{add:"Thêm vào thư viện",remove:"Xóa khỏi thư viện",adding:"Đang thêm...",removing:"Đang xóa...",added:"Đã thêm - khởi động lại Steam",removed:"Đã xóa - khởi động lại Steam",errKey:"Khóa Hubcap không hợp lệ",errQuota:"Đã hết hạn mức trong ngày",errUnavailable:"Trò chơi chưa khả dụng",errConfig:"Chạy hubcaptools một lần",errNoKey:"Thêm khóa trong phần cài đặt",errCorrupt:"Tải xuống bị lỗi, thử lại",errGeneric:"Đã xảy ra lỗi",drmTitle:"Bảo vệ bổ sung",drmBody:"Trò chơi này dùng bảo vệ bổ sung ({drm}). Bạn sẽ cần tải bản crack riêng và áp dụng sau khi cài đặt.",continue:"Tiếp tục",cancel:"Hủy",dlc:"Mở khóa DLC",dlcRemove:"Xóa DLC",dlcAdding:"Đang mở khóa DLC...",dlcRemoving:"Đang xóa DLC...",dlcAdded:"Đã mở khóa DLC - khởi động lại Steam",dlcRemoved:"Đã xóa DLC - khởi động lại Steam",dlcNone:"Trò chơi này không có DLC"},
  indonesian:{add:"Tambahkan ke pustaka saya",remove:"Hapus dari pustaka saya",adding:"Menambahkan...",removing:"Menghapus...",added:"Ditambahkan - mulai ulang Steam",removed:"Dihapus - mulai ulang Steam",errKey:"Kunci Hubcap tidak valid",errQuota:"Kuota harian habis",errUnavailable:"Game belum tersedia",errConfig:"Jalankan hubcaptools sekali",errNoKey:"Tambahkan kunci di pengaturan",errCorrupt:"Unduhan rusak, coba lagi",errGeneric:"Terjadi kesalahan",drmTitle:"Perlindungan tambahan",drmBody:"Game ini memakai perlindungan tambahan ({drm}). Kamu harus mengunduh crack terpisah dan menerapkannya setelah instalasi.",continue:"Lanjutkan",cancel:"Batal",dlc:"Buka DLC",dlcRemove:"Hapus DLC",dlcAdding:"Membuka DLC...",dlcRemoving:"Menghapus DLC...",dlcAdded:"DLC dibuka - mulai ulang Steam",dlcRemoved:"DLC dihapus - mulai ulang Steam",dlcNone:"Game ini tidak punya DLC"},
};

const ISO_LANGS={en:"english",fr:"french",de:"german",es:"spanish","es-419":"latam",it:"italian",pt:"portuguese","pt-br":"brazilian",ru:"russian",pl:"polish",nl:"dutch",da:"danish",sv:"swedish",no:"norwegian",nb:"norwegian",nn:"norwegian",fi:"finnish",cs:"czech",hu:"hungarian",ro:"romanian",bg:"bulgarian",el:"greek",tr:"turkish",uk:"ukrainian",ja:"japanese",ko:"koreana",zh:"schinese","zh-cn":"schinese","zh-sg":"schinese","zh-hans":"schinese","zh-tw":"tchinese","zh-hk":"tchinese","zh-hant":"tchinese",th:"thai",vi:"vietnamese",id:"indonesian"};

function resolveLang(value){
  if(typeof value!=="string")return null;
  const v=value.trim().toLowerCase().replace(/_/g,"-");
  if(!v)return null;
  if(STRINGS[v])return v;
  if(ISO_LANGS[v])return ISO_LANGS[v];
  if(v.startsWith("es-")&&v!=="es-es")return "latam";
  const base=v.split("-")[0];
  return ISO_LANGS[base]||null;
}

function lang(){
  const candidates=[];
  try{const m=document.cookie.match(/(?:^|;\s*)Steam_Language=([^;]+)/);if(m)candidates.push(decodeURIComponent(m[1]))}catch(err){}
  try{candidates.push(SteamClient.Settings.GetLanguage())}catch(err){}
  try{candidates.push(document.documentElement.lang)}catch(err){}
  try{candidates.push(...(navigator.languages||[]),navigator.language)}catch(err){}
  for(const value of candidates){const found=resolveLang(value);if(found)return found}
  return "english";
}

function table(){return STRINGS[lang()]||STRINGS.english}

function t(key){return table()[key]||STRINGS.english[key]}

function friendly(message){
  const text=String(message||"");
  if(text.indexOf("401")>=0)return t("errKey");
  if(text.indexOf("429")>=0)return t("errQuota");
  if(text.indexOf("404")>=0)return t("errUnavailable");
  if(text.indexOf("config.yaml not found")>=0)return t("errConfig");
  if(text.indexOf("HubcapApiKey is missing")>=0)return t("errNoKey");
  if(text.indexOf("not a ZIP")>=0)return t("errCorrupt");
  if(text.indexOf("no DLC depot")>=0)return t("dlcNone");
  if(text.length>70)return text.slice(0,70)+"...";
  return text||t("errGeneric");
}

function createButton(id,label,icon){
  const a=document.createElement("a");
  a.id=id;
  a.className="btnv6_blue_hoverfade btn_medium";
  a.style.marginRight="0.28em";
  a.title=label;
  const span=document.createElement("span");
  span.dataset.tooltipText=label;
  const img=document.createElement("img");
  img.className="ico16";
  img.src=icon;
  img.style.cssText="width:16px;height:16px;vertical-align:middle;background:none";
  const text=document.createElement("span");
  text.textContent=label;
  text.style.cssText="margin-left:6px;vertical-align:middle";
  span.appendChild(img);
  span.appendChild(text);
  a.appendChild(span);
  return a;
}

function htmlToText(html){
  const withBreaks=String(html).replace(/<br\s*\/?>/gi,", ");
  const text=new DOMParser().parseFromString(withBreaks,"text/html").body.textContent||"";
  return text.replace(/\s+/g," ").replace(/(,\s*)+/g,", ").replace(/^[,\s]+|[,\s]+$/g,"");
}

async function getDrm(appId){
  try{
    const res=await fetch("/api/appdetails?appids="+appId);
    const data=await res.json();
    const entry=data&&data[appId];
    if(entry&&entry.success&&entry.data&&entry.data.drm_notice)return htmlToText(entry.data.drm_notice);
  }catch(err){}
  const body=document.body.innerText||"";
  if(/denuvo/i.test(body))return "Denuvo Anti-Tamper";
  return "";
}

function confirmDialog(title,message,onContinue){
  const overlay=document.createElement("div");
  overlay.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:99999;display:flex;align-items:center;justify-content:center";
  const box=document.createElement("div");
  box.style.cssText="background:#1b2838;color:#c6d4df;border:1px solid #2a475e;border-radius:3px;max-width:470px;padding:22px;font:14px 'Motiva Sans',Arial,sans-serif;box-shadow:0 0 24px rgba(0,0,0,.6)";
  const heading=document.createElement("div");
  heading.textContent=title;
  heading.style.cssText="font-size:16px;color:#fff;padding-bottom:10px";
  const paragraph=document.createElement("div");
  paragraph.textContent=message;
  paragraph.style.cssText="line-height:1.55;padding-bottom:20px;color:#a4b3bd";
  const row=document.createElement("div");
  row.style.cssText="display:flex;gap:10px;justify-content:flex-end";
  const cancel=document.createElement("button");
  cancel.textContent=t("cancel");
  cancel.style.cssText="padding:8px 16px;cursor:pointer";
  const proceed=document.createElement("button");
  proceed.textContent=t("continue");
  proceed.style.cssText="padding:8px 16px;cursor:pointer;background:linear-gradient(to bottom,#75b022,#588a1b);color:#d2efa9;border:none;border-radius:2px";
  cancel.addEventListener("click",()=>overlay.remove());
  proceed.addEventListener("click",()=>{overlay.remove();onContinue()});
  row.appendChild(cancel);
  row.appendChild(proceed);
  box.appendChild(heading);
  box.appendChild(paragraph);
  box.appendChild(row);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function resolveAppId(){
  const dlcLink=document.querySelector("div.game_area_bubble.game_area_dlc_bubble div > p > a");
  return((dlcLink&&dlcLink.href||location.href).match(/\/app\/(\d+)/)||[])[1];
}

let owned=new Set();
async function loadOwned(){
  try{
    const res=await fetch("/dynamicstore/userdata/",{credentials:"include"});
    const data=await res.json();
    owned=new Set((data.rgOwnedApps||[]).map(Number));
  }catch(err){console.warn("[Hubcap]",err)}
}

async function perform(button,appId,mode){
  if(button.dataset.busy)return;
  button.dataset.busy="1";
  const text=button.querySelector("span > span");
  const original=text.textContent;
  const restore=()=>{text.textContent=original;delete button.dataset.busy;};
  const labels={
    add:[t("adding"),t("added")],
    remove:[t("removing"),t("removed")],
    dlc:[t("dlcAdding"),t("dlcAdded")],
    dlcRemove:[t("dlcRemoving"),t("dlcRemoved")],
  }[mode];
  text.textContent=labels[0];
  try{
    let raw;
    if(mode==="add")raw=await addGame({app_id:Number(appId)});
    else if(mode==="remove")raw=await deleteGame({app_id:Number(appId)});
    else if(mode==="dlc")raw=await addDlc({app_id:Number(appId)});
    else raw=await deleteDlc({app_id:Number(appId)});
    const res=JSON.parse(raw);
    if(res.success){
      text.textContent=labels[1];
      button.style.opacity="0.7";
      delete button.dataset.busy;
      return;
    }
    text.textContent=friendly(res.error);
    button.title=res.error||"";
    console.error("[Hubcap]",res.error);
  }catch(err){
    text.textContent=friendly(err);
  }
  setTimeout(restore,6000);
}

let lastPath="";
async function run(){
  if(location.pathname===lastPath)return;
  lastPath=location.pathname;
  document.getElementById(BUTTON_ID)?.remove();
  document.getElementById(DLC_BUTTON_ID)?.remove();
  if(!/\/app\/\d+/.test(location.pathname))return;

  const appId=resolveAppId();
  if(!appId)return;

  let state={exists:false,dlcExists:false};
  try{state=JSON.parse(await checkLua({app_id:Number(appId)}))}catch{}

  if(!owned.size)await loadOwned();
  const isOwned=owned.has(Number(appId));
  const hasDlc=document.querySelectorAll(".game_area_dlc_row").length>0;

  if(isOwned&&!hasDlc)return;

  let container;
  try{container=await MILLENNIUM.Millennium.findElement(document,".apphub_OtherSiteInfo",5000);}
  catch{return;}
  container=container&&(container[0]||container);
  if(!container)return;

  if(isOwned){
    const dlc=createButton(DLC_BUTTON_ID,state.dlcExists?t("dlcRemove"):t("dlc"),state.dlcExists?ICON_REMOVE:ICON_ADD);
    dlc.addEventListener("click",event=>{event.preventDefault();perform(dlc,appId,state.dlcExists?"dlcRemove":"dlc")});
    container.insertBefore(dlc,container.firstChild);
    return;
  }

  const main=createButton(BUTTON_ID,state.exists?t("remove"):t("add"),state.exists?ICON_REMOVE:ICON_ADD);
  main.addEventListener("click",async event=>{
    event.preventDefault();
    if(main.dataset.busy)return;
    if(state.exists){perform(main,appId,"remove");return}
    const drm=await getDrm(appId);
    if(drm){confirmDialog(t("drmTitle"),t("drmBody").replace("{drm}",drm),()=>perform(main,appId,"add"));return}
    perform(main,appId,"add");
  });
  container.insertBefore(main,container.firstChild);
}

setInterval(run,1000);
exports.default=async function(){try{await run()}catch(err){console.error("[Hubcap]",err)}};
Object.defineProperty(exports,"__esModule",{value:!0});return exports}({},window.MILLENNIUM_API)};function ExecutePluginModule(){let e=window.MILLENNIUM_PLUGIN_SETTINGS_STORE[pluginName];e.OnPluginConfigChange=function(n,t,o){n in e.settingsStore&&(e.ignoreProxyFlag=!0,e.settingsStore[n]=o,e.ignoreProxyFlag=!1)},MILLENNIUM_BACKEND_IPC.postMessage(0,{pluginName:pluginName,methodName:"__builtins__.__millennium_plugin_settings_parser__"}).then(async n=>{"string"==typeof n.returnValue&&(e.ignoreProxyFlag=!0,e.settingsStore=e.DefinePluginSetting(Object.fromEntries(JSON.parse(atob(n.returnValue)).map(e=>[e.functionName,e]))),e.ignoreProxyFlag=!1);let t=PluginEntryPointMain();Object.assign(window.PLUGIN_LIST[pluginName],{...t,__millennium_internal_plugin_name_do_not_use_or_change__:pluginName});let o=await t.default();var a;o&&(a=o)&&void 0!==a.title&&void 0!==a.icon&&void 0!==a.content?window.MILLENNIUM_SIDEBAR_NAVIGATION_PANELS[pluginName]=o:console.warn(`Plugin ${pluginName} does not contain proper SidebarNavigation props and therefor can't be mounted by Millennium. Please ensure it has a title, icon, and content.`)})}ExecutePluginModule();