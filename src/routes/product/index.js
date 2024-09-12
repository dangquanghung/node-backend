"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

router.get(
  "/search/:keySearch",
  asyncHandler(productController.getListSearchProduct),
);
router.get("/", asyncHandler(productController.findAllProducts));
router.get("/:product_id", asyncHandler(productController.getProductDetail));

// authentication //
router.use(authentication);
//////////////

router.post("", asyncHandler(productController.createProduct));
router.post(
  "/publish/:id",
  asyncHandler(productController.publishProductByShop),
);
router.post(
  "/unpublish/:id",
  asyncHandler(productController.unPublishProductByShop),
);

// QUERY //
router.get("/drafts/all", asyncHandler(productController.getAllDraftForShop));
router.get(
  "/published/all",
  asyncHandler(productController.getAllPublishForShop),
);

module.exports = router;
