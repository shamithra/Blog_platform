import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, CornerDownRight, Trash2, Heart, ShieldCheck, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CommentSection = ({ postId, postAuthorId, showToast, onOpenAuth }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await api.getComments(postId);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (parentCommentId = null) => {
    if (!user) {
      showToast('Please log in to leave a comment!', 'info');
      onOpenAuth('login');
      return;
    }

    const textToSubmit = parentCommentId ? replyText : newCommentText;
    if (!textToSubmit.trim()) return;

    setSubmitting(true);
    try {
      await api.addComment(postId, {
        content: textToSubmit.trim(),
        parentCommentId
      });

      // Confetti burst on successful comment
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 }
      });

      if (parentCommentId) {
        setReplyText('');
        setReplyingToId(null);
      } else {
        setNewCommentText('');
      }

      showToast('Comment published!', 'success');
      await fetchComments();
    } catch (err) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.deleteComment(commentId);
      showToast('Comment deleted', 'success');
      await fetchComments();
    } catch (err) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      showToast('Please log in to like comments!', 'info');
      onOpenAuth('login');
      return;
    }

    try {
      await api.toggleLikeComment(commentId);
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const renderSingleComment = (comment, isReply = false) => {
    const isCommentAuthor = user && user.id === comment.author?._id;
    const isPostAuthor = user && user.id === postAuthorId;
    const isAdmin = user && user.role === 'admin';
    const canDelete = isCommentAuthor || isPostAuthor || isAdmin;

    const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <div 
        key={comment._id} 
        style={{
          display: 'flex',
          gap: '0.85rem',
          padding: isReply ? '0.85rem 0 0.85rem 1.25rem' : '1.25rem 0',
          borderBottom: isReply ? 'none' : '1px solid var(--border-color)',
          marginLeft: isReply ? '1.5rem' : '0',
          borderLeft: isReply ? '2px solid var(--border-color)' : 'none'
        }}
      >
        <img
          src={comment.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt={comment.author?.username}
          style={{
            width: isReply ? '32px' : '40px',
            height: isReply ? '32px' : '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {comment.author?.username || 'Anonymous'}
              </span>

              {/* Author Badges */}
              {comment.author?._id === postAuthorId && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}>
                  <ShieldCheck size={10} /> Author
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {formattedDate}</span>
            </div>

            {canDelete && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                title="Delete comment"
                style={{ color: '#f87171', opacity: 0.75, transition: 'opacity 0.2s ease' }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>

          <p style={{
            fontSize: '0.92rem',
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            marginBottom: '0.5rem',
            whiteSpace: 'pre-line'
          }}>
            {comment.content}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <button
              onClick={() => handleLikeComment(comment._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                color: comment.hasLiked ? '#ec4899' : 'var(--text-muted)',
                fontWeight: comment.hasLiked ? 700 : 500
              }}
            >
              <Heart size={14} fill={comment.hasLiked ? '#ec4899' : 'none'} color={comment.hasLiked ? '#ec4899' : 'currentColor'} />
              <span>{comment.likeCount || 0}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyingToId(replyingToId === comment._id ? null : comment._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600
                }}
              >
                <CornerDownRight size={14} />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Inline Reply Form */}
          {replyingToId === comment._id && (
            <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder={`Reply to @${comment.author?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="input-field"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePostComment(comment._id);
                }}
              />
              <button
                onClick={() => handlePostComment(comment._id)}
                disabled={submitting || !replyText.trim()}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem' }}
              >
                <Send size={14} />
              </button>
            </div>
          )}

          {/* Threaded Child Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              {comment.replies.map(reply => renderSingleComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={22} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
          Discussion ({comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)})
        </h3>
      </div>

      {/* Main Comment Input Box */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '2rem'
      }}>
        {user ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <img
                src={user.avatar}
                alt={user.username}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Comment as <strong style={{ color: 'var(--accent-primary)' }}>{user.username}</strong>
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="What are your thoughts on this article? Share your experience..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical', minHeight: '80px', marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {newCommentText.length} / 1000 characters
              </span>
              <button
                onClick={() => handlePostComment()}
                disabled={submitting || !newCommentText.trim()}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
              >
                <Send size={15} />
                <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.92rem' }}>
              Join the conversation! Log in or create an account to leave a comment.
            </p>
            <button
              onClick={() => onOpenAuth('login')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              Log In to Comment
            </button>
          </div>
        )}
      </div>

      {/* Comment Feed List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div>
          {comments.map(comment => renderSingleComment(comment))}
        </div>
      )}
    </section>
  );
};
