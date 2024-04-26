const mongoose = require('mongoose');

const messageSchema= new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    senderName:{
        type:String,
        required:true,
    },
    senderImage:{
        type:String,
    },
    reciver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    dateSend:{
        type:Date,
        default:Date.now
    },
   content:{
    type:String,
    required:true
   }, 
   roomId:{type:mongoose.Schema.Types.ObjectId,
    ref:'Room',
    required:true}
})


messageSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

messageSchema.set('toJSON', {
    virtuals: true,
});

exports.Message = mongoose.model('Message', messageSchema);
