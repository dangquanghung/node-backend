"use strict";

const ProductService = require("../services/product.service.xxx");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new Product success!",
      metadata: await ProductService.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Create new Product success!',
      metadata: await ProductService.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: 'Unpublish Product success!',
      metadata: await ProductService.unPublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId
      })
    }).send(res)
  }

  // QUERY //
  /**
* @description get all Drafts for shop
* @param {Number} limit 
* @param {Number} skip
* @returns  {JSON}
*/
  getAllDraftForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list draft success!",
      metadata: await ProductService.findAllDraftForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }


  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish success!",
      metadata: await ProductService.findAllPublishForShop({
        product_shop: req.user.userId
      })
    }).send(res)
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish products success!",
      metadata: await ProductService.searchProducts(req.params)
    }).send(res)
  }

  findAllProducts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list publish products success!",
      metadata: await ProductService.findAllProducts(req.query)
    }).send(res)

  }

  getProductDetail = async (req, res, next) => {
    new SuccessResponse({
      message: "Get product detail success!",
      metadata: await ProductService.findProduct({
        product_id: req.params.product_id
      })
    }).send(res)
  }
  // END QUERY //
}

module.exports = new ProductController();
