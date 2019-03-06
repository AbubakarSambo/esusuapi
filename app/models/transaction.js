const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = mongoose.Schema({
    email: String,
    amount: String,
    groupCode: String,
    User: { type: Schema.Types.ObjectId, ref: 'User' },
    reference: String,
    paidAt: Date,
    successful: {type: Boolean, default: false},
    reason: String
    
},
    {
        timestamps: true
    });

module.exports = mongoose.model('Transaction', TransactionSchema, 'Transactions');