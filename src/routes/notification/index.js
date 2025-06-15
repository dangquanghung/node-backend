
"use strict";

const express = require("express");
const NotificationController = require("../../controllers/notification.controller")
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");
// here for not login yet
// authentication //
router.use(authentication);
//////////////


router.get("", asyncHandler(NotificationController.listNotiByUser));


module.exports = router;

