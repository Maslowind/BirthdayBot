module.exports = async function getUserData(user_id) {
  const mongoose = require('mongoose');
  const MongoURI = process.env.MONGO_URI;
  const user_struct = require('./data_struc.ts');
  let User = mongoose.model('User', user_struct, "BDDB");
  mongoose.connect(MongoURI, { useNewUrlParser: true })
  let user_bd_list = [];


  await User.find({ user_id: user_id }, (err, fb) => {
    if (err) throw err;
    else if (fb === null) user_bd_list= null;
    else {
     user_bd_list=fb;
    }
  });
  return user_bd_list;
};