//dependencies
const express = require('express')
const app = express()
const session = require('express-session')
const flash = require('express-flash')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const passport = require('passport')
const port = process.env.PORT || 3000
const path = require('path')
const mongoose = require('mongoose')
const User = require('./model/users')
const Establishment = require('./model/establishments')
const methodOverride = require('method-override')
const multer = require('multer')
const { readdirSync } = require('fs')
console.clear()
//MULTER FOR STORAGING IMAGE
const storage = multer.diskStorage({
    
    destination:(req,file,callback)=>{
        callback(null,'./public/uploads/images')
    },
    filename:(req,file,callback)=>{
        const ext = file.mimetype.split("/")[1]
        callback(null,Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024*1024*3
    }
})
//DATABASE
// mongoose.connect('mongodb://localhost:27017/final_test', {
//     useNewUrlParser: true, 
//     useUnifiedTopology: true,
    
// })
mongoose.connect('mongodb+srv://patrick123:johnpatrick@cluster0.udls2.mongodb.net/Contact-Tracing-Application?retryWrites=true&w=majority', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
const db = mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log('Database connected')
})

//MIDDLEWARES
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
        console.log(`passed username from clogin is : ${username}`);
        if(!user) return done(null,false,{message:'Invalid username or password d!'})
        bcrypt.compare(password,user.password,(err,res)=>{
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password d!'})
            return done(null,user)
        })
    })
}))
function isLoggedinU(req,res,next){
    if(req.isAuthenticated()){
        if(req.user instanceof User){
            return next()
        }
       
    }
    req.flash('error',{message: 'You are currently logged in!'})
    res.redirect('/')
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
        // else if(req.user instanceof User){
            
        //     // console.log('HALA YAWA NISUD KA DIRI DODONG');
        // }
        
    }
    req.flash('error',{message: 'You are currently logged in!'})
    res.redirect('/')
    // res.redirect('/establishments-login')
    // if(req.user instanceof Establishment){
       
    //     // console.log('YAWA');
    // }else if(req.user instanceof User){
    //     if(req.isAuthenticated()){
    //         return next()
    //     }
    //     res.redirect('/client-login')
    //     // console.log('YAWA2');
    // }
    // res.redirect('/')
    
}
function isLoggedOut(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/establishments-dashboard')
}

passport.serializeUser(function(user,done){
    if(user instanceof Establishment){
        console.log('Establishment account ni siya chuy');
        // console.log(user.id);
        done(null,{id: user.id, type: 'Establishment'})
    }else if(user instanceof User){
        console.log('Client account ni siya chuy');
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
app.get('/establishments-scanqr',isLoggedin,(req,res)=>{
    res.render('establishments/escanner')
})
app.get('/establishments-login',isLoggedOut,(req,res)=>{
    res.render('establishments/elogin')
})
app.get('/establishments-registration',isLoggedOut,(req,res)=>{
    res.render('establishments/eregister')
})
app.get('/establishments-dashboard',isLoggedin,(req,res)=>{
    // console.log(req.user);
    const user = req.user
    res.render('establishments/edashboard',{user})
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
app.post('/give-qr',(req,res)=>{
    User.findById(req.body.qrText,(err,user)=>{
        if(user){
            req.flash('success',`Welcome ${user.firstName} ${user.lastName}`)
            // req.flash('success','https://devops.com/wp-content/uploads/2020/04/Shift-Right-Testing-_TestOps-1280x720.jpg')

            req.flash('info', user.image)
            const date = new Date()
            console.log(`${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
            res.redirect('/establishments-scanqr')
        }else{
            req.flash('error','User does not exist!')
            res.redirect('/establishments-scanqr')
        }
    })
})
app.post('/eregister',(req,res)=>{
    const{businessnumber,cperson,cnumber,username,email,password} = req.body
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
                        contactPerson: cperson,
                        contactNumber: cnumber,
                        username: username,
                        email: email,
                        password: hash,
                        dateOfRegistration: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
                    })
                    await newEstablish.save()
                        .then(data=>{
                            console.log('Successfully added an establishment user!');
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
    console.log(`get id :${id}`);
    res.render('users/change',{id})
})
app.post('/change-picture/:id',upload.single('image'),isLoggedinU,(req,res)=>{
    const {id} = req.params
    // console.log(req.file);
    console.log(`post id:${id}`);
    console.log(req.file.filename);
    User.findByIdAndUpdate(id,{image:req.file.filename})
        .then(data=>{
            console.log('Success yawa');
            res.redirect('/client-dashboard')
        })
    // User.updateOne({id:id},{$set:{image:req.file.filename}})
    //     .then(data=>{
    //         console.log(`data is ${data}`);
    //         console.log(data);
    //         console.log('Success in changing picture');
    //         res.redirect('/client-dashboard')
    //     })
})
app.get('/logoutU',(req,res)=>{
    req.logOut()
    res.redirect('/client-login')
})
app.get('/client-login',isLoggedOutU,(req,res)=>{
    res.render('users/ulogin')
})
app.get('/client-register',isLoggedOutU,(req,res)=>{
    res.render('users/uregister')
})
app.get('/client-dashboard',isLoggedinU,(req,res)=>{
    const user = req.user
    // console.log(`user logged in is ${req.user}`);
    res.render('users/udashboard',{user})
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
        genPic = 'defaultmale.jpg'
    }else if(gender==='Female'){
        // console.log('nisud sa female');
        genPic = 'defaultfemale.png'
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
                        birthDate: birthDate,
                        address:address,
                        gender: gender,
                        username:username,
                        password: hash,
                        image: genPic,
                        dateOfRegistration: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
                    })
                    let id
                    await newUser.save()
                        .then(data=>{
                            console.log('Successfully added a client user user!');
                            id = data._id
                        })
                    res.redirect(`/client-qr/${id}`)
                })
            })
        }
    })
})



app.listen(port,()=>{
    console.log(`Listening to port ${port}`);
})