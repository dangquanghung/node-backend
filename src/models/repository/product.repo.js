'use strict'

const { product, electronic, clothing, furniture } = require('../../models/product.model')
const { Types } = require("mongoose")

const localeConfig = { locale: "simple" }

const findAllDraftForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}

const findAllPublishForShop = async ({ query, limit, skip }) => {
    return await queryProduct({ query, limit, skip })
}


const publishProductByShop = async ({ product_shop, product_id }) => {


    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    }).collation(localeConfig)

    if (!foundShop) return null

    const { modifiedCount } = await product.updateOne(
        { _id: foundShop._id },
        {
            $set: {
                isDraft: false,
                isPublish: true
            }
        },
        { collation: localeConfig } // Add collation here if needed
    )
    
    return modifiedCount
}


const queryProduct = async ({ query, limit, skip }) => {
    return await product.find(query)
        .collation(localeConfig)
        .populate('product_shop', 'name email _id')
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
}

module.exports = {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop
}