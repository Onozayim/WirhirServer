const { model, Schema } = require("mongoose");

const postSchema = new Schema({
	original: Boolean,
	body: String,
	title: String,
	publicPublisher: String,
	confident: Boolean,
	createdAt: String,
	answeringTo: { type: Schema.Types.ObjectId, ref: "Post" },
	mainPost: { type: Schema.Types.ObjectId, ref: "Post" },
	comments: [{ type: Schema.Types.ObjectId, ref: "Post" }],
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	participants: [
		{
			userId: String,
			userName: String,
		},
	],
	lenguage: String,
	image: {
		filename: String,
		mimetype: String,
		encoding: String,
		required: false,
	},
});

const Post = model("Post", postSchema);

module.exports = { Post };
