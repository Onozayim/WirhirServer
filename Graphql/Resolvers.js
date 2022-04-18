const bcrypt = require("bcryptjs");
const { PubSub, withFilter } = require("graphql-subscriptions");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server-errors");
const { finished } = require("stream/promises");
const Cryptr = require("cryptr");

const { User } = require("../Models/User");
const { Story } = require("../Models/Story");
const {
  validateRegisterInput,
  validateLoginInput,
  validateEmail,
  validateRecoverPassword,
} = require("../Util/Validators");
const { SECRET_KEY } = require("../Config");
const { checkAuth } = require("../Util/CheckAuth");
const { Post } = require("../Models/Post");
const { createRandomName } = require("../Util/CreateRandomName");
const { GraphQLUpload } = require("graphql-upload");
const path = require("path");
const { makeid } = require("../Util/MakeId");
const {
  deleteAnswer,
  trashData,
  deleteComents,
} = require("../Util/DeletingPost");
const { Report } = require("../Models/Reportes");
const { Messages } = require("../Models/Chat");
const { transporter } = require("../Email/Mailer");
const { RandomNames } = require("../Models/RandomNames");
const { Friends } = require("../Models/Friends");
const { Calls } = require("../Models/Calls");
const { Requests } = require("../Models/Solicitudes");

const cryptr = new Cryptr(SECRET_KEY);

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      userName: user.userName,
    },
    SECRET_KEY,
    { expiresIn: "365d" }
  );
};

