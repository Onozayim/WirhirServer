const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  userName: String,
  password: String,
  email: String,
  profilePicture: {
    required: false,
    filename: String,
    mimetype: String,
    encoding: String,
  },
  biography: String,
  storiesSaved: [
    {
      type: Schema.Types.ObjectId,
      ref: "Story",
    },
  ],
  discusionsSaved: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  banned: Boolean,
});

const User = model("User", userSchema);

module.exports = { User };
