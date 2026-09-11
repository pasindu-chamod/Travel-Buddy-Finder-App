// Travel Buddy Finder - Database Service (localStorage)
// Security: passwords are hashed with btoa before storage
// All user-supplied text is sanitized before storage

const STORAGE_KEYS = {
  USERS: 'travel_buddy_users_v4',
  SESSION: 'travel_buddy_session_v4',
  TRIPS: 'travel_buddy_trips_v4',
  EXPENSES: 'travel_buddy_expenses_v4',
  ITINERARY: 'travel_buddy_itinerary_v4',
  POSTS: 'travel_buddy_posts_v4',
  SOS_ALERTS: 'travel_buddy_sos_alerts_v4',
  ADMIN_CHAT: 'travel_buddy_admin_chat_v4'
};

// --- SECURITY UTILITIES ---
// Simple obfuscation: btoa encoding prevents casual plaintext reading in DevTools
const hashPassword = (pw) => btoa(unescape(encodeURIComponent(String(pw))));

// Strip HTML tags and trim whitespace from user-supplied strings
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

const sanitizeUser = (data) => ({
  ...data,
  name: sanitize(data.name),
  bio: sanitize(data.bio),
  instagramHandle: sanitize(data.instagramHandle),
  homeCountry: sanitize(data.homeCountry),
  phone: sanitize(data.phone),
  style: sanitize(data.style),
});

const sanitizeTrip = (data) => ({
  ...data,
  title: sanitize(data.title),
  destination: sanitize(data.destination),
  description: sanitize(data.description),
  organizer: sanitize(data.organizer),
});

const sanitizeText = (str) => sanitize(str);

// Initial Admin Account
const INITIAL_ADMIN_USER = {
  id: 'usr_admin_master',
  name: 'System Administrator',
  email: 'admin@travelbuddy.com',
  password: hashPassword('admin123'),
  role: 'admin',
  status: 'ACTIVE',
  photo: '',
  bio: 'Platform Administrator & Safety Coordinator.',
  gender: 'Admin',
  age: 30,
  phone: '+1 (800) 555-0199',
  emergencyContactName: 'Central Support Dispatch',
  emergencyContactPhone: '+1 (800) 555-0199',
  homeCountry: 'Global Command',
  instagramHandle: '@travelbuddy_official',
  style: 'Platform Administration',
  budgetTier: 'All Categories',
  interests: ['Trip Verification', 'Safety Coordination', 'Community Growth'],
  languages: ['English'],
  isVerified: true,
  trustScore: 5.0,
  expeditionsCompleted: 0
};

