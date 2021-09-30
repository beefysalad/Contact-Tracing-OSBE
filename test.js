const moment = require('moment')
console.log(new Date());
let date = "11/18/1999"
let d = new Date(date).toISOString()
console.log(moment(new Date()).fromNow())



