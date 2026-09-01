import { useCallback, useEffect, useState } from 'react';
import { getMyStories } from '../api/successStory.api';
import { useAuth } from '../context/AuthContext';

// Story create/update hone ke baad ye event fire hota hai, taaki Navbar aur
// Home page ka "Share Your Story" CTA turant update ho jaye - page reload
// ki zaroorat nahi.
export const STORY_UPDATED_EVENT = 'matrimony:story-updated';

export function notifyStoryUpdated() {
  window.dispatchEvent(new Event(STORY_UPDATED_EVENT));
}

// Batata hai ki logged-in user ne pehle se koi success story share ki hai ya nahi.
// Navbar / Home page isse use karte hain "Share Your Story" CTA dobara na
// dikhane ke liye jab user already ek story post kar chuka ho.
export function useMyStoryStatus() {
  const { isAuthenticated } = useAuth();
  const [hasStory, setHasStory] = useState(false);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(() => {
    if (!isAuthenticated) {
      setHasStory(false);
      setChecking(false);
      return () => {};
    }

    let isCancelled = false;
    setChecking(true);

    getMyStories()
      .then((stories) => {
        if (!isCancelled) setHasStory(Array.isArray(stories) && stories.length > 0);
      })
      .catch(() => {
        if (!isCancelled) setHasStory(false);
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

  useEffect(() => {
    window.addEventListener(STORY_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STORY_UPDATED_EVENT, refresh);
  }, [refresh]);

  return { hasStory, checking, refresh };
}