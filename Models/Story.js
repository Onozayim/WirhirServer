const { model, Schema } = require("mongoose");

const storySchema = new Schema({
	title: String,
	body: String,
	confident: Boolean,
	image: {
		filename: String,
		mimetype: String,
		encoding: String,
		required: false,
	},
	publisher: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	publicPublisher: String,
	createdAt: String,
	lenguage: String,
});

const Story = model("Story", storySchema);

module.exports = { Story };
