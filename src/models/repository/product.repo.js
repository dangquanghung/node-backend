"use strict";

const { product } = require("../../models/product.model");
const { Types } = require("mongoose");
const { getSelectData, unGetSelectData, convertToObjectIdMongodb } = require("../../utils");

const localeConfig = { locale: "simple" };

const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const findAllPublishForShop = async ({ query, limit, skip }) => {
  return await queryProduct({ query, limit, skip });
};

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublish: true,
        $text: { $search: keySearch },
      },
      { score: { $meta: "textScore" } },
    )
    .sort({ score: { $meta: "textScore" } })
    .collation(localeConfig)
    .lean();

  return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product
    .findOne({
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    })
    .collation(localeConfig);

  if (!foundShop) return null;

  const { modifiedCount } = await product.updateOne(
    { _id: foundShop._id },
    {
      $set: {
        isDraft: false,
        isPublish: true,
      },
    },
    { collation: localeConfig }, // Add collation here if needed
  );

  return modifiedCount;
};

const unPublishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product
    .findOne({
      product_shop: new Types.ObjectId(product_shop),
      _id: new Types.ObjectId(product_id),
    })
    .collation(localeConfig);

  if (!foundShop) return null;

  const { modifiedCount } = await product.updateOne(
    { _id: foundShop._id },
    { $set: { isDraft: true, isPublish: false } },
    { collation: localeConfig },
  );

  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };

  const products = await product
    .find(filter)
    .collation(localeConfig)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect }) => {
  return await product
    .findById(product_id)
    .collation(localeConfig)
    .select(unGetSelectData(unSelect))
    .lean();
};

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) => {
  return await model
    .findByIdAndUpdate(productId, bodyUpdate, {
      new: isNew,
    })
    .collation(localeConfig);
};

const queryProduct = async ({ query, limit, skip }) => {
  return await product
    .find(query)
    .collation(localeConfig)
    .populate("product_shop", "name email _id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};


const getProductById = async (productId) => {
  return await product.findOne({ _id: convertToObjectIdMongodb(productId) })
    .collation(localeConfig).lean()
}

const checkProductByServer = async (products) => {
  return await Promise.all(products.map(async product => {
    const foundProduct = await getProductById(product.productId)
    if (foundProduct) {
      return {
        price: foundProduct.product_price,
        quantity: product.quantity,
        productId: product.productId
      }
    }
  }))
}

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  findAllPublishForShop,
  unPublishProductByShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  getProductById,
  checkProductByServer
};
