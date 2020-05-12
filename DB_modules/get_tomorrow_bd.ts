module.exports = async function getTomorrowData(date) {
  const mongoose = require('mongoose');
  const MongoURI = process.env.MONGO_URI;
  const user_struct = require('./data_struc.ts');
  let User = mongoose.model('User', user_struct, "BDDB");
  mongoose.connect(MongoURI, { useNewUrlParser: true })
  let tomorrow_bd_list = [];


  await User.find({ date: date }, (err, fb) => {
    if (err) throw err;
    else if (fb === null) tomorrow_bd_list= null;
    else {
     tomorrow_bd_list=fb;
    }
  });
  return tomorrow_bd_list;
};