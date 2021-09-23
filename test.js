const moment = require('moment')
console.log(new Date());
let date = "11/18/1999"
let d = new Date(date).toISOString()
console.log(d);
console.log(moment().diff(new Date(date).toISOString(),'years'));



