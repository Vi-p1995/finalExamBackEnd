const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  senderAccount: {type: Schema.Types.ObjectId, ref:'Account', required: true},
  receivingAccount: {type: Schema.Types.ObjectId, ref:'Account', required: true},
  amount: {type: Number, required: true},
  date:Date
});

module.exports = mongoose.model('Transaction', TransactionSchema);
