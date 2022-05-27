var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
const { MongoClient } = require('mongodb')
// const { nextTick } = require('process');
var parser = require('ua-parser-js');
const { BROWSER } = require('ua-parser-js');


var userAgent = ''
// var userStats = {}
const dbName = 'chaterroom'
const colName = 'chats'
const url = 'mongodb://localhost:27017' || process.env.MONGODB_URI
var name;


app.get('/', (req, res) => {
  userAgent = parser(req.headers['user-agent'])
  var browser = userAgent['browser']
  var os = userAgent['os']
  console.log(userAgent)
  let userStats = Object.assign(os, browser)
  console.log(os)
  res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(path.join(__dirname,'./public')));


io.on('connection', (socket) => {
  console.log('new user connected');
  
  socket.on('joining msg', (username) => {
  	name = username;
    console.log(username)
  	io.emit('chat message', `---${name} joined the chat---`);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chat message', `---${name} left the chat---`);
    
  });
  socket.on('chat message', (msg) => {
    MongoClient.connect(url, function (err, client) {
      if (err) {
        console.log(err)
      } else {
        async function InsertOne(value) {
          await client.db(dbName).collection(colName).insertOne(value)
        }
        InsertOne(value)
      }
    })
    value = {name: name, message: msg}
    socket.broadcast.emit('chat message', msg);         //sending message to all except the sender
  });
});

const port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Server listening on :' + port);
});


app.get('/jerit/chats/logs', (req, res) => {
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log(err)
    } else {
      async function find() {
        const msg = await client.db(dbName).collection(colName).find().toArray((err, message) => {
          if (err) {
            console.error(err)
            return
          } else {
            res.json(message)
          }
        })

      }
      find()
    }
  })
})