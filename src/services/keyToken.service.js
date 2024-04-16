'use strict'

const keytokenModel = require("../models/keytoken.model")


class KeyTokenService {

    static createKeyToken = async ({ userId, publicKey }) => {
        try {
            const publicKeyString = publicKey.toString() // buffer is not hashed yet, 
            //so we convert to string to save in array, unless we get error
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey: publicKeyString
            })

            return tokens ? publicKeyString : null

        } catch (error) {
            return error
        }
    }

}

module.exports = KeyTokenService