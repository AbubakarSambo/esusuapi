const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = mongoose.Schema({
    name: String,
    address: String,
    amount: Number,
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    cycle: Number,
    cycleStart: Date,
    code: String,
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    paymentSchedule : []
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', GroupSchema);