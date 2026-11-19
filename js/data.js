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

  const STAGES = [
    {
      id: 1,
      name: 'Malé město',
      subtitle: 'Komorní venkovská benzínka (max. 2 stojany a 2 regály)',
      icon: '🏡',
      x: 165,
      y: 375,
      theme: 'meadow',
      unlockCost: 0,
      truckChance: 0,
      busChance: 0,
      limits: {
        maxPumps: 2,
        hasHeavyPump: false,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock'],
        allowedStaff: ['tonik', 'kuba'],
        maxStaffLevel: 2,
        maxUpgradeLevel: 2,
        maxCarryLevel: 2
      },
      levels: [
        {
          id: 1,
          name: 'Polní rozcestí',
          subtitle: 'Klidný rozjezd na okraji malého města',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 6,
          spawnInterval: 6.2,
          patienceBase: 46,
          stars: [28, 38, 45],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.2,
          spillChance: 0.08
        },
        {
          id: 2,
          name: 'Jabloňový sad',
          subtitle: 'Řidiči si rádi umyjí sklo a vezmou něco malého',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 7,
          spawnInterval: 5.9,
          patienceBase: 45,
          stars: [38, 50, 58],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 3,
          name: 'Lesní samota',
          subtitle: 'Výletníci míří do lesa na svačinu',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 8,
          spawnInterval: 5.6,
          patienceBase: 44,
          stars: [56, 74, 88],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.3,
          spillChance: 0.12
        },
        {
          id: 4,
          name: 'Rybníček u mlýna',
          subtitle: 'Teplý den láká na studenou limonádu',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 9,
          spawnInterval: 5.3,
          patienceBase: 43,
          stars: [65, 86, 100],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.35,
          spillChance: 0.12
        },
        {
          id: 5,
          name: 'Medová náves',
          subtitle: 'Stálí sousedé se stavují pro kávu i sladkosti',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 10,
          spawnInterval: 5.0,
          patienceBase: 42,
          stars: [74, 98, 114],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.4,
          spillChance: 0.14
        },
        {
          id: 6,
          name: 'Starý vinohrad',
          subtitle: 'Podvečerní provoz kolem vinic',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 11,
          spawnInterval: 4.8,
          patienceBase: 41,
          stars: [84, 112, 130],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.45,
          spillChance: 0.15
        },
        {
          id: 7,
          name: 'Podhorská zatáčka',
          subtitle: 'První větší kolona na výjezdu z městečka',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 12,
          spawnInterval: 4.6,
          patienceBase: 40,
          stars: [94, 125, 145],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.5,
          spillChance: 0.16
        },
        {
          id: 8,
          name: 'Okresní pouť',
          subtitle: 'Závěrečná směna v malém městě — šance našetřit na větší!',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 13,
          spawnInterval: 4.4,
          patienceBase: 39,
          stars: [105, 140, 160],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.55,
          spillChance: 0.18
        }
      ]
    },
    {
      id: 2,
      name: 'Větší město',
      subtitle: 'Rušná městská benzínka s grilem a 3 stojany',
      icon: '🏙️',
      x: 440,
      y: 205,
      theme: 'orchard',
      unlockCost: 470,
      truckChance: 0,
      busChance: 0,
      limits: {
        maxPumps: 3,
        hasHeavyPump: false,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxStaffLevel: 2,
        maxUpgradeLevel: 3,
        maxCarryLevel: 2
      },
      levels: [
        {
          id: 1,
          name: 'Městský okruh',
          subtitle: 'Začínáš v novém větším městě — postupně znovu vybuduj pumpu',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 8,
          spawnInterval: 5.8,
          patienceBase: 45,
          stars: [35, 46, 54],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 2,
          name: 'Ranní špička',
          subtitle: 'Do práce spěchají řidiči pro kávu a párky',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 10,
          spawnInterval: 5.4,
          patienceBase: 43,
          stars: [54, 72, 85],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.32,
          spillChance: 0.12
        },
        {
          id: 3,
          name: 'Nákupní zóna',
          subtitle: 'Plný obchod a nová vůně z grilu',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 11,
          spawnInterval: 5.1,
          patienceBase: 42,
          stars: [78, 105, 124],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.46,
          multiChance: 0.38,
          spillChance: 0.14
        },
        {
          id: 4,
          name: 'Nábřežní bulvár',
          subtitle: 'Stále více aut u všech tří stojanů',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 13,
          spawnInterval: 4.8,
          patienceBase: 40,
          stars: [105, 140, 165],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.45,
          spillChance: 0.16
        },
        {
          id: 5,
          name: 'Odpolední kolona',
          subtitle: 'Káva, bistro i 3 regály jedou naplno',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 14,
          spawnInterval: 4.5,
          patienceBase: 39,
          stars: [130, 175, 205],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.52,
          spillChance: 0.18
        },
        {
          id: 6,
          name: 'Průmyslová čtvrť',
          subtitle: 'Dodávky jezdí pro palivo a autokosmetiku',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 16,
          spawnInterval: 4.2,
          patienceBase: 38,
          stars: [152, 204, 240],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.58,
          spillChance: 0.2
        },
        {
          id: 7,
          name: 'Večerní centrum',
          subtitle: 'Světýlka výzdoby lákají unavené řidiče',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 18,
          spawnInterval: 4.0,
          patienceBase: 37,
          stars: [174, 232, 272],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.64,
          spillChance: 0.22
        },
        {
          id: 8,
          name: 'Víkendový tah městem',
          subtitle: 'Závěrečná městská směna před přesunem na hlavní tah',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 20,
          spawnInterval: 3.8,
          patienceBase: 36,
          stars: [195, 260, 305],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.7,
          spillChance: 0.24
        }
      ]
    },
    {
      id: 3,
      name: 'Mimoměstský tah',
      subtitle: 'Velký motorest se stojanem pro kamiony 🚛 a až 3 osobními stojany',
      icon: '🚛',
      x: 730,
      y: 365,
      theme: 'mountain',
      unlockCost: 700,
      truckChance: 0.34,
      busChance: 0,
      limits: {
        maxPumps: 3,
        hasHeavyPump: true,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxStaffLevel: 3,
        maxUpgradeLevel: 3,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: 'Výpadovka z města',
          subtitle: 'Na hlavní silnici přijíždějí první velké kamiony 🚛',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 9,
          spawnInterval: 5.6,
          patienceBase: 45,
          stars: [46, 62, 72],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.28,
          spillChance: 0.1
        },
        {
          id: 2,
          name: 'Sady u hlavní silnice',
          subtitle: 'Kamiony mají velké nádrže a platí dvojnásobek za palivo',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 11,
          spawnInterval: 5.2,
          patienceBase: 43,
          stars: [68, 90, 106],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.35,
          spillChance: 0.12
        },
        {
          id: 3,
          name: 'Kamionový průsmyk',
          subtitle: 'Řidiči kamionů si berou vydatnou svačinu do kabiny',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 13,
          spawnInterval: 4.9,
          patienceBase: 42,
          stars: [105, 140, 165],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.42,
          spillChance: 0.14
        },
        {
          id: 4,
          name: 'Jezerní přehrada',
          subtitle: 'Zkušený tým zvládá i plné parkoviště tiráků',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 15,
          spawnInterval: 4.6,
          patienceBase: 40,
          stars: [140, 186, 218],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.48,
          spillChance: 0.16
        },
        {
          id: 5,
          name: 'Křižovatka dopravců',
          subtitle: 'Vysoký provoz u stojanů i pokladny',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 16,
          spawnInterval: 4.4,
          patienceBase: 39,
          stars: [165, 220, 258],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.55,
          multiChance: 0.55,
          spillChance: 0.18
        },
        {
          id: 6,
          name: 'Tah přes vinice',
          subtitle: 'Dálkové trasy vyžadují rychlé doplňování regálů',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 18,
          spawnInterval: 4.1,
          patienceBase: 38,
          stars: [190, 255, 298],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.62,
          spillChance: 0.2
        },
        {
          id: 7,
          name: 'Horský tranzit',
          subtitle: 'Špičková souhra obsluhy a mistrů v týmu',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 20,
          spawnInterval: 3.9,
          patienceBase: 37,
          stars: [215, 288, 336],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.68,
          spillChance: 0.22
        },
        {
          id: 8,
          name: 'Noční konvoj kamionů',
          subtitle: 'Velká zkouška před koupí dálničního megacentra',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 22,
          spawnInterval: 3.7,
          patienceBase: 36,
          stars: [240, 320, 374],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.58,
          multiChance: 0.74,
          spillChance: 0.24
        }
      ]
    },
    {
      id: 4,
      name: 'Dálniční centrum',
      subtitle: 'Obří dálniční megacentrum s terminálem pro kamiony 🚛 a autobusy 🚌',
      icon: '🛣️',
      x: 980,
      y: 195,
      theme: 'seaside',
      unlockCost: 820,
      truckChance: 0.3,
      busChance: 0.22,
      limits: {
        maxPumps: 3,
        hasHeavyPump: true,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxStaffLevel: 3,
        maxUpgradeLevel: 4,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: 'Nájezd na dálnici',
          subtitle: 'Nové dálniční centrum s kamiony 🚛 i zájezdovými autobusy 🚌',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 7,
          spawnInterval: 5.6,
          patienceBase: 45,
          stars: [34, 46, 55],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 2,
          name: 'Odpočívadlo Jabloň',
          subtitle: 'Autobusy nakupují palivo i občerstvení pro celou posádku',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 9,
          spawnInterval: 5.2,
          patienceBase: 43,
          stars: [56, 75, 88],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.32,
          spillChance: 0.12
        },
        {
          id: 3,
          name: 'Lesní dálniční most',
          subtitle: 'Všech 4 úrovní vylepšení odemyká maximální výkon',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 11,
          spawnInterval: 4.9,
          patienceBase: 41,
          stars: [85, 115, 136],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.4,
          spillChance: 0.14
        },
        {
          id: 4,
          name: 'Zátoka karavanů',
          subtitle: 'Letní prázdninové proudy turistů a tiráků',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 13,
          spawnInterval: 4.6,
          patienceBase: 40,
          stars: [118, 158, 186],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.48,
          spillChance: 0.16
        },
        {
          id: 5,
          name: 'Dálniční křižovatka',
          subtitle: 'Kompletně vybavené bistro i prodejna jedou na plné obrátky',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 15,
          spawnInterval: 4.3,
          patienceBase: 39,
          stars: [155, 208, 246],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.56,
          spillChance: 0.18
        },
        {
          id: 6,
          name: 'Sluneční koridor',
          subtitle: 'Kolony autobusů, kamionů a rodinných vozů',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 17,
          spawnInterval: 4.0,
          patienceBase: 37,
          stars: [195, 260, 308],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.55,
          multiChance: 0.64,
          spillChance: 0.2
        },
        {
          id: 7,
          name: 'Alpský tunel',
          subtitle: 'Poslední krok před korunovací nejlepší benzínky v zemi',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 20,
          spawnInterval: 3.8,
          patienceBase: 36,
          stars: [260, 348, 412],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.7,
          spillChance: 0.22
        },
        {
          id: 8,
          name: 'Velké přímořské finále',
          subtitle: 'Vrchol celého dálničního impéria — obří dálniční centrum!',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 23,
          spawnInterval: 3.5,
          patienceBase: 35,
          stars: [315, 420, 498],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.76,
          spillChance: 0.24
        }
      ]
    }
  ];

  const LEVELS = STAGES[0].levels;

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
      carY: 402,
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
      carY: 402,
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
      carY: 402,
      radius: 46
    },
    pump_3: {
      id: 'pump_3',
      type: 'pump',
      pumpIndex: 3,
      isHeavyPump: true,
      label: 'Stojan 4',
      icon: '🚛',
      x: 130,
      y: 492,
      walkX: 186,
      walkY: 502,
      carX: 335,
      carY: 515,
      radius: 48
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
    STAGES,
    LEVELS,
    STATIONS,
    RACKS,
    SHOP_SPOTS
  };
})();
