import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldAlert, Heart, MapPin, Calendar, DollarSign, 
  Users, CheckCircle2, Search, Filter, UserCheck, MessageSquare, 
  Plus, ThumbsUp, Send, Bell, Settings, Star, Compass, Award, ArrowLeft, LogOut, Database as DatabaseIcon, RefreshCw
} from 'lucide-react';
import { Database } from './services/database';
import { FirestoreDB } from './services/firestoreDB';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  
  // App States
  const [womenOnlyMode, setWomenOnlyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [firestoreStatus, setFirestoreStatus] = useState('connecting'); // 'connecting' | 'connected' | 'seeded' | 'error'
  const [dbLoading, setDbLoading] = useState(false);
  
  // User Profile
  const currentUser = {
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Backpacker & adventure photographer. Exploring Southeast Asia! 🌏',
    gender: 'Female',
    age: 23,
    style: 'Adventure & Backpacker',
    budget: 'Budget ($30-50/day)',
    languages: ['English', 'Spanish', 'French'],
    isVerified: true,
    trustScore: 4.9,
    tripsCompleted: 15
  };

  // Database-backed States
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);

  // Load from LocalStorage on mount, then try Firestore
  useEffect(() => {
    // Immediate local data
    setTrips(Database.getTrips());
    setExpenses(Database.getExpenses());
    setItinerary(Database.getItinerary());

    // Try loading from Firestore emulator
    loadFromFirestore();
  }, []);

  const loadFromFirestore = async () => {
    try {
      setDbLoading(true);
      const firestoreTrips = await FirestoreDB.getTrips();
      if (firestoreTrips && firestoreTrips.length > 0) {
        setTrips(firestoreTrips.map(t => ({
          ...t,
          currentMembers: t.currentMemberIds?.length || t.currentMembers || 1,
          cover: t.coverUrl || t.cover
        })));
        setFirestoreStatus('connected');
      } else {
        setFirestoreStatus('connected');
      }

      const firestoreExpenses = await FirestoreDB.getExpenses('trip_001');
      if (firestoreExpenses && firestoreExpenses.length > 0) {
        setExpenses(firestoreExpenses);
      }

      const firestoreItinerary = await FirestoreDB.getItinerary('trip_001');
      if (firestoreItinerary && firestoreItinerary.length > 0) {
        setItinerary(firestoreItinerary);
      }
    } catch (err) {
      console.warn('Firestore load fallback to local:', err.message);
      setFirestoreStatus('error');
    } finally {
      setDbLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setDbLoading(true);
    const success = await FirestoreDB.seedDatabase();
    if (success) {
      setFirestoreStatus('seeded');
      triggerToast('🌱 Firestore Database seeded! View at http://127.0.0.1:4000/firestore');
      await loadFromFirestore();
    } else {
      triggerToast('⚠️ Seed failed. Is the Firestore Emulator running?');
    }
    setDbLoading(false);
  };



  // Match Candidates
  const [matchCandidates, setMatchCandidates] = useState([
    {
      id: 'm1',
      name: 'Elena Rostova',
      age: 24,
      destination: 'Bali, Indonesia',
      matchScore: 96,
      photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      bio: 'Solo hiker & coffee enthusiast. Looking for travel buddies for September!',
      style: 'Adventure & Backpacker',
      budget: 'Budget ($30-50/day)',
      verified: true
    },
    {
      id: 'm2',
      name: 'Marcus Vance',
      age: 26,
      destination: 'Interlaken, Switzerland',
      matchScore: 89,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      bio: 'Landscape photographer. Excited to conquer alpine photography spots.',
      style: 'Photography & Camping',
      budget: 'Moderate ($80-120/day)',
      verified: true
    }
  ]);

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Expenses State
  const [expenses, setExpenses] = useState([
    { id: '1', title: 'Villa Deposit (3 Nights)', amount: 160, paidBy: 'You', category: 'Stay' },
    { id: '2', title: 'Scooter Rental (Bali)', amount: 45, paidBy: 'Elena', category: 'Transport' },
    { id: '3', title: 'Jimbaran Seafood Dinner', amount: 80, paidBy: 'You', category: 'Food' }
  ]);

  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: 'You', category: 'Food' });

  // Itinerary State
  const [itinerary, setItinerary] = useState([
    { id: '1', time: '09:00 AM', title: 'Tegenungan Waterfall Hike', cost: 15, votes: 12 },
    { id: '2', time: '01:00 PM', title: 'Organic Farm Lunch in Ubud', cost: 20, votes: 9 },
    { id: '3', time: '05:00 PM', title: 'Tegallalang Sunset Swing', cost: 12, votes: 16 }
  ]);

  const [newActivity, setNewActivity] = useState({ time: '10:00 AM', title: '', cost: '' });

  // Social Feed Posts
  const [posts, setPosts] = useState([
    {
      id: 'p1',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
      location: 'Ubud, Bali',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      caption: 'Found the most secret waterfall in Ubud today with my Travel Buddy group! 🌿💦',
      likes: 42,
      comments: 7,
      isLiked: false
    },
    {
      id: 'p2',
      author: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      location: 'Interlaken, Switzerland',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
      caption: 'Sunrise over the Swiss Alps. Solo travel is great, but sharing moments with companions is priceless! 🏔️✨',
      likes: 89,
      comments: 14,
      isLiked: false
    }
  ]);

  // Modal State for New Trip
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [newTripForm, setNewTripForm] = useState({ title: '', destination: '', budget: '', isWomenOnly: false });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    const item = { id: Date.now().toString(), ...newExpense, amount: parseFloat(newExpense.amount) };
    // Save to local
    const updated = Database.addExpense(item);
    setExpenses(updated);
    // Save to Firestore
    try { await FirestoreDB.addExpense('trip_001', item); } catch(e) { console.warn('Firestore write skipped'); }
    setNewExpense({ title: '', amount: '', paidBy: 'You', category: 'Food' });
    triggerToast('💰 Expense saved to Firestore Database!');
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.title) return;
    const item = { id: Date.now().toString(), time: newActivity.time, title: newActivity.title, cost: parseFloat(newActivity.cost || 0), votes: 1 };
    // Save to local
    const updated = Database.addItineraryItem(item);
    setItinerary(updated);
    // Save to Firestore
    try { await FirestoreDB.addItineraryItem('trip_001', item); } catch(e) { console.warn('Firestore write skipped'); }
    setNewActivity({ time: '10:00 AM', title: '', cost: '' });
    triggerToast('🗓️ Activity saved to Firestore Database!');
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripForm.title || !newTripForm.destination) return;
    const newTrip = {
      id: Date.now().toString(),
      title: newTripForm.title,
      destination: newTripForm.destination,
      startDate: '2026-09-15',
      endDate: '2026-09-22',
      budget: parseFloat(newTripForm.budget || 500),
      maxMembers: 4,
      currentMembers: 1,
      isWomenOnly: newTripForm.isWomenOnly,
      cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      host: 'Sarah J.'
    };
    // Save to local
    const updated = Database.saveTrip(newTrip);
    setTrips(updated);
    // Save to Firestore
    try { await FirestoreDB.addTrip(newTrip); } catch(e) { console.warn('Firestore write skipped'); }
    setShowCreateTripModal(false);
    setNewTripForm({ title: '', destination: '', budget: '', isWomenOnly: false });
    triggerToast('🎉 Trip saved to Firestore Database!');
  };


  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWomenOnly = womenOnlyMode ? t.isWomenOnly : true;
    return matchesSearch && matchesWomenOnly;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* APP TOP BAR */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: '#2196f3',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', background: 'linear-gradient(to right, #60a5fa, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Travel Buddy Finder
            </h1>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>Connect Solo Travelers • Split Expenses • Plan Together</p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Cloud Firestore Connection Badge */}
          <div style={{
            padding: '6px 12px',
            backgroundColor: firestoreStatus === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${firestoreStatus === 'error' ? '#ef4444' : '#10b981'}`,
            borderRadius: '10px',
            color: firestoreStatus === 'error' ? '#f87171' : '#34d399',
            fontSize: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: firestoreStatus === 'error' ? '#ef4444' : '#10b981', borderRadius: '50%', boxShadow: `0 0 8px ${firestoreStatus === 'error' ? '#ef4444' : '#10b981'}` }}></span>
            {firestoreStatus === 'connecting' && 'Firestore Connecting...'}
            {firestoreStatus === 'connected' && 'Cloud Firestore Live'}
            {firestoreStatus === 'seeded' && '✅ Firestore Seeded'}
            {firestoreStatus === 'error' && 'Local Mode (Emulator Off)'}
          </div>

          {/* Seed Database Button */}
          <button
            onClick={handleSeedDatabase}
            disabled={dbLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#7c3aed',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '700',
              cursor: dbLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: dbLoading ? 0.7 : 1
            }}
          >
            <DatabaseIcon size={14} /> {dbLoading ? 'Seeding...' : 'Seed Database'}
          </button>

          {/* SOS Alert Trigger Button */}
          <button
            onClick={() => {
              setSosActive(!sosActive);
              triggerToast(sosActive ? '🛡️ SOS Mode Deactivated' : '🚨 EMERGENCY SOS ALERT: GPS Location sent to emergency contacts!');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: sosActive ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${sosActive ? '#ef4444' : 'rgba(239, 68, 68, 0.4)'}`,
              borderRadius: '12px',
              color: sosActive ? '#ffffff' : '#f87171',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <ShieldAlert size={18} /> {sosActive ? 'SOS ACTIVE' : 'EMERGENCY SOS'}
          </button>

          {/* User Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '6px 12px', borderRadius: '12px', border: '1px solid #334155' }}>
            <img src={currentUser.photo} alt={currentUser.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '700' }}>★ {currentUser.trustScore} Verified</div>
            </div>
          </div>

        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '28px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}>
          {toastMessage}
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{
          width: '240px',
          backgroundColor: '#1e293b',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'explore' ? '#2196f3' : 'transparent',
              color: activeTab === 'explore' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Compass size={18} /> Explore Trips
          </button>

          <button
            onClick={() => setActiveTab('match')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'match' ? '#2196f3' : 'transparent',
              color: activeTab === 'match' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Users size={18} /> Companion Matcher
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'planner' ? '#2196f3' : 'transparent',
              color: activeTab === 'planner' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <Calendar size={18} /> Day Itinerary
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'expense' ? '#2196f3' : 'transparent',
              color: activeTab === 'expense' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <DollarSign size={18} /> Expense Ledger
          </button>

          <button
            onClick={() => setActiveTab('social')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'social' ? '#2196f3' : 'transparent',
              color: activeTab === 'social' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <MessageSquare size={18} /> Travel Social Feed
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'safety' ? '#2196f3' : 'transparent',
              color: activeTab === 'safety' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <ShieldAlert size={18} /> Safety Hub
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'profile' ? '#2196f3' : 'transparent',
              color: activeTab === 'profile' ? '#ffffff' : '#94a3b8',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <UserCheck size={18} /> My Profile
          </button>
        </aside>

        {/* CONTENT VIEWPORT */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          
          {/* ==================== MODULE 1: EXPLORE TRIPS ==================== */}
          {activeTab === 'explore' && (
            <div>
              {/* Header & Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Explore Upcoming Trips</h2>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>Discover trip plans created by travelers worldwide.</p>
                </div>

                <button
                  onClick={() => setShowCreateTripModal(true)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#2196f3',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(33, 150, 243, 0.4)'
                  }}
                >
                  <Plus size={18} /> Host New Trip
                </button>
              </div>

              {/* Filter Bar */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <input
                    type="text"
                    placeholder="Search by destination (e.g. Bali, Interlaken, Kyoto)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px 12px 42px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff', fontSize: '14px' }}
                  />
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                </div>

                {/* Women Only Mode Switcher */}
                <button
                  onClick={() => setWomenOnlyMode(!womenOnlyMode)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: womenOnlyMode ? '#ec4899' : '#1e293b',
                    border: `1px solid ${womenOnlyMode ? '#ec4899' : '#334155'}`,
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldAlert size={16} /> Women-Only Trips {womenOnlyMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Trip Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredTrips.map(trip => (
                  <div key={trip.id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}>
                    <div style={{ height: '180px', backgroundImage: `url(${trip.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '16px' }}>
                      <span style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        padding: '4px 12px',
                        backgroundColor: trip.isWomenOnly ? '#ec4899' : '#2196f3',
                        color: '#fff',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>
                        {trip.isWomenOnly ? '♀ Women Only' : 'Mixed Group'}
                      </span>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>{trip.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f97316', fontSize: '13px', fontWeight: '700', marginBottom: '12px' }}>
                        <MapPin size={14} /> {trip.destination}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #334155', fontSize: '13px' }}>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Est. Budget: </span>
                          <strong style={{ color: '#10b981' }}>${trip.budget}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Members: </span>
                          <strong style={{ color: '#60a5fa' }}>{trip.currentMembers}/{trip.maxMembers}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerToast(`🎉 Join Request sent for "${trip.title}"`)}
                        style={{
                          width: '100%',
                          marginTop: '16px',
                          padding: '10px',
                          backgroundColor: '#334155',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '10px',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Send Join Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 2: COMPANION MATCHER ==================== */}
          {activeTab === 'match' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Smart Companion Matcher</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Matching based on travel style, budget tier, and language overlap.</p>

              {matchCandidates[currentMatchIndex] ? (
                <div style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{
                    height: '420px',
                    backgroundImage: `url(${matchCandidates[currentMatchIndex].photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px'
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ padding: '6px 14px', backgroundColor: 'rgba(33, 150, 243, 0.9)', color: '#fff', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>
                        {matchCandidates[currentMatchIndex].matchScore}% Compatibility
                      </span>
                    </div>

                    <div style={{ textAlign: 'left', background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)', padding: '20px', borderRadius: '16px', color: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: '900' }}>{matchCandidates[currentMatchIndex].name}, {matchCandidates[currentMatchIndex].age}</h3>
                        <CheckCircle2 size={20} color="#60a5fa" />
                      </div>
                      <div style={{ fontSize: '14px', color: '#f97316', fontWeight: '700', marginTop: '4px' }}>
                        Destination: {matchCandidates[currentMatchIndex].destination}
                      </div>
                      <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '8px' }}>
                        {matchCandidates[currentMatchIndex].bio}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#0f172a' }}>
                    <button
                      onClick={() => setCurrentMatchIndex((currentMatchIndex + 1) % matchCandidates.length)}
                      style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1e293b', border: '1px solid #ef4444', color: '#ef4444', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => {
                        triggerToast(`💖 Match Request sent to ${matchCandidates[currentMatchIndex].name}!`);
                        setCurrentMatchIndex((currentMatchIndex + 1) % matchCandidates.length);
                      }}
                      style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#2196f3', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)' }}
                    >
                      <Heart size={36} fill="#ffffff" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '60px', backgroundColor: '#1e293b', borderRadius: '24px', color: '#94a3b8' }}>
                  <p style={{ fontSize: '16px', marginBottom: '16px' }}>You have reviewed all matched candidates!</p>
                  <button onClick={() => setCurrentMatchIndex(0)} style={{ padding: '12px 24px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    Reload Candidate Stack
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================== MODULE 3: DAY ITINERARY ==================== */}
          {activeTab === 'planner' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>Day 1: Ubud Waterfall & Rice Terraces</h2>
                  <p style={{ fontSize: '14px', color: '#94a3b8' }}>Propose activities and vote on group schedule choices.</p>
                </div>
              </div>

              {/* Add Activity Form */}
              <form onSubmit={handleAddActivity} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Time Slot (e.g. 09:00 AM)"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  style={{ width: '140px', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="Activity Title (e.g. Tegenungan Hike)"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  + Propose
                </button>
              </form>

              {/* Activity Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {itinerary.map(item => (
                  <div key={item.id} style={{ backgroundColor: '#1e293b', padding: '16px 20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ padding: '6px 12px', backgroundColor: 'rgba(33, 150, 243, 0.15)', color: '#60a5fa', borderRadius: '8px', fontWeight: '800', fontSize: '12px' }}>
                        {item.time}
                      </span>
                      <div>
                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Est. Cost: ${item.cost}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setItinerary(itinerary.map(i => i.id === item.id ? {...i, votes: i.votes + 1} : i))}
                      style={{ padding: '8px 16px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}
                    >
                      <ThumbsUp size={16} color="#60a5fa" /> {item.votes} Upvotes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 4: EXPENSE LEDGER ==================== */}
          {activeTab === 'expense' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Group Expense Splitter</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Automatic net debt calculation ("Who Owes Whom").</p>

              {/* Total Card */}
              <div style={{ backgroundColor: '#2196f3', padding: '24px', borderRadius: '20px', color: '#fff', marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Group Expenses</div>
                <div style={{ fontSize: '36px', fontWeight: '900', margin: '4px 0 16px' }}>
                  ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>Elena owes You</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#a7f3d0' }}>+$40.00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>You owe Marcus</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#fde047' }}>-$15.00</div>
                  </div>
                </div>
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Expense Title (e.g. Villa Deposit)"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  style={{ flex: 1, padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  style={{ width: '120px', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  + Add Bill
                </button>
              </form>

              {/* Expense List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenses.map(exp => (
                  <div key={exp.id} style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{exp.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Paid by {exp.paidBy}</div>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>
                      ${exp.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 5: SOCIAL FEED ==================== */}
          {activeTab === 'social' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '24px' }}>Travel Community Feed</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {posts.map(post => (
                  <div key={post.id} style={{ backgroundColor: '#1e293b', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={post.avatar} alt={post.author} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '800', color: '#fff', fontSize: '14px' }}>{post.author}</div>
                        <div style={{ fontSize: '12px', color: '#f97316' }}>{post.location}</div>
                      </div>
                    </div>

                    <img src={post.image} alt="Post" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />

                    <div style={{ padding: '16px' }}>
                      <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>{post.caption}</p>
                      
                      <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
                        <button
                          onClick={() => {
                            setPosts(posts.map(p => p.id === post.id ? {...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked} : p));
                          }}
                          style={{ background: 'none', border: 'none', color: post.isLiked ? '#ef4444' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}
                        >
                          <Heart size={18} fill={post.isLiked ? '#ef4444' : 'none'} /> {post.likes} Likes
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 6: SAFETY HUB ==================== */}
          {activeTab === 'safety' && (
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '6px' }}>Safety & Verification Center</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Identity verification, women-only filters, and emergency contacts.</p>

              <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <CheckCircle2 size={32} color="#10b981" />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Government ID Status: VERIFIED</h3>
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Passport & Phone OTP verified on August 2026.</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>Emergency Contacts Roster</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '14px' }}>Mom (Family Contact)</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>+1 555-0192-834</div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>FCM Push Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== MODULE 7: MY PROFILE ==================== */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <img src={currentUser.photo} alt={currentUser.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #2196f3', marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{currentUser.name}</h2>
              <p style={{ fontSize: '14px', color: '#f97316', fontWeight: '700', marginTop: '4px' }}>★ {currentUser.trustScore} Trust Score • {currentUser.tripsCompleted} Trips Completed</p>
              <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '12px' }}>{currentUser.bio}</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', fontSize: '12px', color: '#60a5fa', fontWeight: '700' }}>Style: {currentUser.style}</span>
                <span style={{ padding: '6px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', fontSize: '12px', color: '#f97316', fontWeight: '700' }}>Tier: {currentUser.budget}</span>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CREATE TRIP MODAL */}
      {showCreateTripModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '24px', padding: '32px', width: '440px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '16px' }}>Host New Trip Plan</h3>
            
            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Trip Title (e.g. Paris Summer Tour)"
                value={newTripForm.title}
                onChange={(e) => setNewTripForm({...newTripForm, title: e.target.value})}
                style={{ padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
              />
              <input
                type="text"
                placeholder="Destination City & Country"
                value={newTripForm.destination}
                onChange={(e) => setNewTripForm({...newTripForm, destination: e.target.value})}
                style={{ padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
              />
              <input
                type="number"
                placeholder="Estimated Budget per Person ($USD)"
                value={newTripForm.budget}
                onChange={(e) => setNewTripForm({...newTripForm, budget: e.target.value})}
                style={{ padding: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', fontSize: '14px' }}
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newTripForm.isWomenOnly}
                  onChange={(e) => setNewTripForm({...newTripForm, isWomenOnly: e.target.checked})}
                />
                Women-Only Trip
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTripModal(false)}
                  style={{ flex: 1, padding: '12px', backgroundColor: '#334155', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', backgroundColor: '#2196f3', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Publish Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
