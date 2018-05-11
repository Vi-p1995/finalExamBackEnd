var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple');
var Account = require('../models/Account');
var auth = require('../middlewares/auth');
var randomstring = require("randomstring");

router.post('/signup', function(req, res) {
    var account = new Account();
    account.name = req.body.name;
    account.surname = req.body.surname;
    account.password = bcrypt.hashSync(req.body.password, 10);
    account.email = req.body.email;
    account.iban = req.body.iban;
    account.credit = req.body.credit;
    account.iban = randomstring.generate();
    account.save(function(err, accountCreated) {
        if (err) return res.status(400).json(err);
        res.status(201).json(accountCreated);
    })
})

router.post('/login', function(req, res) {
    Account.findOne({email: req.body.email}, function(err, account){
        if (account === null) {
            return res.status(404).json({message: 'User not found'})
        } else if (bcrypt.compareSync(req.body.password, account.password)) {
            var token = jwt.encode(account._id, auth.secret);
            return res.json({token: token});
        } else {
            return res.status(401).json({message: 'password not valid'});
        }

    })

})

router.get('/me', auth.verify, function(req, res, next) {
    res.json(req.account);
});


module.exports = router;
