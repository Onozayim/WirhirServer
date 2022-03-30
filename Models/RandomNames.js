const { Schema, model } = require("mongoose");

const RandomNamesSchema = new Schema({
  name: String,
});

const RandomNames = model("RandomNames", RandomNamesSchema);

module.exports = { RandomNames };
