//dependencies
const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('express-flash')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const passport = require('passport')
const port = process.env.PORT || 8080
const path = require('path')
const mongoose = require('mongoose')
const User = require('./model/users')
const Establishment = require('./model/establishments')
const Log = require('./model/logs')
const methodOverride = require('method-override')
const multer = require('multer')
const moment = require('moment')
const dotenv = require('dotenv')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')
dotenv.config()
console.clear()
//MULTER FOR STORAGING IMAGE
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
// const storage = multer.diskStorage({
    
//     destination:(req,file,callback)=>{
//         callback(null,'./public/uploads/images')
//     },
//     filename:(req,file,callback)=>{
//         const ext = file.mimetype.split("/")[1]
//         callback(null,Date.now() + file.originalname)
//     }
// })
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:"DEV"
    }
})
const upload = multer({
    storage: storage,
   
}) // limits:{
    //     fileSize: 1024*1024*3
    // }
//DATABASE
// mongoose.connect('mongodb://localhost:27017/CTA', {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true,
    
// })
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
const db = mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log('Database connected')
})

//MIDDLEWARES

app.use(methodOverride('_method'))
app.use(flash())
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

// PASSPORT STRATEGY, AUTHENTICATION AND AUTHORIZATION
passport.use('elogin',new localStrategy(function(username,password,done){
    Establishment.findOne({username:username},(err,user)=>{
        if(err) return done(err)
        if(!user) return done(null,false,{message:'Invalid username or password!'})
        bcrypt.compare(password,user.password,(err,res)=>{
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password!'})
            return done(null,user)
        })
    })
}))
passport.use(new localStrategy(function(username,password,done){
    User.findOne({username:username},(err,user)=>{
        if(err) return done(err)
        // console.log(`passed username from clogin is : ${username}`);
        if(!user) return done(null,false,{message:'Invalid username or password!'})
        bcrypt.compare(password,user.password,(err,res)=>{
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password!'})
            return done(null,user)
        })
    })
}))
function isLoggedinU(req,res,next){
    if(req.isAuthenticated()){
        if(req.user instanceof User){
            return next()
        }
        else if(req.user instanceof Establishment){
            res.redirect('/establishments-dashboard')
        }
    }
    req.flash('error',{message: 'You have an Invalid session!'})
    res.redirect('/client-dashboard')
}
function isLoggedOutU(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/client-dashboard')
}
function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        if(req.user instanceof Establishment){
            return next()
        }
        else if(req.user instanceof User){
            res.redirect('/client-dashboard')
        }
    }
    req.flash('error',{message: 'You have an Invalid session!'})
    res.redirect('/establishments-dashboard')
 
}
function isLoggedOut(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/establishments-dashboard')
}

passport.serializeUser(function(user,done){
    if(user instanceof Establishment){
        // console.log('Establishment account ni siya chuy');
        // console.log(user.id);
        done(null,{id: user.id, type: 'Establishment'})
    }else if(user instanceof User){
        // console.log('Client account ni siya chuy');
        // console.log(user.id);
        done(null,{id: user.id, type:'Client'})
    }
})
passport.deserializeUser(function(id,done){
   
    if(id.type==='Establishment'){
       Establishment.findById(id.id,function(err,user){
           if(user){
           
               done(null,user)
           }else{
               done(err)
           }
       })
    }
    else if(id.type==='Client'){
        User.findById(id.id,function(err,client){
            if(client){
           
                done(null,client)
            }else{
                done(err)
            }
        })
    }
})

