const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const arrLogs = new Schema({
    _id:false,
    name:String,
    id:String,
    date:String,
    time:String
})
const LogSchema = new Schema({
    _id:String,
    logs:[arrLogs]
})

module.exports = mongoose.model('Log',LogSchema)