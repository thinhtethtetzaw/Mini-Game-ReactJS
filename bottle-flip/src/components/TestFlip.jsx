import { useEffect, useRef, useState } from "react";

const TestFlip = () => {
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
    return Math.abs(bottleRotation.current) >= 5.7 && Math.abs(bottleRotation.current) <= 6.4;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const drawBottle = () => {
      ctx.save();
      ctx.translate(200, bottleY.current);
      ctx.rotate(bottleRotation.current);
      bottleImage.current.src = '/bottle.svg'; 
      
      // ctx.fillStyle = "lightblue";
      // ctx.fillRect(-15, -50, 30, 50);
      // ctx.fillStyle = "blue";
      // ctx.fillRect(-15, 0, 30, 100);

      ctx.drawImage(bottleImage.current, -75, -50, 150, 200);
      
      ctx.restore();
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

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
        if (bottleRotation.current > 6.4) {
          bottleRotation.current += 0.05; // Slowly rotate towards 7.8
          if (bottleRotation.current >= 7.8) {
            bottleRotation.current = 7.75; // Set final resting position
            falling.current = false;
            setMessage("The bottle fell! Try again.");
          }
        } else if (bottleRotation.current < 5.7) {
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
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width="400"
        height="500"
        className="border-2 border-blue-500 rounded-lg shadow-lg bg-red-200"
      />
      {message && (
        <div className="absolute bg-white p-4 rounded shadow-lg">
          <p>{message}</p>
          {showTryAgain && (
            <button onClick={resetGame} className="mt-2 bg-blue-500 text-white p-2 rounded">
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TestFlip;
