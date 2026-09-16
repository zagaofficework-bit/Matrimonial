import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StoryCard from './StoryCard';
import { getFeaturedStories } from '../../api/successStory.api';
import './SuccessStoriesSection.css';

export default function SuccessStoriesSection() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const data = await getFeaturedStories();
        if (isMounted) setStories(data || []);
      } catch {
        // Silent fail - Home page pe ye sirf ek preview section hai
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || stories.length === 0) return null;

  return (
    <div className="page-container success-stories-section">
      <div className="home-header">
        <h2>Success Stories</h2>
        <Link to="/success-stories" className="btn btn-outline btn-sm">
          View All
        </Link>
      </div>
      <div className="stories-grid">
        {stories.slice(0, 3).map((story) => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
}