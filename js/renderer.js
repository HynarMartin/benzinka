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
      this.width = 1540;
      this.height = 780;
    }

    render(state) {
      const ctx = this.ctx;
      const theme = window.GAME_DATA.THEMES[state.level.theme] || window.GAME_DATA.THEMES.meadow;
      const t = state.time;

      ctx.clearRect(0, 0, this.width, this.height);

      this._drawBackground(ctx, theme, t, state);
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
        if (worker.active) this._drawWorkerOverlay(ctx, worker, t, state);
      });

      this._drawParticles(ctx, state.particles);
      if (state.placementMode) {
        this._drawPlacementOverlay(ctx, t, state);
      } else if (state.prepMode) {
        this._drawPrepUpgradeBadges(ctx, t, state);
      }
      this._drawHoverHint(ctx, state);
      if (state.paused) {
        this._drawPauseOverlay(ctx);
      }
    }

    _getStageId(state) {
      return (state && state.stageId) || (state && state.save && state.save.currentStage) || 1;
    }

    _drawBackground(ctx, theme, t, state) {
      const stageId = this._getStageId(state);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 210);
      if (stageId === 2) {
        skyGrad.addColorStop(0, '#c8dce8');
        skyGrad.addColorStop(1, '#eef3f5');
      } else if (stageId === 3) {
        skyGrad.addColorStop(0, '#c9dae6');
        skyGrad.addColorStop(1, '#eceae2');
      } else if (stageId === 4) {
        skyGrad.addColorStop(0, '#b9d6e6');
        skyGrad.addColorStop(1, '#e7eff4');
      } else {
        skyGrad.addColorStop(0, theme.skyTop);
        skyGrad.addColorStop(1, theme.skyBottom);
      }
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

      if (stageId === 2) {
        this._drawStage2Backdrop(ctx);
      } else if (stageId === 3) {
        this._drawStage3Backdrop(ctx);
      } else if (stageId === 4) {
        this._drawStage4Backdrop(ctx);
      } else {
        this._drawStage1Backdrop(ctx, theme, t);
      }
    }

    _drawStage1Backdrop(ctx, theme, t) {
      if (theme.hasMountains) {
        ctx.fillStyle = theme.hillFar;
        ctx.beginPath();
        ctx.moveTo(0, 185);
        ctx.lineTo(170, 82);
        ctx.lineTo(350, 170);
        ctx.lineTo(540, 72);
        ctx.lineTo(760, 178);
        ctx.lineTo(980, 86);
        ctx.lineTo(1240, 180);
        ctx.lineTo(1540, 95);
        ctx.lineTo(1540, 210);
        ctx.lineTo(0, 210);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        [
          [170, 82, 34],
          [540, 72, 38],
          [980, 86, 32]
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

      // Rolling green countryside hills
      ctx.fillStyle = theme.hillFar;
      ctx.beginPath();
      ctx.moveTo(0, 175);
      ctx.quadraticCurveTo(300, 118, 620, 165);
      ctx.quadraticCurveTo(960, 122, 1280, 162);
      ctx.quadraticCurveTo(1420, 140, 1540, 160);
      ctx.lineTo(1540, 220);
      ctx.lineTo(0, 220);
      ctx.closePath();
      ctx.fill();

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

      ctx.fillStyle = theme.hillNear;
      ctx.beginPath();
      ctx.moveTo(0, 192);
      ctx.quadraticCurveTo(400, 152, 820, 185);
      ctx.quadraticCurveTo(1180, 158, 1540, 188);
      ctx.lineTo(1540, 240);
      ctx.lineTo(0, 240);
      ctx.closePath();
      ctx.fill();

      // Small-town church steeple (x=255) & village cottages (x=95, 325, 485)
      ctx.save();
      ctx.fillStyle = '#f3ead9';
      ctx.fillRect(243, 134, 24, 54);
      ctx.fillStyle = '#6c8b74';
      ctx.beginPath();
      ctx.moveTo(240, 134);
      ctx.lineTo(255, 96);
      ctx.lineTo(270, 134);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff9ee';
      ctx.beginPath();
      ctx.arc(255, 149, 6, 0, Math.PI * 2);
      ctx.fill();

      [
        [95, 34, 24, '#f6ebd6', '#d86d53'],
        [325, 38, 26, '#f9f0de', '#c85d44'],
        [485, 32, 22, '#f2e4c9', '#d86d53']
      ].forEach(([hx, hw, hh, wall, roof]) => {
        const hy = 188 - hh;
        ctx.fillStyle = wall;
        ctx.fillRect(hx - hw / 2, hy, hw, hh);
        ctx.fillStyle = roof;
        ctx.fillRect(hx + hw / 4, hy - 14, 5, 12);
        ctx.beginPath();
        ctx.moveTo(hx - hw / 2 - 4, hy);
        ctx.lineTo(hx, hy - 15);
        ctx.lineTo(hx + hw / 2 + 4, hy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffe5a3';
        ctx.fillRect(hx - hw / 4, hy + 7, 7, 7);
        ctx.fillRect(hx + hw / 10, hy + 7, 7, 7);
      });

      // Wooden picket fence along rural horizon
      ctx.fillStyle = '#e7d7bd';
      ctx.fillRect(0, 187, 616, 3);
      for (let fx = 8; fx < 614; fx += 14) {
        ctx.fillRect(fx, 182, 4, 13);
      }
      ctx.restore();

      // Cozy rounded village trees
      [36, 185, 395, 575, 1505].forEach((tx, idx) => {
        const ty = 175 + (idx % 2) * 8;
        ctx.fillStyle = '#73533d';
        ctx.fillRect(tx - 4, ty, 8, 22);
        ctx.fillStyle = theme.treeColor;
        ctx.beginPath();
        ctx.arc(tx, ty - 4, 21, 0, Math.PI * 2);
        ctx.arc(tx - 11, ty + 4, 14, 0, Math.PI * 2);
        ctx.arc(tx + 11, ty + 4, 14, 0, Math.PI * 2);
        ctx.fill();
        if (idx % 2 === 0) {
          ctx.fillStyle = '#e26d5c';
          ctx.beginPath();
          ctx.arc(tx - 5, ty - 7, 2.5, 0, Math.PI * 2);
          ctx.arc(tx + 7, ty, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.fillStyle = theme.ground;
      ctx.fillRect(0, 195, this.width, this.height - 195);
    }

    _drawStage2Backdrop(ctx) {
      // Distant urban park ridge
      ctx.fillStyle = '#b4c2cb';
      ctx.beginPath();
      ctx.moveTo(0, 178);
      ctx.quadraticCurveTo(380, 140, 780, 170);
      ctx.quadraticCurveTo(1160, 145, 1540, 175);
      ctx.lineTo(1540, 215);
      ctx.lineTo(0, 215);
      ctx.closePath();
      ctx.fill();

      // City skyline buildings (left forecourt horizon x: 25..595 & right edge x: 1325..1525)
      const buildings = [
        [25, 48, 86, '#768692'],
        [82, 58, 108, '#9a7066'],
        [150, 44, 78, '#66798a'],
        [204, 64, 114, '#88959e'],
        [278, 52, 92, '#7d6f74'],
        [340, 56, 84, '#6d8294'],
        [456, 62, 106, '#768692'],
        [528, 58, 96, '#8f7268'],
        [1330, 56, 88, '#768692'],
        [1396, 62, 104, '#66798a'],
        [1466, 54, 86, '#88959e']
      ];
      buildings.forEach(([bx, bw, bh, col]) => {
        const by = 192 - bh;
        ctx.fillStyle = col;
        roundRect(ctx, bx, by, bw, bh, 3);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 243, 204, 0.72)';
        for (let wy = by + 10; wy < 180; wy += 16) {
          for (let wx = bx + 8; wx < bx + bw - 10; wx += 14) {
            ctx.fillRect(wx, wy, 7, 9);
          }
        }
      });

      // Town-hall dome & clock tower (x=420)
      ctx.save();
      ctx.fillStyle = '#d7d2c8';
      ctx.fillRect(402, 106, 36, 86);
      ctx.fillStyle = '#3b647d';
      ctx.beginPath();
      ctx.arc(420, 106, 18, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(418, 76, 4, 14);
      ctx.fillStyle = '#fff9eb';
      ctx.beginPath();
      ctx.arc(420, 126, 8, 0, Math.PI * 2);
      ctx.fill();

      // Wrought-iron boulevard railing (y=183..195)
      ctx.fillStyle = '#3f4b54';
      ctx.fillRect(0, 183, 1540, 3);
      ctx.fillRect(0, 192, 1540, 3);
      for (let rx = 6; rx < 1540; rx += 18) {
        ctx.fillRect(rx, 184, 3, 10);
      }

      // Urban street lamps
      [115, 290, 505, 1465].forEach((lx) => {
        ctx.fillStyle = '#485661';
        ctx.fillRect(lx - 2, 142, 4, 52);
        ctx.fillStyle = '#fff1b5';
        ctx.beginPath();
        ctx.arc(lx, 140, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Trimmed city trees in stone planters
      [52, 235, 565, 1495].forEach((tx) => {
        ctx.fillStyle = '#8b8e91';
        roundRect(ctx, tx - 14, 184, 28, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#6c5340';
        ctx.fillRect(tx - 3, 168, 6, 17);
        ctx.fillStyle = '#5f8a6e';
        roundRect(ctx, tx - 15, 146, 30, 26, 12);
        ctx.fill();
      });
      ctx.restore();

      // Paved urban stone-tile plaza ground
      ctx.fillStyle = '#c9c4bb';
      ctx.fillRect(0, 195, this.width, this.height - 195);
      ctx.strokeStyle = 'rgba(130, 126, 118, 0.22)';
      ctx.lineWidth = 1;
      for (let gy = 210; gy < 595; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(this.width, gy);
        ctx.stroke();
      }
      for (let gx = 40; gx < this.width; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 195);
        ctx.lineTo(gx, 595);
        ctx.stroke();
      }
    }

    _drawStage3Backdrop(ctx) {
      // Rugged rocky mountain peaks
      ctx.fillStyle = '#7b8d9c';
      ctx.beginPath();
      ctx.moveTo(0, 192);
      ctx.lineTo(125, 76);
      ctx.lineTo(270, 168);
      ctx.lineTo(440, 62);
      ctx.lineTo(630, 175);
      ctx.lineTo(830, 74);
      ctx.lineTo(1060, 178);
      ctx.lineTo(1310, 68);
      ctx.lineTo(1540, 155);
      ctx.lineTo(1540, 212);
      ctx.lineTo(0, 212);
      ctx.closePath();
      ctx.fill();

      // Rocky & snow mountain caps
      ctx.fillStyle = '#5e7180';
      [
        [125, 76, 32],
        [440, 62, 38],
        [830, 74, 34],
        [1310, 68, 36]
      ].forEach(([mx, my, mw]) => {
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx - mw, my + 34);
        ctx.lineTo(mx + mw * 0.2, my + 24);
        ctx.lineTo(mx + mw, my + 34);
        ctx.closePath();
        ctx.fill();
      });

      // Deep pine-forested hills
      ctx.fillStyle = '#5b7a62';
      ctx.beginPath();
      ctx.moveTo(0, 178);
      ctx.quadraticCurveTo(360, 134, 740, 172);
      ctx.quadraticCurveTo(1160, 136, 1540, 172);
      ctx.lineTo(1540, 215);
      ctx.lineTo(0, 215);
      ctx.closePath();
      ctx.fill();

      // High-voltage lattice power pylons & sagging lines (x=140, 490)
      ctx.save();
      ctx.strokeStyle = '#59636b';
      ctx.lineWidth = 2;
      [140, 490].forEach((px) => {
        ctx.beginPath();
        ctx.moveTo(px - 14, 192);
        ctx.lineTo(px - 4, 86);
        ctx.lineTo(px + 4, 86);
        ctx.lineTo(px + 14, 192);
        ctx.moveTo(px - 18, 108);
        ctx.lineTo(px + 18, 108);
        ctx.moveTo(px - 15, 132);
        ctx.lineTo(px + 15, 132);
        ctx.stroke();
      });
      ctx.strokeStyle = 'rgba(72, 82, 90, 0.55)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(158, 108);
      ctx.quadraticCurveTo(315, 126, 472, 108);
      ctx.moveTo(155, 132);
      ctx.quadraticCurveTo(315, 148, 475, 132);
      ctx.stroke();

      // Distant logistics warehouse & silos (x=265)
      ctx.fillStyle = '#8b9298';
      roundRect(ctx, 232, 146, 68, 44, 4);
      ctx.fill();
      ctx.fillStyle = '#52585e';
      ctx.fillRect(228, 142, 76, 8);
      ctx.fillStyle = '#adb4ba';
      roundRect(ctx, 308, 136, 16, 54, 4);
      ctx.fill();
      roundRect(ctx, 328, 142, 16, 48, 4);
      ctx.fill();

      // Steel highway guardrail along horizon (svodidla y=186..195)
      ctx.fillStyle = '#9aa1a8';
      ctx.fillRect(0, 186, 1540, 6);
      ctx.fillStyle = '#6c737a';
      for (let gx = 16; gx < 1540; gx += 32) {
        ctx.fillRect(gx, 185, 4, 11);
      }

      // Conifer pine trees
      [34, 105, 210, 445, 580, 1485, 1518].forEach((tx, idx) => {
        const ty = 186 + (idx % 2) * 4;
        ctx.fillStyle = '#5c4433';
        ctx.fillRect(tx - 3, ty - 6, 6, 14);
        ctx.fillStyle = idx % 2 === 0 ? '#3f634c' : '#4b7359';
        [0, 12, 24].forEach((off, layer) => {
          const w = 18 - layer * 3.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty - 34 - off * 0.55);
          ctx.lineTo(tx - w, ty - 8 - off * 0.55);
          ctx.lineTo(tx + w, ty - 8 - off * 0.55);
          ctx.closePath();
          ctx.fill();
        });
      });
      ctx.restore();

      // Compacted gravel & industrial concrete ground
      ctx.fillStyle = '#bcb5a8';
      ctx.fillRect(0, 195, this.width, this.height - 195);
      ctx.strokeStyle = 'rgba(92, 88, 82, 0.18)';
      ctx.lineWidth = 1.5;
      for (let cx = 64; cx < this.width; cx += 90) {
        ctx.beginPath();
        ctx.moveTo(cx, 195);
        ctx.lineTo(cx, 595);
        ctx.stroke();
      }
    }

    _drawStage4Backdrop(ctx) {
      // Low modern horizon hills
      ctx.fillStyle = '#9bb0bc';
      ctx.beginPath();
      ctx.moveTo(0, 172);
      ctx.quadraticCurveTo(380, 146, 780, 168);
      ctx.quadraticCurveTo(1180, 144, 1540, 168);
      ctx.lineTo(1540, 210);
      ctx.lineTo(0, 210);
      ctx.closePath();
      ctx.fill();

      // Acoustic blue-glass & concrete highway noise barriers (protihlukové stěny y=154..195)
      ctx.save();
      ctx.fillStyle = '#89a7b8';
      ctx.fillRect(0, 154, 1540, 28);
      ctx.fillStyle = '#d3dce0';
      ctx.fillRect(0, 182, 1540, 13);
      ctx.fillStyle = '#536873';
      for (let px = 22; px < 1540; px += 46) {
        ctx.fillRect(px, 154, 5, 41);
      }

      // Overhead blue/emerald highway portal gantry frame (vector shapes only, no fillText)
      ctx.fillStyle = '#475963';
      ctx.fillRect(195, 92, 10, 102);
      ctx.fillRect(435, 92, 10, 102);
      roundRect(ctx, 190, 90, 260, 10, 4);
      ctx.fill();
      ctx.fillStyle = '#1b6e65';
      roundRect(ctx, 218, 72, 92, 34, 5);
      ctx.fill();
      ctx.fillStyle = '#2b5e8a';
      roundRect(ctx, 326, 72, 96, 34, 5);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(222, 76, 84, 26);
      ctx.strokeRect(330, 76, 88, 26);
      // White vector lane chevrons inside portal signs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(234, 83, 44, 5);
      ctx.fillRect(234, 92, 28, 4);
      ctx.fillRect(342, 83, 52, 5);
      ctx.fillRect(342, 92, 36, 4);

      // Tall curved double-arm LED highway light masts (x=110, 470, 1470)
      [110, 470, 1470].forEach((mx) => {
        ctx.fillStyle = '#5c6e78';
        ctx.fillRect(mx - 3, 98, 6, 96);
        ctx.fillRect(mx - 20, 96, 40, 4);
        ctx.fillStyle = '#b9f3f0';
        roundRect(ctx, mx - 24, 99, 14, 4, 2);
        ctx.fill();
        roundRect(ctx, mx + 10, 99, 14, 4, 2);
        ctx.fill();
      });

      // Columnar ornamental cypress trees in concrete planters (48, 165, 560, 1505)
      [48, 165, 560, 1505].forEach((tx) => {
        ctx.fillStyle = '#b8c4ca';
        roundRect(ctx, tx - 14, 184, 28, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#47725e';
        ctx.beginPath();
        ctx.ellipse(tx, 156, 11, 30, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Modern granite & architectural concrete plaza ground
      ctx.fillStyle = '#c2cbd0';
      ctx.fillRect(0, 195, this.width, this.height - 195);
      ctx.strokeStyle = 'rgba(72, 92, 102, 0.16)';
      ctx.lineWidth = 1.5;
      for (let gy = 235; gy < 595; gy += 55) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(this.width, gy);
        ctx.stroke();
      }
      for (let gx = 75; gx < this.width; gx += 75) {
        ctx.beginPath();
        ctx.moveTo(gx, 195);
        ctx.lineTo(gx, 595);
        ctx.stroke();
      }
    }

    _drawForecourtAndShop(ctx, _theme, t, state) {
      const stageId = this._getStageId(state);
      const decorLvl = state.save.upgrades.decor || 1;
      const STAGE_STYLES = {
        1: {
          roadColor: '#736f68',
          dashColor: '#efe2be',
          forecourtColor: '#7c7872',
          curbTop: '#ded4be',
          curbEdge: '#c5b89e',
          islandX: 54,
          islandW: 326,
          islandFill: '#d7cdb6',
          islandStroke: '#b4a88e',
          pillarColor: '#f3ead7',
          canopyColor: '#d86d53',
          canopyTrim: '#f7ebd5',
          canopyBadgeBg: '#fff6e5',
          canopyBadgeStroke: '#b8543d',
          canopyBadgeText: '#4e2a1d',
          canopyTitle: '🏡 VENKOVSKÁ BENZÍNKA',
          shopWall: '#f4e6cf',
          shopBorder: '#c49d74',
          floorColor: '#dcb98e',
          backWall: '#fdf4e3',
          roofMain: '#c8644c',
          roofAlt: '#f7ebd5',
          roofAlt2: '#d87a61',
          counterBase: '#9f6b47',
          counterTop: '#f1dec0',
          storageWall: '#e7dcc8',
          storageBorder: '#9e8468',
          storageFloor: '#cbb89d',
          storageBack: '#f2eadc',
          storageRoof: '#7d6b5d'
        },
        2: {
          roadColor: '#55585e',
          dashColor: '#ffffff',
          forecourtColor: '#61656c',
          curbTop: '#cfc9c0',
          curbEdge: '#a59f96',
          islandX: 54,
          islandW: 496,
          islandFill: '#d7dbe0',
          islandStroke: '#8d98a3',
          pillarColor: '#e3e9ed',
          canopyColor: '#2b6f8a',
          canopyTrim: '#e8f1f5',
          canopyBadgeBg: '#ffffff',
          canopyBadgeStroke: '#205469',
          canopyBadgeText: '#1b3d4d',
          canopyTitle: '🏙️ MĚSTSKÁ BENZÍNKA',
          shopWall: '#ece8e1',
          shopBorder: '#7f8c96',
          floorColor: '#dfdad0',
          backWall: '#f6f4f0',
          roofMain: '#355c7d',
          roofAlt: '#e8f1f5',
          roofAlt2: '#4b799e',
          counterBase: '#4a5d6e',
          counterTop: '#f2f5f7',
          storageWall: '#dce1e5',
          storageBorder: '#6b7a87',
          storageFloor: '#c7ced4',
          storageBack: '#edf1f4',
          storageRoof: '#4f6272'
        },
        3: {
          roadColor: '#4b4d50',
          dashColor: '#f2c14e',
          forecourtColor: '#585a5e',
          curbTop: '#c2bdb4',
          curbEdge: '#8a847b',
          islandX: 54,
          islandW: 496,
          islandFill: '#cbc6be',
          islandStroke: '#6c6e72',
          pillarColor: '#c8ccd0',
          canopyColor: '#373b40',
          canopyTrim: '#e0822d',
          canopyBadgeBg: '#2c3034',
          canopyBadgeStroke: '#e0822d',
          canopyBadgeText: '#ffe6c7',
          canopyTitle: '🚛 TRUCK STOP • TIR',
          shopWall: '#e5d6be',
          shopBorder: '#6e563f',
          floorColor: '#c7c0b4',
          backWall: '#f2e9da',
          roofMain: '#43484e',
          roofAlt: '#e0822d',
          roofAlt2: '#575d64',
          counterBase: '#6b4c35',
          counterTop: '#e5ccb0',
          storageWall: '#cfd2d6',
          storageBorder: '#5e6369',
          storageFloor: '#b6bac0',
          storageBack: '#e2e5e8',
          storageRoof: '#3f444a'
        },
        4: {
          roadColor: '#3d424a',
          dashColor: '#ffffff',
          forecourtColor: '#49505a',
          curbTop: '#cfd8dc',
          curbEdge: '#2a9d8f',
          islandX: 54,
          islandW: 496,
          islandFill: '#dde5e9',
          islandStroke: '#2a9d8f',
          pillarColor: '#dbe3e8',
          canopyColor: '#233138',
          canopyTrim: '#2a9d8f',
          canopyBadgeBg: '#172329',
          canopyBadgeStroke: '#80ed99',
          canopyBadgeText: '#e6fff2',
          canopyTitle: '🛣️ DÁLNIČNÍ CENTRUM 24/7',
          shopWall: '#edf2f4',
          shopBorder: '#2f3e46',
          floorColor: '#e4ebee',
          backWall: '#ffffff',
          roofMain: '#232f36',
          roofAlt: '#2a9d8f',
          roofAlt2: '#f4a261',
          counterBase: '#2f3e46',
          counterTop: '#ffffff',
          storageWall: '#dde4e8',
          storageBorder: '#3d4e58',
          storageFloor: '#c8d2d8',
          storageBack: '#f1f5f7',
          storageRoof: '#2b3942'
        }
      };
      const stStyle = STAGE_STYLES[stageId] || STAGE_STYLES[1];

      // Driveway road along the bottom
      ctx.fillStyle = stStyle.roadColor;
      ctx.fillRect(0, 595, this.width, 185);

      if (stageId === 1) {
        // Grassy country road verge at very bottom
        ctx.fillStyle = '#8ead6e';
        ctx.fillRect(0, 760, this.width, 20);
      }

      // Scaled asphalt forecourt & location grounds by stage (1 -> 2 -> 3 -> 4)
      if (stageId === 1) {
        // Compact 2-pump country forecourt + village green garden on the right
        ctx.fillStyle = stStyle.forecourtColor;
        roundRect(ctx, 42, 218, 380, 356, 24);
        ctx.fill();

        // Cozy village green garden in x: 438..604, y: 240..560
        ctx.save();
        ctx.fillStyle = '#9ec481';
        roundRect(ctx, 438, 240, 166, 320, 22);
        ctx.fill();
        ctx.fillStyle = '#7ca362';
        ctx.beginPath();
        ctx.arc(505, 378, 34, 0, Math.PI * 2);
        ctx.arc(482, 392, 22, 0, Math.PI * 2);
        ctx.arc(528, 392, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#73533d';
        ctx.fillRect(500, 396, 10, 28);
        ctx.fillStyle = '#e26d5c';
        [
          [492, 370], [516, 366], [504, 385], [478, 390], [530, 388]
        ].forEach(([ax, ay]) => {
          ctx.beginPath();
          ctx.arc(ax, ay, 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
        // Wooden garden bench (x=470, y=470)
        ctx.fillStyle = '#9c6644';
        roundRect(ctx, 452, 464, 52, 12, 3);
        ctx.fill();
        ctx.fillStyle = '#b07d52';
        roundRect(ctx, 450, 476, 56, 9, 3);
        ctx.fill();
        ctx.fillStyle = '#6c462b';
        ctx.fillRect(456, 485, 5, 8);
        ctx.fillRect(495, 485, 5, 8);
        // Flower beds
        this._drawFlowerBox(ctx, 548, 492, t);
        this._drawFlowerBox(ctx, 495, 542, t + 1.1);
        ctx.restore();
      } else if (stageId === 2) {
        // Medium 3-pump urban forecourt + tiled urban pedestrian strip
        ctx.fillStyle = stStyle.forecourtColor;
        roundRect(ctx, 24, 205, 564, 315, 24);
        ctx.fill();

        ctx.save();
        ctx.fillStyle = '#b8b3aa';
        roundRect(ctx, 24, 520, 564, 56, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(95, 92, 86, 0.25)';
        ctx.lineWidth = 1.2;
        for (let px = 64; px < 580; px += 44) {
          ctx.beginPath();
          ctx.moveTo(px, 522);
          ctx.lineTo(px, 574);
          ctx.stroke();
        }
        [70, 210, 360, 510].forEach((bx) => {
          ctx.fillStyle = '#757d84';
          roundRect(ctx, bx - 14, 538, 28, 16, 4);
          ctx.fill();
          ctx.fillStyle = '#5c8a6b';
          ctx.beginPath();
          ctx.arc(bx, 535, 10, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      } else if (stageId === 3) {
        // Large 590x380 truck-stop forecourt + lower TIR & BUS Bay
        ctx.fillStyle = stStyle.forecourtColor;
        roundRect(ctx, 14, 198, 590, 380, 24);
        ctx.fill();

        ctx.save();
        ctx.fillStyle = '#4b4e53';
        roundRect(ctx, 34, 454, 548, 114, 14);
        ctx.fill();
        ctx.strokeStyle = '#6b7075';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dashed yellow heavy-vehicle parking bay box (x: 224..568, y: 466..558)
        ctx.strokeStyle = '#f2c14e';
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 10]);
        roundRect(ctx, 224, 466, 344, 92, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Vector lane guidance chevrons >>> on asphalt (no fillText)
        ctx.strokeStyle = 'rgba(242, 193, 78, 0.55)';
        ctx.lineWidth = 4;
        [270, 340, 410, 480].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx, 502);
          ctx.lineTo(cx + 14, 512);
          ctx.lineTo(cx, 522);
          ctx.stroke();
        });
        ctx.restore();
      } else {
        // Massive 606x392 motorway megacenter forecourt + Mega TIR & BUS Terminal Bay
        ctx.fillStyle = stStyle.forecourtColor;
        roundRect(ctx, 6, 186, 606, 392, 24);
        ctx.fill();

        ctx.save();
        ctx.fillStyle = '#383f47';
        roundRect(ctx, 18, 448, 582, 124, 14);
        ctx.fill();
        ctx.strokeStyle = '#2a9d8f';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Illuminated emerald & yellow long-vehicle bay markings (x: 226..586, y: 462..560)
        ctx.strokeStyle = '#80ed99';
        ctx.lineWidth = 3;
        ctx.setLineDash([18, 10]);
        roundRect(ctx, 226, 462, 360, 98, 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = 'rgba(128, 237, 153, 0.5)';
        ctx.lineWidth = 4;
        [265, 335, 405, 475, 535].forEach((cx) => {
          ctx.beginPath();
          ctx.moveTo(cx, 500);
          ctx.lineTo(cx + 15, 511);
          ctx.lineTo(cx, 522);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Road lane markings by location
      ctx.save();
      if (stageId === 3) {
        // Double yellow center lines + white outer edge lines + road arrows + crash guardrail
        ctx.strokeStyle = stStyle.dashColor;
        ctx.lineWidth = 3.5;
        ctx.setLineDash([34, 22]);
        ctx.beginPath();
        ctx.moveTo(0, 684);
        ctx.lineTo(this.width, 684);
        ctx.moveTo(0, 692);
        ctx.lineTo(this.width, 692);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 608);
        ctx.lineTo(this.width, 608);
        ctx.moveTo(0, 762);
        ctx.lineTo(this.width, 762);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 248, 230, 0.45)';
        [180, 540, 960, 1340].forEach((ax) => {
          ctx.beginPath();
          ctx.moveTo(ax, 646);
          ctx.lineTo(ax + 34, 646);
          ctx.lineTo(ax + 34, 639);
          ctx.lineTo(ax + 52, 650);
          ctx.lineTo(ax + 34, 661);
          ctx.lineTo(ax + 34, 654);
          ctx.lineTo(ax, 654);
          ctx.closePath();
          ctx.fill();
        });

        ctx.fillStyle = '#9aa1a8';
        ctx.fillRect(0, 768, this.width, 6);
        ctx.fillStyle = '#62686e';
        for (let gx = 16; gx < this.width; gx += 42) {
          ctx.fillRect(gx, 766, 5, 14);
        }
      } else if (stageId === 4) {
        // Dual lane dividers + emerald bay edge strip + directional arrows
        ctx.strokeStyle = stStyle.dashColor;
        ctx.lineWidth = 3.5;
        ctx.setLineDash([36, 26]);
        ctx.beginPath();
        ctx.moveTo(0, 660);
        ctx.lineTo(this.width, 660);
        ctx.moveTo(0, 722);
        ctx.lineTo(this.width, 722);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(0, 602, this.width, 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(0, 768, this.width, 3);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        [160, 520, 900, 1280].forEach((ax) => {
          ctx.beginPath();
          ctx.moveTo(ax, 687);
          ctx.lineTo(ax + 38, 687);
          ctx.lineTo(ax + 38, 680);
          ctx.lineTo(ax + 58, 691);
          ctx.lineTo(ax + 38, 702);
          ctx.lineTo(ax + 38, 695);
          ctx.lineTo(ax, 695);
          ctx.closePath();
          ctx.fill();
        });
      } else {
        ctx.strokeStyle = stStyle.dashColor;
        ctx.lineWidth = 4;
        ctx.setLineDash([32, 24]);
        ctx.beginPath();
        ctx.moveTo(0, 688);
        ctx.lineTo(this.width, 688);
        ctx.stroke();

        if (stageId === 2) {
          // Pedestrian zebra crosswalk below shop doorway (x: 676..756, y: 606..668)
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
          for (let zx = 678; zx <= 746; zx += 16) {
            ctx.fillRect(zx, 606, 9, 58);
          }
        }
      }
      ctx.restore();

      // Sidewalk / curb between forecourt/shop and road
      ctx.fillStyle = stStyle.curbTop;
      ctx.fillRect(0, 578, this.width, 22);
      ctx.fillStyle = stStyle.curbEdge;
      ctx.fillRect(0, 596, this.width, 5);

      // Pump island raised concrete pad
      ctx.fillStyle = stStyle.islandFill;
      if (stageId === 1) {
        roundRect(ctx, 56, 272, 314, 60, 16);
      } else {
        roundRect(ctx, stStyle.islandX, 272, stStyle.islandW, 62, 16);
      }
      ctx.fill();
      ctx.strokeStyle = stStyle.islandStroke;
      ctx.lineWidth = 3;
      ctx.stroke();

      if (stageId === 3) {
        // Yellow/black diagonal hazard stripes on upper island + lower TIR island + cantilever mini-canopy
        ctx.save();
        [62, 526].forEach((hx) => {
          ctx.fillStyle = '#f2c14e';
          ctx.fillRect(hx, 280, 16, 46);
          ctx.fillStyle = '#2d3033';
          for (let sy = 282; sy < 322; sy += 10) {
            ctx.fillRect(hx, sy, 16, 5);
          }
        });
        ctx.fillStyle = '#cbc6be';
        roundRect(ctx, 58, 468, 156, 58, 12);
        ctx.fill();
        ctx.strokeStyle = '#f2c14e';
        ctx.lineWidth = 3;
        ctx.stroke();
        [64, 194].forEach((hx) => {
          ctx.fillStyle = '#f2c14e';
          ctx.fillRect(hx, 476, 12, 42);
          ctx.fillStyle = '#2d3033';
          for (let sy = 478; sy < 516; sy += 9) {
            ctx.fillRect(hx, sy, 12, 4);
          }
        });
        ctx.fillStyle = '#6c737a';
        ctx.fillRect(80, 444, 10, 40);
        ctx.fillStyle = '#373b40';
        roundRect(ctx, 50, 426, 172, 24, 8);
        ctx.fill();
        ctx.fillStyle = '#e0822d';
        roundRect(ctx, 50, 442, 172, 8, 4);
        ctx.fill();
        ctx.restore();
      } else if (stageId === 4) {
        ctx.fillStyle = 'rgba(42, 157, 143, 0.35)';
        roundRect(ctx, 64, 278, 476, 50, 12);
        ctx.fill();

        // Mega TIR & BUS raised granite island + illuminated portal roof
        ctx.save();
        ctx.fillStyle = '#dde5e9';
        roundRect(ctx, 52, 466, 166, 60, 14);
        ctx.fill();
        ctx.strokeStyle = '#2a9d8f';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = 'rgba(42, 157, 143, 0.32)';
        roundRect(ctx, 60, 473, 150, 46, 10);
        ctx.fill();

        ctx.fillStyle = '#788b94';
        ctx.fillRect(72, 442, 10, 42);
        ctx.fillRect(194, 442, 10, 42);
        ctx.fillStyle = '#233138';
        roundRect(ctx, 42, 422, 186, 26, 8);
        ctx.fill();
        ctx.fillStyle = '#2a9d8f';
        roundRect(ctx, 42, 439, 186, 9, 4);
        ctx.fill();
        ctx.fillStyle = '#80ed99';
        ctx.fillRect(48, 442, 174, 3);
        ctx.restore();
      }

      // Canopy scaling by stage (short 2-pump in Stage 1 -> wider in Stage 3 -> widest in Stage 4)
      const canopyGeom =
        stageId === 1
          ? { x: 46, y: 118, w: 340, h: 50, p1: 76, p2: 348, cx: 216 }
          : stageId === 3
          ? { x: 32, y: 110, w: 544, h: 58, p1: 72, p2: 520, cx: 304 }
          : stageId === 4
          ? { x: 20, y: 104, w: 568, h: 64, p1: 68, p2: 526, cx: 304 }
          : { x: 36, y: 114, w: 536, h: 54, p1: 72, p2: 520, cx: 304 };

      // Canopy shadow on ground
      ctx.fillStyle = 'rgba(65, 48, 34, 0.14)';
      roundRect(ctx, canopyGeom.x + 8, 210, canopyGeom.w - 16, 40, 12);
      ctx.fill();

      // Canopy pillars
      ctx.fillStyle = stStyle.pillarColor;
      ctx.fillRect(canopyGeom.p1, 162, 16, 120);
      ctx.fillRect(canopyGeom.p2, 162, 16, 120);

      // Pump Canopy Roof
      ctx.fillStyle = stStyle.canopyColor;
      roundRect(ctx, canopyGeom.x, canopyGeom.y, canopyGeom.w, canopyGeom.h, 14);
      ctx.fill();
      ctx.fillStyle = stStyle.canopyTrim;
      roundRect(ctx, canopyGeom.x, 148, canopyGeom.w, 16, 6);
      ctx.fill();
      if (stageId === 4) {
        ctx.fillStyle = '#80ed99';
        ctx.fillRect(canopyGeom.x + 10, 155, canopyGeom.w - 20, 3);
      }

      // Decor upgrades: flower boxes and fairy lights
      if (decorLvl >= 1) {
        this._drawFlowerBox(ctx, 60, 294, t);
        this._drawFlowerBox(ctx, stageId === 1 ? 354 : 526, 294, t);
      }
      if (decorLvl >= 2) {
        this._drawFairyLights(ctx, canopyGeom.x + 10, 164, canopyGeom.x + canopyGeom.w - 10, 164, t);
      }
      if (decorLvl >= 3) {
        this._drawFlowerBox(ctx, 648, 576, t);
        this._drawFlowerBox(ctx, 1285, 576, t);
      }

      // Main Shop & Bistro (exact structural bounds: x: 620..1310, y: 138..582)
      ctx.save();
      if (stageId === 4) {
        // Giant 2-Story Flagship Megacenter upper level & illuminated glass mezzanine (x: 610..1534, y: 66..152)
        ctx.fillStyle = '#1b262c';
        roundRect(ctx, 610, 66, 924, 86, 14);
        ctx.fill();
        ctx.strokeStyle = '#2a9d8f';
        ctx.lineWidth = 3;
        ctx.stroke();
        for (let gx = 632; gx < 1510; gx += 48) {
          ctx.fillStyle = gx % 96 === 0 ? '#87c5d1' : '#a8dbe5';
          roundRect(ctx, gx, 78, 36, 42, 5);
          ctx.fill();
        }
        ctx.fillStyle = '#2a9d8f';
        ctx.fillRect(618, 128, 908, 10);
        ctx.fillStyle = '#f4a261';
        ctx.fillRect(622, 70, 900, 4);
      }

      ctx.fillStyle = stStyle.shopWall;
      roundRect(ctx, 620, stageId === 3 ? 128 : 138, 690, stageId === 3 ? 454 : 444, 18);
      ctx.fill();
      ctx.strokeStyle = stStyle.shopBorder;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Shop interior floor
      ctx.fillStyle = stStyle.floorColor;
      roundRect(ctx, 634, 224, 662, 348, 12);
      ctx.fill();
      if (stageId === 1) {
        // Oak plank lines + wooden veranda planking on right aisle (x: 1255..1306)
        ctx.fillStyle = '#cda377';
        roundRect(ctx, 1255, 160, 51, 412, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(130, 88, 50, 0.22)';
        ctx.lineWidth = 1.5;
        for (let py = 250; py < 568; py += 26) {
          ctx.beginPath();
          ctx.moveTo(638, py);
          ctx.lineTo(1302, py);
          ctx.stroke();
        }
      } else if (stageId === 2) {
        // Checkered ceramic floor tiles
        ctx.fillStyle = '#d2ccc0';
        for (let ty = 228; ty < 566; ty += 36) {
          for (let tx = 638; tx < 1284; tx += 36) {
            if (((Math.floor(tx / 36) + Math.floor(ty / 36)) % 2) === 0) {
              ctx.fillRect(tx, ty, Math.min(34, 1294 - tx), Math.min(34, 570 - ty));
            }
          }
        }
      } else if (stageId === 3) {
        // Slate stone slab joints
        ctx.strokeStyle = 'rgba(72, 64, 56, 0.22)';
        ctx.lineWidth = 1.5;
        for (let py = 264; py < 568; py += 42) {
          ctx.beginPath();
          ctx.moveTo(638, py);
          ctx.lineTo(1292, py);
          ctx.stroke();
        }
        for (let px = 695; px < 1280; px += 72) {
          ctx.beginPath();
          ctx.moveTo(px, 228);
          ctx.lineTo(px, 568);
          ctx.stroke();
        }
      } else {
        // Bright modern porcelain tiles
        ctx.strokeStyle = 'rgba(47, 62, 70, 0.14)';
        ctx.lineWidth = 1.2;
        for (let py = 272; py < 568; py += 48) {
          ctx.beginPath();
          ctx.moveTo(638, py);
          ctx.lineTo(1292, py);
          ctx.stroke();
        }
        for (let px = 684; px < 1290; px += 52) {
          ctx.beginPath();
          ctx.moveTo(px, 228);
          ctx.lineTo(px, 568);
          ctx.stroke();
        }
      }

      // Back wall inside shop
      ctx.fillStyle = stStyle.backWall;
      roundRect(ctx, 634, 158, 662, 72, 8);
      ctx.fill();

      // Scaled shop roof fascia by stage (Stage 1 cottage -> Stage 2 urban -> Stage 3 high ridge motorest -> Stage 4 2-story megacenter)
      if (stageId === 1) {
        ctx.fillStyle = stStyle.roofMain;
        roundRect(ctx, 614, 106, 641, 46, 14);
        ctx.fill();
        for (let sx = 622; sx < 1246; sx += 38) {
          ctx.fillStyle = Math.floor(sx / 38) % 2 === 0 ? stStyle.roofAlt : stStyle.roofAlt2;
          ctx.beginPath();
          ctx.arc(sx + 17, 152, 17, 0, Math.PI);
          ctx.fill();
        }
      } else if (stageId === 2) {
        ctx.fillStyle = stStyle.roofMain;
        roundRect(ctx, 614, 102, 702, 50, 14);
        ctx.fill();
        for (let sx = 626; sx < 1294; sx += 34) {
          ctx.fillStyle = Math.floor(sx / 34) % 2 === 0 ? stStyle.roofAlt : stStyle.roofAlt2;
          ctx.fillRect(sx, 140, 30, 14);
        }
      } else if (stageId === 3) {
        // High-ridge roadside motorest roof (y: 90..150)
        ctx.fillStyle = '#393e44';
        roundRect(ctx, 612, 90, 706, 60, 14);
        ctx.fill();
        ctx.fillStyle = stStyle.roofAlt;
        ctx.fillRect(618, 138, 694, 12);
        ctx.fillStyle = stStyle.roofAlt2;
        for (let rx = 636; rx < 1296; rx += 46) {
          ctx.fillRect(rx, 96, 14, 38);
        }
      } else {
        ctx.fillStyle = stStyle.roofAlt;
        roundRect(ctx, 622, 138, 686, 12, 5);
        ctx.fill();
        ctx.fillStyle = stStyle.roofAlt2;
        ctx.fillRect(628, 130, 674, 4);
      }

      if (decorLvl >= 2) {
        this._drawFairyLights(ctx, 638, 158, 1292, 158, t + 1.3);
      }

      // Service Counter facing DOWN toward shop floor (exact bounds: x: 705, y: 312, w: 530, h: 32)
      ctx.fillStyle = stStyle.counterBase;
      roundRect(ctx, 705, 312, 530, 32, 8);
      ctx.fill();
      ctx.fillStyle = stStyle.counterTop;
      roundRect(ctx, 700, 306, 540, 12, 6);
      ctx.fill();

      // Subtle floor mat at register & waiting counter spots
      ctx.fillStyle = stageId >= 4 ? 'rgba(42, 157, 143, 0.16)' : 'rgba(224, 122, 95, 0.18)';
      ctx.beginPath();
      ctx.ellipse(745, 398, 26, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      window.GAME_DATA.SHOP_SPOTS.forEach((spot) => {
        ctx.fillStyle = stageId >= 4 ? 'rgba(47, 62, 70, 0.12)' : 'rgba(159, 107, 71, 0.14)';
        ctx.beginPath();
        ctx.ellipse(spot.x, spot.y + 16, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // Welcome doormat & open doorway gap in bottom shop wall (exact doorway: x: 678..754)
      ctx.fillStyle = stStyle.floorColor;
      ctx.fillRect(678, 570, 76, 18);
      ctx.fillStyle = stageId === 1 ? '#a4654b' : stageId === 2 ? '#3b5c75' : stageId === 3 ? '#5c4b3b' : '#2a9d8f';
      roundRect(ctx, 678, 566, 76, 20, 6);
      ctx.fill();

      // Adjacent Side Storage Room & Outdoor Wing scaled progressively per stage
      const storageGeom =
        stageId === 1
          ? { x: 1312, y: 172, w: 172, h: 274, ry: 148, rw: 180, rh: 30, topWallY: 172, botWallEnd: 446 }
          : stageId === 2
          ? { x: 1312, y: 152, w: 196, h: 318, ry: 122, rw: 204, rh: 34, topWallY: 156, botWallEnd: 470 }
          : stageId === 3
          ? { x: 1312, y: 134, w: 214, h: 342, ry: 108, rw: 222, rh: 34, topWallY: 138, botWallEnd: 476 }
          : { x: 1312, y: 138, w: 220, h: 444, ry: 124, rw: 222, rh: 24, topWallY: 144, botWallEnd: 476 };

      ctx.fillStyle = stStyle.storageWall;
      roundRect(ctx, storageGeom.x, storageGeom.y, storageGeom.w, storageGeom.h, 14);
      ctx.fill();
      ctx.strokeStyle = stStyle.storageBorder;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Storage interior hall
      ctx.fillStyle = stStyle.storageFloor;
      roundRect(ctx, 1318, storageGeom.y + 42, storageGeom.w - 12, Math.min(280, storageGeom.h - 48), 10);
      ctx.fill();
      ctx.fillStyle = stStyle.storageBack;
      roundRect(ctx, 1318, storageGeom.y + 10, storageGeom.w - 12, 38, 6);
      ctx.fill();

      if (stageId < 4) {
        ctx.fillStyle = stStyle.storageRoof;
        roundRect(ctx, 1308, storageGeom.ry, storageGeom.rw, storageGeom.rh, 12);
        ctx.fill();
        if (stageId === 3) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 2;
          for (let sx = 1320; sx < 1520; sx += 16) {
            ctx.beginPath();
            ctx.moveTo(sx, storageGeom.ry + 4);
            ctx.lineTo(sx, storageGeom.ry + storageGeom.rh - 4);
            ctx.stroke();
          }
        }
      }

      // Right-side patio / trucker deck / VIP lounge below storage room (y: 456..576)
      if (stageId === 1) {
        // Grassy garden & flower bushes beside cottage shed (y: 456..570)
        ctx.fillStyle = '#9ec481';
        roundRect(ctx, 1322, 456, 170, 114, 16);
        ctx.fill();
        this._drawFlowerBox(ctx, 1372, 520, t + 0.5);
        this._drawFlowerBox(ctx, 1446, 540, t + 1.4);
      } else if (stageId === 2) {
        // Tiled outdoor city bistro patio (1322..1512, y: 480..572) with 2 cafe tables & parasols
        ctx.fillStyle = '#c5bfb5';
        roundRect(ctx, 1322, 480, 190, 92, 12);
        ctx.fill();
        [1370, 1462].forEach((tx) => {
          ctx.fillStyle = '#4a5d6e';
          ctx.beginPath();
          ctx.arc(tx, 528, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e8f1f5';
          ctx.beginPath();
          ctx.arc(tx, 520, 22, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#2b6f8a';
          ctx.beginPath();
          ctx.arc(tx, 520, 11, Math.PI, 0);
          ctx.fill();
        });
      } else if (stageId === 3) {
        // Covered timber trucker deck (1312..1526, y: 478..576) with wooden picnic tables
        ctx.fillStyle = '#8b6343';
        roundRect(ctx, 1314, 478, 212, 98, 12);
        ctx.fill();
        ctx.strokeStyle = '#5c3f28';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        [1368, 1472].forEach((tx) => {
          ctx.fillStyle = '#cda377';
          roundRect(ctx, tx - 22, 514, 44, 24, 4);
          ctx.fill();
          ctx.fillStyle = '#6c462b';
          ctx.fillRect(tx - 24, 506, 48, 5);
          ctx.fillRect(tx - 24, 541, 48, 5);
        });
      } else {
        // Glazed indoor VIP driver lounge inside full-height right wing (x: 1318..1526, y: 478..576)
        ctx.fillStyle = '#d4e2e8';
        roundRect(ctx, 1318, 478, 206, 98, 10);
        ctx.fill();
        ctx.fillStyle = '#2a9d8f';
        roundRect(ctx, 1334, 494, 58, 22, 6);
        ctx.fill();
        roundRect(ctx, 1442, 494, 58, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#f4a261';
        ctx.beginPath();
        ctx.arc(1418, 542, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dividing wall segments with open doorway archway (y: 255..375)
      ctx.fillStyle = stStyle.shopBorder;
      ctx.fillRect(1307, storageGeom.topWallY, 8, 255 - storageGeom.topWallY);
      ctx.fillRect(1307, 375, 8, storageGeom.botWallEnd - 375);

      // Doorway threshold floor
      ctx.fillStyle = stStyle.storageFloor;
      ctx.fillRect(1302, 255, 18, 120);
      ctx.strokeStyle = stStyle.storageBorder;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1311, 255);
      ctx.lineTo(1311, 262);
      ctx.moveTo(1311, 368);
      ctx.lineTo(1311, 375);
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
      const upgrades = state.save.upgrades || {};
      const lim = state.stageLimits || {
        maxPumps: 3,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock']
      };
      const pumpsUnlocked = Math.min(lim.maxPumps || 3, upgrades.pump_unlock || 1);

      Object.values(stations).forEach((st) => {
        if (st.id === 'pump_1' && pumpsUnlocked < 2) return;
        if (st.id === 'pump_2' && pumpsUnlocked < 3) return;
        if (st.id === 'pump_3' && !lim.hasHeavyPump) return;
        if (st.id === 'bucket' && (!lim.allowedUnlocks.includes('wash_unlock') || (upgrades.wash_unlock || 1) < 2)) return;
        if (st.id === 'grill' && (!lim.allowedUnlocks.includes('grill_unlock') || (upgrades.grill_unlock || 1) < 2)) return;
        if (st.id === 'fridge' && (!lim.allowedUnlocks.includes('fridge_unlock') || (upgrades.fridge_unlock || 1) < 2)) return;
        const isLockedPump = false;
        const isHovered =
          state.hoveredTarget &&
          (state.hoveredTarget.kind === 'station' || state.hoveredTarget.kind === 'prep_target') &&
          state.hoveredTarget.id === st.id;

        ctx.save();
        if (isHovered && !isLockedPump) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 18;
        }

        if (st.type === 'pump') {
          this._drawFuelPump(ctx, st, isLockedPump, isHovered, state);
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
        const rot = rack.rot || 0;
        const isVert = rot % 2 === 1;
        const isHovered =
          state.hoveredTarget &&
          (state.hoveredTarget.kind === 'rack' || state.hoveredTarget.kind === 'prep_target') &&
          state.hoveredTarget.id === rack.id;

        // Subtle customer-front mat showing which side customers approach
        ctx.save();
        ctx.fillStyle = 'rgba(107, 163, 104, 0.2)';
        ctx.beginPath();
        if (rot === 0) ctx.ellipse(rack.x, rack.y + 42, 24, 7, 0, 0, Math.PI * 2);
        else if (rot === 2) ctx.ellipse(rack.x, rack.y - 36, 24, 7, 0, 0, Math.PI * 2);
        else if (rot === 1) ctx.ellipse(rack.x - 36, rack.y, 7, 24, 0, 0, Math.PI * 2);
        else ctx.ellipse(rack.x + 36, rack.y, 7, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        if (isHovered) {
          ctx.shadowColor = '#ffd166';
          ctx.shadowBlur = 18;
        }

        const slots = Math.min(rack.maxStock, 8);
        const itemColor = rackColors[rack.id] || '#e07a5f';

        if (!isVert) {
          // Horizontal rack (0° facing South, 180° facing North)
          ctx.fillStyle = 'rgba(65, 45, 30, 0.16)';
          roundRect(ctx, rack.x - 42, rack.y - 10, 84, 34, 10);
          ctx.fill();

          ctx.fillStyle = '#9a6843';
          roundRect(ctx, rack.x - 40, rack.y - 26, 80, 44, 10);
          ctx.fill();
          ctx.strokeStyle = '#6c462b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Two horizontal shelf boards
          ctx.fillStyle = '#e7cfa9';
          roundRect(ctx, rack.x - 35, rack.y - 21, 70, 15, 4);
          ctx.fill();
          roundRect(ctx, rack.x - 35, rack.y - 1, 70, 15, 4);
          ctx.fill();

          // Front customer lip accent
          ctx.fillStyle = '#ffe094';
          if (rot === 0) {
            roundRect(ctx, rack.x - 32, rack.y + 15, 64, 4, 2);
          } else {
            roundRect(ctx, rack.x - 32, rack.y - 27, 64, 4, 2);
          }
          ctx.fill();

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
        } else {
          // Vertical rack (90° facing West, 270° facing East)
          ctx.fillStyle = 'rgba(65, 45, 30, 0.16)';
          roundRect(ctx, rack.x - 26, rack.y - 28, 52, 70, 10);
          ctx.fill();

          ctx.fillStyle = '#9a6843';
          roundRect(ctx, rack.x - 24, rack.y - 38, 48, 76, 10);
          ctx.fill();
          ctx.strokeStyle = '#6c462b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Two vertical shelf columns
          ctx.fillStyle = '#e7cfa9';
          roundRect(ctx, rack.x - 19, rack.y - 33, 16, 66, 4);
          ctx.fill();
          roundRect(ctx, rack.x + 3, rack.y - 33, 16, 66, 4);
          ctx.fill();

          // Front customer lip accent
          ctx.fillStyle = '#ffe094';
          if (rot === 1) {
            roundRect(ctx, rack.x - 25, rack.y - 30, 4, 60, 2);
          } else {
            roundRect(ctx, rack.x + 21, rack.y - 30, 4, 60, 2);
          }
          ctx.fill();

          for (let i = 0; i < slots; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const ix = rack.x - 11 + col * 22;
            const iy = rack.y - 24 + row * 16;
            ctx.globalAlpha = i < rack.stock ? 1 : 0.16;
            ctx.fillStyle = itemColor;
            roundRect(ctx, ix - 5, iy - 5, 10, 11, 2);
            ctx.fill();
          }
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
        const by = rack.y - (isVert ? 52 : 38) + pulse;
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

        this._drawStationTag(ctx, rack.x, rack.y + (isVert ? 48 : 30), rack.label, isHovered);
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

    _drawFuelPump(ctx, st, isLocked, isHovered, state) {
      const stageId = this._getStageId(state);
      const PUMP_PALETTES = {
        1: { frame: '#5c4b43', body: '#e07a5f', panel: '#c65d44', heavyCap: '#f2c14e' },
        2: { frame: '#37424a', body: '#357b96', panel: '#24586e', heavyCap: '#f2c14e' },
        3: { frame: '#33373b', body: '#e08a2e', panel: '#b8651b', heavyCap: '#f2c14e' },
        4: { frame: '#26353d', body: '#2a9d8f', panel: '#1d6f65', heavyCap: '#80ed99' }
      };
      const pal = PUMP_PALETTES[stageId] || PUMP_PALETTES[1];

      ctx.save();
      ctx.globalAlpha = isLocked ? 0.45 : 1;
      if (st.isHeavyPump) {
        // Heavy-duty dual-hose high-flow TIR / BUS dispenser (w: 58, h: 74)
        ctx.fillStyle = pal.heavyCap;
        roundRect(ctx, st.x - 26, st.y - 42, 52, 8, 4);
        ctx.fill();
        ctx.fillStyle = pal.frame;
        roundRect(ctx, st.x - 29, st.y - 37, 58, 74, 10);
        ctx.fill();
        ctx.fillStyle = pal.body;
        roundRect(ctx, st.x - 26, st.y - 33, 52, 66, 8);
        ctx.fill();
        ctx.fillStyle = '#fff8eb';
        roundRect(ctx, st.x - 19, st.y - 26, 38, 21, 4);
        ctx.fill();

        // Dual heavy-flow hoses (left & right)
        ctx.strokeStyle = '#2d3033';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(st.x - 26, st.y - 8);
        ctx.quadraticCurveTo(st.x - 40, st.y + 8, st.x - 26, st.y + 24);
        ctx.moveTo(st.x + 26, st.y - 8);
        ctx.quadraticCurveTo(st.x + 40, st.y + 8, st.x + 26, st.y + 24);
        ctx.stroke();

        ctx.fillStyle = pal.panel;
        roundRect(ctx, st.x - 16, st.y + 4, 32, 16, 4);
        ctx.fill();
        ctx.restore();

        this._drawStationTag(ctx, st.x, st.y + 46, st.label, isHovered && !isLocked);
        return;
      }

      ctx.fillStyle = pal.frame;
      roundRect(ctx, st.x - 24, st.y - 34, 48, 68, 10);
      ctx.fill();
      ctx.fillStyle = isLocked ? '#9e978e' : pal.body;
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

      ctx.fillStyle = isLocked ? '#7e766e' : pal.panel;
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

      const wheelBounce = car.state === 'arriving' || car.state === 'leaving' ? Math.sin(t * 25) * 1.5 : 0;

      if (car.variant === 'truck') {
        ctx.fillStyle = 'rgba(40, 32, 26, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 26, 74, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Exhaust stack behind cab
        ctx.fillStyle = '#5f6770';
        roundRect(ctx, 11, -46, 5, 20, 2);
        ctx.fill();

        // Large cargo trailer
        ctx.fillStyle = '#eef2f6';
        roundRect(ctx, -68, -42, 84, 56, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(60, 45, 35, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Accent stripe along cargo trailer
        ctx.fillStyle = car.color || '#4e79a7';
        roundRect(ctx, -66, -14, 80, 12, 3);
        ctx.fill();

        // Trailer vertical ribs
        ctx.strokeStyle = 'rgba(90, 105, 125, 0.22)';
        ctx.lineWidth = 1.5;
        [-48, -28, -8].forEach((rx) => {
          ctx.beginPath();
          ctx.moveTo(rx, -38);
          ctx.lineTo(rx, -18);
          ctx.stroke();
        });

        // Tractor cab
        ctx.fillStyle = car.color || '#4e79a7';
        roundRect(ctx, 18, -32, 46, 46, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(60, 45, 35, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cab window
        ctx.fillStyle = '#d8edf2';
        roundRect(ctx, 30, -26, 26, 15, 4);
        ctx.fill();

        // Headlight & taillight
        ctx.fillStyle = '#fff1a8';
        roundRect(ctx, 57, -2, 8, 10, 3);
        ctx.fill();
        ctx.fillStyle = '#e06458';
        roundRect(ctx, -69, -4, 7, 10, 3);
        ctx.fill();

        [-50, -24, 42].forEach((wx) => {
          ctx.fillStyle = '#3b3634';
          ctx.beginPath();
          ctx.arc(wx, 18 + wheelBounce, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e6decb';
          ctx.beginPath();
          ctx.arc(wx, 18 + wheelBounce, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (car.variant === 'bus') {
        ctx.fillStyle = 'rgba(40, 32, 26, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 26, 72, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Upper coach body
        ctx.fillStyle = car.roofColor || '#fff3d6';
        roundRect(ctx, -64, -44, 128, 36, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(60, 45, 35, 0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Lower coach body
        ctx.fillStyle = car.color || '#e09f3e';
        roundRect(ctx, -66, -18, 132, 34, 11);
        ctx.fill();
        ctx.stroke();

        // Panoramic passenger windows & front windshield
        ctx.fillStyle = '#d8edf2';
        [-54, -29, -4, 21].forEach((wx) => {
          roundRect(ctx, wx, -38, 21, 15, 4);
          ctx.fill();
        });
        roundRect(ctx, 46, -38, 13, 17, 4);
        ctx.fill();

        // Headlight & taillight
        ctx.fillStyle = '#fff1a8';
        roundRect(ctx, 60, -4, 8, 10, 3);
        ctx.fill();
        ctx.fillStyle = '#e06458';
        roundRect(ctx, -68, -4, 7, 10, 3);
        ctx.fill();

        [-42, 42].forEach((wx) => {
          ctx.fillStyle = '#3b3634';
          ctx.beginPath();
          ctx.arc(wx, 18 + wheelBounce, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e6decb';
          ctx.beginPath();
          ctx.arc(wx, 18 + wheelBounce, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
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
      }

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

    _getWorkerTaskLabel(w) {
      if (!w || w.isPlayer) return null;
      const task = w.currentTask || (w.taskQueue && w.taskQueue.length > 0 ? w.taskQueue[0] : null);
      if (!task) return null;
      if (task.type === 'fuelCar') {
        const num = (task.pumpIndex || 0) + 1;
        return w.actionTimer > 0 ? `⛽ Tankuji (Stojan ${num})` : `⛽ Jdu natankovat (Stojan ${num})`;
      }
      if (task.type === 'prep') {
        if (task.itemId === 'wash') {
          return w.actionTimer > 0 ? '🧽 Nabírám vodu na okna' : '🧽 Jdu pro vodu na okna';
        }
        if (task.itemId === 'crate') {
          return w.actionTimer > 0 ? '📦 Beru krabici ze skladu' : '📦 Jdu do skladu pro zboží';
        }
        const it = window.GAME_DATA.ITEMS[task.itemId];
        const name = it ? it.name : task.itemId;
        const ic = it ? it.icon : '🍽️';
        return w.actionTimer > 0 ? `${ic} Připravuji: ${name}` : `${ic} Jdu připravit: ${name}`;
      }
      if (task.type === 'serveCar') {
        return '🧽 Jdu umýt okna u auta';
      }
      if (task.type === 'serveCustomer') {
        const it = window.GAME_DATA.ITEMS[task.itemId];
        return `${it ? it.icon : '🍽️'} Nesu zákazníkovi: ${it ? it.name : 'objednávku'}`;
      }
      if (task.type === 'register') {
        return w.actionTimer > 0 ? '📠 Markuji u pokladny' : '📠 Jdu obsloužit pokladnu';
      }
      if (task.type === 'restockRack') {
        const r = window.GAME_DATA.RACKS[task.rackId];
        const rName = r ? r.label.toLowerCase() : 'regál';
        return w.actionTimer > 0 ? `📦 Doplňuji ${rName}` : `📦 Jdu doplnit ${rName}`;
      }
      if (task.type === 'takeBroom') {
        return '🧹 Jdu uklízet';
      }
      if (task.type === 'cleanSpill') {
        return w.actionTimer > 0 ? '🧹 Uklízím louži' : '🧹 Jdu uklízet';
      }
      if (task.type === 'returnBroom') {
        return '🧹 Jdu vrátit koště';
      }
      if (task.type === 'trash') {
        const names =
          w.held && w.held.length > 0
            ? w.held.map((id) => (window.GAME_DATA.ITEMS[id] ? window.GAME_DATA.ITEMS[id].name : id)).join(', ')
            : 'věci';
        return `🗑️ Jdu vyhodit ${names} do koše`;
      }
      if (task.type === 'returnHome') {
        return '🚶 Vracím se na místo';
      }
      return null;
    }

    _drawWorkerOverlay(ctx, w, _t, state) {
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

      if ((!state || !state.prepMode) && !w.isPlayer) {
        const taskLabel = this._getWorkerTaskLabel(w);
        if (taskLabel) {
          ctx.font = '700 10.5px "Nunito", "Segoe UI", sans-serif';
          const tw = ctx.measureText(taskLabel).width + 14;
          const tx = Math.min(Math.max(w.x, tw / 2 + 8), this.width - tw / 2 - 8);
          const ty = w.y + 52;
          ctx.fillStyle = 'rgba(45, 34, 27, 0.88)';
          roundRect(ctx, tx - tw / 2, ty - 9.5, tw, 19, 8);
          ctx.fill();
          ctx.strokeStyle = '#d9b99b';
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = '#fff8eb';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(taskLabel, tx, ty + 0.5);
        }
      }

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

    _drawPlacementOverlay(ctx, t, state) {
      const pm = state.placementMode;
      if (!pm) return;

      ctx.save();
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2.5;
      if (pm.kind === 'rack') {
        ctx.fillStyle = 'rgba(107, 163, 104, 0.1)';
        ctx.strokeStyle = '#6ba368';
        roundRect(ctx, 685, 400, 580, 155, 14);
        ctx.fill();
        ctx.stroke();

        ctx.setLineDash([]);
        const zoneTxt = '📦 Prostor pro umístění regálů (Klikni pro položení · R = Otočit)';
        ctx.font = '800 11px "Nunito", "Segoe UI", sans-serif';
        const zw = ctx.measureText(zoneTxt).width + 18;
        ctx.fillStyle = 'rgba(255, 250, 240, 0.95)';
        roundRect(ctx, 975 - zw / 2, 402, zw, 22, 10);
        ctx.fill();
        ctx.strokeStyle = '#6ba368';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#2d6229';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zoneTxt, 975, 413);
      } else {
        ctx.fillStyle = 'rgba(217, 130, 43, 0.12)';
        ctx.strokeStyle = '#d9822b';
        roundRect(ctx, 650, 150, 515, 75, 14);
        ctx.fill();
        ctx.stroke();

        ctx.setLineDash([]);
        const zoneTxt = '☕ Zadní pult pro stroje bistra (Klikni pro položení)';
        ctx.font = '800 11px "Nunito", "Segoe UI", sans-serif';
        const zw = ctx.measureText(zoneTxt).width + 18;
        ctx.fillStyle = 'rgba(255, 250, 240, 0.95)';
        roundRect(ctx, 908 - zw / 2, 148, zw, 22, 10);
        ctx.fill();
        ctx.strokeStyle = '#d9822b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#7b4814';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zoneTxt, 908, 159);
      }

      // Highlighted placement ghost outline around active object
      const isVert = pm.kind === 'rack' && (pm.rot || 0) % 2 === 1;
      const bw = pm.kind === 'rack' ? (isVert ? 62 : 94) : 78;
      const bh = pm.kind === 'rack' ? (isVert ? 90 : 58) : 78;
      const strokeCol = pm.valid ? '#4f9d69' : '#e05a47';
      const fillCol = pm.valid ? 'rgba(79, 157, 105, 0.18)' : 'rgba(224, 90, 71, 0.22)';
      const pulse = 1 + Math.sin(t * 7) * 0.03;

      ctx.save();
      ctx.translate(pm.x, pm.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = fillCol;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 12);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (pm.kind === 'rack') {
        const rot = pm.rot || 0;
        const arrows = [
          [pm.x, pm.y + 48, '⬇️ Vchod'],
          [pm.x - 52, pm.y, '⬅️ Vchod'],
          [pm.x, pm.y - 42, '⬆️ Vchod'],
          [pm.x + 52, pm.y, '➡️ Vchod']
        ];
        const [ax, ay, aTxt] = arrows[rot];
        ctx.font = '800 11px "Nunito", "Segoe UI", sans-serif';
        const aw = ctx.measureText(aTxt).width + 12;
        ctx.fillStyle = 'rgba(255, 250, 240, 0.96)';
        roundRect(ctx, ax - aw / 2, ay - 10, aw, 20, 9);
        ctx.fill();
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#3c2415';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(aTxt, ax, ay);
      }

      const statusText = pm.valid ? '✅ Klikni pro umístění' : '⚠️ Sem nelze umístit';
      ctx.font = '800 12px "Nunito", "Segoe UI", sans-serif';
      const sw = ctx.measureText(statusText).width + 16;
      const sx = Math.min(Math.max(pm.x, 700), 1245);
      const sy = pm.y - bh / 2 - 22;
      ctx.fillStyle = strokeCol;
      roundRect(ctx, sx - sw / 2, sy - 11, sw, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(statusText, sx, sy);

      ctx.restore();
    }

    _drawPrepUpgradeBadges(ctx, t, state) {
      const upgrades = state.save.upgrades || {};
      const staff = state.save.staff || {};
      const staffEnabled = state.save.staffEnabled || {};
      const lim = state.stageLimits || {
        maxUpgradeLevel: 4,
        maxCarryLevel: 3,
        maxStaffLevel: 3,
        allowedUnlocks: ['pump_unlock', 'wash_unlock', 'rack_sweets_unlock', 'fridge_unlock', 'grill_unlock', 'rack_auto_unlock']
      };
      const stations = window.GAME_DATA.STATIONS;
      const hoverId = state.hoveredTarget ? state.hoveredTarget.id : null;
      const badges = [];

      const pushPairUpg = (id, x, y, upgIds, icon) => {
        let bought = 0;
        let maxBought = 0;
        upgIds.forEach((upgId) => {
          const upgDef = window.GAME_DATA.UPGRADES.find((u) => u.id === upgId);
          const rawMax = upgDef ? upgDef.maxLevel : 4;
          const capMax =
            upgId === 'carry' ? Math.min(rawMax, lim.maxCarryLevel || 3) : Math.min(rawMax, lim.maxUpgradeLevel || 4);
          const lvl = upgrades[upgId] || 1;
          bought += Math.max(0, Math.min(capMax, lvl) - 1);
          maxBought += Math.max(1, capMax - 1);
        });
        const isMax = bought >= maxBought;
        const text = isMax ? `${icon} MAX` : `${icon} ${bought}/${maxBought}`;
        badges.push({
          x,
          y,
          text,
          isMax,
          hovered:
            hoverId === id ||
            (upgIds.includes('pumps') &&
              (hoverId === 'pump_0' || hoverId === 'pump_1' || hoverId === 'pump_2' || hoverId === 'pump_3'))
        });
      };

      pushPairUpg('pump_0', stations.pump_0.x, stations.pump_0.y - 52, ['pumps', 'pumps_price'], '🛠️');
      pushPairUpg('coffee', stations.coffee.x, stations.coffee.y - 52, ['coffee', 'coffee_price'], '🛠️');
      if (lim.allowedUnlocks.includes('grill_unlock') && (upgrades.grill_unlock || 1) >= 2) {
        pushPairUpg('grill', stations.grill.x, stations.grill.y - 50, ['grill', 'grill_price'], '🛠️');
      }
      if (lim.allowedUnlocks.includes('wash_unlock') && (upgrades.wash_unlock || 1) >= 2) {
        pushPairUpg('bucket', stations.bucket.x, stations.bucket.y - 34, ['wash', 'wash_price'], '🛠️');
      }
      if (lim.allowedUnlocks.includes('fridge_unlock') && (upgrades.fridge_unlock || 1) >= 2) {
        pushPairUpg('fridge', stations.fridge.x, stations.fridge.y - 54, ['drink_speed', 'drink_price'], '🛠️');
      }
      pushPairUpg('register', stations.register.x, stations.register.y - 38, ['decor', 'decor_tips'], '🌸');

      if (state.racks && state.racks.length > 0) {
        const centerRack = state.racks[Math.floor((state.racks.length - 1) / 2)] || state.racks[0];
        const rackCap = Math.min(4, lim.maxUpgradeLevel || 4);
        const maxBought = (rackCap - 1) * 2;
        const curBought =
          Math.max(0, Math.min(rackCap, upgrades.racks || 1) - 1) +
          Math.max(0, Math.min(rackCap, upgrades.racks_price || 1) - 1);
        const rackHovered = state.racks.some((r) => r.id === hoverId) || hoverId === 'storage';
        badges.push({
          x: centerRack.x,
          y: centerRack.y - ((centerRack.rot || 0) % 2 === 1 ? 76 : 64),
          text: curBought >= maxBought ? '🛠️ MAX' : `🛠️ ${curBought}/${maxBought}`,
          isMax: curBought >= maxBought,
          hovered: rackHovered
        });
      }

      (state.workers || []).forEach((w) => {
        if (!w.active) return;
        if (w.isPlayer) {
          pushPairUpg('player', w.x, w.y - 46, ['shoes', 'carry'], '👟');
        } else {
          const stDef = window.GAME_DATA.STAFF.find((s) => s.id === w.id);
          const maxLvl = Math.min(stDef ? stDef.maxLevel : 3, lim.maxStaffLevel || 3);
          const curLvl = Math.min(maxLvl, staff[w.id] || 1);
          const resting = staffEnabled[w.id] === false;
          badges.push({
            x: w.x,
            y: w.y - 46,
            text: `${curLvl >= maxLvl ? '✨ MAX' : `⬆️ Úr. ${curLvl}/${maxLvl}`}${resting ? ' 💤' : ''}`,
            isMax: curLvl >= maxLvl,
            hovered: hoverId === w.id
          });
        }
      });

      badges.forEach((b, idx) => {
        const bob = Math.sin(t * 2.8 + idx * 0.7) * 1.5;
        const by = b.y + bob;
        ctx.save();
        ctx.font = '800 11px "Nunito", "Segoe UI", sans-serif';
        const bw = ctx.measureText(b.text).width + 14;
        ctx.fillStyle = b.hovered ? '#ffe094' : b.isMax ? '#e3f4df' : 'rgba(255, 250, 240, 0.96)';
        roundRect(ctx, b.x - bw / 2, by - 10, bw, 20, 10);
        ctx.fill();
        ctx.strokeStyle = b.hovered ? '#d96b52' : b.isMax ? '#6ba368' : '#d4962b';
        ctx.lineWidth = b.hovered ? 2 : 1.5;
        ctx.stroke();
        ctx.fillStyle = '#3c2415';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x, by + 0.5);
        ctx.restore();
      });
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
