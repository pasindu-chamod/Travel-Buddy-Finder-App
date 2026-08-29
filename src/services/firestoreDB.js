import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from './firebaseConfig';

// Seed data for initial database population
const SEED_USERS = [
  {
    id: 'usr_001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Backpacker & adventure photographer. Exploring Southeast Asia! 🌏',
    gender: 'Female',
    age: 23,
    travelStyle: 'Adventure',
    budgetTier: 'Budget',
    languages: ['English', 'Spanish', 'French'],
    isVerified: true,
    trustScore: 4.9,
    tripsCompleted: 15
  },
  {
    id: 'usr_002',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
    bio: 'Solo hiker & coffee enthusiast. Looking for travel buddies!',
    gender: 'Female',
    age: 24,
    travelStyle: 'Adventure',
    budgetTier: 'Budget',
    languages: ['English', 'Russian'],
    isVerified: true,
    trustScore: 4.8,
    tripsCompleted: 14
  },
  {
    id: 'usr_003',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    bio: 'Landscape photographer. Excited to conquer alpine photography spots.',
    gender: 'Male',
    age: 26,
    travelStyle: 'Photography',
    budgetTier: 'Moderate',
    languages: ['English', 'German'],
    isVerified: true,
    trustScore: 4.7,
    tripsCompleted: 8
  }
];

const SEED_TRIPS = [
  {
    id: 'trip_001',
    title: 'Bali Waterfalls & Beach Hopping',
    destination: 'Bali, Indonesia',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    budget: 650,
    maxMembers: 4,
    currentMemberIds: ['usr_001', 'usr_002'],
    isWomenOnly: true,
    hostId: 'usr_001',
    coverUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    status: 'Open'
  },
  {
    id: 'trip_002',
    title: 'Swiss Alps Trail Trekking',
    destination: 'Interlaken, Switzerland',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    budget: 1200,
    maxMembers: 5,
    currentMemberIds: ['usr_003'],
    isWomenOnly: false,
    hostId: 'usr_003',
    coverUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    status: 'Open'
  },
  {
    id: 'trip_003',
    title: 'Kyoto Cherry Blossom Tour',
    destination: 'Kyoto, Japan',
    startDate: '2026-11-12',
    endDate: '2026-11-20',
    budget: 950,
    maxMembers: 4,
    currentMemberIds: [],
    isWomenOnly: false,
    hostId: 'usr_001',
    coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    status: 'Open'
  }
];

const SEED_EXPENSES = [
  { id: 'exp_001', title: 'Villa Deposit (3 Nights)', amount: 160, paidBy: 'Sarah Jenkins', paidById: 'usr_001', category: 'Stay', tripId: 'trip_001' },
  { id: 'exp_002', title: 'Scooter Rental (Bali)', amount: 45, paidBy: 'Elena Rostova', paidById: 'usr_002', category: 'Transport', tripId: 'trip_001' },
  { id: 'exp_003', title: 'Jimbaran Seafood Dinner', amount: 80, paidBy: 'Sarah Jenkins', paidById: 'usr_001', category: 'Food', tripId: 'trip_001' }
];

const SEED_ITINERARY = [
  { id: 'itn_001', tripId: 'trip_001', dayNumber: 1, time: '09:00 AM', title: 'Tegenungan Waterfall Hike', location: 'Ubud, Bali', estimatedCost: 15, votes: 12 },
  { id: 'itn_002', tripId: 'trip_001', dayNumber: 1, time: '01:00 PM', title: 'Organic Farm Lunch in Ubud', location: 'Ubud, Bali', estimatedCost: 20, votes: 9 },
  { id: 'itn_003', tripId: 'trip_001', dayNumber: 1, time: '05:00 PM', title: 'Tegallalang Sunset Swing', location: 'Tegallalang, Bali', estimatedCost: 12, votes: 16 }
];

const SEED_MATCHES = [
  { id: 'match_001', userId1: 'usr_001', userId2: 'usr_002', tripId: 'trip_001', compatibilityScore: 96, status: 'Accepted' },
  { id: 'match_002', userId1: 'usr_001', userId2: 'usr_003', tripId: 'trip_002', compatibilityScore: 89, status: 'Pending' }
];

