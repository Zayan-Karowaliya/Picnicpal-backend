import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerAdmin } from "./controllers/userlogincontroller.js";
import { Server as httpServer } from 'http';
import { Server as socketIOServer } from 'socket.io';
import admin from "./firebaseService.js";
const app = express();
const port = 3000;
const http = httpServer(app);
const io = new socketIOServer(http);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

app.use('/uploads', express.static(path.join(_dirname, 'uploads'))); // Assuming uploads directory exists

import loginrouter from "./routers/login.route.js";
import vehiclerouter from "./routers/vehicleroute.js";
import adminrouter from "./routers/adminroute.js";

registerAdmin();
app.use("/", loginrouter);
app.use("/", adminrouter);
app.use("/",vehiclerouter);
const mongoURL = 'mongodb+srv://zayan:zayan123@cluster0.bhtlvwl.mongodb.net/?retryWrites=true&w=majority';

// Define the message schema for all events
const messageSchema = new mongoose.Schema({
  eventId: String,
  message: String,
  sender: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

const connectdb = mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("connected");
    // Start the HTTP server
    http.listen(3000, () => {
      console.log('listening on *:3000');
    });
  })
  .catch((error) => {
    console.log("error", error);
  });

io.on('connection', async (socket) => {
  console.log('a user connected');

  // Join the socket to a room based on the event ID
  socket.on('joinEvent', async (eventId) => {
    socket.join(eventId);
    // console.log(Event Joined ${eventId});
  });

  socket.on('prev_message', async (eventId) => {
    const messages = await Message.find({ eventId: eventId }).exec();
    console.log('Previous messages:', messages);
    // Emit the previous messages to the client who requested
    socket.emit('previous_messages', messages.map(msg => ({ message: msg.message, sender: msg.sender })));  
  });


  socket.on('message', async (data) => {
    console.log('message:', data);
    const newMessage = new Message({ eventId: data.eventId, message: data.message, sender: data.sender });
    await newMessage.save();
    console.log('Message saved to MongoDB:', newMessage);
    io.to(data.eventId).emit('message', { message: newMessage.message, sender: newMessage.sender });
     // Broadcast the received message to all clients in the event room
  });


  
  socket.on('leaveEvent', (eventId) => {
    console.log('User disconnected from room for event', eventId);
    // Leave the room upon disconnection to prevent further emissions
    socket.leave(eventId);
  });


})