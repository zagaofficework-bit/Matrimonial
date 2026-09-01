import { useNavigate } from 'react-router-dom';
import './StoryCard.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Homepage slider aur Success Stories list, dono jagah yehi card use hota hai.
export default function StoryCard({ story }) {
  const navigate = useNavigate();

  function goToDetail(e) {
    e.stopPropagation();
    navigate(`/success-stories/${story._id}`);
  }

  return (
    <div className="story-card" onClick={goToDetail}>
      <div className="story-card-image">
        <img src={story.image} alt={story.coupleNames} />
      </div>
      <div className="story-card-body">
        <div className="story-card-heading">
          <span className="story-card-names">{story.coupleNames}</span>
          {story.partnerUserId?.name && (
            <span className="story-card-tag">with {story.partnerUserId.name}</span>
          )}
          <span className="story-card-date">{formatDate(story.storyDate)}</span>
        </div>

        <p className="story-card-text">{story.story}</p>

        <button type="button" className="story-card-more" onClick={goToDetail}>
          View more detail about story
        </button>
      </div>
    </div>
  );
}