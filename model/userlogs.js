const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const coordinates = mongoose.Schema({
    _id:false,
    address:String,
    latitude:String,
    longitude:String
})
const arrlogs = new Schema({
    _id:String,
    establishment_name:String,
    address:String,
    date:String,
    time:String,
    location:coordinates
})
const userLogsSchema = new Schema({
    _id:String,
    userlog:[arrlogs]
})
module.exports = mongoose.model('user log',userLogsSchema)