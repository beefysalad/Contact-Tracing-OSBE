const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const notifications = new Schema({
    _id:false,
    message:{
        type: String
    },
    isSeen:{
        type:Boolean
    },
    date:{
        type:String
    }
})
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
    },
    image:{
        data: Buffer,
        type: String
    },
    notification:[notifications]
})

module.exports = mongoose.model('user',userSchema)