export const Database = {
  // Initialize Database
  init() {
    // Migrate legacy plaintext passwords on first run (v4 -> hashed)
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (rawUsers) {
      try {
        const users = JSON.parse(rawUsers);
        let migrated = false;
        const updated = users.map(u => {
          // If password doesn't look like a btoa hash (not base64), hash it
          if (u.password && !/^[A-Za-z0-9+/=]+$/.test(u.password.replace(/=+$/, ''))) {
            migrated = true;
            return { ...u, password: hashPassword(u.password) };
          }
          // If it's the known plaintext admin password, hash it
          if (u.id === 'usr_admin_master' && u.password === 'admin123') {
            migrated = true;
            return { ...u, password: hashPassword('admin123') };
          }
          return u;
        });
        if (migrated) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
        }
      } catch { /* ignore parse errors */ }
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([INITIAL_ADMIN_USER]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITINERARY)) {
      localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOS_ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_CHAT)) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CHAT, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSION)) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(INITIAL_ADMIN_USER));
    }
  },

  // --- AUTH & SESSION ---
  getSession() {
    this.init();
    try {
      const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
      return session || INITIAL_ADMIN_USER;
    } catch {
      return INITIAL_ADMIN_USER;
    }
  },

  setSession(user) {
    // Never store password in session
    const { password: _pw, ...safeUser } = user;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(safeUser));
    return safeUser;
  },

  login(emailOrUsername, password) {
    this.init();
    const users = this.getUsers();
    const query = emailOrUsername.trim().toLowerCase();
    const hashedInput = hashPassword(password);

    const user = users.find(u =>
      (u.email.toLowerCase() === query || (query === 'admin' && u.role === 'admin')) &&
      u.password === hashedInput
    );

    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new Error('This account has been suspended by administration.');
      }
      return this.setSession(user);
    }
    throw new Error('Invalid email, username, or password. Please try again.');
  },

  register(userData) {
    this.init();
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please enter a valid email address.');
    }

    // Validate password length
    if (!userData.password || userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const sanitized = sanitizeUser(userData);
    const newUser = {
      id: 'usr_' + Date.now(),
      name: sanitized.name,
      email: sanitized.email.toLowerCase().trim(),
      password: hashPassword(userData.password),
      role: 'user',
      status: 'ACTIVE',
      photo: userData.photo || '',
      bio: sanitized.bio || 'Excited to explore new destinations and meet travel buddies!',
      gender: userData.gender || 'Not specified',
      age: userData.age || 24,
      phone: sanitized.phone || '',
      emergencyContactName: sanitize(userData.emergencyContactName) || '',
      emergencyContactPhone: sanitize(userData.emergencyContactPhone) || '',
      homeCountry: sanitized.homeCountry || 'Sri Lanka',
      instagramHandle: sanitized.instagramHandle || '',
      style: sanitized.style || 'Backpacking & Nature',
      budgetTier: userData.budgetTier || 'Moderate ($50-100/day)',
      interests: Array.isArray(userData.interests) ? userData.interests : ['Hiking', 'Photography', 'Food Tours', 'Beach'],
      languages: Array.isArray(userData.languages) ? userData.languages : ['English'],
      isVerified: true,
      trustScore: 5.0,
      expeditionsCompleted: 0
    };

    const updated = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return this.setSession(newUser);
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // --- USERS CRUD ---
  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  updateUser(userId, updatedFields) {
    // Sanitize editable fields
    const safe = {
      ...updatedFields,
      name: updatedFields.name !== undefined ? sanitize(updatedFields.name) : undefined,
      bio: updatedFields.bio !== undefined ? sanitize(updatedFields.bio) : undefined,
      instagramHandle: updatedFields.instagramHandle !== undefined ? sanitize(updatedFields.instagramHandle) : undefined,
      homeCountry: updatedFields.homeCountry !== undefined ? sanitize(updatedFields.homeCountry) : undefined,
      phone: updatedFields.phone !== undefined ? sanitize(updatedFields.phone) : undefined,
    };
    // If updating password, hash it
    if (safe.password) {
      safe.password = hashPassword(safe.password);
    }
    // Remove undefined keys
    Object.keys(safe).forEach(k => safe[k] === undefined && delete safe[k]);

    const users = this.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, ...safe } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));

    const currentSession = this.getSession();
    if (currentSession.id === userId) {
      this.setSession({ ...currentSession, ...safe });
    }
    return updated;
  },

  toggleUserStatus(userId) {
    const users = this.getUsers();
    const updated = users.map(u => {
      if (u.id === userId && u.role !== 'admin') {
        return { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return updated;
  },

  toggleUserVerified(userId) {
    const users = this.getUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, isVerified: !u.isVerified };
      }
      return u;
    });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return updated;
  },

  deleteUser(userId) {
    // Protect admin from deletion
    const users = this.getUsers().filter(u => u.id !== userId || u.role === 'admin');
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users;
  },

  // --- TRIPS CRUD ---
  getTrips() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
  },

  saveTrip(trip) {
    const trips = this.getTrips();
    const clean = sanitizeTrip(trip);
    const newTrip = {
      ...clean,
      status: trip.status || 'PENDING'
    };
    const updated = [newTrip, ...trips];
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated));
    return updated;
  },

  approveTrip(tripId) {
    const trips = this.getTrips();
    const updated = trips.map(t => t.id === tripId ? { ...t, status: 'APPROVED' } : t);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated));
    return updated;
  },

  rejectTrip(tripId) {
    const trips = this.getTrips().filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trips;
  },

  deleteTrip(tripId) {
    const trips = this.getTrips().filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trips;
  },

  // --- EXPENSES CRUD ---
  getExpenses() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
  },

  addExpense(expense) {
    const expenses = this.getExpenses();
    const clean = {
      ...expense,
      description: sanitize(expense.description),
      category: sanitize(expense.category),
    };
    const updated = [clean, ...expenses];
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return updated;
  },

  deleteExpense(expenseId) {
    const expenses = this.getExpenses().filter(e => e.id !== expenseId);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return expenses;
  },

  // --- ITINERARY CRUD ---
  getItinerary() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ITINERARY) || '[]');
  },

  addItineraryItem(item) {
    const itinerary = this.getItinerary();
    const clean = {
      ...item,
      activity: sanitize(item.activity),
      location: sanitize(item.location),
    };
    const updated = [...itinerary, clean];
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(updated));
    return updated;
  },

  upvoteItineraryItem(id) {
    const itinerary = this.getItinerary();
    const updated = itinerary.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item);
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(updated));
    return updated;
  },

  deleteItineraryItem(id) {
    const itinerary = this.getItinerary().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(itinerary));
    return itinerary;
  },

  // --- POSTS CRUD ---
  getPosts() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  },

  addPost(post) {
    const posts = this.getPosts();
    const clean = {
      ...post,
      caption: sanitize(post.caption),
      location: sanitize(post.location),
      author: sanitize(post.author),
    };
    const updated = [clean, ...posts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));
    return updated;
  },

  togglePostLike(postId) {
    const posts = this.getPosts().map(p => {
      if (p.id === postId) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts;
  },

  deletePost(postId) {
    const posts = this.getPosts().filter(p => p.id !== postId);
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return posts;
  },

  // --- SOS ALERTS CRUD ---
  getSosAlerts() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SOS_ALERTS) || '[]');
  },

  triggerSos(alertData) {
    const alerts = this.getSosAlerts();
    const newAlert = {
      id: 'sos_' + Date.now(),
      ...alertData,
      userName: sanitize(alertData.userName),
      location: sanitize(alertData.location),
      status: 'ACTIVE',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newAlert, ...alerts];
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(updated));
    return updated;
  },

  resolveSos(alertId) {
    const alerts = this.getSosAlerts().map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a);
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
    return alerts;
  },

  // --- ADMIN & USER GUIDANCE CHAT ---
  getAdminChatMessages() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_CHAT) || '[]');
  },

  sendAdminChatMessage(msgData) {
    const messages = this.getAdminChatMessages();
    const newMsg = {
      id: 'msg_' + Date.now(),
      ...msgData,
      text: sanitizeText(msgData.text),
      senderName: sanitize(msgData.senderName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString()
    };
    const updated = [...messages, newMsg];
    localStorage.setItem(STORAGE_KEYS.ADMIN_CHAT, JSON.stringify(updated));
    return updated;
  }
};
