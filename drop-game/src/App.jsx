import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const backgroundImageRef = useRef(new Image());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const iconsRef = useRef([]);
  const animationRef = useRef(null);
  const lastDropTimeRef = useRef(0);
  const backgroundRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const ICON_SIZE = 40;
  const HIT_AREA_MULTIPLIER = 1.5;
  const MAX_ICONS = 10;
  const INITIAL_DROP_INTERVAL = 1000;
  const PADDING = 50;

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext('2d');

    // Load background image
    backgroundImageRef.current.src = '/background.jpg';
    backgroundImageRef.current.onload = () => {
      backgroundRef.current = backgroundImageRef.current;
    };

    const addIcon = (currentTime) => {
      if (!gameOver && iconsRef.current.length < MAX_ICONS) {
        const dropInterval = Math.max(INITIAL_DROP_INTERVAL - score * 10, 200);
        if (currentTime - lastDropTimeRef.current > dropInterval) {
          const newIcon = {
            id: Math.random(),
            x: PADDING + Math.random() * (dimensions.width - 2 * PADDING - ICON_SIZE),
            y: 0,
            type: Math.random() > 0.8 ? 'bomb' : 'icon',
          };
          iconsRef.current.push(newIcon);
          lastDropTimeRef.current = currentTime;
        }
      }
    };

    const animate = (currentTime) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw background image with cover sizing
      if (backgroundRef.current) {
        const imgAspectRatio = backgroundRef.current.width / backgroundRef.current.height;
        const canvasAspectRatio = dimensions.width / dimensions.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (canvasAspectRatio > imgAspectRatio) {
          drawWidth = dimensions.width;
          drawHeight = dimensions.width / imgAspectRatio;
          drawX = 0;
          drawY = (dimensions.height - drawHeight) / 2;
        } else {
          drawHeight = dimensions.height;
          drawWidth = dimensions.height * imgAspectRatio;
          drawX = (dimensions.width - drawWidth) / 2;
          drawY = 0;
        }

        ctx.drawImage(backgroundRef.current, drawX, drawY, drawWidth, drawHeight);
      }
      
      addIcon(currentTime);
      
      let gameOverDueToStar = false;
      
      iconsRef.current = iconsRef.current.filter(icon => {
        if (icon.y + ICON_SIZE >= dimensions.height) {
          if (icon.type === 'icon') {
            gameOverDueToStar = true;
          }
          return false;
        }
        return true;
      });
      
      if (gameOverDueToStar) {
        setGameOver(true);
      }
      
      const baseSpeed = 2;
      const currentSpeed = baseSpeed + score * 0.05;
      
      iconsRef.current.forEach(icon => {
        icon.y += currentSpeed;
        
        const centerX = icon.x + ICON_SIZE / 2;
        const centerY = icon.y + ICON_SIZE / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, (ICON_SIZE * HIT_AREA_MULTIPLIER) / 2, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();
        
        ctx.font = '30px Arial';
        ctx.fillStyle = icon.type === 'bomb' ? 'red' : 'gold';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon.type === 'bomb' ? '💣' : '⭐', centerX, centerY);
      });

      if (!gameOver) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameOver, score, dimensions]);

  const handleCanvasClick = (event) => {
    if (gameOver) {
      setGameOver(false);
      setScore(0);
      iconsRef.current = [];
      lastDropTimeRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    let clickedBomb = false;
    let clickedIcons = 0;

    // const baseSpeed = 2;
    // const currentSpeed = baseSpeed + score * 0.05;
    const predictiveOffset = 10 + score * 0.2; // Increased from 0.1 to 0.2
    const verticalHitAreaExtension = Math.min(ICON_SIZE, predictiveOffset * 2); // Limit the extension

    iconsRef.current = iconsRef.current.filter(icon => {
      const iconCenterX = icon.x + ICON_SIZE / 2;
      const iconCenterY = icon.y + ICON_SIZE / 2;
      
      // Extend hit area upwards
      const extendedIconTopY = iconCenterY - verticalHitAreaExtension;
      
      // Check current position and extended area
      const distanceToCenter = Math.sqrt(Math.pow(x - iconCenterX, 2) + Math.pow(y - iconCenterY, 2));
      const distanceToExtendedTop = Math.sqrt(Math.pow(x - iconCenterX, 2) + Math.pow(y - extendedIconTopY, 2));
      
      // Use the smaller of the two distances
      const distance = Math.min(distanceToCenter, distanceToExtendedTop);
      
      const hitAreaSize = (ICON_SIZE * HIT_AREA_MULTIPLIER) / 2 + 5 + (score * 0.5); // Gradually increase hit area with score
      
      if (distance <= hitAreaSize) {
        if (icon.type === 'bomb') {
          clickedBomb = true;
        } else {
          clickedIcons++;
        }
        return false; // Remove the clicked icon
      }
      return true; // Keep unclicked icons
    });

    if (clickedBomb) {
      setGameOver(true);
    } else if (clickedIcons > 0) {
      setScore(prevScore => prevScore + clickedIcons);
    }
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    iconsRef.current = [];
    lastDropTimeRef.current = 0;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full touch-none"
      />
      <div className="absolute top-5 left-5 text-white text-shadow">
        <h2 className="text-2xl font-bold mb-2">Drop and Catch Game</h2>
        <h4 className="text-lg">Score: {score}</h4>
      </div>
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="w-[300px] bg-white p-4 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-xl mb-6">Your Score: {score}</p>
            <button 
              onClick={restartGame}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
