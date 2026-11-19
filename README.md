# ⛽ Útulná Benzínka – Na cestách

Stylová webová time-management hra v češtině zasazená do prostředí české čerpací stanice a prodejny. Začni u malé lokální pumpy, obsluhuj řidiče i zákazníky u pokladny, rozšiřuj nabídku občerstvení, organizuj vybavení prodejny, najímej zaměstnance a postupně se vypracuj až k rušnému dálničnímu centru.

---

## 🌐 Hraní online (GitHub Pages)

Hra je připravena pro okamžité spuštění přímo v prohlížeči přes **GitHub Pages** (statické hostování ze složky repozitáře bez nutnosti backendu):

🔗 **Odkaz na hru:** `https://hynarmartin.github.io/benzinka/`  

- **Automatické ukládání postupu:** Při hraní přes GitHub Pages se účty a herní postup ukládají lokálně do prohlížeče (`localStorage`).
- **Hra bez registrace:** Hru lze kdykoli spustit také v režimu hosta bez přihlášení.
- **Plná podpora statických souborů:** Součástí balíčku je soubor `.nojekyll` a oddělená klientská logika čistě v HTML5, CSS3 a JavaScriptu (Canvas 2D + Web Audio API).

---

## ✨ Hlavní herní prvky

- **4 hlavní benzínky a 32 herních dnů:**
  1. **Malé město**
  2. **Větší město**
  3. **Mimoměstský tah**
  4. **Dálniční centrum**
  - Každá ze 4 hlavních benzínek nabízí **8 postupných směn (`1. den` – `8. den`)**, vlastní vizuální prostředí, rozšiřující se plochu stanice a stoupající provoz.
- **Samostatná ekonomika každé stanice:** Při postupu a odemknutí další hlavní benzínky začínáš vždy od nuly se samostatným rozpočtem nové pobočky.
- **Osobní auta i těžká doprava (`Stojan 4`):** Od 3. a 4. benzínky obsluhuješ vedle běžných stojanů také vyhrazený **Stojan 4** pro kamiony a autobusy.
- **Chytrá obsluha jedním kliknutím:** Hráč může nést až **2 položky na tácu** najednou. Pokud neseš obě věci, které si zákazník přeje, předáš mu kompletní objednávku jedním kliknutím.
- **Příprava prodejny a rozložení vybavení:** Mezi dny můžeš v přípravném režimu nakupovat nová vylepšení, přesouvat regály i spotřebiče po prodejně a otáčet regály do všech směrů.
- **Najímání a řízení zaměstnanců:** Zaměstnanci samostatně pomáhají s chodem stanice (tankování, obsluha, doplňování a úklid), zobrazují přímo nad sebou **textový ukazatel aktuálního úkolu** a po jeho dokončení se vrací zpět na své domovské stanoviště.
- **Integrované zvukové efekty:** Syntetizované herní zvuky bez externích audio závislostí (`js/audio.js`).

---

## 🕹️ Ovládání

- **Ve hře:** Klikáním vybíráš stanoviště, spotřebiče, regály, sklad, odpadkový koš, mop, stojany i zákazníky a auta k obsluze.
- **V přípravě mezi dny:** Vybíráš vylepšení a rozmísťuješ nebo natáčíš vybavení uvnitř prodejny před startem dalšího dne.

---

## 💻 Lokální spuštění (`server.js`)

Pokud chceš hru spustit lokálně se sdíleným ukládáním uživatelských účtů na disk (`users_data.json`), vyžaduje projekt pouze **Node.js**:

```bash
node server.js
```

Po spuštění otevři v prohlížeči adresu:

```text
http://127.0.0.1:3000
```

> Lokální server obsluhuje statické soubory a poskytuje REST endpointy pro přihlášení, registraci a ukládání postupu. Při nasazení na GitHub Pages není `server.js` potřeba – hra se automaticky přepne do klientského režimu s `localStorage`.

---

## 📁 Struktura projektu

| Soubor / Složka | Popis |
| :--- | :--- |
| `index.html` | Hlavní HTML dokument, herní plátno, modální okna a obrazovky UI |
| `styles.css` | Kompletní stylování rozhraní, mapy stanic, obchodů a responzivních prvků |
| `js/data.js` | Konfigurace zboží, stojanů, regálů, vylepšení, zaměstnanců a všech 4 × 8 dnů |
| `js/game.js` | Hlavní herní smyčka, ekonomika, obsluha zákazníků, AI zaměstnanců, přípravný režim a ukládání |
| `js/renderer.js` | Vykreslování celé benzínky, vozidel, postav, ukazatelů úkolů a efektů na Canvas |
| `js/audio.js` | Procedurální Web Audio efekty pro herní události |
| `server.js` | Volitelný lokální HTTP server v Node.js pro lokální testování a ukládání účtů |
| `.nojekyll` | Zajišťuje přímé nasazení na GitHub Pages bez zpracování přes Jekyll |
| `.gitignore` | Vylučuje lokální data účtů (`users_data.json`) a systémové soubory |
