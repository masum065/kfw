import { useEffect, useState } from "react";
interface WindowSize {
  width: Number,
  height: Number,
  isMobile: Boolean,
  isTabPort: Boolean,
}
// Hook
function useWindowSize() {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: true,
    isTabPort: false,
  });

  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 450,
      isTabPort: window.innerWidth < 900,
    });
  };

  useEffect(() => {
    // only execute all the code below in client side
    if (typeof window !== "undefined") {
      // Handler to call on window resize
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Call handler right away so state gets updated with initial window size
      handleResize();

      // Remove event listener on cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default useWindowSize;
