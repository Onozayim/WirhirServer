const { AuthenticationError } = require("apollo-server-express");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../Config");

const checkAuth = (context) => {
  const authHeader = context.req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/ExpiredToken, pls login again");
      }
    }

    throw new Error(
      "Authentication token must be 'Bearer [token]', please login again"
    );
  }

  throw new Error(
    "Autherization header must be provided, please log in again "
  );
};

module.exports = { checkAuth };
