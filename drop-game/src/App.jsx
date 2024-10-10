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

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const ICON_SIZE = 40;
  const HIT_AREA_MULTIPLIER = 1.5;
  const MAX_ICONS = 10;
  const INITIAL_DROP_INTERVAL = 1000;
  const PADDING = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
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
            x: PADDING + Math.random() * (GAME_WIDTH - 2 * PADDING - ICON_SIZE),
            y: 0,
            type: Math.random() > 0.8 ? 'bomb' : 'icon',
          };
          iconsRef.current.push(newIcon);
          lastDropTimeRef.current = currentTime;
        }
      }
    };

    const animate = (currentTime) => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      
      // Draw background image
      if (backgroundRef.current) {
        ctx.drawImage(backgroundRef.current, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
      
      // Remove the padding areas drawing code if you don't want them anymore
      
      addIcon(currentTime);
      
      iconsRef.current = iconsRef.current.filter(icon => icon.y < GAME_HEIGHT);
      
      iconsRef.current.forEach(icon => {
        icon.y += 2 + score * 0.05;
        
        // Calculate the center position for both the icon and the stroke
        const centerX = icon.x + ICON_SIZE / 2;
        const centerY = icon.y + ICON_SIZE / 2;
        
        // Draw the stroke
        ctx.beginPath();
        ctx.arc(centerX, centerY, (ICON_SIZE * HIT_AREA_MULTIPLIER) / 2, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();
        
        // Draw the icon
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
  }, [gameOver, score]);

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

    iconsRef.current = iconsRef.current.filter(icon => {
      const iconCenterX = icon.x + ICON_SIZE / 2;
      const iconCenterY = icon.y + ICON_SIZE / 2;
      const distance = Math.sqrt(Math.pow(x - iconCenterX, 2) + Math.pow(y - iconCenterY, 2));
      
      if (distance <= (ICON_SIZE * HIT_AREA_MULTIPLIER) / 2) {
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

  return (
    <div className="game-container">
      <h1>Drop and Catch Game</h1>
      <h2>Score: {score}</h2>
      {gameOver && <h2>Game Over! Click to Restart</h2>}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="game-area"
      />
    </div>
  );
}

export default App;
