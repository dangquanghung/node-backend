"use strict";

const keytokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // //const publicKeyString = publicKey.toString(); // buffer is not hashed yet,
      // //so we convert to string to save in array, unless we get error
      // const tokens = await keytokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      const filter = { user: userId },
        update = {
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        options = { upsert: true, new: true };

      const tokens = await keytokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: userId }).lean();
  };

  static removeKeyById = async (id) => {
    return await keytokenModel.deleteOne( id )
  }
}

module.exports = KeyTokenService;
