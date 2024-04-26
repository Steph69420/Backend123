const mongoose = require('mongoose');

const roomSchema=new mongoose.Schema({
    user1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    user2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    user1Image:{
        type:String
    },
    user2Image:{
        type:String
    },
    user1Name:{
        type:String,
        required:true
    },
    user2Name:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    openedUser1:{
        type:Boolean        
    },
    openedUser2:{
        type:Boolean
    },
    lastTimeUpdated:{
        type:Date,
    }
})

roomSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

roomSchema.set('toJSON', {
    virtuals: true,
});

exports.Room = mongoose.model('Room', roomSchema);