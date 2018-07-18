const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var shortid = require('shortid');

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

var db = mongoose.connection;

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var userSchema = mongoose.Schema({
  /* _id will be added automatically by mongoose */
  _id: {
  type: String,
  default: shortid.generate
},
  username: {type: String, required: true},
});
var userModel = mongoose.model('User', userSchema);

var exerciseSchema = mongoose.Schema({
  
  userId: {type: String, required: true},
  
  description: {  type: String,
                      required: true },
  
  duration: {  type: String,
                      required: true },
  date: Date
    
});

var exerciseModel = mongoose.model('Exercise', exerciseSchema);

app.use(express.static('public'))

app.post('/api/exercise/new-user', function(req, res) {
  
  if (!req.body) return res.sendStatus(400)  
        
    var document = new userModel({username: req.body.username});
    
    document.save(function(err, data) {
    
    if (err) console.log(err);
    else {
      res.json({username:data.username, userid:data._id});
    }

})
});

app.post('/api/exercise/add', function(req, res) {

  if (!req.body) return res.sendStatus(400)  
  
    var document = new exerciseModel({userId: req.body.userId, description: req.body.description, duration: req.body.duration, date: req.body.date});
    
    document.save(function(err, data) {
    
    if (err) console.log(err);
    else {
      res.json({userId:data.userId, description:data.description, duration: data.duration, date: data.date});
    }
    });
  

});

// KdMP1Nlrd
//https://steep-rain.glitch.me/api/exercise/log?userId=KdMP1Nlrd
  //https://steep-rain.glitch.me/api/exercise/log?userId=KdMP1Nlrd&from=2018-09-19
// 7ShP5Ymzk

app.get('/api/exercise/log', (req, res) => {
    
    var userId = req.query.userId;
    var toString = req.query.to;
    var fromString = req.query.from;
    var limitString = req.query.limit;

    if (!userId) res.json('Please enter a userId');

    var query = exerciseModel.find({ userId: userId});

    if (typeof toString !== 'undefined') {
      var to = new Date(toString);
      query.where('date').lte(to);
    }

    if (typeof fromString !== 'undefined') {
      var from = new Date(fromString);
      query.where('date').gte(from);
    }

    if (typeof limitString !== 'undefined') {
      query.limit(parseInt(limitString));
    }

    query.exec(function (err, docs) {

    var data = [];
    docs.forEach(function(doc) {
      data.push({
        userId: doc.userId,
        description: doc.description,
        date: doc.date,
        duration: doc.duration
      });
    });
    
    res.json(data);
    
      
  });

});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
