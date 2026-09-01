import { useEffect, useState } from 'react';
import StoryCard from '../../components/SuccessStories/StoryCard';
import { listStories } from '../../api/successStory.api';
import './SuccessStoriesList.css';

export default function SuccessStoriesList() {
  const [stories, setStories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await listStories(1);
        if (!isMounted) return;
        setStories(data.stories);
        setTotalPages(data.pagination.totalPages);
        setPage(1);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Could not load stories.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await listStories(nextPage);
      setStories((prev) => [...prev, ...data.stories]);
      setPage(nextPage);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load more stories.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="page-container">
      <div className="home-header">
        <h2>Success Stories</h2>
        <p className="home-subtitle">Real couples, real happily-ever-afters</p>
      </div>

      {loading && <p className="state-message">Loading stories...</p>}
      {!loading && error && <p className="state-message">{error}</p>}
      {!loading && !error && stories.length === 0 && (
        <p className="state-message">No success stories yet.</p>
      )}

      {!loading && !error && stories.length > 0 && (
        <>
          <div className="stories-grid">
            {stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {page < totalPages && (
            <div className="stories-load-more">
              <button type="button" className="btn btn-outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}