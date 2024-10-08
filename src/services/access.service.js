"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  ForbiddenError,
  AuthFailureError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  /**
   *
   *  check this token used?
   */

  static handlerRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("Something wrong happend !! Pls relogin");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new AuthFailureError("Shop not registered");

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop not registerd");

    // create a new couple
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey,
    );

    // await keytokenModel.updateOne(
    //   { _id: holderToken._id},
    //   {
    //     $set: { refreshToken: tokens.refreshToken },
    //     $addToSet: { refreshTokensUsed: refreshToken }
    //   }
    // );
    await KeyTokenService.updateNewRefreshToken(
      keyStore._id,
      tokens.refreshToken,
      refreshToken,
    );

    return {
      user,
      tokens,
    };
  };

  static logout = async ({ keyStore }) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  };

  /**
   *
   * 1 - check email in db
   * 2 - match password
   * 3 - create AT and RT and save
   * 4 - generate tokens
   * 5 - get data return login
   *
   */
  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop not registered");

    // 2.
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3.
    // create privateKey and publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4. Generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey,
    );

    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    const holderShop = await shopModel.findOne({ email }).lean();
    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // privateKey is not saved in server, end user keep them
      // publicKey saved in server
      // privateKey used to sign the token
      // publicKey varify token, taken from MongoDB

      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //     modulusLength: 4096,
      //     publicKeyEncoding: {
      //         type: 'pkcs1',
      //         format: 'pem'
      //     },
      //     privateKeyEncoding: {
      //         type: 'pkcs1',
      //         format: 'pem'
      //     }
      // });

      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      // Public key CryptoGraphy Standards

      console.log({ privateKey, publicKey }); // save collection KeyStore

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: "xxxx",
          message: "publicKeyString error",
        };
      }
      // console.log(`publicKeyString::`, publicKeyString)

      // const publicKeyObject = crypto.createPublicKey(publicKeyString)

      // console.log(`publicKeyObject::`, publicKeyObject)

      // created token pair
      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey,
      );
      console.log(`Created Token Success:: `, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: newShop,
          }),
          tokens,
        },
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
