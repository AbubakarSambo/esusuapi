const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: String,
    username: String,
    email: String,
    password: String,
    creditScore: Number,
    bvn: String,
    subAccountCode: String,
    paid: Boolean
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);