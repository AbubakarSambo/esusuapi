const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/config.js')

const User = require('../models/user.js');
const Group = require('../models/group.js');
const Cycle = require('../models/cycle.js');
const PaymentSchedule = require('../models/schedule.js');

padToFour = (number) => {
    if (number <= 9999) { number = ("000" + number).slice(-4); }
    return number;
}

exports.create = function (req, res) {
    User.findById(req.userId).then((user) => {
        const { name, address, amount } = req.body
        Group.countDocuments().then((count) => {
            const code = this.padToFour(count)
            let newGroup = new Group({ name, address, code, amount, admin: user })
            newGroup.save().then((createdGroup) => {
                return res.status(201).send({ createdGroup });
            })
                .catch(error => {
                    res.status(500).send(error);
                })
        })
    })
}

exports.getSingle = function (req, res) {
    const code = req.params.code
    Group.findOne({ code }).populate(['members','paymentSchedule.recipient','paymentSchedule.details.member', 'admin']).then((group) => {
        if (!group) return res.status(404).send({ message: 'No Such Group found.' });
        return res.status(200).send({ group });
    })

};

exports.getAll = function (req, res) {
    Group.find().deepPopulate(['members', 'paymentSchedule', 'paymentSchedule.recipient', 'admin', 'user']).then((groups) => {
        if (!groups) return res.status(404).send({ message: 'No Groups found.' });
        return res.status(200).send({ groups });
    })
};
exports.join = function (req, res) {
    const { code } = req.body
    User.findById(req.userId).then((user) => {
        Group.findOneAndUpdate({ code }, { $push: { members: user } }).then((modifiedGroup) => {
            if (!modifiedGroup) {
                return res.status(400).send({ message: 'No such group' })
            }
            return res.status(200).send({ message: 'Successfully Joined group' })
        })
            .catch((error) => {
                return res.status(400).send({ message: error })
            })
    })
};
exports.start = function (req, res) {
    const { code } = req.body
    let schedulesPromises = []
    User.findById(req.userId).then((user) => {
        Group.find({ code }).populate(['members']).then((singleGroup) => {
            let newSchedule = singleGroup[0].members.map((itema, index) => {
                let scheduleDetails = singleGroup[0].members.filter((filtered) => {
                    return filtered._id !== itema._id
                }).map((filteredItem) => {
                    return {
                        member: filteredItem,
                        paid: false
                    }
                })
                return ({
                    recipient: itema,
                    date: new Date(Date.now() + (28 * 24 * 60 * 60 * 1000) * (index)),
                    details: scheduleDetails
                })
            })
            Group.findOneAndUpdate({ code }, { paymentSchedule: newSchedule }).then((item) => {
                return res.status(200).send({item})
            })
        })
    })
};