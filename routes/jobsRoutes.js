const express = require("express");
const router = express.Router();
const controller = require(".././controllers/jobsControllers");
const { verify } = require("../middelwares/verifyToken");

router.post("/create/job", controller.createJob);
router.delete("/delete/job", controller.deleteJob);
router.post("/edit/job", controller.editJob);
router.post("/search/job", controller.searchJob);
router.get("/find/one/job", controller.findOneJob);
router.patch("/reset/sitemap", controller.siteMap);

module.exports = router;
