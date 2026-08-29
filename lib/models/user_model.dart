class UserModel {
  final String id;
  final String name;
  final String email;
  final String photoUrl;
  final String bio;
  final String gender;
  final int age;
  final String travelStyle; // e.g. Backpacker, Luxury, Adventure
  final String budgetTier;  // e.g. Budget, Moderate, Luxury
  final List<String> languages;
  final bool isVerified;
  final double trustScore;  // 0.0 to 5.0 rating
  final int tripsCompleted;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    this.bio = 'Passionate traveler exploring the world one city at a time!',
    this.gender = 'Female',
    this.age = 24,
    this.travelStyle = 'Adventure',
    this.budgetTier = 'Budget',
    this.languages = const ['English', 'Spanish'],
    this.isVerified = true,
    this.trustScore = 4.8,
    this.tripsCompleted = 12,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'photoUrl': photoUrl,
      'bio': bio,
      'gender': gender,
      'age': age,
      'travelStyle': travelStyle,
      'budgetTier': budgetTier,
      'languages': languages,
      'isVerified': isVerified,
      'trustScore': trustScore,
      'tripsCompleted': tripsCompleted,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      photoUrl: map['photoUrl'] ?? '',
      bio: map['bio'] ?? '',
      gender: map['gender'] ?? 'Other',
      age: map['age'] ?? 20,
      travelStyle: map['travelStyle'] ?? 'Backpacker',
      budgetTier: map['budgetTier'] ?? 'Budget',
      languages: List<String>.from(map['languages'] ?? []),
      isVerified: map['isVerified'] ?? false,
      trustScore: (map['trustScore'] as num?)?.toDouble() ?? 5.0,
      tripsCompleted: map['tripsCompleted'] ?? 0,
    );
  }
}
