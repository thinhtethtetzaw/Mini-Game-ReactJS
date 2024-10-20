import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import './App.css';
import AwardWinnerImage from '../public/images/award-winner.PNG';
import BoldImage from '../public/images/bold.JPG';
import RiceCaramelColorImage from '../public/images/rice-caramel-color.PNG';
import ScottichMaltsImage from '../public/images/scottich-malts.PNG';
import SignatureImage from '../public/images/signature.JPG';
import UnstoppableImage from '../public/images/unstoppable.PNG';

function App() {
  const gameRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Initialize PixiJS app
    const app = new PIXI.Application({
      width: 500,
      height: window.innerHeight,
      backgroundColor: 0x607EFF,
    });
    appRef.current = app;
    gameRef.current.appendChild(app.view);

    // Add event listener for window resize
    const handleResize = () => {
      app.renderer.resize(500, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Game variables
    let screen = 0;
    let speed = 2;
    let score = 0;
    let caughtImages = {};
    let lastDropTime = 0;
    let dropInterval = 1000; // Start with 1 second interval between drops
    
    const images = [
      { src: AwardWinnerImage, width: 'auto', height: 100 },
      { src: BoldImage, width: 'auto', height: 100 },
      { src: RiceCaramelColorImage, width: 'auto', height: 100 },
      { src: ScottichMaltsImage, width: 'auto', height: 100 },
      { src: SignatureImage, width: 'auto', height: 100 },
      { src: UnstoppableImage, width: 'auto', height: 100 }
    ];
    
    // Game objects
    let drops = [];
    const paddle = new PIXI.Graphics();
    const scoreText = new PIXI.Text('score = 0', { fill: 0xFFFFFF });
    const messageText = new PIXI.Text('', { fill: 0xFFFFFF, align: 'center' });

    // Setup game objects
    function setup() {
      paddle.beginFill(0xFF0000);
      paddle.drawRect(-25, -15, 50, 30);
      paddle.endFill();
      paddle.y = app.screen.height - 10;

      scoreText.x = 30;
      scoreText.y = 20;

      messageText.x = app.screen.width / 2;
      messageText.y = app.screen.height / 2;
      messageText.anchor.set(0.5);

      app.stage.addChild(paddle, scoreText, messageText);
    }

    // Create a new drop
    function createDrop() {
      const drop = new PIXI.Sprite();
      drop.anchor.set(0.5);
      resetDrop(drop);
      app.stage.addChild(drop);
      drops.push(drop);
    }

    // Game states
    function startScreen() {
      messageText.text = 'WELCOME TO MY CATCHING GAME\nclick to start';
      drops.forEach(drop => drop.visible = false);
      paddle.visible = false;
      scoreText.visible = false;
    }

    function gameOn() {
      messageText.text = '';
      paddle.visible = true;
      scoreText.visible = true;

      const currentTime = Date.now();
      if (currentTime - lastDropTime > dropInterval) {
        createDrop();
        lastDropTime = currentTime;
        // Gradually decrease the interval to increase difficulty
        dropInterval = Math.max(200, dropInterval - 10);
      }

      drops.forEach((drop, index) => {
        drop.y += speed;

        // Constrain paddle movement within the app width
        const halfPaddleWidth = paddle.width / 2;
        paddle.x = Math.max(halfPaddleWidth, Math.min(app.screen.width - halfPaddleWidth, app.renderer.events.pointer.global.x));

        scoreText.text = `score = ${score}`;

        if (drop.y > app.screen.height) {
          // Image missed the paddle
          app.stage.removeChild(drop);
          drops.splice(index, 1);
        } else if (drop.y > app.screen.height - drop.height/2 - paddle.height/2 && 
                   Math.abs(drop.x - paddle.x) < (drop.width/2 + paddle.width/2)) {
          // Image caught by paddle
          const currentImage = drop.texture.textureCacheIds[0];
          if (caughtImages[currentImage]) {
            screen = 2; // Game over
          } else {
            caughtImages[currentImage] = true;
            app.stage.removeChild(drop);
            drops.splice(index, 1);
            speed += 0.1;
            score += 1;
            if (score === images.length) {
              screen = 3; // Win condition
            }
          }
        }
      });
    }

    function endScreen() {
      messageText.text = `GAME OVER\nSCORE = ${score}\nYou caught the same image twice!\nClick to play again`;
      drops.forEach(drop => drop.visible = false);
      paddle.visible = false;
      scoreText.visible = false;
    }

    function winScreen() {
      messageText.text = `CONGRATULATIONS!\nYou caught all ${images.length} images!\nClick to play again`;
      drops.forEach(drop => drop.visible = false);
      paddle.visible = false;
      scoreText.visible = false;
    }

    function resetDrop(drop) {
      const randomImage = images[Math.floor(Math.random() * images.length)];
      drop.texture = PIXI.Texture.from(randomImage.src);
      
      drop.height = randomImage.height;
      drop.width = randomImage.width === 'auto' ? randomImage.height : randomImage.width;

      const halfDropWidth = drop.width / 2;
      drop.x = Math.random() * (app.screen.width - drop.width) + halfDropWidth;
      drop.y = -drop.height / 2;
    }

    function reset() {
      score = 0;
      speed = 2;
      caughtImages = {};
      dropInterval = 1000;
      drops.forEach(drop => {
        app.stage.removeChild(drop);
      });
      drops = [];
    }

    // Main game loop
    function gameLoop() {
      if (screen === 0) {
        startScreen();
      } else if (screen === 1) {
        gameOn();
      } else if (screen === 2) {
        endScreen();
      } else if (screen === 3) {
        winScreen();
      }
    }

    // Handle click events
    function handleClick() {
      if (screen === 0) {
        screen = 1;
        reset();
      } else if (screen === 2 || screen === 3) {
        screen = 0;
      }
    }

    // Set up the game
    setup();
    app.ticker.add(gameLoop);
    app.view.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      app.destroy(true);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
      <div ref={gameRef}></div>
  );
}

export default App;
