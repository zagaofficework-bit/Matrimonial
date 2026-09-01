import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createStory, updateStory, getMyStories } from '../../api/successStory.api';
import { notifyStoryUpdated } from '../../hooks/useMyStoryStatus';
import './AddSuccessStory.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Date input needs yyyy-mm-dd, but story.storyDate is an ISO string
function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 10);
}

const emptyForm = { coupleNames: '', story: '', storyDate: '', partnerEmail: '' };

export default function AddSuccessStory() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 'list' - when the user already has stories, 'form' - when adding or editing a new one
  const [view, setView] = useState('form');
  const [myStories, setMyStories] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function load() {
      setLoadingList(true);
      try {
        const stories = await getMyStories();
        if (!isMounted) return;
        setMyStories(stories);
        setView(stories.length > 0 ? 'list' : 'form');
      } catch {
        // If the list fails to load, still show the form so the user can add a new story
        if (isMounted) setView('form');
      } finally {
        if (isMounted) setLoadingList(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setPreview('');
    setError('');
    setFieldErrors({});
    setView('form');
  }

  function openEditForm(story) {
    setEditingId(story._id);
    setForm({
      coupleNames: story.coupleNames || '',
      story: story.story || '',
      storyDate: toDateInputValue(story.storyDate),
      partnerEmail: story.partnerUserId?.email || ''
    });
    setImage(null);
    setPreview(story.image || '');
    setError('');
    setFieldErrors({});
    setView('form');
  }

  function backToList() {
    setView('list');
    setError('');
  }

  function validate() {
    const errors = {};
    if (!form.coupleNames.trim()) errors.coupleNames = 'Couple names is required.';
    if (!form.storyDate) {
      errors.storyDate = 'Story date is required.';
    } else if (new Date(form.storyDate).getTime() > Date.now()) {
      errors.storyDate = 'Story date cannot be in the future.';
    }
    if (form.partnerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.partnerEmail.trim())) {
      errors.partnerEmail = 'Please enter a valid email address.';
    }
    if (!form.story.trim()) errors.story = 'Please write your story.';
    if (!editingId && !image) errors.image = 'Please choose a photo.';
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateStory(editingId, { ...form, image });
        setMyStories((prev) => prev.map((s) => (s._id === editingId ? updated : s)));
        setView('list');
        notifyStoryUpdated();
      } else {
        const created = await createStory({ ...form, image });
        notifyStoryUpdated();
        navigate(`/success-stories/${created._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the story. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingList) {
    return <p className="state-message">Loading...</p>;
  }

  if (view === 'list') {
    return (
      <div className="page-container add-story-page">
        <div className="home-header add-story-header">
          <h2>Success Stories</h2>
          <p className="home-subtitle">Stories you've added</p>
        </div>

        <div className="my-stories-list">
          {myStories.map((story) => (
            <div className="my-story-row" key={story._id}>
              <img src={story.image} alt={story.coupleNames} className="my-story-row-image" />
              <div className="my-story-row-body">
                <span className="my-story-row-names">{story.coupleNames}</span>
                <span className="my-story-row-date">{formatDate(story.storyDate)}</span>
                {story.partnerUserId?.name && (
                  <span className="my-story-row-tag">
                    <span className="my-story-row-tag-icon" aria-hidden="true">♥</span>
                    Tagged: {story.partnerUserId.name}
                  </span>
                )}
              </div>
              <button type="button" className="btn btn-outline btn-sm my-story-edit-btn" onClick={() => openEditForm(story)}>
                Edit Story
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="btn add-more-story-btn" onClick={openAddForm}>
          <span className="add-more-story-icon" aria-hidden="true">+</span>
          Add More Story
        </button>
      </div>
    );
  }

  return (
    <div className="page-container add-story-page">
      <div className="home-header">
        <h2>{editingId ? 'Edit Success Story' : 'Add Success Story'}</h2>
        <p className="home-subtitle">Will appear on the homepage and Success Stories page</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="add-story-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Photo</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              handleImageChange(e);
              setFieldErrors((prev) => ({ ...prev, image: undefined }));
            }}
            required={!editingId}
            aria-invalid={Boolean(fieldErrors.image)}
          />
          {fieldErrors.image && <span className="field-error">{fieldErrors.image}</span>}
          {preview && <img src={preview} alt="Preview" className="add-story-preview" />}
        </div>

        <div className="field-group">
          <label>Couple Names</label>
          <input
            type="text"
            placeholder="e.g. Rahul & Priya"
            value={form.coupleNames}
            onChange={(e) => {
              setForm((f) => ({ ...f, coupleNames: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, coupleNames: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.coupleNames)}
            required
          />
          {fieldErrors.coupleNames && <span className="field-error">{fieldErrors.coupleNames}</span>}
        </div>

        <div className="field-group">
          <label>Story Date</label>
          <input
            type="date"
            value={form.storyDate}
            onChange={(e) => {
              setForm((f) => ({ ...f, storyDate: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, storyDate: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.storyDate)}
            required
          />
          {fieldErrors.storyDate && <span className="field-error">{fieldErrors.storyDate}</span>}
        </div>

        <div className="field-group">
          <label>Partner's Email (optional)</label>
          <input
            type="email"
            placeholder="Enter partner's registered email to tag them"
            value={form.partnerEmail}
            onChange={(e) => {
              setForm((f) => ({ ...f, partnerEmail: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, partnerEmail: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.partnerEmail)}
          />
          {fieldErrors.partnerEmail && <span className="field-error">{fieldErrors.partnerEmail}</span>}
          <p className="field-hint">If tagged, this story will also appear on their account (My Profile and public profile).</p>
        </div>

        <div className="field-group">
          <label>Story</label>
          <textarea
            rows={6}
            placeholder="Write their story..."
            value={form.story}
            onChange={(e) => {
              setForm((f) => ({ ...f, story: e.target.value }));
              setFieldErrors((prev) => ({ ...prev, story: undefined }));
            }}
            aria-invalid={Boolean(fieldErrors.story)}
            required
          />
          {fieldErrors.story && <span className="field-error">{fieldErrors.story}</span>}
        </div>

        <div className="add-story-actions">
          {myStories.length > 0 && (
            <button type="button" className="btn btn-outline" onClick={backToList} disabled={saving}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Publish Story'}
          </button>
        </div>
      </form>
    </div>
  );
}