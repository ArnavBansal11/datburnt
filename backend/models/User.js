const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is missing'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is missing'],
  },
  avatar: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Password is missing'],
  },
});

module.exports = mongoose.model('User', userSchema);
