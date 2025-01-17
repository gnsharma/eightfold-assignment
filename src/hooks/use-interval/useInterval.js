// Source:- https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import { useEffect, useRef } from "react";

// delay is a Number representing the interval time in milliseconds
function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
    return () => {};
  }, [delay]);
}

export default useInterval;
