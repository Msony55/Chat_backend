require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const _ = require('lodash');

// socket io
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

// my routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// DB Connection
mongoose
    .connect(process.env.DATABASE,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
        useCreateIndex:true
    })
    .then(() => {
        console.log("DB CONNECTED");
    });

// This is my middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// My Routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);

//  socket code
let users = {};
let userList = new Map();
var userId;
var msgu;
io.on('connection', (socket) => {

  socket.on('userid', function(uid) {
    users[socket.id] = uid;//get userid from server response
    userId = uid;
    io.sockets.emit("userid", uid);

    // broadcast user name 
    let userName = uid;
    addUser(userName, socket.id);
    socket.broadcast.emit('user-list', [...userList.keys()]);
    socket.emit('user-list', [...userList.keys()]);

    // USER IS ONLINE BROAD CAST TO ALL CONNECTED USERS
    io.sockets.emit("online", userId);
    console.log(userId, "Is Online!", socket.id);

    // DISCONNECT EVENT
    socket.on('disconnect', (reason) => {

      // USER IS OFFLINE BROAD CAST TO ALL CONNECTED USERS
      io.sockets.emit("offline", userId);

      // REMOVE OBJECT
      delete users[userId];
      socket.disconnect(); // DISCONNECT SOCKET
      console.log(userId, "Is Offline!", socket.id);
      }) 
   });

  socket.on("msguser", (msg) => {
    msgu = msg;
  })

  //message 
  socket.on("message", (msg) => {
    socket.broadcast.emit("message-broadcast", {message: msg, userName: msgu});
  })
});


function addUser(userName, id) {
  userNameid = userName; 
  if (!userList.has(userName)) {
      userList.set(userName, new Set(id));
  } else {
      userList.get(userName).add(id);
  }
}


// Port
const port = process.env.PORT || 3000;

// Starting a server
http.listen(port,()=>{
    console.log(`app is running at port ${port} !!...`);
})
