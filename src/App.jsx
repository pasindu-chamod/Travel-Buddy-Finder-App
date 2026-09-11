import React, { useState, useEffect } from 'react';
import { 
  Compass, MapPin, Calendar, DollarSign, Users, CheckCircle2, 
  Search, Filter, Heart, MessageSquare, Plus, ThumbsUp, Send, 
  Bell, Settings, Star, Award, ShieldAlert, Radio, Zap, 
  LogOut, UserPlus, Shield, UserX, Trash2, Edit3, Check, X,
  Share2, Eye, ShieldCheck, Sparkles, Navigation, Globe, PhoneCall,
  PlusCircle, FolderPlus, UserCheck, Copy, ExternalLink, Instagram,
  MessageCircle, Facebook, Phone, AlertCircle, CheckSquare, Clock,
  Layers, BarChart2, ShieldX, UserMinus, FileText, MessageSquarePlus,
  HelpCircle, Info
} from 'lucide-react';
import { api, getToken } from './api/client';

export default function App() {
  // Auth state — null means not logged in yet
  const [currentUser, setCurrentUser] = useState(null);
  
  // Tab State: If Admin -> admin control tabs; If User -> user tabs
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard' | 'approvals' | 'users' | 'sos' | 'content' | 'chat'
  const [userTab, setUserTab] = useState('explore'); // 'explore' | 'match' | 'planner' | 'expense' | 'social' | 'safety' | 'profile' | 'chat'
  
  const [womenOnlyMode, setWomenOnlyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Real Database Collections
  const [allUsers, setAllUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [adminChatMessages, setAdminChatMessages] = useState([]);

  // Modals & Chat Selection
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [sharingTrip, setSharingTrip] = useState(null);
  
  // Chat States
  const [selectedChatUserId, setSelectedChatUserId] = useState('');
  const [chatInputText, setChatInputText] = useState('');

  // Forms
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ emailOrCallsign: '', password: '', name: '', email: '', phone: '', style: 'Backpacking & Nature' });
  const [profileForm, setProfileForm] = useState({});
  const [newTripForm, setNewTripForm] = useState({ 
    title: '', destination: '', budget: '', startDate: '2026-10-01', endDate: '2026-10-08',
    maxMembers: 4, isWomenOnly: false, cover: '' 
  });
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: '', category: 'Accommodation' });
  const [newActivity, setNewActivity] = useState({ time: '09:00 AM', title: '', cost: '' });
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  // Match Index
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Load all data from backend API
  const reloadData = async () => {
    try {
      const [usersData, tripsData, expensesData, itineraryData, postsData, sosData, chatData] = await Promise.all([
        currentUser?.role === 'admin' ? api.getAllUsers() : api.getTravelers(),
        currentUser?.role === 'admin' ? api.getAllTrips() : api.getTrips(),
        api.getExpenses(),
        api.getItinerary(),
        api.getPosts(),
        api.getSosAlerts(),
        api.getChatMessages()
      ]);
      setAllUsers(usersData);
      setTrips(tripsData);
      setExpenses(expensesData);
      setItinerary(itineraryData);
      setPosts(postsData);
      setSosAlerts(sosData);
      setAdminChatMessages(chatData);
    } catch (err) {
      console.error('Failed to reload data:', err.message);
    }
  };

  // On mount: check if user is already logged in via saved token
  useEffect(() => {
    const token = getToken();
    if (token) {
      api.getMe()
        .then(user => {
          setCurrentUser(user);
          setProfileForm({ ...user });
        })
        .catch(() => {
          api.logout();
          setShowAuthModal(true);
        });
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3800);
  };

  // ─── AUTH HANDLERS ───
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const user = await api.login(authForm.emailOrCallsign, authForm.password);
        setCurrentUser(user);
        setProfileForm({ ...user });
        setShowAuthModal(false);
        triggerToast(`👋 Welcome back, ${user.name}!`);
        if (user.role === 'admin') setAdminTab('dashboard');
        else setUserTab('explore');
      } else {
        if (!authForm.name || !authForm.email) throw new Error('Please fill in your name and email');
        const newUser = await api.register({
          name: authForm.name,
          email: authForm.email,
          password: authForm.password,
          phone: authForm.phone,
          style: authForm.style
        });
        setCurrentUser(newUser);
        setProfileForm({ ...newUser });
        setShowAuthModal(false);
        triggerToast(`🎉 Account created! Welcome, ${newUser.name}`);
        setUserTab('explore');
      }
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAllUsers([]);
    setTrips([]);
    setExpenses([]);
    setItinerary([]);
    setPosts([]);
    setSosAlerts([]);
    setAdminChatMessages([]);
    setShowAuthModal(true);
    triggerToast('Logged out successfully.');
  };

  // ─── PROFILE UPDATE HANDLER ───
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateUser(currentUser._id || currentUser.id, profileForm);
      setCurrentUser({ ...currentUser, ...updated });
      setProfileForm({ ...updated });
      setShowProfileEditModal(false);
      triggerToast('✨ Personal details updated successfully!');
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // ─── ADMIN TRIP APPROVAL & MODERATION ───
  const handleAdminApproveTrip = async (tripId, title) => {
    try {
      await api.approveTrip(tripId);
      triggerToast(`✅ Trip "${title}" APPROVED and published to public feed!`);
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleAdminRejectTrip = async (tripId, title) => {
    if (window.confirm(`[ADMIN] Reject and delete trip request: "${title}"?`)) {
      try {
        await api.rejectTrip(tripId);
        triggerToast(`❌ Trip request "${title}" was rejected and removed`);
        reloadData();
      } catch (err) { alert(err.message); }
    }
  };

  const handleAdminDeleteTrip = async (tripId, title) => {
    if (window.confirm(`[ADMIN] Remove live trip: "${title}" from the platform?`)) {
      try {
        await api.deleteTrip(tripId);
        triggerToast(`🗑️ Trip "${title}" removed by admin`);
        reloadData();
      } catch (err) { alert(err.message); }
    }
  };

  const handleAdminDeletePost = async (postId) => {
    if (window.confirm('[ADMIN] Delete this community post?')) {
      try {
        await api.deletePost(postId);
        triggerToast('🗑️ Post removed by admin');
        reloadData();
      } catch (err) { alert(err.message); }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.toggleUserStatus(userId);
      triggerToast('User status updated');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleUserVerified = async (userId) => {
    try {
      await api.toggleUserVerified(userId);
      triggerToast('User verification status toggled');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('[ADMIN] Permanently delete this user account?')) {
      try {
        await api.deleteUser(userId);
        triggerToast('User account deleted');
        reloadData();
      } catch (err) { alert(err.message); }
    }
  };

  const handleResolveSos = async (alertId) => {
    try {
      await api.resolveSos(alertId);
      triggerToast('✅ Emergency alert marked as resolved');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  // ─── CHAT MESSAGING (USER <-> ADMIN GUIDANCE) ───
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInputText.trim()) return;

    const targetUserId = currentUser.role === 'admin' ? selectedChatUserId : null;
    if (currentUser.role === 'admin' && !selectedChatUserId) {
      alert('Please select a user thread to send guidance to.');
      return;
    }

    try {
      await api.sendChatMessage(chatInputText.trim(), targetUserId);
      setChatInputText('');
      triggerToast(currentUser.role === 'admin' ? '📢 Activity guidance sent to user!' : '💬 Message sent to Admin!');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleSendGuidancePreset = async (presetText) => {
    if (!selectedChatUserId) {
      alert('Please select a user thread first.');
      return;
    }
    try {
      await api.sendChatMessage(presetText, selectedChatUserId);
      triggerToast('📋 Official Guidance Sent!');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  // ─── USER ACTIONS ───
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripForm.title || !newTripForm.destination) return;
    try {
      await api.createTrip(newTripForm);
      setShowCreateTripModal(false);
      setNewTripForm({ title: '', destination: '', budget: '', startDate: '2026-10-01', endDate: '2026-10-08', maxMembers: 4, isWomenOnly: false, cover: '' });
      triggerToast('⏳ Trip submitted! It will be visible once Admin approves it.');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    try {
      await api.addExpense(newExpense);
      setNewExpense({ title: '', amount: '', paidBy: currentUser.name, category: 'Accommodation' });
      triggerToast('💰 Expense logged to database');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.title) return;
    try {
      await api.addItineraryItem(newActivity);
      setNewActivity({ time: '09:00 AM', title: '', cost: '' });
      triggerToast('📍 Activity added to itinerary');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostCaption) return;
    try {
      await api.createPost({ caption: newPostCaption, image: newPostImage });
      setNewPostCaption('');
      setNewPostImage('');
      triggerToast('📸 Post shared to Travel Feed!');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  const handleTriggerSos = async () => {
    setSosActive(true);
    try {
      await api.triggerSos({
        coordinates: 'Live GPS Coordinates',
        location: currentUser.homeCountry || 'Current Location',
        phone: currentUser.phone || 'Not provided',
        emergencyContact: `${currentUser.emergencyContactName || ''} (${currentUser.emergencyContactPhone || ''})`,
        severity: 'Emergency Request',
        details: 'Emergency SOS alert dispatched by traveler.'
      });
      triggerToast('🚨 Emergency alert dispatched to Admin Control Center!');
      reloadData();
    } catch (err) { alert(err.message); }
  };

  // ─── SOCIAL SHARING ───
  const handleCopyTripLink = (trip) => {
    const url = `${window.location.origin}/trips/${trip.id}`;
    navigator.clipboard.writeText(url);
    triggerToast('🔗 Trip link copied to clipboard!');
  };

  const handleNativeShare = async (trip) => {
    const shareData = {
      title: `Join trip: ${trip.title}`,
      text: `Hey! Check out this trip to ${trip.destination} on TravelBuddy ($${trip.budget} budget). Join my travel squad!`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully!');
      } catch (e) {
        console.log('Share canceled');
      }
    } else {
      handleCopyTripLink(trip);
    }
  };

  // Filtered trips for public / regular users: ONLY APPROVED TRIPS!
  const publicApprovedTrips = trips.filter(t => {
    const isApproved = t.status === 'APPROVED';
    const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWomenOnly = womenOnlyMode ? t.isWomenOnly : true;
    return isApproved && matchesSearch && matchesWomenOnly;
  });

  // User's own pending trips (backend already filters, but keep for local derived state)
  const myPendingTrips = trips.filter(t => {
    const uid = currentUser?._id || currentUser?.id;
    return (t.hostId === uid || t.hostId?.toString() === uid?.toString()) && t.status === 'PENDING';
  });

  // Admin Queue Lists
  const pendingApprovalTrips = trips.filter(t => t.status === 'PENDING');
  const approvedLiveTrips = trips.filter(t => t.status === 'APPROVED');
  const activeSosCount = sosAlerts.filter(a => a.status === 'ACTIVE').length;

  // Chat Data Organization
  const chatUsersList = allUsers.filter(u => u.role !== 'admin');

  // Reload data whenever user logs in
  useEffect(() => {
    if (currentUser) reloadData();
  }, [currentUser?.role]);
  
  // Set default selected chat user for Admin if not set
  useEffect(() => {
    if (currentUser?.role === 'admin' && !selectedChatUserId && chatUsersList.length > 0) {
      setSelectedChatUserId(chatUsersList[0]._id || chatUsersList[0].id);
    }
  }, [allUsers, currentUser?.role]);

  // Messages for currently active thread
  const uid = currentUser?._id || currentUser?.id;
  const activeThreadUserId = currentUser?.role === 'admin' ? selectedChatUserId : uid;
  const currentThreadMessages = adminChatMessages.filter(m =>
    m.userId === activeThreadUserId || m.userId?.toString() === activeThreadUserId?.toString()
  );

  // Candidates for Matching
  const otherUsers = allUsers.filter(u => {
    const uUid = u._id || u.id;
    return uUid?.toString() !== uid?.toString() && u.role !== 'admin';
  });
  const activeCandidate = otherUsers[currentMatchIndex % (otherUsers.length || 1)];

  // If not logged in, render the Clean Auth Page
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        color: '#f8fafc'
      }}>
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '20px', right: '20px',
            backgroundColor: '#1e293b', border: '1px solid #3b82f6',
            color: '#60a5fa', padding: '12px 20px', borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 9999, fontSize: '13px'
          }}>
            {toastMessage}
          </div>
        )}

        <div className="travel-card" style={{ padding: '36px', width: '100%', maxWidth: '440px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '48px', height: '48px', backgroundColor: '#3b82f6',
              borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
            }}>
              <Compass size={28} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>
              Travel<span style={{ color: '#3b82f6' }}>Buddy</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              {authMode === 'login' ? 'Sign in to access your dashboard' : 'Create an account to start your journey'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authMode === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter contact number"
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {authMode === 'login' ? "Email or Username" : "Email Address"}
              </label>
              <input
                type="text"
                placeholder={authMode === 'login' ? "Enter email or username" : "Enter email address"}
                value={authMode === 'login' ? authForm.emailOrCallsign : authForm.email}
                onChange={(e) => authMode === 'login' ? setAuthForm({ ...authForm, emailOrCallsign: e.target.value }) : setAuthForm({ ...authForm, email: e.target.value })}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{ width: '100%', padding: '12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '10px', padding: '12px', backgroundColor: '#3b82f6',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
              }}
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
            >
              {authMode === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign In"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      
      {/* ══════════════════ TOP BAR ══════════════════ */}
      <header style={{
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        
        {/* Brand Logo & Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: currentUser.role === 'admin' ? '#ef4444' : '#3b82f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: currentUser.role === 'admin' ? '0 4px 14px rgba(239, 68, 68, 0.35)' : '0 4px 12px rgba(59, 130, 246, 0.35)'
          }}>
            {currentUser.role === 'admin' ? <Shield size={22} color="#ffffff" /> : <Compass size={24} color="#ffffff" />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
                Travel<span style={{ color: currentUser.role === 'admin' ? '#ef4444' : '#3b82f6' }}>Buddy</span>
              </h1>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                backgroundColor: currentUser.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: currentUser.role === 'admin' ? '#f87171' : '#60a5fa',
                borderRadius: '6px',
                fontWeight: '700'
              }}>
                {currentUser.role === 'admin' ? '🛡️ Admin Control Console' : '👤 Traveler Portal'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {currentUser.role === 'admin' ? 'Trip Approvals, User Guidance & Governance' : 'Find your next adventure companions'}
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Traveler Chat Quick Access */}
          {currentUser.role !== 'admin' && (
            <button
              onClick={() => setUserTab('chat')}
              style={{
                padding: '8px 14px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa',
                fontWeight: '700',
                fontSize: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <MessageSquarePlus size={15} />
              Chat with Admin
            </button>
          )}

          {/* Traveler SOS Button */}
          {currentUser.role !== 'admin' && (
            <button
              onClick={handleTriggerSos}
              style={{
                padding: '8px 16px',
                backgroundColor: sosActive ? '#ef4444' : 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: sosActive ? '#ffffff' : '#f87171',
                fontWeight: '700',
                fontSize: '13px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShieldAlert size={16} />
              {sosActive ? 'SOS Alert Sent' : 'Emergency SOS'}
            </button>
          )}

          {/* Admin Pending Approvals Quick Alert */}
          {currentUser.role === 'admin' && pendingApprovalTrips.length > 0 && (
            <button
              onClick={() => setAdminTab('approvals')}
              style={{
                padding: '7px 14px',
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                color: '#facc15',
                fontWeight: '700',
                fontSize: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Clock size={15} />
              {pendingApprovalTrips.length} Pending Approvals
            </button>
          )}

          {/* User / Admin Session Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            padding: '5px 12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          }}>
            {currentUser.role === 'admin' || !currentUser.photo ? (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: currentUser.role === 'admin' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentUser.role === 'admin' ? <Shield size={18} color="#fff" /> : <Users size={18} color="#fff" />}
              </div>
            ) : (
              <img src={currentUser.photo} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            )}

            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '11px', color: currentUser.role === 'admin' ? '#f87171' : '#38bdf8' }}>
                {currentUser.role === 'admin' ? 'Master Admin' : (currentUser.homeCountry || 'Traveler')}
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-secondary"
              style={{
                marginLeft: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Switch Account
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════════ TOAST NOTIFICATION ══════════════════ */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '13px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* ══════════════════ MAIN WORKSPACE LAYOUT ══════════════════ */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        
        {/* ─── SIDEBAR NAVIGATION (DEDICATED FOR ROLE) ─── */}
        <aside style={{
          width: '260px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          
          {/* ======================================================== */}
          {/* 👑 ADMIN-ONLY SIDEBAR                                     */}
          {/* ======================================================== */}
          {currentUser.role === 'admin' ? (
            <>
              <div style={{ fontSize: '11px', color: '#ef4444', padding: '0 12px 8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                🛡️ Control Center
              </div>

              {[
                { id: 'dashboard', label: 'Control Overview', icon: BarChart2, badge: 'Live' },
                { id: 'approvals', label: 'Trip Approvals', icon: CheckSquare, badge: `${pendingApprovalTrips.length} Pending`, highlight: pendingApprovalTrips.length > 0 },
                { id: 'chat', label: 'User Guidance Chat', icon: MessageSquarePlus, badge: `${adminChatMessages.length} Msgs` },
                { id: 'users', label: 'User Governance', icon: Users, badge: `${allUsers.length}` },
                { id: 'sos', label: 'Emergency SOS', icon: ShieldAlert, badge: `${activeSosCount} Active`, alert: activeSosCount > 0 },
                { id: 'content', label: 'Content Moderation', icon: MessageSquare, badge: `${posts.length}` }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: isActive ? '#ef4444' : 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      color: isActive ? '#ffffff' : '#cbd5e1',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                      <span>{tab.label}</span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 7px',
                      backgroundColor: tab.highlight ? '#eab308' : (tab.alert ? '#ef4444' : (isActive ? 'rgba(0,0,0,0.3)' : 'rgba(255, 255, 255, 0.08)')),
                      color: tab.highlight ? '#000' : '#ffffff',
                      borderRadius: '6px',
                      fontWeight: '800'
                    }}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            /* ======================================================== */
            /* 👤 TRAVELER SIDEBAR                                       */
            /* ======================================================== */
            <>
              <div style={{ fontSize: '11px', color: '#64748b', padding: '0 12px 8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Travel Menu
              </div>

              {[
                { id: 'explore', label: 'Explore Trips', icon: Compass, badge: `${publicApprovedTrips.length}` },
                { id: 'match', label: 'Buddy Matcher', icon: Heart, badge: `${otherUsers.length}` },
                { id: 'chat', label: 'Admin Chat & Support', icon: MessageSquarePlus, badge: 'Live Guidance' },
                { id: 'planner', label: 'Trip Itinerary', icon: Calendar, badge: `${itinerary.length}` },
                { id: 'expense', label: 'Expense Splitter', icon: DollarSign, badge: `$${expenses.reduce((a,c)=>a+c.amount,0)}` },
                { id: 'social', label: 'Travel Feed', icon: MessageSquare, badge: `${posts.length}` },
                { id: 'safety', label: 'Safety & Support', icon: ShieldCheck, badge: 'Protected' },
                { id: 'profile', label: 'My Full Profile', icon: Users, badge: 'Edit' },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = userTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setUserTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: '12px',
                      color: isActive ? '#3b82f6' : '#94a3b8',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? '#3b82f6' : '#64748b'} />
                      <span>{tab.label}</span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#fff' : '#64748b',
                      borderRadius: '6px',
                      fontWeight: '700'
                    }}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </>
          )}

          {/* Logout / Switch Footer in Sidebar */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px' }}>
            {currentUser.role !== 'admin' && (
              <button
                onClick={() => setShowProfileEditModal(true)}
                className="btn-secondary"
                style={{
                  padding: '10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Edit3 size={14} /> Edit My Profile
              </button>
            )}

            <button
              onClick={handleLogout}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} /> Switch / Sign Out
            </button>
          </div>

        </aside>

        {/* ─── MAIN CONTENT VIEWPORT ─── */}
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          
          {/* ========================================================================= */}
          {/* 👑 ADMIN WORKSPACE: CONTROL & GOVERNANCE ONLY                            */}
          {/* ========================================================================= */}
          {currentUser.role === 'admin' && (
            <div>
              
              {/* ── ADMIN TAB 1: CONTROL DASHBOARD ── */}
              {adminTab === 'dashboard' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
                      Admin Governance & Control Console 👑
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Oversee trip approval requests, guide user activities via chat, manage registered travelers, and handle emergency SOS alerts.
                    </p>
                  </div>

                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                    
                    <div 
                      onClick={() => setAdminTab('approvals')}
                      className="travel-card" 
                      style={{ padding: '20px', cursor: 'pointer', border: pendingApprovalTrips.length > 0 ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#eab308', fontWeight: '700' }}>Pending Approvals</span>
                        <Clock size={16} color="#eab308" />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#facc15', marginTop: '6px' }}>
                        {pendingApprovalTrips.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Trips awaiting your approval</div>
                    </div>

                    <div 
                      onClick={() => setAdminTab('chat')}
                      className="travel-card" 
                      style={{ padding: '20px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>User Guidance Chat</span>
                        <MessageSquarePlus size={16} color="#38bdf8" />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>
                        {chatUsersList.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Active traveler conversations</div>
                    </div>

                    <div 
                      onClick={() => setAdminTab('users')}
                      className="travel-card" 
                      style={{ padding: '20px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700' }}>Registered Travelers</span>
                        <Users size={16} color="#a78bfa" />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#a78bfa', marginTop: '6px' }}>
                        {allUsers.length}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Accounts under governance</div>
                    </div>

                    <div 
                      onClick={() => setAdminTab('sos')}
                      className="travel-card" 
                      style={{ padding: '20px', cursor: 'pointer', border: activeSosCount > 0 ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#f87171', fontWeight: '700' }}>Active SOS Signals</span>
                        <ShieldAlert size={16} color="#f87171" />
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: '#f87171', marginTop: '6px' }}>
                        {activeSosCount}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Emergency assistance calls</div>
                    </div>

                  </div>

                  {/* Quick Action to Chat & Guide Users */}
                  <div className="travel-card" style={{ padding: '20px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(59,130,246,0.15))' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageSquarePlus size={20} color="#38bdf8" /> User Guidance & Direct Activity Control
                      </h3>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                        You can send activity instructions, safety guidelines, and direct answers to any registered traveler in real-time.
                      </p>
                    </div>
                    <button
                      onClick={() => setAdminTab('chat')}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Open User Guidance Chat →
                    </button>
                  </div>

                  {/* Urgent Attention: Pending Trips Quick Panel */}
                  {pendingApprovalTrips.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#facc15', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={18} /> Urgent: Trips Waiting for Approval ({pendingApprovalTrips.length})
                        </h3>
                        <button onClick={() => setAdminTab('approvals')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                          View All Approvals →
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {pendingApprovalTrips.map(trip => (
                          <div key={trip.id} className="travel-card" style={{ padding: '18px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{trip.title}</h4>
                                <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>📍 {trip.destination}</div>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>${trip.budget}</span>
                            </div>

                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.5' }}>
                              Host: <b style={{ color: '#fff' }}>{trip.host}</b> ({trip.hostPhone || trip.hostEmail || 'No contact'})<br/>
                              Dates: {trip.startDate} to {trip.endDate}<br/>
                              Capacity: {trip.maxMembers} travelers
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleAdminApproveTrip(trip.id, trip.title)}
                                style={{ flex: 1, padding: '8px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                              >
                                <Check size={14} /> Approve Trip
                              </button>
                              <button
                                onClick={() => handleAdminRejectTrip(trip.id, trip.title)}
                                style={{ padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ── ADMIN TAB: USER GUIDANCE CHAT SYSTEM ── */}
              {adminTab === 'chat' && (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquarePlus size={24} color="#38bdf8" /> User Guidance & Activity Support Console 💬
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Chat directly with travelers, answer questions, and send official activity guidelines.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', height: '620px' }}>
                    
                    {/* User Threads List Sidebar */}
                    <div className="travel-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Traveler Threads ({chatUsersList.length})
                      </div>

                      {chatUsersList.length === 0 ? (
                        <div style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No travelers registered yet.</div>
                      ) : (
                        chatUsersList.map(u => {
                          const isSelected = selectedChatUserId === u.id;
                          const userMsgs = adminChatMessages.filter(m => m.userId === u.id);
                          const lastMsg = userMsgs[userMsgs.length - 1];

                          return (
                            <button
                              key={u.id}
                              onClick={() => setSelectedChatUserId(u.id)}
                              style={{
                                padding: '12px',
                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                                border: isSelected ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                            >
                              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                {u.name.charAt(0)}
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{u.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lastMsg ? `${lastMsg.senderRole === 'admin' ? 'You: ' : ''}${lastMsg.text}` : 'Start conversation...'}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Messages & Guidance Panel */}
                    <div className="travel-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                      
                      {/* Thread Header */}
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>
                            Conversation with: <span style={{ color: '#38bdf8' }}>{allUsers.find(u => u.id === selectedChatUserId)?.name || 'Select a Traveler'}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Official System Guidance & Support Thread
                          </div>
                        </div>

                        {/* Quick Activity Guidance Presets for Admin */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSendGuidancePreset('📋 OFFICIAL ADVISORY: Please make sure your travel group adheres to local environmental guidelines and verified safety protocols.')}
                            style={{ padding: '5px 10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            + Safety Guidance
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendGuidancePreset('✅ VERIFICATION NOTICE: Your account & profile information are in order. You are clear to host trips.')}
                            style={{ padding: '5px 10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                          >
                            + Verification Advice
                          </button>
                        </div>
                      </div>

                      {/* Messages History List */}
                      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0f172a' }}>
                        {currentThreadMessages.length === 0 ? (
                          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                            No messages in this guidance thread yet. Type a message or send guidance below!
                          </div>
                        ) : (
                          currentThreadMessages.map(msg => {
                            const isAdmin = msg.senderRole === 'admin';
                            return (
                              <div
                                key={msg.id}
                                style={{
                                  alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                                  maxWidth: '75%',
                                  backgroundColor: isAdmin ? '#2563eb' : 'rgba(30, 41, 59, 0.9)',
                                  color: '#fff',
                                  padding: '12px 16px',
                                  borderRadius: isAdmin ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                  border: isAdmin ? 'none' : '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {isAdmin ? <Shield size={12} /> : null} {msg.senderName} ({msg.timestamp})
                                </div>
                                <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                  {msg.text}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Input Footer */}
                      <form onSubmit={handleSendChatMessage} style={{ padding: '14px 18px', backgroundColor: '#1e293b', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Type official guidance or response to traveler..."
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                        />
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Send size={15} /> Send Guidance
                        </button>
                      </form>

                    </div>

                  </div>
                </div>
              )}

              {/* ── ADMIN TAB 2: TRIP APPROVALS & MODERATION ── */}
              {adminTab === 'approvals' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
                      Trip Moderation & Approvals ⚖️
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Trips only become visible to users once you approve them. Reject or delete any inappropriate trips immediately.
                    </p>
                  </div>

                  {/* Section A: Pending Approvals */}
                  <div style={{ marginBottom: '36px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#facc15', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} /> 1. Pending Approval Requests ({pendingApprovalTrips.length})
                    </h3>

                    {pendingApprovalTrips.length === 0 ? (
                      <div className="travel-card" style={{ padding: '30px', textAlign: 'center', color: '#10b981', fontSize: '13px' }}>
                        ✓ All trip submissions have been reviewed! No pending requests.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {pendingApprovalTrips.map(trip => (
                          <div key={trip.id} className="travel-card" style={{ padding: '18px', border: '1px solid #eab308' }}>
                            <div style={{ height: '120px', backgroundImage: `url(${trip.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', marginBottom: '12px', position: 'relative' }}>
                              <span style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 8px', backgroundColor: '#eab308', color: '#000', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                Awaiting Approval
                              </span>
                            </div>

                            <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '16px' }}>{trip.title}</h4>
                            <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px', fontWeight: '600' }}>📍 Destination: {trip.destination}</div>

                            <div style={{ fontSize: '12px', color: '#cbd5e1', margin: '10px 0', lineHeight: '1.5', padding: '10px', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: '8px' }}>
                              <div>Host: <b style={{ color: '#fff' }}>{trip.host}</b></div>
                              <div>Host Contact: <span style={{ color: '#38bdf8' }}>{trip.hostPhone || trip.hostEmail || 'Not provided'}</span></div>
                              <div>Estimated Budget: <b style={{ color: '#10b981' }}>${trip.budget}</b></div>
                              <div>Schedule: {trip.startDate} to {trip.endDate}</div>
                              <div>Max Group Size: {trip.maxMembers} persons</div>
                              {trip.isWomenOnly && <div style={{ color: '#ec4899', fontWeight: '700' }}>♀ Women-Only Trip</div>}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                              <button
                                onClick={() => handleAdminApproveTrip(trip.id, trip.title)}
                                style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              >
                                <Check size={16} /> Approve & Publish
                              </button>
                              <button
                                onClick={() => handleAdminRejectTrip(trip.id, trip.title)}
                                style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                              >
                                <X size={16} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section B: Live Approved Trips */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#38bdf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Compass size={18} /> 2. Live Approved Trips ({approvedLiveTrips.length})
                    </h3>

                    {approvedLiveTrips.length === 0 ? (
                      <div className="travel-card" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                        No approved trips live on the platform currently.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {approvedLiveTrips.map(trip => (
                          <div key={trip.id} className="travel-card" style={{ padding: '18px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div>
                                <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{trip.title}</h4>
                                <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>📍 {trip.destination}</div>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>${trip.budget}</span>
                            </div>

                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.4' }}>
                              Host: <b style={{ color: '#fff' }}>{trip.host}</b><br/>
                              Dates: {trip.startDate} to {trip.endDate}<br/>
                              Status: <span style={{ color: '#10b981', fontWeight: '700' }}>LIVE & APPROVED</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setSharingTrip(trip)}
                                className="btn-secondary"
                                style={{ flex: 1, padding: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                              >
                                <Share2 size={13} /> View / Share
                              </button>
                              <button
                                onClick={() => handleAdminDeleteTrip(trip.id, trip.title)}
                                style={{ padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={13} /> Delete Trip
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ── ADMIN TAB 3: USER GOVERNANCE ── */}
              {adminTab === 'users' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
                      User Governance & Control ({allUsers.length}) 👥
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Inspect traveler contact information, manage verification status, suspend problematic accounts, or delete users.
                    </p>
                  </div>

                  <div className="travel-card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                          <th style={{ padding: '12px 16px' }}>User Details</th>
                          <th style={{ padding: '12px 16px' }}>Contact & Emergency</th>
                          <th style={{ padding: '12px 16px' }}>Role</th>
                          <th style={{ padding: '12px 16px' }}>Status</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>Admin Controls</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map(u => (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {u.role === 'admin' || !u.photo ? (
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: u.role === 'admin' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Shield size={16} color="#fff" />
                                </div>
                              ) : (
                                <img src={u.photo} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
                              )}
                              <div>
                                <div style={{ fontWeight: '700', color: '#fff' }}>{u.name}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{u.homeCountry || 'Traveler'} • {u.style}</div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                              <div>Email: {u.email}</div>
                              <div style={{ color: '#38bdf8' }}>Phone: {u.phone || 'None'}</div>
                              {u.emergencyContactPhone && (
                                <div style={{ color: '#f87171', fontSize: '11px' }}>SOS: {u.emergencyContactName} ({u.emergencyContactPhone})</div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: u.role === 'admin' ? '#f87171' : '#60a5fa', borderRadius: '6px', fontWeight: '700' }}>
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ color: u.status === 'ACTIVE' ? '#10b981' : '#f87171', fontWeight: '700' }}>
                                {u.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {u.role !== 'admin' && (
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => {
                                      setSelectedChatUserId(u.id);
                                      setAdminTab('chat');
                                    }}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <MessageSquarePlus size={12} /> Chat Guidance
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserStatus(u.id)}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleUserVerified(u.id)}
                                    className="btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    {u.isVerified ? 'Unverify' : 'Verify'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    style={{ padding: '4px 8px', backgroundColor: 'rgba(239,68,68,0.2)', border: 'none', color: '#f87171', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── ADMIN TAB 4: EMERGENCY SOS CENTER ── */}
              {adminTab === 'sos' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#f87171' }}>
                      Emergency SOS Incident Center 🚨
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Active distress signals transmitted by travelers with live coordinates and contact info.
                    </p>
                  </div>

                  {sosAlerts.length === 0 ? (
                    <div className="travel-card" style={{ padding: '40px', color: '#10b981', fontSize: '14px', textAlign: 'center' }}>
                      ✓ Zero emergency distress signals. All travelers safe.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {sosAlerts.map(alert => (
                        <div key={alert.id} className="travel-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: alert.status === 'ACTIVE' ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '800', color: '#fff', fontSize: '15px' }}>{alert.userName}</span>
                              <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: alert.status === 'ACTIVE' ? '#ef4444' : '#10b981', color: '#fff', borderRadius: '6px', fontWeight: '800' }}>
                                {alert.status}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.4' }}>
                              📍 Location: <b>{alert.location}</b> • 📞 Phone: <b>{alert.phone}</b><br/>
                              🚨 Emergency Contact: <span style={{ color: '#f87171' }}>{alert.emergencyContact}</span>
                            </div>
                          </div>

                          {alert.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleResolveSos(alert.id)}
                              className="btn-primary"
                              style={{ padding: '10px 18px', fontSize: '12px', cursor: 'pointer' }}
                            >
                              Mark Resolved
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── ADMIN TAB 5: CONTENT MODERATION ── */}
              {adminTab === 'content' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
                      Community Content Moderation 💬 ({posts.length})
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Review public feed posts and delete inappropriate content.
                    </p>
                  </div>

                  {posts.length === 0 ? (
                    <div className="travel-card" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No community posts to moderate.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                      {posts.map(post => (
                        <div key={post.id} className="travel-card" style={{ overflow: 'hidden' }}>
                          <img src={post.image} alt="Post" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                          <div style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>{post.author}</span>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{post.location}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '12px' }}>{post.caption}</p>
                            
                            <button
                              onClick={() => handleAdminDeletePost(post.id)}
                              style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#f87171', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                              <Trash2 size={13} /> Delete Inappropriate Post
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* 👤 TRAVELER WORKSPACE                                                     */}
          {/* ========================================================================= */}
          {currentUser.role !== 'admin' && (
            <div>
              
              {/* ==================== MODULE: TRAVELER CHAT WITH ADMIN ==================== */}
              {userTab === 'chat' && (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MessageSquarePlus size={24} color="#3b82f6" /> Chat with Admin & Activity Guidance 💬
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Get direct guidance, activity safety tips, trip approval status updates, and support from the System Admin.
                    </p>
                  </div>

                  <div className="travel-card" style={{ height: '560px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* Chat Header */}
                    <div style={{ padding: '16px 20px', backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={20} color="#fff" />
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          Official Admin Support Console <CheckCircle2 size={16} color="#10b981" />
                        </div>
                        <div style={{ fontSize: '12px', color: '#38bdf8' }}>
                          Online • Guiding your travel safety & trip activities
                        </div>
                      </div>
                    </div>

                    {/* Messages Container */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0f172a' }}>
                      {currentThreadMessages.length === 0 ? (
                        <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '13px', maxWidth: '400px' }}>
                          <Shield size={40} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                          <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Welcome to Admin Guidance!</h4>
                          <p style={{ color: '#94a3b8' }}>Have questions about your trip, safety rules, or platform verification? Send a message to the Admin below!</p>
                        </div>
                      ) : (
                        currentThreadMessages.map(msg => {
                          const isUser = msg.senderRole !== 'admin';
                          return (
                            <div
                              key={msg.id}
                              style={{
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                backgroundColor: isUser ? '#2563eb' : 'rgba(30, 41, 59, 0.9)',
                                color: '#fff',
                                padding: '12px 16px',
                                borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)'
                              }}
                            >
                              <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {!isUser ? <Shield size={12} color="#f87171" /> : null} {msg.senderName} ({msg.timestamp})
                              </div>
                              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                                {msg.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendChatMessage} style={{ padding: '14px 18px', backgroundColor: '#1e293b', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Ask Admin for trip guidance, approval help, or safety tips..."
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      />
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Send size={15} /> Send
                      </button>
                    </form>

                  </div>
                </div>
              )}

              {/* ==================== MODULE 1: EXPLORE APPROVED TRIPS ==================== */}
              {userTab === 'explore' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>
                        Discover Real Trips ✈️
                      </h2>
                      <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                        Browse verified, admin-approved trips hosted by travelers, join squads, or share trips!
                      </p>
                    </div>

                    <button
                      onClick={() => setShowCreateTripModal(true)}
                      className="btn-primary"
                      style={{
                        padding: '12px 20px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Plus size={18} /> Host a New Trip
                    </button>
                  </div>

                  {/* My Pending Trips Notice Banner */}
                  {myPendingTrips.length > 0 && (
                    <div style={{ marginBottom: '20px', padding: '14px 18px', backgroundColor: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} color="#facc15" />
                        <div>
                          <div style={{ fontWeight: '700', color: '#facc15', fontSize: '13px' }}>
                            You have {myPendingTrips.length} trip(s) pending Admin review
                          </div>
                          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                            Your trip: "{myPendingTrips[0].title}" has been sent to the Admin. It will appear here once approved.
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', padding: '3px 8px', backgroundColor: '#eab308', color: '#000', borderRadius: '6px', fontWeight: '800' }}>
                        Pending Approval
                      </span>
                    </div>
                  )}

                  {/* Search Bar & Filter */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        placeholder="Search trips by destination or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 42px',
                          backgroundColor: 'rgba(30, 41, 59, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '13px'
                        }}
                      />
                      <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    </div>

                    <button
                      onClick={() => setWomenOnlyMode(!womenOnlyMode)}
                      style={{
                        padding: '0 16px',
                        backgroundColor: womenOnlyMode ? '#ec4899' : 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      ♀ Women Only: {womenOnlyMode ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Approved Trips Grid */}
                  {publicApprovedTrips.length === 0 ? (
                    <div className="travel-card" style={{ padding: '60px 24px', textAlign: 'center' }}>
                      <Compass size={48} color="#3b82f6" style={{ margin: '0 auto 16px' }} />
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                        No approved trips available right now
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                        {pendingApprovalTrips.length > 0 
                          ? 'New trips have been submitted and are awaiting Admin approval.'
                          : 'Be the first traveler to host a real trip! It will be reviewed by Admin and published.'}
                      </p>
                      <button
                        onClick={() => setShowCreateTripModal(true)}
                        className="btn-primary"
                        style={{ padding: '10px 24px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        + Host a Trip
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                      {publicApprovedTrips.map(trip => (
                        <div key={trip.id} className="travel-card" style={{ overflow: 'hidden' }}>
                          <div style={{ height: '180px', backgroundImage: `url(${trip.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '14px' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.85))' }}></div>
                            
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              {trip.isWomenOnly ? (
                                <span style={{ padding: '4px 10px', backgroundColor: '#ec4899', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                  ♀ Women Only
                                </span>
                              ) : <div></div>}

                              {/* Share Button on Card */}
                              <button
                                onClick={() => setSharingTrip(trip)}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                                  backdropFilter: 'blur(8px)',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  color: '#fff',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Share2 size={14} color="#38bdf8" /> Share
                              </button>
                            </div>

                            <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                              <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} /> {trip.destination}
                              </div>
                              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
                                {trip.title}
                              </h3>
                            </div>
                          </div>

                          <div style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '13px' }}>
                              <div>
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Est. Budget</span>
                                <div style={{ fontWeight: '800', color: '#10b981', fontSize: '16px' }}>${trip.budget}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span style={{ color: '#94a3b8', fontSize: '11px' }}>Host</span>
                                <div style={{ fontWeight: '700', color: '#fff' }}>{trip.host}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => triggerToast(`🎉 Join request sent for "${trip.title}"`)}
                                className="btn-primary"
                                style={{ flex: 1, padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                              >
                                Join Trip
                              </button>
                              <button
                                onClick={() => setSharingTrip(trip)}
                                className="btn-secondary"
                                style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Share2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== MODULE 2: BUDDY MATCHER ==================== */}
              {userTab === 'match' && (
                <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      Find Travel Buddies 🤝
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Connect with other registered travelers in the database.
                    </p>
                  </div>

                  {activeCandidate ? (
                    <div className="travel-card" style={{ overflow: 'hidden' }}>
                      <div style={{
                        height: '380px',
                        backgroundImage: `url(${activeCandidate.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '20px'
                      }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.95) 20%, transparent 70%)' }}></div>

                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end' }}>
                          <span style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>
                            ⚡ 98% Match
                          </span>
                        </div>

                        <div style={{ position: 'relative', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                              {activeCandidate.name}, {activeCandidate.age}
                            </h3>
                            {activeCandidate.isVerified && <CheckCircle2 size={18} color="#10b981" />}
                          </div>

                          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} /> From: {activeCandidate.homeCountry || 'Global'} • Style: {activeCandidate.style}
                          </div>

                          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '8px', lineHeight: '1.5' }}>
                            "{activeCandidate.bio}"
                          </p>
                        </div>
                      </div>

                      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        <button
                          onClick={() => setCurrentMatchIndex(currentMatchIndex + 1)}
                          className="btn-secondary"
                          style={{ padding: '10px 24px', fontSize: '13px', cursor: 'pointer' }}
                        >
                          Next Profile
                        </button>

                        <button
                          onClick={() => {
                            triggerToast(`💖 Match request sent to ${activeCandidate.name}!`);
                            setCurrentMatchIndex(currentMatchIndex + 1);
                          }}
                          className="btn-primary"
                          style={{ padding: '12px 28px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Heart size={16} fill="#fff" /> Connect as Buddy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="travel-card" style={{ padding: '48px 24px' }}>
                      <Users size={40} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>
                        No other travelers registered yet
                      </h3>
                      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '18px' }}>
                        When new travelers register, their profiles will appear here for matching!
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        + Register a New Traveler
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== MODULE 3: TRIP ITINERARY ==================== */}
              {userTab === 'planner' && (
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      Trip Itinerary & Daily Plans 🗺️
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Plan activities together and vote on favorite spots.
                    </p>
                  </div>

                  {/* Add Activity Form */}
                  <form onSubmit={handleAddActivity} className="travel-card" style={{ padding: '18px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Time (09:00 AM)"
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                      style={{ width: '150px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    />
                    <input
                      type="text"
                      placeholder="Activity title & details"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                      style={{ flex: 1, minWidth: '220px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      + Add Activity
                    </button>
                  </form>

                  {/* Itinerary List */}
                  {itinerary.length === 0 ? (
                    <div className="travel-card" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No activities in the itinerary yet. Add your first planned activity above!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {itinerary.map((item) => (
                        <div key={item._id || item.id} className="travel-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ padding: '6px 10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8', borderRadius: '8px', fontWeight: '700', fontSize: '12px' }}>
                              {item.time}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{item.title}</h4>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              try {
                                await api.upvoteItineraryItem(item._id || item.id);
                                reloadData();
                              } catch (err) { alert(err.message); }
                            }}
                            className="btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <ThumbsUp size={14} /> {item.votes} Votes
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== MODULE 4: EXPENSE SPLITTER ==================== */}
              {userTab === 'expense' && (
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      Trip Expense Splitter 💳
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Keep track of shared costs and transparent group balances.
                    </p>
                  </div>

                  <div className="travel-card" style={{ padding: '24px', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(59,130,246,0.15))' }}>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Shared Expenditures</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '4px 0 0' }}>
                      ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                    </div>
                  </div>

                  <form onSubmit={handleAddExpense} className="travel-card" style={{ padding: '18px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Expense description"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                      style={{ flex: 1, minWidth: '200px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      style={{ width: '130px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                      required
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ padding: '10px 18px', fontSize: '13px', cursor: 'pointer' }}
                    >
                      + Add Expense
                    </button>
                  </form>

                  {expenses.length === 0 ? (
                    <div className="travel-card" style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No shared expenses recorded yet. Log an expense above!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {expenses.map(exp => (
                        <div key={exp.id} className="travel-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{exp.title}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Paid by: {exp.paidBy}</div>
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                            ${exp.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== MODULE 5: TRAVEL FEED ==================== */}
              {userTab === 'social' && (
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      Travel Community Feed 📸
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Share photos, travel highlights, and discoveries with fellow travelers.
                    </p>
                  </div>

                  {/* Share Post Form */}
                  <form onSubmit={handleCreatePost} className="travel-card" style={{ padding: '18px', marginBottom: '24px' }}>
                    <textarea
                      placeholder="Share your travel moments or ask for recommendations..."
                      value={newPostCaption}
                      onChange={(e) => setNewPostCaption(e.target.value)}
                      style={{ width: '100%', height: '70px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px', resize: 'none' }}
                      required
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Optional image URL"
                        value={newPostImage}
                        onChange={(e) => setNewPostImage(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                      />
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '8px 20px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Share Post
                      </button>
                    </div>
                  </form>

                  {/* Posts */}
                  {posts.length === 0 ? (
                    <div className="travel-card" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No posts shared yet. Be the first to share a travel update!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {posts.map(post => (
                        <div key={post.id} className="travel-card" style={{ overflow: 'hidden' }}>
                          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {post.avatar ? (
                                <img src={post.avatar} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Users size={18} color="#fff" />
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{post.author}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{post.location}</div>
                              </div>
                            </div>
                          </div>

                          <img src={post.image} alt="Post" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />

                          <div style={{ padding: '16px 18px' }}>
                            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.5' }}>{post.caption}</p>
                            
                            <div style={{ display: 'flex', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    await api.likePost(post._id || post.id);
                                    reloadData();
                                  } catch (err) { alert(err.message); }
                                }}
                                style={{ background: 'none', border: 'none', color: post.isLiked ? '#ef4444' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '13px' }}
                              >
                                <Heart size={16} fill={post.isLiked ? '#ef4444' : 'none'} /> {post.likes} Likes
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== MODULE 6: SAFETY & SUPPORT ==================== */}
              {userTab === 'safety' && (
                <div style={{ maxWidth: '750px', margin: '0 auto' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>
                      Safety & Emergency Support 🛡️
                    </h2>
                    <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                      Verified traveler security, emergency hotlines, and one-touch assistance.
                    </p>
                  </div>

                  <div className="travel-card" style={{ padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <ShieldCheck size={40} color="#10b981" />
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                        Identity Verification: {currentUser.isVerified ? 'Verified Account' : 'Pending Verification'}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                        Your emergency contact and phone details are securely registered with support.
                      </p>
                    </div>
                  </div>

                  <div className="travel-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f87171', marginBottom: '6px' }}>
                      One-Touch Emergency SOS
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      In case of an emergency, pressing this button sends your live GPS coordinates directly to the Admin Incident Center.
                    </p>
                    <button
                      onClick={handleTriggerSos}
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShieldAlert size={18} /> Send Emergency SOS Signal
                    </button>
                  </div>

                  <div className="travel-card" style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>
                      24/7 Emergency Hotlines
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
                      <div>📞 Global Helpline: +1 (800) 555-0199</div>
                      <div>🚨 Police & Emergency: 119 / 911</div>
                      <div>🚑 Medical Ambulance: 1990 / 112</div>
                      <div>💬 Support Coordinator: Active</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== MODULE 7: MY FULL PROFILE ==================== */}
              {userTab === 'profile' && (
                <div style={{ maxWidth: '720px', margin: '0 auto' }}>
                  <div className="travel-card" style={{ padding: '36px 28px', textAlign: 'center' }}>
                    
                    {/* Profile Photo / Avatar */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                      {!currentUser.photo ? (
                        <div style={{ width: '96px', height: '96px', borderRadius: '24px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                          <Users size={44} color="#fff" />
                        </div>
                      ) : (
                        <img src={currentUser.photo} alt="User" style={{ width: '96px', height: '96px', borderRadius: '24px', objectFit: 'cover', border: '3px solid #3b82f6' }} />
                      )}

                      <span style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', padding: '2px 8px', backgroundColor: currentUser.isVerified ? '#10b981' : '#64748b', color: '#fff', borderRadius: '6px', fontSize: '10px', fontWeight: '700' }}>
                        VERIFIED TRAVELER
                      </span>
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                      {currentUser.name}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600', marginTop: '2px' }}>
                      {currentUser.email} • {currentUser.homeCountry || 'Global Citizen'}
                    </div>

                    <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '12px', lineHeight: '1.5', maxWidth: '520px', margin: '12px auto 0' }}>
                      "{currentUser.bio}"
                    </p>

                    {/* Detailed Information Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '20px', textAlign: 'left' }}>
                      <div style={{ padding: '12px', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>📱 Phone Number</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>{currentUser.phone || 'Not added'}</div>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>📸 Instagram / Social</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8', marginTop: '2px' }}>{currentUser.instagramHandle || 'Not added'}</div>
                      </div>
                      <div style={{ padding: '12px', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>🚨 Emergency Contact</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#f87171', marginTop: '2px' }}>{currentUser.emergencyContactPhone || 'Not added'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', borderRadius: '8px', fontSize: '12px', color: '#60a5fa', fontWeight: '600' }}>
                        Style: {currentUser.style}
                      </span>
                      <span style={{ padding: '6px 12px', backgroundColor: 'rgba(249, 115, 22, 0.15)', borderRadius: '8px', fontSize: '12px', color: '#fb923c', fontWeight: '600' }}>
                        Budget: {currentUser.budgetTier}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowProfileEditModal(true)}
                      className="btn-primary"
                      style={{
                        marginTop: '24px',
                        padding: '10px 28px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Edit3 size={15} /> Edit All Personal Details
                    </button>

                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ══════════════════ SOCIAL SHARE TRIP MODAL (FB, IG, WHATSAPP, COPY LINK) ══════════════════ */}
      {sharingTrip && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="travel-card" style={{ padding: '28px', width: '500px', backgroundColor: '#1e293b' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} color="#3b82f6" /> Share Trip to Social Media
              </h3>
              <button onClick={() => setSharingTrip(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Trip Preview Card */}
            <div style={{ display: 'flex', gap: '14px', padding: '14px', backgroundColor: '#0f172a', borderRadius: '12px', marginBottom: '20px' }}>
              <img src={sharingTrip.cover} alt="Cover" style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{sharingTrip.title}</h4>
                <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>📍 {sharingTrip.destination}</div>
                <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
                  Budget: ${sharingTrip.budget} • Host: {sharingTrip.host}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              Select where you would like to share this trip:
            </p>

            {/* Share Platform Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              
              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🌴 Join my trip to ${sharingTrip.destination}: "${sharingTrip.title}" ($${sharingTrip.budget} budget). Check it out on TravelBuddy: ${window.location.origin}/trips/${sharingTrip.id}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px',
                  backgroundColor: '#25D366',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MessageCircle size={18} /> WhatsApp
              </a>

              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(`Check out this trip to ${sharingTrip.destination} on TravelBuddy!`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '12px',
                  backgroundColor: '#1877F2',
                  color: '#fff',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Facebook size={18} /> Facebook
              </a>

              {/* Instagram Story / Reel Copy Prompt */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`✈️ Traveling to ${sharingTrip.destination}! Join our squad on TravelBuddy: "${sharingTrip.title}" ($${sharingTrip.budget}) #TravelBuddy #TravelSquad`);
                  triggerToast('📸 Instagram caption & story text copied to clipboard!');
                }}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Instagram size={18} /> Copy for Instagram
              </button>

              {/* Native Mobile Share */}
              <button
                type="button"
                onClick={() => handleNativeShare(sharingTrip)}
                className="btn-primary"
                style={{
                  padding: '12px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Share2 size={18} /> More Apps...
              </button>

            </div>

            {/* Copy Shareable Link Input */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: '700' }}>DIRECT SHAREABLE LINK</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/trips/${sharingTrip.id}`}
                  style={{ flex: 1, padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => handleCopyTripLink(sharingTrip)}
                  className="btn-primary"
                  style={{ padding: '10px 16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════ USER EDIT FULL PROFILE MODAL ══════════════════ */}
      {showProfileEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="travel-card" style={{ padding: '28px', width: '560px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1e293b' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Edit All Personal Details
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Fill in your contact, emergency, and travel preferences</p>
              </div>
              <button onClick={() => setShowProfileEditModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={profileForm.phone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Home Country / City</label>
                  <input
                    type="text"
                    placeholder="Country / City"
                    value={profileForm.homeCountry || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, homeCountry: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Instagram / Social Handle</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={profileForm.instagramHandle || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, instagramHandle: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', marginBottom: '8px' }}>
                  🚨 Emergency Contact Information:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Contact Person Name"
                    value={profileForm.emergencyContactName || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactName: e.target.value })}
                    style={{ padding: '8px 10px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <input
                    type="text"
                    placeholder="Contact Person Phone"
                    value={profileForm.emergencyContactPhone || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, emergencyContactPhone: e.target.value })}
                    style={{ padding: '8px 10px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Avatar Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={profileForm.photo || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>About Me / Travel Bio</label>
                <textarea
                  value={profileForm.bio || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  style={{ width: '100%', height: '60px', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Travel Style</label>
                  <input
                    type="text"
                    value={profileForm.style || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, style: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Budget Preference</label>
                  <input
                    type="text"
                    value={profileForm.budgetTier || ''}
                    onChange={(e) => setProfileForm({ ...profileForm, budgetTier: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileEditModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Save All Details
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ══════════════════ AUTH & LOGIN MODAL ══════════════════ */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="travel-card" style={{ padding: '32px', width: '460px', backgroundColor: '#1e293b' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  {authMode === 'login' ? 'Sign In' : 'Create Traveler Account'}
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {authMode === 'login' ? 'Enter admin or traveler credentials' : 'Register a real traveler account'}
                </p>
              </div>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>



            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (WhatsApp)"
                    value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                    style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                  />
                </>
              )}

              <input
                type="text"
                placeholder={authMode === 'login' ? "Email or username (e.g. admin)" : "Email address"}
                value={authMode === 'login' ? authForm.emailOrCallsign : authForm.email}
                onChange={(e) => authMode === 'login' ? setAuthForm({ ...authForm, emailOrCallsign: e.target.value }) : setAuthForm({ ...authForm, email: e.target.value })}
                style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                required
              />

              <button
                type="submit"
                className="btn-primary"
                style={{ marginTop: '8px', padding: '12px', fontSize: '13px', cursor: 'pointer' }}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
              >
                {authMode === 'login' ? "New traveler? Create an account" : "Already registered? Sign In"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════ USER HOST A TRIP MODAL ══════════════════ */}
      {showCreateTripModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="travel-card" style={{ padding: '28px', width: '480px', backgroundColor: '#1e293b' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                  Host a New Trip 🌴
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Submitted trips will be reviewed and approved by Admin before appearing publicly.
                </p>
              </div>
              <button onClick={() => setShowCreateTripModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Trip Title"
                value={newTripForm.title}
                onChange={(e) => setNewTripForm({...newTripForm, title: e.target.value})}
                style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                required
              />
              <input
                type="text"
                placeholder="Destination"
                value={newTripForm.destination}
                onChange={(e) => setNewTripForm({...newTripForm, destination: e.target.value})}
                style={{ padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                required
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Budget ($ or LKR)</label>
                  <input
                    type="number"
                    placeholder="Estimated budget"
                    value={newTripForm.budget}
                    onChange={(e) => setNewTripForm({...newTripForm, budget: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Max Travelers</label>
                  <input
                    type="number"
                    placeholder="Max members"
                    value={newTripForm.maxMembers}
                    onChange={(e) => setNewTripForm({...newTripForm, maxMembers: e.target.value})}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>Trip Cover Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newTripForm.cover}
                  onChange={(e) => setNewTripForm({...newTripForm, cover: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newTripForm.isWomenOnly}
                  onChange={(e) => setNewTripForm({...newTripForm, isWomenOnly: e.target.checked})}
                />
                Women-Only Trip
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTripModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', fontSize: '13px', cursor: 'pointer' }}
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
