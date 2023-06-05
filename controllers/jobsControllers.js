const { getDb } = require("../config/db-setup");
const fetch = require("node-fetch");
const { ObjectId } = require("mongodb");
const { jobValidation } = require("../validations/jobValidation");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const path = require("path");
const { twitterImgHTML, twitterSVG } = require("../views/twitterIMG");
const { rwClient } = require("../utils/twitterClient");

exports.createJob = async (req, res) => {
  // try {
  //   await jobValidation.validateAsync(req.body);
  // } catch (err) {
  //   console.log(err);
  //   return res.status(400).send(err.message);
  // }

  //constants
  const imgDate = new Date().toISOString();
  const indexHTMlpath = path.resolve(__dirname, "../web-build/index.html");
  const twitterIMGOutput = `./images/${imgDate + "-"}"twitter.png`;

  if (!req.file) {
    return res.status(400).json({ message: "Job Photo Is Required" });
  }

  //Job Object
  try {
    let jobObj = {
      category: req.body.category,
      city: req.body.city,
      country: req.body.country,
      link: req.body.link,
      date: req.body.date,
      description: req.body.description,
      employmentType: req.body.employmentType,
      endDate: req.body.endDate,
      experience: req.body.experience,
      hotOrVerified: req.body.hotOrVerified,
      jobTitle: req.body.jobTitle,
      keywordArray: req.body.keywordArray,
      logo: req.file.path,
      name: req.body.name,
      offerSalary: req.body.offerSalary,
      startDate: req.body.startDate,
      workLevel: req.body.workLevel,
      createAt: new Date(),
    };

    if (req.body.tags) {
      jobObj.tags = JSON.parse(req.body.tags);
      console.log(jobObj.tags);
    }
    if (req.body.qualifications) {
      jobObj.qualifications = JSON.parse(req.body.qualifications);
      console.log(jobObj.tags);
    }
    if (req.body.whatWeOffer) {
      jobObj.whatWeOffer = JSON.parse(req.body.whatWeOffer);
    }
    if (req.body.keywordArray) {
      jobObj.keywordArray = JSON.parse(req.body.keywordArray);
    }
    if (req.body.responsibilities) {
      jobObj.responsibilities = JSON.parse(req.body.responsibilities);
    }

    //insert job
    const insertedJob = await getDb().db().collection("jobs").insertOne(jobObj);

    //insert job url to sitemaps.txt
    fs.appendFileSync(
      "./sitemaps/sitemap.txt",
      `\r\nhttps://realremote.io/details?jobId=${insertedJob.insertedId}`,
      "UTF-8",
      { flags: "a+" },
      (err) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Could not create job, Try again" });
      }
    );

    //create twitter post image
    await nodeHtmlToImage({
      output: twitterIMGOutput,
      html: twitterSVG(jobObj),
    });

    // const mediaId = await Promise.all([
    //   // file path
    //   rwClient.v1.uploadMedia(twitterIMGOutput),
    // ]);

    // await rwClient.v1.tweet(
    //   `${jobObj.name} is now hiring for a ${jobObj.jobTitle},
    //   📍Fully Remote - Balance work-life and have location independence.,
    //   👇🏻
    //   https://realremote.io/details?jobId=${insertedJob.insertedId}`,
    //   {
    //     media_ids: mediaId,
    //   }
    // );
    var b64content = fs.readFileSync(`./images/${imgDate + "-"}"twitter.png`, {
      encoding: "base64",
    });
    rwClient.post(
      "media/upload",
      { media_data: b64content },
      function (err, data, response) {
        // now we can assign alt text to the media, for use by screen readers and
        // other text-based presentations and interpreters
        var mediaIdStr = data.media_id_string;
        var altText = `${jobObj.name} is now hiring for a ${jobObj.jobTitle}, \n\n📍Fully Remote - Balance work-life and have location independence., \n\nhttps://realremote.io/details?jobId=${insertedJob.insertedId}; \n\n #remotejobs   #remotework   #workanywhere  #softwarejobs #rerealremote   #nowhiring `;
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } };

        rwClient.post(
          "media/metadata/create",
          meta_params,
          function (err, data, response) {
            if (!err) {
              // now we can reference the media and post a tweet (media will attach to the tweet)
              var params = {
                status: altText,
                media_ids: [mediaIdStr],
              };

              rwClient.post(
                "statuses/update",
                params,
                function (err, data, response) {
                  if (err) {
                    console.log(err);
                    return res
                      .status(500)
                      .json({ message: "Error while uploading tweet" });
                  }
                  console.log(data);
                }
              );
            }
          }
        );
      }
    );

    //replace twitter meta tag
    fs.readFile(indexHTMlpath, "utf8", async (err, data) => {
      if (err) {
        return console.log(err);
      }
      const twitterIMGpath = `https://realremote.io/${twitterIMGOutput}`;

      data = data.replace(/__CARD__/g, twitterIMGpath);
    });

    // push notifications
    await fetch("http://localhost:5000/notification/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: insertedJob.insertedId,
        jobObj: jobObj,
      }),
    });

    return res.status(200).json({ jobId: insertedJob.insertedId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error try again" });
  }
};

