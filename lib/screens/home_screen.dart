import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../models/user_model.dart';
import '../models/trip_model.dart';
import '../models/expense_model.dart';
import '../models/itinerary_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  // Mock User
  final UserModel _currentUser = UserModel(
    id: 'usr_001',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Backpacker & adventure photographer. Currently exploring Southeast Asia! 🌏',
    gender: 'Female',
    age: 23,
    travelStyle: 'Adventure & Backpacker',
    budgetTier: 'Budget (\$30-50/day)',
    languages: ['English', 'Spanish', 'French'],
    isVerified: true,
    trustScore: 4.9,
    tripsCompleted: 15,
  );

  // Mock Trips
  final List<TripModel> _trips = [
    TripModel(
      id: 'trip_1',
      title: 'Bali Island Hopping & Waterfalls',
      destination: 'Bali, Indonesia',
      startDate: DateTime.now().add(const Duration(days: 10)),
      endDate: DateTime.now().add(const Duration(days: 18)),
      budget: 650.0,
      maxMembers: 4,
      currentMemberIds: ['usr_001', 'usr_002'],
      isWomenOnly: true,
      hostId: 'usr_001',
      coverUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    ),
    TripModel(
      id: 'trip_2',
      title: 'Swiss Alps Hiking Adventure',
      destination: 'Interlaken, Switzerland',
      startDate: DateTime.now().add(const Duration(days: 30)),
      endDate: DateTime.now().add(const Duration(days: 37)),
      budget: 1200.0,
      maxMembers: 5,
      currentMemberIds: ['usr_003', 'usr_004'],
      isWomenOnly: false,
      hostId: 'usr_003',
      coverUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80',
    ),
  ];

  // Mock Candidates for Buddy Matcher
  final List<Map<String, dynamic>> _matchedBuddies = [
    {
      'name': 'Elena Rostova',
      'age': 24,
      'destination': 'Bali, Indonesia',
      'matchScore': 96,
      'photo': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
      'bio': 'Solo hiker & coffee junkie looking for a travel buddy for July!',
      'style': 'Adventure',
    },
    {
      'name': 'Marcus Vance',
      'age': 26,
      'destination': 'Interlaken, Switzerland',
      'matchScore': 88,
      'photo': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      'bio': 'Landscape photographer. Excited to explore alpine trails!',
      'style': 'Photography & Camping',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final pages = [
      _buildExploreTab(),
      _buildTripsTab(),
      _buildBuddyMatcherTab(),
      _buildItineraryAndExpenseTab(),
      _buildSafetyAndProfileTab(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.flight_takeoff, color: AppTheme.primaryBlue),
            const SizedBox(width: 8),
            Text(
              'Travel Buddy Finder',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.shield_outlined, color: AppTheme.successGreen),
            onPressed: () => _showSOSDialog(context),
          ),
        ],
      ),
      body: pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (idx) => setState(() => _selectedIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.explore), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.card_travel), label: 'My Trips'),
          NavigationDestination(icon: Icon(Icons.people_alt), label: 'Matches'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Planner'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  // --- TAB 1: EXPLORE & DESTINATIONS ---
  Widget _buildExploreTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Bar
          TextField(
            decoration: InputDecoration(
              hintText: 'Search destinations (e.g. Bali, Paris, Tokyo)...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: const Icon(Icons.tune),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Theme.of(context).cardColor,
            ),
          ),
          const SizedBox(height: 20),

          // Women-Only Toggle Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE91E63), Color(0xFFFF4081)],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                const Icon(Icons.female, color: Colors.white, size: 36),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Women-Only Travel Mode',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      Text(
                        'Filter verified women solo travelers & host safe trips.',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: true,
                  onChanged: (val) {},
                  activeColor: Colors.white,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text('Popular Destinations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            height: 180,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildDestinationCard('Bali, Indonesia', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80', '24 Buddies Active'),
                _buildDestinationCard('Interlaken, Swiss', 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80', '18 Buddies Active'),
                _buildDestinationCard('Kyoto, Japan', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80', '32 Buddies Active'),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text('Upcoming Trips Open to Join', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ..._trips.map((trip) => _buildTripCard(trip)).toList(),
        ],
      ),
    );
  }

  Widget _buildDestinationCard(String title, String imageUrl, String subtitle) {
    return Container(
      width: 160,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
          ),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 11)),
          ],
        ),
      ),
    );
  }

  // --- TAB 2: MY TRIPS & CREATE ---
  Widget _buildTripsTab() {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateTripSheet(context),
        backgroundColor: AppTheme.primaryBlue,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Create New Trip', style: TextStyle(color: Colors.white)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('My Planned Trips', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ..._trips.map((trip) => _buildTripCard(trip)).toList(),
        ],
      ),
    );
  }

  Widget _buildTripCard(TripModel trip) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              Image.network(trip.coverUrl, height: 140, width: double.infinity, fit: BoxFit.cover),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: trip.isWomenOnly ? Colors.pink : AppTheme.primaryBlue,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    trip.isWomenOnly ? '♀ Women Only' : 'Mixed Group',
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(trip.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: AppTheme.secondaryOrange),
                    const SizedBox(width: 4),
                    Text(trip.destination, style: const TextStyle(color: Colors.grey)),
                    const Spacer(),
                    Text('\$${trip.budget.toInt()} Est. Budget', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.successGreen)),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Text('${trip.currentMemberIds.length}/${trip.maxMembers} Members', style: const TextStyle(fontSize: 12)),
                    const Spacer(),
                    OutlinedButton(
                      onPressed: () {},
                      child: const Text('View Details'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- TAB 3: SMART BUDDY MATCHER (SWIPE CARDS) ---
  Widget _buildBuddyMatcherTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Smart Companion Matcher', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Text('96% Match Algo', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Expanded(
            child: Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  Image.network(
                    _matchedBuddies[0]['photo'],
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.cover,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withOpacity(0.85)],
                      ),
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              '${_matchedBuddies[0]['name']}, ${_matchedBuddies[0]['age']}',
                              style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.verified, color: AppTheme.primaryBlue),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Destination: ${_matchedBuddies[0]['destination']}',
                          style: const TextStyle(color: AppTheme.secondaryOrange, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _matchedBuddies[0]['bio'],
                          style: const TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 20),

                        // Action Buttons
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            FloatingActionButton(
                              heroTag: 'pass_btn',
                              onPressed: () {},
                              backgroundColor: Colors.white,
                              child: const Icon(Icons.close, color: Colors.red, size: 28),
                            ),
                            FloatingActionButton.large(
                              heroTag: 'like_btn',
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('🎉 Match Request Sent to Elena!')),
                                );
                              },
                              backgroundColor: AppTheme.primaryBlue,
                              child: const Icon(Icons.favorite, color: Colors.white, size: 36),
                            ),
                            FloatingActionButton(
                              heroTag: 'chat_btn',
                              onPressed: () {},
                              backgroundColor: Colors.white,
                              child: const Icon(Icons.chat_bubble, color: AppTheme.primaryBlue, size: 28),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- TAB 4: ITINERARY & EXPENSE SPLITTER ---
  Widget _buildItineraryAndExpenseTab() {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: const TabBar(
          tabs: [
            Tab(icon: Icon(Icons.calendar_today), text: 'Day Itinerary'),
            Tab(icon: Icon(Icons.account_balance_wallet), text: 'Expense Splitter'),
          ],
        ),
        body: TabBarView(
          children: [
            // Sub-tab 1: Itinerary
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Day 1: Ubud Waterfall & Rice Terraces', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ElevatedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add Activity'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                _buildItineraryTile('09:00 AM', 'Tegenungan Waterfall Hike', '\$15 Est.', 12),
                _buildItineraryTile('01:00 PM', 'Traditional Balinese Lunch', '\$20 Est.', 8),
                _buildItineraryTile('04:00 PM', 'Tegallalang Rice Terrace Sunset', '\$10 Est.', 15),
              ],
            ),

            // Sub-tab 2: Expense Splitter
            ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Summary Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Text('Total Group Expenses', style: TextStyle(color: Colors.white70)),
                      const Text('\$340.00', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: const [
                          Column(children: [Text('You Paid', style: TextStyle(color: Colors.white70)), Text('\$180.00', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))]),
                          Column(children: [Text('You Owe', style: TextStyle(color: Colors.white70)), Text('\$20.00', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.bold))]),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                const Text('Who Owes Whom (Settlement)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                ListTile(
                  leading: const CircleAvatar(child: Text('E')),
                  title: const Text('Elena Rostova owes You'),
                  subtitle: const Text('For Villa Deposit'),
                  trailing: const Text('\$80.00', style: TextStyle(color: AppTheme.successGreen, fontWeight: FontWeight.bold)),
                ),
                ListTile(
                  leading: const CircleAvatar(child: Text('M')),
                  title: const Text('You owe Marcus'),
                  subtitle: const Text('For Car Rental'),
                  trailing: const Text('\$20.00', style: TextStyle(color: AppTheme.errorRed, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildItineraryTile(String time, String title, String cost, int votes) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
          child: Text(time, style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(cost),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(icon: const Icon(Icons.thumb_up_alt_outlined, size: 20), onPressed: () {}),
            Text('$votes'),
          ],
        ),
      ),
    );
  }

  // --- TAB 5: SAFETY & PROFILE ---
  Widget _buildSafetyAndProfileTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Center(
          child: Column(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: NetworkImage(_currentUser.photoUrl),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(color: AppTheme.successGreen, shape: BoxShape.circle),
                      child: const Icon(Icons.check, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(_currentUser.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 18),
                  Text(' ${_currentUser.trustScore} Trust Rating', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 12),
                  Text('${_currentUser.tripsCompleted} Trips Completed', style: const TextStyle(color: Colors.grey)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // Verified Status Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: AppTheme.primaryBlue.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
          child: Row(
            children: const [
              Icon(Icons.verified_user, color: AppTheme.primaryBlue, size: 32),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Government ID Verified', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Passport & Phone OTP confirmed', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),
        const Text('Preferences & Style', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: [
            Chip(label: Text('Style: ${_currentUser.travelStyle}')),
            Chip(label: Text('Tier: ${_currentUser.budgetTier}')),
            Chip(label: Text('Lang: ${_currentUser.languages.join(", ")}')),
          ],
        ),

        const SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: () => _showSOSDialog(context),
          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
          icon: const Icon(Icons.warning, color: Colors.white),
          label: const Text('EMERGENCY SOS BUTTON', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  void _showSOSDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.red),
            SizedBox(width: 8),
            Text('EMERGENCY SOS ALERT'),
          ],
        ),
        content: const Text('Pressing CONFIRM will send your live GPS location to your Emergency Contacts & local support team immediately.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('🚨 SOS Alert Triggered! Emergency contacts notified with live GPS.')),
              );
            },
            child: const Text('CONFIRM SOS', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showCreateTripSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, top: 20, left: 20, right: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Create New Trip Plan', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const TextField(decoration: InputDecoration(labelText: 'Trip Title (e.g. Paris Summer Tour)')),
            const TextField(decoration: InputDecoration(labelText: 'Destination City & Country')),
            const TextField(decoration: InputDecoration(labelText: 'Estimated Budget per Person (\$USD)')),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('🎉 New Trip Plan Published!')));
              },
              child: const Center(child: Text('Publish Trip')),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
