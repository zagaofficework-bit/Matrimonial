import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StoryCard from './StoryCard';
import { getFeaturedStories } from '../../api/successStory.api';
import { useHasMatch } from '../../hooks/useHasMatch';
import { useMyStoryStatus } from '../../hooks/useMyStoryStatus';
import './SuccessStoriesSection.css';

const VISIBLE_COUNT = 3;
const AUTO_SLIDE_MS = 4500;

export default function SuccessStoriesSection() {
  const navigate = useNavigate();
  const { hasMatch } = useHasMatch();
  const { hasStory } = useMyStoryStatus();
  const [stories, setStories] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getFeaturedStories();
        if (isMounted) setStories(data);
      } catch (err) {
        // Homepage - agar stories load na ho, section bas hide ho jaata hai, error nahi dikhate
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const goNext = useCallback(() => {
    setStartIndex((prev) => (stories.length ? (prev + 1) % stories.length : 0));
  }, [stories.length]);

  const goPrev = useCallback(() => {
    setStartIndex((prev) => (stories.length ? (prev - 1 + stories.length) % stories.length : 0));
  }, [stories.length]);

  useEffect(() => {
    if (stories.length <= VISIBLE_COUNT) return undefined;

    timerRef.current = setInterval(goNext, AUTO_SLIDE_MS);
    return () => clearInterval(timerRef.current);
  }, [stories.length, goNext]);

  if (loading) return null;

  if (stories.length === 0) {
    if (!hasMatch) return null;

    return (
      <section className="success-stories-section">
        <div className="page-container success-stories-empty">
          <div>
            <h2>Success Stories</h2>
            <p className="home-subtitle">Aapka match ho chuka hai - apni kahani sabse pehle share karein!</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/success-stories/new')}>
            {hasStory ? 'My Success Story' : 'Share Your Story'}
          </button>
        </div>
      </section>
    );
  }

  const visibleStories = Array.from({ length: Math.min(VISIBLE_COUNT, stories.length) }, (_, i) => {
    return stories[(startIndex + i) % stories.length];
  });

  return (
    <section className="success-stories-section">
      <div className="page-container">
        <div className="success-stories-header">
          <div>
            <h2>Success Stories</h2>
            <p className="home-subtitle">Real couples, real happily-ever-afters</p>
          </div>
          <div className="success-stories-header-actions">
            {hasMatch && (
              <button type="button" className="btn btn-primary" onClick={() => navigate('/success-stories/new')}>
                {hasStory ? 'My Success Story' : 'Share Your Story'}
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={() => navigate('/success-stories')}>
              View More
            </button>
          </div>
        </div>

        <div className="success-stories-row">
          {stories.length > VISIBLE_COUNT && (
            <button
              type="button"
              className="story-nav-btn story-nav-prev"
              onClick={goPrev}
              aria-label="Previous stories"
            >
              ‹
            </button>
          )}

          <div className="success-stories-track">
            {visibleStories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {stories.length > VISIBLE_COUNT && (
            <button type="button" className="story-nav-btn story-nav-next" onClick={goNext} aria-label="Next stories">
              ›
            </button>
          )}
        </div>
      </div>
    </section>
  );
}