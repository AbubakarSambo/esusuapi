const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const Group = require('../models/group.js');
const bcrypt = require('bcryptjs');
const config = require('../../config/config.js')
const axios = require('axios')



createSubAccount = (body) => {
    console.log(body, 'lll')
    return axios.post('https://api.paystack.co/subaccount', body,
        {
            headers: {
                'Authorization': 'Bearer sk_test_440e9b2653d28f9cc48db38cffe76233f948859c',
                'Content-Type': 'application/json',
            },
        })
}
confirmPayment = (reference) => {
    return axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            'Authorization': 'Bearer sk_test_e7c07d0bc57cbf46a6cc211af376ce0dfaf0cf4a',
        }
    })
}
exports.create = async function (req, res) {
    const { firstName, lastName, password, email, phone, bank, accountNumber } = req.body
    try {
        if (firstName && lastName && password && phone) {
            User.findOne({ email })
                .then(user => {
                    if (!user) {
                        const hashedPassword = bcrypt.hashSync(password, 8)
                        let newUser = new User({ firstName, lastName, password: hashedPassword, email, phone });
                        newUser.save()
                            .then(created => {
                                const token = jwt.sign({ id: created._id }, config.secretKey, { expiresIn: 86400 });
                                return res.status(201).send({ token });
                            })
                            .catch(error => {
                                res.status(500).send(error);
                            })
                    }
                    else {
                        res.status(400).send({ message: "That email is in use" });
                    }
                })
                .catch(err => {
                    console.log('err', err)
                });


        }
        else {
            res.status(500).send({ message: "Missing required field" });
        }
    }
    catch (err) {
        console.log(err)
        return res.status(400).send(err)
    }
}

// exports.create = async function (req, res) {
//     const { firstName, lastName, password, email, phone, bank, accountNumber } = req.body
//     try {
//         if (firstName && lastName && password && phone) {
//             console.log(bank)
//             const subAccountResponse = await this.createSubAccount({
//                 business_name: `${firstName} ${lastName}`,
//                 settlement_bank: bank,
//                 account_number: accountNumber,
//                 percentage_charge: 98.5
//             })
//             console.log(subAccountResponse.data)
//             if(subAccountResponse.data.status){
//                 User.findOne({ email })
//                 .then(user => {
//                     if (!user) {
//                         const hashedPassword = bcrypt.hashSync(password, 8)
//                         let newUser = new User({ firstName, lastName, password: hashedPassword, email, phone, subAccountCode: subAccountResponse.data.data.subaccount_code });
//                         newUser.save()
//                             .then(created => {
//                                 const token = jwt.sign({ id: created._id }, config.secretKey, { expiresIn: 86400 });
//                                 return res.status(201).send({ token });
//                             })
//                             .catch(error => {
//                                 res.status(500).send(error);
//                             })
//                     }
//                     else {
//                         res.status(400).send({ message: "That email is in use" });
//                     }
//                 })
//                 .catch(err => {
//                     console.log('err', err)
//                 });
//             }
//             else{
//                 res.status(500).send({ message: "Could not create your subaccount buddy" });
//             }

//         }
//         else {
//             res.status(500).send({ message: "Missing required field" });
//         }
//     }
//     catch (err) {
//         console.log(err)
//         return res.status(400).send(err)
//     }
// }

exports.login = function (req, res) {
    const { password, email } = req.body
    User.findOne({ email }).then((user) => {
        if (!user) return res.status(404).send({ message: 'That Username does not exist' });
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ message: 'Invalid Password' });
        const token = jwt.sign({ id: user._id }, config.secretKey, { expiresIn: 86400 });
        return res.status(200).send({ user, token });
    })

};

exports.makePayment = async function (req, res) {
    const { email, amount, groupCode } = req.body

    Group.findOne({ code: groupCode }).then((group) => {
        console.log(group)
    })
    // try {
    //     const response = await this.paystackapi(email, amount)
    //     User.findOne({ email }).then((user) => {
    //         let transaction = new Transaction({ email, amount, groupCode, User: user, reference: response.data.data.reference });
    //         transaction.save().then((newTransaction) => {
    //             return res.status(200).send(response.data)
    //         }).catch((error) => {
    //             return res.status(400).send({ message: error })
    //         })
    //     })

    // }
    // catch (err) {
    //     return res.status(400).send(err)
    // }
};

exports.paystackCallback = async function (req, res) {
    const { data } = req.body
    const confirmation = await this.confirmPayment(data.reference)
    if (confirmation.data.data.status === 'success') {
        Transaction.findOneAndUpdate({ reference: data.reference }, { successful: true, paidAt: confirmation.data.data.transaction_date }).then((item) => {
            console.log(item)
        }).catch((error) => {
            console.log(error)
        })
    }
    else {
        Transaction.findOneAndUpdate({ reference: data.reference }, { successful: false, reason: confirmation.data.data.gateway_response }).then((item) => {
            console.log(item)
        }).catch((error) => {
            console.log(error)
        })
    }

};