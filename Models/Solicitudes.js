const { Schema, model } = require("mongoose");

const RequestSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  senderName: String,
  senderConf: Boolean,

  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "USer",
  },
  receiverName: String,
  receiverConf: Boolean,

  createdAt: String,
  requestContext: String,
});

const Requests = model("Requests", RequestSchema);

module.exports = { Requests };
