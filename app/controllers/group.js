const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/config.js')

const User = require('../models/user.js');
const Group = require('../models/group.js');
const Cycle = require('../models/cycle.js');
const PaymentSchedule = require('../models/schedule.js');

padToFour = (number) => {
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }

exports.create = function (req,res ) {
    User.findById(req.userId).then((user) => {
        const { name, address, amount, ScheduleCount, scheduleType  } = req.body
        Group.countDocuments().then((count) => {
            const code = this.padToFour(count)
            let newGroup = new Group({ name, address, code, amount, ScheduleCount,scheduleType, admin: user})
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
    Group.findOne({ code }).populate('admin').then((group) => {
        if (!group) return res.status(404).send({message: 'No Such Group found.'});
        return res.status(200).send({ group });
    })

};

exports.getAll = function (req, res) {
    Group.find().deepPopulate(['members','paymentSchedule.recipient','paymentSchedule.cycles', 'admin', 'user']).then((groups) => {
        if (!groups) return res.status(404).send({message: 'No Groups found.'});
        return res.status(200).send({ groups });
    })
};
exports.join = function (req, res) {
    const { code } = req.body
    User.findById(req.userId).then((user) => {
        Group.findOneAndUpdate({code},{ $push: { members: user  } }).then((modifiedGroup) => {
            if(!modifiedGroup){
                return res.status(400).send({message: 'No such group'})
            }
            return res.status(200).send({message: 'Successfully Joined group'})
        })
        .catch((error) => {
            return res.status(400).send({message: error})
        })
    })
};
exports.start = function (req, res) {
    const { code } = req.body
    User.findById(req.userId).then((user) => {
        Group.find({code}).then((singleGroup) => {
            let { members, scheduleType, ScheduleCount } = singleGroup[0]
            let cyclesPromises = []
            let schedulesPromises = []
            members.forEach((item,i) => {
                let cycles = []
                for(let j=0;j<members.length;j++){
                    let cycle = new Cycle({ member: members[j], paid: false , datePaid: new Date()})
                    cyclesPromises.push(cycle.save())
                }
                Promise.all(cyclesPromises).then((cyclesFromPromise) => {
                    let paymentSchedule = new PaymentSchedule({recipient: members[i], date: new Date(), cycles: cyclesFromPromise})
                    // schedulesPromises.push(paymentSchedule.save())
                    paymentSchedule.save().then((schedules) => {
                        Group.findOneAndUpdate({code},{paymentSchedule: schedules}).then((item) => {
                            console.log('doneeee')
                        })
                    })
                })
            })
            // Promise.all(schedulesPromises).then((schedules) => {
            //     Group.findOneAndUpdate({code},{paymentSchedule: schedules}).then((item) => {
            //         console.log('doneeee')
            //     })
            // })
            
        })
    }).catch(() => {
        return res.status(400).send({message: 'Could not find User'})
    })
};