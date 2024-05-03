const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    
    shippingAddress1: {
        type: String,
        required: true,
    },
    nameOfProduct:{
        type:String,
        required:true

    },
    phone: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
    },
    userGiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    userGetter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
    dateStarted: {
        type: String,
        required: true
    },
    dateEnd: {
        type: String,
        required: true
    }
})


reservationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

reservationSchema.set('toJSON', {
    virtuals: true,
});

exports.Reservation = mongoose.model('Reservation', reservationSchema);



