// Web Audio API procedural sound engine & FIFA live match commentary synthesizer

class SoundEngine {
  private ctx: AudioContext | null = null;
  private crowdNode: AudioNode | null = null;
  private crowdGain: GainNode | null = null;
  public sfxVolume: number = 0.8;
  public crowdVolume: number = 0.5;
  public commentaryEnabled: boolean = true;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play crisp UI navigation click / hover
  public playUISelect() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }

  // Play kick sound (frequency & resonance depends on power/type)
  public playKick(type: 'pass' | 'shoot' | 'power_shot' | 'lob' = 'pass') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = type === 'power_shot' ? 140 : type === 'shoot' ? 180 : 220;
      const duration = type === 'power_shot' ? 0.18 : 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + duration);

      const vol = type === 'power_shot' ? 0.9 : type === 'shoot' ? 0.7 : 0.5;
      gain.gain.setValueAtTime(vol * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  // Ball hitting the wood / metal post
  public playPostHit() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.6 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
  }

  // Goal net sound
  public playNetSound() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Filtered noise for net rustle
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.5 * this.sfxVolume;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {
      // Audio fallback
    }
  }

  // Referee Whistle
  public playWhistle(type: 'short' | 'double' | 'triple' = 'short') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const playSingleBlast = (delay: number, duration: number) => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + delay;

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(2450, startTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2880, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.4 * this.sfxVolume, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };

      if (type === 'short') {
        playSingleBlast(0, 0.25);
      } else if (type === 'double') {
        playSingleBlast(0, 0.18);
        playSingleBlast(0.24, 0.35);
      } else {
        playSingleBlast(0, 0.18);
        playSingleBlast(0.22, 0.18);
        playSingleBlast(0.46, 0.5);
      }
    } catch {
      // Audio fallback
    }
  }

  // Crowd cheer on goal
  public playGoalCheer() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.8);
      filter.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 2.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05 * this.crowdVolume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.8 * this.crowdVolume, this.ctx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio fallback
    }
  }

  // Start continuous stadium ambient noise
  public startStadiumAtmosphere() {
    try {
      this.initCtx();
      if (!this.ctx || this.crowdNode) return;

      const bufferSize = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 450;
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.15 * this.crowdVolume;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.crowdNode = noise;
      this.crowdGain = gain;
    } catch {
      // Audio fallback
    }
  }

  public stopStadiumAtmosphere() {
    if (this.crowdNode) {
      try {
        (this.crowdNode as AudioBufferSourceNode).stop();
      } catch {
        // ignore
      }
      this.crowdNode = null;
      this.crowdGain = null;
    }
  }

  // FUT Pack Opening Fanfare
  public playPackOpeningFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C E G C E G C
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3 * this.sfxVolume, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.6);
      });
    } catch {
      // fallback
    }
  }

  // Live FIFA Match Commentary Voice (Web Speech API)
  public speakCommentary(text: string) {
    if (!this.commentaryEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Don't build up a queue
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.08;
      utterance.pitch = 1.05;
      utterance.volume = 0.9;

      // Prefer English voice with good tone
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Google UK') || (v.lang.startsWith('en') && !v.name.includes('Zira'))));
      if (preferred) {
        utterance.voice = preferred;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech fallback
    }
  }
}

export const sound = new SoundEngine();

// Procedural match commentary lines database
export const COMMENTARY_LINES = {
  kickoff: [
    "Welcome everyone to the FIFA World Cup 2026! The atmosphere is electric!",
    "The referee blows the whistle and we are underway here today!",
    "Two world-class squads battling it out on the pitch. Here we go!",
  ],
  goalScored: [
    "GOOOOAAAL! An absolute rocket into the top corner!",
    "WHAT A SENSATIONAL FINISH! Unbelievable technique from the striker!",
    "IT'S IN THE BACK OF THE NET! World class precision!",
    "GOAL! Clinical and decisive! The goalkeeper stood no chance!",
    "UNSTOPPABLE! What an emphatic finish to send the crowd wild!",
  ],
  greatSave: [
    "WHAT A SAVE! Tremendous reflexes from the keeper!",
    "Fingertip save pushing it past the post! Sensational goalkeeping!",
    "Denied from point-blank range! That is world class between the posts!",
  ],
  hitPost: [
    "OFF THE WOODWORK! Oh, that was agonizingly close!",
    "Rattled the crossbar! Inches away from perfection!",
  ],
  tackle: [
    "Superb sliding tackle, perfectly timed!",
    "Strong challenge to win back possession!",
    "Read that play like an open book and intercepted!",
  ],
  counterAttack: [
    "Here they come on the counter-attack with pace!",
    "Space opening up on the break, numbers pushing forward!",
    "A swift transition, defense caught off balance!",
  ],
  halfTime: [
    "That is the whistle for half-time. A captivating opening 45 minutes!",
    "Half-time here. Both managers will have plenty to say in the dressing room.",
  ],
  fullTime: [
    "There is the final whistle! What an extraordinary match of football!",
    "It's all over! A breathtaking contest full of drama and quality!",
  ],
  foul: [
    "Whistle goes for a late challenge! Free kick awarded.",
    "The referee steps in after that heavy tackle.",
  ]
};
