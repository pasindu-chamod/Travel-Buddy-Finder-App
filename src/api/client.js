// Travel Buddy Finder — Frontend API Client
// All fetch() calls to the Express backend go through here.
// Token is stored in localStorage as 'tb_token'.

const BASE_URL = '/api'; // Vite proxy forwards /api → http://localhost:5000/api

// ─── TOKEN HELPERS ────────────────────────────────────────
export const getToken = () => localStorage.getItem('tb_token');
export const setToken = (t) => localStorage.setItem('tb_token', t);
export const clearToken = () => localStorage.removeItem('tb_token');

// ─── BASE FETCH WRAPPER ───────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

// ─── AUTH ──────────────────────────────────────────────────
export const api = {
  // --- Auth ---
  async login(emailOrUsername, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password })
    });
    setToken(data.token);
    return data.user;
  },

  async register(userData) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setToken(data.token);
    return data.user;
  },

  async getMe() {
    const data = await request('/auth/me');
    return data.user;
  },

  logout() {
    clearToken();
  },

  // --- Trips ---
  async getTrips(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/trips${query ? '?' + query : ''}`);
  },

  async getPendingTrips() {
    return request('/trips/pending');
  },

  async getAllTrips() {
    return request('/trips/all');
  },

  async getMyTrips() {
    return request('/trips/mine');
  },

  async createTrip(tripData) {
    return request('/trips', { method: 'POST', body: JSON.stringify(tripData) });
  },

  async approveTrip(id) {
    return request(`/trips/${id}/approve`, { method: 'PATCH' });
  },

  async rejectTrip(id) {
    return request(`/trips/${id}/reject`, { method: 'PATCH' });
  },

  async deleteTrip(id) {
    return request(`/trips/${id}`, { method: 'DELETE' });
  },

  // --- Users ---
  async getAllUsers() {
    return request('/users');
  },

  async getTravelers() {
    return request('/users/travelers');
  },

  async updateUser(id, fields) {
    return request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
  },

  async toggleUserStatus(id) {
    return request(`/users/${id}/status`, { method: 'PATCH' });
  },

  async toggleUserVerified(id) {
    return request(`/users/${id}/verify`, { method: 'PATCH' });
  },

  async deleteUser(id) {
    return request(`/users/${id}`, { method: 'DELETE' });
  },

  // --- Expenses ---
  async getExpenses() {
    return request('/expenses');
  },

  async addExpense(expense) {
    return request('/expenses', { method: 'POST', body: JSON.stringify(expense) });
  },

  async deleteExpense(id) {
    return request(`/expenses/${id}`, { method: 'DELETE' });
  },

  // --- Posts ---
  async getPosts() {
    return request('/posts');
  },

  async createPost(post) {
    return request('/posts', { method: 'POST', body: JSON.stringify(post) });
  },

  async likePost(id) {
    return request(`/posts/${id}/like`, { method: 'PATCH' });
  },

  async deletePost(id) {
    return request(`/posts/${id}`, { method: 'DELETE' });
  },

  // --- Itinerary ---
  async getItinerary() {
    return request('/itinerary');
  },

  async addItineraryItem(item) {
    return request('/itinerary', { method: 'POST', body: JSON.stringify(item) });
  },

  async upvoteItineraryItem(id) {
    return request(`/itinerary/${id}/upvote`, { method: 'PATCH' });
  },

  async deleteItineraryItem(id) {
    return request(`/itinerary/${id}`, { method: 'DELETE' });
  },

  // --- SOS ---
  async getSosAlerts() {
    return request('/sos');
  },

  async triggerSos(data) {
    return request('/sos', { method: 'POST', body: JSON.stringify(data) });
  },

  async resolveSos(id) {
    return request(`/sos/${id}/resolve`, { method: 'PATCH' });
  },

  // --- Chat ---
  async getChatMessages() {
    return request('/chat');
  },

  async getChatThreads() {
    return request('/chat/threads');
  },

  async getUserThread(userId) {
    return request(`/chat/${userId}`);
  },

  async sendChatMessage(text, targetUserId = null) {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ text, targetUserId })
    });
  }
};