const SEED_POSTS = [
  {
    id: 'post_001',
    userId: 'usr_002',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    location: 'Ubud, Bali',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    caption: 'Found the most secret waterfall in Ubud today with my Travel Buddy group! 🌿💦',
    likes: 42,
    comments: 7
  },
  {
    id: 'post_002',
    userId: 'usr_003',
    authorName: 'Marcus Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    location: 'Interlaken, Switzerland',
    imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    caption: 'Sunrise over the Swiss Alps. Solo travel is great, but sharing moments with companions is priceless! 🏔️✨',
    likes: 89,
    comments: 14
  }
];


// ═══════════════════════════════════════════════════════
//  FIRESTORE DATABASE SERVICE (FULL CRUD OPERATIONS)
// ═══════════════════════════════════════════════════════

export const FirestoreDB = {

  // ─── SEED DATABASE WITH INITIAL DATA ───
  async seedDatabase() {
    try {
      console.log('🌱 Seeding Firestore Database...');

      // Seed Users
      for (const user of SEED_USERS) {
        await setDoc(doc(db, 'users', user.id), { ...user, createdAt: new Date().toISOString() });
      }
      console.log('✅ Users collection seeded (3 documents)');

      // Seed Trips
      for (const trip of SEED_TRIPS) {
        await setDoc(doc(db, 'trips', trip.id), { ...trip, createdAt: new Date().toISOString() });
      }
      console.log('✅ Trips collection seeded (3 documents)');

      // Seed Expenses
      for (const exp of SEED_EXPENSES) {
        await setDoc(doc(db, 'expenses', exp.tripId, 'items', exp.id), { ...exp, createdAt: new Date().toISOString() });
      }
      console.log('✅ Expenses collection seeded (3 documents)');

      // Seed Itinerary
      for (const itn of SEED_ITINERARY) {
        await setDoc(doc(db, 'itinerary', itn.tripId, 'activities', itn.id), { ...itn, createdAt: new Date().toISOString() });
      }
      console.log('✅ Itinerary collection seeded (3 documents)');

      // Seed Matches
      for (const match of SEED_MATCHES) {
        await setDoc(doc(db, 'matches', match.id), { ...match, createdAt: new Date().toISOString() });
      }
      console.log('✅ Matches collection seeded (2 documents)');

      // Seed Posts
      for (const post of SEED_POSTS) {
        await setDoc(doc(db, 'posts', post.id), { ...post, createdAt: new Date().toISOString() });
      }
      console.log('✅ Posts collection seeded (2 documents)');

      console.log('🎉 Database seeding complete! View at: http://127.0.0.1:4000/firestore');
      return true;
    } catch (err) {
      console.error('❌ Database seed failed:', err);
      return false;
    }
  },

  // ─── TRIPS ───
  async getTrips() {
    const snapshot = await getDocs(collection(db, 'trips'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addTrip(tripData) {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...tripData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...tripData };
  },

  // ─── EXPENSES ───
  async getExpenses(tripId = 'trip_001') {
    const snapshot = await getDocs(collection(db, 'expenses', tripId, 'items'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addExpense(tripId = 'trip_001', expenseData) {
    const docRef = await addDoc(collection(db, 'expenses', tripId, 'items'), {
      ...expenseData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...expenseData };
  },

  // ─── ITINERARY ───
  async getItinerary(tripId = 'trip_001') {
    const snapshot = await getDocs(collection(db, 'itinerary', tripId, 'activities'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addItineraryItem(tripId = 'trip_001', itemData) {
    const docRef = await addDoc(collection(db, 'itinerary', tripId, 'activities'), {
      ...itemData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...itemData };
  },

  // ─── POSTS ───
  async getPosts() {
    const snapshot = await getDocs(collection(db, 'posts'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ─── SOS ALERTS ───
  async triggerSos(userId, location = 'Live GPS Location') {
    const docRef = await addDoc(collection(db, 'sos_alerts'), {
      userId,
      location,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE'
    });
    console.log('🚨 SOS Alert saved to Firestore! Doc ID:', docRef.id);
    return docRef.id;
  }
};
