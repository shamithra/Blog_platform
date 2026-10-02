import React, { useState } from 'react';
import { Clock, Eye, MessageSquare, Heart, Tag } from 'lucide-react';
import { api } from '../services/api';

export const PostCard = ({ post, onSelectPost, onOpenAuth, currentUser, showToast }) => {
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      showToast('Please log in to like articles!', 'info');
      onOpenAuth('login');
      return;
    }

    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic UI update
    const previousLikes = likes;
    const previousHasLiked = hasLiked;
    setLikes(hasLiked ? likes - 1 : likes + 1);
    setHasLiked(!hasLiked);

    try {
      const res = await api.toggleLikePost(post._id);
      setLikes(res.likeCount);
      setHasLiked(res.hasLiked);
    } catch (err) {
      // Revert if server fails
      setLikes(previousLikes);
      setHasLiked(previousHasLiked);
      showToast('Failed to update like status', 'error');
    } finally {
      setLikeLoading(false);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article 
      onClick={() => onSelectPost(post)}
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease, box-shadow 0.25s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
        e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cover Image Header */}
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
        <img
          src={post.coverImage}
          alt={post.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
        />
        {/* Category Pill Badge */}
        {post.category && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '0.3rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(11, 15, 25, 0.75)',
            backdropFilter: 'blur(12px)',
            color: post.category.color || 'var(--accent-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
            border: `1px solid ${post.category.color || 'var(--accent-primary)'}40`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Tag size={12} />
            <span>{post.category.name}</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Author Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <img
              src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={post.author?.username}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {post.author?.username || 'Anonymous'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
          </div>

          {/* Title & Excerpt */}
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            lineHeight: 1.35,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {post.title}
          </h2>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {post.excerpt}
          </p>
        </div>

        {/* Card Footer Metrics & Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} />
              {post.readTime || 3} min read
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} />
              {post.views || 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <MessageSquare size={14} />
              {post.commentCount || 0}
            </span>
          </div>

          <button
            onClick={handleLike}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: hasLiked ? '#ec4899' : 'var(--text-muted)',
              fontWeight: hasLiked ? 700 : 500,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: hasLiked ? 'rgba(236, 72, 153, 0.12)' : 'transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={15} fill={hasLiked ? '#ec4899' : 'none'} color={hasLiked ? '#ec4899' : 'currentColor'} />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
