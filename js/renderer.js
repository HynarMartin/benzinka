(function () {
  'use strict';

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  class StationRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.width = 1260;
      this.height = 650;
    }

    render(state) {
      const ctx = this.ctx;
      const theme = window.GAME_DATA.THEMES[state.level.theme] || window.GAME_DATA.THEMES.meadow;
      const t = state.time;

      ctx.clearRect(0, 0, this.width, this.height);

      this._drawBackground(ctx, theme, t);
      this._drawForecourtAndShop(ctx, theme, t, state);
      this._drawStations(ctx, t, state);
      this._drawRacks(ctx, t, state);
      this._drawSpills(ctx, t, state);
      this._drawClickQueue(ctx, t, state);

      // Depth-sort cars, customers, and workers by Y coordinate
      const drawables = [];

      state.cars.forEach((car) => {
        drawables.push({ y: car.y + 35, kind: 'car', obj: car });
      });

      state.customers.forEach((cust) => {
        drawables.push({ y: cust.y + 20, kind: 'customer', obj: cust });
      });

      state.workers.forEach((worker) => {
        if (worker.active) {
          drawables.push({ y: worker.y + 22, kind: 'worker', obj: worker });
        }
      });

      drawables.sort((a, b) => a.y - b.y);

      drawables.forEach((item) => {
        if (item.kind === 'car') this._drawCar(ctx, item.obj, t, state);
        else if (item.kind === 'customer') this._drawCustomer(ctx, item.obj, t, state);
        else if (item.kind === 'worker') this._drawWorker(ctx, item.obj, t, state);
      });

      // Draw bubbles and progress overlays on top so they are always legible
      state.cars.forEach((car) => this._drawCarBubble(ctx, car, t));
      state.customers.forEach((cust) => this._drawCustomerBubble(ctx, cust, t));
      state.workers.forEach((worker) => {
        if (worker.active) this._drawWorkerOverlay(ctx, worker, t);
      });

      this._drawParticles(ctx, state.particles);
      this._drawHoverHint(ctx, state);
      if (state.paused) {
        this._drawPauseOverlay(ctx);
      }
    }

    _drawBackground(ctx, theme, t) {
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 210);
      skyGrad.addColorStop(0, theme.skyTop);
      skyGrad.addColorStop(1, theme.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, this.width, 220);

      // Warm sun
      ctx.save();
      ctx.fillStyle = 'rgba(255, 241, 178, 0.55)';
      ctx.beginPath();
      ctx.arc(140, 62, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe594';
      ctx.beginPath();
      ctx.arc(140, 62, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Soft drifting clouds
      for (let i = 0; i < 4; i++) {
        const cx = ((i * 340 + t * (8 + i * 2)) % (this.width + 180)) - 90;
        const cy = 42 + (i % 2) * 28;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.beginPath();
        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
        ctx.arc(cx + 22, cy - 6, 24, 0, Math.PI * 2);
        ctx.arc(cx + 46, cy, 19, 0, Math.PI * 2);
        ctx.fill();
      }

      // Optional mountains
      if (theme.hasMountains) {
        ctx.fillStyle = theme.hillFar;
        ctx.beginPath();
        ctx.moveTo(0, 185);
        ctx.lineTo(140, 82);
        ctx.lineTo(290, 170);
        ctx.lineTo(440, 72);
        ctx.lineTo(610, 178);
        ctx.lineTo(800, 86);
        ctx.lineTo(1020, 180);
        ctx.lineTo(1260, 95);
        ctx.lineTo(1260, 210);
        ctx.lineTo(0, 210);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        [
          [140, 82, 34],
          [440, 72, 38],
          [800, 86, 32]
        ].forEach(([mx, my, mw]) => {
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(mx - mw, my + 28);
          ctx.lineTo(mx - mw * 0.3, my + 20);
          ctx.lineTo(mx, my + 30);
          ctx.lineTo(mx + mw * 0.35, my + 21);
          ctx.lineTo(mx + mw, my + 28);
          ctx.closePath();
          ctx.fill();
        });
      }

      // Rolling hills
      ctx.fillStyle = theme.hillFar;
      ctx.beginPath();
      ctx.moveTo(0, 175);
      ctx.quadraticCurveTo(250, 118, 510, 165);
      ctx.quadraticCurveTo(790, 122, 1050, 162);
      ctx.quadraticCurveTo(1160, 140, 1260, 160);
      ctx.lineTo(1260, 220);
      ctx.lineTo(0, 220);
      ctx.closePath();
      ctx.fill();

      // Optional lake / sea strip
      if (theme.hasWater) {
        ctx.fillStyle = '#8cc2d1';
        ctx.fillRect(0, 154, this.width, 46);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        for (let wx = 40; wx < this.width; wx += 110) {
          const off = Math.sin(t * 2 + wx) * 6;
          ctx.beginPath();
          ctx.moveTo(wx + off, 168);
          ctx.lineTo(wx + 34 + off, 168);
          ctx.stroke();
        }
      }

      // Optional lighthouse
      if (theme.hasLighthouse) {
        ctx.save();
        ctx.fillStyle = '#f8f4eb';
        ctx.beginPath();
        ctx.moveTo(45, 160);
        ctx.lineTo(55, 92);
        ctx.lineTo(69, 92);
        ctx.lineTo(79, 160);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#d96b52';
        ctx.fillRect(52, 114, 20, 14);
        ctx.fillRect(54, 82, 16, 12);
        ctx.fillStyle = '#ffe594';
        ctx.beginPath();
        ctx.arc(62, 87, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Near hill & horizon grass
      ctx.fillStyle = theme.hillNear;
      ctx.beginPath();
      ctx.moveTo(0, 192);
      ctx.quadraticCurveTo(330, 152, 670, 185);
      ctx.quadraticCurveTo(960, 158, 1260, 188);
      ctx.lineTo(1260, 240);
      ctx.lineTo(0, 240);
      ctx.closePath();
      ctx.fill();

      // Cozy rounded trees along horizon
      const treePositions = [32, 180, 315, 460, 535, 1235];
      treePositions.forEach((tx, idx) => {
        const ty = 175 + (idx % 2) * 8;
        ctx.fillStyle = '#73533d';
        ctx.fillRect(tx - 4, ty, 8, 22);
        ctx.fillStyle = theme.treeColor;
        ctx.beginPath();
        ctx.arc(tx, ty - 4, 21, 0, Math.PI * 2);
        ctx.arc(tx - 11, ty + 4, 14, 0, Math.PI * 2);
        ctx.arc(tx + 11, ty + 4, 14, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ground base
      ctx.fillStyle = theme.ground;
      ctx.fillRect(0, 195, this.width, this.height - 195);
    }

    _drawForecourtAndShop(ctx, _theme, t, state) {
      const decorLvl = state.save.upgrades.decor || 1;

      // Driveway road along the bottom
      ctx.fillStyle = '#6c6a67';
      ctx.fillRect(0, 490, this.width, 160);

      // Asphalt forecourt area for cars & pumps
      ctx.fillStyle = '#7a7773';
      roundRect(ctx, 16, 206, 490, 310, 24);
      ctx.fill();

      // Dashed road divider line
      ctx.save();
      ctx.strokeStyle = '#efe2be';
      ctx.lineWidth = 4;
      ctx.setLineDash([28, 22]);
      ctx.beginPath();
      ctx.moveTo(0, 572);
      ctx.lineTo(this.width, 572);
      ctx.stroke();
      ctx.restore();

      // Sidewalk / curb between forecourt/shop and road
      ctx.fillStyle = '#ded4be';
      ctx.fillRect(0, 474, this.width, 20);
      ctx.fillStyle = '#c5b89e';
      ctx.fillRect(0, 490, this.width, 5);

      // Pump island raised concrete pad
      ctx.fillStyle = '#d7cdb6';
      roundRect(ctx, 44, 250, 434, 58, 16);
      ctx.fill();
      ctx.strokeStyle = '#b4a88e';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Canopy shadow on ground
      ctx.fillStyle = 'rgba(65, 48, 34, 0.12)';
      roundRect(ctx, 36, 210, 452, 36, 12);
      ctx.fill();

      // Canopy pillars
      ctx.fillStyle = '#f3ead7';
      ctx.fillRect(60, 168, 14, 98);
      ctx.fillRect(458, 168, 14, 98);

      // Cozy Pump Canopy Roof
      ctx.fillStyle = '#d86d53';
      roundRect(ctx, 30, 118, 466, 54, 14);
      ctx.fill();
      ctx.fillStyle = '#f7ebd5';
      roundRect(ctx, 30, 152, 466, 16, 6);
      ctx.fill();

      // Decor upgrades: flower boxes and fairy lights
      if (decorLvl >= 1) {
        this._drawFlowerBox(ctx, 50, 270, t);
        this._drawFlowerBox(ctx, 442, 270, t);
      }
      if (decorLvl >= 2) {
        this._drawFairyLights(ctx, 42, 168, 484, 168, t);
      }
      if (decorLvl >= 3) {
        this._drawFlowerBox(ctx, 542, 466, t);
        this._drawFlowerBox(ctx, 1052, 466, t);
      }

      // Right Side: Main Cozy Shop & Bistro (x: 520..1076)
      ctx.save();
      ctx.fillStyle = '#f4e6cf';
      roundRect(ctx, 520, 142, 556, 336, 18);
      ctx.fill();
      ctx.strokeStyle = '#c49d74';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Warm wooden plank floor
      ctx.fillStyle = '#dcb98e';
      roundRect(ctx, 532, 224, 532, 246, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(130, 88, 50, 0.2)';
      ctx.lineWidth = 1.5;
      for (let py = 248; py < 466; py += 24) {
        ctx.beginPath();
        ctx.moveTo(536, py);
        ctx.lineTo(1060, py);
        ctx.stroke();
      }

      // Back wall inside shop
      ctx.fillStyle = '#fdf4e3';
      roundRect(ctx, 532, 162, 532, 68, 8);
      ctx.fill();

      // Cozy terracotta shop awning/roof
      ctx.fillStyle = '#c8644c';
      roundRect(ctx, 514, 108, 568, 48, 14);
      ctx.fill();
      for (let sx = 524; sx < 1068; sx += 36) {
        ctx.fillStyle = Math.floor(sx / 36) % 2 === 0 ? '#f7ebd5' : '#d87a61';
        ctx.beginPath();
        ctx.arc(sx + 16, 156, 16, 0, Math.PI);
        ctx.fill();
      }

      if (decorLvl >= 2) {
        this._drawFairyLights(ctx, 536, 162, 1060, 162, t + 1.3);
      }

      // Service Counter facing DOWN toward the shop floor (open aisles on left x=560 & right x=1044)
      ctx.fillStyle = '#9f6b47';
      roundRect(ctx, 594, 272, 428, 30, 8);
      ctx.fill();
      ctx.fillStyle = '#f1dec0';
      roundRect(ctx, 590, 266, 436, 12, 6);
      ctx.fill();

      // Subtle floor mat at register & waiting counter spots
      ctx.fillStyle = 'rgba(224, 122, 95, 0.18)';
      ctx.beginPath();
      ctx.ellipse(625, 348, 24, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      window.GAME_DATA.SHOP_SPOTS.forEach((spot) => {
        ctx.fillStyle = 'rgba(159, 107, 71, 0.14)';
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y + 16, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Welcome doormat & open doorway gap in bottom shop wall (x: 566..640)
      ctx.fillStyle = '#dcb98e';
      ctx.fillRect(566, 466, 74, 16);
      ctx.fillStyle = '#a4654b';
      roundRect(ctx, 566, 462, 74, 18, 6);
      ctx.fill();

      // Adjacent Side Storage Room (📦 SKLAD, x: 1080..1246, y: 124..385)
      ctx.fillStyle = '#e7dcc8';
      roundRect(ctx, 1078, 152, 168, 236, 14);
      ctx.fill();
      ctx.strokeStyle = '#9e8468';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Storage floor
      ctx.fillStyle = '#cbb89d';
      roundRect(ctx, 1084, 198, 154, 182, 10);
      ctx.fill();

      // Storage back wall
      ctx.fillStyle = '#f2eadc';
      roundRect(ctx, 1084, 162, 154, 42, 6);
      ctx.fill();

      // Storage roof
      ctx.fillStyle = '#7d6b5d';
      roundRect(ctx, 1074, 124, 174, 38, 12);
      ctx.fill();

      // Dividing wall segments with open doorway archway (y: 235..335)
      ctx.fillStyle = '#c49d74';
      ctx.fillRect(1073, 158, 8, 77);
      ctx.fillRect(1073, 335, 8, 52);

      // Doorway threshold floor
      ctx.fillStyle = '#d3be9f';
      ctx.fillRect(1068, 235, 18, 100);
      ctx.strokeStyle = '#8b6849';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1077, 235);
      ctx.lineTo(1077, 241);
      ctx.moveTo(1077, 329);
      ctx.lineTo(1077, 335);
      ctx.stroke();

      ctx.restore();
    }

    _drawFlowerBox(ctx, x, y, t) {
      ctx.save();
      ctx.fillStyle = '#8b5a3c';
      roundRect(ctx, x - 22, y - 4, 44, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#5f9458';
      ctx.beginPath();
      ctx.arc(x - 10, y - 7, 8, 0, Math.PI * 2);
      ctx.arc(x, y - 9, 9, 0, Math.PI * 2);
      ctx.arc(x + 10, y - 7, 8, 0, Math.PI * 2);
      ctx.fill();
      const sway = Math.sin(t * 2 + x) * 1.2;
      ['#ff8b94', '#ffd166', '#ff8b94'].forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x - 10 + i * 10 + sway, y - 10 - (i === 1 ? 3 : 0), 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    _drawFairyLights(ctx, x1, y1, x2, y2, t) {
      ctx.save();
      ctx.strokeStyle = '#6c584c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo((x1 + x2) / 2, y1 + 14, x2, y2);
      ctx.stroke();

      const steps = 14;
      for (let i = 1; i < steps; i++) {
        const p = i / steps;
        const lx = x1 + (x2 - x1) * p;
        const ly = y1 + Math.sin(p * Math.PI) * 14;
        const pulse = 0.7 + 0.3 * Math.sin(t * 3 + i);
        ctx.fillStyle = `rgba(255, 220, 125, ${pulse})`;
        ctx.beginPath();
        ctx.arc(lx, ly + 3, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawStations(ctx, t, state) {
      const stations = window.GAME_DATA.STATIONS;
      const pumpsLvl = state.save.upgrades.pumps || 1;

      Object.values(stations).forEach((st) => {
        const isLockedPump = st.id === 'pump_2' && pumpsLvl < 2;
        const isHovered =
          state.hoveredTarget && state.hoveredTarget.kind === 'station' && state.hoveredTarget.id === st.id;

        ctx.save();
        if (isHovered && !isLockedPump) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 18;
        }

        if (st.type === 'pump') {
          this._drawFuelPump(ctx, st, isLockedPump, isHovered);
        } else if (st.id === 'bucket') {
          this._drawWashBucket(ctx, st, isHovered);
        } else if (st.id === 'broom') {
          this._drawBroomStand(ctx, st, isHovered);
        } else if (st.id === 'coffee') {
          this._drawCoffeeMachine(ctx, st, isHovered, t);
        } else if (st.id === 'grill') {
          this._drawGrillStation(ctx, st, isHovered, t);
        } else if (st.id === 'fridge') {
          this._drawFridgeStation(ctx, st, isHovered);
        } else if (st.id === 'storage') {
          this._drawStorageStation(ctx, st, isHovered);
        } else if (st.id === 'trash') {
          this._drawTrashBin(ctx, st, isHovered);
        } else if (st.id === 'register') {
          this._drawRegister(ctx, st, isHovered, state);
        }

        ctx.restore();
      });
    }

    _drawRacks(ctx, t, state) {
      if (!state.racks) return;
      const rackColors = {
        rack_snacks: '#e07a5f',
        rack_sweets: '#8d5b4c',
        rack_auto: '#4ea8de'
      };
      state.racks.forEach((rack) => {
        const isHovered =
          state.hoveredTarget && state.hoveredTarget.kind === 'rack' && state.hoveredTarget.id === rack.id;

        ctx.save();
        if (isHovered) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 18;
        }

        // Cozy wooden shelf display stand
        ctx.fillStyle = 'rgba(65, 45, 30, 0.16)';
        roundRect(ctx, rack.x - 42, rack.y - 10, 84, 34, 10);
        ctx.fill();

        ctx.fillStyle = '#9a6843';
        roundRect(ctx, rack.x - 40, rack.y - 26, 80, 44, 10);
        ctx.fill();
        ctx.strokeStyle = '#6c462b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Two shelf boards
        ctx.fillStyle = '#e7cfa9';
        roundRect(ctx, rack.x - 35, rack.y - 21, 70, 15, 4);
        ctx.fill();
        roundRect(ctx, rack.x - 35, rack.y - 1, 70, 15, 4);
        ctx.fill();

        // Draw painted mini-packages representing stock (no emojis)
        const slots = Math.min(rack.maxStock, 8);
        const itemColor = rackColors[rack.id] || '#e07a5f';
        for (let i = 0; i < slots; i++) {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const ix = rack.x - 24 + col * 16;
          const iy = rack.y - 13 + row * 19;
          ctx.globalAlpha = i < rack.stock ? 1 : 0.16;
          ctx.fillStyle = itemColor;
          roundRect(ctx, ix - 5, iy - 5, 10, 11, 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.restore();

        // Stock badge above stand
        const isEmpty = rack.stock === 0;
        const isLow = rack.stock === 1;
        const pulse = isEmpty ? Math.sin(t * 7) * 2.5 : 0;
        const badgeText = isEmpty ? `DOPLNIT 0/${rack.maxStock}` : `${rack.stock}/${rack.maxStock}`;

        ctx.save();
        ctx.font = '800 11px "Nunito", sans-serif';
        const bw = ctx.measureText(badgeText).width + 14;
        const bx = rack.x;
        const by = rack.y - 38 + pulse;
        ctx.fillStyle = isEmpty ? '#e05a47' : isLow ? '#f2b749' : '#6ba368';
        roundRect(ctx, bx - bw / 2, by - 10, bw, 20, 10);
        ctx.fill();
        ctx.strokeStyle = '#fff9ee';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = isLow ? '#3c2415' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, bx, by);
        ctx.restore();

        this._drawStationTag(ctx, rack.x, rack.y + 30, rack.label, isHovered);
      });
    }

    _drawStationTag(ctx, x, y, text, hovered) {
      ctx.save();
      ctx.font = '700 11px "Nunito", "Segoe UI", sans-serif';
      const w = ctx.measureText(text).width + 14;
      ctx.fillStyle = hovered ? '#ffefc2' : 'rgba(255, 250, 240, 0.92)';
      roundRect(ctx, x - w / 2, y - 10, w, 20, 8);
      ctx.fill();
      ctx.strokeStyle = hovered ? '#d9822b' : '#c9b393';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#4e3629';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    _drawFuelPump(ctx, st, isLocked, isHovered) {
      ctx.save();
      ctx.globalAlpha = isLocked ? 0.45 : 1;
      ctx.fillStyle = '#5c4b43';
      roundRect(ctx, st.x - 24, st.y - 34, 48, 68, 10);
      ctx.fill();
      ctx.fillStyle = isLocked ? '#9e978e' : '#e07a5f';
      roundRect(ctx, st.x - 21, st.y - 31, 42, 60, 8);
      ctx.fill();
      ctx.fillStyle = '#fff8eb';
      roundRect(ctx, st.x - 15, st.y - 24, 30, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#3d3430';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(st.x + 21, st.y - 8);
      ctx.quadraticCurveTo(st.x + 34, st.y + 8, st.x + 22, st.y + 22);
      ctx.stroke();

      ctx.fillStyle = isLocked ? '#7e766e' : '#c65d44';
      roundRect(ctx, st.x - 13, st.y + 4, 26, 14, 3);
      ctx.fill();
      ctx.restore();

      this._drawStationTag(
        ctx,
        st.x,
        st.y + 44,
        isLocked ? 'Stojan 3 (Úr. 2)' : st.label,
        isHovered && !isLocked
      );
    }

    _drawWashBucket(ctx, st, isHovered) {
      ctx.fillStyle = '#5ca4a9';
      ctx.beginPath();
      ctx.moveTo(st.x - 16, st.y - 10);
      ctx.lineTo(st.x + 16, st.y - 10);
      ctx.lineTo(st.x + 12, st.y + 18);
      ctx.lineTo(st.x - 12, st.y + 18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3e7377';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(st.x - 6, st.y - 11, 6, 0, Math.PI * 2);
      ctx.arc(st.x + 4, st.y - 12, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '18px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧽', st.x, st.y + 4);
      this._drawStationTag(ctx, st.x, st.y + 32, 'Mytí oken', isHovered);
    }

    _drawBroomStand(ctx, st, isHovered) {
      ctx.fillStyle = '#a47148';
      ctx.fillRect(st.x - 2, st.y - 22, 4, 34);
      ctx.fillStyle = '#e2b66d';
      roundRect(ctx, st.x - 12, st.y + 8, 24, 14, 4);
      ctx.fill();
      ctx.font = '18px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧹', st.x, st.y - 2);
      this._drawStationTag(ctx, st.x, st.y + 34, 'Úklid', isHovered);
    }

    _drawCoffeeMachine(ctx, st, isHovered, t) {
      ctx.fillStyle = '#b98b61';
      roundRect(ctx, st.x - 32, st.y - 14, 64, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#5a3d31';
      roundRect(ctx, st.x - 22, st.y - 34, 44, 36, 7);
      ctx.fill();
      ctx.fillStyle = '#d9b99b';
      roundRect(ctx, st.x - 15, st.y - 26, 30, 14, 4);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2;
      const sx = st.x + Math.sin(t * 4) * 3;
      ctx.beginPath();
      ctx.moveTo(sx, st.y - 38);
      ctx.quadraticCurveTo(sx - 5, st.y - 46, sx + 2, st.y - 52);
      ctx.stroke();

      ctx.font = '20px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☕', st.x, st.y + 14);
      this._drawStationTag(ctx, st.x, st.y + 42, 'Kávovar', isHovered);
    }

    _drawGrillStation(ctx, st, isHovered, t) {
      ctx.fillStyle = '#b98b61';
      roundRect(ctx, st.x - 34, st.y - 14, 68, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#d98a3c';
      roundRect(ctx, st.x - 24, st.y - 30, 48, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      roundRect(ctx, st.x - 18, st.y - 25, 36, 16, 4);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 145, 77, ${0.22 + 0.1 * Math.sin(t * 5)})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y - 17, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '20px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌭', st.x, st.y + 14);
      this._drawStationTag(ctx, st.x, st.y + 42, 'Gril & Pečivo', isHovered);
    }

    _drawFridgeStation(ctx, st, isHovered) {
      ctx.fillStyle = '#7fb069';
      roundRect(ctx, st.x - 26, st.y - 38, 52, 68, 10);
      ctx.fill();
      ctx.fillStyle = '#e7f5e1';
      roundRect(ctx, st.x - 19, st.y - 30, 38, 40, 6);
      ctx.fill();

      ctx.font = '20px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🧃', st.x, st.y - 10);
      this._drawStationTag(ctx, st.x, st.y + 42, 'Limonády', isHovered);
    }

    _drawStorageStation(ctx, st, isHovered) {
      // Wooden warehouse pallet & stacked supply crates
      ctx.fillStyle = '#8b5e3c';
      roundRect(ctx, st.x - 36, st.y + 8, 72, 22, 6);
      ctx.fill();

      const crates = [
        [st.x - 26, st.y - 14, 24, 22],
        [st.x + 2, st.y - 14, 24, 22],
        [st.x - 12, st.y - 34, 24, 22]
      ];
      crates.forEach(([cx, cy, cw, ch]) => {
        ctx.fillStyle = '#d4a373';
        roundRect(ctx, cx, cy, cw, ch, 4);
        ctx.fill();
        ctx.strokeStyle = '#9c6644';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 3, cy + ch / 2);
        ctx.lineTo(cx + cw - 3, cy + ch / 2);
        ctx.stroke();
      });

      ctx.font = '20px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📦', st.x, st.y + 6);
      this._drawStationTag(ctx, st.x, st.y + 42, 'Sklad zboží', isHovered);
    }

    _drawTrashBin(ctx, st, isHovered) {
      ctx.fillStyle = '#757575';
      roundRect(ctx, st.x - 16, st.y - 16, 32, 34, 6);
      ctx.fill();
      ctx.fillStyle = '#999999';
      roundRect(ctx, st.x - 19, st.y - 21, 38, 8, 4);
      ctx.fill();
      ctx.font = '18px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🗑️', st.x, st.y + 2);
      this._drawStationTag(ctx, st.x, st.y + 30, 'Koš', isHovered);
    }

    _drawRegister(ctx, st, isHovered, state) {
      const waitingPay = state.customers.some((c) => c.state === 'paying');
      ctx.fillStyle = '#5c4b43';
      roundRect(ctx, st.x - 22, st.y - 22, 44, 34, 6);
      ctx.fill();
      ctx.fillStyle = waitingPay ? '#ffe082' : '#d6e5d8';
      roundRect(ctx, st.x - 15, st.y - 18, 30, 14, 3);
      ctx.fill();

      ctx.font = '20px "Segoe UI Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📠', st.x, st.y + 2);

      if (waitingPay) {
        const bounce = Math.sin(state.time * 6) * 3;
        ctx.fillStyle = '#f4a261';
        roundRect(ctx, st.x - 24, st.y - 46 + bounce, 48, 20, 10);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 11px "Nunito", sans-serif';
        ctx.fillText('💰 +Kč', st.x, st.y - 36 + bounce);
      }

      this._drawStationTag(ctx, st.x, st.y + 26, 'Pokladna', isHovered);
    }

    _drawSpills(ctx, t, state) {
      state.spills.forEach((spill) => {
        const isHovered =
          state.hoveredTarget &&
          state.hoveredTarget.kind === 'spill' &&
          state.hoveredTarget.id === spill.id;
        ctx.save();
        if (isHovered) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 14;
        }
        ctx.fillStyle = spill.type === 'oil' ? 'rgba(72, 62, 58, 0.78)' : 'rgba(116, 178, 196, 0.75)';
        ctx.beginPath();
        ctx.ellipse(spill.x, spill.y, 26, 13, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(spill.x + 14, spill.y + 6, 12, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();

        const pulse = Math.sin(t * 4) * 2;
        ctx.font = '15px "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🧹', spill.x, spill.y - 12 + pulse);
        ctx.restore();
      });
    }

    _drawClickQueue(ctx, t, state) {
      const player = state.player;
      if (!player) return;

      const targets = [];
      if (player.currentTask) targets.push(player.currentTask);
      player.taskQueue.forEach((task) => targets.push(task));

      if (targets.length === 0) return;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 224, 130, 0.85)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = -t * 28;
      ctx.beginPath();
      let curX = player.x;
      let curY = player.y;
      ctx.moveTo(curX, curY + 12);
      targets.forEach((task) => {
        if (typeof state.buildPath === 'function') {
          const pts = state.buildPath(curX, curY, task.x, task.y);
          pts.forEach((pt) => {
            ctx.lineTo(pt.x, pt.y + 12);
          });
        } else {
          ctx.lineTo(task.x, task.y + 12);
        }
        curX = task.x;
        curY = task.y;
      });
      ctx.stroke();
      ctx.restore();

      targets.forEach((task, idx) => {
        const pulse = 1 + 0.08 * Math.sin(t * 6 + idx);
        ctx.save();
        ctx.translate(task.x, task.y + 12);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = idx === 0 ? '#f4a261' : '#e9c46a';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#4e3629';
        ctx.font = '800 12px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(idx + 1), 0, 1);
        ctx.restore();
      });
    }

    _drawCar(ctx, car, t, state) {
      const isHovered =
        state.hoveredTarget &&
        state.hoveredTarget.kind === 'car' &&
        state.hoveredTarget.id === car.id;

      ctx.save();
      ctx.translate(car.x, car.y);

      if (isHovered) {
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 18;
      }

      ctx.fillStyle = 'rgba(40, 32, 26, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 26, 56, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = car.color;
      roundRect(ctx, -52, -16, 104, 34, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60, 45, 35, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = car.roofColor || car.color;
      if (car.variant === 'van') {
        roundRect(ctx, -40, -34, 78, 24, 10);
      } else {
        roundRect(ctx, -28, -34, 56, 22, 10);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d8edf2';
      if (car.variant === 'van') {
        roundRect(ctx, -33, -29, 28, 14, 4);
        ctx.fill();
        roundRect(ctx, 2, -29, 28, 14, 4);
        ctx.fill();
      } else {
        roundRect(ctx, -22, -29, 20, 14, 4);
        ctx.fill();
        roundRect(ctx, 2, -29, 20, 14, 4);
        ctx.fill();
      }

      ctx.fillStyle = '#fff1a8';
      roundRect(ctx, 45, -8, 8, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#e06458';
      roundRect(ctx, -53, -8, 7, 10, 3);
      ctx.fill();

      const wheelBounce = car.state === 'arriving' || car.state === 'leaving' ? Math.sin(t * 25) * 1.5 : 0;
      [-30, 30].forEach((wx) => {
        ctx.fillStyle = '#3b3634';
        ctx.beginPath();
        ctx.arc(wx, 18 + wheelBounce, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e6decb';
        ctx.beginPath();
        ctx.arc(wx, 18 + wheelBounce, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      const wantsWash = car.orders.some((o) => o.itemId === 'wash' && !o.done);
      if (wantsWash) {
        ctx.fillStyle = 'rgba(130, 105, 80, 0.55)';
        ctx.beginPath();
        ctx.arc(14, -22, 4, 0, Math.PI * 2);
        ctx.arc(19, -20, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _drawCarBubble(ctx, car, t) {
      if (car.state === 'waiting_driver') {
        const bx = car.x;
        const by = car.y - 54 + Math.sin(t * 2.5 + car.id) * 1.5;
        ctx.save();
        const text = '🚶‍♂️ Řidič v obchodě';
        ctx.font = '700 11px "Nunito", "Segoe UI", sans-serif';
        const bw = ctx.measureText(text).width + 16;
        ctx.fillStyle = 'rgba(255, 250, 240, 0.94)';
        roundRect(ctx, bx - bw / 2, by - 12, bw, 24, 11);
        ctx.fill();
        ctx.strokeStyle = '#c49d74';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#4e3629';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, bx, by);
        ctx.restore();
        return;
      }
      if (car.state !== 'waiting') return;
      const bx = car.x;
      const by = car.y - 68 + Math.sin(t * 3 + car.id) * 2;
      this._drawOrderBubble(ctx, bx, by, car.orders, car.patience / car.maxPatience, false);
    }

    _drawCustomer(ctx, cust, t, state) {
      const isHovered =
        state.hoveredTarget &&
        state.hoveredTarget.kind === 'customer' &&
        state.hoveredTarget.id === cust.id;

      ctx.save();
      const bob = cust.moving ? Math.abs(Math.sin(t * 11 + cust.id)) * 4 : Math.sin(t * 3 + cust.id) * 1.5;
      ctx.translate(cust.x, cust.y - bob);

      if (isHovered) {
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 16;
      }

      ctx.fillStyle = 'rgba(40, 30, 22, 0.22)';
      ctx.beginPath();
      ctx.ellipse(0, 20 + bob, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = cust.shirtColor;
      roundRect(ctx, -14, -6, 28, 25, 11);
      ctx.fill();
      ctx.strokeStyle = 'rgba(55, 38, 28, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = cust.skinColor;
      ctx.beginPath();
      ctx.arc(0, -16, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = cust.hairColor;
      ctx.beginPath();
      ctx.arc(0, -21, 12.5, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#3c2a21';
      ctx.beginPath();
      ctx.arc(-4.5, -16, 1.8, 0, Math.PI * 2);
      ctx.arc(4.5, -16, 1.8, 0, Math.PI * 2);
      ctx.fill();

      const ratio = cust.patience / cust.maxPatience;
      ctx.strokeStyle = '#3c2a21';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (ratio > 0.45) {
        ctx.arc(0, -13, 4, 0.15, Math.PI - 0.15);
      } else {
        ctx.moveTo(-4, -10);
        ctx.lineTo(4, -10);
      }
      ctx.stroke();

      ctx.restore();
    }

    _drawCustomerBubble(ctx, cust, t) {
      if (
        cust.state !== 'waiting' &&
        cust.state !== 'shopping' &&
        cust.state !== 'arriving' &&
        cust.state !== 'paying'
      ) {
        return;
      }
      const bx = cust.x;
      const by = cust.y - 54 + Math.sin(t * 3 + cust.id) * 2;
      if (cust.state === 'paying') {
        this._drawOrderBubble(
          ctx,
          bx,
          by,
          [{ itemId: 'pay', done: false }],
          cust.patience / cust.maxPatience,
          true
        );
      } else if (cust.orders && cust.orders.length > 0) {
        this._drawOrderBubble(ctx, bx, by, cust.orders, cust.patience / cust.maxPatience, false);
      } else if (cust.state === 'shopping') {
        this._drawOrderBubble(
          ctx,
          bx,
          by,
          [{ itemId: 'shop', done: false }],
          cust.patience / cust.maxPatience,
          false
        );
      }

      if (cust.basket && cust.basket.length > 0) {
        const icons = cust.basket
          .map((id) => {
            const def = window.GAME_DATA.ITEMS[id];
            return def ? def.icon : '';
          })
          .join('');
        const tag = `🛒${icons}`;
        ctx.save();
        ctx.font = '700 11px "Segoe UI Emoji", "Nunito", sans-serif';
        const tw = ctx.measureText(tag).width + 10;
        const tx = cust.x + 24;
        const ty = cust.y - 16;
        ctx.fillStyle = '#e8f6e4';
        roundRect(ctx, tx - 4, ty - 10, tw, 20, 9);
        ctx.fill();
        ctx.strokeStyle = '#6ba368';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#2d6229';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tag, tx + 1, ty);
        ctx.restore();
      }
    }

    _drawOrderBubble(ctx, bx, by, orders, patienceRatio, isPaying) {
      const itemWidth = 30;
      const bw = Math.max(46, orders.length * itemWidth + 14);
      const bh = 38;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 252, 245, 0.96)';
      roundRect(ctx, bx - bw / 2, by - bh / 2, bw, bh, 12);
      ctx.fill();
      ctx.strokeStyle = isPaying ? '#e76f51' : '#c9b393';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 252, 245, 0.96)';
      ctx.beginPath();
      ctx.moveTo(bx - 6, by + bh / 2 - 1);
      ctx.lineTo(bx, by + bh / 2 + 7);
      ctx.lineTo(bx + 6, by + bh / 2 - 1);
      ctx.closePath();
      ctx.fill();

      const startX = bx - ((orders.length - 1) * itemWidth) / 2;
      orders.forEach((order, i) => {
        const ix = startX + i * itemWidth;
        const iy = by - 2;
        if (order.itemId === 'pay') {
          ctx.font = '18px "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💰', ix, iy);
        } else if (order.itemId === 'shop') {
          ctx.font = '18px "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛒', ix, iy);
        } else {
          const itemDef = window.GAME_DATA.ITEMS[order.itemId];
          ctx.globalAlpha = order.done ? 0.35 : 1;
          ctx.font = '18px "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(itemDef ? itemDef.icon : '❓', ix, iy);
          ctx.globalAlpha = 1;
          if (order.done) {
            ctx.fillStyle = '#4f9d69';
            ctx.font = '900 13px "Nunito", sans-serif';
            ctx.fillText('✓', ix + 7, iy + 6);
          }
        }
      });

      const barW = bw - 14;
      const barX = bx - barW / 2;
      const barY = by + bh / 2 - 7;
      ctx.fillStyle = '#e7dfd0';
      roundRect(ctx, barX, barY, barW, 4, 2);
      ctx.fill();

      const clamped = Math.max(0, Math.min(1, patienceRatio));
      ctx.fillStyle = clamped > 0.5 ? '#6ba368' : clamped > 0.25 ? '#e9b44c' : '#d95d4a';
      if (clamped > 0) {
        roundRect(ctx, barX, barY, barW * clamped, 4, 2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawWorker(ctx, w, t) {
      ctx.save();
      const moving = w.moving;
      const bob = moving ? Math.abs(Math.sin(t * 14 + w.seed)) * 5 : Math.sin(t * 3 + w.seed) * 1.5;
      ctx.translate(w.x, w.y - bob);

      ctx.fillStyle = 'rgba(40, 30, 22, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 22 + bob, 17, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (w.isPlayer) {
        ctx.strokeStyle = 'rgba(244, 162, 97, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 21 + bob, 20, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = w.color;
      roundRect(ctx, -15, -6, 30, 26, 11);
      ctx.fill();
      ctx.fillStyle = '#fff9ee';
      roundRect(ctx, -10, 1, 20, 17, 6);
      ctx.fill();

      ctx.fillStyle = '#fbdcc4';
      ctx.beginPath();
      ctx.arc(0, -17, 13.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5c4334';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = w.hatColor;
      ctx.beginPath();
      ctx.arc(0, -22, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-13, -24, 26, 4);

      ctx.fillStyle = '#3c2a21';
      ctx.beginPath();
      ctx.arc(-4.5, -17, 1.8, 0, Math.PI * 2);
      ctx.arc(4.5, -17, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3c2a21';
      ctx.beginPath();
      ctx.arc(0, -14, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();

      if (w.held && w.held.length > 0) {
        const trayX = 24;
        const trayY = -12;
        ctx.fillStyle = '#fff9ee';
        roundRect(ctx, trayX - 10, trayY - 12, w.held.length * 20 + 10, 24, 10);
        ctx.fill();
        ctx.strokeStyle = '#c9b393';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = '15px "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        w.held.forEach((itemId, idx) => {
          const itemDef = window.GAME_DATA.ITEMS[itemId];
          ctx.fillText(itemDef ? itemDef.icon : '❓', trayX + idx * 20 + 4, trayY);
        });
      }

      ctx.restore();
    }

    _drawWorkerOverlay(ctx, w) {
      ctx.save();
      ctx.font = '800 11px "Nunito", sans-serif';
      const label = w.label;
      const bw = ctx.measureText(label).width + 12;
      ctx.fillStyle = w.isPlayer ? '#f4a261' : 'rgba(78, 54, 41, 0.85)';
      roundRect(ctx, w.x - bw / 2, w.y + 24, bw, 17, 8);
      ctx.fill();
      ctx.fillStyle = w.isPlayer ? '#3c2415' : '#fff9ee';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, w.x, w.y + 33);

      if (w.actionTimer > 0 && w.actionDuration > 0) {
        const progress = Math.min(1, 1 - w.actionTimer / w.actionDuration);
        const rx = w.x;
        const ry = w.y - 44;
        ctx.fillStyle = '#fff9ee';
        ctx.beginPath();
        ctx.arc(rx, ry, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e5dac7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#6ba368';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(rx, ry, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
        ctx.stroke();
      }
      ctx.restore();
    }

    _drawParticles(ctx, particles) {
      particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
        if (p.text) {
          ctx.font = `800 ${p.size || 15}px "Nunito", sans-serif`;
          ctx.textAlign = 'center';
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#fff9ee';
          ctx.strokeText(p.text, p.x, p.y);
          ctx.fillStyle = p.color || '#4e3629';
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color || '#ffd166';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size || 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    _drawHoverHint(ctx, state) {
      if (!state.hoveredTarget || !state.hoveredTarget.hint) return;
      const hx = Math.min(Math.max(state.mouseX, 110), this.width - 110);
      const hy = Math.max(state.mouseY - 26, 26);

      ctx.save();
      ctx.font = '700 12px "Nunito", sans-serif';
      const w = ctx.measureText(state.hoveredTarget.hint).width + 18;
      ctx.fillStyle = 'rgba(78, 54, 41, 0.92)';
      roundRect(ctx, hx - w / 2, hy - 13, w, 24, 10);
      ctx.fill();
      ctx.fillStyle = '#fff9ee';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(state.hoveredTarget.hint, hx, hy - 1);
      ctx.restore();
    }

    _drawPauseOverlay(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(42, 34, 28, 0.58)';
      ctx.fillRect(0, 0, this.width, this.height);

      const cw = 460;
      const ch = 134;
      const cx = this.width / 2;
      const cy = this.height / 2;

      ctx.fillStyle = 'rgba(255, 250, 240, 0.97)';
      roundRect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 24);
      ctx.fill();
      ctx.strokeStyle = '#d96b52';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#4e3629';
      ctx.font = '800 26px "Nunito", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⏸️ HRA JE POZASTAVENA', cx, cy - 18);

      ctx.fillStyle = '#7b604e';
      ctx.font = '700 15px "Nunito", "Segoe UI", sans-serif';
      ctx.fillText('Klikni na „▶️ Pokračovat“ nebo stiskni Mezerník / P', cx, cy + 22);
      ctx.restore();
    }
  }

  window.StationRenderer = StationRenderer;
})();
