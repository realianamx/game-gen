import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Enhanced control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playCombo: (comboCount: number) => void;
  playGameOver: () => void;
  playPieceDrop: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      const soundClone = successSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4;
      soundClone.currentTime = 0;
      soundClone.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playCombo: (comboCount: number) => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      // Play success sound with higher pitch for combos
      const soundClone = successSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = Math.min(0.8, 0.3 + comboCount * 0.1);
      soundClone.playbackRate = 1 + (comboCount * 0.2);
      soundClone.currentTime = 0;
      soundClone.play().catch(error => {
        console.log("Combo sound play prevented:", error);
      });
    }
  },
  
  playGameOver: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6;
      soundClone.playbackRate = 0.7; // Lower pitch for dramatic effect
      soundClone.currentTime = 0;
      soundClone.play().catch(error => {
        console.log("Game over sound play prevented:", error);
      });
    }
  },
  
  playPieceDrop: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.2;
      soundClone.playbackRate = 1.5; // Higher pitch for piece drop
      soundClone.currentTime = 0;
      soundClone.play().catch(error => {
        console.log("Piece drop sound play prevented:", error);
      });
    }
  },
  
  startBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic && !isMuted) {
      backgroundMusic.volume = 0.3;
      backgroundMusic.loop = true;
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  },
  
  stopBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
  }
}));
