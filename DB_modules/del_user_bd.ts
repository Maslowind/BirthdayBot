module.exports = async function delUserData(user_id, username) {
    const mongoose = require('mongoose');
    const MongoURI = process.env.MONGO_URI;
    const user_struct = require('./data_struc');
    let User = mongoose.model('User', user_struct, "BDDB");
    mongoose.connect(MongoURI, { useNewUrlParser: true })

    await User.find({ user_id: user_id, username: username }, (err, fb) => {
        if (err) throw err;
        else if (fb !== null) {
            for (let i = 0; i < fb.length; i++) {
                fb[i].deleteOne();
                fb[i].save();
            }
        }

    });

};