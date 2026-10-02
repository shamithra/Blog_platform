import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { CommentSection } from './CommentSection';
import { ArrowLeft, Clock, Eye, Heart, Edit3, Trash2, Tag, Share2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PostDetail = ({ postId, onBack, onOpenEditPost, currentUser, showToast, onOpenAuth }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getPostById(postId);
      setPost(data);
      setLikes(data.likeCount || 0);
      setHasLiked(data.hasLiked || false);
    } catch (err) {
      showToast('Failed to load post details', 'error');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      showToast('Please log in to like this article!', 'info');
      onOpenAuth('login');
      return;
    }

    const previousLikes = likes;
    const previousHasLiked = hasLiked;
    setLikes(hasLiked ? likes - 1 : likes + 1);
    setHasLiked(!hasLiked);

    try {
      const res = await api.toggleLikePost(post._id);
      setLikes(res.likeCount);
      setHasLiked(res.hasLiked);
      if (res.hasLiked) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      }
    } catch (err) {
      setLikes(previousLikes);
      setHasLiked(previousHasLiked);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return;
    try {
      await api.deletePost(post._id);
      showToast('Post deleted successfully', 'success');
      onBack();
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <p>Loading article content...</p>
      </div>
    );
  }

  if (!post) return null;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isAuthor = currentUser && currentUser.id === post.author?._id;
  const isAdmin = currentUser && currentUser.role === 'admin';
  const canModify = isAuthor || isAdmin;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '2rem 0 5rem' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Articles</span>
      </button>

      {/* Article Header */}
      <header style={{ marginBottom: '2rem' }}>
        {/* Category Pill */}
        {post.category && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--badge-bg)',
            color: post.category.color || 'var(--accent-primary)',
            fontWeight: 700,
            fontSize: '0.8rem',
            marginBottom: '1rem',
            border: `1px solid ${post.category.color || 'var(--accent-primary)'}35`
          }}>
            <Tag size={13} />
            <span>{post.category.name}</span>
          </div>
        )}

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: '1.25rem',
          letterSpacing: '-0.03em'
        }}>
          {post.title}
        </h1>

        {/* Metadata Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* Author Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={post.author?.username}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {post.author?.username || 'Anonymous'}
                </span>
                {post.author?.role === 'admin' && (
                  <ShieldCheck size={14} color="var(--accent-primary)" />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{formattedDate}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {post.readTime || 3} min read
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Eye size={13} /> {post.views} views
                </span>
              </div>
            </div>
          </div>

          {/* Controls / Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={handleLike}
              className="btn btn-secondary"
              style={{
                color: hasLiked ? '#ec4899' : 'var(--text-primary)',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem'
              }}
            >
              <Heart size={16} fill={hasLiked ? '#ec4899' : 'none'} color={hasLiked ? '#ec4899' : 'currentColor'} />
              <span>{likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
              title="Share article"
            >
              <Share2 size={16} />
            </button>

            {canModify && (
              <>
                <button
                  onClick={() => onOpenEditPost(post)}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="btn btn-danger"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Cover Image */}
      <div style={{
        width: '100%',
        maxHeight: '420px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '2.5rem',
        border: '1px solid var(--border-color)'
      }}>
        <img
          src={post.coverImage}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Formatted Article Body */}
      <div className="markdown-body">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Article Tags */}
      {post.tags && post.tags.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          {post.tags.map((tag, idx) => (
            <span key={idx} style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <img
          src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={post.author?.username}
          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Written by {post.author?.username || 'Author'}
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {post.author?.bio || 'Full stack software developer and technology writer sharing insights on modern engineering.'}
          </p>
        </div>
      </div>

      {/* Interactive Comments Section */}
      <CommentSection
        postId={post._id}
        postAuthorId={post.author?._id}
        showToast={showToast}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
