const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const establishmentSchema = new Schema({
    businessnumber : {
        type: String,
        required: true
    },
    contactPerson:{
        type:String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    dateOfRegistration:{
        type:String,
        required: true
    }
})

module.exports = mongoose.model('establishment',establishmentSchema)