//ROUTES
//ROUTE FOR MAIN
app.get('/',(req,res)=>{
    
    res.render('main/maindash')
})
//ROUTE FOR ESTABLISHMENTS
app.get('/establishments-logs/:id',isLoggedin,async (req,res)=>{
    const {id} = req.params
    const user = req.user
    const data = await Log.findOne({_id:id})
    let arr = []
    data.logs.reverse()
    // , datalogs = data.logs.reverse()
    for(let i=0; i<data.logs.length; i++){
        const d = await User.findOne({_id:data.logs[i].id})
        arr.push(d)
    }
    let currentDate = moment(new Date()).format('MM/DD/YYYY')
    res.render('establishments/elogs',{data,currentDate,arr,user,moment:moment})
})
app.get('/establishments-scanqr/:cam_num',isLoggedin,(req,res)=>{
    const {cam_num} = req.params
    const user = req.user
    res.render('establishments/escanner',{cam_num,user})
})
app.get('/establishments-login',isLoggedOut,(req,res)=>{
    res.render('establishments/login')
})
app.get('/establishments-registration',isLoggedOut,(req,res)=>{
    res.render('establishments/register')
})
app.get('/establishments-user-profile/:id/:datez',isLoggedin,async (req,res)=>{
    const {id,datez} = req.params
    const user = req.user
    const userData = await User.findOne({_id:id})
    res.render('establishments/euserprofile',{user,userData,datez,moment:moment})
})
app.get('/establishments-get-close-contact/:id/:datez',isLoggedin,async(req, res)=>{
    const {id,datez} = req.params
    const user = req.user
    const data = await Log.findOne({_id:user._id})
    const temp = []
    const arr = []
    for(let i=0; i<data.logs.length; i++){
        if(moment(data.logs[i].date).format('LL') === datez && data.logs[i].id !== id){
            temp.push(data.logs[i])
        }
    }
    for(let i=0; i<temp.length; i++){
        const d = await User.findOne({_id:temp[i].id})
        arr.push(d)
    }
    res.render('establishments/closecontacts',{user,temp,arr,moment:moment})
})
app.post('/establishments-update-user-status/:id',isLoggedin,async(req,res)=>{
    const {id} = req.params
    const update = await User.updateOne({_id:id},{status:req.body.status})
    res.redirect(`/establishments-user-profile/${id}`)
})
app.get('/establishments-dashboard',isLoggedin,async (req,res)=>{
    
    const user = req.user
    const data = await Log.findOne({_id:user._id})
    let arr = []
    data.logs.reverse()
    // , datalogs = data.logs.reverse()
    for(let i=0; i<data.logs.length; i++){
        const d = await User.findOne({_id:data.logs[i].id})
        arr.push(d)
    }
    let currentDate = moment(new Date()).format('MM/DD/YYYY')
    
    let day = moment(new Date()).format('LL') //.format('MMM DD YYYY')
    
    // console.log(req.user);
    res.render('establishments/edashboardz',{data,currentDate,arr,user,day,moment:moment})
})
app.get('/logoutE',(req,res)=>{
    req.logOut()
    res.redirect('/establishments-login')
})
app.post('/elogin',passport.authenticate('elogin',{
    successRedirect: '/establishments-dashboard',
    failureRedirect: '/establishments-login',
    failureFlash: true
}))
app.post('/give-qr/:cam_num',(req,res)=>{
    const {cam_num} = req.params
    
    User.findById(req.body.qrText,(err,userz)=>{
        const user = req.user
        if(userz){
            req.flash('success',`Welcome ${userz.firstName} ${userz.lastName}`)
            req.flash('info', userz.image)
            let fullName = `${userz.firstName} ${userz.lastName}`
            let userDets = userz
            const date = new Date()
            const age = moment().diff(userz.birthDate,'years')
            // console.log(`${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            Log.updateOne({_id:user._id},{$push:{logs:[{id:userz._id,date:moment(new Date()).format('MM/DD/YYYY'),time:moment(new Date()).format('hh:mm:ss A'),name:fullName}]}})
                .then(data=>{
                    
                })
                
            // res.redirect(`/establishments-scanqr/${cam_num}`,{user})
            res.render(`establishments/escanner`,{cam_num,userDets,user,age})
        }else{
            req.flash('error','User does not exist!')
            // res.redirect(`/establishments-scanqr/${cam_num}`)
            
            res.render(`establishments/escanner`,{cam_num,user})
        }
    })
})
app.post('/eregister',(req,res)=>{
    const{businessnumber,cperson,cnumber,username,email,password,businessname} = req.body
    Establishment.findOne({username:username},(err,user)=>{
        if(user){
            req.flash('error','Username already taken!')
            res.redirect('/establishment-registration')
        }
        else{
            bcrypt.genSalt(10,function(err,salt){
                if(err) return next()
                bcrypt.hash(password,salt,async function(err,hash){
                    if(err) return next(err)
                    const date = new Date()
                    const newEstablish = new Establishment({
                        businessnumber: businessnumber,
                        businessname: businessname,
                        contactPerson: cperson,
                        contactNumber: cnumber,
                        username: username,
                        email: email,
                        password: hash,
                        dateOfRegistration: `${moment(new Date()).format('MM/DD/YYYY')} ${moment(new Date()).format('hh:mm:ss A')}`
                        
                    })
                    await newEstablish.save()
                        .then(data=>{
                            console.log('Successfully added an establishment user!');
                            Log.insertMany([
                                {_id:data._id}
                            ]).then(data=>{
                                console.log('successfully added a log');
                            })
                        })
                    res.redirect('/establishments-login')
                })
            })
        }
    })
})
//ROUTE FOR CLIENT
app.get('/change-picture/:id',isLoggedinU,(req,res)=>{
    const {id} = req.params
    // console.log(`get id :${id}`);
    res.render('users/change',{id})
})
app.post('/change-picture/:id',upload.single('image'),isLoggedinU,(req,res)=>{
    const {id} = req.params
    // console.log(req.file);
    // console.log(`post id:${id}`);
    // console.log(req.file.filename);
    console.log(req.file.path);
    User.findByIdAndUpdate(id,{image:req.file.path})
        .then(data=>{
            // console.log('Success yawa');
            res.redirect('/client-dashboard')
        })
})

