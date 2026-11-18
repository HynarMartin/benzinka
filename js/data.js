(function () {
  'use strict';

  const ITEMS = {
    fuel: {
      id: 'fuel',
      name: 'Natural 95',
      icon: '⛽',
      basePrice: 4,
      prepTime: 2.6,
      stationId: 'pump',
      color: '#e07a5f'
    },
    wash: {
      id: 'wash',
      name: 'Umytí oken',
      icon: '🧽',
      basePrice: 3,
      prepTime: 2.0,
      stationId: 'bucket',
      color: '#5ca4a9'
    },
    coffee: {
      id: 'coffee',
      name: 'Teplá káva',
      icon: '☕',
      basePrice: 4,
      prepTime: 1.8,
      stationId: 'coffee',
      color: '#8c5a3c'
    },
    snack: {
      id: 'snack',
      name: 'Párek / Croissant',
      icon: '🌭',
      basePrice: 5,
      prepTime: 2.2,
      stationId: 'grill',
      color: '#d98a3c'
    },
    drink: {
      id: 'drink',
      name: 'Domácí limonáda',
      icon: '🧃',
      basePrice: 3,
      prepTime: 1.2,
      stationId: 'fridge',
      color: '#7fb069'
    },
    crate: {
      id: 'crate',
      name: 'Krabice zboží',
      icon: '📦',
      basePrice: 0,
      prepTime: 1.0,
      stationId: 'storage',
      color: '#b08457'
    },
    chips: {
      id: 'chips',
      name: 'Křupky a preclíky',
      icon: '🥨',
      basePrice: 3,
      prepTime: 1.0,
      rackId: 'rack_snacks',
      isRackItem: true,
      color: '#d98a3c'
    },
    candy: {
      id: 'candy',
      name: 'Čokoláda a oplatky',
      icon: '🍫',
      basePrice: 4,
      prepTime: 1.0,
      rackId: 'rack_sweets',
      isRackItem: true,
      color: '#7a4b3a'
    },
    carcare: {
      id: 'carcare',
      name: 'Autokosmetika',
      icon: '🧴',
      basePrice: 5,
      prepTime: 1.0,
      rackId: 'rack_auto',
      isRackItem: true,
      color: '#5ca4a9'
    },
    broom: {
      id: 'broom',
      name: 'Koště',
      icon: '🧹',
      basePrice: 0,
      prepTime: 0.4,
      stationId: 'broom',
      color: '#a47148'
    }
  };

  const UPGRADES = [
    {
      id: 'pump_unlock',
      name: 'Další tankovací stojan',
      icon: '⛽',
      maxLevel: 3,
      costs: [14, 28],
      description: 'Postaví na nádvoří 2. a následně 3. tankovací stojan, takže může tankovat více aut najednou.'
    },
    {
      id: 'wash_unlock',
      name: 'Stanoviště: Mytí oken',
      icon: '🧽',
      maxLevel: 2,
      costs: [12],
      description: 'Otevře u stojanů kbelík se stěrkou (🧽). Řidiči si k tankování začnou přát i umytí čelního skla.'
    },
    {
      id: 'rack_sweets_unlock',
      name: '2. Regál: Sladkosti',
      icon: '🍫',
      maxLevel: 2,
      costs: [14],
      description: 'Postaví v obchodě druhý prodejní regál s čokoládou a oplatkami (🍫 za 4 Kč).'
    },
    {
      id: 'fridge_unlock',
      name: 'Chladnička s limonádou',
      icon: '🧃',
      maxLevel: 2,
      costs: [16],
      description: 'Postaví za pult chladničku na čepovanou domácí limonádu (🧃 za 3 Kč).'
    },
    {
      id: 'grill_unlock',
      name: 'Gril & Pečivo',
      icon: '🌭',
      maxLevel: 2,
      costs: [22],
      description: 'Postaví za pult rozpálený gril na párky v rohlíku a croissanty (🌭 za 5 Kč).'
    },
    {
      id: 'rack_auto_unlock',
      name: '3. Regál: Autodrogerie',
      icon: '🧴',
      maxLevel: 2,
      costs: [24],
      description: 'Postaví v obchodě třetí prodejní regál s autokosmetikou (🧴 za 5 Kč).'
    },
    {
      id: 'pumps',
      name: 'Rychlost tankování',
      icon: '⛽',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Zrychlí tankování paliva o +30 % za úroveň.'
    },
    {
      id: 'pumps_price',
      name: 'Prémiové palivo (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší prodejní cenu paliva o +1 Kč za úroveň.'
    },
    {
      id: 'coffee',
      name: 'Rychlost kávovaru',
      icon: '☕',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Vaří kávu o +30 % rychleji za úroveň.'
    },
    {
      id: 'coffee_price',
      name: 'Výběrová káva (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší cenu šálku kávy o +1 Kč za úroveň.'
    },
    {
      id: 'grill',
      name: 'Rychlost grilu a pekárny',
      icon: '🌭',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Připraví párky a pečivo o +30 % rychleji za úroveň.'
    },
    {
      id: 'grill_price',
      name: 'Farmářské suroviny (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší cenu občerstvení z grilu o +1 Kč za úroveň.'
    },
    {
      id: 'wash',
      name: 'Rychlost mytí oken',
      icon: '🧽',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Zrychlí mytí čelních skel o +30 % za úroveň.'
    },
    {
      id: 'wash_price',
      name: 'Lešticí pěna (Cena mytí)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší odměnu za umytí oken o +1 Kč za úroveň.'
    },
    {
      id: 'drink_speed',
      name: 'Rychlost čepování limonád',
      icon: '🧃',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Zrychlí přípravu domácí limonády o +30 % za úroveň.'
    },
    {
      id: 'drink_price',
      name: 'Ovocný sirup (Cena limonády)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší cenu limonády o +1 Kč za úroveň.'
    },
    {
      id: 'racks',
      name: 'Kapacita regálů',
      icon: '🛒',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Zvýší kapacitu každého prodejního stojanu v obchodě o +2 ks za úroveň.'
    },
    {
      id: 'racks_price',
      name: 'Lepší sortiment regálů (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší cenu každého prodaného kusu z regálu o +1 Kč za úroveň.'
    },
    {
      id: 'decor',
      name: 'Útulná výzdoba (Trpělivost)',
      icon: '🌸',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Přidá květiny a světýlka. Zákazníci jsou o +25 % trpělivější za úroveň.'
    },
    {
      id: 'decor_tips',
      name: 'Milá obsluha (Spropitné)',
      icon: '💝',
      maxLevel: 4,
      costs: [12, 25, 48],
      description: 'Zvýší spropitné od spokojených zákazníků o +15 % za úroveň.'
    },
    {
      id: 'shoes',
      name: 'Pohodlné tenisky (Rychlost)',
      icon: '👟',
      maxLevel: 4,
      costs: [10, 22, 45],
      description: 'Chůze obsluhy je o +22 % rychlejší za úroveň.'
    },
    {
      id: 'carry',
      name: 'Větší tác (Nosnost rukou)',
      icon: '🎒',
      maxLevel: 3,
      costs: [24, 55],
      description: 'Uneseš v rukou více věcí najednou (+1 kus za úroveň, až 4 věci).'
    }
  ];

  const STAFF = [
    {
      id: 'tonik',
      name: 'Toník – Čerpadlář',
      shortName: 'Toník',
      icon: '🧑‍🔧',
      color: '#4e79a7',
      hatColor: '#2d4d6e',
      hireCost: 28,
      upgradeCosts: [52, 85],
      maxLevel: 3,
      description: 'Sám dochází k přijíždějícím autům, tankuje palivo (⛽) a myje čelní skla (🧽).'
    },
    {
      id: 'anicka',
      name: 'Anička – Baristka',
      shortName: 'Anička',
      icon: '👩‍🍳',
      color: '#d4746b',
      hatColor: '#b5554c',
      hireCost: 35,
      upgradeCosts: [62, 100],
      maxLevel: 3,
      description: 'Připravuje kávu (☕), občerstvení (🌭) i limonády (🧃) a nosí je zákazníkům.'
    },
    {
      id: 'kuba',
      name: 'Kuba – Pokladní a skladník',
      shortName: 'Kuba',
      icon: '🧔',
      color: '#6b9a6f',
      hatColor: '#48704b',
      hireCost: 32,
      upgradeCosts: [56, 90],
      maxLevel: 3,
      description: 'Obsluhuje pokladnu (📠), doplňuje prázdné stojany v obchodě (📦) a uklízí louže (🧹).'
    }
  ];

  const THEMES = {
    meadow: {
      name: 'Slunečná louka',
      skyTop: '#fce4b8',
      skyBottom: '#f7f1dd',
      hillFar: '#b8cfa3',
      hillNear: '#94b982',
      ground: '#d9d0b4',
      treeColor: '#6d9b65',
      accent: '#f0a663'
    },
    orchard: {
      name: 'Jabloňový sad',
      skyTop: '#ffd9b3',
      skyBottom: '#fff0d4',
      hillFar: '#c6d19a',
      hillNear: '#a3b87a',
      ground: '#dfd0b0',
      treeColor: '#7ca362',
      accent: '#e26d5c'
    },
    forest: {
      name: 'Lesní zátiší',
      skyTop: '#d7e8d5',
      skyBottom: '#eff5e8',
      hillFar: '#84a58a',
      hillNear: '#5e846a',
      ground: '#c7bfa5',
      treeColor: '#416950',
      accent: '#91b488'
    },
    lake: {
      name: 'Jezírková zátoka',
      skyTop: '#c9e4ec',
      skyBottom: '#f1f7f5',
      hillFar: '#99c1be',
      hillNear: '#7ba695',
      ground: '#dcd3bd',
      treeColor: '#5c8f7d',
      accent: '#63a3b8',
      hasWater: true
    },
    village: {
      name: 'Medová vesnička',
      skyTop: '#fde0b6',
      skyBottom: '#fff6e3',
      hillFar: '#ccb88f',
      hillNear: '#ad9f73',
      ground: '#e3d3b4',
      treeColor: '#81a063',
      accent: '#e09f3e'
    },
    vineyard: {
      name: 'Zlaté vinice',
      skyTop: '#f8cba6',
      skyBottom: '#fce8cd',
      hillFar: '#c4a67c',
      hillNear: '#a28e5c',
      ground: '#dfd1b2',
      treeColor: '#768c4c',
      accent: '#9e5a74'
    },
    mountain: {
      name: 'Horská vyhlídka',
      skyTop: '#d3e1ee',
      skyBottom: '#f4efe6',
      hillFar: '#8da3b8',
      hillNear: '#6d8a87',
      ground: '#cfc8b8',
      treeColor: '#4b7062',
      accent: '#7ea1be',
      hasMountains: true
    },
    seaside: {
      name: 'Majáková zátoka',
      skyTop: '#b7dce8',
      skyBottom: '#fef2d6',
      hillFar: '#8bb8c7',
      hillNear: '#94b49f',
      ground: '#ead9b7',
      treeColor: '#699985',
      accent: '#d96b52',
      hasWater: true,
      hasLighthouse: true
    }
  };

  const LEVELS = [
    {
      id: 1,
      name: 'Slunečná paseka',
      subtitle: 'Klidný rozjezd na venkovské silnici',
      x: 120,
      y: 410,
      theme: 'meadow',
      customers: 7,
      spawnInterval: 6.2,
      patienceBase: 46,
      stars: [30, 40, 48],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.48,
      multiChance: 0.2,
      spillChance: 0.08
    },
    {
      id: 2,
      name: 'Jabloňový sad',
      subtitle: 'Řidiči si rádi umyjí sklo, vezmou křupky a limonádu',
      x: 255,
      y: 290,
      theme: 'orchard',
      customers: 9,
      spawnInterval: 5.7,
      patienceBase: 44,
      stars: [48, 65, 78],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.48,
      multiChance: 0.3,
      spillChance: 0.12
    },
    {
      id: 3,
      name: 'Lesní zátiší',
      subtitle: 'Vůně horkých párků a plné regály lákají výletníky',
      x: 380,
      y: 400,
      theme: 'forest',
      customers: 11,
      spawnInterval: 5.3,
      patienceBase: 42,
      stars: [78, 108, 130],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.46,
      multiChance: 0.38,
      spillChance: 0.14
    },
    {
      id: 4,
      name: 'Jezírková zátoka',
      subtitle: 'Rušnější zastávka u letního koupaliště',
      x: 515,
      y: 250,
      theme: 'lake',
      customers: 13,
      spawnInterval: 4.9,
      patienceBase: 40,
      stars: [105, 145, 175],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.48,
      multiChance: 0.45,
      spillChance: 0.16
    },
    {
      id: 5,
      name: 'Medová vesnička',
      subtitle: 'Sousedé si často vybírají ze stojanů i z bistra',
      x: 650,
      y: 370,
      theme: 'village',
      customers: 15,
      spawnInterval: 4.6,
      patienceBase: 39,
      stars: [140, 195, 238],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.48,
      multiChance: 0.56,
      spillChance: 0.18
    },
    {
      id: 6,
      name: 'Zlaté vinice',
      subtitle: 'Podzimní slunce a kolony karavanů',
      x: 775,
      y: 220,
      theme: 'vineyard',
      customers: 17,
      spawnInterval: 4.2,
      patienceBase: 37,
      stars: [185, 255, 310],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.52,
      multiChance: 0.64,
      spillChance: 0.2
    },
    {
      id: 7,
      name: 'Horská vyhlídka',
      subtitle: 'Horské průsmyky žízní po palivu, autokosmetice a kávě',
      x: 895,
      y: 340,
      theme: 'mountain',
      customers: 20,
      spawnInterval: 3.9,
      patienceBase: 36,
      stars: [245, 335, 410],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.54,
      multiChance: 0.7,
      spillChance: 0.22
    },
    {
      id: 8,
      name: 'Majáková zátoka',
      subtitle: 'Velké přímořské finále s obřím obchodem',
      x: 1010,
      y: 185,
      theme: 'seaside',
      customers: 23,
      spawnInterval: 3.6,
      patienceBase: 35,
      stars: [305, 420, 515],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.52,
      multiChance: 0.76,
      spillChance: 0.24
    }
  ];

  // Logical scene dimensions: 1540 x 780
  const STATIONS = {
    pump_0: {
      id: 'pump_0',
      type: 'pump',
      pumpIndex: 0,
      label: 'Stojan 1',
      icon: '⛽',
      x: 120,
      y: 295,
      walkX: 168,
      walkY: 338,
      carX: 115,
      carY: 455,
      radius: 46
    },
    pump_1: {
      id: 'pump_1',
      type: 'pump',
      pumpIndex: 1,
      label: 'Stojan 2',
      icon: '⛽',
      x: 300,
      y: 295,
      walkX: 348,
      walkY: 338,
      carX: 295,
      carY: 455,
      radius: 46
    },
    pump_2: {
      id: 'pump_2',
      type: 'pump',
      pumpIndex: 2,
      label: 'Stojan 3',
      icon: '⛽',
      x: 480,
      y: 295,
      walkX: 528,
      walkY: 338,
      carX: 475,
      carY: 455,
      radius: 46
    },
    bucket: {
      id: 'bucket',
      type: 'prep',
      itemId: 'wash',
      label: 'Mytí oken',
      icon: '🧽',
      x: 555,
      y: 205,
      walkX: 555,
      walkY: 256,
      radius: 38
    },
    coffee: {
      id: 'coffee',
      type: 'prep',
      itemId: 'coffee',
      label: 'Kávovar',
      icon: '☕',
      x: 700,
      y: 185,
      walkX: 700,
      walkY: 248,
      radius: 42
    },
    grill: {
      id: 'grill',
      type: 'prep',
      itemId: 'snack',
      label: 'Gril & Pečivo',
      icon: '🌭',
      x: 875,
      y: 185,
      walkX: 875,
      walkY: 248,
      radius: 42
    },
    fridge: {
      id: 'fridge',
      type: 'prep',
      itemId: 'drink',
      label: 'Limonády',
      icon: '🧃',
      x: 1050,
      y: 185,
      walkX: 1050,
      walkY: 248,
      radius: 42
    },
    trash: {
      id: 'trash',
      type: 'trash',
      label: 'Koš',
      icon: '🗑️',
      x: 1215,
      y: 185,
      walkX: 1215,
      walkY: 248,
      radius: 36
    },
    register: {
      id: 'register',
      type: 'register',
      label: 'Pokladna',
      icon: '📠',
      x: 745,
      y: 320,
      walkX: 745,
      walkY: 278,
      customerX: 745,
      customerY: 382,
      radius: 44
    },
    storage: {
      id: 'storage',
      type: 'prep',
      itemId: 'crate',
      label: 'Sklad zboží',
      icon: '📦',
      x: 1420,
      y: 220,
      walkX: 1410,
      walkY: 272,
      radius: 44
    },
    broom: {
      id: 'broom',
      type: 'broom',
      label: 'Úklid',
      icon: '🧹',
      x: 1420,
      y: 375,
      walkX: 1410,
      walkY: 418,
      radius: 36
    }
  };

  const RACKS = {
    rack_snacks: {
      id: 'rack_snacks',
      itemId: 'chips',
      label: 'Stojan: Křupky',
      icon: '🥨',
      x: 790,
      y: 500,
      walkX: 790,
      walkY: 452,
      custX: 790,
      custY: 548,
      radius: 44
    },
    rack_sweets: {
      id: 'rack_sweets',
      itemId: 'candy',
      label: 'Stojan: Sladkosti',
      icon: '🍫',
      x: 990,
      y: 500,
      walkX: 990,
      walkY: 452,
      custX: 990,
      custY: 548,
      radius: 44
    },
    rack_auto: {
      id: 'rack_auto',
      itemId: 'carcare',
      label: 'Stojan: Autodrogerie',
      icon: '🧴',
      x: 1190,
      y: 500,
      walkX: 1190,
      walkY: 452,
      custX: 1190,
      custY: 548,
      radius: 44
    }
  };

  const SHOP_SPOTS = [
    { id: 0, x: 880, y: 382, serveX: 880, serveY: 278 },
    { id: 1, x: 985, y: 382, serveX: 985, serveY: 278 },
    { id: 2, x: 1090, y: 382, serveX: 1090, serveY: 278 },
    { id: 3, x: 1195, y: 382, serveX: 1195, serveY: 278 }
  ];

  window.GAME_DATA = {
    ITEMS,
    UPGRADES,
    STAFF,
    THEMES,
    LEVELS,
    STATIONS,
    RACKS,
    SHOP_SPOTS
  };
})();
