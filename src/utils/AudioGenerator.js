// Генератор звуков для медитации с помощью Web Audio API
class AudioGenerator {
  constructor() {
    this.audioContext = null;
    this.gainNode = null;
    this.oscillators = [];
    this.noiseBuffer = null;
    this.isPlaying = false;
  }

  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3;
      
      // Создаем буфер белого шума
      await this.createNoiseBuffer();
    }
  }

  async createNoiseBuffer() {
    const bufferSize = this.audioContext.sampleRate * 2;
    this.noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  // Звук дождя
  playRain() {
    this.stop();
    this.isPlaying = true;
    
    // Белый шум для основы дождя
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 1;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0.3;
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.gainNode);
    
    noiseSource.start();
    this.oscillators.push(noiseSource);
    
    // Добавляем случайные капли
    this.scheduleRainDrops();
  }

  scheduleRainDrops() {
    if (!this.isPlaying) return;
    
    const dropOsc = this.audioContext.createOscillator();
    const dropGain = this.audioContext.createGain();
    
    dropOsc.frequency.value = 800 + Math.random() * 400;
    dropGain.gain.value = 0;
    dropGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    dropGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    dropGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    
    dropOsc.connect(dropGain);
    dropGain.connect(this.gainNode);
    
    dropOsc.start();
    dropOsc.stop(this.audioContext.currentTime + 0.1);
    
    // Планируем следующую каплю
    setTimeout(() => this.scheduleRainDrops(), Math.random() * 100 + 50);
  }

  // Звук океана/волн
  playOcean() {
    this.stop();
    this.isPlaying = true;
    
    // Низкочастотный шум для волн
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    
    const lowPassFilter = this.audioContext.createBiquadFilter();
    lowPassFilter.type = 'lowpass';
    lowPassFilter.frequency.value = 300;
    
    const lfoOsc = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfoOsc.frequency.value = 0.1;
    lfoGain.gain.value = 100;
    
    lfoOsc.connect(lfoGain);
    lfoGain.connect(lowPassFilter.frequency);
    
    const waveGain = this.audioContext.createGain();
    waveGain.gain.value = 0.4;
    
    noiseSource.connect(lowPassFilter);
    lowPassFilter.connect(waveGain);
    waveGain.connect(this.gainNode);
    
    lfoOsc.start();
    noiseSource.start();
    
    this.oscillators.push(noiseSource, lfoOsc);
  }

  // Лесные звуки
  playForest() {
    this.stop();
    this.isPlaying = true;
    
    // Фоновый шум листвы
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    
    const forestFilter = this.audioContext.createBiquadFilter();
    forestFilter.type = 'highpass';
    forestFilter.frequency.value = 2000;
    
    const forestGain = this.audioContext.createGain();
    forestGain.gain.value = 0.2;
    
    noiseSource.connect(forestFilter);
    forestFilter.connect(forestGain);
    forestGain.connect(this.gainNode);
    
    noiseSource.start();
    this.oscillators.push(noiseSource);
    
    // Добавляем звуки птиц
    this.scheduleBirdSounds();
  }

  scheduleBirdSounds() {
    if (!this.isPlaying) return;
    
    const birdOsc = this.audioContext.createOscillator();
    const birdGain = this.audioContext.createGain();
    
    const frequency = 800 + Math.random() * 1200;
    birdOsc.frequency.value = frequency;
    birdOsc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    birdOsc.frequency.linearRampToValueAtTime(frequency * 1.5, this.audioContext.currentTime + 0.2);
    
    birdGain.gain.value = 0;
    birdGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    birdGain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.05);
    birdGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
    
    birdOsc.connect(birdGain);
    birdGain.connect(this.gainNode);
    
    birdOsc.start();
    birdOsc.stop(this.audioContext.currentTime + 0.3);
    
    // Планируем следующую птицу
    setTimeout(() => this.scheduleBirdSounds(), Math.random() * 5000 + 2000);
  }

  // Тибетская поющая чаша
  playBowl() {
    this.stop();
    this.isPlaying = true;
    
    const fundamental = 220; // Нота A
    const harmonics = [1, 2.5, 4.2, 6.8];
    
    harmonics.forEach((ratio, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.frequency.value = fundamental * ratio;
      osc.type = 'sine';
      
      const amplitude = 0.3 / (index + 1);
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(amplitude, this.audioContext.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 8);
      
      osc.connect(gain);
      gain.connect(this.gainNode);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 8);
      
      this.oscillators.push(osc);
    });
    
    // Повторяем звук чаши каждые 10 секунд
    setTimeout(() => {
      if (this.isPlaying) this.playBowl();
    }, 10000);
  }

  // Камин
  playFireplace() {
    this.stop();
    this.isPlaying = true;
    
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;
    
    const fireFilter = this.audioContext.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 800;
    
    const fireGain = this.audioContext.createGain();
    fireGain.gain.value = 0.4;
    
    noiseSource.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(this.gainNode);
    
    noiseSource.start();
    this.oscillators.push(noiseSource);
    
    // Добавляем потрескивание
    this.scheduleCrackles();
  }

  scheduleCrackles() {
    if (!this.isPlaying) return;
    
    const crackleOsc = this.audioContext.createOscillator();
    const crackleGain = this.audioContext.createGain();
    
    crackleOsc.frequency.value = 100 + Math.random() * 200;
    crackleOsc.type = 'square';
    
    crackleGain.gain.value = 0;
    crackleGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    crackleGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
    
    crackleOsc.connect(crackleGain);
    crackleGain.connect(this.gainNode);
    
    crackleOsc.start();
    crackleOsc.stop(this.audioContext.currentTime + 0.05);
    
    setTimeout(() => this.scheduleCrackles(), Math.random() * 1000 + 500);
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  stop() {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Осциллятор уже остановлен
      }
    });
    this.oscillators = [];
  }
}

export default AudioGenerator;
