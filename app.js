require('dotenv/config');
const express = require('express');
const http = require('http');  // Import the HTTP module
const socketIo = require('socket.io'); // Import socket.io
const app = express();
const server = http.createServer(app); // Create an HTTP server and attach the Express app to it
const io = socketIo(server); // Attach socket.io to the HTTP server
const {Message} =require('../BACKEND1/models/message')
const {User}=require('../BACKEND1/models/user')
const {Room}=require('../BACKEND1/models/room')
const generateRoomName = (userId1, userId2) => {
    // Sort the user IDs to ensure the room name is always the same regardless of the order
    return [userId1, userId2].sort().join('_');
};

const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt);
app.use(errorHandler);
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));

// Routes
const categoriesRoutes = require('./routers/categories');
const productsRoutes = require('./routers/products');
const usersRoutes = require('./routers/users');
const orderRoutes = require('./routers/orders');
const reservationRoutes = require('./routers/reservations');
const messagesRoutes = require('./routers/messages');
const roomsRoutes=require('./routers/rooms')
const notificationsRoutes=require('./routers/notifications')

app.use(`${process.env.API_URL}/products`, productsRoutes);
app.use(`${process.env.API_URL}/categories`, categoriesRoutes);
app.use(`${process.env.API_URL}/users`, usersRoutes);
app.use(`${process.env.API_URL}/orders`, orderRoutes);
app.use(`${process.env.API_URL}/reservations`, reservationRoutes);
app.use(`${process.env.API_URL}/messages`, messagesRoutes);
app.use(`${process.env.API_URL}/rooms`,roomsRoutes)
app.use(`${process.env.API_URL}/notifications`,notificationsRoutes)
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
    console.log('Database Connection is Ready...')
})
.catch((err) => {
    console.log(err);
});

// WebSocket handling
io.on('connection', (socket) => {
    console.log('New client connected');
   
    // Join a room specific to the chat between two users
    socket.on('joinChat', ({ userId, otherUserId }) => {
       
        const checkForRoom=async()=>{
            const room2= await Room.findOne({
                $or: [
                { name: userId+' '+otherUserId },
                { name:otherUserId+' '+userId}
            ]})
            if (!room2){
                const usr1=await User.findById(userId)
                const usr2= await User.findById(otherUserId)
                let room1=new Room({
                    user1:userId,
                    user2:otherUserId,
                    name:userId+' '+otherUserId
                })
                 room1=await room1.save();
                socket.join(room1.name);
                console.log(`User ${userId} joined the new room: ${room1.name}`);
            }else{
                socket.join(room2.name);
                console.log(`User ${userId} joined room: ${room2.name}`);
            }
            
        }
        
        checkForRoom();
        
        
    });

    // Handle sending messages within the chat room
    socket.on('sendMessage', ({ message }) => {
        let message1
        const send=async(message1)=>{
            const roomName = await Room.findById(message1.roomId)
            console.log(message1)
            // Emit the message only to users in the specific room
            
            io.to(roomName.name).emit('newMessage', {
                message1
            });
        }
        
        
        
        const postMessage= async()=>{
            
            const user=await User.findById(message.senderId)
            const roomName=await Room.findOne({$or: [
                { name: message.senderId+' '+message.receiverId },
                { name:message.receiverId+' '+message.senderId}
            ]})
            
            
            
                message1=new Message({
                sender:message.senderId,
                reciver:message.receiverId,
                content:message.text,
                roomId:roomName._id,
                
            })
            message1=await message1.save()
            roomName.lastTimeUpdated=Date.now()
            await roomName.save()
            send(message1)
            
           
        }
        
        postMessage();
        
        
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8081, () => { // Use server.listen instead of app.listen
    console.log(`Server is running on http://localhost:8089`);
});
