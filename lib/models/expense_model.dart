class ExpenseModel {
  final String id;
  final String tripId;
  final String title;
  final double amount;
  final String paidById;
  final List<String> splitBetweenIds;
  final String category; // Food, Transport, Accommodation, Activities
  final DateTime date;

  ExpenseModel({
    required this.id,
    required this.tripId,
    required this.title,
    required this.amount,
    required this.paidById,
    required this.splitBetweenIds,
    required this.category,
    required this.date,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'tripId': tripId,
      'title': title,
      'amount': amount,
      'paidById': paidById,
      'splitBetweenIds': splitBetweenIds,
      'category': category,
      'date': date.toIso8601String(),
    };
  }

  factory ExpenseModel.fromMap(Map<String, dynamic> map) {
    return ExpenseModel(
      id: map['id'] ?? '',
      tripId: map['tripId'] ?? '',
      title: map['title'] ?? '',
      amount: (map['amount'] as num).toDouble(),
      paidById: map['paidById'] ?? '',
      splitBetweenIds: List<String>.from(map['splitBetweenIds'] ?? []),
      category: map['category'] ?? 'General',
      date: DateTime.parse(map['date']),
    );
  }
}
