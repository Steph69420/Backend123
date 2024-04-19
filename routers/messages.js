const {Message} = require('../models/message');
const express = require('express');
const { populate } = require('dotenv');
const router = express.Router();
const mongoose=require('mongoose');
const { Product } = require('../models/product');


router.get('/:id', async (req,res)=>{
    const messages=await Message.find({reciver:req.params.id}).sort({_id:-1})   
    if(!messages){
       return res.status(300).send({data:'user has no messages'})
    }
    return res.send(messages)
})
module.exports =router;