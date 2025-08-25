import React from 'react';
import { useBlockBlast } from '../lib/stores/useBlockBlast';
import { useAudio } from '../lib/stores/useAudio';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';

export const GameUI: React.FC = () => {
  const { gameState, restartGame } = useBlockBlast();
  const { isMuted, toggleMute } = useAudio();
  const isMobile = window.innerWidth <= 768;

  return (
    <div className={`flex justify-between items-start ${
      isMobile ? 'gap-2 flex-wrap' : 'gap-4'
    }`}>
      {/* Enhanced Score Display */}
      <Card className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-sm border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/25">
        <CardContent className={isMobile ? 'p-2' : 'p-4'}>
          <div className="space-y-2">
            <div className={`font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse ${
              isMobile ? 'text-xl' : 'text-3xl'
            }`}>
              {gameState.score.toLocaleString()}
            </div>
            <div className={`text-cyan-300 font-medium ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>SCORE</div>
            <div className={`font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent ${
              isMobile ? 'text-lg' : 'text-xl'
            }`}>
              {gameState.linesCleared}
            </div>
            <div className={`text-yellow-300 font-medium ${
              isMobile ? 'text-xs' : 'text-xs'
            }`}>LINES CLEARED</div>
          </div>
        </CardContent>
      </Card>

      {/* Game Controls */}
      <div className={`flex ${
        isMobile ? 'gap-1' : 'gap-2'
      }`}>
        <Button
          onClick={toggleMute}
          variant="outline"
          size={isMobile ? 'sm' : 'sm'}
          className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:scale-110 transition-all duration-200 shadow-lg shadow-cyan-500/25"
        >
          {isMuted ? (
            <VolumeX className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
          ) : (
            <Volume2 className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
          )}
        </Button>
        
        <Button
          onClick={restartGame}
          variant="outline"
          size={isMobile ? 'sm' : 'sm'}
          className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm border-2 border-green-400/50 text-green-400 hover:bg-green-400/10 hover:scale-110 transition-all duration-200 shadow-lg shadow-green-500/25"
        >
          <RotateCcw className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
        </Button>
      </div>

      {/* Enhanced Game Status */}
      <Card className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 backdrop-blur-sm border-2 border-purple-400/50 shadow-lg shadow-purple-500/25">
        <CardContent className={isMobile ? 'p-2' : 'p-4'}>
          <div className="text-center">
            <div className={`font-bold uppercase tracking-wider ${
              isMobile ? 'text-xs' : 'text-sm'
            } ${
              gameState.phase === 'playing' ? 'text-green-400 animate-pulse' :
              gameState.phase === 'gameOver' ? 'text-red-400' :
              'text-purple-400'
            }`}>
              {gameState.phase === 'playing' ? (isMobile ? '🎮 PLAY' : '🎮 PLAYING') : 
               gameState.phase === 'gameOver' ? (isMobile ? '💀 OVER' : '💀 GAME OVER') :
               '⚡ READY'}
            </div>
            {gameState.phase === 'playing' && (
              <div className={`text-purple-300 mt-1 font-medium ${
                isMobile ? 'text-xs' : 'text-xs'
              }`}>
                PIECES: {gameState.currentPieces.length}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
