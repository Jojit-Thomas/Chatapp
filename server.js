const express = require('express');
const bodyParser = require('body-parser')
const app = express();
var server = http.createServer(app)
const http = require('http').Server(app)
const io = require('socket.io').listen(server)
const { MongoClient } = require('mongodb')

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


const url = 'mongodb://localhost:27017'

app.get('/messages', (req, res) => {
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log(err)
    } else {
      async function find() {
        const msg = await client.db('chatapp').collection('user').find().toArray((err, message) => {
          if (err) {
            console.error(err)
            // res.status(500).json({ err: err })
            return
          } else {
            // console.log(message)
            res.send(message)
          }
        })

      }
      find()
    }
  })
})


app.post('/messages', async (req, res) => {
  value = req.body
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log(err)
    } else {
      async function InsertOne(value) {
        await client.db('chatapp').collection('user').insertOne(value)
      }
      InsertOne(value)
    }
  })
  io.emit('message', req.body);
  res.sendStatus(200);
})


io.on('connection', () => {
  console.log('a user is connected')
})


// var server = http.listen(3000, () => {
//   console.log('server is running on port', server.address().port);
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

// hello world
// ....
// hello jojit
