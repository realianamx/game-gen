import React, { useEffect, useCallback, useState } from 'react';
import { GameCanvas } from './GameCanvas';
import { GameUI } from './GameUI';
import { useBlockBlast } from '../lib/stores/useBlockBlast';
import { useAudio } from '../lib/stores/useAudio';

export const BlockBlastGame: React.FC = () => {
  const { gameState, initializeGame, restartGame } = useBlockBlast();
  const { playHit, playSuccess, playCombo, playGameOver, startBackgroundMusic, stopBackgroundMusic, setHitSound, setSuccessSound, setBackgroundMusic } = useAudio();
  const [isShaking, setIsShaking] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    // Load audio files
    const loadAudio = async () => {
      try {
        const [hit, success, background] = await Promise.all([
          new Audio('/sounds/hit.mp3'),
          new Audio('/sounds/success.mp3'),
          new Audio('/sounds/background.mp3')
        ]);
        
        // Set audio volumes
        hit.volume = 0.3;
        success.volume = 0.4;
        background.volume = 0.2;
        
        // Store audio in state
        setHitSound(hit);
        setSuccessSound(success);
        setBackgroundMusic(background);
        
        console.log('🎵 Audio loaded successfully!');
      } catch (error) {
        console.log('🔇 Audio loading failed:', error);
      }
    };
    
    loadAudio();
    initializeGame();
    
    return () => stopBackgroundMusic();
  }, [initializeGame, stopBackgroundMusic, setHitSound, setSuccessSound, setBackgroundMusic]);
  
  // Screen shake effect for combos and game over
  useEffect(() => {
    if (gameState.phase === 'gameOver') {
      playGameOver();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  }, [gameState.phase, playGameOver]);
  
  // Combo detection and effects
  useEffect(() => {
    if (gameState.score > lastScore) {
      const scoreDiff = gameState.score - lastScore;
      // If score increased by more than 200, it's likely a combo
      if (scoreDiff > 200) {
        const comboLevel = Math.floor(scoreDiff / 200);
        playCombo(comboLevel);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }
      setLastScore(gameState.score);
    }
  }, [gameState.score, lastScore, playCombo]);

  const handleRestart = useCallback(() => {
    restartGame();
    playSuccess();
  }, [restartGame, playSuccess]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'r':
      case 'R':
        handleRestart();
        break;
      case ' ':
        event.preventDefault();
        // Space for pause/unpause if needed
        break;
    }
  }, [handleRestart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className={`relative w-full h-full flex flex-col transition-transform duration-100 ${
      isShaking ? 'animate-pulse scale-105' : ''
    }`}>
      {/* Game Header */}
      <div className={`absolute z-10 ${
        isMobile ? 'top-2 left-2 right-2' : 'top-4 left-4 right-4'
      }`}>
        <GameUI />
      </div>

      {/* Main Game Area */}
      <div className={`flex-1 flex items-center justify-center ${
        isMobile ? 'p-1' : 'p-4'
      }`}>
        <GameCanvas />
      </div>

      {/* Epic Game Over Overlay */}
      {gameState.phase === 'gameOver' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-20 animate-pulse">
          <div className={`bg-gradient-to-br from-purple-900/90 to-red-900/90 rounded-2xl text-center shadow-2xl border-4 border-red-400/50 animate-shake ${
            isMobile ? 'p-4 mx-4' : 'p-8'
          }`}>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent mb-6 animate-pulse">
              💀 GAME OVER! 💀
            </h2>
            <p className="text-2xl text-cyan-400 font-bold mb-3">Final Score: {gameState.score.toLocaleString()}</p>
            <p className="text-xl text-yellow-400 font-semibold mb-8">Lines Cleared: {gameState.linesCleared}</p>
            <button
              onClick={handleRestart}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-110 hover:shadow-2xl hover:shadow-cyan-400/50 animate-bounce-slow"
            >
              🚀 PLAY AGAIN 🚀
            </button>
            <p className="text-sm text-gray-300 mt-6 animate-pulse">Press 'R' to restart anytime ⚡</p>
          </div>
        </div>
      )}
    </div>
  );
};
