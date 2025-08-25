import { Suspense, useEffect, useState } from "react";
import "@fontsource/inter";
import { BlockBlastGame } from "./components/BlockBlastGame";

// Main App component
function App() {
  const [showGame, setShowGame] = useState(false);

  // Show the game once everything is loaded
  useEffect(() => {
    setShowGame(true);
  }, []);

  return (
    <div className="animate-ultra-glow" style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 25%, #2a1a4a 50%, #1a0a2a 75%, #0a0a1a 100%)',
      animation: 'gradientShift 6s ease-in-out infinite'
    }}>
      {showGame && (
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full text-white text-xl">
            Loading Block Blast...
          </div>
        }>
          <BlockBlastGame />
        </Suspense>
      )}
    </div>
  );
}

export default App;
