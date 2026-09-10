import React, { useState, useEffect } from 'react';
import { 
  Flame, ShieldAlert, Heart, MapPin, Calendar, DollarSign, 
  Users, CheckCircle2, Search, Filter, UserCheck, MessageSquare, 
  Plus, ThumbsUp, Send, Bell, Settings, Star, Compass, Award, 
  AlertTriangle, Radio, Zap, Crosshair, Skull, Activity, Lock, 
  ChevronRight, Terminal, Globe, Share2, Eye, ShieldCheck, Cpu,
  LogOut, UserPlus, Shield, UserX, Trash2, Edit3, Check, X,
  FileText, Sliders, RefreshCw
} from 'lucide-react';
import { Database } from './services/database';

export default function App() {
  // Database Initial Load
  const [currentUser, setCurrentUser] = useState(Database.getSession());
  const [activeTab, setActiveTab] = useState('explore'); // explore | match | planner | expense | social | safety | profile | admin
  const [womenOnlyMode, setWomenOnlyMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sosActive, setSosActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Real Database Collections
  const [allUsers, setAllUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sosAlerts, setSosAlerts] = useState([]);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);

  // Forms
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ emailOrCallsign: '', password: '', name: '', callsign: '', email: '', style: 'Extreme Adventure' });
  const [profileForm, setProfileForm] = useState({ ...currentUser });
  const [newTripForm, setNewTripForm] = useState({ title: '', destination: '', budget: '', risk: 'HIGH', isWomenOnly: false });
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', paidBy: currentUser.name, category: 'Basecamp' });
  const [newActivity, setNewActivity] = useState({ time: '06:00 HRS', title: '', cost: '', risk: 'MODERATE' });
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImage, setNewPostImage] = useState('');

  // Match Index
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Reload all data from local real Database
  const reloadData = () => {
    Database.init();
    const session = Database.getSession();
    setCurrentUser(session);
    setProfileForm({ ...session });
    setAllUsers(Database.getUsers());
    setTrips(Database.getTrips());
    setExpenses(Database.getExpenses());
    setItinerary(Database.getItinerary());
    setPosts(Database.getPosts());
    setSosAlerts(Database.getSosAlerts());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // ─── AUTH HANDLERS ───
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        const user = Database.login(authForm.emailOrCallsign, authForm.password);
        setCurrentUser(user);
        setProfileForm({ ...user });
        setShowAuthModal(false);
        triggerToast(`⚡ AUTHENTICATION CONFIRMED: WELCOME ${user.callsign}`);
        if (user.role === 'admin') setActiveTab('admin');
      } else {
        if (!authForm.name || !authForm.email) throw new Error('PLEASE FILL IN ALL REQUIRED FIELDS');
        const newUser = Database.register(authForm);
        setCurrentUser(newUser);
        setProfileForm({ ...newUser });
        setShowAuthModal(false);
        triggerToast(`🎉 ENLISTMENT COMPLETE: OPERATIVE ${newUser.callsign} REGISTERED`);
      }
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleQuickLogin = (role) => {
    const users = Database.getUsers();
    const targetUser = role === 'admin' 
      ? users.find(u => u.role === 'admin') 
      : users.find(u => u.role === 'user' && u.id === 'usr_sarah');
    if (targetUser) {
      Database.setSession(targetUser);
      setCurrentUser(targetUser);
      setProfileForm({ ...targetUser });
      setShowAuthModal(false);
      triggerToast(`⚡ SWITCHED SESSION TO: ${targetUser.callsign} (${targetUser.role.toUpperCase()})`);
      if (targetUser.role === 'admin') setActiveTab('admin');
      else if (activeTab === 'admin') setActiveTab('explore');
      reloadData();
    }
  };

  const handleLogout = () => {
    const users = Database.getUsers();
    const fallbackUser = users.find(u => u.id === 'usr_sarah') || users[0];
    Database.setSession(fallbackUser);
    setCurrentUser(fallbackUser);
    setProfileForm({ ...fallbackUser });
    triggerToast('LOGGED OUT. RETURNED TO OPERATIVE DEMO SESSION.');
    if (activeTab === 'admin') setActiveTab('explore');
    reloadData();
  };

  // ─── PROFILE UPDATE HANDLER ───
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    Database.updateUser(currentUser.id, profileForm);
    setCurrentUser({ ...currentUser, ...profileForm });
    setShowProfileEditModal(false);
    triggerToast('✅ NOMAD PASSPORT PROFILE UPDATED SUCCESSFULLY IN DATABASE!');
    reloadData();
  };

  // ─── ADMIN ACTIONS ───
  const handleToggleUserStatus = (userId) => {
    Database.toggleUserStatus(userId);
    triggerToast('⚡ OPERATIVE STATUS TOGGLED IN DATABASE');
    reloadData();
  };

  const handleToggleUserVerified = (userId) => {
    Database.toggleUserVerified(userId);
    triggerToast('🛡️ BIOMETRIC VERIFICATION STATUS MODIFIED');
    reloadData();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('ARE YOU SURE YOU WANT TO PERMANENTLY TERMINATE THIS OPERATIVE ACCOUNT?')) {
      Database.deleteUser(userId);
      triggerToast('🗑️ OPERATIVE RECORD PURGED FROM DATABASE');
      reloadData();
    }
  };

  const handleDeleteTrip = (tripId) => {
    if (window.confirm('ABORT & DELETE THIS EXPEDITION MISSION?')) {
      Database.deleteTrip(tripId);
      triggerToast('🗑️ EXPEDITION PURGED FROM RADAR NETWORK');
      reloadData();
    }
  };

  const handleResolveSos = (alertId) => {
    Database.resolveSos(alertId);
    triggerToast('🚁 SEARCH & RESCUE SQUAD DISPATCHED! SOS SIGNAL MARKED AS RESOLVED.');
    reloadData();
  };

  // ─── USER TRIP / EXPENSE / ITINERARY ACTIONS ───
  const handleCreateTrip = (e) => {
    e.preventDefault();
    if (!newTripForm.title || !newTripForm.destination) return;
    const newTrip = {
      id: 'trip_' + Date.now(),
      title: `OPERATION: ${newTripForm.title.toUpperCase()}`,
      destination: newTripForm.destination,
      startDate: '2026-09-15',
      endDate: '2026-09-22',
      budget: parseFloat(newTripForm.budget || 500),
      maxMembers: 4,
      currentMembers: 1,
      risk: newTripForm.risk,
      category: 'EXTREME EXPEDITION',
      isWomenOnly: newTripForm.isWomenOnly,
      cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      host: currentUser.name,
      hostId: currentUser.id,
      status: 'OPEN'
    };
    Database.saveTrip(newTrip);
    setShowCreateTripModal(false);
    setNewTripForm({ title: '', destination: '', budget: '', risk: 'HIGH', isWomenOnly: false });
    triggerToast('🚀 NEW EXPEDITION RECORDED IN DATABASE!');
    reloadData();
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    const item = { 
      id: 'exp_' + Date.now(), 
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      paidBy: currentUser.name,
      paidById: currentUser.id,
      category: newExpense.category 
    };
    Database.addExpense(item);
    setNewExpense({ title: '', amount: '', paidBy: currentUser.name, category: 'Basecamp' });
    triggerToast('⚡ EXPENDITURE LOGGED TO SQUAD DATABASE');
    reloadData();
  };

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title) return;
    const item = { 
      id: 'itn_' + Date.now(), 
      time: newActivity.time, 
      title: newActivity.title, 
      cost: parseFloat(newActivity.cost || 0), 
      votes: 1, 
      risk: newActivity.risk 
    };
    Database.addItineraryItem(item);
    setNewActivity({ time: '06:00 HRS', title: '', cost: '', risk: 'MODERATE' });
    triggerToast('🎯 MISSION OBJECTIVE SAVED TO ITINERARY');
    reloadData();
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostCaption) return;
    const post = {
      id: 'post_' + Date.now(),
      author: currentUser.name,
      authorId: currentUser.id,
      callsign: currentUser.callsign,
      avatar: currentUser.photo,
      location: 'FIELD DEPLOYMENT // GLOBAL',
      image: newPostImage || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      caption: newPostCaption,
      likes: 1,
      comments: 0,
      isLiked: true,
      threatLevel: 'TACTICAL DISPATCH'
    };
    Database.addPost(post);
    setNewPostCaption('');
    setNewPostImage('');
    triggerToast('📡 TRANSMISSION PUBLISHED TO SOCIAL FEED');
    reloadData();
  };

  const handleTriggerSos = () => {
    setSosActive(true);
    Database.triggerSos({
      userId: currentUser.id,
      userName: currentUser.name,
      callsign: currentUser.callsign,
      coordinates: 'LAT: 8.3405° S // LON: 115.0920° E',
      location: 'Live GPS Coordinates Beacon',
      severity: 'EXTREME DISTRESS',
      details: 'Satellite Distress Beacon triggered by operative from mobile device.'
    });
    triggerToast('🚨 SOS DISTRESS SIGNAL BROADCASTED & LOGGED IN ADMIN OVERWATCH!');
    reloadData();
  };

  // Candidates for Matching (Users excluding current user)
  const otherUsers = allUsers.filter(u => u.id !== currentUser.id && u.role !== 'admin');
  const activeCandidate = otherUsers[currentMatchIndex % (otherUsers.length || 1)];

  // Filtered Trips
  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.destination.toLowerCase().includes(searchQuery.toLowerCase()) || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWomenOnly = womenOnlyMode ? t.isWomenOnly : true;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesWomenOnly && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#05070e', color: '#f1f5f9' }}>
      
      {/* ══════════════════ TACTICAL TOP NAVIGATION ══════════════════ */}
      <header style={{
        backgroundColor: 'rgba(8, 12, 22, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 19, 85, 0.25)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 19, 85, 0.4)',
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#ff1355',
            borderRadius: '10px',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px #ff1355'
          }}>
            <Flame size={26} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="font-orbitron" style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', letterSpacing: '2px', textShadow: '0 0 12px rgba(255, 19, 85, 0.6)' }}>
                APEX <span style={{ color: '#ff1355' }}>//</span> TRAVEL BUDDY
              </h1>
              <span className="font-mono-hud" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: currentUser.role === 'admin' ? 'rgba(255, 19, 85, 0.2)' : 'rgba(255, 107, 0, 0.2)', border: `1px solid ${currentUser.role === 'admin' ? '#ff1355' : '#ff6b00'}`, color: currentUser.role === 'admin' ? '#ff1355' : '#ff8c00', borderRadius: '4px', fontWeight: '700' }}>
                {currentUser.role === 'admin' ? 'ADMIN OVERWATCH' : 'OPERATIVE MODE'}
              </span>
            </div>
            <div className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '12px', marginTop: '2px' }}>
              <span>LAT: 8.34°S // LON: 115.09°E</span>
              <span style={{ color: '#10e599' }}>● SYSTEM LIVE</span>
            </div>
          </div>
        </div>

        {/* Right: Telemetry, SOS & User/Admin Account Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Emergency SOS Button */}
          <button
            onClick={handleTriggerSos}
            className="tactical-btn font-orbitron"
            style={{
              padding: '9px 18px',
              backgroundColor: sosActive ? '#ff1355' : 'rgba(255, 19, 85, 0.15)',
              border: `1px solid ${sosActive ? '#ff1355' : 'rgba(255, 19, 85, 0.6)'}`,
              color: '#ffffff',
              fontWeight: '900',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: sosActive ? '0 0 30px #ff1355' : '0 0 15px rgba(255, 19, 85, 0.3)'
            }}
          >
            <ShieldAlert size={18} color="#ff1355" />
            {sosActive ? 'BEACON TRANSMITTING' : 'EMERGENCY SOS'}
          </button>

          {/* User Account / Admin Badge Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            padding: '6px 14px',
            border: `1px solid ${currentUser.role === 'admin' ? '#ff1355' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '8px'
          }}>
            <img src={currentUser.photo} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: `2px solid ${currentUser.role === 'admin' ? '#ff1355' : '#ff8c00'}` }} />
            <div style={{ textAlign: 'left' }}>
              <div className="font-orbitron" style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                {currentUser.callsign}
              </div>
              <div className="font-mono-hud" style={{ fontSize: '10px', color: currentUser.role === 'admin' ? '#ff1355' : '#10e599', fontWeight: '800' }}>
                {currentUser.role === 'admin' ? '🛡️ SUPREME ADMIN' : `★ ${currentUser.trustScore} VERIFIED`}
              </div>
            </div>

            {/* Auth / Switch Button */}
            <button
              onClick={() => setShowAuthModal(true)}
              className="tactical-btn font-mono-hud"
              style={{
                marginLeft: '8px',
                padding: '6px 10px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              SWITCH / LOGIN
            </button>
          </div>

        </div>
      </header>

      {/* ══════════════════ HUD TOAST NOTIFICATION ══════════════════ */}
      {toastMessage && (
        <div className="font-orbitron" style={{
          position: 'fixed',
          top: '90px',
          right: '28px',
          backgroundColor: '#ff1355',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '8px',
          fontWeight: '900',
          fontSize: '13px',
          boxShadow: '0 0 35px rgba(255, 19, 85, 0.7), 0 10px 25px rgba(0,0,0,0.8)',
          border: '1px solid #ffffff',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          letterSpacing: '1px'
        }}>
          <Zap size={18} fill="#ffffff" />
          {toastMessage}
        </div>
      )}

      {/* ══════════════════ MAIN WORKSPACE LAYOUT ══════════════════ */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
        
        {/* ─── TACTICAL SIDEBAR NAVIGATION ─── */}
        <aside style={{
          width: '270px',
          backgroundColor: 'rgba(8, 12, 22, 0.85)',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '28px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          
          <div className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b', padding: '0 12px 10px', letterSpacing: '2px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '8px' }}>
            COMMAND NAVIGATION
          </div>

          {/* Admin Command Dashboard Tab (Only for Admin) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="tactical-btn font-orbitron"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: activeTab === 'admin' ? '#ff1355' : 'rgba(255, 19, 85, 0.15)',
                border: '1px solid #ff1355',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '12px',
                cursor: 'pointer',
                letterSpacing: '1px',
                boxShadow: activeTab === 'admin' ? '0 0 25px #ff1355' : 'none',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Shield size={18} color="#fff" />
                <span>ADMIN OVERWATCH</span>
              </div>
              <span className="font-mono-hud" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#000', color: '#ff1355', borderRadius: '3px', fontWeight: '900' }}>
                MASTER
              </span>
            </button>
          )}

          {[
            { id: 'explore', label: 'RADAR EXPEDITIONS', icon: Crosshair, badge: `${trips.length} LIVE` },
            { id: 'match', label: 'BUDDY MATCH ENGINE', icon: Zap, badge: `${otherUsers.length} FOUND` },
            { id: 'planner', label: 'WAR ROOM ITINERARY', icon: Calendar, badge: `${itinerary.length} GOALS` },
            { id: 'expense', label: 'WAR CHEST LEDGER', icon: DollarSign, badge: `$${expenses.reduce((a,c)=>a+c.amount,0)}` },
            { id: 'social', label: 'COMMUNICATIONS FEED', icon: Radio, badge: `${posts.length} OPS` },
            { id: 'safety', label: 'DEFENSE & SHIELD HUB', icon: ShieldCheck, badge: 'SECURE' },
            { id: 'profile', label: 'NOMAD PASSPORT ID', icon: UserCheck, badge: 'EDIT' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="tactical-btn font-orbitron"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 16px',
                  backgroundColor: isActive ? 'rgba(255, 19, 85, 0.18)' : 'transparent',
                  border: isActive ? '1px solid #ff1355' : '1px solid transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: '800',
                  fontSize: '12px',
                  cursor: 'pointer',
                  letterSpacing: '1px',
                  boxShadow: isActive ? '0 0 20px rgba(255, 19, 85, 0.35)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? '#ff1355' : '#64748b'} />
                  <span>{tab.label}</span>
                </div>
                <span className="font-mono-hud" style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  backgroundColor: isActive ? '#ff1355' : 'rgba(255, 255, 255, 0.05)',
                  color: isActive ? '#fff' : '#64748b',
                  borderRadius: '3px',
                  fontWeight: '700'
                }}>
                  {tab.badge}
                </span>
              </button>
            );
          })}

          {/* Quick Actions Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowProfileEditModal(true)}
              className="tactical-btn font-orbitron"
              style={{
                padding: '10px',
                backgroundColor: 'rgba(255, 107, 0, 0.15)',
                border: '1px solid #ff6b00',
                color: '#ff8c00',
                fontSize: '11px',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Edit3 size={14} /> EDIT MY PROFILE
            </button>

            <button
              onClick={handleLogout}
              className="tactical-btn font-mono-hud"
              style={{
                padding: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} /> DISCONNECT SESSION
            </button>
          </div>

        </aside>

        {/* ─── WORKSPACE CONTENT VIEWPORT ─── */}
        <main style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>
          
          {/* ==================== MODULE: ADMIN COMMAND OVERWATCH ==================== */}
          {activeTab === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                    // SUPREME COMMAND OVERWATCH DASHBOARD
                  </div>
                  <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '1px' }}>
                    ADMIN CONTROL & SECURITY MATRIX
                  </h2>
                  <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
                    Full administrative governance over registered operatives, active missions, and emergency distress beacons.
                  </p>
                </div>
              </div>

              {/* Admin Real-Time Telemetry Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div className="cyber-card tactical-box" style={{ padding: '20px', border: '1px solid #ff1355' }}>
                  <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff1355', fontWeight: '800' }}>REGISTERED OPERATIVES</div>
                  <div className="font-orbitron" style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                    {allUsers.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{allUsers.filter(u=>u.status==='ACTIVE').length} Active // {allUsers.filter(u=>u.status==='SUSPENDED').length} Suspended</div>
                </div>

                <div className="cyber-card tactical-box" style={{ padding: '20px', border: '1px solid #ff6b00' }}>
                  <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff6b00', fontWeight: '800' }}>ACTIVE EXPEDITIONS</div>
                  <div className="font-orbitron" style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                    {trips.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Global radar deployments</div>
                </div>

                <div className="cyber-card tactical-box" style={{ padding: '20px', border: '1px solid #10e599' }}>
                  <div className="font-mono-hud" style={{ fontSize: '11px', color: '#10e599', fontWeight: '800' }}>SQUAD TREASURY VOLUME</div>
                  <div className="font-orbitron" style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                    ${expenses.reduce((a,c)=>a+c.amount,0).toFixed(0)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{expenses.length} Total expenditures logged</div>
                </div>

                <div className="cyber-card tactical-box" style={{ padding: '20px', border: '1px solid #ec4899' }}>
                  <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ec4899', fontWeight: '800' }}>SOS DISTRESS SIGNALS</div>
                  <div className="font-orbitron" style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                    {sosAlerts.filter(a => a.status === 'ACTIVE').length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Active rescue beacons</div>
                </div>
              </div>

              {/* 1. SOS Live Distress Management */}
              <div style={{ marginBottom: '36px' }}>
                <h3 className="font-orbitron" style={{ fontSize: '18px', fontWeight: '900', color: '#ff1355', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} /> LIVE DISTRESS BEACONS (SEARCH & RESCUE)
                </h3>

                {sosAlerts.length === 0 ? (
                  <div style={{ padding: '20px', backgroundColor: 'rgba(16,229,153,0.1)', border: '1px solid #10e599', borderRadius: '8px', color: '#10e599' }} className="font-mono-hud">
                    ALL FREQUENCIES CLEAR. NO ACTIVE DISTRESS SIGNALS.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sosAlerts.map(alert => (
                      <div key={alert.id} className="cyber-card" style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${alert.status === 'ACTIVE' ? '#ff1355' : '#10e599'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="font-orbitron" style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>{alert.userName}</span>
                            <span className="font-mono-hud" style={{ fontSize: '11px', color: '#ff8c00' }}>[{alert.callsign}]</span>
                            <span className="font-mono-hud" style={{ padding: '2px 8px', backgroundColor: alert.status === 'ACTIVE' ? '#ff1355' : '#10e599', color: '#fff', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                              {alert.status}
                            </span>
                          </div>
                          <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff8c00', marginTop: '4px' }}>
                            {alert.coordinates} // {alert.location}
                          </div>
                          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>{alert.details}</p>
                        </div>

                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleResolveSos(alert.id)}
                            className="tactical-btn font-orbitron"
                            style={{ padding: '10px 20px', backgroundColor: '#10e599', color: '#000', border: 'none', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                          >
                            DISPATCH RESCUE & RESOLVE
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Operatives Management Table */}
              <div style={{ marginBottom: '36px' }}>
                <h3 className="font-orbitron" style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={20} color="#ff8c00" /> REGISTERED OPERATIVES GOVERNANCE ({allUsers.length})
                </h3>

                <div className="cyber-card" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr className="font-mono-hud" style={{ backgroundColor: 'rgba(5,7,14,0.9)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}>
                        <th style={{ padding: '14px 16px' }}>OPERATIVE</th>
                        <th style={{ padding: '14px 16px' }}>ROLE</th>
                        <th style={{ padding: '14px 16px' }}>STATUS</th>
                        <th style={{ padding: '14px 16px' }}>VERIFIED</th>
                        <th style={{ padding: '14px 16px' }}>TRUST SCORE</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>ADMIN CONTROLS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={u.photo} alt={u.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: '800', color: '#fff' }}>{u.name}</div>
                              <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff8c00' }}>[{u.callsign}] • {u.email}</div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="font-mono-hud" style={{ padding: '2px 8px', backgroundColor: u.role === 'admin' ? '#ff1355' : 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="font-mono-hud" style={{ color: u.status === 'ACTIVE' ? '#10e599' : '#ef4444', fontWeight: '800' }}>
                              {u.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {u.isVerified ? <span style={{ color: '#10e599', fontWeight: '800' }}>✓ VERIFIED</span> : <span style={{ color: '#64748b' }}>UNVERIFIED</span>}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '800', color: '#ff8c00' }}>
                            ★ {u.trustScore}
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {u.role !== 'admin' && (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleToggleUserStatus(u.id)}
                                  className="font-mono-hud"
                                  style={{ padding: '4px 8px', backgroundColor: u.status === 'ACTIVE' ? 'rgba(239,68,68,0.2)' : 'rgba(16,229,153,0.2)', border: `1px solid ${u.status === 'ACTIVE' ? '#ef4444' : '#10e599'}`, color: u.status === 'ACTIVE' ? '#ef4444' : '#10e599', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                                >
                                  {u.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                                </button>
                                <button
                                  onClick={() => handleToggleUserVerified(u.id)}
                                  className="font-mono-hud"
                                  style={{ padding: '4px 8px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                                >
                                  {u.isVerified ? 'UNVERIFY' : 'VERIFY'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="font-mono-hud"
                                  style={{ padding: '4px 8px', backgroundColor: 'rgba(239,68,68,0.3)', border: '1px solid #ef4444', color: '#fff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                                >
                                  DELETE
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

              {/* 3. Expeditions Force Control */}
              <div>
                <h3 className="font-orbitron" style={{ fontSize: '18px', fontWeight: '900', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crosshair size={20} color="#ff1355" /> GLOBAL EXPEDITIONS GOVERNANCE ({trips.length})
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {trips.map(trip => (
                    <div key={trip.id} className="cyber-card" style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="font-mono-hud" style={{ fontSize: '10px', color: '#ff8c00', fontWeight: '800' }}>{trip.destination}</span>
                        <span className="font-mono-hud" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: '#ff1355', color: '#fff', borderRadius: '3px' }}>{trip.risk}</span>
                      </div>
                      <h4 className="font-orbitron" style={{ fontSize: '15px', color: '#fff', marginBottom: '8px' }}>{trip.title}</h4>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                        Host: {trip.host} • Bounty: ${trip.budget} USD
                      </div>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="tactical-btn font-orbitron"
                        style={{ width: '100%', padding: '8px', backgroundColor: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                      >
                        [ABORT & PURGE MISSION]
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== MODULE 1: RADAR EXPEDITIONS ==================== */}
          {activeTab === 'explore' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                    // GLOBAL RADAR DISPATCH
                  </div>
                  <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', letterSpacing: '1px' }}>
                    ACTIVE EXPEDITIONS & MISSIONS
                  </h2>
                  <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
                    Join battle-ready solo adventurers deploying to high-intensity global destinations.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateTripModal(true)}
                  className="tactical-btn font-orbitron"
                  style={{
                    padding: '14px 24px',
                    backgroundColor: '#ff1355',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: '0 0 25px rgba(255, 19, 85, 0.6)',
                    letterSpacing: '1.5px'
                  }}
                >
                  <Plus size={20} /> HOST EXPEDITION
                </button>
              </div>

              {/* Category Filters */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['ALL', 'VOLCANO TREK', 'ALPINE PEAKS', 'NIGHT TREK'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="font-mono-hud"
                    style={{
                      padding: '8px 18px',
                      backgroundColor: categoryFilter === cat ? '#ff6b00' : 'rgba(15, 23, 42, 0.7)',
                      border: `1px solid ${categoryFilter === cat ? '#ff6b00' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: '#ffffff',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      letterSpacing: '1px'
                    }}
                  >
                    [{cat}]
                  </button>
                ))}

                <button
                  onClick={() => setWomenOnlyMode(!womenOnlyMode)}
                  className="font-mono-hud"
                  style={{
                    padding: '8px 18px',
                    backgroundColor: womenOnlyMode ? '#ec4899' : 'rgba(15, 23, 42, 0.7)',
                    border: `1px solid ${womenOnlyMode ? '#ec4899' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginLeft: 'auto'
                  }}
                >
                  <ShieldAlert size={16} /> WOMEN SHIELD MODE: {womenOnlyMode ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: '32px' }}>
                <input
                  type="text"
                  placeholder="SEARCH MISSIONS BY COORDINATES OR DESTINATION (E.G. BALI, SWISS ALPS, KYOTO)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-mono-hud"
                  style={{
                    width: '100%',
                    padding: '14px 18px 14px 48px',
                    backgroundColor: 'rgba(11, 15, 25, 0.9)',
                    border: '1px solid rgba(255, 19, 85, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                  }}
                />
                <Search size={20} color="#ff1355" style={{ position: 'absolute', left: '16px', top: '15px' }} />
              </div>

              {/* Mission Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
                {filteredTrips.map(trip => (
                  <div key={trip.id} className="cyber-card tactical-box" style={{ overflow: 'hidden' }}>
                    
                    <div style={{ height: '210px', backgroundImage: `url(${trip.cover})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', padding: '16px' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(5,7,14,0.4), rgba(5,7,14,0.95))' }}></div>
                      
                      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="font-mono-hud" style={{
                          padding: '4px 10px',
                          backgroundColor: trip.risk === 'EXTREME' ? '#ff1355' : '#ff6b00',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '900',
                          letterSpacing: '1px'
                        }}>
                          RISK: {trip.risk || 'HIGH'}
                        </span>

                        {trip.isWomenOnly && (
                          <span className="font-mono-hud" style={{ padding: '4px 10px', backgroundColor: '#ec4899', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>
                            ♀ WOMEN ONLY SQUAD
                          </span>
                        )}
                      </div>

                      <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                        <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff8c00', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} /> {trip.destination}
                        </div>
                        <h3 className="font-orbitron" style={{ fontSize: '17px', fontWeight: '900', color: '#fff', marginTop: '4px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                          {trip.title}
                        </h3>
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(5,7,14,0.6)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <span className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b' }}>EXPEDITION BOUNTY</span>
                          <div className="font-orbitron" style={{ fontSize: '18px', fontWeight: '900', color: '#10e599' }}>
                            ${trip.budget} <span style={{ fontSize: '11px', color: '#64748b' }}>USD</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b' }}>SQUAD COMPLEMENT</span>
                          <div className="font-orbitron" style={{ fontSize: '18px', fontWeight: '900', color: '#ff8c00' }}>
                            {trip.currentMembers}/{trip.maxMembers} <span style={{ fontSize: '11px', color: '#64748b' }}>OPERATIVES</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }} className="font-mono-hud">
                          <span>SQUAD CAPACITY</span>
                          <span>{Math.round((trip.currentMembers / trip.maxMembers) * 100)}% LOCKED</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(trip.currentMembers / trip.maxMembers) * 100}%`, backgroundColor: '#ff1355', boxShadow: '0 0 10px #ff1355' }}></div>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerToast(`⚡ REQUISITION TRANSMITTED TO COMMAND FOR "${trip.title}"`)}
                        className="tactical-btn font-orbitron"
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'rgba(255, 19, 85, 0.15)',
                          border: '1px solid #ff1355',
                          color: '#ffffff',
                          fontWeight: '900',
                          fontSize: '12px',
                          cursor: 'pointer',
                          letterSpacing: '1.5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Crosshair size={16} /> REQUEST SQUAD DEPLOYMENT
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 2: BUDDY MATCH ENGINE ==================== */}
          {activeTab === 'match' && (
            <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
              
              <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                // BIOMETRIC COMPATIBILITY ENGINE
              </div>
              <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '1.5px', marginBottom: '6px' }}>
                TACTICAL RADAR BUDDY MATCHER
              </h2>
              <p style={{ fontSize: '15px', color: '#94a3b8', marginBottom: '28px' }}>
                Real-time algorithmic synchronization matching real registered operatives in the database.
              </p>

              {activeCandidate ? (
                <div className="cyber-card tactical-box glow-crimson" style={{ overflow: 'hidden', border: '1px solid #ff1355' }}>
                  
                  <div style={{
                    height: '460px',
                    backgroundImage: `url(${activeCandidate.photo})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '28px'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(5,7,14,0.98) 25%, transparent 80%)' }}></div>

                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono-hud" style={{ padding: '6px 12px', backgroundColor: 'rgba(5,7,14,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>
                        CALLSIGN: {activeCandidate.callsign}
                      </span>

                      <div className="font-orbitron" style={{ padding: '8px 16px', backgroundColor: '#ff1355', color: '#fff', borderRadius: '6px', fontSize: '14px', fontWeight: '900', boxShadow: '0 0 20px #ff1355', letterSpacing: '1px' }}>
                        ⚡ 96% SYNC RATE
                      </div>
                    </div>

                    <div style={{ position: 'relative', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 className="font-orbitron" style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>
                          {activeCandidate.name}, {activeCandidate.age}
                        </h3>
                        {activeCandidate.isVerified && <CheckCircle2 size={22} color="#10e599" />}
                      </div>

                      <div className="font-mono-hud" style={{ fontSize: '13px', color: '#ff8c00', fontWeight: '800', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} /> STYLE: {activeCandidate.style}
                      </div>

                      <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '10px', lineHeight: '1.6' }}>
                        "{activeCandidate.bio}"
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                        <div style={{ backgroundColor: 'rgba(5,7,14,0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b' }}>TRUST RATING</div>
                          <div className="font-orbitron" style={{ fontSize: '16px', color: '#10e599', fontWeight: '900' }}>
                            ★ {activeCandidate.trustScore}
                          </div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(5,7,14,0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b' }}>EXPEDITIONS</div>
                          <div className="font-orbitron" style={{ fontSize: '16px', color: '#ff8c00', fontWeight: '900' }}>
                            {activeCandidate.expeditionsCompleted} LOGGED
                          </div>
                        </div>
                        <div style={{ backgroundColor: 'rgba(5,7,14,0.8)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="font-mono-hud" style={{ fontSize: '10px', color: '#64748b' }}>LANGUAGES</div>
                          <div className="font-orbitron" style={{ fontSize: '14px', color: '#ff1355', fontWeight: '900' }}>
                            {activeCandidate.languages?.join(', ') || 'English'}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', backgroundColor: '#080c16', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    <button
                      onClick={() => setCurrentMatchIndex(currentMatchIndex + 1)}
                      className="tactical-btn font-orbitron"
                      style={{
                        padding: '14px 28px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        fontWeight: '900',
                        fontSize: '13px',
                        cursor: 'pointer',
                        letterSpacing: '1.5px'
                      }}
                    >
                      [✕ NEXT OPERATIVE]
                    </button>

                    <button
                      onClick={() => {
                        triggerToast(`⚡ TACTICAL ALLIANCE REQUISITION TRANSMITTED TO ${activeCandidate.callsign}!`);
                        setCurrentMatchIndex(currentMatchIndex + 1);
                      }}
                      className="tactical-btn font-orbitron"
                      style={{
                        padding: '16px 36px',
                        backgroundColor: '#ff1355',
                        border: 'none',
                        color: '#ffffff',
                        fontWeight: '900',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 0 35px #ff1355',
                        letterSpacing: '2px'
                      }}
                    >
                      <Zap size={22} fill="#ffffff" /> [LOCK IN BUDDY]
                    </button>

                  </div>
                </div>
              ) : (
                <div style={{ padding: '80px 40px', backgroundColor: 'rgba(11, 15, 25, 0.8)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Cpu size={48} color="#ff1355" style={{ margin: '0 auto 16px' }} />
                  <h3 className="font-orbitron" style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>
                    ALL REGISTERED OPERATIVES SCANNED
                  </h3>
                  <button
                    onClick={() => setCurrentMatchIndex(0)}
                    className="tactical-btn font-orbitron"
                    style={{ padding: '12px 28px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}
                  >
                    RESET RADAR STACK
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ==================== MODULE 3: WAR ROOM ITINERARY ==================== */}
          {activeTab === 'planner' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff6b00', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                  // EXPEDITION TIMELINE PROTOCOL
                </div>
                <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>
                  WAR ROOM MISSION ITINERARY
                </h2>
                <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
                  Collaborative day-by-day objective scheduling and democratic squad voting.
                </p>
              </div>

              {/* Propose Objective Form */}
              <form onSubmit={handleAddActivity} className="cyber-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap', border: '1px solid rgba(255, 19, 85, 0.3)' }}>
                <input
                  type="text"
                  placeholder="TIME (E.G. 05:30 HRS)"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                  className="font-mono-hud"
                  style={{ width: '170px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="MISSION OBJECTIVE TITLE (E.G. CANYON DESCENT & DRONE SCAN)"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="font-mono-hud"
                  style={{ flex: 1, minWidth: '260px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
                <select
                  value={newActivity.risk}
                  onChange={(e) => setNewActivity({...newActivity, risk: e.target.value})}
                  className="font-mono-hud"
                  style={{ width: '150px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ff8c00', fontSize: '13px', fontWeight: '800' }}
                >
                  <option value="LOW">LOW RISK</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="HIGH">HIGH RISK</option>
                  <option value="EXTREME">EXTREME</option>
                </select>
                <button
                  type="submit"
                  className="tactical-btn font-orbitron"
                  style={{ padding: '12px 24px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(255, 19, 85, 0.5)' }}
                >
                  + INSERT OBJECTIVE
                </button>
              </form>

              {/* Itinerary Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {itinerary.map((item, idx) => (
                  <div key={item.id} className="cyber-card tactical-box" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div className="font-orbitron" style={{ padding: '8px 14px', backgroundColor: '#ff1355', color: '#fff', borderRadius: '4px', fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>
                        {item.time}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h4 className="font-orbitron" style={{ fontSize: '17px', fontWeight: '900', color: '#fff' }}>{item.title}</h4>
                          <span className="font-mono-hud" style={{ fontSize: '10px', padding: '2px 8px', backgroundColor: item.risk === 'EXTREME' ? 'rgba(255, 19, 85, 0.2)' : 'rgba(255, 107, 0, 0.2)', border: `1px solid ${item.risk === 'EXTREME' ? '#ff1355' : '#ff6b00'}`, color: item.risk === 'EXTREME' ? '#ff1355' : '#ff8c00', borderRadius: '4px', fontWeight: '800' }}>
                            {item.risk || 'MODERATE'}
                          </span>
                        </div>
                        <div className="font-mono-hud" style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          EST. BOUNTY: ${item.cost} USD // PHASE 0{idx + 1}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        Database.upvoteItineraryItem(item.id);
                        reloadData();
                      }}
                      className="tactical-btn font-orbitron"
                      style={{ padding: '10px 18px', backgroundColor: 'rgba(255, 107, 0, 0.15)', border: '1px solid #ff6b00', color: '#ff8c00', fontWeight: '900', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ThumbsUp size={16} /> {item.votes} VOTES
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 4: WAR CHEST LEDGER ==================== */}
          {activeTab === 'expense' && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <div className="font-mono-hud" style={{ fontSize: '12px', color: '#10e599', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                  // GROUP FINANCIAL SETTLEMENT MATRIX
                </div>
                <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>
                  WAR CHEST EXPENSE LEDGER
                </h2>
                <p style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
                  Real-time database ledger tracking squad expenditures and debts.
                </p>
              </div>

              {/* Spend Matrix */}
              <div className="cyber-card tactical-box" style={{ padding: '32px', border: '1px solid #10e599', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(8,12,22,0.95), rgba(16,229,153,0.08))' }}>
                <span className="font-mono-hud" style={{ fontSize: '12px', color: '#10e599', letterSpacing: '2px', fontWeight: '800' }}>
                  TOTAL SQUAD EXPENDITURE LOGGED
                </span>
                <div className="font-orbitron" style={{ fontSize: '46px', fontWeight: '900', color: '#fff', margin: '6px 0 20px', textShadow: '0 0 20px rgba(16,229,153,0.4)' }}>
                  ${expenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)} <span style={{ fontSize: '18px', color: '#64748b' }}>USD</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <div className="font-mono-hud" style={{ fontSize: '11px', color: '#10e599', fontWeight: '800' }}>OPERATIVE ELENA OWES SQUAD</div>
                    <div className="font-orbitron" style={{ fontSize: '24px', fontWeight: '900', color: '#10e599' }}>+$40.00 <span style={{ fontSize: '12px', color: '#64748b' }}>USD</span></div>
                  </div>
                  <div>
                    <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff8c00', fontWeight: '800' }}>YOUR NET BALANCE</div>
                    <div className="font-orbitron" style={{ fontSize: '24px', fontWeight: '900', color: '#ff8c00' }}>+$65.00 <span style={{ fontSize: '12px', color: '#64748b' }}>USD</span></div>
                  </div>
                </div>
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className="cyber-card" style={{ padding: '24px', borderRadius: '12px', marginBottom: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap', border: '1px solid rgba(255, 107, 0, 0.3)' }}>
                <input
                  type="text"
                  placeholder="EXPENDITURE TITLE (E.G. BASECAMP VILLA DEPOSIT)"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="font-mono-hud"
                  style={{ flex: 1, minWidth: '240px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
                <input
                  type="number"
                  placeholder="AMOUNT ($USD)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="font-mono-hud"
                  style={{ width: '160px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  className="tactical-btn font-orbitron"
                  style={{ padding: '12px 28px', backgroundColor: '#ff6b00', color: '#fff', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 0 15px rgba(255, 107, 0, 0.5)' }}
                >
                  + LOG EXPENDITURE
                </button>
              </form>

              {/* Ledger Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {expenses.map(exp => (
                  <div key={exp.id} className="cyber-card" style={{ padding: '18px 24px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="font-orbitron" style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{exp.title}</div>
                      <div className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>PAID BY: {exp.paidBy}</div>
                    </div>
                    <div className="font-orbitron" style={{ fontSize: '20px', fontWeight: '900', color: '#10e599' }}>
                      ${exp.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 5: COMMUNICATIONS FEED ==================== */}
          {activeTab === 'social' && (
            <div style={{ maxWidth: '750px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                  // SECURE SQUAD BROADCAST CHANNEL
                </div>
                <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>
                  EXPEDITION FIELD TRANSMISSIONS
                </h2>
              </div>

              {/* Create Post Form */}
              <form onSubmit={handleCreatePost} className="cyber-card" style={{ padding: '20px', borderRadius: '8px', marginBottom: '28px', border: '1px solid rgba(255, 19, 85, 0.3)' }}>
                <textarea
                  placeholder="TRANSMIT FIELD INTEL OR MISSION LOG..."
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  className="font-mono-hud"
                  style={{ width: '100%', height: '80px', padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="OPTIONAL PHOTO URL (OR LEAVE BLANK FOR DEFAULT COVER)"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    className="font-mono-hud"
                    style={{ flex: 1, padding: '10px 12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  />
                  <button
                    type="submit"
                    className="tactical-btn font-orbitron"
                    style={{ padding: '10px 24px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}
                  >
                    TRANSMIT OPS
                  </button>
                </div>
              </form>

              {/* Feed Posts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {posts.map(post => (
                  <div key={post.id} className="cyber-card tactical-box" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={post.avatar} alt="Author" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #ff1355' }} />
                        <div>
                          <div className="font-orbitron" style={{ fontSize: '15px', fontWeight: '900', color: '#fff' }}>
                            {post.author} <span className="font-mono-hud" style={{ fontSize: '11px', color: '#ff8c00' }}>[{post.callsign || 'OPERATIVE'}]</span>
                          </div>
                          <div className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b' }}>{post.location}</div>
                        </div>
                      </div>
                      <span className="font-mono-hud" style={{ fontSize: '10px', padding: '4px 10px', backgroundColor: 'rgba(255, 19, 85, 0.15)', border: '1px solid #ff1355', color: '#ff1355', borderRadius: '4px', fontWeight: '900' }}>
                        {post.threatLevel || 'FIELD LOG'}
                      </span>
                    </div>

                    <img src={post.image} alt="Capture" style={{ width: '100%', height: '360px', objectFit: 'cover' }} />

                    <div style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: '1.6' }}>{post.caption}</p>
                      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          onClick={() => {
                            Database.togglePostLike(post.id);
                            reloadData();
                          }}
                          className="font-orbitron"
                          style={{ background: 'none', border: 'none', color: post.isLiked ? '#ff1355' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '13px' }}
                        >
                          <Flame size={20} fill={post.isLiked ? '#ff1355' : 'none'} /> {post.likes} SALUTES
                        </button>
                        <div className="font-mono-hud" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                          <MessageSquare size={16} /> {post.comments} COMMS LOGS
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== MODULE 6: DEFENSE & SHIELD HUB ==================== */}
          {activeTab === 'safety' && (
            <div style={{ maxWidth: '850px', margin: '0 auto' }}>
              <div style={{ marginBottom: '28px' }}>
                <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
                  // DEFENSE PROTOCOLS & DISTRESS BEACONS
                </div>
                <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '1px' }}>
                  SHIELD & BIOMETRIC VERIFICATION
                </h2>
              </div>

              <div className="cyber-card tactical-box glow-crimson" style={{ padding: '28px', border: '1px solid #10e599', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <ShieldCheck size={48} color="#10e599" />
                  <div>
                    <h3 className="font-orbitron" style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                      BIOMETRIC IDENTITY: {currentUser.isVerified ? '100% VERIFIED' : 'PENDING VERIFICATION'}
                    </h3>
                    <p className="font-mono-hud" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Cryptographic government credential verification status linked to database.
                    </p>
                  </div>
                </div>
              </div>

              <div className="cyber-card tactical-box" style={{ padding: '32px', border: '1px solid #ff1355', marginBottom: '28px', background: 'linear-gradient(135deg, rgba(255,19,85,0.1), rgba(5,7,14,0.95))' }}>
                <h3 className="font-orbitron" style={{ fontSize: '22px', fontWeight: '900', color: '#ff1355', marginBottom: '8px' }}>
                  ONE-TOUCH EMERGENCY SATELLITE SOS OVERRIDE
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  Instantly transmits high-priority distress signals with live GPS telemetry, terrain altitude, and audio beacon directly to Supreme Overwatch Command.
                </p>
                <button
                  onClick={handleTriggerSos}
                  className="tactical-btn font-orbitron"
                  style={{
                    width: '100%',
                    padding: '18px',
                    backgroundColor: '#ff1355',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 0 30px #ff1355',
                    letterSpacing: '2px'
                  }}
                >
                  <AlertTriangle size={20} style={{ display: 'inline', marginRight: '10px' }} />
                  TRANSMIT IMMEDIATE DISTRESS BEACON
                </button>
              </div>
            </div>
          )}

          {/* ==================== MODULE 7: NOMAD PROFILE ==================== */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '750px', margin: '0 auto', textAlign: 'center' }}>
              <div className="cyber-card tactical-box glow-crimson" style={{ padding: '40px', border: '1px solid #ff1355' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
                  <img src={currentUser.photo} alt="User" style={{ width: '120px', height: '120px', borderRadius: '16px', objectFit: 'cover', border: '3px solid #ff1355', boxShadow: '0 0 25px rgba(255,19,85,0.6)' }} />
                  <span className="font-mono-hud" style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', padding: '2px 10px', backgroundColor: currentUser.isVerified ? '#10e599' : '#64748b', color: '#000', borderRadius: '4px', fontSize: '10px', fontWeight: '900' }}>
                    {currentUser.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </span>
                </div>

                <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff8c00', fontWeight: '800', letterSpacing: '2px' }}>
                  CALLSIGN: {currentUser.callsign} • ROLE: {currentUser.role?.toUpperCase()}
                </div>
                <h2 className="font-orbitron" style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginTop: '4px' }}>
                  {currentUser.name}
                </h2>
                <div className="font-mono-hud" style={{ fontSize: '13px', color: '#ff1355', fontWeight: '800', marginTop: '4px' }}>
                  ★ {currentUser.trustScore} TRUST SCORE // {currentUser.expeditionsCompleted} EXPEDITIONS LOGGED
                </div>

                <p style={{ fontSize: '15px', color: '#cbd5e1', marginTop: '16px', lineHeight: '1.6', maxWidth: '540px', margin: '16px auto 0' }}>
                  "{currentUser.bio}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                  <span className="font-mono-hud" style={{ padding: '6px 14px', backgroundColor: '#05070e', border: '1px solid #ff1355', borderRadius: '4px', fontSize: '12px', color: '#fff', fontWeight: '800' }}>
                    STYLE: {currentUser.style}
                  </span>
                  <span className="font-mono-hud" style={{ padding: '6px 14px', backgroundColor: '#05070e', border: '1px solid #ff6b00', borderRadius: '4px', fontSize: '12px', color: '#fff', fontWeight: '800' }}>
                    TIER: {currentUser.budgetTier}
                  </span>
                  <span className="font-mono-hud" style={{ padding: '6px 14px', backgroundColor: '#05070e', border: '1px solid #10e599', borderRadius: '4px', fontSize: '12px', color: '#fff', fontWeight: '800' }}>
                    CLEARANCE: {currentUser.clearanceLevel || 'APEX OPERATIVE'}
                  </span>
                </div>

                <button
                  onClick={() => setShowProfileEditModal(true)}
                  className="tactical-btn font-orbitron"
                  style={{
                    marginTop: '28px',
                    padding: '12px 32px',
                    backgroundColor: '#ff1355',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '900',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px #ff1355'
                  }}
                >
                  <Edit3 size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  EDIT MY PROFILE
                </button>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══════════════════ AUTH & LOGIN MODAL (USER & ADMIN) ══════════════════ */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 7, 14, 0.92)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="cyber-card tactical-box glow-crimson" style={{ padding: '36px', width: '520px', border: '1px solid #ff1355' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px' }}>
                  // APEX IDENTITY GATEWAY
                </div>
                <h3 className="font-orbitron" style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>
                  {authMode === 'login' ? 'OPERATIVE IDENTIFICATION' : 'NEW SQUAD ENLISTMENT'}
                </h3>
              </div>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* 1-Click Quick Role Switchers */}
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(5,7,14,0.8)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff8c00', fontWeight: '800', marginBottom: '10px' }}>
                ⚡ 1-CLICK INSTANT DEMO SWITCHER
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '10px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                >
                  🛡️ AS ADMIN (OVERWATCH)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '10px', backgroundColor: '#ff6b00', color: '#fff', border: 'none', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}
                >
                  ⚡ AS USER (SARAH)
                </button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="FULL OPERATIVE NAME"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="font-mono-hud"
                    style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="TACTICAL CALLSIGN (E.G. VIPER)"
                    value={authForm.callsign}
                    onChange={(e) => setAuthForm({ ...authForm, callsign: e.target.value })}
                    className="font-mono-hud"
                    style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </>
              )}

              <input
                type="text"
                placeholder={authMode === 'login' ? "EMAIL OR CALLSIGN (E.G. admin@apex.io OR VALKYRIE)" : "EMAIL ADDRESS"}
                value={authMode === 'login' ? authForm.emailOrCallsign : authForm.email}
                onChange={(e) => authMode === 'login' ? setAuthForm({ ...authForm, emailOrCallsign: e.target.value }) : setAuthForm({ ...authForm, email: e.target.value })}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />

              <input
                type="password"
                placeholder="AUTHENTICATION PASSWORD"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />

              <button
                type="submit"
                className="tactical-btn font-orbitron"
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  backgroundColor: '#ff1355',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '900',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px #ff1355'
                }}
              >
                {authMode === 'login' ? 'TRANSMIT IDENTIFICATION' : 'ENLIST NEW OPERATIVE'}
              </button>
            </form>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="font-mono-hud"
                style={{ background: 'none', border: 'none', color: '#ff8c00', fontSize: '12px', cursor: 'pointer', fontWeight: '800' }}
              >
                {authMode === 'login' ? "NEED NEW ENLISTMENT? CREATE OPERATIVE ACCOUNT" : "ALREADY ENLISTED? SWITCH TO SIGN IN"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════ USER EDIT PROFILE MODAL ══════════════════ */}
      {showProfileEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 7, 14, 0.92)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="cyber-card tactical-box glow-crimson" style={{ padding: '36px', width: '560px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ff1355' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="font-mono-hud" style={{ fontSize: '11px', color: '#ff6b00', fontWeight: '800', letterSpacing: '2px' }}>
                  // PROFILE PROTOCOL CUSTOMIZATION
                </div>
                <h3 className="font-orbitron" style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>
                  EDIT NOMAD PASSPORT PROFILE
                </h3>
              </div>
              <button onClick={() => setShowProfileEditModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>OPERATIVE FULL NAME</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="font-mono-hud"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                    required
                  />
                </div>
                <div>
                  <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>TACTICAL CALLSIGN</label>
                  <input
                    type="text"
                    value={profileForm.callsign}
                    onChange={(e) => setProfileForm({ ...profileForm, callsign: e.target.value.toUpperCase() })}
                    className="font-mono-hud"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ff8c00', fontSize: '13px', fontWeight: '800' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>AVATAR PHOTO URL</label>
                <input
                  type="text"
                  value={profileForm.photo}
                  onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                  className="font-mono-hud"
                  style={{ width: '100%', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
              </div>

              <div>
                <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>NOMAD INTEL / BIO</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="font-mono-hud"
                  style={{ width: '100%', height: '70px', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '12px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>EXPEDITION STYLE</label>
                  <input
                    type="text"
                    value={profileForm.style}
                    onChange={(e) => setProfileForm({ ...profileForm, style: e.target.value })}
                    className="font-mono-hud"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label className="font-mono-hud" style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>BUDGET TIER</label>
                  <input
                    type="text"
                    value={profileForm.budgetTier}
                    onChange={(e) => setProfileForm({ ...profileForm, budgetTier: e.target.value })}
                    className="font-mono-hud"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileEditModal(false)}
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '12px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 20px #ff1355' }}
                >
                  SAVE PROFILE
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ══════════════════ HOST EXPEDITION MODAL ══════════════════ */}
      {showCreateTripModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(5, 7, 14, 0.88)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="cyber-card tactical-box glow-crimson" style={{ padding: '36px', width: '500px', border: '1px solid #ff1355' }}>
            
            <div className="font-mono-hud" style={{ fontSize: '12px', color: '#ff1355', fontWeight: '800', letterSpacing: '2px', marginBottom: '4px' }}>
              // EXPEDITION DEPLOYMENT PROTOCOL
            </div>
            <h3 className="font-orbitron" style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '20px' }}>
              HOST NEW TACTICAL EXPEDITION
            </h3>
            
            <form onSubmit={handleCreateTrip} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="MISSION TITLE (E.G. ICELAND GLACIER ICE-CAVE ASSAULT)"
                value={newTripForm.title}
                onChange={(e) => setNewTripForm({...newTripForm, title: e.target.value})}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />
              <input
                type="text"
                placeholder="TARGET DESTINATION (E.G. REYKJAVIK, ICELAND)"
                value={newTripForm.destination}
                onChange={(e) => setNewTripForm({...newTripForm, destination: e.target.value})}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />
              <input
                type="number"
                placeholder="ESTIMATED BOUNTY / BUDGET ($USD)"
                value={newTripForm.budget}
                onChange={(e) => setNewTripForm({...newTripForm, budget: e.target.value})}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                required
              />

              <select
                value={newTripForm.risk}
                onChange={(e) => setNewTripForm({...newTripForm, risk: e.target.value})}
                className="font-mono-hud"
                style={{ padding: '12px', backgroundColor: '#05070e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#ff8c00', fontSize: '13px', fontWeight: '800' }}
              >
                <option value="LOW">THREAT RATING: LOW</option>
                <option value="MODERATE">THREAT RATING: MODERATE</option>
                <option value="HIGH">THREAT RATING: HIGH</option>
                <option value="EXTREME">THREAT RATING: EXTREME</option>
              </select>

              <label className="font-mono-hud" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newTripForm.isWomenOnly}
                  onChange={(e) => setNewTripForm({...newTripForm, isWomenOnly: e.target.checked})}
                />
                RESTRICT SQUAD TO VERIFIED WOMEN OPERATIVES
              </label>

              <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTripModal(false)}
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                >
                  ABORT
                </button>
                <button
                  type="submit"
                  className="tactical-btn font-orbitron"
                  style={{ flex: 1, padding: '12px', backgroundColor: '#ff1355', color: '#fff', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 0 20px #ff1355' }}
                >
                  TRANSMIT MISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
