import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMyProfile,
  saveMyProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
  importBioData
} from '../../api/profile.api';
import { notifyProfileUpdated } from '../../hooks/useMyProfileStatus';
import { RELIGION_OPTIONS } from '../../utils/Religionoptions';
import { CASTE_OPTIONS } from '../../utils/Casteoptions';
import { EDUCATION_OPTIONS } from '../../utils/Educationoptions';
import { OCCUPATION_OPTIONS } from '../../utils/Occupationoptions';
import { STATE_OPTIONS } from '../../utils/Stateoptions';
import { HEIGHT_OPTIONS } from '../../utils/Heightoptions';
import { INCOME_AMOUNT_OPTIONS } from '../../utils/Incomeoptions';
import { MOTHER_TONGUE_OPTIONS } from '../../utils/MotherTongueoptions';
import './ProfileForm.css';

// Backend se aane wale error ke alag-alag shapes ko ek readable
// message me convert karta hai, taaki user ko exactly pata chale
// ki kya galat hua (sirf generic "kuch gadbad hai" nahi).
function extractErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (!data) return err?.message || fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => (typeof item === 'string' ? item : item.message || item.msg))
      .filter(Boolean)
      .join(' | ');
  }

  if (data.message) return data.message;
  if (typeof data === 'string') return data;
  return fallback;
}

// Extracted field ka backend "key" -> form me dikhne wala readable naam.
// Sirf UI message ke liye use hota hai ("Height, Occupation filled...").
const FIELD_LABELS = {
  height: 'Height',
  maritalStatus: 'Marital status',
  motherTongue: 'Mother tongue',
  religion: 'Religion',
  caste: 'Caste',
  education: 'Education',
  occupation: 'Occupation',
  annualIncome: 'Annual income',
  city: 'City',
  state: 'State',
  bio: 'About you'
};

const initialForm = {
  height: '',
  maritalStatus: '',
  motherTongue: '',
  bio: '',

  religion: '',
  caste: '',
  subCaste: '',

  education: '',
  occupation: '',
  annualIncome: '',

  city: '',
  state: '',
  country: 'India',

  familyDetails: {
    fatherName: '',
    motherName: '',
    siblings: 0,
    familyType: '',
    familyValues: ''
  },

  astroDetails: {
    enabled: false,
    birthTime: '',
    birthPlace: ''
  },

  lifestyle: {
    diet: '',
    smoking: '',
    drinking: '',
    activityLevel: ''
  },
  interests: '',

  privacy: {
    showContactTo: 'matched_only',
    showPhotosTo: 'everyone'
  }
};

// Number-type fields ke liye range validation - inhe blank chhodna allowed
// hai (optional fields), lekin agar value bhari hai to range ke andar honi
// chahiye.
function validateNumberField(name, value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return 'Please enter a valid number.';

  if (name === 'height') {
    if (num < 100 || num > 250) return 'Height must be between 100 and 250 cm.';
  }
  if (name === 'annualIncome') {
    if (num < 0) return 'Annual income cannot be negative.';
  }
  if (name === 'siblings') {
    if (num < 0 || num > 20) return 'Number of siblings must be between 0 and 20.';
  }
  return null;
}

