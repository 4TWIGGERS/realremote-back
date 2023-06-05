const express = require("express");
const router = express.Router();
const controller = require("../controllers/emailControllers");

router.post("/email/add", controller.addEmail);
router.post("/email/unsubscribe", controller.unsubscribe);
router.post("/email/send", controller.sendEmail);

module.exports = router;
