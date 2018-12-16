const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/config.js')

const User = require('../models/user.js');
const Group = require('../models/group.js');

padToFour = (number) => {
    if (number<=9999) { number = ("000"+number).slice(-4); }
    return number;
  }

exports.create = function (req,res ) {
    User.findById(req.userId).then((user) => {
        const { name, address, amount, cycle } = req.body
        Group.countDocuments().then((count) => {
            const code = this.padToFour(count)
            
            let newGroup = new Group({ name, address, code, amount, cycle,cycleStart: new Date(), admin: user})
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
    Group.find().populate(['members','admin']).then((groups) => {
        console.log(groups)
        if (!groups) return res.status(404).send({message: 'No Groups found.'});
        return res.status(200).send({ groups });
    })
};
exports.join = function (req, res) {
    const { code } = req.body
    User.findById(req.userId).then((user) => {
        Group.findOneAndUpdate({code},{ $push: { members: user  } }).then((modifiedGroup) => {
            console.log(modifiedGroup)
            return res.status(200).send({message: 'Successfully Joined group'})
        })
        .catch((error) => {
            return res.status(400).send({message: error})
        })
    })
};