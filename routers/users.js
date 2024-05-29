const {User} = require('../models/user');
const express = require ('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Product } = require('../models/product');
router.get(`/`,async (req,res)=> {
    const userList = await User.find().select('-passwordHash');
    if(!userList){
      return res.status(500).json({success: false})
    } 
    res.send(userList);
})
router.get('/:id', async(req,res)=>{
    const user= await User.findById(req.params.id).select('-passwordHash').populate({
      path: 'lastItemsVisited',
      populate: {
        path: 'user',
        
      }
    })
    .exec();
    if(!user){
       return res.status(500).json({message: 'The user with given id was not found'})
    }
    res.status(200).send(user);
})
router.get('/updateNumRandevous/:id', async (req, res) => {
console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
 const [userGiver,userGetter]=req.params.id.split(',')
console.log(userGiver,userGetter) 
 try {
    const userGiverId = userGiver;
    const userGetterId = userGetter;

    // Find the user by ID
    const user1 = await User.findById(userGiverId);
	const user2 = await User.findById(userGetterId);
console.log(user1,user2)
    if (!user1) {
      return res.status(404).json({ message: 'User not found' });
    }
if (!user2) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the specified field and numberOfPendingRes
    user1.numberOfPendingRes = user1.numberOfPendingRes + 1;
    await user1.save()
    user2.numberOfPendingRes = user2.numberOfPendingRes + 1;
    // Save the updated user
    await user2.save();
    res.json({ message: 'User updated successfully', user1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/',async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user= await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')
    res.send(user);
})
router.post('/updateLastItems',async(req,res)=>{
	console.log('haha')
	const user=await User.findById(req.headers.user);
	if(user.lastItemsVisited.length==10){
	user.lastItemsVisited.pop()}
	user.lastItemsVisited=user.lastItemsVisited.filter(item=>item!=req.headers.product)
	user.lastItemsVisited.push(req.headers.product)
	
	await user.save();
	console.log('OK')
	return res.status(201).json('OK');
	})

router.post('/googleSignIn', async (req, res) => {
    const secret = process.env.secret;
    console.log(req.body)
    try {
        // Extract user information from the request
        const { email, name,image } = req.body;
        console.log(email,name)
        // Check if the user's email exists in the MongoDB database
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // User already exists, authenticate the user
            // You can generate a JWT token here and send it back to the client for authentication
            const token = jwt.sign({user_email:existingUser.email,
            user_name:existingUser.name},secret, 
            {expiresIn: '1d'}); 
            console.log(existingUser)// Implement this function to generate JWT token
            res.status(201).send({ user: existingUser, token ,data:'existing'});
        } else {
            // User doesn't exist, create a new user record in MongoDB
            const user = new User({
                name:name,
                email:email,
                passwordHash:'000',
                image:image
                // Other user fields as needed
            });

            // Save the new user record in the MongoDB database
           user= await user.save();

            // Generate JWT token for the newly created user
            const token = jwt.sign({user_name:user.name,user_email:user.email}, secret, 
                {expiresIn: '1d'}) // Implement this function to generate JWT token
            res.status(201).send({ user: user, token });
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req,res)=>{
    console.log(req.body.email)
    const user= await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user){
        console.log('email')
        return res.status(400).send('The user not found')
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userEmail: user.email,
                userName: user.name
            },
            secret, 
            {expiresIn: '1d'}
        )
        return  res.status(200).send({user: user.email, token: token})
    }else {
        console.log('password')
        return res.status(400).send('password is wrong')
    }

})

router.post('/register',async (req,res)=>{
    const secret = process.env.secret;
    console.log(req.body)
const odlUser=await User.findOne({email:req.body.email})

if(odlUser){
    return res.send({data:"This email already exists"})
}
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        
    })
    user= await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    const token = jwt.sign({user_name:user.name,user_email:user.email}, secret, 
        {expiresIn: '1d'}) // Implement this function to generate JWT token
    res.status(201).send({ user: user, token });
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/usersProducts/:id',async (req,res)=>{

    const productUserList= await Product.find({user:req.params.id}).populate('category').populate('user');
    
    if(productUserList.length==0){
        return res.status(500).json({status:500,succes: 'user has no items'})
      }
    res.send({status:200,productUserList});
})
router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments((count) => count)

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})

module.exports= router;
