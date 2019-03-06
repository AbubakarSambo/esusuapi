const verifyToken = require('../middleware/verifytoken.js')
const user = require('../controllers/user.js');
const group = require('../controllers/group.js');


module.exports = function(app) {
    app.post('/user', user.create);
    app.post('/login', user.login);
    app.post('/group',verifyToken, group.create);
    app.post('/group/join',verifyToken, group.join);
    app.post('/group/start',verifyToken, group.start);
    app.get('/group/:code',verifyToken, group.getSingle);
    app.get('/group',verifyToken, group.getAll);
    app.get('/user/details',verifyToken, group.getUserDetails);
    app.post('/api/makepayment', verifyToken, user.makePayment);
    app.post('/api/callback/paystack', user.paystackCallback);

}