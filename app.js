var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors')

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dbEnzoExam');

var transaction = require('./routes/transaction');
var account = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors())
app.use('/account', account);
app.use('/transaction', transaction);


var port = 3001;
app.listen(port, ()=>
{console.log("server start at port:", port)})
module.exports = app;
