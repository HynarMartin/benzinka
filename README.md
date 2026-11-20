# ⛽ Útulná Benzínka – Na cestách

Česká strategická time-management hra pro prohlížeč zasazená do prostředí postupně se rozvíjející čerpací stanice a prodejny. Začni s malou venkovskou pumpou, obsluhuj osobní auta, kamiony i autobusy, rozšiřuj bistro a prodejnu, řiď svůj tým zaměstnanců a vybuduj až velké dálniční centrum.

---

## 🌐 Hrát online (GitHub Pages)

Hra je připravena pro spuštění čistě na straně prohlížeče bez nutnosti backendu přes **GitHub Pages**:

🔗 **Živá verze:** https://hynarmartin.github.io/benzinka/

- **Okamžité uložení postupu:** V prohlížečové verzi se účty i rozehraná stanice automaticky ukládají do `localStorage`.
- **Režim hosta:** Hru lze kdykoli vyzkoušet i bez registrace a přihlášení.
- **Čistě statická architektura:** Postaveno na HTML5 Canvas 2D, CSS3, modulárním JavaScriptu a Web Audio API (součástí je i `.nojekyll`).

---

## ✨ Herní mechaniky a obsah

### 🛣️ 4 čerpací stanice a 32 herních dnů
Každá z poboček nabízí **8 dnů (`1. den` – `8. den`)**, vlastní uspořádání nádvoří, bezkolizní dopravu s přednostmi v jízdě a rostoucí provoz:
1. **Malé město** — T-křižovatka se **2 svislými stojany** pro osobní auta a stanovištěm pro mytí oken.
2. **Větší město** — **3 svislé stojany**, mytí oken a vyhrazené zálivy pro **dofukování pneumatik** a **vysavač interiéru**.
3. **Mimoměstský tah** — **3 svislé osobní stojany**, samostatné vodorovné stání pro **kamiony**, mytí oken, dofukování i vysavač.
4. **Dálniční centrum** — Dvouproudý areál se **4 osobními stojany**, **2 terminály pro kamiony a zájezdové autobusy**, mycím koutkem, dofukováním a vysavačem.

### ⛽ Doprava, servis a bistro
- **Servisní okruh vozidel:** Auta přijíždějící na dofukování nebo vysavač mohou po dokončení servisu plynule přejet ke stojanu pro palivo či mytí oken a teprve poté jdou řidiči zaplatit do obchodu.
- **Těžká doprava (kamiony & autobusy):** Tankování kamionů a autobusů trvá **3× déle** než u osobních aut a přináší vyšší tržby z paliva i větších nákupů v prodejně.
- **Zásoby a poruchy strojů:**
  - Vnitřní stroje (**Kávovar**, **Gril & Pečivo**, **Limonády**) mají omezenou zásobu surovin (`6` porcí). Jakmile dojdou, musí je ze skladu doplnit **hráč** nebo **baristka Anička** (doplnění surovin trvá déle než doplnění regálů).
  - Během směny se může s nízkou pravděpodobností některý ze strojů **porouchat** — opravu (`🔧`) musí vždy provést osobně **hráč**.

### 👥 Tým zaměstnanců a přímé rozkazy
Najmout můžeš až tři specialisty s vlastním pracovním prostorem a chytrým vyhýbáním překážkám:
- **Toník (Čerpadlář):** Tankuje palivo (`⛽`), myje okna (`🧽`), dofukuje pneumatiky a obsluhuje vysavač.
- **Anička (Baristka):** Připravuje kávu (`☕`), občerstvení z grilu (`🌭`) a limonády (`🧃`), nosí je zákazníkům a ze skladu doplňuje prázdné bistro stroje.
- **Kuba (Pokladní & skladník):** Markuje u pokladny (`📠`), doplňuje prázdné prodejní regály (`📦`) a jedním tahem uklízí všechny louže venku koštětem (`🧹`).

