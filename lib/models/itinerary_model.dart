class ItineraryItem {
  final String id;
  final String tripId;
  final int dayNumber;
  final String timeSlot;
  final String activityTitle;
  final String location;
  final double estimatedCost;
  final int upvotes;

  ItineraryItem({
    required this.id,
    required this.tripId,
    required this.dayNumber,
    required this.timeSlot,
    required this.activityTitle,
    required this.location,
    required this.estimatedCost,
    this.upvotes = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'tripId': tripId,
      'dayNumber': dayNumber,
      'timeSlot': timeSlot,
      'activityTitle': activityTitle,
      'location': location,
      'estimatedCost': estimatedCost,
      'upvotes': upvotes,
    };
  }

  factory ItineraryItem.fromMap(Map<String, dynamic> map) {
    return ItineraryItem(
      id: map['id'] ?? '',
      tripId: map['tripId'] ?? '',
      dayNumber: map['dayNumber'] ?? 1,
      timeSlot: map['timeSlot'] ?? '09:00 AM',
      activityTitle: map['activityTitle'] ?? '',
      location: map['location'] ?? '',
      estimatedCost: (map['estimatedCost'] as num?)?.toDouble() ?? 0.0,
      upvotes: map['upvotes'] ?? 0,
    );
  }
}
