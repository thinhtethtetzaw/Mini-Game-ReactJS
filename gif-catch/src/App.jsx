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
    <div className="relative w-[500px] h-screen overflow-hidden flex items-center justify-center mx-auto bg-[url('/bg-with-light.png')] bg-contain bg-center bg-no-repeat">
      <div className='mt-[8.5rem]'>
        <img 
          ref={topRectRef}
          src={'/bottlePieces/top.png'}
          className={`w-[5.5rem] absolute z-10 translate-y-[-113.4px] ${isAnimating ? 'animate-move-right-left' : ''}`}
          // className={`w-[5.5rem] absolute z-10 translate-y-[-113.4px] ${isAnimating ? '' : ''}`}
        />
        <img 
          ref={middleRectRef}
          src={'/bottlePieces/middle.png'}
          className={`w-[5.5rem] absolute z-10  ${isAnimating ? 'animate-move-left-right' : ''}`}
          // className={`w-[5.5rem] absolute z-10  ${isAnimating ? '' : ''}`}
        />
        <img 
          ref={BottomRectRef}
          src={'/bottlePieces/bottom.png'}
          className={`w-[5.5rem] absolute z-10 translate-y-[106px] ${isAnimating ? 'animate-move-right-left' : ''}`}
          // className={`w-[5.5rem] absolute z-10 translate-y-[106px] ${isAnimating ? '' : ''}`}
        />
      </div>  
      <div ref={caughtAreaRef} className="w-[5.5rem] h-80 translate-y-[7.5rem]"></div>
      <img 
        src={'/bottlePieces/frame1.png'}
        className="w-[6.3rem] h-[315.5px] absolute z-20 translate-y-[6.6rem]"
      />
      
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
