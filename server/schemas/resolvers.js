const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (_, args, context) => {
      if (context.user) {
        const user = await User.findOne({ _id: context.user._id }).populate(
          "savedBooks"
        );
        return user;
      }

      throw new AuthenticationError("You are not logged in.");
    },
  },
  Mutation: {
    login: async (_, args) => {
      const user = await User.findOne({ email: args.email });
      if (!user) throw new AuthenticationError("Wrong credentials.");

      const verified = await user.isCorrectPassword(args.password);
      if (!verified) throw new AuthenticationError("Wrong credentials.");

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (_, { content }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: content } },
          { new: true, runValidators: true }
        );
        return user;
      }

      throw new AuthenticationError("You are not logged in.");
    },
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return user;
      }

      throw new AuthenticationError("You are not logged in.");
    },
  },
};

module.exports = resolvers;
