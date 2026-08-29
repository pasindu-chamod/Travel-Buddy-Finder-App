// Local Database Service for Web App (LocalStorage Persistence)

const STORAGE_KEYS = {
  TRIPS: 'tbf_trips_v1',
  EXPENSES: 'tbf_expenses_v1',
  ITINERARY: 'tbf_itinerary_v1',
  MATCHES: 'tbf_matches_v1',
  POSTS: 'tbf_posts_v1',
  PROFILE: 'tbf_profile_v1'
};

// Initial Seed Data
const DEFAULT_TRIPS = [
  {
    id: 't1',
    title: 'Bali Waterfalls & Beach Hopping',
    destination: 'Bali, Indonesia',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    budget: 650,
    maxMembers: 4,
    currentMembers: 2,
    isWomenOnly: true,
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    host: 'Sarah J.',
  },
  {
    id: 't2',
    title: 'Swiss Alps Trail Trekking',
    destination: 'Interlaken, Switzerland',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    budget: 1200,
    maxMembers: 5,
    currentMembers: 3,
    isWomenOnly: false,
    cover: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    host: 'Marcus V.',
  },
  {
    id: 't3',
    title: 'Kyoto Cherry Blossom Tour',
    destination: 'Kyoto, Japan',
    startDate: '2026-11-12',
    endDate: '2026-11-20',
    budget: 950,
    maxMembers: 4,
    currentMembers: 1,
    isWomenOnly: false,
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    host: 'Kenji T.',
  }
];

const DEFAULT_EXPENSES = [
  { id: '1', title: 'Villa Deposit (3 Nights)', amount: 160, paidBy: 'You', category: 'Stay' },
  { id: '2', title: 'Scooter Rental (Bali)', amount: 45, paidBy: 'Elena', category: 'Transport' },
  { id: '3', title: 'Jimbaran Seafood Dinner', amount: 80, paidBy: 'You', category: 'Food' }
];

const DEFAULT_ITINERARY = [
  { id: '1', time: '09:00 AM', title: 'Tegenungan Waterfall Hike', cost: 15, votes: 12 },
  { id: '2', time: '01:00 PM', title: 'Organic Farm Lunch in Ubud', cost: 20, votes: 9 },
  { id: '3', time: '05:00 PM', title: 'Tegallalang Sunset Swing', cost: 12, votes: 16 }
];

export const Database = {
  // Initialize Database
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.TRIPS)) {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(DEFAULT_TRIPS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ITINERARY)) {
      localStorage.setItem(STORAGE_KEYS.ITINERARY, JSON.stringify(DEFAULT_ITINERARY));
    }
  },

  // Trips CRUD
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

  // Expenses CRUD
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

  // Itinerary CRUD
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
  }
};
