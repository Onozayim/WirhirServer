const { Schema, model } = require("mongoose");

const FriendsSchema = new Schema({
  friend1Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  friend1Name: String,

  friend1Conf: Boolean,

  friend2Id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  friend2Name: String,

  friend2Conf: Boolean,

  lastMessage: String,
});

const Friends = model("Friends", FriendsSchema);

module.exports = { Friends };
