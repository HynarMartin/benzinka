# ⛽ Útulná Benzínka – Na cestách

Stylová webová time-management hra v češtině zasazená do prostředí české čerpací stanice a prodejny. Začni u malé lokální pumpy, obsluhuj řidiče i zákazníky u pokladny, rozšiřuj nabídku občerstvení, organizuj vybavení prodejny, najímej zaměstnance a postupně se vypracuj až k rušnému dálničnímu centru.

---

## 🌐 Hraní online (GitHub Pages)

Hra je připravena pro okamžité spuštění přímo v prohlížeči přes **GitHub Pages** (statické hostování ze složky repozitáře bez nutnosti backendu):

🔗 **Odkaz na hru:** `https://<tvoje-jmeno>.github.io/benzinka/`  
*(V adrese nahraď `<tvoje-jmeno>` svým uživatelským jménem na GitHubu podle toho, kam repozitář nahraješ.)*

- **Automatické ukládání postupu:** Při hraní přes GitHub Pages se účty a herní postup ukládají lokálně do prohlížeče (`localStorage`).
- **Hra bez registrace:** Hru lze kdykoli spustit také v režimu hosta bez přihlášení.
- **Plná podpora statických souborů:** Součástí balíčku je soubor `.nojekyll` a oddělená klientská logika čistě v HTML5, CSS3 a JavaScriptu (Canvas 2D + Web Audio API).

---

## ✨ Hlavní herní prvky

- **4 přepracované benzínky (Pumpa 1–4) a 32 herních dnů:**
  1. **Malé město** (T-křižovatka, 2 stojany pro auta, mytí oken)
  2. **Větší město** (T-křižovatka, 3 stojany pro auta, mytí oken, parkovací zálivy pro dofukování pneu a vysavač)
  3. **Mimoměstský tah** (T-křižovatka s vodorovným stáním pro kamiony, 3 osobní stojany, kompletní venkovní servis)
  4. **Dálniční centrum** (dvouproudá příjezdová cesta, 2 terminálová stání pro kamiony/autobusy, 4 stojany pro auta, mytí oken, dofukování aut a vysavač)
  - Každá ze 4 hlavních benzínek nabízí **8 postupných směn (`1. den` – `8. den`)**, vlastní vizuální prostředí a stoupající provoz se správou předností a bezkolizním pohybem vozidel.
- **Samostatná ekonomika každé stanice & trvalé vybavení:** Novou větší stanici kupuješ za všechny naspořené peníze (`Koupit větší pumpu za všechny peníze`), takže rozpočet i vybavení nové pobočky začínají od `0 Kč`, ale **Pohodlné tenisky** (jednorázový nákup na celou hru) a **Větší tác** ti zůstávají natrvalo napříč všemi benzínkami.
- **Výplaty zaměstnanců posuvníkem a bilance dne:** Každý najatý zaměstnanec má posuvník denní výplaty (`0–30 Kč`, `0 Kč` = odpočívá, vyšší výplata = rychlejší obsluha). Hvězdy směny se počítají z hrubých tržeb, za `2 ⭐` získáš bonus `×1,1` a za `3 ⭐` `×1,2`; na konci dne se odečtou celkové výplaty zaměstnanců a zobrazí se kompletní přehled dne.
- **Servis pro auta i těžkou dopravu:** Kromě tankování (`⛽`) a mytí skel (`🧽`) od 2. benzínky nabízí stanice také **dofukování pneumatik** a **vysavač interiéru** s vlastními parkovacími místy (pokud chce řidič navíc i natankovat, po obsluze přejede ke stojanu a teprve odtud jde zaplatit).
- **Chytrá obsluha a chytrý úklid:** Hráč i zaměstnanci samostatně pomáhají s chodem stanice; při úklidu s koštětem (`🧹`) uklidí zaměstnanec jedním tahem všechny louže na ploše před jeho odložením a po splnění úkolu se vrátí na své výchozí místo.
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
