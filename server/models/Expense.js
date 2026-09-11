const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Accommodation', 'Food', 'Transport', 'Activities', 'Shopping', 'Other'],
    default: 'Other'
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
