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
    air: {
      id: 'air',
      name: 'Dofukování aut',
      icon: '💨',
      basePrice: 3,
      prepTime: 1.8,
      stationId: 'air',
      color: '#f4a261'
    },
    vacuum: {
      id: 'vacuum',
      name: 'Vysavač',
      icon: '🌀',
      basePrice: 4,
      prepTime: 2.2,
      stationId: 'vacuum',
      color: '#8e6bbf'
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
    supply_coffee: {
      id: 'supply_coffee',
      name: 'Zásoba kávy',
      icon: '🫘',
      basePrice: 0,
      prepTime: 1.2,
      stationId: 'storage',
      machineId: 'coffee',
      isSupply: true,
      color: '#6f4e37'
    },
    supply_snack: {
      id: 'supply_snack',
      name: 'Pečivo & párky',
      icon: '🥐',
      basePrice: 0,
      prepTime: 1.2,
      stationId: 'storage',
      machineId: 'grill',
      isSupply: true,
      color: '#d98a3c'
    },
    supply_drink: {
      id: 'supply_drink',
      name: 'Zásoba limonády',
      icon: '🍾',
      basePrice: 0,
      prepTime: 1.2,
      stationId: 'storage',
      machineId: 'fridge',
      isSupply: true,
      color: '#5ca4a9'
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
      maxLevel: 4,
      costs: [20, 40, 60],
      description: 'Postaví na nádvoří další tankovací stojany pro auta (až 3, ve velkém centru až 4), takže může tankovat více aut najednou.'
    },
    {
      id: 'wash_unlock',
      name: 'Stanoviště: Mytí oken',
      icon: '🧽',
      maxLevel: 2,
      costs: [18],
      description: 'Otevře u stojanů kbelík se stěrkou (🧽). Řidiči si k tankování začnou přát i umytí čelního skla.'
    },
    {
      id: 'air_unlock',
      name: 'Stanoviště: Dofukování aut',
      icon: '💨',
      maxLevel: 2,
      costs: [25],
      description: 'Otevře oranžový kompresor s parkovacím stáním pro dofukování pneumatik (za 3 Kč).'
    },
    {
      id: 'vacuum_unlock',
      name: 'Stanoviště: Vysavač',
      icon: '🌀',
      maxLevel: 2,
      costs: [30],
      description: 'Otevře fialový vysavač s parkovacím stáním pro vysávání interiéru aut (za 4 Kč).'
    },
    {
      id: 'rack_sweets_unlock',
      name: '2. Regál: Sladkosti',
      icon: '🍫',
      maxLevel: 2,
      costs: [20],
      description: 'Postaví v obchodě druhý prodejní regál s čokoládou a oplatkami (🍫 za 4 Kč).'
    },
    {
      id: 'fridge_unlock',
      name: 'Chladnička s limonádou',
      icon: '🧃',
      maxLevel: 2,
      costs: [22],
      description: 'Postaví za pult chladničku na čepovanou domácí limonádu (🧃 za 3 Kč).'
    },
    {
      id: 'grill_unlock',
      name: 'Gril & Pečivo',
      icon: '🌭',
      maxLevel: 2,
      costs: [30],
      description: 'Postaví za pult rozpálený gril na párky v rohlíku a croissanty (🌭 za 5 Kč).'
    },
    {
      id: 'rack_auto_unlock',
      name: '3. Regál: Autodrogerie',
      icon: '🧴',
      maxLevel: 2,
      costs: [34],
      description: 'Postaví v obchodě třetí prodejní regál s autokosmetikou (🧴 za 5 Kč).'
    },
    {
      id: 'pumps',
      name: 'Rychlost tankování',
      icon: '⛽',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zrychlí tankování paliva o +30 % za úroveň.'
    },
    {
      id: 'pumps_price',
      name: 'Prémiové palivo (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší prodejní cenu paliva o +1 Kč za úroveň.'
    },
    {
      id: 'coffee',
      name: 'Rychlost kávovaru',
      icon: '☕',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Vaří kávu o +30 % rychleji za úroveň.'
    },
    {
      id: 'coffee_price',
      name: 'Výběrová káva (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší cenu šálku kávy o +1 Kč za úroveň.'
    },
    {
      id: 'grill',
      name: 'Rychlost grilu a pekárny',
      icon: '🌭',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Připraví párky a pečivo o +30 % rychleji za úroveň.'
    },
    {
      id: 'grill_price',
      name: 'Farmářské suroviny (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší cenu občerstvení z grilu o +1 Kč za úroveň.'
    },
    {
      id: 'wash',
      name: 'Rychlost mytí oken',
      icon: '🧽',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zrychlí mytí čelních skel o +30 % za úroveň.'
    },
    {
      id: 'wash_price',
      name: 'Lešticí pěna (Cena mytí)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší odměnu za umytí oken o +1 Kč za úroveň.'
    },
    {
      id: 'air',
      name: 'Rychlost dofukování aut',
      icon: '💨',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zrychlí dofukování pneumatik o +30 % za úroveň.'
    },
    {
      id: 'air_price',
      name: 'Dusík do pneu (Cena dofukování)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší odměnu za dofukování pneumatik o +1 Kč za úroveň.'
    },
    {
      id: 'vacuum',
      name: 'Výkon vysavače',
      icon: '🌀',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zrychlí vysávání interiéru aut o +30 % za úroveň.'
    },
    {
      id: 'vacuum_price',
      name: 'Hloubkové vysávání (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší odměnu za vysávání interiéru o +1 Kč za úroveň.'
    },
    {
      id: 'drink_speed',
      name: 'Rychlost čepování limonád',
      icon: '🧃',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zrychlí přípravu domácí limonády o +30 % za úroveň.'
    },
    {
      id: 'drink_price',
      name: 'Ovocný sirup (Cena limonády)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší cenu limonády o +1 Kč za úroveň.'
    },
    {
      id: 'racks',
      name: 'Kapacita regálů',
      icon: '🛒',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Zvýší kapacitu každého prodejního stojanu v obchodě o +2 ks za úroveň.'
    },
    {
      id: 'racks_price',
      name: 'Lepší sortiment regálů (Cena)',
      icon: '💰',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší cenu každého prodaného kusu z regálu o +1 Kč za úroveň.'
    },
    {
      id: 'decor',
      name: 'Útulná výzdoba (Trpělivost)',
      icon: '🌸',
      maxLevel: 4,
      costs: [14, 30, 64],
      description: 'Přidá květiny a světýlka. Zákazníci jsou o +25 % trpělivější za úroveň.'
    },
    {
      id: 'decor_tips',
      name: 'Milá obsluha (Spropitné)',
      icon: '💝',
      maxLevel: 4,
      costs: [16, 35, 68],
      description: 'Zvýší spropitné od spokojených zákazníků o +15 % za úroveň.'
    },
    {
      id: 'shoes',
      name: 'Pohodlné tenisky (Rychlost)',
      icon: '👟',
      maxLevel: 2,
      costs: [230],
      permanent: true,
      description: 'Trvalé vylepšení na celou hru (stačí koupit jednou): chůze obsluhy je natrvalo o +45 % rychlejší napříč všemi benzínkami.'
    },
    {
      id: 'carry',
      name: 'Větší tác (Nosnost rukou)',
      icon: '🎒',
      maxLevel: 3,
      costs: [40, 90],
      permanent: true,
      description: 'Trvalé vylepšení na celou hru: uneseš v rukou více věcí najednou (+1 kus za úroveň, až 4 věci) i při koupi větší benzínky.'
    }
  ];

  const STAFF_WAGE_CONFIG = {
    min: 0,
    max: 42,
    step: 7,
    defaultWage: 14
  };

  const STAFF = [
    {
      id: 'tonik',
      name: 'Toník – Čerpadlář',
      shortName: 'Toník',
      icon: '🧑‍🔧',
      color: '#4e79a7',
      hatColor: '#2d4d6e',
      hireCost: 22,
      description: 'Sám dochází k přijíždějícím autům, tankuje palivo (⛽), myje skla (🧽), dofukuje pneu a vysává auta.'
    },
    {
      id: 'anicka',
      name: 'Anička – Baristka',
      shortName: 'Anička',
      icon: '👩‍🍳',
      color: '#d4746b',
      hatColor: '#b5554c',
      hireCost: 30,
      description: 'Připravuje kávu (☕), občerstvení (🌭) i limonády (🧃) a nosí je zákazníkům.'
    },
    {
      id: 'kuba',
      name: 'Kuba – Pokladní a skladník',
      shortName: 'Kuba',
      icon: '🧔',
      color: '#6b9a6f',
      hatColor: '#48704b',
      hireCost: 26,
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
        heavyPumpIndices: [],
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock'],
        allowedStaff: ['tonik', 'kuba'],
        maxUpgradeLevel: 2,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: '1. den',
          subtitle: 'Klidný rozjezd na okraji malého města',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 11,
          spawnInterval: 10.2,
          patienceBase: 48,
          stars: [44, 60, 72],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.2,
          spillChance: 0.08
        },
        {
          id: 2,
          name: '2. den',
          subtitle: 'Řidiči si rádi umyjí sklo a vezmou něco malého',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 13,
          spawnInterval: 9.8,
          patienceBase: 47,
          stars: [64, 84, 98],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 3,
          name: '3. den',
          subtitle: 'Výletníci míří do lesa na svačinu',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 15,
          spawnInterval: 9.4,
          patienceBase: 46,
          stars: [88, 116, 136],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.3,
          spillChance: 0.12
        },
        {
          id: 4,
          name: '4. den',
          subtitle: 'Teplý den láká na studenou limonádu',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 17,
          spawnInterval: 9.0,
          patienceBase: 45,
          stars: [106, 138, 164],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.35,
          spillChance: 0.12
        },
        {
          id: 5,
          name: '5. den',
          subtitle: 'Stálí sousedé se stavují pro kávu i sladkosti',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 19,
          spawnInterval: 8.7,
          patienceBase: 44,
          stars: [126, 164, 192],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.4,
          spillChance: 0.14
        },
        {
          id: 6,
          name: '6. den',
          subtitle: 'Podvečerní provoz kolem vinic',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 21,
          spawnInterval: 8.4,
          patienceBase: 43,
          stars: [144, 192, 224],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.45,
          spillChance: 0.15
        },
        {
          id: 7,
          name: '7. den',
          subtitle: 'První větší kolona na výjezdu z městečka',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 23,
          spawnInterval: 8.1,
          patienceBase: 42,
          stars: [156, 208, 242],
          orders: ['fuel', 'coffee', 'wash', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.5,
          spillChance: 0.16
        },
        {
          id: 8,
          name: '8. den',
          subtitle: 'Závěrečná směna v malém městě — šance našetřit na větší!',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 25,
          spawnInterval: 7.8,
          patienceBase: 41,
          stars: [176, 235, 272],
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
      subtitle: 'Rušná městská benzínka s grilem, dofukováním, vysavačem a 3 stojany',
      icon: '🏙️',
      x: 440,
      y: 205,
      theme: 'orchard',
      unlockCost: 420,
      truckChance: 0,
      busChance: 0,
      limits: {
        maxPumps: 3,
        hasHeavyPump: false,
        heavyPumpIndices: [],
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'air_unlock', 'vacuum_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxUpgradeLevel: 3,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: '1. den',
          subtitle: 'Začínáš v novém větším městě — postupně znovu vybuduj pumpu',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 15,
          spawnInterval: 9.6,
          patienceBase: 47,
          stars: [60, 80, 96],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 2,
          name: '2. den',
          subtitle: 'Do práce spěchají řidiči pro kávu, párky i dofoukání kol',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 18,
          spawnInterval: 9.2,
          patienceBase: 45,
          stars: [96, 130, 155],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.32,
          spillChance: 0.12
        },
        {
          id: 3,
          name: '3. den',
          subtitle: 'Plný obchod, nová vůně z grilu a vysavač pro auta',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 21,
          spawnInterval: 8.8,
          patienceBase: 44,
          stars: [145, 194, 228],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.46,
          multiChance: 0.38,
          spillChance: 0.14
        },
        {
          id: 4,
          name: '4. den',
          subtitle: 'Stále více aut u všech tří stojanů',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 24,
          spawnInterval: 8.4,
          patienceBase: 42,
          stars: [200, 265, 314],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.45,
          spillChance: 0.16
        },
        {
          id: 5,
          name: '5. den',
          subtitle: 'Káva, bistro, pneuservis i 3 regály jedou naplno',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 26,
          spawnInterval: 8.1,
          patienceBase: 41,
          stars: [238, 318, 375],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.48,
          multiChance: 0.52,
          spillChance: 0.18
        },
        {
          id: 6,
          name: '6. den',
          subtitle: 'Dodávky jezdí pro palivo, vysavač i autokosmetiku',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 29,
          spawnInterval: 7.8,
          patienceBase: 40,
          stars: [282, 378, 445],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.5,
          multiChance: 0.58,
          spillChance: 0.2
        },
        {
          id: 7,
          name: '7. den',
          subtitle: 'Světýlka výzdoby lákají unavené řidiče',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 32,
          spawnInterval: 7.5,
          patienceBase: 39,
          stars: [326, 436, 512],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.64,
          spillChance: 0.22
        },
        {
          id: 8,
          name: '8. den',
          subtitle: 'Závěrečná městská směna před přesunem na hlavní tah',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 35,
          spawnInterval: 7.2,
          patienceBase: 38,
          stars: [370, 496, 585],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.7,
          spillChance: 0.24
        }
      ]
    },
    {
      id: 3,
      name: 'Mimoměstský tah',
      subtitle: 'Velký motorest se stojanem pro kamiony 🚛, vysavačem, dofukováním a 3 osobními stojany',
      icon: '🚛',
      x: 730,
      y: 365,
      theme: 'mountain',
      unlockCost: 730,
      truckChance: 0.34,
      busChance: 0,
      limits: {
        maxPumps: 3,
        hasHeavyPump: true,
        heavyPumpIndices: [3],
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'air_unlock', 'vacuum_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxUpgradeLevel: 3,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: '1. den',
          subtitle: 'Na hlavní silnici přijíždějí první velké kamiony 🚛',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 17,
          spawnInterval: 9.4,
          patienceBase: 47,
          stars: [88, 116, 136],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.28,
          spillChance: 0.1
        },
        {
          id: 2,
          name: '2. den',
          subtitle: 'Kamiony mají velké nádrže a platí dvojnásobek za palivo',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 20,
          spawnInterval: 9.0,
          patienceBase: 45,
          stars: [132, 174, 206],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.35,
          spillChance: 0.12
        },
        {
          id: 3,
          name: '3. den',
          subtitle: 'Řidiči kamionů i osobáků využívají kompletní servis na dvoře',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 23,
          spawnInterval: 8.6,
          patienceBase: 44,
          stars: [192, 254, 300],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.42,
          spillChance: 0.14
        },
        {
          id: 4,
          name: '4. den',
          subtitle: 'Zkušený tým zvládá i plné parkoviště tiráků',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 26,
          spawnInterval: 8.2,
          patienceBase: 42,
          stars: [256, 342, 402],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.48,
          spillChance: 0.16
        },
        {
          id: 5,
          name: '5. den',
          subtitle: 'Vysoký provoz u stojanů, kompresoru i pokladny',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 29,
          spawnInterval: 7.9,
          patienceBase: 41,
          stars: [310, 412, 484],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.55,
          multiChance: 0.55,
          spillChance: 0.18
        },
        {
          id: 6,
          name: '6. den',
          subtitle: 'Dálkové trasy vyžadují rychlé doplňování regálů',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 32,
          spawnInterval: 7.6,
          patienceBase: 40,
          stars: [358, 478, 564],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.62,
          spillChance: 0.2
        },
        {
          id: 7,
          name: '7. den',
          subtitle: 'Špičková souhra obsluhy a mistrů v týmu',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 35,
          spawnInterval: 7.3,
          patienceBase: 39,
          stars: [408, 546, 644],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.68,
          spillChance: 0.22
        },
        {
          id: 8,
          name: '8. den',
          subtitle: 'Velká zkouška před koupí dálničního megacentra',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 39,
          spawnInterval: 7.0,
          patienceBase: 38,
          stars: [452, 605, 710],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
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
      unlockCost: 1050,
      truckChance: 0.3,
      busChance: 0.22,
      limits: {
        maxPumps: 4,
        hasHeavyPump: true,
        heavyPumpIndices: [4, 5],
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'air_unlock', 'vacuum_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock'],
        allowedStaff: ['tonik', 'anicka', 'kuba'],
        maxUpgradeLevel: 4,
        maxCarryLevel: 3
      },
      levels: [
        {
          id: 1,
          name: '1. den',
          subtitle: 'Nové dálniční centrum s kamiony 🚛 i zájezdovými autobusy 🚌',
          x: 120,
          y: 410,
          theme: 'meadow',
          customers: 14,
          spawnInterval: 9.4,
          patienceBase: 47,
          stars: [68, 90, 106],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.25,
          spillChance: 0.1
        },
        {
          id: 2,
          name: '2. den',
          subtitle: 'Autobusy nakupují palivo i občerstvení pro celou posádku',
          x: 255,
          y: 290,
          theme: 'orchard',
          customers: 17,
          spawnInterval: 9.0,
          patienceBase: 45,
          stars: [110, 148, 174],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.32,
          spillChance: 0.12
        },
        {
          id: 3,
          name: '3. den',
          subtitle: 'Všech 4 úrovní vylepšení odemyká maximální výkon',
          x: 380,
          y: 400,
          theme: 'forest',
          customers: 21,
          spawnInterval: 8.6,
          patienceBase: 43,
          stars: [162, 218, 258],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.52,
          multiChance: 0.4,
          spillChance: 0.14
        },
        {
          id: 4,
          name: '4. den',
          subtitle: 'Letní prázdninové proudy turistů a tiráků',
          x: 515,
          y: 250,
          theme: 'lake',
          customers: 24,
          spawnInterval: 8.2,
          patienceBase: 42,
          stars: [226, 302, 356],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.48,
          spillChance: 0.16
        },
        {
          id: 5,
          name: '5. den',
          subtitle: 'Kompletně vybavené bistro, servis aut i prodejna jedou na plné obrátky',
          x: 650,
          y: 370,
          theme: 'village',
          customers: 28,
          spawnInterval: 7.9,
          patienceBase: 41,
          stars: [294, 392, 462],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.54,
          multiChance: 0.56,
          spillChance: 0.18
        },
        {
          id: 6,
          name: '6. den',
          subtitle: 'Kolony autobusů, kamionů a rodinných vozů',
          x: 775,
          y: 220,
          theme: 'vineyard',
          customers: 31,
          spawnInterval: 7.6,
          patienceBase: 39,
          stars: [372, 498, 588],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.55,
          multiChance: 0.64,
          spillChance: 0.2
        },
        {
          id: 7,
          name: '7. den',
          subtitle: 'Poslední krok před korunovací nejlepší benzínky v zemi',
          x: 895,
          y: 340,
          theme: 'mountain',
          customers: 35,
          spawnInterval: 7.2,
          patienceBase: 38,
          stars: [488, 652, 770],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
          carChance: 0.56,
          multiChance: 0.7,
          spillChance: 0.22
        },
        {
          id: 8,
          name: '8. den',
          subtitle: 'Vrchol celého dálničního impéria — obří dálniční centrum!',
          x: 1010,
          y: 185,
          theme: 'seaside',
          customers: 40,
          spawnInterval: 6.9,
          patienceBase: 37,
          stars: [585, 780, 924],
          orders: ['fuel', 'coffee', 'wash', 'air', 'vacuum', 'snack', 'drink', 'chips', 'candy', 'carcare'],
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
    pump_4: {
      id: 'pump_4',
      type: 'pump',
      pumpIndex: 4,
      isHeavyPump: true,
      label: 'Kamiony 1',
      icon: '🚛',
      x: 68,
      y: 194,
      walkX: 122,
      walkY: 280,
      carX: 68,
      carY: 322,
      carAngle: Math.PI / 2,
      radius: 48
    },
    pump_5: {
      id: 'pump_5',
      type: 'pump',
      pumpIndex: 5,
      isHeavyPump: true,
      label: 'Kamiony 2',
      icon: '🚛',
      x: 176,
      y: 194,
      walkX: 224,
      walkY: 280,
      carX: 176,
      carY: 322,
      carAngle: Math.PI / 2,
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
    air: {
      id: 'air',
      type: 'service',
      itemId: 'air',
      label: 'Dofukování aut',
      icon: '💨',
      x: 42,
      y: 456,
      walkX: 98,
      walkY: 424,
      carX: 122,
      carY: 456,
      carAngle: Math.PI,
      radius: 34
    },
    vacuum: {
      id: 'vacuum',
      type: 'service',
      itemId: 'vacuum',
      label: 'Vysavač',
      icon: '🌀',
      x: 42,
      y: 532,
      walkX: 98,
      walkY: 500,
      carX: 122,
      carY: 532,
      carAngle: Math.PI,
      radius: 34
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

  const BASE_FORECOURT_STATIONS = {
    pump_0: Object.assign({}, STATIONS.pump_0),
    pump_1: Object.assign({}, STATIONS.pump_1),
    pump_2: Object.assign({}, STATIONS.pump_2),
    pump_3: Object.assign({}, STATIONS.pump_3),
    pump_4: Object.assign({}, STATIONS.pump_4),
    pump_5: Object.assign({}, STATIONS.pump_5),
    bucket: Object.assign({}, STATIONS.bucket),
    air: Object.assign({}, STATIONS.air),
    vacuum: Object.assign({}, STATIONS.vacuum)
  };

  const STAGE_FORECOURT_OVERRIDES = {
    1: {
      pump_0: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 1',
        x: 228,
        y: 216,
        walkX: 228,
        walkY: 254,
        carX: 184,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 42
      },
      pump_1: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 2',
        x: 436,
        y: 216,
        walkX: 436,
        walkY: 254,
        carX: 392,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 42
      },
      bucket: {
        x: 300,
        y: 216,
        walkX: 300,
        walkY: 254,
        radius: 36
      }
    },
    2: {
      pump_0: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 1',
        x: 212,
        y: 216,
        walkX: 212,
        walkY: 254,
        carX: 166,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      pump_1: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 2',
        x: 350,
        y: 216,
        walkX: 350,
        walkY: 254,
        carX: 304,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      pump_2: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 3',
        x: 488,
        y: 216,
        walkX: 488,
        walkY: 254,
        carX: 442,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      bucket: {
        x: 84,
        y: 216,
        walkX: 84,
        walkY: 254,
        radius: 36
      },
      air: {
        x: 42,
        y: 456,
        walkX: 98,
        walkY: 424,
        carX: 122,
        carY: 456,
        carAngle: Math.PI,
        radius: 34
      },
      vacuum: {
        x: 42,
        y: 532,
        walkX: 98,
        walkY: 500,
        carX: 122,
        carY: 532,
        carAngle: Math.PI,
        radius: 34
      }
    },
    3: {
      pump_0: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 1',
        x: 212,
        y: 216,
        walkX: 212,
        walkY: 254,
        carX: 166,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      pump_1: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 2',
        x: 350,
        y: 216,
        walkX: 350,
        walkY: 254,
        carX: 304,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      pump_2: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 3',
        x: 488,
        y: 216,
        walkX: 488,
        walkY: 254,
        carX: 442,
        carY: 224,
        carAngle: -Math.PI / 2,
        radius: 40
      },
      pump_3: {
        isHeavyPump: true,
        icon: '🚛',
        label: 'Stojan 4',
        x: 52,
        y: 468,
        walkX: 98,
        walkY: 414,
        carX: 152,
        carY: 468,
        carAngle: Math.PI,
        radius: 46
      },
      bucket: {
        x: 84,
        y: 216,
        walkX: 84,
        walkY: 254,
        radius: 36
      },
      air: {
        x: 574,
        y: 416,
        walkX: 518,
        walkY: 386,
        carX: 494,
        carY: 416,
        carAngle: 0,
        radius: 34
      },
      vacuum: {
        x: 574,
        y: 514,
        walkX: 518,
        walkY: 482,
        carX: 494,
        carY: 514,
        carAngle: 0,
        radius: 34
      }
    },
    4: {
      pump_0: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 1',
        x: 532,
        y: 212,
        walkX: 492,
        walkY: 212,
        carX: 446,
        carY: 212,
        carAngle: 0,
        radius: 36
      },
      pump_1: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 2',
        x: 532,
        y: 306,
        walkX: 492,
        walkY: 306,
        carX: 446,
        carY: 306,
        carAngle: 0,
        radius: 36
      },
      pump_2: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 3',
        x: 532,
        y: 400,
        walkX: 492,
        walkY: 400,
        carX: 446,
        carY: 400,
        carAngle: 0,
        radius: 36
      },
      pump_3: {
        isHeavyPump: false,
        icon: '⛽',
        label: 'Stojan 4',
        x: 532,
        y: 494,
        walkX: 492,
        walkY: 494,
        carX: 446,
        carY: 494,
        carAngle: 0,
        radius: 36
      },
      pump_4: {
        isHeavyPump: true,
        icon: '🚛',
        label: 'Kamiony 1',
        x: 84,
        y: 186,
        walkX: 132,
        walkY: 268,
        carX: 84,
        carY: 282,
        carAngle: Math.PI / 2,
        radius: 48
      },
      pump_5: {
        isHeavyPump: true,
        icon: '🚛',
        label: 'Kamiony 2',
        x: 180,
        y: 186,
        walkX: 226,
        walkY: 268,
        carX: 180,
        carY: 282,
        carAngle: Math.PI / 2,
        radius: 48
      },
      bucket: {
        x: 582,
        y: 353,
        walkX: 554,
        walkY: 353,
        radius: 30
      },
      air: {
        x: 34,
        y: 498,
        walkX: 96,
        walkY: 472,
        carX: 108,
        carY: 498,
        carAngle: Math.PI,
        radius: 32
      },
      vacuum: {
        x: 34,
        y: 548,
        walkX: 96,
        walkY: 522,
        carX: 108,
        carY: 548,
        carAngle: Math.PI,
        radius: 32
      }
    }
  };

  const STAGE4_FORECOURT_OVERRIDES = STAGE_FORECOURT_OVERRIDES[4];

  const BISTRO_MACHINES = {
    coffee: {
      id: 'coffee',
      supplyItemId: 'supply_coffee',
      label: 'Kávovar',
      emptyLabel: 'Došla káva!',
      maxStock: 6,
      breakdownChance: 0.16,
      restockTime: 1.55,
      repairTime: 1.9
    },
    grill: {
      id: 'grill',
      supplyItemId: 'supply_snack',
      label: 'Gril & Pečivo',
      emptyLabel: 'Došlo pečivo!',
      maxStock: 6,
      breakdownChance: 0.16,
      restockTime: 1.55,
      repairTime: 1.9
    },
    fridge: {
      id: 'fridge',
      supplyItemId: 'supply_drink',
      label: 'Limonády',
      emptyLabel: 'Došla limonáda!',
      maxStock: 6,
      breakdownChance: 0.16,
      restockTime: 1.55,
      repairTime: 1.9
    }
  };

  window.GAME_DATA = {
    ITEMS,
    BISTRO_MACHINES,
    UPGRADES,
    STAFF_WAGE_CONFIG,
    STAFF,
    THEMES,
    STAGES,
    LEVELS,
    STATIONS,
    BASE_FORECOURT_STATIONS,
    STAGE_FORECOURT_OVERRIDES,
    STAGE4_FORECOURT_OVERRIDES,
    RACKS,
    SHOP_SPOTS
  };
})();
