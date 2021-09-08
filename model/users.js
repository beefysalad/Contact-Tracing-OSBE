const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true
    },
    emailAddress:{
        type:String,
        required: true
    },
    birthDate:{
        type:String,
        required: true
    },
    address:{
        type:String,
        required: true
    },
    gender:{
        type:String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    password:{
        type:String,
        require: true
    },
    dateOfRegistration:{
        type:String,
        required: true
    }
})

module.exports = mongoose.model('user',userSchema)