app.get('/client-profile',isLoggedinU,(req,res)=>{
    const user = req.user
    res.render('users/uviewprofile',{user})
})
app.get('/client-profile/edit',isLoggedinU,(req,res)=>{
    const user = req.user
    res.render('users/ueditprofile',{user})
})
app.patch('/client-profile/edit',upload.single('img'),isLoggedinU,async (req,res)=>{
    const user = req.user
    let newPass
    User.findById(user._id,(err,user)=>{
        
        // if(req.file.path === undefined && req.body.opassword == '')
        if((! req.file || ! req.file.path) && req.body.opassword == '')
        {
            console.log("1");
         
            // console.log(user._id);
            User.updateOne({_id:user._id},{emailAddress:req.body.emailAddress,contactNumber:req.body.contactNumber,address:req.body.address}).then(data=>{
               
                res.redirect('/client-profile')
            })
        } 
        // else if(req.file.path === undefined && req.body.opassword != '')
        else if((! req.file || ! req.file.path) && req.body.opassword != '')
        {
            console.log("2");
            bcrypt.compare(req.body.opassword,user.password,(err,resz)=>{
                if(err) return done(err)
                if(resz==false){
                    req.flash('error','Old Password isnt correct')
                    res.redirect('/client-profile/edit')
                }else{
                    bcrypt.genSalt(10,function(err,salt){
                        // if(err) return next()
                        bcrypt.hash(req.body.password,salt,async function(err,hash){
                            if(err){
                                console.log("NI ERROR CHUY");
                            }
                            // console.log(req.body.password);
                            newPass = await hash
                            // console.log("NEWW PASS");
                            // console.log(newPass);
                            User.updateOne({_id:user._id},{password:newPass,emailAddress:req.body.emailAddress,contactNumber:req.body.contactNumber,address:req.body.address,}).then(data=>{
                                // console.log("data");
                                // console.log(data);
                                res.redirect('/client-profile')
                            })
                            // console.log(hash);
                        })
                    })
                }
               
            })
          
        }
        // else if(req.body.opassword == '' && req.file.path !== undefined)
        else if(req.body.opassword == '' && (req.file.path || req.file))
        {
            console.log("3");
            // console.log(user._id);
            User.updateOne({_id:user._id},{emailAddress:req.body.emailAddress,contactNumber:req.body.contactNumber,address:req.body.address,image:req.file.path}).then(data=>{
              
                res.redirect('/client-profile')
            })
        }
        // else if(req.body.opassword != '' && req.file.path !==undefined)
        else if(req.body.opassword != '' && (req.file.path || req.file))
        {
            console.log("4");
            bcrypt.compare(req.body.opassword,user.password,(err,resz)=>{
                if(err) return done(err)
                if(resz==false){
                    req.flash('error','Old Password isnt correct')
                    res.redirect('/client-profile/edit')
                }else{
                    bcrypt.genSalt(10,function(err,salt){
                        // if(err) return next()
                        bcrypt.hash(req.body.password,salt,async function(err,hash){
                            if(err){
                                console.log("NI ERROR CHUY");
                            }
                            // console.log(req.body.password);
                            newPass = await hash
                            // console.log("NEWW PASS");
                            // console.log(newPass);
                            User.updateOne({_id:user._id},{password:newPass,emailAddress:req.body.emailAddress,contactNumber:req.body.contactNumber,address:req.body.address,image:req.file.path}).then(data=>{
                                // console.log("data");
                                // console.log(data);
                                res.redirect('/client-profile')
                            })
                            // console.log(hash);
                        })
                    })
                }
               
            })
        }
        
    })


})
app.get('/logoutU',(req,res)=>{
    req.logOut()
    res.redirect('/client-login')
})
app.get('/client-login',isLoggedOutU,(req,res)=>{
    res.render('users/login')
})
app.get('/client-register',isLoggedOutU,(req,res)=>{
    res.render('users/register')
})
app.get('/client-dashboard',isLoggedinU,(req,res)=>{
    const user = req.user
    // console.log(`user logged in is ${req.user}`);
    res.render('users/udashboard',{user})
})
app.get('/client-new-qr-code',isLoggedinU,(req,res)=>{
    const user = req.user
    res.render('users/unewqr',{user})
})
app.post('/client-login',passport.authenticate('local',{
    successRedirect: '/client-dashboard',
    failureRedirect: '/client-login',
    failureFlash: true
}
))
app.get('/client-qr/:id',(req,res)=>{
    const {id} = req.params
    res.render('users/uqr', {id})
})
app.post('/client-register',(req,res)=>{
    const{firstName,lastName,username,birthDate,address,emailAddress,contactNumber,gender,password} = req.body
    let genPic
    if(gender==='Male'){
        // console.log('nisud sa male');
        genPic = 'https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg'
    }else if(gender==='Female'){
        // console.log('nisud sa female');
        genPic = 'https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultfemale_j2cqjd.jpg'
    }
    
    User.findOne({username:username},(err,user)=>{
        if(user){
            req.flash('error','Username already taken!')
            res.redirect('/client-register')
        }
        else{
            bcrypt.genSalt(10,function(err,salt){
                if(err) return next()
                bcrypt.hash(password,salt,async function(err,hash){
                    if(err) return next(err)
                    const date = new Date()
                    const newUser = new User({
                        firstName: firstName,
                        lastName:lastName,
                        contactNumber: contactNumber,
                        emailAddress: emailAddress,
                        birthDate: moment(birthDate).format('MM/DD/YYYY'),
                        address:address,
                        gender: gender,
                        username:username,
                        password: hash,
                        image: genPic,
                        status: "Not Infected",
                        dateOfRegistration: `${moment(new Date()).format('MM/DD/YYYY')} ${moment(new Date()).format('hh:mm:ss A')}`
                    })
                    let id
                    await newUser.save()
                        .then(data=>{
                            console.log('Successfully added a client user!');
                            id = data._id
                        })
                    res.redirect(`/client-qr/${id}`)
                })
            })
        }
    })
})
app.use((req,res)=>{
    res.status(404).send('TO DO PANI ANG ERROR PAGE PARA SA UNKNOWN ROUTES!')
})
app.use((err,req,res,next)=>{
    console.log('**********************')
    console.log('********ERROR********')
    console.log('**********************')
    console.log(err)
    res.status(500).send('OH BOY WE GOT AN ERROR')
})

app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
})