export default function ProfileForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isExistingProfile, setIsExistingProfile] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    async function loadExisting() {
      try {
        const profile = await getMyProfile();
        setIsExistingProfile(true);
        setForm({
          height: profile.height ?? '',
          maritalStatus: profile.maritalStatus ?? '',
          motherTongue: profile.motherTongue ?? '',
          bio: profile.bio ?? '',
          religion: profile.religion ?? '',
          caste: profile.caste ?? '',
          subCaste: profile.subCaste ?? '',
          education: profile.education ?? '',
          occupation: profile.occupation ?? '',
          annualIncome: profile.annualIncome ?? '',
          city: profile.city ?? '',
          state: profile.state ?? '',
          country: profile.country ?? 'India',
          familyDetails: {
            fatherName: profile.familyDetails?.fatherName ?? '',
            motherName: profile.familyDetails?.motherName ?? '',
            siblings: profile.familyDetails?.siblings ?? 0,
            familyType: profile.familyDetails?.familyType ?? '',
            familyValues: profile.familyDetails?.familyValues ?? ''
          },
          astroDetails: {
            enabled: profile.astroDetails?.enabled ?? false,
            birthTime: profile.astroDetails?.birthTime ?? '',
            birthPlace: profile.astroDetails?.birthPlace ?? ''
          },
          lifestyle: {
            diet: profile.lifestyle?.diet ?? '',
            smoking: profile.lifestyle?.smoking ?? '',
            drinking: profile.lifestyle?.drinking ?? '',
            activityLevel: profile.lifestyle?.activityLevel ?? ''
          },
          interests: (profile.interests || []).join(', '),
          privacy: {
            showContactTo: profile.privacy?.showContactTo ?? 'matched_only',
            showPhotosTo: profile.privacy?.showPhotosTo ?? 'everyone'
          }
        });
        setPhotos(profile.photos || []);
      } catch {
        // Profile abhi tak bani nahi - naya form hi rehne do, koi error nahi dikhana
      } finally {
        setLoading(false);
      }
    }
    loadExisting();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    const message = validateNumberField(name, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  }

  function handleNestedChange(section, field, value) {
    setForm((f) => ({ ...f, [section]: { ...f[section], [field]: value } }));

    const message = validateNumberField(field, value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  // Joi optional string fields reject "" outright (except bio, which allows it),
  // aur enum fields (maritalStatus, familyType, etc.) bhi "" ko valid value nahi maante.
  // Isliye blank fields ko payload me bhejne se pehle hi hata dete hain.
  function stripEmptyStrings(obj) {
    const cleaned = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value === '') return; // skip blank fields entirely
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nested = stripEmptyStrings(value);
        if (Object.keys(nested).length > 0) cleaned[key] = nested;
        return;
      }
      cleaned[key] = value;
    });
    return cleaned;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const errors = {
      height: validateNumberField('height', form.height),
      annualIncome: validateNumberField('annualIncome', form.annualIncome),
      siblings: validateNumberField('siblings', form.familyDetails.siblings)
    };
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const wasNewProfile = !isExistingProfile;

    setSaving(true);
    try {
      const interestsArray = form.interests
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = stripEmptyStrings({
        ...form,
        height: form.height === '' ? undefined : Number(form.height),
        annualIncome: form.annualIncome === '' ? undefined : Number(form.annualIncome),
        familyDetails: {
          ...form.familyDetails,
          siblings: Number(form.familyDetails.siblings) || 0
        },
        interests: interestsArray
      });
      if (interestsArray.length === 0) delete payload.interests;
      await saveMyProfile(payload);

      setSuccessMsg(
        isExistingProfile
          ? 'Your profile has been updated successfully.'
          : 'Your profile has been created successfully! It is now visible to others.'
      );
      setIsExistingProfile(true);

      // Navbar ko batao ki profile ban chuki hai, taaki wo turant
      // "My Profile" dikhaye (page reload ki zaroorat na pade).
      notifyProfileUpdated();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Pehli baar profile bani hai - ab partner preferences set karwao,
      // taaki homepage par match % turant kaam karne lage.
      if (wasNewProfile) {
        setTimeout(() => navigate('/preferences?from=profile-create'), 1200);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Profile could not be saved. Please check the details and try again.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const updatedProfile = await uploadProfilePhoto(file);
      setPhotos(updatedProfile.photos || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Photo upload failed. Please try a different image.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handlePhotoDelete(photoId) {
    try {
      const updatedProfile = await deleteProfilePhoto(photoId);
      setPhotos(updatedProfile.photos || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Photo could not be deleted. Please try again.'));
    }
  }

  // "Upload a file, auto-fill the form" flow. File PDF/Word/Excel/CSV
  // ho sakti hai - backend usme se jaani-pehchani fields nikalta hai,
  // hum unhe form me bhar dete hain. Kuch save nahi hota yahan - user
  // pehle sab check karega, phir normal "Save Profile" se submit karega.
  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    setImportMsg('');
    try {
      const extracted = await importBioData(file);
      const keys = Object.keys(extracted || {});

      if (keys.length === 0) {
        setImportMsg(
          "We read your file, but couldn't find any recognizable fields in it. You can fill the form manually below."
        );
      } else {
        setForm((f) => ({
          ...f,
          ...extracted,
          height: extracted.height !== undefined ? String(extracted.height) : f.height,
          annualIncome: extracted.annualIncome !== undefined ? String(extracted.annualIncome) : f.annualIncome
        }));

        const filledLabels = keys.map((key) => FIELD_LABELS[key] || key).join(', ');
        setImportMsg(`Filled from your file: ${filledLabels}. Please review below and submit when ready.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          'Could not extract data from the file. Please try a different file (PDF, Word, Excel or CSV) or fill the form manually.'
        )
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  if (loading) {
    return <p className="state-message">Loading your profile...</p>;
  }

  return (
    <div className="page-container">
      <div className="profile-form-header">
        <h1>{isExistingProfile ? 'Edit Profile' : 'Create Your Profile'}</h1>
        <p className="home-subtitle">Fill in your details so others can find you</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Could not save your profile:</strong> {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success alert-success-row">
          <span>
            <strong>Done!</strong> {successMsg}
          </span>
          <Link to="/profile/me" className="btn btn-primary btn-sm">
            View My Profile
          </Link>
        </div>
      )}

      {importMsg && (
        <div className="alert alert-success">
          <strong>Import complete.</strong> {importMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* ---- Quick fill from an uploaded file ---- */}
        <section className="form-section import-section">
          <h2>Quick Fill from a Document</h2>
          <p className="hint import-hint">
            Already have your bio-data written up somewhere? Upload it and we'll try to fill in the
            matching fields below automatically. You can review and edit everything before saving.
          </p>
          <label className={`import-upload-tile ${importing ? 'is-loading' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M12 3v12M7 8l5-5 5 5M5 21h14" />
            </svg>
            {importing ? 'Reading your file...' : 'Upload bio-data file (PDF, Word, Excel or CSV)'}
            <input
              type="file"
              accept=".pdf,.docx,.xls,.xlsx,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleImportFile}
              disabled={importing}
              hidden
            />
          </label>
        </section>

        {/* ---- Photos ---- */}
        <section className="form-section">
          <h2>Photos</h2>
          <div className="photo-grid">
            {photos.map((photo) => (
              <div className="photo-thumb" key={photo._id}>
                <img src={photo.url} alt="Profile" />
                <button type="button" className="photo-remove" onClick={() => handlePhotoDelete(photo._id)}>
                  ✕
                </button>
                {photo.isPrimary && <span className="photo-primary-badge">Primary</span>}
              </div>
            ))}
            <label className="photo-upload-tile">
              {uploading ? 'Uploading...' : '+ Add photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} hidden />
            </label>
          </div>
        </section>

        {/* ---- Personal Details ---- */}
        <section className="form-section">
          <h2>Personal Details</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="height">Height</label>
              <select
                id="height"
                name="height"
                value={form.height}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.height)}
              >
                <option value="">Select</option>
                {HEIGHT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.height && <span className="field-error">{fieldErrors.height}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="maritalStatus">Marital status</label>
              <select id="maritalStatus" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
                <option value="">Select</option>
                <option value="never_married">Never married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="awaiting_divorce">Awaiting divorce</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label htmlFor="motherTongue">Mother tongue</label>
              <select id="motherTongue" name="motherTongue" value={form.motherTongue} onChange={handleChange}>
                <option value="">Select</option>
                {MOTHER_TONGUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="bio">About you</label>
            <textarea id="bio" name="bio" maxLength={1000} value={form.bio} onChange={handleChange} placeholder="Tell others a little about yourself..." />
            <span className="hint">{form.bio.length}/1000</span>
          </div>
        </section>

        {/* ---- Religion & Community ---- */}
        <section className="form-section">
          <h2>Religion &amp; Community</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="religion">Religion</label>
              <select id="religion" name="religion" value={form.religion} onChange={handleChange}>
                <option value="">Select</option>
                {RELIGION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="caste">Caste</label>
              <select id="caste" name="caste" value={form.caste} onChange={handleChange}>
                <option value="">Select</option>
                {CASTE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="subCaste">Sub-caste</label>
              <input id="subCaste" name="subCaste" value={form.subCaste} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* ---- Education & Career ---- */}
        <section className="form-section">
          <h2>Education &amp; Career</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="education">Education</label>
              <select id="education" name="education" value={form.education} onChange={handleChange}>
                <option value="">Select</option>
                {EDUCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="occupation">Occupation</label>
              <select id="occupation" name="occupation" value={form.occupation} onChange={handleChange}>
                <option value="">Select</option>
                {OCCUPATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="annualIncome">Annual income</label>
              <select
                id="annualIncome"
                name="annualIncome"
                value={form.annualIncome}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.annualIncome)}
              >
                <option value="">Select</option>
                {INCOME_AMOUNT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {fieldErrors.annualIncome && <span className="field-error">{fieldErrors.annualIncome}</span>}
            </div>
          </div>
        </section>

        {/* ---- Location ---- */}
        <section className="form-section">
          <h2>Location</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className="field-group">
              <label htmlFor="state">State</label>
              <select id="state" name="state" value={form.state} onChange={handleChange}>
                <option value="">Select</option>
                {STATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="country">Country</label>
              <input id="country" name="country" value={form.country} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* ---- Family Details ---- */}
        <section className="form-section">
          <h2>Family Details</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="fatherName">Father's name</label>
              <input
                id="fatherName"
                value={form.familyDetails.fatherName}
                onChange={(e) => handleNestedChange('familyDetails', 'fatherName', e.target.value)}
              />
            </div>
            <div className="field-group">
              <label htmlFor="motherName">Mother's name</label>
              <input
                id="motherName"
                value={form.familyDetails.motherName}
                onChange={(e) => handleNestedChange('familyDetails', 'motherName', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="siblings">Number of siblings</label>
              <input
                id="siblings"
                type="number"
                min="0"
                max="20"
                value={form.familyDetails.siblings}
                onChange={(e) => handleNestedChange('familyDetails', 'siblings', e.target.value)}
                aria-invalid={Boolean(fieldErrors.siblings)}
              />
              {fieldErrors.siblings && <span className="field-error">{fieldErrors.siblings}</span>}
            </div>
            <div className="field-group">
              <label htmlFor="familyType">Family type</label>
              <select
                id="familyType"
                value={form.familyDetails.familyType}
                onChange={(e) => handleNestedChange('familyDetails', 'familyType', e.target.value)}
              >
                <option value="">Select</option>
                <option value="nuclear">Nuclear</option>
                <option value="joint">Joint</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="familyValues">Family values</label>
              <select
                id="familyValues"
                value={form.familyDetails.familyValues}
                onChange={(e) => handleNestedChange('familyDetails', 'familyValues', e.target.value)}
              >
                <option value="">Select</option>
                <option value="traditional">Traditional</option>
                <option value="moderate">Moderate</option>
                <option value="liberal">Liberal</option>
              </select>
            </div>
          </div>
        </section>

        {/* ---- Astro Details ---- */}
        <section className="form-section">
          <h2>Astro Details (optional)</h2>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.astroDetails.enabled}
              onChange={(e) => handleNestedChange('astroDetails', 'enabled', e.target.checked)}
            />
            Include astro details on my profile
          </label>

          {form.astroDetails.enabled && (
            <div className="form-row">
              <div className="field-group">
                <label htmlFor="birthTime">Birth time</label>
                <input
                  id="birthTime"
                  type="time"
                  value={form.astroDetails.birthTime}
                  onChange={(e) => handleNestedChange('astroDetails', 'birthTime', e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="birthPlace">Birth place</label>
                <input
                  id="birthPlace"
                  value={form.astroDetails.birthPlace}
                  onChange={(e) => handleNestedChange('astroDetails', 'birthPlace', e.target.value)}
                />
              </div>
            </div>
          )}
        </section>

        {/* ---- Lifestyle & Interests ---- */}
        <section className="form-section">
          <h2>Lifestyle &amp; Interests</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="diet">Diet</label>
              <select
                id="diet"
                value={form.lifestyle.diet}
                onChange={(e) => handleNestedChange('lifestyle', 'diet', e.target.value)}
              >
                <option value="">Select</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non_vegetarian">Non-vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="activityLevel">Activity level</label>
              <select
                id="activityLevel"
                value={form.lifestyle.activityLevel}
                onChange={(e) => handleNestedChange('lifestyle', 'activityLevel', e.target.value)}
              >
                <option value="">Select</option>
                <option value="sedentary">Sedentary</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="smoking">Smoking</label>
              <select
                id="smoking"
                value={form.lifestyle.smoking}
                onChange={(e) => handleNestedChange('lifestyle', 'smoking', e.target.value)}
              >
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="drinking">Drinking</label>
              <select
                id="drinking"
                value={form.lifestyle.drinking}
                onChange={(e) => handleNestedChange('lifestyle', 'drinking', e.target.value)}
              >
                <option value="">Select</option>
                <option value="no">No</option>
                <option value="occasionally">Occasionally</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="interests">Interests</label>
            <input
              id="interests"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              placeholder="Art Exhibitions, Culinary Arts, Road Trips"
            />
            <span className="hint">Separate with commas</span>
          </div>
        </section>

        {/* ---- Privacy ---- */}
        <section className="form-section">
          <h2>Privacy</h2>
          <div className="form-row">
            <div className="field-group">
              <label htmlFor="showContactTo">Show contact details to</label>
              <select
                id="showContactTo"
                value={form.privacy.showContactTo}
                onChange={(e) => handleNestedChange('privacy', 'showContactTo', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="matched_only">Matched only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="showPhotosTo">Show photos to</label>
              <select
                id="showPhotosTo"
                value={form.privacy.showPhotosTo}
                onChange={(e) => handleNestedChange('privacy', 'showPhotosTo', e.target.value)}
              >
                <option value="everyone">Everyone</option>
                <option value="matched_only">Matched only</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
          </div>
        </section>

        <div className="profile-form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isExistingProfile ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}