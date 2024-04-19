const {Reservation} = require('../models/reservation');
const express = require('express');
//const { ReservationItem } = require('../models/reservation-item');
const { populate } = require('dotenv');
const router = express.Router();
const mongoose=require('mongoose');
const { Product } = require('../models/product');
const { Message } = require('../models/message');
const {User}=require('../models/user')



router.get(`/`, async (req, res) =>{
    const reservationList = await Reservation.find().populate('userGiver', 'name').populate('userGetter' ,'name')

    if(!reservationList) {
        res.status(500).json({success: false})
    } 
    res.send(reservationList);
})

router.get(`/:id`, async (req, res) =>{
    const reservation = await Reservation.findById(req.params.id)
    .populate('user', 'name')
    .populate(  {
            path : 'product', populate: 'category'} 
        );

    if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.get(`/userGiver/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGiver:req.params.id})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGetter/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGetter:req.params.id})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.get(`/product/:id`, async (req, res) =>{
    const reservation = await Reservation.find({product:req.params.id})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})


router.get(`/userGiverPending/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGiver:req.params.id,status:'Pending'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGetterPending/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGetter:req.params.id,status:'Pending'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.get(`/productPending/:id`, async (req, res) =>{
    const reservation = await Reservation.find({product:req.params.id,status:'Pending'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGiverOnProcces/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGiver:req.params.id,status:'OnProcces'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGetterOnProcces/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGetter:req.params.id,status:'OnProcces'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.get(`/productOnProcces/:id`, async (req, res) =>{
    const reservation = await Reservation.find({product:req.params.id,status:'OnProcces'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGiverClosed/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGiver:req.params.id,status:'Closed'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})
router.get(`/userGetterClosed/:id`, async (req, res) =>{
    const reservation = await Reservation.find({userGetter:req.params.id,status:'Closed'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.get(`/productClosed/:id`, async (req, res) =>{
    const reservation = await Reservation.find({product:req.params.id,status:'Closed'})
    
if(!reservation) {
        res.status(500).json({success: false})
    } 
    res.send(reservation);
})

router.post('/', async (req,res)=>{
    console.log(req.body.product)
    let reservation = new Reservation({
        product:req.body.product,
        shippingAddress1: req.body.shippingAddress1,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: 100,
        userGetter: req.body.userGetter,
        userGiver:req.body.userGiver,
        dateStarted:req.body.dateStarted,
        dateEnd: req.body.dateEnd
    })
    reservation = await reservation.save();

    if(!reservation)
    return res.status(400).send('the reservation cannot be created!')
        const product= await Product.findById(req.body.product)
        const user=await User.findById(req.body.userGetter)
        let message=new Message({
        senderName:user.name,
        senderImage:user.image,
        sender:req.body.userGetter,
        reciver:req.body.userGiver,
        content:'Ο χρήστης '+user.name+' θέλει να νοικιάσει το '+product.name+' από τις '+req.body.dateStarted + ' μέχρι τις ' +req.body.dateEnd
     })   
     message=await message.save()
     console.log(message)
    res.status(201).send(reservation);
})


router.put('/:id',async (req, res)=> {
    const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!reservation)
    return res.status(400).send('the reservation cannot be update!')

    res.send(reservation);
})

router.put('/newDates/:id',async (req, res)=> {
    const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        {
            dateStarted:req.body.dateStarted,
            dateEnd: req.body.dateEnd
        },
        { new: true}
    )

    if(!reservation)
    return res.status(400).send('the reservation cannot be update!')

    res.send(reservation);
})


router.delete('/:id', (req, res)=>{
    Reservation.findByIdAndDelete(req.params.id).then(async reservation =>{
        if(reservation) {
        
            return res.status(200).json({success: true, message: 'the reservation is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "reservation not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Reservation.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The reservation sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const reservationCount = await Reservation.countDocuments((count) => count)

    if(!reservationCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        reservationCount: reservationCount
    });
})

router.get(`/get/userreservations/:userid`, async (req, res) =>{
    const userReservationList = await Reservation.find({user: req.params.userid}).populate({ 
        path: 'reservationItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateReservationed': -1});

    if(!userReservationList) {
        res.status(500).json({success: false})
    } 
    res.send(userReservationList);
})



module.exports =router;