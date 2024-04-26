const {Message} = require('../models/message');
const express = require('express');
const { populate } = require('dotenv');
const router = express.Router();
const mongoose=require('mongoose');
const { Product } = require('../models/product');
const { Room } = require('../models/room');

router.get('/:id', async (req,res)=>{
    const messages=await Message.find({reciver:req.params.id}).sort({_id:-1})   
    if(!messages){
       return res.status(300).send({data:'user has no messages'})
    }
    return res.send(messages)
})
router.get('/roomsMessages/:id',async(req,res)=>{
    
    const [roomName1,roomName2]=req.params.id.split(',');
    console.log(roomName1,roomName2)
    const room=await Room.findOne({$or: [
        { name:roomName1+' '+roomName2},
        { name:roomName2+' '+roomName1}
    ]})
    const messages=await Message.find({roomId:room._id}).sort({dateSend:-1}).limit(20)
    if(!messages){
        console.log(500)
        return res.status(500).json('No message')
    }
    console.log(200)
    return res.send(messages)
})
module.exports =router;