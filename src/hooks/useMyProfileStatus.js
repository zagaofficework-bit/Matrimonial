import { useCallback, useEffect, useState } from 'react';
import { getMyProfile } from '../api/profile.api';
import { useAuth } from '../context/AuthContext';

// Event jo profile create/update hone ke baad fire hota hai, taaki Navbar
// (ya koi bhi component jo ye hook use karta hai) turant refresh ho jaye -
// page reload ki zaroorat nahi.
export const PROFILE_UPDATED_EVENT = 'matrimony:profile-updated';

export function notifyProfileUpdated() {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

// Batata hai ki logged-in user ki profile pehle se bani hai ya nahi.
// Navbar isse use karta hai "My Profile" vs "Create Your Profile" dikhane ke liye.
export function useMyProfileStatus() {
  const { isAuthenticated } = useAuth();
  const [hasProfile, setHasProfile] = useState(null); // null = abhi pata nahi
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setHasProfile(null);
      setChecking(false);
      return () => {};
    }

    let isCancelled = false;
    setChecking(true);

    getMyProfile()
      .then(() => {
        if (!isCancelled) setHasProfile(true);
      })
      .catch(() => {
        if (!isCancelled) setHasProfile(false);
      })
      .finally(() => {
        if (!isCancelled) setChecking(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const cancel = refresh();
    return cancel;
  }, [refresh]);

  // Profile save/create hone ke baad ProfileForm ye event fire karta hai,
  // isse Navbar bina page reload kiye "My Profile" turant dikhane lagta hai.
  useEffect(() => {
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
  }, [refresh]);

  return { hasProfile, checking, refresh };
}
