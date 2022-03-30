const { Post } = require("../Models/Post");

const deleteComents = async (postId) => {
  await Post.deleteMany({ original: false, answeringTo: postId });
};

const trashData = async () => {
  const posts = await Post.find({ original: false });
  await posts.map((post) => {
    let answer = post._doc.answeringTo;
    deleteTrashData(answer, post);
  });
};

const deleteTrashData = async (answer, post) => {
  const flag = await Post.findById(answer);

  if (!flag) {
    post.delete();
  }
};

const deleteAnswer = async (postId) => {
  await Post.deleteMany({
    original: false,
    mainPost: postId,
  });
};

module.exports = { deleteComents, trashData, deleteTrashData, deleteAnswer };
