"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const  discount  = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repository/product.repo");
const { product } = require("../models/product.model");
const { findAllDiscountCodesUnSelect } = require("../models/repository/discount.repo");
const { filter } = require("lodash");
/*
    Discount Services
    1 - Generate discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [user | Shop]
    4 - Verify discount code [User]
    5 - Delete discount Code [Admin | Shop]
    6 - Cancel discount Code [User]
*/

class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active, shopId, min_order_value, product_ids, applies_to, name, description, type, value, max_uses, uses_count, users_uses, max_uses_per_user
        } = payload
        // kiem tra
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError(" Discount code has expired")
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be bbefore end_date')
        }
        // create index for discount code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId) // convert string into objectid
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exists!')

        }
        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: start_date,
            discount_end_date: end_date,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_uses,
            discount_max_user_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
            discount_is_active: is_active,
            discount_apply_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })

        return newDiscount
    }

    static async updateDiscountCode() {
        // TO-DO
    }


    /*
        Get all discount codes available with products
     */

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        // create indix for discount_code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId) // convert string into objectid
        }).lean()

        if (!foundDiscount || foundDiscount.discount_is_active) {
            throw new NotFoundError('discount not exists!')
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount

        let products

        if (discount_applies_to === 'all') {
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublish: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']

            })
        }


        if (discount_applies_to === 'specific') {
            //get the products ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublish: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']


            })

        }

        return products
    }

    /*
    get all discount code by shopId
    */
    static async getAllDiscountCodesByShop({limit, page, shopId}){
        const discounts = await findAllDiscountCodesUnSelect({
            limmit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })

        return discounts
    } 

}