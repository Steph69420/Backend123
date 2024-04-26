const express = require('express');
const {Room}=require('../models/room');
const router = express.Router();

router.get('/userRooms/:id',async(req,res)=>{
    console.log('aaaa')
    const userRooms= await Room.find({$or: [
        { user1:req.params.id },
        { user2:req.params.id}
    ]})
    if(!userRooms){
        console.log(userRooms)
        return res.status(500).json({message: 'User has no open Conversation'})
    }
    console.log(userRooms)
    return res.send(userRooms)
})

module.exports =router;