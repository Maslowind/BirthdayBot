const mongoose = require('mongoose')
const data_struc = new mongoose.Schema({
    _id: String,
    user_id: Number,
    date: Date,
    username: String,
    

});

module.exports = data_struc;