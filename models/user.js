const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    image:{
        type:String,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    street: {
        type: String,
        default: ''
    },
    apartment: {
        type: String,
        default: ''
    },
    zip :{
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    numberOfPendingRes:{
        type:Number,
	
        default:0
    },
    country: {
        type: String,
        default: ''
    },
    unreadNotifications:{
	type:Number,
	default:0
    },
    lastItemsVisited:{
	type:[mongoose.Schema.Types.ObjectId],
	ref:'Product',
	default:[]}

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;
