'use strict'


const { cart } = require('../models/cart.model')

class CartService {


    /// START REPO CART ///

    static async createUserCart({ userId, product }) {
        const query =
        {
            cart_userId: userId, cart_state: 'active'
        },
            updateOrInsert = {
                $addToSet: {
                    cart_products: product
                }
            },

            options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({ userId, product }) {
        const { productId, quantity } = product
        const query = { cart_userId: userId, 'cart_products.productId': productId, cart_state: 'active' },
            updateSet = {
                $inc: {
                    'cart_products.$.quantity': quantity
                }
            },
            options = { upsert: true, new: true }

        return await cart.findOneAndUpdate(query, updateOrInsert, options)
    }

    /// END REPO CART ///
    static async addToCart({ userId, product = {} }) {
        // check cai cart co ton tai hay khong
        const userCart = await cart.findOne({
            cart_userId: userId
        })

        if (!userCart) {
            // create cart for user

            return await CartService.createUserCart({ userId, product })
        }
        // neu co do hang roi nhung chua co san pham thi

        if (userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }

        // neu gio hang ton tai, va co san pham nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product })
    }



}

module.exports = CartService