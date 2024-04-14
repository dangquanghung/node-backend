'use strict'

const shopModel = require("../models/shop.model")
const bycrypt = require('bc')

class AccessService {
    static signUp = async () => {
        try {
            // check emails exist?

            const holderShop = await shopModel.findOne({ email }).lean()
            if (holderShop) {
                return {
                    code: 'xxxx',
                    message: 'Shop already registered!'
                }
            }

            const newShop = await shopModel.create({
                name, email, passage, roles
            })
        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService