const { gql } = require("apollo-server-core");

const typeDefs = gql`
  scalar Upload
  type User {
    id: ID!
    email: String!
    token: String!
    userName: String!
    profilePicture: File
    storiesSaved: [Story]
    discusionsSaved: [Post]
    biography: String
    banned: Boolean
  }

  type Calls {
    userId: ID!
    userName: String!
    name: String!
    day: String!
    hour: String!
  }

  type Chat {
    id: String!
    name: String!
    lastMessage: String
  }

  type Messages {
    id: ID!
    from: String!
    to: String!
    body: String!
  }

  type FriendRequest {
    senderId: ID!
    senderName: String!
    senderConf: Boolean!
    receiverId: ID!
    receiverName: String!
    receiverConf: Boolean!
    createdAt: String!
    requestContext: String!
  }

  type Friend {
    friend1Id: ID!
    friend1Name: String!
    friend1Conf: Boolean!
    friend2Id: ID!
    friend2Name: String!
    friend2Conf: Boolean!
    lastMessage: String
  }

  type Story {
    id: ID!
    title: String
    body: String!
    publisher: String!
    publicPublisher: String!
    confident: Boolean!
    image: File
    createdAt: String!
    lenguage: String!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    createdAt: String!
    user: String!
    publicPublisher: String!
    comments: [Post]!
    original: Boolean!
    answeringTo: Post
    mainPost: Post
    commetCount: Int!
    confident: Boolean!
    participants: [participant]
    lenguage: String!
    image: File
  }

  type Update {
    token: String
    id: ID!
  }

  type participant {
    id: ID!
    userId: String!
    userName: String!
  }

  type Answers {
    id: ID!
    body: String!
    publisher: String!
    publicPublisher: String!
    createdAt: String!
  }

  type File {
    filename: String
    mimetype: String
    encoding: String
  }

  input RegisterInput {
    userName: String!
    password: String!
    confirmPassword: String!
    email: String!
    lenguage: String!
  }

  type Calls {
    userId: ID!
    userConf: Boolean!
    userName: String!

    partnerId: ID!
    partnerConf: Boolean!
    partnerName: String!

    day: String!
    hour: String!
  }

  type Query {
    getUserStories: [Story]
    getRandomStory(lenguage: String!): Story
    getRandomPost(lenguage: String!): Post
    getComments(answeringId: ID!): [Post]
    getUserInfo(userId: ID!): User!
    getUserPosts: [Post]
    getStory(storyId: ID!): Story!
    getPost(postId: ID!): Post!
    showFriendRequests: [FriendRequest!]
    showParticipants(mainPostId: ID!): [participant]
    showFriends: [Friend]
    checkIfBanned: Boolean!
    showMessages: [Messages!]
    getChats: [Chat!]
    getCalls: [Calls!]
    getAllRandomNames: [String!]
  }

  type Mutation {
    register(registerInput: RegisterInput!): User!
    login(email: String!, password: String!, lenguage: String!): User!
    loginWithGoogle(userName: String!, password: String!, email: String!): User!
    createStory(
      title: String!
      body: String!
      confident: Boolean!
      lenguage: String!
      image: Upload
    ): Story!
    createPost(
      title: String!
      body: String!
      confident: Boolean!
      lenguage: String!
      image: Upload
    ): Post!
    createComment(
      postId: ID!
      body: String!
      mainPostId: ID!
      confident: Boolean!
      lenguage: String!
      image: Upload
    ): Post!
    updateProfile(
      biography: String
      userName: String
      image: Upload
      lenguage: String!
    ): Update
    saveStory(storyId: ID!): String!
    saveDiscusion(discusionId: ID!): String!
    deleteStory(storyId: ID!): String!
    deletePost(postId: ID!): String!
    onBookStory(storyId: ID!): String!
    onBookPost(postId: ID!): String!
    sendFriendRequest(
      senderName: String!
      receiverId: ID!
      receiverName: String!
      requestContext: String!
    ): String!
    denyRequest(senderId: ID!): String!
    acceptRequest(
      senderId: ID!
      senderName: String!
      receiverName: String!
    ): String!
    reportUser(userId: ID!): String!
    deleteFriend(userId: ID!): String!
    sendMessage(body: String!, to: ID!): Messages
    addToHistory(userId: ID!, userName: String!, name: String!): String!
    forgetPassword(email: String!, lenguage: String!): String!
    recoverPassword(
      email: String!
      confirmEmail: String!
      password: String!
      confirmPassword: String!
      lenguage: String!
    ): String!
    deleteProfile: String!
    addRandonName(name: String!): String!
  }

  type Subscription {
    messages(userId: ID!): Messages!
    chats(userId: ID!): [Chat!]
  }
`;
module.exports = { typeDefs };
