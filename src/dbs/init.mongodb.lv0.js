"use strict";

const mongoose = require("mongoose");

const connectString = `mongodb://127.0.0.1:27017/shopDEV`;

mongoose
  .connect(connectString)
  .then((_) => console.log(`Connected MongoDB Success`))
  .catch((err) => console.log(`Error Connect!`));

if (1 === 1) {
  mongoose.set("debug", true);
}
module.exports = mongoose;
