const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const config = require('../../config/config.js')


exports.create = function (req,res ) {
    const { firstName, lastName, password, email, bvn, phone, username } = req.body
    if (firstName && lastName && password && phone && username ) {
        User.findOne({ username })
            .then(user => {
                if (!user) {
                    const hashedPassword = bcrypt.hashSync(password, 8)
                    let newUser = new User({ firstName, lastName, password: hashedPassword, email, phone, bvn, username });
                    newUser.save()
                        .then(created => {
                            const token = jwt.sign({ id: created._id }, config.secretKey, { expiresIn: 86400 });
                            return res.status(201).send({ token });
                        })
                        .catch(error => {
                            console.log('fgg')
                            res.status(500).send(error);
                        })
                }
                else {
                    res.status(400).send({ message: "That username is in use" });
                }
            })
            .catch(err => {
                console.log('err')
            });
    }
    else {
        res.status(500).send({ message: "Missing required field" });
    }
}

exports.login = function (req, res) {
    const { password, username } = req.body
    User.findOne({ username }).then((user) => {
        if (!user) return res.status(404).send({message: 'That Username does not exist'});
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ message: 'Invalid Password' });
        const token = jwt.sign({ id: user._id }, config.secretKey, { expiresIn: 86400 });
        return res.status(200).send({ user, token });
    })

};