const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
	from: String,

	to: String,

	body: String,
});

const Messages = model("Messages", MessageSchema);

module.exports = { Messages };
