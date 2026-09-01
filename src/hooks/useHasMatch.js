import { useEffect, useState } from 'react';
import { getMatches } from '../api/interest.api';
import { useAuth } from '../context/AuthContext';

// "Share Your Story" CTA (Home page / My Profile page) sirf un users ko
// dikhta hai jinka kam se kam ek match ho chuka hai.
export function useHasMatch() {
  const { isAuthenticated } = useAuth();
  const [hasMatch, setHasMatch] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasMatch(false);
      setChecking(false);
      return undefined;
    }

    let isCancelled = false;
    setChecking(true);

    getMatches()
      .then((matches) => {
        if (!isCancelled) setHasMatch(Array.isArray(matches) && matches.length > 0);
      })
      .catch(() => {
        if (!isCancelled) setHasMatch(false);
      })
      .finally(() => {
        if (!isCancelled) setChecking(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  return { hasMatch, checking };
}