Další možnosti řízení týmu:
- **Okamžité přikázání práce:** Klikni během směny na vybraného zaměstnance a poté na úkol z jeho popisu práce (např. *Kuba → regál*, *Anička → kávovar pro doplnění* nebo *Toník → auto*) — okamžitě přeruší stávající činnost a vyrazí úkol splnit.
- **Výplaty posuvníkem (`0–42 Kč/směnu`):** Tempo práce i chůze zaměstnanců řídíš posuvníkem denní výplaty (`0 Kč` = zaměstnanec daný den odpočívá). Na konci dne se mzdy aktivních zaměstnanců odečtou od tržeb navýšených o hvězdičkový bonus (`2 ⭐ = ×1,1`, `3 ⭐ = ×1,2`).

### 💼 Ekonomika a trvalé vybavení
- Přechod na větší stanici kupuješ tlačítkem **`Koupit větší pumpu za všechny peníze`** (nová pobočka začíná s rozpočtem `0 Kč`).
- Vybavení jako **Pohodlné tenisky** (jednorázový trvalý nákup rychlosti chůze) a **Větší tác** (kapacita rukou) zůstávají hráči **natrvalo napříč celou hrou**.

---

## 🕹️ Ovládání

| Režim | Ovládání |
| :--- | :--- |
| **Směna (hraní)** | **Levý klik:** Ovládání hráče (stanoviště, stroje, regály, sklad, auta, zákazníci, pokladna, úklid).<br>**Klik na zaměstnance → cíl:** Přímý příkaz zaměstnanci k okamžitému vykonání daného úkolu.<br>**Pravý klik / `Esc`:** Zrušení výběru zaměstnance nebo naplánované trasy.<br>**`Mezerník` / `P`:** Pozastavení hry. |
| **Příprava mezi dny** | Klikáním na objekty kupuješ lokální či trvalá vylepšení, upravuješ výplaty týmu a rozmísťuješ / otáčíš regály i spotřebiče (`R` pro otočení). |

---

## 💻 Lokální spuštění (`server.js`)

Projekt nemá žádné externí npm závislosti — pro lokální běh se sdíleným ukládáním účtů na disk (`users_data.json`) stačí nainstalovaný **Node.js**:

```bash
node server.js
```

Poté v prohlížeči otevři:

```text
http://127.0.0.1:3000
```

> Lokální server zajišťuje statické soubory a REST API pro registraci, přihlášení a ukládání postupu. Při hostování na GitHub Pages není `server.js` potřeba a ukládání automaticky běží přes `localStorage`.

---

## 📁 Struktura projektu

| Soubor / Složka | Popis |
| :--- | :--- |
| `index.html` | Hlavní HTML dokument, herní Canvas, HUD lišty a modální okna (přihlášení, obchod, nastavení, výsledky) |
| `styles.css` | Kompletní stylování UI, mapy poboček, obchodu a responzivního rozvržení |
| `js/data.js` | Definice zboží, strojů, stojanů, regálů, vylepšení, týmu, ekonomiky a všech `4 × 8` dnů |
| `js/game.js` | Herní smyčka, řízení dopravy, AI a rozkazy zaměstnanců, poruchy/zásoby, pathfinding, ekonomika a ukládání |
| `js/renderer.js` | Vykreslování 4 typů nádvoří a prodejny, vozidel, animovaných postav, ukazatelů úkolů a stavových štítků |
| `js/audio.js` | Procedurálně syntetizované zvukové efekty a ambientní hudba přes Web Audio API |
| `server.js` | Volitelný HTTP server v Node.js pro lokální hraní a správu uživatelských účtů |
| `.nojekyll` | Vypíná zpracování přes Jekyll při nasazení na GitHub Pages |
| `.gitignore` | Vylučuje lokální databázi účtů (`users_data.json`) a dočasné soubory |
| `benzinka/` | Zrcadlová složka připravená pro přímé publikování na GitHub Pages |
