import { 
  db, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from './firebaseConfig';

export const ExternalFirestore = {
  
  // --- TRIPS COLLECTION ---
  async fetchTrips() {
    try {
      const tripsCol = collection(db, 'trips');
      const snapshot = await getDocs(tripsCol);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('External Firestore connection error, using local fallback:', err);
      return null;
    }
  },

  async addTrip(tripData) {
    try {
      const tripsCol = collection(db, 'trips');
      const docRef = await addDoc(tripsCol, {
        ...tripData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...tripData };
    } catch (err) {
      console.error('Failed to add trip to external Firestore:', err);
      throw err;
    }
  },

  // --- EXPENSES COLLECTION ---
  async fetchExpenses(tripId = 't1') {
    try {
      const expCol = collection(db, `expenses/${tripId}/items`);
      const snapshot = await getDocs(expCol);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('External Firestore expense fetch error:', err);
      return null;
    }
  },

  async addExpense(tripId = 't1', expenseData) {
    try {
      const expCol = collection(db, `expenses/${tripId}/items`);
      const docRef = await addDoc(expCol, {
        ...expenseData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...expenseData };
    } catch (err) {
      console.error('Failed to add expense to external Firestore:', err);
      throw err;
    }
  },

  // --- SOS EMERGENCY ALERTS ---
  async triggerSosAlert(userId, location) {
    try {
      const sosCol = collection(db, 'sos_alerts');
      const docRef = await addDoc(sosCol, {
        userId,
        location,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });
      return docRef.id;
    } catch (err) {
      console.error('Failed to trigger SOS alert on external Firestore:', err);
      throw err;
    }
  }
};
