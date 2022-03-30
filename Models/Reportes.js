const { Schema, model } = require("mongoose");

const reportSchema = new Schema({
  reported: String,
  reporter: String,
  expire_at: {
    type: Date,
    default: Date.now,
    expires: 604800,
  },
});

const Report = model("Report", reportSchema);

module.exports = { Report };
