const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const deepPopulate = require('mongoose-deep-populate')(mongoose);

const CycleSchema = mongoose.Schema({
    member: { type: Schema.Types.ObjectId, ref: 'User' },
    datePaid: Date,
    paid: Boolean
}, {
    timestamps: true
});

CycleSchema.plugin(deepPopulate);
module.exports = mongoose.model('Cycle', CycleSchema);