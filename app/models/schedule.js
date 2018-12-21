const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = mongoose.Schema({ 
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    cycles: [{ type: Schema.Types.ObjectId, ref: 'Cycle' }],
}, {
    timestamps: true
});

module.exports = mongoose.model('PaymentSchedule', ScheduleSchema);