const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);


const GroupSchema = mongoose.Schema({
    name: String,
    address: String,
    amount: Number,
    admin: { type: Schema.Types.ObjectId, ref: 'User' },
    scheduleType: String,
    ScheduleCount: Number,
    cycleStart: Date,
    code: String,
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    paymentSchedule : [{ type: Schema.Types.ObjectId, ref: 'PaymentSchedule' }]
}, {
    timestamps: true
});

GroupSchema.plugin(deepPopulate);
module.exports = mongoose.model('Group', GroupSchema);