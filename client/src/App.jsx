import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { PostDetail } from './components/PostDetail';
import { PostEditor } from './components/PostEditor';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { Sparkles, Layers, TrendingUp, Filter, RefreshCw, PenSquare } from 'lucide-react';

function BlogApp() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedSort, searchQuery]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (selectedSort === 'popular') {
        params.sort = 'popular';
      } else if (selectedSort === 'likes') {
        params.sort = 'likes';
      }

      const data = await api.getPosts(params);
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      showToast('Failed to connect to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAuth = (tab = 'login') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const handleOpenCreatePost = () => {
    if (!user) {
      showToast('Please log in to write an article!', 'info');
      handleOpenAuth('login');
      return;
    }
    setEditingPost(null);
    setEditorModalOpen(true);
  };

  const handleOpenEditPost = (postToEdit) => {
    setEditingPost(postToEdit);
    setEditorModalOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSort('newest');
    setSearchQuery('');
    setSelectedPost(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAuth={handleOpenAuth}
        onOpenCreatePost={handleOpenCreatePost}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* Main View Container */}
      <main className="app-container" style={{ flex: 1, padding: '2rem 1.5rem 0' }}>
        {selectedPost ? (
          /* Single Article Detail View */
          <PostDetail
            postId={selectedPost._id}
            onBack={() => setSelectedPost(null)}
            onOpenEditPost={(p) => handleOpenEditPost(p)}
            currentUser={user}
            showToast={showToast}
            onOpenAuth={handleOpenAuth}
          />
        ) : (
          /* Main Feed & Catalog View */
          <>
            {/* Hero Section (only when no search filter active) */}
            {!searchQuery && selectedCategory === 'all' && (
              <section style={{
                textAlign: 'center',
                padding: '3rem 1rem 4rem',
                position: 'relative'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--badge-bg)',
                  border: '1px solid var(--accent-primary)30',
                  color: 'var(--badge-text)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem'
                }}>
                  <Sparkles size={14} />
                  <span>Welcome to Nimbus Log</span>
                </div>
                <h1 style={{
                  fontSize: '3.2rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.15
                }}>
                  Ideas, Tech Systems & <span className="gradient-text">Design Thinking</span>
                </h1>
                <p style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '680px',
                  margin: '0 auto 2rem',
                  lineHeight: 1.6
                }}>
                  Explore articles written by engineering leaders and designers. Engage in insightful discussions, share tutorials, and master full-stack software development.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={handleOpenCreatePost} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                    <PenSquare size={18} />
                    <span>Start Writing</span>
                  </button>
                  <button 
                    onClick={() => {
                      const feedElem = document.getElementById('articles-feed');
                      if (feedElem) feedElem.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    className="btn btn-secondary" 
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <span>Browse Articles</span>
                  </button>
                </div>
              </section>
            )}

            {/* Category Pills & Sorting Bar */}
            <div id="articles-feed" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                <button
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: selectedCategory === 'all' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                    color: selectedCategory === 'all' ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: selectedCategory === cat.slug ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      color: selectedCategory === cat.slug ? (cat.color || 'var(--accent-primary)') : 'var(--text-secondary)',
                      border: selectedCategory === cat.slug ? `1px solid ${cat.color || 'var(--accent-primary)'}` : '1px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {cat.postCount || 0}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sorting Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Filter size={14} /> Sort:
                </span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="input-field"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto', cursor: 'pointer' }}
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Viewed</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Filter Indicator / Search Active Banner */}
            {(searchQuery || selectedCategory !== 'all') && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '2rem'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Showing results {searchQuery && <span>for "<strong>{searchQuery}</strong>"</span>} {selectedCategory !== 'all' && <span>in category <strong>{selectedCategory}</strong></span>}
                </span>
                <button
                  onClick={handleResetFilters}
                  style={{
                    color: 'var(--accent-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <RefreshCw size={14} /> Clear Filters
                </button>
              </div>
            )}

            {/* Article Grid / Feed */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1rem' }}>Loading blog articles...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)'
              }}>
                <Layers size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No articles found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
                  No published articles match your current search or category filter.
                </p>
                <button onClick={handleOpenCreatePost} className="btn btn-primary">
                  Be the first to write an article
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.75rem'
              }}>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onSelectPost={(p) => setSelectedPost(p)}
                    onOpenAuth={handleOpenAuth}
                    currentUser={user}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authTab}
        onClose={() => setAuthModalOpen(false)}
        showToast={showToast}
      />

      {/* Article Editor Modal */}
      <PostEditor
        isOpen={editorModalOpen}
        editPost={editingPost}
        categories={categories}
        onClose={() => setEditorModalOpen(false)}
        showToast={showToast}
        onSuccess={fetchPosts}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BlogApp />
    </AuthProvider>
  );
}
