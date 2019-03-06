var jwt = require('jsonwebtoken');
var config = require('../../config/config.js');

function verifyToken(req, res, next) {
  var token = req.headers['authorization'];
  if (!token)
    return res.status(401).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secretKey, function(err, decoded) {
    if (err)
    return res.status(401).send({ auth: false, message: 'unable to verify token' });
    // if everything good, save to request for use in other routes
    req.userId = decoded.id;
    next();
  });
}
module.exports = verifyToken;