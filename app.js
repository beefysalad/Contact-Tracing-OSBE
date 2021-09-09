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
console.clear()


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

//PASSPORT STRATEGY, AUTHENTICATION AND AUTHORIZATION
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
        if(!user) return done(null,false,{message:'Invalid username or password!'})
        bcrypt.compare(password,user.password,(err,res)=>{
            if(err) return done(err)
            if(res==false) return done(null,false,{message:'Invalid username or password!'})
            return done(null,user)
        })
    })
}))
function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/establishments-login')
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
    }else{
        // console.log('Client account ni siya chuy');
        // console.log(user.id);
        done(null,{id: user.id, type:'Client'})
    }
})
passport.deserializeUser(function(id,done){
    // console.log(id.type);
    if(id.type==='Establishment'){
       Establishment.findOne({id:id},function(err,user){
           if(user){
               done(null,user)
           }else{
               done(err)
           }
       })
    }
    else{
        User.findOne({id:id},function(err,client){
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
app.get('/',isLoggedOut,isLoggedOutU,(req,res)=>{
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
    res.render('establishments/edashboard')
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
            req.flash('info','https://devops.com/wp-content/uploads/2020/04/Shift-Right-Testing-_TestOps-1280x720.jpg')
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

function isLoggedinU(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/client-login')
}
function isLoggedOutU(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/client-dashboard')
}

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
    res.render('users/udashboard')
})
app.post('/client-login',passport.authenticate('local',{
    successRedirect: '/client-dashboard',
    failureRedirect: '/client-login',
    failureFlash: true
}))
app.get('/client-qr/:id',(req,res)=>{
    const {id} = req.params
    res.render('users/uqr', {id})
})
app.post('/client-register',(req,res)=>{
    
    const{firstName,lastName,username,birthDate,address,emailAddress,contactNumber,gender,password} = req.body
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
                        dateOfRegistration: `${date.getMonth()+1}-${date.getDate()}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`
                    })
                    let id
                    await newUser.save()
                        .then(data=>{
                            console.log('Successfully added an establishment user!');
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