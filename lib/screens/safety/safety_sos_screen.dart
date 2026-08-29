import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

class SafetySosScreen extends StatefulWidget {
  const SafetySosScreen({super.key});

  @override
  State<SafetySosScreen> createState() => _SafetySosScreenState();
}

class _SafetySosScreenState extends State<SafetySosScreen> {
  bool _isWomenOnlyEnabled = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Safety & Emergency Center'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Emergency SOS Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.errorRed,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.errorRed.withOpacity(0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Column(
              children: [
                const Icon(Icons.warning_amber_rounded, size: 48, color: Colors.white),
                const SizedBox(height: 12),
                const Text(
                  'ONE-TOUCH EMERGENCY SOS',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Broadcasts live GPS location to local emergency services and your trusted contacts.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.errorRed,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('🚨 SOS Alert Triggered! Emergency contacts notified.')),
                    );
                  },
                  child: const Text('TRIGGER SOS ALERT NOW', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Women Only Mode
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: SwitchListTile(
              secondary: const Icon(Icons.female, color: Colors.pink, size: 32),
              title: const Text('Women Solo Traveler Filter', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Only show verified women travelers and women-only trips'),
              value: _isWomenOnlyEnabled,
              onChanged: (val) => setState(() => _isWomenOnlyEnabled = val),
              activeColor: Colors.pink,
            ),
          ),

          const SizedBox(height: 16),

          // Government ID Verification Status
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: ListTile(
              leading: const Icon(Icons.verified_user, color: AppTheme.primaryBlue, size: 32),
              title: const Text('Government ID Verification', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Status: VERIFIED (Passport & Phone OTP)'),
              trailing: const Icon(Icons.check_circle, color: AppTheme.successGreen),
            ),
          ),

          const SizedBox(height: 16),

          // Trusted Emergency Contacts
          const Text('Emergency Contacts', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: const Text('Mom (Family Emergency)'),
            subtitle: const Text('+1 555-0192-834'),
            trailing: IconButton(icon: const Icon(Icons.phone, color: AppTheme.primaryBlue), onPressed: () {}),
          ),
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: const Text('Local Tourist Police Hotline'),
            subtitle: const Text('+62 361 751500 (Bali)'),
            trailing: IconButton(icon: const Icon(Icons.phone, color: AppTheme.successGreen), onPressed: () {}),
          ),
        ],
      ),
    );
  }
}
