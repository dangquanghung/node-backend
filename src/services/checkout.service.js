'use strict'

const { NotFoundError, BadRequestError } = require("../core/error.response")
const { findCartById } = require("../models/repository/cart.repo")
const { checkProductByServer } = require("../models/repository/product.repo")
const { getDiscountAmount } = require("../services/discount.service")
const { acquireLock, releaselock } = require("./redis.service")
const { order } = require('../models/order.model')
class CheckoutService {
    // login and without login
    /*
        {
            cartIdm
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts:[],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                },
                {
                    shopId,
                    shop_discounts:[
                        {
                            shopId,
                            discountId,
                            codeId
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
    */


    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        // check cartId ton tai kong?
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new NotFoundError('Cart not exist!')

        const checkout_order = {
            totalPrice: 0, //tong tien hang
            feeShop: 0,// phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckout: 0 // thong thanh toan
        }, shop_order_ids_new = []

        // tinh tong tien bill
        for (let index = 0; index < shop_order_ids.length; index++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[index]
            // check product available

            const checkProductServer = await checkProductByServer(item_products)
            console.log(`checkProductServer::`, checkProductByServer)
            if (!checkProductByServer.length) throw new BadRequestError('order wrong!!!')

            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            // tong tien truoc khi xu ly

            checkout_order.totalPrice = + checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // new shop_discounts ton tai >0, check xem co hop le hay khong
            if (shop_discounts.length > 0) {
                // gia su chi co mot discount
                // get amount discount

                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0]?.codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // tong tong discount giam gia
                checkout_order.totalDiscount += discount
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }


            // tong thanh toan cuoi cung

            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }


        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }

    }

    // order

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}

    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // check lai mot lan nua xem vuot ton ko hay khong
        // get new array Products

        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log(`[1]:`, products)
        const acquireProduct = []
        for (let index = 0; index < products.length; index++) {
            const { productId, quantity } = products[index]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (keyLock) {
                await releaselock(keyLock)
            }
        }


        // check lai if co mot san pham het hang trong kho

        if (acquireProduct.includes(false)) {
            throw new BadRequestError('mot so san pham da duoc cap nhat, vui long quay lai gio hang...')

        }
        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        // case: if insert successfully, remove product in cart
        if (newOrder) {
            // remove product in cart
        }

        return newOrder
    }

    /*
        1> Query Orders [Users]
    */

    static async getOrdersByUser() { }

   
    /*
       2> Query Order Using Id [Users]
    */

    static async getOneOrderByUser() { }

    
    
    /*
        3> Cancal Orders [Users]
    */

    static async cancelOrderByUser() { }

    
    
    /*
       4> Update Order Status Orders [Shop | Admin]
    */

    static async updateOrderStatusByShop() { }

}

module.exports = CheckoutService    