"use strict";

const { BadRequestError } = require("../core/error.response");
const { findById } = require("../services/apiKey.service");

const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION: "authorization",
};

const apiKey = async (req, res, next) => {
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      throw new BadRequestError("Error: Forbidden Error")
    }
    // check objKey
    const objKey = await findById(key);
    if (!objKey) {
      throw new BadRequestError("Error: Forbidden Error")
    }
    req.objKey = objKey;
    return next();
};

const permission = (permission) => {
  return (req, res, next) => {
    if (!req.objKey.permissions) {
      throw new BadRequestError("permission denied !")
    }
    console.log("permissions::", req.objKey.permissions);
    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      throw new BadRequestError("permission denied !")

    }
    return next();
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  apiKey,
  permission,
  asyncHandler,
};
