const express = require('express');
const {Room}=require('../models/room');
const router = express.Router();

router.get('/userRooms/:id',async(req,res)=>{
    
    const userRooms= await Room.find({$or: [
        { user1:req.params.id },
        { user2:req.params.id}
    ]}).sort({lastTimeUpdated:-1}).populate('user1').populate('user2')
    if(!userRooms){
        
        return res.status(500).json({message: 'User has no open Conversation'})
    }
   
    return res.send(userRooms)
})

module.exports =router;