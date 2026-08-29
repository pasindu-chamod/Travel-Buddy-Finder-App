import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../models/trip_model.dart';
import '../models/expense_model.dart';
import '../models/itinerary_model.dart';

class DatabaseService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // --- USER OPERATIONS ---
  Future<void> createUserProfile(UserModel user) async {
    await _db.collection('users').doc(user.id).set(user.toMap());
  }

  Future<UserModel?> getUserProfile(String userId) async {
    final doc = await _db.collection('users').doc(userId).get();
    if (doc.exists && doc.data() != null) {
      return UserModel.fromMap(doc.data()!);
    }
    return null;
  }

  Stream<List<UserModel>> getMatchedUsers(String currentUserId, String destination) {
    return _db
        .collection('users')
        .where('id', isNotEqualTo: currentUserId)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => UserModel.fromMap(doc.data())).toList());
  }

  // --- TRIP OPERATIONS ---
  Future<void> createTrip(TripModel trip) async {
    await _db.collection('trips').doc(trip.id).set(trip.toMap());
  }

  Stream<List<TripModel>> getOpenTrips({bool womenOnly = false}) {
    Query query = _db.collection('trips').where('status', isEqualTo: 'Open');
    if (womenOnly) {
      query = query.where('isWomenOnly', isEqualTo: true);
    }
    return query.snapshots().map(
          (snapshot) => snapshot.docs.map((doc) => TripModel.fromMap(doc.data() as Map<String, dynamic>)).toList(),
        );
  }

  Future<void> joinTrip(String tripId, String userId) async {
    await _db.collection('trips').doc(tripId).update({
      'currentMemberIds': FieldValue.arrayUnion([userId])
    });
  }

  // --- EXPENSE OPERATIONS ---
  Future<void> addExpense(ExpenseModel expense) async {
    await _db
        .collection('expenses')
        .doc(expense.tripId)
        .collection('items')
        .doc(expense.id)
        .set(expense.toMap());
  }

  Stream<List<ExpenseModel>> getTripExpenses(String tripId) {
    return _db
        .collection('expenses')
        .doc(tripId)
        .collection('items')
        .orderBy('date', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs.map((doc) => ExpenseModel.fromMap(doc.data())).toList());
  }

  // --- ITINERARY OPERATIONS ---
  Future<void> addItineraryItem(ItineraryItem item) async {
    await _db
        .collection('itinerary')
        .doc(item.tripId)
        .collection('activities')
        .doc(item.id)
        .set(item.toMap());
  }

  Future<void> upvoteActivity(String tripId, String activityId) async {
    await _db
        .collection('itinerary')
        .doc(tripId)
        .collection('activities')
        .doc(activityId)
        .update({'upvotes': FieldValue.increment(1)});
  }

  // --- EMERGENCY SOS ---
  Future<void> triggerSosAlert(String userId, double lat, double lng) async {
    await _db.collection('sos_alerts').add({
      'userId': userId,
      'location': GeoPoint(lat, lng),
      'timestamp': FieldValue.serverTimestamp(),
      'status': 'ACTIVE',
    });
  }
}
