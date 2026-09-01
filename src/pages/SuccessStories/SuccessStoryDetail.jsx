import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoryById } from '../../api/successStory.api';
import './SuccessStoryDetail.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function SuccessStoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getStoryById(id);
        if (isMounted) setStory(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Ye story nahi mili.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <p className="state-message">Loading story...</p>;
  if (error || !story) return <p className="state-message">{error || 'Story nahi mili.'}</p>;

  return (
    <div className="page-container story-detail-page">
      <Link to="/success-stories" className="story-detail-back">
        ‹ Back to Success Stories
      </Link>

      <div className="story-detail-card">
        <img src={story.image} alt={story.coupleNames} className="story-detail-image" />

        <div className="story-detail-body">
          <h1 className="story-detail-names">{story.coupleNames}</h1>
          {story.partnerUserId?.name && (
            <span className="story-detail-tag">Tagged: {story.partnerUserId.name}</span>
          )}
          <p className="story-detail-date">{formatDate(story.storyDate)}</p>
          <p className="story-detail-text">{story.story}</p>
        </div>
      </div>
    </div>
  );
}