import { useState, useEffect, useRef } from 'react';

function App() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isInside, setIsInside] = useState(false);
  const middleRectRef = useRef(null);
  const topRectRef = useRef(null);
  const BottomRectRef = useRef(null);
  const caughtAreaRef = useRef(null);

  useEffect(() => {
    const handleClick = () => {
      setIsAnimating((prevState) => !prevState);
      
      if (isAnimating) {
        // If currently animating, stop and check if inside
        checkInside();
      } else {
        // If not animating, start animation and set isInside to false
        setIsInside(false);
      }

      const TopRect = topRectRef.current;
      const MiddleRect = middleRectRef.current;
      const BottomRect = BottomRectRef.current;
      if (MiddleRect || TopRect || BottomRect) {
        if (isAnimating) {
          const topComputedStyle = window.getComputedStyle(TopRect);
          const middleComputedStyle = window.getComputedStyle(MiddleRect);
          const bottomComputedStyle = window.getComputedStyle(BottomRect);
          TopRect.style.left = topComputedStyle.left;
          MiddleRect.style.left = middleComputedStyle.left;
          BottomRect.style.left = bottomComputedStyle.left;
        } else {
          TopRect.style.left = '';
          MiddleRect.style.left = ''; 
          BottomRect.style.left = '';
        }
      }
    };

    const checkInside = () => {
      const blueRect = middleRectRef.current;
      const redBorder = caughtAreaRef.current;
      if (blueRect && redBorder) {
        const blueBox = blueRect.getBoundingClientRect();
        const redBox = redBorder.getBoundingClientRect();

        // Add a small tolerance (e.g., 2 pixels) to account for minor discrepancies
        const tolerance = 2;
        const isInsideNow = 
          blueBox.left + tolerance >= redBox.left &&
          blueBox.right - tolerance <= redBox.right &&
          blueBox.top + tolerance >= redBox.top &&
          blueBox.bottom - tolerance <= redBox.bottom;

        setIsInside(isInsideNow);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isAnimating]);

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[url('/bg.jpg')] bg-cover bg-center">
      <img 
        ref={topRectRef}
        src={'/bottlePieces/top.png'}
        className={`size-32 absolute z-10 translate-y-[-8rem] ${isAnimating ? 'animate-move-right-left' : ''}`}
      />
      <img 
        ref={middleRectRef}
        src={'/bottlePieces/middle.png'}
        className={`size-32 absolute z-10  ${isAnimating ? 'animate-move-left-right' : ''}`}
      />
      <img 
        ref={BottomRectRef}
        src={'/bottlePieces/bottom.png'}
        className={`size-32 absolute z-10 translate-y-[8rem] ${isAnimating ? 'animate-move-right-left' : ''}`}
      />
      
      <div ref={caughtAreaRef} className="size-32 z-20"></div>
      {isInside && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded z-30">
          Congratulations! You caught the bottle!
        </div>
      )}
      {!isInside && !isAnimating && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded z-30">
          Sorry! You missed the bottle. Try again
        </div>
      )}
    </div>
  )
}

export default App
