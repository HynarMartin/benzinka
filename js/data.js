(function () {
  'use strict';

  const ITEMS = {
    fuel: {
      id: 'fuel',
      name: 'Natural 95',
      icon: '⛽',
      basePrice: 28,
      prepTime: 2.6,
      stationId: 'pump',
      color: '#e07a5f'
    },
    wash: {
      id: 'wash',
      name: 'Umytí oken',
      icon: '🧽',
      basePrice: 22,
      prepTime: 2.0,
      stationId: 'bucket',
      color: '#5ca4a9'
    },
    coffee: {
      id: 'coffee',
      name: 'Teplá káva',
      icon: '☕',
      basePrice: 24,
      prepTime: 1.8,
      stationId: 'coffee',
      color: '#8c5a3c'
    },
    snack: {
      id: 'snack',
      name: 'Párek / Croissant',
      icon: '🌭',
      basePrice: 30,
      prepTime: 2.2,
      stationId: 'grill',
      color: '#d98a3c'
    },
    drink: {
      id: 'drink',
      name: 'Domácí limonáda',
      icon: '🧃',
      basePrice: 20,
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
      basePrice: 24,
      prepTime: 1.0,
      rackId: 'rack_snacks',
      isRackItem: true,
      color: '#d98a3c'
    },
    candy: {
      id: 'candy',
      name: 'Čokoláda a oplatky',
      icon: '🍫',
      basePrice: 26,
      prepTime: 1.0,
      rackId: 'rack_sweets',
      isRackItem: true,
      color: '#7a4b3a'
    },
    carcare: {
      id: 'carcare',
      name: 'Autokosmetika',
      icon: '🧴',
      basePrice: 32,
      prepTime: 1.0,
      rackId: 'rack_auto',
      isRackItem: true,
      color: '#5ca4a9'
    }
  };

  const UPGRADES = [
    {
      id: 'pumps',
      name: 'Rychlé stojany',
      icon: '⛽',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Zrychlí tankování o +30 % za úroveň. Od úrovně 2 odemkne 3. stojan!'
    },
    {
      id: 'coffee',
      name: 'Voňavý kávovar',
      icon: '☕',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Vaří kávu o +30 % rychleji a zvýší cenu šálku o +5 Kč za úroveň.'
    },
    {
      id: 'grill',
      name: 'Gril a pekárna',
      icon: '🌭',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Připraví párky a pečivo o +30 % rychleji a přidá +6 Kč k ceně.'
    },
    {
      id: 'wash',
      name: 'Mycí sada a limonády',
      icon: '🧽',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Zrychlí mytí oken o +30 %, přidá +6 Kč za mytí a +5 Kč za limonádu.'
    },
    {
      id: 'racks',
      name: 'Prostorné regály',
      icon: '🛒',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Zvýší kapacitu prodejních stojanů v obchodě (+2 ks za úroveň) a přidá +5 Kč za každý prodaný kus ze stojanu.'
    },
    {
      id: 'decor',
      name: 'Útulná výzdoba',
      icon: '🌸',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Přidá truhlíky s květinami a světýlka. +25 % trpělivosti a +20 % spropitné.'
    },
    {
      id: 'shoes',
      name: 'Pohodlné tenisky',
      icon: '👟',
      maxLevel: 4,
      costs: [80, 160, 280, 450],
      description: 'Chůze je o +22 % rychlejší. Od úrovně 2 uneseš 3 věci najednou!'
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
      hireCost: 140,
      upgradeCosts: [200, 340],
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
      hireCost: 180,
      upgradeCosts: [240, 380],
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
      hireCost: 160,
      upgradeCosts: [220, 360],
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
      stars: [140, 200, 260],
      orders: ['fuel', 'coffee', 'chips', 'candy', 'carcare'],
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
      stars: [220, 300, 380],
      orders: ['fuel', 'coffee', 'wash', 'drink', 'chips', 'candy', 'carcare'],
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
      stars: [300, 410, 500],
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
      stars: [400, 540, 660],
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
      stars: [520, 680, 820],
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
      stars: [650, 840, 1020],
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
      stars: [800, 1050, 1280],
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
      stars: [1000, 1300, 1600],
      orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
      carChance: 0.52,
      multiChance: 0.76,
      spillChance: 0.24
    }
  ];

  // Logical scene dimensions: 1260 x 650
  const STATIONS = {
    pump_0: {
      id: 'pump_0',
      type: 'pump',
      pumpIndex: 0,
      label: 'Stojan 1',
      icon: '⛽',
      x: 100,
      y: 270,
      walkX: 146,
      walkY: 312,
      carX: 95,
      carY: 408,
      radius: 44
    },
    pump_1: {
      id: 'pump_1',
      type: 'pump',
      pumpIndex: 1,
      label: 'Stojan 2',
      icon: '⛽',
      x: 260,
      y: 270,
      walkX: 306,
      walkY: 312,
      carX: 255,
      carY: 408,
      radius: 44
    },
    pump_2: {
      id: 'pump_2',
      type: 'pump',
      pumpIndex: 2,
      label: 'Stojan 3',
      icon: '⛽',
      x: 420,
      y: 270,
      walkX: 466,
      walkY: 312,
      carX: 415,
      carY: 408,
      radius: 44
    },
    bucket: {
      id: 'bucket',
      type: 'prep',
      itemId: 'wash',
      label: 'Mytí oken',
      icon: '🧽',
      x: 478,
      y: 205,
      walkX: 478,
      walkY: 256,
      radius: 36
    },
    coffee: {
      id: 'coffee',
      type: 'prep',
      itemId: 'coffee',
      label: 'Kávovar',
      icon: '☕',
      x: 585,
      y: 195,
      walkX: 585,
      walkY: 244,
      radius: 40
    },
    grill: {
      id: 'grill',
      type: 'prep',
      itemId: 'snack',
      label: 'Gril & Pečivo',
      icon: '🌭',
      x: 705,
      y: 195,
      walkX: 705,
      walkY: 244,
      radius: 40
    },
    fridge: {
      id: 'fridge',
      type: 'prep',
      itemId: 'drink',
      label: 'Limonády',
      icon: '🧃',
      x: 825,
      y: 195,
      walkX: 825,
      walkY: 244,
      radius: 40
    },
    trash: {
      id: 'trash',
      type: 'trash',
      label: 'Koš',
      icon: '🗑️',
      x: 940,
      y: 195,
      walkX: 940,
      walkY: 244,
      radius: 34
    },
    register: {
      id: 'register',
      type: 'register',
      label: 'Pokladna',
      icon: '📠',
      x: 625,
      y: 280,
      walkX: 625,
      walkY: 246,
      customerX: 625,
      customerY: 332,
      radius: 44
    },
    storage: {
      id: 'storage',
      type: 'prep',
      itemId: 'crate',
      label: 'Sklad zboží',
      icon: '📦',
      x: 1165,
      y: 215,
      walkX: 1155,
      walkY: 262,
      radius: 42
    },
    broom: {
      id: 'broom',
      type: 'broom',
      label: 'Úklid',
      icon: '🧹',
      x: 1165,
      y: 318,
      walkX: 1155,
      walkY: 350,
      radius: 34
    }
  };

  const RACKS = {
    rack_snacks: {
      id: 'rack_snacks',
      itemId: 'chips',
      label: 'Stojan: Křupky',
      icon: '🥨',
      x: 680,
      y: 412,
      walkX: 680,
      walkY: 374,
      custX: 680,
      custY: 452,
      radius: 42
    },
    rack_sweets: {
      id: 'rack_sweets',
      itemId: 'candy',
      label: 'Stojan: Sladkosti',
      icon: '🍫',
      x: 835,
      y: 412,
      walkX: 835,
      walkY: 374,
      custX: 835,
      custY: 452,
      radius: 42
    },
    rack_auto: {
      id: 'rack_auto',
      itemId: 'carcare',
      label: 'Stojan: Autodrogerie',
      icon: '🧴',
      x: 990,
      y: 412,
      walkX: 990,
      walkY: 374,
      custX: 990,
      custY: 452,
      radius: 42
    }
  };

  const SHOP_SPOTS = [
    { id: 0, x: 730, y: 332, serveX: 730, serveY: 246 },
    { id: 1, x: 815, y: 332, serveX: 815, serveY: 246 },
    { id: 2, x: 900, y: 332, serveX: 900, serveY: 246 },
    { id: 3, x: 985, y: 332, serveX: 985, serveY: 246 }
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
