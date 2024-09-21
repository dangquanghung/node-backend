"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

var inventorySchema = new Schema(
  {
    inven_productId: { type: Schema.Types.ObjectId, ref: "Product" },
    inven_location: { type: String, default: "unknown" },
    inven_stock: { type: Number, required: true },
    inven_shopId: { type: Schema.Types.ObjectId, ref: "Shop" },
    inven_reservations: { type: Array, default: [] }, //this is to see pre order
    /*
    cartId,
    stock:1
    createdOn: 

    khi đặt hàng thì sẽ tạo mới một inven_reservations
    khi thanh toán thì sẽ xóa inven_reservations
     */
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, inventorySchema);
