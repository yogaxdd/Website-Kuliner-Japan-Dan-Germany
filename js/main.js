/* =========================================================================
   main.js
   Galeri Kuliner Jepang × Jerman
   -------------------------------------------------------------------------
   Tugas:
   - Inisialisasi tema dari localStorage
   - switchTheme() — animasi wipe + swap data-theme + render ulang menu
   - Render menu sesuai tema (JP atau DE — masing-masing menampilkan
     kuliner asli dari negaranya)
   - Render glosarium istilah dapur per tema
   - IntersectionObserver — scroll-reveal
   - Sticky nav backdrop saat scroll
   ========================================================================= */

(() => {
  'use strict';

  // -----------------------------------------------------------------------
  // CONSTANTS & STATE
  // -----------------------------------------------------------------------

  const THEME_STORAGE_KEY = 'theme';
  const VALID_THEMES = ['jp', 'de'];
  const DEFAULT_THEME = 'jp';

  /** Sinkron dengan --duration-wipe di base.css (0.8s = 800ms). */
  const WIPE_DURATION_MS = 800;
  const WIPE_SWAP_AT_MS = WIPE_DURATION_MS * 0.5;

  let isSwitching = false;

  // -----------------------------------------------------------------------
  // UTILITIES
  // -----------------------------------------------------------------------

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getStoredTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return VALID_THEMES.includes(stored) ? stored : null;
    } catch (err) {
      return null;
    }
  };

  const setStoredTheme = (theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (err) {
      // Diam — tema tetap jalan tanpa persistence
    }
  };

  // -----------------------------------------------------------------------
  // DATA — KULINER JEPANG (Mode JP)
  // -----------------------------------------------------------------------

  const menuJP = [
    {
      id: 'ramen',
      kanji: 'ラーメン', romaji: 'Rāmen',
      kategori: '麺類 · Mie', asal: 'Hokkaido — Tokyo',
      deskripsi: 'Mie kuah dengan kaldu yang dimasak berjam-jam. Tonkotsu, shoyu, miso, atau shio — setiap daerah punya dialeknya sendiri.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg/1280px-Shoyu_ramen%2C_at_Kasukabe_Station_%282014.05.05%29_1.jpg',
      placeholderColor: '#3A2A22',
    },
    {
      id: 'sushi',
      kanji: '寿司', romaji: 'Sushi',
      kategori: '握り · Kepalan', asal: 'Tsukiji — Toyosu',
      deskripsi: 'Nasi cuka yang dikepal dengan ikan segar. Wasabi disisipkan di antaranya, kedelai diteteskan secukupnya.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/1280px-Sushi_platter.jpg',
      placeholderColor: '#5C2E2E',
    },
    {
      id: 'tempura',
      kanji: '天ぷら', romaji: 'Tenpura',
      kategori: '揚げ物 · Gorengan', asal: 'Edo — Abad ke-17',
      deskripsi: 'Sayur dan seafood dilapisi adonan tepung tipis, digoreng dengan minyak panas. Renyah dengan sentuhan tentsuyu.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Tempura_01.jpg/1280px-Tempura_01.jpg',
      placeholderColor: '#C9A961',
    },
    {
      id: 'okonomiyaki',
      kanji: 'お好み焼き', romaji: 'Okonomiyaki',
      kategori: '鉄板焼き · Panggang', asal: 'Osaka — Hiroshima',
      deskripsi: 'Pancake gurih dari tepung dan kol, dipanggang di atas teppan. Bumbu okonomi, mayones, dan katsuobushi yang menari.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Okonomiyaki_001.jpg/1280px-Okonomiyaki_001.jpg',
      placeholderColor: '#7A4A2A',
    },
    {
      id: 'takoyaki',
      kanji: 'たこ焼き', romaji: 'Takoyaki',
      kategori: '屋台 · Jajanan', asal: 'Osaka',
      deskripsi: 'Bola tepung berisi potongan gurita, dibakar dalam cetakan setengah bulat. Dibalik dengan tusukan, panas dari dalam.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Takoyaki.jpg/1280px-Takoyaki.jpg',
      placeholderColor: '#5A3520',
    },
    {
      id: 'unadon',
      kanji: '鰻丼', romaji: 'Unadon',
      kategori: '丼物 · Donburi', asal: 'Edo',
      deskripsi: 'Belut yang dipanggang dengan saus kabayaki manis-asin, disajikan di atas nasi. Aroma karamelisasi yang dalam.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Tokyo_Chikuyotei_Unadon01s2100.jpg/1280px-Tokyo_Chikuyotei_Unadon01s2100.jpg',
      placeholderColor: '#3D2418',
    },
    {
      id: 'tonkatsu',
      kanji: '豚カツ', romaji: 'Tonkatsu',
      kategori: '揚げ物 · Gorengan', asal: 'Tokyo — 1899',
      deskripsi: 'Daging babi loin yang dilumuri panko dan digoreng emas. Disajikan dengan kol cincang dan saus tonkatsu kental.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/%22Amai-Yuwaku%22_Special_Loin_Pork_Cutlet1.jpg/1280px-%22Amai-Yuwaku%22_Special_Loin_Pork_Cutlet1.jpg',
      placeholderColor: '#A87547',
    },
    {
      id: 'udon',
      kanji: 'うどん', romaji: 'Udon',
      kategori: '麺類 · Mie', asal: 'Sanuki — Kagawa',
      deskripsi: 'Mie tebal dari tepung gandum, kenyal saat digigit. Disajikan dalam kuah kakejiru ringan dengan daun bawang dan tempura.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Kakeudon.jpg',
      placeholderColor: '#8C6B3F',
    },
    {
      id: 'soba',
      kanji: '蕎麦', romaji: 'Soba',
      kategori: '麺類 · Mie', asal: 'Nagano — Iwate',
      deskripsi: 'Mie tipis dari tepung soba (buckwheat) berwarna coklat keabu-abuan. Disajikan dingin dengan tsuyu, atau panas berkuah.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Dried_soba_noodles_by_FotoosVanRobin.jpg',
      placeholderColor: '#604937',
    },
    {
      id: 'yakitori',
      kanji: '焼き鳥', romaji: 'Yakitori',
      kategori: '串焼き · Tusuk', asal: 'Tokyo — Izakaya',
      deskripsi: 'Potongan ayam ditusuk, dibakar di atas arang dengan saus tare atau hanya garam. Pendamping bir di kedai.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cooking_yakitori.jpg/1280px-Cooking_yakitori.jpg',
      placeholderColor: '#5C2A1C',
    },
    {
      id: 'yakiniku',
      kanji: '焼肉', romaji: 'Yakiniku',
      kategori: '焼き物 · Bakar', asal: 'Osaka — pasca-perang',
      deskripsi: 'Daging dipanggang sendiri di atas arang di tengah meja. Diiris tipis, dicelup ke saus tare, dimakan bersama.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Yakiniku_002.jpg',
      placeholderColor: '#4A2218',
    },
    {
      id: 'gyoza',
      kanji: '餃子', romaji: 'Gyōza',
      kategori: '点心 · Pangsit', asal: 'Tochigi — Utsunomiya',
      deskripsi: 'Pangsit berisi babi cincang dan kol, dipan-fry hingga bawah keemasan dan atas tetap lembut. Ditemani saus cuka.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/8/88/%E5%8F%B0%E7%81%A3%E5%8D%97%E6%8A%95%E8%8D%89%E5%B1%AF%E6%B0%B4%E9%A4%83Nantou%2C_Taiwan_Caotun_dumplings.jpg',
      placeholderColor: '#8E7B58',
    },
    {
      id: 'gyudon',
      kanji: '牛丼', romaji: 'Gyūdon',
      kategori: '丼物 · Donburi', asal: 'Tokyo — 1899',
      deskripsi: 'Nasi ditutupi irisan tipis sapi dan bawang yang direbus dalam saus dashi-shoyu manis. Cepat, hangat, mengenyangkan.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Gyuu-don_001.jpg/1280px-Gyuu-don_001.jpg',
      placeholderColor: '#3D2A1C',
    },
    {
      id: 'katsudon',
      kanji: 'カツ丼', romaji: 'Katsudon',
      kategori: '丼物 · Donburi', asal: 'Tokyo',
      deskripsi: 'Tonkatsu yang direbus dengan telur dan bawang dalam saus dashi, ditaruh di atas nasi. Comfort food klasik.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Katsudon_001.jpg/1280px-Katsudon_001.jpg',
      placeholderColor: '#7A4F2A',
    },
    {
      id: 'kare',
      kanji: 'カレーライス', romaji: 'Karē Raisu',
      kategori: '洋食 · Yōshoku', asal: 'Meiji era — 1870-an',
      deskripsi: 'Kari Jepang yang kental dan manis dengan kentang, wortel, dan daging. Anak Inggris yang dibesarkan Jepang.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Beef_curry_rice_003.jpg/1280px-Beef_curry_rice_003.jpg',
      placeholderColor: '#5A3A1F',
    },
    {
      id: 'shabu-shabu',
      kanji: 'しゃぶしゃぶ', romaji: 'Shabu-shabu',
      kategori: '鍋物 · Hotpot', asal: 'Osaka — 1955',
      deskripsi: 'Daging diiris tipis seperti kertas, dicelup ke air mendidih sambil mengayun (shabu-shabu = "celup-celup"). Dimakan dengan ponzu atau goma.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Shabu-shabu-01.jpg',
      placeholderColor: '#9E5B3E',
    },
    {
      id: 'sukiyaki',
      kanji: 'すき焼き', romaji: 'Sukiyaki',
      kategori: '鍋物 · Hotpot', asal: 'Edo akhir',
      deskripsi: 'Daging sapi, sayur, dan tofu direbus dalam saus warishita manis di panci besi. Dicelup ke telur mentah sebelum dimakan.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Sukiyaki_01.jpg/1280px-Sukiyaki_01.jpg',
      placeholderColor: '#5C2D1C',
    },
    {
      id: 'oden',
      kanji: 'おでん', romaji: 'Oden',
      kategori: '鍋物 · Hotpot', asal: 'Edo — 1700-an',
      deskripsi: 'Telur, daikon, konjac, dan bola ikan direbus pelan dalam kaldu dashi-kedelai. Hidangan musim dingin di yatai.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/d/db/Yataioden.jpg',
      placeholderColor: '#7A6438',
    },
    {
      id: 'yakisoba',
      kanji: '焼きそば', romaji: 'Yakisoba',
      kategori: '麺類 · Mie Goreng', asal: 'Asakusa — 1950-an',
      deskripsi: 'Mie gandum digoreng dengan kol, tauge, dan daging. Saus yakisoba mirip Worcestershire — gurih, manis, berkarakter.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Nagata_Honjoken_Bokkake_Yakisoba.jpg/1280px-Nagata_Honjoken_Bokkake_Yakisoba.jpg',
      placeholderColor: '#5A3018',
    },
    {
      id: 'onigiri',
      kanji: 'おにぎり', romaji: 'Onigiri',
      kategori: '米料理 · Nasi', asal: 'Heian — abad ke-11',
      deskripsi: 'Nasi yang dibentuk segitiga atau silinder, dibungkus nori, isian umeboshi atau salmon. Bekal yang melintasi seribu tahun.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/4/43/%E5%B0%8F%E6%96%99%E7%90%86%E3%83%90%E3%83%AB%E3%81%95%E3%81%8F%E3%82%89_%E7%89%B9%E8%A3%BD%E3%81%8A%E3%81%AB%E3%81%8E%E3%82%8A.jpg',
      placeholderColor: '#2A2A2A',
    },
    {
      id: 'misoshiru',
      kanji: '味噌汁', romaji: 'Miso Shiru',
      kategori: '汁物 · Sup', asal: 'Seluruh Jepang',
      deskripsi: 'Sup miso berbahan dasar dashi dengan tofu, wakame, dan negi. Pendamping nasi di setiap meja makan Jepang.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Miso_Soup_001.jpg/1280px-Miso_Soup_001.jpg',
      placeholderColor: '#4A3520',
    },
    {
      id: 'mochi',
      kanji: '餅', romaji: 'Mochi',
      kategori: '和菓子 · Kue', asal: 'Heian — Tahun Baru',
      deskripsi: 'Beras ketan dipukul-pukul jadi pasta kenyal, dibentuk bulatan. Diisi anko atau dimakan polos. Tradisi mochitsuki di Tahun Baru.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Mochi_002.jpg',
      placeholderColor: '#D4C8B5',
    },
    {
      id: 'taiyaki',
      kanji: 'たい焼き', romaji: 'Taiyaki',
      kategori: '和菓子 · Jajanan', asal: 'Tokyo — 1909',
      deskripsi: 'Kue berbentuk ikan tai (ikan kakap merah) yang di dalamnya berisi anko manis. Renyah di luar, lembap di dalam.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Taiyaki_003.jpg/1280px-Taiyaki_003.jpg',
      placeholderColor: '#7A4923',
    },
    {
      id: 'dorayaki',
      kanji: 'どら焼き', romaji: 'Dorayaki',
      kategori: '和菓子 · Kue', asal: 'Tokyo — Edo',
      deskripsi: 'Dua pancake mini castella yang mengapit anko di tengah. Bentuknya menyerupai dora (gong) — favorit Doraemon.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Dorayaki_001_%283%29.jpg',
      placeholderColor: '#7E4820',
    },
  ];

  // -----------------------------------------------------------------------
  // DATA — KULINER JERMAN (Mode DE)
  // -----------------------------------------------------------------------

  const menuDE = [
    {
      id: 'bratwurst',
      kanji: 'BRATWURST', romaji: 'Bratwurst',
      kategori: 'WURST · SOSIS', asal: 'NÜRNBERG — THÜRINGEN',
      deskripsi: 'Sosis daging babi yang dibakar di atas arang. Dimakan dengan roti, mustard tajam, dan asinan kol.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/German_Bratw%C3%BCrste.jpg',
      placeholderColor: '#8B4513',
    },
    {
      id: 'weisswurst',
      kanji: 'WEISSWURST', romaji: 'Weißwurst',
      kategori: 'WURST · SOSIS', asal: 'MÜNCHEN — BAYERN',
      deskripsi: 'Sosis putih dari sapi muda dan lemak babi, dibumbui peterseli, lemon, dan jahe. Dimakan sebelum tengah hari, tanpa kulit.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Wei%C3%9Fwurst-1.jpg/1280px-Wei%C3%9Fwurst-1.jpg',
      placeholderColor: '#C9B585',
    },
    {
      id: 'currywurst',
      kanji: 'CURRYWURST', romaji: 'Currywurst',
      kategori: 'IMBISS · JAJANAN', asal: 'BERLIN — 1949',
      deskripsi: 'Sosis bakar dipotong-potong, disiram saus tomat-kari, ditaburi bubuk kari. Lahir di Berlin pasca-perang.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/20220430_currywurst.jpg/1280px-20220430_currywurst.jpg',
      placeholderColor: '#A0341E',
    },
    {
      id: 'sauerbraten',
      kanji: 'SAUERBRATEN', romaji: 'Sauerbraten',
      kategori: 'BRATEN · DAGING PANGGANG', asal: 'RHEINLAND',
      deskripsi: 'Daging sapi dimarinasi tujuh hari dalam cuka anggur dan rempah. Disajikan dengan Rotkohl dan Knödel.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Heldrunger_Sauerbraten_2.JPG/1280px-Heldrunger_Sauerbraten_2.JPG',
      placeholderColor: '#5A2D1C',
    },
    {
      id: 'schnitzel',
      kanji: 'SCHNITZEL', romaji: 'Wiener Schnitzel',
      kategori: 'KALBFLEISCH · DAGING SAPI MUDA', asal: 'WIEN — BERLIN',
      deskripsi: 'Irisan tipis daging sapi muda dilumuri tepung roti dan digoreng emas. Lemon dan peterseli sebagai pasangan.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Wiener-Schnitzel02.jpg/1280px-Wiener-Schnitzel02.jpg',
      placeholderColor: '#C9954D',
    },
    {
      id: 'schweinshaxe',
      kanji: 'SCHWEINSHAXE', romaji: 'Schweinshaxe',
      kategori: 'BRATEN · DAGING PANGGANG', asal: 'BAYERN',
      deskripsi: 'Kaki babi dipanggang sampai kulitnya garing seperti kerupuk dan dagingnya luruh dari tulang. Dipotong dengan pisau berat.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/5/54/00ane_Haxen.jpg',
      placeholderColor: '#7A3818',
    },
    {
      id: 'eisbein',
      kanji: 'EISBEIN', romaji: 'Eisbein',
      kategori: 'BRATEN · DAGING PANGGANG', asal: 'BERLIN',
      deskripsi: 'Variasi utara dari Schweinshaxe — kaki babi diawetkan dan direbus, bukan dipanggang. Lembut, pucat, jujur.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Eisbein-2.jpg/1280px-Eisbein-2.jpg',
      placeholderColor: '#C49570',
    },
    {
      id: 'rouladen',
      kanji: 'ROULADEN', romaji: 'Rouladen',
      kategori: 'BRATEN · DAGING PANGGANG', asal: 'RHEINLAND — WESTFALEN',
      deskripsi: 'Lembaran tipis sapi diisi bacon, bawang, mustard, dan acar mentimun, lalu digulung dan direbus pelan dalam saus coklat.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Unsliced_Flank_Roulade.jpg/1280px-Unsliced_Flank_Roulade.jpg',
      placeholderColor: '#5A301A',
    },
    {
      id: 'klopse',
      kanji: 'KÖNIGSBERGER KLOPSE', romaji: 'Königsberger Klopse',
      kategori: 'EINTOPF · MASAKAN', asal: 'KÖNIGSBERG — PRUSSIA',
      deskripsi: 'Bakso sapi-cincang dalam saus krim putih dengan kapers. Hidangan ningrat yang sederhana — putih, lembut, asin sedikit.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Koenigsberger.jpg/1280px-Koenigsberger.jpg',
      placeholderColor: '#A89880',
    },
    {
      id: 'maultaschen',
      kanji: 'MAULTASCHEN', romaji: 'Maultaschen',
      kategori: 'TEIGWAREN · PASTA', asal: 'SCHWABEN',
      deskripsi: 'Pangsit pasta besar berisi daging cincang, bayam, roti, dan rempah. Disajikan dalam kaldu atau digoreng.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Maultaschensuppe.jpg',
      placeholderColor: '#6B5230',
    },
    {
      id: 'spaetzle',
      kanji: 'SPÄTZLE', romaji: 'Spätzle',
      kategori: 'TEIGWAREN · PASTA', asal: 'SCHWABEN',
      deskripsi: 'Pasta telur berbentuk tidak teratur, ditekan langsung ke air mendidih. Disajikan dengan keju, bawang goreng, atau sebagai pendamping.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Sp%C3%A4tzle-02.jpg/1280px-Sp%C3%A4tzle-02.jpg',
      placeholderColor: '#C9A55C',
    },
    {
      id: 'kartoffelpuffer',
      kanji: 'REIBEKUCHEN', romaji: 'Reibekuchen / Kartoffelpuffer',
      kategori: 'BEILAGE · LAUK', asal: 'RHEINLAND',
      deskripsi: 'Pancake kentang parut yang digoreng pinggiran garing. Disajikan dengan saus apel manis atau Maggi gurih.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Reibekuchen_mit_Apfelmus.jpg/1280px-Reibekuchen_mit_Apfelmus.jpg',
      placeholderColor: '#7A4A1F',
    },
    {
      id: 'bratkartoffeln',
      kanji: 'BRATKARTOFFELN', romaji: 'Bratkartoffeln',
      kategori: 'BEILAGE · LAUK', asal: 'SELURUH JERMAN',
      deskripsi: 'Kentang rebus yang diiris dan digoreng dengan bacon dan bawang. Sederhana, dapur rumah, mengenyangkan.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Bratkartoffeln-mit-Speck.jpg',
      placeholderColor: '#7C5128',
    },
    {
      id: 'brezel',
      kanji: 'BREZEL', romaji: 'Brezel',
      kategori: 'BACKWAREN · ROTI', asal: 'BAYERN — SCHWABEN',
      deskripsi: 'Roti melingkar coklat keemasan, kulit garing dengan butiran garam kasar. Daging dalamnya empuk dan lembap.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/BrezelnSalz02_%28cropped%29.JPG/1280px-BrezelnSalz02_%28cropped%29.JPG',
      placeholderColor: '#6B4226',
    },
    {
      id: 'berliner',
      kanji: 'BERLINER', romaji: 'Berliner / Krapfen',
      kategori: 'BACKWAREN · KUE', asal: 'BERLIN',
      deskripsi: 'Donat berisi selai tanpa lubang tengah, ditaburi gula bubuk. Tradisional di Karneval dan malam tahun baru.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Berliner-Pfannkuchen.jpg/1280px-Berliner-Pfannkuchen.jpg',
      placeholderColor: '#A66332',
    },
    {
      id: 'apfelstrudel',
      kanji: 'APFELSTRUDEL', romaji: 'Apfelstrudel',
      kategori: 'TORTE · KUE', asal: 'WIEN — BAYERN',
      deskripsi: 'Adonan tipis seperti kertas yang digulung dengan apel, kismis, kayu manis, dan kacang. Dimakan hangat dengan vanille saus.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Strudel.jpg/1280px-Strudel.jpg',
      placeholderColor: '#A8703E',
    },
    {
      id: 'schwarzwald',
      kanji: 'SCHWARZWÄLDER', romaji: 'Kirschtorte',
      kategori: 'TORTE · KUE', asal: 'SCHWARZWALD',
      deskripsi: 'Lapisan biskuit coklat, krim kocok, dan ceri direndam Kirschwasser. Hutan hitam dalam satu potongan.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Black_Forest_gateau.jpg/1280px-Black_Forest_gateau.jpg',
      placeholderColor: '#3D1F1F',
    },
    {
      id: 'bienenstich',
      kanji: 'BIENENSTICH', romaji: 'Bienenstich',
      kategori: 'TORTE · KUE', asal: 'JERMAN — ABAD KE-20',
      deskripsi: 'Kue ragi dengan topping almond karamel dan isian krim vanila. "Sengatan lebah" — manis tapi pedas pengingat.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bienenstich_140531_AW.jpg/1280px-Bienenstich_140531_AW.jpg',
      placeholderColor: '#C9954A',
    },
    {
      id: 'stollen',
      kanji: 'STOLLEN', romaji: 'Stollen',
      kategori: 'BACKWAREN · ROTI MANIS', asal: 'DRESDEN — NATAL',
      deskripsi: 'Roti buah dengan kacang, rempah, marzipan, dan gula bubuk tebal. Tradisi Natal Saxon yang berusia 700 tahun.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Stollen-Dresdner_Christstollen.jpg/1280px-Stollen-Dresdner_Christstollen.jpg',
      placeholderColor: '#C9B07A',
    },
    {
      id: 'lebkuchen',
      kanji: 'LEBKUCHEN', romaji: 'Lebkuchen',
      kategori: 'WEIHNACHTEN · NATAL', asal: 'NÜRNBERG',
      deskripsi: 'Kue rempah madu yang renyah-empuk dengan jahe, kayu manis, cengkeh, dan kulit jeruk. Wangi pasar Natal Jerman.',
      foto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Lebkuchen-pile.jpg/1280px-Lebkuchen-pile.jpg',
      placeholderColor: '#7A4623',
    },
  ];

  // -----------------------------------------------------------------------
  // DATA — GLOSARIUM ISTILAH DAPUR
  // -----------------------------------------------------------------------

  const glosariumJP = [
    { term: '旨味',     latin: 'Umami',       arti: 'Rasa kelima — gurih dalam yang berasal dari glutamat.' },
    { term: '出汁',     latin: 'Dashi',       arti: 'Kaldu dasar dari kombu dan katsuobushi — fondasi rasa.' },
    { term: 'おもてなし', latin: 'Omotenashi',  arti: 'Keramahan tulus — melayani tanpa mengharap balasan.' },
    { term: '一汁三菜', latin: 'Ichijū Sansai', arti: 'Satu sup, tiga lauk — komposisi makan tradisional.' },
    { term: '旬',       latin: 'Shun',        arti: 'Musim puncak — saat bahan paling baik untuk dimakan.' },
    { term: '懐石',     latin: 'Kaiseki',     arti: 'Hidangan multi-kursus — seni dapur tertinggi Jepang.' },
  ];

  const glosariumDE = [
    { term: 'GUTEN APPETIT',     latin: '"Selamat Makan"',  arti: 'Salam sebelum makan — diucapkan ke seluruh meja.' },
    { term: 'BROTZEIT',          latin: '"Waktu Roti"',     arti: 'Camilan sore — roti, sosis, keju, dan bir ringan.' },
    { term: 'STAMMTISCH',        latin: '"Meja Tetap"',     arti: 'Meja reguler di kedai — tempat warga berkumpul.' },
    { term: 'BÜRGERLICHE KÜCHE', latin: '"Dapur Rakyat"',   arti: 'Masakan sehari-hari — sederhana, mengenyangkan.' },
    { term: 'PROST',             latin: '"Bersulang"',      arti: 'Salam saat mengangkat gelas — mata bertemu mata.' },
    { term: 'MAHLZEIT',          latin: '"Saat Makan"',     arti: 'Sapaan netral di siang hari — singkat dan tulus.' },
  ];

  // -----------------------------------------------------------------------
  // RENDER — MENU CARDS
  // -----------------------------------------------------------------------

  /**
   * Render satu card. Strukturnya seragam antara JP dan DE — yang
   * berbeda hanya isi data dan styling per tema (di-handle CSS).
   */
  const renderMenuCard = (item, index) => {
    const num = String(index + 1).padStart(2, '0');
    const article = document.createElement('article');
    article.className = 'menu__card';

    article.innerHTML = `
      <div class="menu__card-meta" aria-hidden="true">
        <span class="menu__card-num">${num}</span>
        <span class="menu__card-line"></span>
        <span class="menu__card-asal">${item.asal}</span>
      </div>

      <figure class="menu__card-figure" style="background-color: ${item.placeholderColor};">
        <img
          class="menu__card-image"
          src="${item.foto}"
          alt="${item.romaji} — ${item.kategori}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
        />
      </figure>

      <div class="menu__card-body">
        <span class="menu__card-kategori">${item.kategori}</span>

        <h3 class="menu__card-name">
          <span class="menu__card-name-native">${item.kanji}</span>
          <span class="menu__card-name-latin">${item.romaji}</span>
        </h3>

        <p class="menu__card-desc">${item.deskripsi}</p>
      </div>
    `;

    return article;
  };

  /**
   * Render menu sesuai tema. Dipanggil saat init dan setiap switch tema.
   */
  const renderMenu = (theme) => {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    const data = theme === 'de' ? menuDE : menuJP;
    grid.innerHTML = '';

    const fragment = document.createDocumentFragment();
    data.forEach((item, index) => {
      fragment.appendChild(renderMenuCard(item, index));
    });
    grid.appendChild(fragment);
  };

  // -----------------------------------------------------------------------
  // RENDER — GLOSARIUM
  // -----------------------------------------------------------------------

  const renderGlosariumItem = (item) => {
    const li = document.createElement('li');
    li.className = 'glosarium__item';
    li.innerHTML = `
      <span class="glosarium__term">${item.term}</span>
      <span class="glosarium__latin">${item.latin}</span>
      <span class="glosarium__arti">${item.arti}</span>
    `;
    return li;
  };

  const renderGlosarium = (theme) => {
    const list = document.getElementById('glosarium-list');
    if (!list) return;

    const data = theme === 'de' ? glosariumDE : glosariumJP;
    list.innerHTML = '';

    const fragment = document.createDocumentFragment();
    data.forEach((item) => {
      fragment.appendChild(renderGlosariumItem(item));
    });
    list.appendChild(fragment);
  };

  // -----------------------------------------------------------------------
  // RE-OBSERVE — pasang IntersectionObserver ke konten yang baru di-render
  // -----------------------------------------------------------------------

  let revealObserver = null;

  const observeReveals = (root) => {
    if (!revealObserver) return;
    const targets = (root || document).querySelectorAll(
      '[data-reveal], [data-reveal-stagger]'
    );
    targets.forEach((el) => {
      // Pastikan elemen yang baru di-render kembali ke state awal
      if (!el.classList.contains('is-visible')) {
        revealObserver.observe(el);
      }
    });
  };

  // -----------------------------------------------------------------------
  // THEME — APPLY & SWITCH
  // -----------------------------------------------------------------------

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);

    // Sinkron meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const bg = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg')
        .trim();
      if (bg) metaTheme.setAttribute('content', bg);
    }

    // aria-pressed di tombol toggle
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      const matches = btn.getAttribute('data-theme-toggle') === theme;
      btn.setAttribute('aria-pressed', String(matches));
    });

    // Render konten dependen-tema
    renderMenu(theme);
    renderGlosarium(theme);
  };

  const switchTheme = async (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    if (isSwitching) return;

    const current = document.documentElement.getAttribute('data-theme');
    if (current === newTheme) return;

    if (prefersReducedMotion()) {
      applyTheme(newTheme);
      setStoredTheme(newTheme);
      // Konten baru langsung tampil tanpa animasi
      document.querySelectorAll('#menu-grid [data-reveal], #glosarium-list')
        .forEach((el) => el.classList.add('is-visible'));
      return;
    }

    isSwitching = true;
    document.body.classList.add('is-switching');

    await wait(WIPE_SWAP_AT_MS);
    applyTheme(newTheme);
    setStoredTheme(newTheme);

    // Saat overlay menutupi viewport, konten baru sudah ada — perlu
    // ditampilkan langsung (jangan tunggu scroll), karena posisinya
    // sudah dalam viewport saat user switch.
    requestAnimationFrame(() => {
      document.querySelectorAll('.menu__card, .glosarium__item').forEach((el) => {
        el.classList.add('is-visible');
      });
    });

    await wait(WIPE_DURATION_MS - WIPE_SWAP_AT_MS);

    document.body.classList.remove('is-switching');
    isSwitching = false;
  };

  // -----------------------------------------------------------------------
  // SCROLL REVEAL — IntersectionObserver
  // -----------------------------------------------------------------------

  const initScrollReveal = () => {
    const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    targets.forEach((el) => revealObserver.observe(el));
  };

  // -----------------------------------------------------------------------
  // NAV — sticky scroll state
  // -----------------------------------------------------------------------

  const initNavScroll = () => {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;

    const SCROLL_THRESHOLD = 24;
    let ticking = false;

    const update = () => {
      const scrolled = window.scrollY > SCROLL_THRESHOLD;
      nav.classList.toggle('is-scrolled', scrolled);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  };

  // -----------------------------------------------------------------------
  // NAV — mobile drawer toggle
  // -----------------------------------------------------------------------

  const initNavDrawer = () => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!isOpen);
    });

    // Tutup saat user klik salah satu link
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Tutup saat tekan Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
      }
    });

    // Tutup otomatis saat resize ke desktop (≥768px) — hindari state stale
    const mq = window.matchMedia('(min-width: 768px)');
    const handleMQ = (e) => {
      if (e.matches) setOpen(false);
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handleMQ);
    } else if (mq.addListener) {
      mq.addListener(handleMQ);
    }
  };

  // -----------------------------------------------------------------------
  // ENTRANCE — body 'is-loaded' setelah render frame pertama
  // -----------------------------------------------------------------------

  const initEntrance = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('is-loaded');
      });
    });
  };

  // -----------------------------------------------------------------------
  // EVENT BINDING
  // -----------------------------------------------------------------------

  const bindThemeToggles = () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-theme-toggle');
        switchTheme(target);
      });
    });
  };

  // -----------------------------------------------------------------------
  // INIT
  // -----------------------------------------------------------------------

  const init = () => {
    const initial = getStoredTheme() || DEFAULT_THEME;

    // applyTheme sudah panggil renderMenu + renderGlosarium
    applyTheme(initial);

    bindThemeToggles();
    initScrollReveal();
    initNavScroll();
    initNavDrawer();
    initEntrance();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose untuk debugging
  window.__app = {
    switch: switchTheme,
    apply: applyTheme,
    current: () => document.documentElement.getAttribute('data-theme'),
  };
})();
