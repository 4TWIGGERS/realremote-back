const express = require("express");
const router = express.Router();
const controller = require("../controllers/notificationControllers");

router.post("/notification/send", controller.sendPushNot);
router.post("/token/edit", controller.getNewToken);
router.post("/token/subscribe", controller.tokenSubscribe);
router.get("/tags", controller.getTags);
router.put("/tags/edit", controller.editTags);

module.exports = router;
