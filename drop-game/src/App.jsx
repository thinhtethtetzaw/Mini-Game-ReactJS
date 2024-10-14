import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const iconsRef = useRef([]);
  const animationRef = useRef(null);
  const lastDropTimeRef = useRef(0);
  const backgroundRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: window.innerHeight });
  const bombImageRef = useRef(null);
  const bottleImageRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const uncorrectBottleImagesRef = useRef([]);
  const notificationTimeoutRef = useRef(null);

  const ICON_SIZE = 60;
  const BOMB_ASPECT_RATIO = 0.6; // Changed from 1 to 0.8 to make bombs taller
  const BOTTLE_ASPECT_RATIO = 0.3;
  const BOTTLE_SIZE_MULTIPLIER = 0.5;
  const BOMB_SIZE_MULTIPLIER = 0.5;
  const HIT_AREA_MULTIPLIER = 1.2;
  const VERTICAL_OFFSET_MULTIPLIER = 0.5;
  const MAX_ICONS = 10;
  const INITIAL_DROP_INTERVAL = 1000;
  const PADDING = 50;
  const BOMB_PROBABILITY = 0.2; // 20% chance for bombs
  const UNCORRECT_BOTTLE_PROBABILITY = 0.2; // Decreased to 20% chance for uncorrect bottles

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: 500, height: window.innerHeight });
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

    // Load images
    const bombImage = new Image();
    bombImage.src = '/images/bomb.png';
    bombImage.onload = () => {
      bombImageRef.current = bombImage;
    };

    const bottleImage = new Image();
    bottleImage.src = '/images/correct-bottle.png';
    bottleImage.onload = () => {
      bottleImageRef.current = bottleImage;
    };

    // Load uncorrect bottle images
    const uncorrectBottleImages = [
      '/images/uncorrect-bottle-1.png',
      '/images/uncorrect-bottle-2.png',
      '/images/uncorrect-bottle-3.png',
      '/images/uncorrect-bottle-4.png'
    ];

    uncorrectBottleImages.forEach((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        uncorrectBottleImagesRef.current[index] = img;
      };
    });

    const addIcon = (currentTime) => {
      if (!gameOver && iconsRef.current.length < MAX_ICONS) {
        const dropInterval = Math.max(INITIAL_DROP_INTERVAL - score * 10, 200);
        if (currentTime - lastDropTimeRef.current > dropInterval) {
          const random = Math.random();
          let type;
          if (random < BOMB_PROBABILITY) {
            type = 'bomb';
          } else if (random < BOMB_PROBABILITY + UNCORRECT_BOTTLE_PROBABILITY) {
            type = 'uncorrect-bottle';
          } else {
            type = 'correct-bottle';
          }
          const newIcon = {
            id: Math.random(),
            x: PADDING + Math.random() * (dimensions.width - 2 * PADDING - ICON_SIZE),
            y: 0,
            type: type,
            imageIndex: type === 'uncorrect-bottle' ? Math.floor(Math.random() * 4) : null,
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
      
      let gameOverDueToBottle = false;
      
      iconsRef.current = iconsRef.current.filter(icon => {
        if (icon.y + ICON_SIZE >= dimensions.height) {
          if (icon.type === 'correct-bottle') {
            gameOverDueToBottle = true;
          }
          return false;
        }
        return true;
      });
      
      if (gameOverDueToBottle) {
        setGameOver(true);
      }
      
      const baseSpeed = 3;
      const currentSpeed = baseSpeed + score * 0.05;
      
      iconsRef.current.forEach(icon => {
        icon.y += currentSpeed;
        
        const aspectRatio = icon.type === 'bomb' ? BOMB_ASPECT_RATIO : BOTTLE_ASPECT_RATIO;
        const sizeMultiplier = icon.type === 'bomb' ? BOMB_SIZE_MULTIPLIER : BOTTLE_SIZE_MULTIPLIER;
        const iconWidth = ICON_SIZE * sizeMultiplier;
        const iconHeight = iconWidth / aspectRatio;
        
       
        
        let image;
        if (icon.type === 'bomb') {
          image = bombImageRef.current;
        } else if (icon.type === 'correct-bottle') {
          image = bottleImageRef.current;
        } else {
          image = uncorrectBottleImagesRef.current[icon.imageIndex];
        }

        if (image) {
          ctx.drawImage(
            image, 
            icon.x, 
            icon.y, 
            iconWidth, 
            iconHeight
          );
        }
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

  const showNotification = (message) => {
    setNotification(message);
    
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Set a new timeout to clear the notification after 2 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

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
      const aspectRatio = icon.type === 'bomb' ? BOMB_ASPECT_RATIO : BOTTLE_ASPECT_RATIO;
      const sizeMultiplier = icon.type === 'bomb' ? BOMB_SIZE_MULTIPLIER : BOTTLE_SIZE_MULTIPLIER;
      const iconWidth = ICON_SIZE * sizeMultiplier;
      const iconHeight = iconWidth / aspectRatio;
      
      const iconCenterX = icon.x + iconWidth / 2;
      const iconCenterY = icon.y + iconHeight / 2;
      
      let isHit;
      if (icon.type === 'bomb') {
        const distance = Math.sqrt(Math.pow(x - iconCenterX, 2) + Math.pow(y - iconCenterY, 2));
        isHit = distance <= (Math.max(iconWidth, iconHeight) / 2) * HIT_AREA_MULTIPLIER;
      } else {
        // Extend hit area upwards and increase overall size
        const hitAreaWidth = iconWidth * HIT_AREA_MULTIPLIER;
        const hitAreaHeight = iconHeight * HIT_AREA_MULTIPLIER;
        const verticalOffset = iconHeight * VERTICAL_OFFSET_MULTIPLIER;
        
        isHit = x >= icon.x - (hitAreaWidth - iconWidth) / 2 && 
                x <= icon.x + iconWidth + (hitAreaWidth - iconWidth) / 2 && 
                y >= icon.y - verticalOffset && 
                y <= icon.y + hitAreaHeight - verticalOffset;
      }
      
      if (isHit) {
        if (icon.type === 'bomb') {
          clickedBomb = true;
        } else if (icon.type === 'uncorrect-bottle') {
          setScore(prevScore => Math.max(prevScore - 1, 0));
          showNotification("Incorrect bottle! -1 point");
        } else {
          clickedIcons++;
        }
        return false; // Remove the clicked icon
      }
      return true; // Keep unclicked icons
    });

    if (clickedBomb) {
      setScore(prevScore => Math.max(prevScore - 5, 0));
      showNotification("Bomb clicked! -5 points");
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
    <div className="flex justify-center items-center w-screen h-screen overflow-hidden bg-gray-200">
      <div className="relative w-[500px] h-full">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full touch-none bg-[url('/images/drop-game-bg.png')] bg-cover"
        />
        <div className="absolute top-5 left-5 text-white text-shadow">
          <h2 className="text-2xl font-bold mb-2">Drop and Catch Game</h2>
          <h4 className="text-lg">Score: {score}</h4>
        </div>
        {notification && (
          <div className="absolute top-5 right-5 bg-red-500 bg-opacity-50 text-sm text-white px-4 py-2 rounded-md">
            {notification}
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-[300px] bg-white bg-opacity-30 backdrop:blur-md border border-white border-opacity-30 p-4 rounded-md text-center shadow-lg">
              <h2 className="text-2xl text-white font-bold mb-2">Game Over!</h2>
              <p className="mb-6 font-bold text-white">Your Score: {score}</p>
              <button 
                onClick={restartGame}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
              >
                Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
