"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const { convertToObjectIdMongodb } = require("../utils");
const { findAllProducts } = require("../models/repository/product.repo");
const { product } = require("../models/product.model");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
} = require("../models/repository/discount.repo");
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
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_uses,
      uses_count,
      users_uses,
      max_uses_per_user,
    } = payload;
    // kiem tra
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError(" Discount code has expired");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end_date");
    }
    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId), // convert string into objectid
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists!");
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
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {
    // TO-DO
  }

  /*
        Get all discount codes available with products
     */

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    // create indix for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId), // convert string into objectid
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("discount not exists!");
    }

    const { discount_apply_to, discount_product_ids } = foundDiscount;

    let products;

    if (discount_apply_to === "all") {
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_apply_to === "specific") {
      console.log(typeof discount_product_ids);
      //get the products idsid
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids[0] },
          isPublish: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /*
    get all discount code by shopId
    */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limmit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });

    return discounts;
  }

  /*
    Aplly Discount Code
    products = [
            {
                productId,
                shopId,
                quantity,
                name, 
                price
            },
                    
            {
                productId,
                shopId,
                quantity,
                name, 
                price
            },                    
        ]
    */
  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId), // convert string into objectid
      },
    });
    if (!foundDiscount) throw new NotFoundError(`Discount doesn't not exists!`);

    const {
      discount_is_active,
      discount_max_uses,
      discount_start_date,
      discount_end_date,
      discount_min_order_value,
      discount_max_user_per_user,
      discount_users_used,
      discount_type,
      discount_value,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError(`Discount expired!`);
    if (!discount_max_uses) throw new NotFoundError(`discount are out!`);

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError("discount ecode has expired!");
    }
    // check xem co1 xet gia tri toi thieu hay khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      //get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `discount require a minium order value of ${discount_min_order_value}`,
        );
      }

      if (discount_max_user_per_user > 0) {
        const usesUserDiscount = discount_users_used.find(
          (use) => use.userId === userId,
        );
        if (usesUserDiscount) {
          //...
        }
      }

      //check xem discount nay la fixed_amount - percentage
      const amount =
        discount_type === "fixed_amount"
          ? discount_value
          : totalOrder * (discount_value / 100);
      return {
        totalOrder,
        discount: amount,
        totalPrice: totalOrder - amount,
      };
    }
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const foundDiscount = "";
    if (foundDiscount) {
      // deleted
    }

    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: ConvolverNode(shopId),
    });
    return deleted;
  }

  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    /*
            Cancel Discount Code ()
        */

    if (!foundDiscount) {
      throw new NotFoundError("discount not exists!");
    }

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });
    return result;
  }
}

module.exports = DiscountService;
