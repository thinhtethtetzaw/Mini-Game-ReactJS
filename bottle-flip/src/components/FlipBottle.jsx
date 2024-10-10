import { useEffect, useRef, useState } from "react";

const FlipBottle = () => {
  const canvasRef = useRef(null);
  const bottleRotation = useRef(0);
  const bottleY = useRef(400);
  const flipping = useRef(false);
  const falling = useRef(false); // New ref to detect falling state
  const flipSpeed = useRef(0);
  const verticalSpeed = useRef(0);
  const gravity = 0.6;
  const friction = 0.985; // Friction to slow down rotation
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [message, setMessage] = useState(""); // Message to show if bottle stands
  const animationFrameId = useRef(null); // Ref to store the animation frame ID
  const bottleImage = useRef(new Image());

  const isBottleNearUpright = () => {
    // Check if the bottle rotation is close to upright
    return Math.abs(bottleRotation.current) >= 5.5 && Math.abs(bottleRotation.current) <= 6.5;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Update canvas size
    canvas.width = 400;
    canvas.height = 600;

    const drawBackground = () => {
      // Draw blue radial gradient background
      const gradient = ctx.createRadialGradient(200, 300, 0, 200, 300, 400);
      gradient.addColorStop(0, '#0066cc');
      gradient.addColorStop(1, '#003366');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw wooden surface at the bottom
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 300, canvas.width, 300);
    };

    const drawLogo = () => {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GRAND ROYAL', canvas.width / 2, 40);
      ctx.font = 'italic 18px Arial';
      ctx.fillText('Signature', canvas.width / 2, 65);
    };

    const drawBottle = () => {
      ctx.save();
      ctx.translate(200, bottleY.current);
      ctx.rotate(bottleRotation.current);
      bottleImage.current.src = '/bottle.png'; 
      ctx.drawImage(bottleImage.current, -80, -130, 180, 200);
      ctx.restore();
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      drawLogo();

      if (flipping.current) {
        bottleRotation.current += flipSpeed.current;
        bottleY.current += verticalSpeed.current;
        verticalSpeed.current += gravity;
        flipSpeed.current *= friction; // Apply friction to slow down rotation

        if (bottleY.current >= 400) {
          bottleY.current = 400;
          flipping.current = false;
          verticalSpeed.current = 0;

          // If the bottle is near upright, auto-correct to upright
          if (isBottleNearUpright()) {
            bottleRotation.current = 0; // Snap to upright
            flipSpeed.current = 0; // Stop rotation
            setMessage("The bottle stood upright! Great flip!");
          } else {
            falling.current = true;
            setShowTryAgain(true);
          }
        }
      } else if (falling.current) {
        // Apply a gradual rotation until the bottle is horizontal
        if (bottleRotation.current > 6.5) {
          bottleRotation.current += 0.05; // Slowly rotate towards 7.8
          if (bottleRotation.current >= 7.8) {
            bottleRotation.current = 7.75; // Set final resting position
            falling.current = false;
            setMessage("The bottle fell! Try again.");
          }
        } else if (bottleRotation.current < 5.5) {
          bottleRotation.current -= 0.05; // Slowly rotate towards 4.6
          if (bottleRotation.current <= 4.6) {
            bottleRotation.current = 4.55 + Math.random() * 0.1 ; // Set final resting position
            falling.current = false;
            setMessage("The bottle fell! Try again.");
          }
        } else {
          falling.current = false;
          setMessage("The bottle fell! Try again.");
        }
      }

      drawBottle();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    // Start the game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);

    const flipBottle = () => {
      if (showTryAgain || flipping.current) return; // Prevent flipping if "Try Again" is visible or already flipping
      flipping.current = true;
      flipSpeed.current = Math.random() * 0.2 + 0.1; // Random initial rotation speed
      verticalSpeed.current = -15; // Initial upward velocity
      setShowTryAgain(false);
      setMessage(""); // Clear any previous messages
    };

    canvas.addEventListener("click", flipBottle);

    return () => {
      canvas.removeEventListener("click", flipBottle);
      cancelAnimationFrame(animationFrameId.current); // Cancel the current animation frame
    };
  }, [showTryAgain]); // Added showTryAgain to dependencies

  const resetGame = () => {
    // Reset all state and variables
    bottleRotation.current = 0;
    bottleY.current = 400;
    flipping.current = false;
    falling.current = false; // Reset the falling state
    verticalSpeed.current = 0;
    flipSpeed.current = 0; // Reset the flip speed
    setShowTryAgain(false);
    setMessage(""); // Clear message

    // Cancel any ongoing animation and restart the game loop
    cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBottle();
      gameLoop();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-900">
      <div className="text-slate-200 text-4xl font-bold mb-10">FLIP THE BOTTLE!</div>
      <canvas
        ref={canvasRef}
        className="rounded-lg shadow-lg"
      />
      {message && (
        <div className="absolute bg-white p-4 rounded shadow-lg">
          <p>{message}</p>
          {showTryAgain && (
            <button onClick={resetGame} className="w-full mt-5 bg-blue-500 text-white p-2 rounded font-bold">
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FlipBottle;
