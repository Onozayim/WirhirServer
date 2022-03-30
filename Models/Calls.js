const { Schema, model } = require("mongoose");

const CallSchema = new Schema({
  userId: String,
  userConf: Boolean,
  userName: String,

  partnerId: String,
  partnerConf: Boolean,
  partnerName: String,

  day: String,
  hour: String,
});

const Calls = model("Calls", CallSchema);

module.exports = { Calls };
