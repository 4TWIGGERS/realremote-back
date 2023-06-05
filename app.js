const express = require("express");
const { initDB, getDb } = require("./config/db-setup");
const cron = require("node-cron");
const fetch = require("node-fetch");
//const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const emailRouter = require("./routes/emailRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const jobsRouter = require("./routes/jobsRoutes");
const authRouter = require("./routes/authRoutes");
const multer = require("multer");
const { Db } = require("mongodb");
const { ObjectId } = require("mongodb");

const app = express();
app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

const defaultTitle = "RealRemote.io - Remote Jobs";
const defaultDescription =
  "Real remote - platform for finding fully remote, exclusive and verified job offers, specializing in software development and design, Get our app and receive new job alerts.";
const defaultImage =
  "https://firebasestorage.googleapis.com/v0/b/realremote-96bd1.appspot.com/o/meta.png?alt=media";
const defaultSite = "https://realremote.io/";

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname + ".png");
  },
});

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ extended: false, limit: "150mb" }));
app.use(multer({ storage: imageStorage }).single("logo"));
require("dotenv").config();

app.get("/", (req, res) => {
  const filePath = path.resolve(__dirname, "./web-build/index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return console.log(err);
    }

    data = data
      .replace(/__TITLE__/g, defaultTitle)
      .replace(/__DESCRIPTION__/g, defaultDescription)
      .replace(/__IMAGE__/g, defaultImage)
      .replace(/__CARD__/g, defaultImage)
      .replace(/__SITE__/g, defaultSite);
    res.send(data);
  });
});

app.use("/images", express.static("images"));
app.use("/sitemaps", express.static("sitemaps"));
app.use(express.static(__dirname + "/web-build"));

app.use("/", authRouter);
app.use("/", emailRouter);
app.use("/", notificationRouter);
app.use("/", jobsRouter);

app.use("/count/jobs", async (req, res) => {
  try {
    let count = 0;
    const jobs = await getDb().db().collection("jobs").find({}).toArray();
    console.log(jobs);
    for (job of jobs) {
      count++;
      console.log(count);
    }
    return res.json({ count });
  } catch (err) {
    console.log(err);
  }
});

// app.get("*", (req, res) => {
//   return res.sendFile(__dirname + "/web-build/index.html");
// });

app.use("*", (req, res) => {
  const filePath = path.resolve(__dirname, "./web-build/index.html");
  fs.readFile(filePath, "utf8", async (err, data) => {
    if (err) {
      return console.log(err);
    }

    if (req.originalUrl.startsWith("/details") && req.query.jobId) {
      const jobId = req.query.jobId;
      console.log(jobId);
      const job = await getDb()
        .db()
        .collection("jobs")
        .findOne({ _id: new ObjectId(jobId) });
      console.log(job);
      job._id = req.query.jobId;
      data = data
        .replace(/__TITLE__/g, `${job.jobTitle} at ${job.name}`)
        .replace(/__DESCRIPTION__/g, `RealRemote.io`)
        .replace(/__IMAGE__/g, `https://realremote.io/${job.logo}`);
      console.log(job.logo);

      const jobStr = JSON.stringify(job);
      const partAmount = 6;
      const partLength = jobStr.length / partAmount;

      res.send(data);
    } else {
      data = data
        .replace(/TITLE/g, defaultTitle)
        .replace(/DESCRIPTION/g, defaultDescription)
        .replace(/IMAGE__/g, defaultImage);

      res.send(data);
    }
  });
});

cron.schedule(" 0 13 * * MON", async function () {
  const resp = await fetch("http://localhost:5000/email/send", {
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
});

const HOST = process.env.HOST;
const PORT = process.env.PORT || 5000;

initDB((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("CONNECTED TO DB");
    app.listen(PORT, () => {
      console.log(`Running on ${HOST}${PORT}`);
    });
  }
});
