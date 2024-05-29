const mongoose = require('mongoose');


const notificationsSchema=new mongoose.Schema({
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    dateSend: {
        type: Date,
        default: Date.now,
    },
    answered:{
	type:String,
	default:'no'
    },
    reservation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        
    },
    opened:{
	type:String,
	default:'no'}
})

notificationsSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

notificationsSchema.set('toJSON', {
    virtuals: true,
});

exports.Notifications=mongoose.model('Notifications',notificationsSchema);
