class TripModel {
  final String id;
  final String title;
  final String destination;
  final DateTime startDate;
  final DateTime endDate;
  final double budget;
  final int maxMembers;
  final List<String> currentMemberIds;
  final bool isWomenOnly;
  final String hostId;
  final String coverUrl;
  final String status; // Open, Full, Completed

  TripModel({
    required this.id,
    required this.title,
    required this.destination,
    required this.startDate,
    required this.endDate,
    required this.budget,
    required this.maxMembers,
    required this.currentMemberIds,
    this.isWomenOnly = false,
    required this.hostId,
    required this.coverUrl,
    this.status = 'Open',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'destination': destination,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'budget': budget,
      'maxMembers': maxMembers,
      'currentMemberIds': currentMemberIds,
      'isWomenOnly': isWomenOnly,
      'hostId': hostId,
      'coverUrl': coverUrl,
      'status': status,
    };
  }

  factory TripModel.fromMap(Map<String, dynamic> map) {
    return TripModel(
      id: map['id'] ?? '',
      title: map['title'] ?? '',
      destination: map['destination'] ?? '',
      startDate: DateTime.parse(map['startDate']),
      endDate: DateTime.parse(map['endDate']),
      budget: (map['budget'] as num).toDouble(),
      maxMembers: map['maxMembers'] ?? 4,
      currentMemberIds: List<String>.from(map['currentMemberIds'] ?? []),
      isWomenOnly: map['isWomenOnly'] ?? false,
      hostId: map['hostId'] ?? '',
      coverUrl: map['coverUrl'] ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      status: map['status'] ?? 'Open',
    );
  }
}
