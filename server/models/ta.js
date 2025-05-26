const mongoose = require('mongoose');

const taSchema = new mongoose.Schema({
  name: { type: String, required: true },
  driveLink: { type: String, required: true },
});

module.exports = mongoose.model('TA', taSchema);