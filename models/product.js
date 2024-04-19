const mongoose = require('mongoose');
const { Category } = require('./category');

const productSchema = mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default:''
    },

    image: {
        type: String,
        default:''
    },
    images: [{
        type: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countInStock: {
        type: Number,
        
        min: 0,
        max: 255
    },
    rating: {
        type: Number,
        default: 0
    },
    numRevies: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address:{
        type:String,
        required:true
    }
})

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

productSchema.set('toJSON',{
    virtuals: true
});
exports.Product= mongoose.model('Product',productSchema);