module.exports = function createNewData(user_id, username, date) {
  const mongoose = require('mongoose');
  const MongoURI = process.env.MONGO_URI;
  const user_struct = require('./data_struc.ts');
  let User = mongoose.model('User', user_struct, "BDDB");
  mongoose.connect(MongoURI, { useNewUrlParser: true })

  let id = mongoose.Types.ObjectId();
  let newUser = new User({ _id: id, user_id: user_id, username: username, date: date });


  User.findOne({ _id: id }, (err, fb) => {
    if (err) {
      throw err;
    } else if (fb === null) {
      newUser.save(function (err, fluffy) {
        if (err) return console.error(err);
      })
    }
  });

};
