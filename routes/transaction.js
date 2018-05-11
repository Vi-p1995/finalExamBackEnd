var express = require('express');
var router = express.Router();

var Account = require('../models/Account');
var Transaction = require('../models/Transaction');
var auth = require('../middlewares/auth');

function idByIban (req,res,next) { // controlla se esiste l'utente a cui inviare denaro e restituisce il suo account
  Account.findOne({iban:req.params.iban}).exec(function(err,account){
    if (err) return res.status(404).json({error:err})
    if (!account) return res.status(404).json({message:"Account not found"})
    req.receivingAccount = account
    next()
  })
}

router.post('/:iban', auth.verify, idByIban,function(req, res) {

  var transaction = new Transaction()
  transaction.senderAccount = req.account._id;
  transaction.receivingAccount = req.receivingAccount._id;
  if (!req.body.amount) return res.json({message:"you can insert the amount"})
  transaction.amount = req.body.amount
  transaction.date = new Date()

  if(req.account.credit < req.body.amount) return res.status(400).json({message:"the amount is greater than the remaining credit"})
  req.account.credit = req.account.credit - req.body.amount
  req.receivingAccount.credit = req.receivingAccount.credit + req.body.amount

  req.account.save(function(err){ if(err) return res.status(500).json({error:err})})
  req.receivingAccount.save(function(err){ if(err) return res.status(500).json({error:err})})



  transaction.save(function(err,transactionSaved){
    if(err) return res.status(500).json({error:err})
    req.account.transactionSend = transactionSaved._id

    req.account.save(function(err){ if(err) return res.status(500).json({error:err})})
    req.receivingAccount.save(function(err){ if(err) return res.status(500).json({error:err})})

    req.receivingAccount.transactionRecived = transactionSaved._id
    res.json(transactionSaved)
  })
})

router.get('/', auth.verify, function(req, res) {
  if (req.query.mode === "send") {
    Account.find({_id:req.account._id}, 'transactionSend -_id')
    .populate('transactionSend')
    .exec(function(err,account){
      res.json(account[0])
    })

  }else if (req.query.mode === "recived"){
    Account.find({_id:req.account._id}, 'transactionRecived -_id')
    .populate('transactionRecived')
    .exec(function(err,account){
      res.json(account[0])
    })
  }else if (req.query.mode === "date"){
    Account.find({date:req.query.date}, 'transactionSend transactionRecived -_id')
    .populate('transactionRecived transactionSend')
    .exec(function(err,account){
      res.json(account)
    })
  }else if(!req.query.mode){
    Account.find({_id:req.account._id},'transactionSend transactionRecived -_id')
    .populate('transactionRecived transactionSend')
    .exec(function(err,account){
      if(err) return res.status(500).json({error:err})
      res.json(account)
    })
  }

})

module.exports = router;
