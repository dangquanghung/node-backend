"use strict";

const { Schema, model } = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const DOCUMENT_NAME = "Apikey";
const COLLECTION_NAME = "Apikeys";

var apiKeySchema = new Schema(
  {
    key: { // cho apiKey
      type: String,
      required: true,
      unique: true,
    },
    status: { // work or not 
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ['0000', '1111', '2222'],
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  },
);

//Export the model
module.exports = model(DOCUMENT_NAME, apiKeySchema);