exports.deleteJob = async (req, res) => {
  const { jobId } = req.query;
  try {
    const job = await getDb()
      .db()
      .collection("jobs")
      .findOne({ _id: new ObjectId(jobId) });

    const path = `${job.logo}`;

    //delete job logo
    try {
      fs.unlinkSync(path);
      console.log("File removed:", path);
    } catch (err) {
      console.log(err);
      return res.send("could not remove photo");
    }

    //delete job from database
    await getDb()
      .db()
      .collection("jobs")
      .deleteOne({ _id: new ObjectId(jobId) });

    return res.status(200).json({ message: "Job Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

exports.editJob = async (req, res) => {
  //job validation
  try {
    await jobValidation.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send(err.message);
  }

  const jobId = req.query.id;

  let tags;
  let responsibilities;
  let keywordArray;
  let qualifications;
  let whatWeOffer;

  if (req.body.tags) {
    tags = JSON.parse(req.body.tags);
  }
  if (req.body.qualifications) {
    qualifications = JSON.parse(req.body.qualifications);
  }
  if (req.body.whatWeOffer) {
    whatWeOffer = JSON.parse(req.body.whatWeOffer);
  }
  if (req.body.keywordArray) {
    keywordArray = JSON.parse(req.body.keywordArray);
  }
  if (req.body.responsibilities) {
    responsibilities = JSON.parse(req.body.responsibilities);
  }

  try {
    if (req.file) {
      await getDb()
        .db()
        .collection("jobs")
        .updateOne(
          {
            _id: new ObjectId(jobId),
          },
          {
            $set: {
              jobTitle: req.body.jobTitle,
              description: req.body.description,
              link: req.body.link,
              qualifications,
              responsibilities,
              whatWeOffer,
              tags,
              name: req.body.name,
              country: req.body.country,
              workLevel: req.body.workLevel,
              employmentType: req.body.employmentType,
              category: req.body.category,
              experience: req.body.experience,
              offerSalary: req.body.offerSalary,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              logo: req.file.path,
              keywordArray,
              city: req.body.city,
              hotOrVerified: req.body.hotOrVerified,
            },
          }
        );
      console.log("Job Edited");
    } else {
      await getDb()
        .db()
        .collection("jobs")
        .updateOne(
          {
            _id: new ObjectId(jobId),
          },
          {
            $set: {
              jobTitle: req.body.jobTitle,
              description: req.body.description,
              link: req.body.link,
              qualifications,
              responsibilities,
              whatWeOffer,
              tags,
              name: req.body.name,
              country: req.body.country,
              workLevel: req.body.workLevel,
              employmentType: req.body.employmentType,
              category: req.body.category,
              experience: req.body.experience,
              offerSalary: req.body.offerSalary,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              keywordArray,
              city: req.body.city,
              hotOrVerified: req.body.hotOrVerified,
            },
          }
        );
      console.log("Job Edited");
    }
    return res.json({ message: "Job Edited" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err });
  }
};

exports.searchJob = async (req, res) => {
  let { searchString, employmentType, categoryArr, page } = req.body;
  //limit = JSON.parse(limit);
  //console.log(searchString, employmentType, categoryArr);

  //categoryArr = JSON.parse(categoryArr);
  //console.log(categoryArr);

  let obj = {};

  if (searchString) {
    const expression = `.*${searchString}.*`;
    const rx = new RegExp(expression, "i");
    obj = {
      $or: [{ jobTitle: rx }, { tags: rx }, { name: rx }],
    };
    console.log(obj);
  }
  if (employmentType) {
    obj.employmentType = { $in: employmentType };
  }
  if (categoryArr) {
    console.log(categoryArr);
    obj.category = { $in: categoryArr };
  }

  console.log(obj);

  try {
    const searchedJobs = await getDb()
      .db()
      .collection("jobs")
      .find(obj)
      .sort({ createAt: -1 })
      .skip((page - 1) * 10)
      .limit(10)
      .toArray();
    return res.send(searchedJobs);
  } catch (err) {
    console.log(err);
  }
};

exports.findOneJob = async (req, res) => {
  const { jobId } = req.query;
  console.log(jobId);

  try {
    const foundJob = await getDb()
      .db()
      .collection("jobs")
      .findOne({ _id: new ObjectId(jobId) });
    console.log(foundJob);
    return res.send(foundJob);
  } catch (err) {
    console.log(err);
    return res.json({ message: "error" });
  }
};

//endpoint for refreshing sitemap.txt
exports.siteMap = async (req, res) => {
  try {
    const jobs = await getDb().db().collection("jobs").find({}).toArray();
    for (i = 0; i < jobs.length; i++) {
      console.log(jobs[i]._id);
      fs.appendFileSync(
        "./sitemaps/sitemap.txt",
        `\r\nhttps://realremote.io/details?jobId=${jobs[i]._id}`,
        "UTF-8",
        { flags: "a+" },
        (err) => {
          if (err)
            return res
              .status(500)
              .json({ message: "Could not reset sitemaps, Try again" });
        }
      );
    }
    return res.json({ message: "success" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Could not reset sitemaps, Try again" });
  }
};
