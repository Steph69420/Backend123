const { Category } = require('../models/category');
const {Product} = require('../models/product')
const mongoose=require('mongoose');
const express = require('express');
const router = express.Router();
const multer=require('multer')

const FILE_TYPE_MAP={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'

}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid=FILE_TYPE_MAP[file.mimetype];
        let uploadError= new Error('invalid image type');
        if(isValid){
            uploadError=null
        }

        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName=file.originalname.split(' ').join('-');
      const extension= FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })


router.get(`/`,async (req,res)=>{
    
    let filter={};
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category').populate('user');

    if(!productList){
      return res.status(500).json({succes: false})
    }
    res.send(productList);

    
})
router.get(`/no/:id`,async (req,res)=>{
    
    
    console.log(req.params.id)
    const productList = await Product.find({user: { $ne: req.params.id } }).populate('category').populate('user');
    
    if(!productList){
      return res.status(500).json({succes: false})
    }
    res.send(productList);

    
})


router.get('/name', async (req, res) => {
    const { query } = req;
    const { name } = query;
    let filter = {};

    if (!name) {
        return res.status(400).json({ error: 'Name query parameter is required' });
    }

    // Use a regular expression to find products with names containing the specified substring
    filter = { name: { $regex: name, $options: 'i' } };

    try {
        const filteredProducts = await Product.find(filter).populate('category').populate('user');
        res.json(filteredProducts);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get(`/categories/:id`,async (req,res)=>{
    
    
    const productList = await Product.find({category:req.params.id}).populate('category').populate('user');
   
    if(!productList){
      return res.status(500).json({succes: false})
    }
    res.send(productList);

    
})
router.get(`/:id`,async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category').populate('user');
    if(!product){
        return  res.status(500).json({succes: false, message: "No such Id"})
    }
    res.send(product);

    
})

router.post(`/`, uploadOptions.single('image'), async (req,res)=>{
    //category12=await Category.find()
    //console.log(category12.name,category12._id)
    console.log(req.body)
    const category = await Category.findById(req.body.category);
    
    if(!category) return res.status(400).send('Invalid Category')
    const file = req.body.image;
console.log(req)
    if(!file) return res.status(400).send('No image in the request')
    const fileName=req.body.image
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`;
    let product=new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        user:req.body.user,
        address:req.body.address
    })

    product = await product.save();
    if(!product)
    return res.status(500),send('The product cannot be created')
    
    return res.send(product);
})


router.put('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')
    
    const product= await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    },{new: true}
    )
    if(!product)
    return res.status(400).send('the product cannot be updated!')
    res.send(product);

    
})

router.delete('/:id',(req,res)=>{
    Product.findByIdAndDelete(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({succes: true, message: 'the product is deleted'})
        }else{
            return res.status(404).json({succes: false, message: "product not found"})
        }
    }).catch(err=>{
        return res.status(400).json({succes: false, message: "error"})
    })
})

router.get(`/get/count`,async (req,res)=>{
    const productCount = await Product.countDocuments();
    if(!productCount){
        return  res.status(500).json({succes: false})
    }
    res.send({
        productCountcount: productCount
    });

    
})


router.get(`/get/featured/:count`,async (req,res)=>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count);
    if(!products){
        return  res.status(500).json({succes: false})
    }
    res.send(products);

    
})

router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)


module.exports=router;