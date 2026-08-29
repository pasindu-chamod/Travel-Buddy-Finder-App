import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';

class CompatibilityCalculator {
  /// Calculates a compatibility percentage (0-100%) between two users
  static int calculateScore(UserModel user1, UserModel user2) {
    int score = 50; // Base score

    // Travel Style Match (+20%)
    if (user1.travelStyle.toLowerCase() == user2.travelStyle.toLowerCase()) {
      score += 20;
    }

    // Budget Tier Match (+15%)
    if (user1.budgetTier.toLowerCase() == user2.budgetTier.toLowerCase()) {
      score += 15;
    }

    // Language Overlap (+10% if shared language)
    final sharedLanguages = user1.languages.where((lang) => user2.languages.contains(lang)).toList();
    if (sharedLanguages.isNotEmpty) {
      score += 10;
    }

    // Trust Score Bonus (+5%)
    if (user2.trustScore >= 4.5) {
      score += 5;
    }

    return score.clamp(0, 100);
  }
}

final matchingProvider = StateProvider<List<UserModel>>((ref) {
  return [
    UserModel(
      id: 'usr_002',
      name: 'Elena Rostova',
      email: 'elena.r@example.com',
      photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
      bio: 'Solo hiker & coffee enthusiast. Excited for Bali waterfalls!',
      gender: 'Female',
      age: 24,
      travelStyle: 'Adventure',
      budgetTier: 'Budget',
      languages: ['English', 'Spanish'],
      isVerified: true,
      trustScore: 4.9,
      tripsCompleted: 14,
    ),
    UserModel(
      id: 'usr_003',
      name: 'Marcus Vance',
      email: 'marcus.v@example.com',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      bio: 'Landscape photographer. Excited to hike alpine trails.',
      gender: 'Male',
      age: 26,
      travelStyle: 'Photography',
      budgetTier: 'Moderate',
      languages: ['English', 'German'],
      isVerified: true,
      trustScore: 4.7,
      tripsCompleted: 8,
    ),
  ];
});
