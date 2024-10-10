import { useRef, useEffect, useState } from "react";

const VFlipGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    let bottle = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      width: 30,
      height: 100,
      rotation: 0,
      velocityY: 0,
      angularVelocity: 0,
      flipping: false,
      grounded: true,
    };

    const gravity = 0.5;
    const flipForce = -15;
    const rotationSpeed = 0.2;
    const airResistance = 0.995;

    function drawBottle() {
      ctx.save();
      ctx.translate(bottle.x, bottle.y);
      ctx.rotate(bottle.rotation);
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(
        -bottle.width / 2,
        -bottle.height / 2,
        bottle.width,
        bottle.height
      );
      ctx.fillStyle = "#4682B4";
      ctx.fillRect(
        -bottle.width / 2,
        -bottle.height / 2,
        bottle.width,
        bottle.height / 3
      );
      ctx.restore();
    }

    function updateBottle() {
      if (bottle.flipping) {
        bottle.y += bottle.velocityY;
        bottle.velocityY += gravity;
        bottle.rotation += bottle.angularVelocity;

        bottle.velocityY *= airResistance;
        bottle.angularVelocity *= airResistance;

        if (bottle.y >= canvas.height - bottle.height / 2) {
          bottle.y = canvas.height - bottle.height / 2;
          bottle.flipping = false;

          const normalizedRotation =
            ((bottle.rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const degreesRotation = (normalizedRotation * 180) / Math.PI;
          const uprightRange =
            degreesRotation >= 330 ||
            degreesRotation <= 30 ||
            (degreesRotation >= 150 && degreesRotation <= 210);

          if (uprightRange && Math.abs(bottle.angularVelocity) < 0.15) {
            console.log("Landed upright!");
            bottle.grounded = true;
            bottle.rotation = Math.round(bottle.rotation / Math.PI) * Math.PI;
            bottle.angularVelocity = 0;
            setScore((prevScore) => prevScore + 1);
          } else {
            console.log("Fell over!");
            bottle.grounded = true;
            // Randomly choose left or right fall direction
            bottle.rotation = Math.random() < 0.5 ? Math.PI / 2 : -Math.PI / 2;
            bottle.angularVelocity = 0;
          }

          bottle.velocityY = 0;
        }
      }
    }

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateBottle();
      drawBottle();
      requestAnimationFrame(gameLoop);
    }

    function flipBottle() {
      if (!bottle.flipping && bottle.grounded) {
        bottle.flipping = true;
        bottle.grounded = false;
        bottle.velocityY = flipForce;
        bottle.angularVelocity = rotationSpeed * (Math.random() > 0.5 ? 1 : -1);
        if (bottle.rotation !== 0) {
          bottle.rotation = 0;
        }
      }
    }

    function handleCanvasClick(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        flipBottle();
      }
    }

    canvas.addEventListener("click", handleCanvasClick);

    gameLoop();

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Easier Bottle Flip Game</h1>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 rounded-lg shadow-lg"
      ></canvas>
      <p className="mt-4 text-xl font-bold">Score: {score}</p>
      <p className="mt-2 text-gray-600">
        Click or tap the canvas to flip the bottle!
      </p>
    </div>
  );
}

export default VFlipGame;
