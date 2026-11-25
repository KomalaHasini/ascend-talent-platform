import { useState, useEffect } from 'react';
import { CATEGORIES } from '../data';

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 40;

// Pop-up form for posting a talent (photo or video)
export default function PostModal({ onClose, onSubmit }) {
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [media, setMedia] = useState(null); // { file, previewUrl, type: 'image' | 'video' }
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // free the preview memory when the file changes or the pop-up closes
  useEffect(() => {
    return () => {
      if (media) URL.revokeObjectURL(media.previewUrl);
    };
  }, [media]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const maxMB = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
    if (file.size > maxMB * 1024 * 1024) {
      setError(`This file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Pick one under ${maxMB}MB.`);
      e.target.value = '';
      setMedia(null);
      return;
    }

    setError('');
    setMedia({ file, previewUrl: URL.createObjectURL(file), type: isVideo ? 'video' : 'image' });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !desc.trim()) {
      return setError('Fill in the talent name and description');
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        category,
        title: title.trim(),
        desc: desc.trim(),
        file: media ? media.file : null,
        mediaType: media ? media.type : null,
      });
    } catch (err) {
      setError(err.message || 'Could not post. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Post a Talent</h3>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Talent name e.g. Classical Guitar"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Describe it briefly..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <input type="file" accept="image/*,video/*" onChange={handleFile} />
        {media && media.type === 'image' && (
          <img id="talent-image-preview" src={media.previewUrl} alt="preview" />
        )}
        {media && media.type === 'video' && (
          <video id="talent-video-preview" src={media.previewUrl} controls />
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button className="btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
