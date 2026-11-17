(function () {
  'use strict';

  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.volume = 0.8;
      this.musicVolume = 0.7;
      this.ambientTimer = null;
      this.ambientStep = 0;
      this.ambientPlaying = false;
    }

    setVolume(val) {
      const clamped = Math.max(0, Math.min(1, Number(val)));
      this.volume = Number.isFinite(clamped) ? clamped : 0.8;
    }

    setMusicVolume(val) {
      const clamped = Math.max(0, Math.min(1, Number(val)));
      this.musicVolume = Number.isFinite(clamped) ? clamped : 0.7;
    }

    init() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            this.ctx = new AudioCtx();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      } catch (_err) {
        // Ignore audio init errors in restricted browsers
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopAmbient();
      }
      return this.muted;
    }

    _playTone(freq, duration, type, gainPeak, delay) {
      if (this.muted || this.volume <= 0) return;
      const scaledPeak = Math.max(0.0002, (gainPeak || 0.08) * this.volume);
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime + (delay || 0);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(scaledPeak, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (_err) {
        // Ignore playback errors
      }
    }

    playClick() {
      this._playTone(540, 0.08, 'sine', 0.06, 0);
      this._playTone(720, 0.07, 'triangle', 0.04, 0.03);
    }

    playStep() {
      this._playTone(210, 0.05, 'triangle', 0.025, 0);
    }

    playFuel() {
      this._playTone(280, 0.12, 'triangle', 0.05, 0);
      this._playTone(360, 0.14, 'triangle', 0.05, 0.1);
      this._playTone(460, 0.18, 'sine', 0.06, 0.22);
    }

    playCoffee() {
      this._playTone(520, 0.1, 'sine', 0.05, 0);
      this._playTone(660, 0.14, 'sine', 0.05, 0.08);
    }

    playGrill() {
      this._playTone(330, 0.11, 'triangle', 0.05, 0);
      this._playTone(440, 0.13, 'triangle', 0.05, 0.08);
    }

    playWash() {
      this._playTone(620, 0.09, 'sine', 0.045, 0);
      this._playTone(830, 0.12, 'sine', 0.045, 0.07);
    }

    playCash() {
      this._playTone(987.77, 0.09, 'triangle', 0.07, 0);
      this._playTone(1318.51, 0.2, 'sine', 0.08, 0.07);
    }

    playHappy() {
      this._playTone(523.25, 0.1, 'sine', 0.06, 0);
      this._playTone(659.25, 0.12, 'sine', 0.06, 0.08);
      this._playTone(783.99, 0.16, 'sine', 0.06, 0.16);
    }

    playSad() {
      this._playTone(340, 0.14, 'triangle', 0.06, 0);
      this._playTone(260, 0.22, 'triangle', 0.06, 0.12);
    }

    playUpgrade() {
      this._playTone(440, 0.09, 'triangle', 0.06, 0);
      this._playTone(554.37, 0.09, 'triangle', 0.06, 0.08);
      this._playTone(659.25, 0.1, 'triangle', 0.06, 0.16);
      this._playTone(880, 0.22, 'sine', 0.07, 0.24);
    }

    playWin() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this._playTone(n, 0.24, 'sine', 0.07, idx * 0.11);
      });
    }

    startAmbient() {
      if (this.muted || this.ambientPlaying) return;
      this.ambientPlaying = true;
      const chords = [
        [261.63, 329.63, 392.0, 493.88],
        [220.0, 261.63, 329.63, 392.0],
        [174.61, 220.0, 261.63, 349.23],
        [196.0, 246.94, 293.66, 392.0]
      ];
      const tick = () => {
        if (!this.ambientPlaying || this.muted) return;
        try {
          if (this.ctx && this.ctx.state === 'running' && this.musicVolume > 0) {
            const chord = chords[Math.floor(this.ambientStep / 4) % chords.length];
            const note = chord[this.ambientStep % chord.length];
            this._playTone(note, 0.55, 'sine', 0.02 * this.musicVolume, 0);
          }
        } catch (_err) {
          // Ignore ambient errors
        }
        this.ambientStep += 1;
        this.ambientTimer = window.setTimeout(tick, 650);
      };
      this.ambientTimer = window.setTimeout(tick, 400);
    }

    stopAmbient() {
      this.ambientPlaying = false;
      if (this.ambientTimer) {
        clearTimeout(this.ambientTimer);
        this.ambientTimer = null;
      }
    }
  }

  window.SoundManager = new SoundManager();
})();
