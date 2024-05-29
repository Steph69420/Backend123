const {Notifications}=require('../models/notification');
const {Reservation}=require('../models/reservation');
const express = require('express');
const {User} = require('../models/user');
const { populate } = require('dotenv');
const router = express.Router();
const mongoose=require('mongoose');
const { Product } = require('../models/product');
const {Room}=require('../models/room');
const {Message}=require('../models/message');
router.get('/:id',async (req,res)=>{
    const notifList = await Notifications.find({receiver:req.params.id}).sort({dateSend:-1}).populate({
        path: "reservation",
        populate: {
           path: "product",
           
        }
     }).populate('receiver')
    
    
     if (notifList){
        return res.send(notifList)
    }
    else{
        return res.status(500).json({success: false})
    }
})
 router.post('/acceptReservation',async (req,res)=>{
  const notif= await Notifications.findOne({_id:req.headers.id1}); 
 console.log(req.headers.answer)
    if (req.headers.answer=='true'){
        const reser= await Reservation.findOne({_id:req.headers.reser});
        if(!reser){
            return res.status(500).json({success:'false'});
        }
        reser.status='accepted'
	notif.answered='yes'

        await reser.save();
	await notif.save();
	const userGtr=await User.findById(reser.userGetter)
	const userGvr=await User.findById(reser.userGiver)
	const product=await Product.findById(reser.product)
	let notifi= new Notifications({
	receiver:reser.userGetter,
	content:'Ο χρήστης '+userGvr.name+' αποδέχτηκε να νοικιάσετε το '+product.name,
	type:'a',
	answered:'yes',
	reservation:reser.id
})
	await notifi.save()
	userGtr.unreadNotifications=userGtr.unreadNotifications+1;
	await userGtr.save()
	let room= await Room.findOne({$or:[
	{name:userGvr.id+' '+userGtr.id},
	{name:userGtr.id+' '+userGvr.id}
	]})
	if(!room){
		let room1=new Room({
		user1:userGtr.id,
		user2:userGvr.id,
		name:userGtr.name+' '+userGvr.name,
		lastTimeUpdated:Date.now()})
		room1=await room1.save()
		let message=new Message({
		sender:userGvr.id,
		reciver:userGtr.id,
		content:'Γεια, \nXαίρομαι που επέλεξες το '+product.name+' ότι χρειαστείς ενημέρωσε με',
		roomId:room1.id});
		await message.save();
	}else{
let message=new Message({
		sender:userGvr.id,
		reciver:userGtr.id,
		content:'Γεια \n χαίρομαι που επέλεξες το '+product.name+' ότι χρειαστείς ενημέρωσε με',
		roomId:room.id});
		await message.save()
		room.lastTimeUpdated=Date.now()
		await room.save()
	}
        console.log(reser.status)
        return res.status(200).json({succes:'true'}) 
    }
    else{
        const reser= await Reservation.findById(req.headers.reser);
        if(!reser){
            return res.status(500).json({success:'false'});
        }
        reser.status='declined'
	notif.answered='yes';
	await notif.save();
        await reser.save();
	const userGtr=await User.findById(reser.userGetter)
	const userGvr=await User.findById(reser.userGiver)
	const product=await Product.findById(reser.product)
	const notifi= new Notifications({
	receiver:reser.userGetter,
	content:'Ο χρήστης '+userGvr.name+' απέριψε την ενοικίαση του '+product.name,
	type:'a',
	answered:'yes',
	reservation:reser.id
})
	await notifi.save()
        
console.log(reser.status)
        return res.status(201).json({succes:'true'}) 
    }
 })
router.put('/updateNotification/:id', async (req, res) => {
 
 try {
    const [notificationId,userId] = req.params.id.split(',')
    const user=await User.findById(userId)

    // Find the user by ID
    const notification = await Notifications.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the specified field dynamically and increment numberOfPendingRes
    
    notification.opened = 'yes'; // Increment numberOfPendingRes

    // Save the updated user
    await notification.save();
    user.unreadNotifications=user.unreadNotifications-1
    await user.save();
    res.json({ message: 'notification updated successfully',notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports =router;
