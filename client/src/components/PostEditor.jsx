import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { X, Image, Eye, Edit, Sparkles, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=900&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80'
];

export const PostEditor = ({ isOpen, editPost = null, categories = [], onClose, showToast, onSuccess }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(editPost ? editPost.title : '');
  const [category, setCategory] = useState(editPost ? (editPost.category?._id || editPost.category) : (categories[0]?._id || ''));
  const [coverImage, setCoverImage] = useState(editPost ? editPost.coverImage : PRESET_COVERS[0]);
  const [tags, setTags] = useState(editPost ? (Array.isArray(editPost.tags) ? editPost.tags.join(', ') : editPost.tags) : '');
  const [content, setContent] = useState(editPost ? editPost.content : '');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Please provide a title and content for your article.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const postPayload = {
        title: title.trim(),
        content: content.trim(),
        category,
        coverImage,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editPost) {
        await api.updatePost(editPost._id, postPayload);
        showToast('Article updated successfully!', 'success');
      } else {
        await api.createPost(postPayload);
        showToast('Article published successfully!', 'success');
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      }

      onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to save post', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden'
      }}>
        {/* Editor Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {editPost ? 'Edit Blog Article' : 'Publish New Article'}
            </h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Editor Body Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', padding: '1.75rem', gap: '1.25rem' }}>
          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Modern React Design Patterns & State Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              style={{ fontSize: '1.1rem', fontWeight: 600, padding: '0.75rem 1rem' }}
            />
          </div>

          {/* Category & Tags Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="React, Frontend, WebDev"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Cover Image Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Cover Image URL or Presets
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="input-field"
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {PRESET_COVERS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="Preset Cover"
                  onClick={() => setCoverImage(url)}
                  style={{
                    width: '64px',
                    height: '42px',
                    borderRadius: '6px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: coverImage === url ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    opacity: coverImage === url ? 1 : 0.7
                  }}
                />
              ))}
            </div>
          </div>

          {/* Editor / Preview Tabs */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: activeTab === 'edit' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'edit' ? '2px solid var(--accent-primary)' : 'none'
                  }}
                >
                  <Edit size={14} />
                  <span>Write Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: activeTab === 'preview' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'preview' ? '2px solid var(--accent-primary)' : 'none'
                  }}
                >
                  <Eye size={14} />
                  <span>Live Preview</span>
                </button>
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supports Github Markdown formatting
              </span>
            </div>

            {activeTab === 'edit' ? (
              <textarea
                rows={12}
                required
                placeholder="## Introduction&#10;&#10;Write your article content here in Markdown...&#10;&#10;```javascript&#10;console.log('Hello World');&#10;```"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: 1.6, resize: 'vertical' }}
              />
            ) : (
              <div 
                className="markdown-body" 
                style={{
                  minHeight: '280px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {content.trim() ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Nothing to preview yet. Switch to the Write tab to type content.</p>
                )}
              </div>
            )}
          </div>

          {/* Action Submit Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              <Send size={16} />
              <span>{submitting ? 'Saving...' : (editPost ? 'Update Post' : 'Publish Post')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