const pubsub = new PubSub();

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    getUserStories: async (_, __, context) => {
      try {
        const user = checkAuth(context);
        const stories = await Story.find({ publisher: user.id });

        return stories.map((item) => {
          const decBody = cryptr.decrypt(item.body);
          const decTitle = cryptr.decrypt(item.title);

          return {
            title: decTitle,
            body: decBody,
            confident: item.confident,
            id: item.id,
            image: null,
            publicPublisher: item.publicPublisher,
            publisher: item.publisher,
            createdAt: item.createdAt,
          };
        });
      } catch (err) {
        throw err;
      }
    },

    getUserPosts: async (_, __, context) => {
      try {
        const user = checkAuth(context);
        const posts = await Post.find({ user: user.id, original: true });

        return posts.map((item) => {
          const decBody = cryptr.decrypt(item.body);
          const decTitle = cryptr.decrypt(item.title);

          return {
            id: item.id,
            title: decTitle,
            body: decBody,
            confident: item.confident,
            user: item.user,
            publicPublisher: item.publicPublisher,
            publisher: item.publisher,
            createdAt: item.createdAt,
            original: item.original,
          };
        });
      } catch (err) {
        throw err;
      }
    },

    getRandomStory: async (_, { lenguage }) => {
      const count = await Story.count({ lenguage: lenguage });

      const randomNumber = Math.floor(Math.random() * count);

      const randomStorie = await Story.findOne({ lenguage: lenguage }).skip(
        randomNumber
      );

      const desBody = cryptr.decrypt(randomStorie.body);
      const desTitle = cryptr.decrypt(randomStorie.title);

      return {
        id: randomStorie.id,
        image: randomStorie.image,
        title: desTitle,
        publicPublisher: randomStorie.publicPublisher,
        publisher: randomStorie.publisher,
        body: desBody,
        createdAt: randomStorie.createdAt,
      };
    },

    getRandomPost: async (_, { lenguage }) => {
      let posts;
      let number;

      const count = await Post.count({ lenguage: lenguage, original: true });

      const randomNumber = Math.floor(Math.random() * count);
      const randomPost = await Post.findOne({
        original: true,
        lenguage: lenguage,
      }).skip(randomNumber);

      if (randomPost.original) flag = true;

      const decBody = cryptr.decrypt(randomPost.body);
      const decTitle = cryptr.decrypt(randomPost.title);

      return {
        body: decBody,
        confident: randomPost.confident,
        createdAt: randomPost.createdAt,
        id: randomPost.id,
        original: randomPost.original,
        publicPublisher: randomPost.publicPublisher,
        title: decTitle,
        user: randomPost.user,
        image: randomPost.image,
      };
    },

    getComments: async (parent, { answeringId }, context) => {
      try {
        const comments = await Post.find({ mainPost: answeringId })
          .populate("comments")
          .populate("answeringTo");
        if (!comments) throw new Error("Comments not found");

        return comments.map((comment) => {
          const decBody = cryptr.decrypt(comment.body);
          const decAnsBody = cryptr.decrypt(comment.answeringTo.body);
          return {
            body: decBody,
            id: comment.id,
            user: comment.user,
            publicPublisher: comment.publicPublisher,
            original: comment.original,
            confident: comment.confident,
            createdAt: comment.createdAt,
            answeringTo: {
              body: decAnsBody,
              user: comment.answeringTo.user,
              publicPublisher: comment.answeringTo.publicPublisher,
            },
            image: comment.image,
          };
        });
      } catch (err) {
        throw err;
      }
    },

    getPost: async (parent, { postId }) => {
      try {
        const post = await Post.findById(postId)
          .populate("comments")
          .populate("answeringTo")
          .populate("mainPost");

        if (!post) throw new Error("Post not found");

        const desBody = cryptr.decrypt(post.body);
        const desTitle = cryptr.decrypt(post.title);

        return {
          body: desBody,
          id: post.id,
          createdAt: post.createdAt,
          confident: post.confident,
          title: desTitle,
          user: post.user,
          publicPublisher: post.publicPublisher,
          answeringTo: post.answeringTo,
          image: post.image,
        };
      } catch (err) {
        throw new Error("ERROR");
      }
    },

    getStory: async (parent, { storyId }) => {
      const story = await Story.findById(storyId);

      if (!story) throw new Error("Story not found");

      const desBody = cryptr.decrypt(story.body);
      const desTitle = cryptr.decrypt(story.title);

      return {
        id: story.id,
        title: desBody,
        body: desTitle,
        publisher: story.publisher,
        publicPublisher: story.publicPublisher,
        confident: story.confident,
        createdAt: story.createdAt,
        lenguage: story.lenguage,
      };
    },

    getUserInfo: async (parent, { userId }) => {
      const user = await User.findById(userId)
        .populate("storiesSaved")
        .populate("discusionsSaved");

      const discusionsSaved = [];
      user.discusionsSaved.map((item) => {
        const decTitle = cryptr.decrypt(item.title);
        discusionsSaved.push({
          id: item.id,
          title: decTitle,
          createdAt: item.createdAt,
        });
      });

      const storiesSaved = [];
      user.storiesSaved.map((item) => {
        const decTitle = cryptr.decrypt(item.title);
        storiesSaved.push({
          id: item.id,
          title: decTitle,
          createdAt: item.createdAt,
        });
      });

      return {
        id: user.id,
        email: user.email,
        userName: user.userName,
        discusionsSaved: discusionsSaved,
        storiesSaved: storiesSaved,
        biography: user.biography,
        profilePicture: {
          encoding: user.profilePicture.encoding,
          filename: user.profilePicture.filename,
          mimetype: user.profilePicture.mimetype,
        },
        banned: user.banned,
      };
    },

    showFriendRequests: async (parent, args, context) => {
      const { id } = checkAuth(context);

      const requests = await Requests.find({ receiverId: id });

      return requests;
    },

    showParticipants: async (parent, { mainPostId }, context) => {
      const post = await Post.findById(mainPostId);

      return post.participants;
    },

    showFriends: async (parent, args, context) => {
      const { id } = checkAuth(context);

      const friends = await Friends.find({
        $or: [{ friend1Id: id }, { friend2Id: id }],
      });

      return friends;
    },

    checkIfBanned: async (parent, args, context) => {
      const { id } = checkAuth(context);

      const user = await User.findById(id);

      return user.banned;
    },

    showMessages: async (paremt, args, context) => {
      const { id } = checkAuth(context);

      const info = await Messages.find({ $or: [{ from: id }, { to: id }] });

      return info.map((item) => {
        const decBody = cryptr.decrypt(item.body);
        return {
          id: item.id,
          body: decBody,
          from: item.from,
          to: item.to,
        };
      });
    },

    getChats: async (parent, args, context) => {
      const { id } = checkAuth(context);

      if (!id) throw new Error("NOT AUTHENTICATED");

      const info = await User.findById(id);

      return info.chats;
    },

    getCalls: async (parent, args, context) => {
      const { id } = checkAuth(context);

      if (!id) throw new Error("Not authenticated");

      const calls = await Calls.find({ userId: id });

      return calls;
    },

    getAllRandomNames: async (parent, args, context) => {
      const randonNames = await RandomNames.find();

      return randonNames.map((item) => {
        return item.name;
      });
    },
  },

  Mutation: {
    register: async (parent, { registerInput }, context, info) => {
      const { errors, valid } = validateRegisterInput(
        registerInput.userName,
        registerInput.password,
        registerInput.confirmPassword,
        registerInput.email,
        registerInput.lenguage
      );

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ userName: registerInput.userName });
      const userEmail = await User.findOne({ email: registerInput.email });

      if (user) {
        throw new UserInputError("User, is taken", {
          errors: {
            userName: "This username is taken",
          },
        });
      }

      if (userEmail) {
        throw new UserInputError("Email, is taken", {
          errors: {
            userName: "This Email is taken",
          },
        });
      }

      registerInput.password = await bcrypt.hash(registerInput.password, 12);

      const newUser = new User({
        email: registerInput.email,
        userName: registerInput.userName,
        password: registerInput.password,
        biography: "HOLA! ESTOY USANDO WIRHIR",
        banned: false,
      });

      const res = await newUser.save();
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res.id,
        token,
      };
    },
    login: async (parent, { email, password, lenguage }) => {
      const { valid, errors } = validateLoginInput(email, password, lenguage);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ email: email });

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        errors.general = "Wrong Credentials";
        throw new UserInputError("Wrong Credentials", { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user.id,
        token,
      };
    },

    loginWithGoogle: async (parent, { userName, email, password }) => {
      const user = await User.findOne({ email: email });

      if (!user) {
        password = await bcrypt.hash(password, 12);

        const newUser = new User({
          email: email,
          userName: userName,
          password: password,
          biography: userName,
          banned: false,
        });

        const res = await newUser.save();
        const token = generateToken(res);

        return {
          ...newUser._doc,
          id: newUser.id,
          token,
        };
      } else {
        const { valid, errors } = validateLoginInput(email, password);

        if (!valid) {
          throw new UserInputError("Errors", { errors });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
          errors.general = "User not found";
          throw new UserInputError("Wrong Credentials", { errors });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          errors.general = "Wrong Credentials";
          throw new UserInputError("Wrong Credentials", { errors });
        }

        const token = generateToken(user);

        return {
          ...user._doc,
          id: user.id,
          token,
        };
      }
    },

    createStory: async (
      parent,
      { title, body, image, confident, lenguage },
      context
    ) => {
      const user = checkAuth(context);

      if (!lenguage || !user) throw new Error("ERROR");

      if (body.trim() === "" && lenguage === "español") {
        throw new Error("LA HISTORIA DEBE TENER CUERPO");
      }

      if (title.trim() === "" && lenguage === "español") {
        throw new Error("LA HISTORIA DEBE TENER TITULO");
      }

      if (body.trim() === "" && lenguage === "english") {
        throw new Error("THE STORY MUST HAVE BODY");
      }

      if (title.trim() === "" && lenguage === "english") {
        throw new Error("THE STORY MUST HAVE TITLE");
      }

      let newImage = null;

      if (image) {
        console.log(image);
        const { createReadStream, filename, mimetype, encoding } = await image;
        const { ext } = path.parse(filename);
        const date = new Date();
        const dateString =
          date.getFullYear() +
          date.getMonth() +
          date.getDay() +
          date.getMinutes() +
          date.getSeconds() +
          date.getMilliseconds();
        const randomName = makeid(15) + dateString.toString() + ext;
        const stream = createReadStream();
        const pathName = path.join(__dirname, `../Public/Images/${randomName}`);

        const out = require("fs").createWriteStream(pathName);

        stream.pipe(out);

        await finished(out);

        newImage = {
          filename: randomName,
          mimetype: mimetype,
          encoding: encoding,
        };

        if (!newImage.mimetype.includes("image")) {
          if (lenguage === "español") {
            throw new Error("Archivo invalido, no es una imagen");
          } else {
            throw new Error("File not accepted, it must be an image");
          }
        }
      }

      const encBody = cryptr.encrypt(body);
      const encTitle = cryptr.encrypt(title);

      if (!confident) {
        const newStory = new Story({
          title: encTitle,
          body: encBody,
          publisher: user.id,
          publicPublisher: user.userName,
          image: newImage,
          confident,
          createdAt: new Date().toISOString(),
          lenguage,
        });
        const story = await newStory.save();
        return story;
      } else {
        const newStory = new Story({
          title: encTitle,
          body: encBody,
          publisher: user.id,
          publicPublisher: "???",
          image: newImage,
          confident,
          createdAt: new Date().toISOString(),
          lenguage,
        });
        const story = await newStory.save();
        return story;
      }
    },

    createPost: async (
      parent,
      { body, title, confident, lenguage, image },
      context
    ) => {
      const user = checkAuth(context);

      if (!user || !lenguage) throw new Error("ERROR");

      if (body.trim() === "" && lenguage === "español") {
        throw new Error("LA DISCUSION DEBE TENER CUERPO");
      }
      if (title.trim() === "" && lenguage === "español") {
        throw new Error("LA DISCUSION DEBE TENER TITULO");
      }

      if (body.trim() === "" && lenguage === "english") {
        throw new Error("THE DISCUSION MUST HABE BODY");
      }
      if (title.trim() === "" && lenguage === "english") {
        throw new Error("THE DISCUSION MUST HAVE TITLE");
      }

      const encBody = cryptr.encrypt(body);
      const encTitle = cryptr.encrypt(title);

      let newImage = null;

      if (image) {
        console.log(image);
        const { createReadStream, filename, mimetype, encoding } = await image;
        const { ext } = path.parse(filename);
        const date = new Date();
        const dateString =
          date.getFullYear() +
          date.getMonth() +
          date.getDay() +
          date.getMinutes() +
          date.getSeconds() +
          date.getMilliseconds();
        const randomName = makeid(15) + dateString.toString() + ext;
        const stream = createReadStream();
        const pathName = path.join(__dirname, `../Public/Images/${randomName}`);

        const out = require("fs").createWriteStream(pathName);

        stream.pipe(out);

        await finished(out);

        newImage = {
          filename: randomName,
          mimetype: mimetype,
          encoding: encoding,
        };

        if (!newImage.mimetype.includes("image")) {
          if (lenguage === "español") {
            throw new Error("Archivo invalido, no es una imagen");
          } else {
            throw new Error("File not accepted, it must be an image");
          }
        }
      } else {
        console.log("sin imagen");
      }

      if (!confident) {
        const participant = {
          userId: user.id,
          userName: user.userName,
        };

        const newPost = new Post({
          original: true,
          body: encBody,
          title: encTitle,
          user: user.id,
          publicPublisher: user.userName,
          createdAt: new Date().toISOString(),
          confident,
          lenguage,
          image: newImage,
        });

        newPost.participants.push(participant);

        const post = await newPost.save();

        return post;
      } else {
        const name = await createRandomName(lenguage);

        const participant = {
          userId: user.id,
          userName: name,
        };

        await new RandomNames({
          name: name,
        }).save();

        const newPost = new Post({
          original: true,
          body: encBody,
          title: encTitle,
          user: user.id,
          publicPublisher: name,
          createdAt: new Date().toISOString(),
          confident,
          lenguage,
          image: newImage,
        });

        newPost.participants.push(participant);

        const post = await newPost.save();
        return post;
      }
    },

    createComment: async (
      parent,
      { postId, body, mainPostId, confident, lenguage, image },
      context
    ) => {
      const user = checkAuth(context);

      if (!user || !lenguage) throw new Error("ERROR");

      if (body.trim() === "" && lenguage === "español") {
        throw new Error("EL COMENTARIO DEBE TENER CUERPO");
      }

      if (body.trim() === "" && lenguage === "english") {
        throw new Error("THE COMMENT MUST HAVE BODY");
      }

      const OriginalPost = await Post.findById(mainPostId);
      let flag = true;

      let oldUserPublicName = "";

      OriginalPost.participants.map((item) => {
        if (item.userId === user.id) {
          flag = false;
          oldUserPublicName = item.userName;
        }
      });

      const post = await Post.findById(postId);
      const encBody = cryptr.encrypt(body);

      let newImage = null;
      if (image) {
        console.log(image);
        const { createReadStream, filename, mimetype, encoding } = await image;
        const { ext } = path.parse(filename);
        const date = new Date();
        const dateString =
          date.getFullYear() +
          date.getMonth() +
          date.getDay() +
          date.getMinutes() +
          date.getSeconds() +
          date.getMilliseconds();
        const randomName = makeid(15) + dateString.toString() + ext;
        const stream = createReadStream();
        const pathName = path.join(__dirname, `../Public/Images/${randomName}`);

        const out = require("fs").createWriteStream(pathName);

        stream.pipe(out);

        await finished(out);

        newImage = {
          filename: randomName,
          mimetype: mimetype,
          encoding: encoding,
        };

        if (!newImage.mimetype.includes("image")) {
          if (lenguage === "español") {
            throw new Error("Archivo invalido, no es una imagen");
          } else {
            throw new Error("File not accepted, it must be an image");
          }
        }
      } else {
        console.log("sin imagen");
      }

      if (flag) {
        if (!confident) {
          if (post) {
            const comment = new Post({
              original: false,
              mainPost: mainPostId,
              answeringTo: post.id,
              body: encBody,
              publicPublisher: user.userName,
              user: user.id,
              createdAt: new Date().toISOString(),
              confident,
              image: newImage,
            });

            post.comments.push(comment);

            const participant = {
              userId: user.id,
              userName: user.userName,
            };

            OriginalPost.participants.push(participant);

            if (postId !== mainPostId) {
              OriginalPost.comments.push(comment.id);
            }

            await OriginalPost.save();
            await post.save();
            await comment.save();

            return { ...comment._doc, id: comment.id };
          }
        } else {
          let flag2 = false;
          let name = "";
          do {
            name = await createRandomName(lenguage);
            OriginalPost.participants.map((item) => {
              if (name === item.userName) flag = true;
              else flag = false;
            });
          } while (flag2);

          if (post) {
            const comment = new Post({
              original: false,
              mainPost: mainPostId,
              answeringTo: post.id,
              body: encBody,
              publicPublisher: name,
              user: user.id,
              createdAt: new Date().toISOString(),
              confident,
              image: newImage,
            });

            post.comments.push(comment);

            const participant = {
              userId: user.id,
              userName: name,
            };

            OriginalPost.participants.push(participant);

            await new RandomNames({
              name: name,
            }).save();

            if (postId !== mainPostId) {
              OriginalPost.comments.push(comment.id);
            }

            await OriginalPost.save();
            await post.save();
            await comment.save();

            return { ...comment._doc, id: comment.id };
          }
        }
      } else {
        const comment = new Post({
          original: false,
          mainPost: mainPostId,
          answeringTo: post.id,
          body: encBody,
          publicPublisher: oldUserPublicName,
          user: user.id,
          createdAt: new Date().toISOString(),
          confident,
          image: newImage,
        });

        post.comments.push(comment);
        if (postId !== mainPostId) {
          OriginalPost.comments.push(comment.id);
          await OriginalPost.save();
        }

        await post.save();

        await comment.save();

        return { ...comment._doc, id: comment.id };
      }
    },

    updateProfile: async (
      parent,
      { biography, userName, image, lenguage },
      context
    ) => {
      try {
        console.log(userName);
        const user = checkAuth(context);

        const id = user.id;

        if (image) {
          console.log("Is a image");
          const { createReadStream, filename, mimetype, encoding } =
            await image;

          console.log(image);

          const { ext } = path.parse(filename);
          const date = new Date();
          const dateString =
            date.getFullYear() +
            date.getMonth() +
            date.getDay() +
            date.getMinutes() +
            date.getSeconds() +
            date.getMilliseconds();
          const randomName = makeid(15) + dateString.toString() + ext;
          const stream = createReadStream();
          const pathName = path.join(
            __dirname,
            `../Public/Images/${randomName}`
          );

          const out = require("fs").createWriteStream(pathName);

          stream.pipe(out);

          await finished(out);

          const profilePicture = {
            filename: randomName,
            mimetype: mimetype,
            encoding: encoding,
          };

          if (!profilePicture.mimetype.includes("image")) {
            if (lenguage === "español") {
              throw new Error("Archivo invalido, no es una imagen");
            } else {
              throw new Error("File not accepted, it must be an image");
            }
          }

          const post = await User.findByIdAndUpdate(
            id,
            {
              biography: biography,
              profilePicture: profilePicture,
              userName: userName,
            },
            { new: true }
          );

          await post.save();

          const token = generateToken(newUser);

          await Story.updateMany(
            { publisher: id, confident: false },
            { publicPublisher: userName },
            { new: true }
          );

          await Post.updateMany(
            { user: id, confident: false },
            { publicPublisher: userName },
            { new: true }
          );

          await Friends.updateMany(
            { friend1Id: id, friend1Conf: false },
            { friend1Name: userName },
            { new: true }
          );

          await Friends.updateMany(
            { friend2Id: id, friend2Conf: false },
            { friend2Name: userName },
            { new: true }
          );

          await Requests.updateMany(
            {
              senderId: id,
              senderConf: false,
            },
            { senderName: userName },
            { new: true }
          );

          await Requests.updateMany(
            {
              receiverId: id,
              receiverConf: false,
            },
            { receiverName: userName },
            { new: true }
          );

          await Calls.updateMany(
            {
              userId: id,
              userConf: false,
            },
            {
              userName: userName,
            },
            { new: true }
          );

          await Calls.updateMany(
            {
              partnerId: id,
              partnerConf: false,
            },
            {
              partnerName: userName,
            },
            { new: true }
          );

          return token;
        }

        const post = await User.findByIdAndUpdate(
          id,
          {
            biography,
            userName,
          },
          {
            new: true,
          }
        );

        const newUser = {
          email: post.email,
          userName: userName,
          id: id,
        };

        const token = generateToken(newUser);

        await Story.updateMany(
          { publisher: id, confident: false },
          { publicPublisher: userName },
          { new: true }
        );

        await Post.updateMany(
          { user: id, confident: false },
          { publicPublisher: userName },
          { new: true }
        );

        await Friends.updateMany(
          { friend1Id: id, friend1Conf: false },
          { friend1Name: userName },
          { new: true }
        );

        await Friends.updateMany(
          { friend2Id: id, friend2Conf: false },
          { friend2Name: userName },
          { new: true }
        );

        await Requests.updateMany(
          {
            senderId: id,
            senderConf: false,
          },
          { senderName: userName },
          { new: true }
        );

        await Requests.updateMany(
          {
            receiverId: id,
            receiverConf: false,
          },
          { receiverName: userName },
          { new: true }
        );

        await Calls.updateMany(
          {
            userId: id,
            userConf: false,
          },
          {
            userName: userName,
          },
          { new: true }
        );

        await Calls.updateMany(
          {
            partnerId: id,
            partnerConf: false,
          },
          {
            partnerName: userName,
          },
          { new: true }
        );

        await post.save();

        return {
          token: token,
          id: id,
        };
      } catch (error) {
        throw new Error(error);
      }
    },

    saveStory: async (parent, { storyId }, context) => {
      try {
        const userInfo = checkAuth(context);
        const user = await User.findById(userInfo.id);

        if (!user) throw new Error("error");

        user.storiesSaved.push(storyId);

        await user.save();

        return "Story saved";
      } catch (error) {
        throw new Error(error);
      }
    },

    saveDiscusion: async (parent, { discusionId }, context) => {
      try {
        const { id } = checkAuth(context);
        const user = await User.findById(id);

        if (!user) throw new Error("ERROR");

        user.discusionsSaved.push(discusionId);

        await user.save();

        return "Discusion Saved";
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteStory: async (parent, { storyId }, context) => {
      const { id } = checkAuth(context);

      try {
        const story = await Story.findById(storyId).populate("publisher");

        if (id === story.publisher.id) {
          await story.delete(story.id);
          return "post deleted";
        }

        return "cant do that";
      } catch (err) {
        throw new Error(err);
      }
    },

    deletePost: async (parent, { postId }, context) => {
      const { id } = checkAuth(context);

      try {
        const post = await Post.findById(postId).populate("user");

        if (id !== post.user.id) return "Action not allowed";

        if (post.original === false) {
          deleteComents(post.id);
          await post.delete();
          trashData();

          return "post deleted";
        } else if (post.original === true) {
          deleteAnswer(post.id);

          await post.delete(post.id);
          return "post deleted";
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    onBookStory: async (parent, { storyId }, context) => {
      const user = checkAuth(context);

      try {
        await User.findByIdAndUpdate(
          user.id,
          {
            $pull: { storiesSaved: storyId },
          },
          { new: true }
        );

        return "prueba";
      } catch (err) {
        throw new Error(err);
      }
    },

    onBookPost: async (parent, { postId }, context) => {
      const user = checkAuth(context);

      try {
        await User.findByIdAndUpdate(
          user.id,
          {
            $pull: { discusionsSaved: postId },
          },
          {
            new: true,
          }
        );

        return "listo";
      } catch (err) {
        throw new Error(err);
      }
    },

    sendFriendRequest: async (
      parent,
      { senderName, receiverId, receiverName, requestContext },
      context
    ) => {
      const { id } = checkAuth(context);

      try {
        const friends = await Friends.findOne({
          $or: [
            {
              friend1Id: id,
              friend2Id: receiverId,
            },
            {
              friend1Id: receiverId,
              friend2Id: id,
            },
          ],
        });

        const requests = await Requests.findOne({
          $or: [
            {
              senderId: id,
              receiverId: receiverId,
            },
            {
              senderId: receiverId,
              receiverId: id,
            },
          ],
        });

        if (friends) return "Solicitud ya mandada";

        if (requests) return "Solicitus ya mandada ";

        const receiverUser = await User.findById(receiverId);

        const senderUser = await User.findById(id);

        let confSender = true,
          confReceiver = true;

        if (senderUser.userName === senderName) confSender = false;

        if (!receiverUser) throw new Error("USER NOT FOUND");

        if (receiverUser.userName === receiverName) confReceiver = false;

        const friendRequest = {
          senderId: id,
          senderName: senderName,
          senderConf: confSender,
          receiverId: receiverId,
          receiverName: receiverName,
          receiverConf: confReceiver,
          createdAt: new Date().toISOString(),
          requestContext: requestContext,
        };

        await new Requests(friendRequest).save();

        return "Request Send";
      } catch (error) {
        throw new Error(error);
      }
    },

    denyRequest: async (parent, { senderId }, context) => {
      const { id } = checkAuth(context);

      try {
        await Requests.findOneAndDelete({ receiverId: id, senderId: senderId });

        return "listo";
      } catch (err) {
        throw new Error(err);
      }
    },

    acceptRequest: async (
      parent,
      { senderId, senderName, receiverName },
      context
    ) => {
      const { id } = checkAuth(context);

      try {
        await Requests.findOneAndDelete({ receiverId: id, senderId: senderId });

        const user = await User.findById(id);

        const user2 = await User.findById(senderId);

        let conf1 = true;
        let conf2 = true;

        if (user.userName == receiverName) conf1 = false;

        if (user2.userName == senderName) conf2 = false;

        const newFriends = {
          friend1Id: id,
          friend1Name: receiverName,
          friend1Conf: conf1,
          friend2Id: senderId,
          friend2Name: senderName,
          friend2Conf: conf2,
          lastMessage: "",
        };

        await new Friends(newFriends).save();

        return "listo";
      } catch (err) {
        throw new Error(err);
      }
    },

    reportUser: async (parent, { userId }, context) => {
      try {
        const { id } = checkAuth(context);

        const checkReport = await Report.findOne({
          reported: userId,
          reporter: id,
        });

        if (checkReport) return "usuario ya reportado";

        const report = await new Report({
          reported: userId,
          reporter: id,
        });

        await report.save();

        const numberOfReports = await Report.find({
          reported: userId,
        });

        const numberOfUsers = await User.find();

        const banedRequest = numberOfUsers.length * 0.05;

        if (
          numberOfReports.length >= banedRequest &&
          numberOfUsers.length >= 100
        ) {
          const user = await User.findByIdAndUpdate(userId, {
            banned: true,
          });

          await Story.deleteMany({ publisher: user._id });
          await Post.deleteMany({ user: user._id });
          // await Post.deleteMany({
          // 	$or: [{ user: id }, { original: false, "mainPost.user": id }],
          // }).populate("mainPost");

          trashData();
          return "Usuario baneado";
        }

        return "reportado";
      } catch (err) {
        throw new Error(err);
      }
    },

    deleteFriend: async (parent, { userId }, context) => {
      const { id } = checkAuth(context);

      await Friends.deleteOne({
        $or: [
          { friend1Id: id, friend2Id: userId },
          { friend2Id: id, friend1Id: userId },
        ],
      });

      return "listo";
    },

    sendMessage: async (parent, { body, to }, context) => {
      const { id } = checkAuth(context);

      if (!id) throw new Error("NOT AUTHENTICATED");

      if (!body) return null;

      const encBody = cryptr.encrypt(body);

      const Message = await new Messages({
        from: id,
        to: to,
        body: encBody,
      }).save();

      pubsub.publish("SHOW_MESSAGES", {
        messages: {
          from: id,
          to: to,
          body: body,
          id: Message.id,
        },
      });

      await Friends.updateOne(
        {
          $or: [
            { friend1Id: id, friend2Id: to },
            { friend1Id: to, friend2Id: id },
          ],
        },
        { $set: { lastMessage: body } }
      );

      const chats = await User.findById(id);
      pubsub.publish("SHOW_CHATS", {
        chats: chats.chats,
      });

      return {
        id: Message.id,
        body: body,
        to: to,
        from: id,
      };
    },

    addToHistory: async (parent, { userId, userName, name }, context) => {
      const { id } = checkAuth(context);

      if (!id) throw new Error("NOT AUTHENTICATED");

      try {
        const user = await User.findById(id);
        const partner = await User.findById(userId);

        const date = new Date();

        let conf1 = true,
          conf2 = true;

        if (user.userName == name) conf1 = false;

        if (partner.userName === userName) conf2 = false;

        await new Calls({
          userId: id,
          userName: name,
          userConf: conf1,
          partnerId: userId,
          partnerName: userName,
          partnerConf: conf2,
          day: `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`,
          hour: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
        }).save();

        console.log(user.calls);

        await user.save();

        return "Saved";
      } catch (err) {
        return err;
      }
    },

    forgetPassword: async (parent, { email, lenguage }, context) => {
      const error = validateEmail(email, lenguage);

      if (error) throw new Error(error);

      const user = await User.findOne({ email });

      if (!user) {
        return "user not found";
      }

      const payload = {
        email: user.email,
        id: user.id,
      };

      const token = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "15m",
      });

      const link = `https://wirhir.netlify.app/recoverLink/${token}`;

      if (lenguage === "español") {
        await transporter.sendMail({
          from: "WIRHIR TEAM <wirhirteam@gmail.com>",
          to: email,
          subject: "Recuperar contraseña",
          html: `<p>Link para recuperar tu contraseña</p>
				<a href="${link}">${link}</a>
				`,
        });

        return "Correo enviado, revisa tu correo, si no lo encuentras, busca en la seccion the spam";
      } else {
        await transporter.sendMail({
          from: "WRIHIR TEAM <wirhirteam@gmail.com>",
          to: email,
          subject: "Recover Password",
          html: `<p>Plase, press this link to recover your password</p>
				<a href="${link}">${link}</a>
				`,
        });

        return "Email sent, check your emial, if you do not find it, check in the spam seccion";
      }
    },

    recoverPassword: async (
      parent,
      { email, confirmEmail, password, confirmPassword, lenguage },
      context
    ) => {
      const error = validateRecoverPassword(
        email,
        lenguage,
        password,
        confirmPassword
      );

      if (error) throw new Error(error);

      if (email !== confirmEmail) {
        if (lenguage === "español") {
          throw new Error("Los correos no son iguales");
        } else {
          throw new Error("The emails are not the same");
        }
      }

      if (password !== confirmPassword) {
        if (lenguage === "español") {
          throw new Error("Las contraseñas no son iguales");
        } else {
          throw new Error("The passwords are not the same");
        }
      }

      try {
        const newPassword = await bcrypt.hash(password, 12);

        await User.findOneAndUpdate(
          { email },
          {
            password: newPassword,
          }
        );

        if (lenguage === "español") {
          return "contraseña recuperada";
        } else {
          return "password recovered";
        }
      } catch (error) {
        throw new Error("ERROR");
      }
    },

    deleteProfile: async (parent, args, context) => {
      const { id } = checkAuth(context);

      if (!id) {
        throw new Error("Error");
      }

      await User.findByIdAndDelete(id);
      await Story.deleteMany({ publisher: id });
      await Post.deleteMany({ user: id });
      // await Post.deleteMany({
      // 	$or: [{ user: id }, { original: false, "mainPost.user": id }],
      // }).populate("mainPost");

      trashData();
      return "done";
    },

    addRandonName: async (parent, { name }) => {
      await new RandomNames({ name: name }).save();

      return "Listo";
    },
  },

  Subscription: {
    messages: {
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator(["SHOW_MESSAGES"]);
        },
        ({ messages }, { userId }) => {
          if (messages.from === userId || messages.to === userId) return true;
          else return false;
        }
      ),
    },
    chats: {
      subscribe: withFilter(
        () => {
          return pubsub.asyncIterator(["SHOW_CHATS"]);
        },
        (payload, { userId }) => {
          return true;
        }
      ),
    },
  },
};

module.exports = { resolvers };
