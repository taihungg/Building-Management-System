import { useState, useEffect } from 'react';

// Hook to trigger re-render every minute for real-time updates
export const useRealtime = (intervalMs: number = 60000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return currentTime;
};



