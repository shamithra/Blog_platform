const API_BASE = '/api';

// Helper for fetch requests
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred while communicating with the server.');
  }

  return data;
}

export const api = {
  // Auth API
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => fetchAPI('/auth/me'),

  // Categories API
  getCategories: () => fetchAPI('/categories'),

  // Posts API
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/posts${query ? `?${query}` : ''}`);
  },
  getPostById: (id) => fetchAPI(`/posts/${id}`),
  createPost: (postData) => fetchAPI('/posts', { method: 'POST', body: JSON.stringify(postData) }),
  updatePost: (id, postData) => fetchAPI(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(postData) }),
  deletePost: (id) => fetchAPI(`/posts/${id}`, { method: 'DELETE' }),
  toggleLikePost: (id) => fetchAPI(`/posts/${id}/like`, { method: 'POST' }),

  // Comments API
  getComments: (postId) => fetchAPI(`/posts/${postId}/comments`),
  addComment: (postId, commentData) => fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(commentData) }),
  deleteComment: (commentId) => fetchAPI(`/comments/${commentId}`, { method: 'DELETE' }),
  toggleLikeComment: (commentId) => fetchAPI(`/comments/${commentId}/like`, { method: 'POST' })
};
