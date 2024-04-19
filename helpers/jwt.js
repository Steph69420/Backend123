
const {expressjwt:jwt} = require('express-jwt');
const secret = process.env.secret
const authJwt = jwt({
    secret,
    algorithms:['HS256'],
    isRevoked: isRevoked
     }).unless({
        path:[
            //{url: /\/public\/reservations(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/products(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/categories(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/users(.*)/ , methods: ['GET', 'OPTIONS'] },
            {url: /\/api\/v1\/reservations(.*)/ , methods: ['GET', 'OPTIONS','POST'] },
            '/api/v1/users/login',
            '/api/v1/users/register',
            '/api/v1/users/googleSignIn'

        ]
     })

     async function isRevoked(req, payload) {
        console.log(req.rawHeaders)
        console.log(payload.payload)
        
       
      }
module.exports = authJwt;