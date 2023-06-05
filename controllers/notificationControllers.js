const { getDb } = require("../config/db-setup");
const fetch = require("node-fetch");

exports.tokenSubscribe = async (req, res) => {
  console.log(req.body);
  const mobileUser = {
    expoToken: req.body.expoToken,
    tags: req.body.tags,
  };
  const tokenExist = await getDb()
    .db()
    .collection("mobileUsers")
    .findOne({ expoToken: req.body.expoToken });
  try {
    if (tokenExist) {
      // await getDb()
      //   .db()
      //   .collection("mobileUsers")
      //   .updateOne(
      //     { expoToken: req.body.expoToken },
      //     { $set: { tags: req.body.tags } }
      //   );
      return res.json({ message: "token already exists" });
    } else {
      await getDb().db().collection("mobileUsers").insertOne(mobileUser);
      return res.json({
        Message: "User Inserted To The Database",
        User: mobileUser,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: err });
  }
};

exports.sendPushNot = async (req, res) => {
  try {
    const pushTokens = await getDb()
      .db()
      .collection("mobileUsers")
      .find({})
      .toArray();

    const { jobObj, jobId } = req.body;
    console.log(req.body);
    pushTokens.forEach(async (pushToken) => {
      console.log(pushToken.expoToken);
      if (jobObj.tags.some((tag) => pushToken.tags.includes(tag))) {
        const message = {
          to: pushToken.expoToken,
          sound: "default",
          title: `New Job Available
          Your next project is waiting for you!`,
          body: jobObj.jobTitle,
          data: { jobId },
        };
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        });
        console.log("notification sent");
      } else {
        console.log("doesnt includes");
      }
    });
    return res.json({ message: "JOB SENT", jobId });
  } catch (err) {
    console.log(err);
  }
};

exports.getNewToken = async (req, res) => {
  const { oldExpoToken, newExpoToken } = req.body;

  if (oldExpoToken) {
    try {
      await getDb()
        .db()
        .collection("mobileUsers")
        .updateOne(
          {
            expoToken: oldExpoToken,
          },
          {
            $set: { expoToken: newExpoToken },
          }
        );
      console.log("eddited");
      return res.status(200).json({ message: "updated successfuly" });
    } catch (err) {
      console.log(err);
      return res.json({ message: err });
    }
  } else {
    try {
      await getDb().db().collection("mobileUsers").insertOne({ newExpoToken });
      console.log("added");
      return res.json("added to the db");
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }
};

exports.getTags = async (req, res) => {
  try {
    const { expoToken } = req.query;

    //

    if (expoToken === "") {
      return res.json({ tags: [] });
    }

    const tokenExist = await getDb()
      .db()
      .collection("mobileUsers")
      .findOne({ expoToken });

    console.log(tokenExist);

    if (!tokenExist) {
      return res.json({ Message: "User With That Token Does not Exists" });
    }

    return res.json({ tags: tokenExist.tags });
  } catch (err) {
    console.log(err);
    return res.json({ type: "error", Message: "try again later" });
  }
};

exports.editTags = async (req, res) => {
  try {
    const { expoToken, tags } = req.body;

    const tokenExist = await getDb()
      .db()
      .collection("mobileUsers")
      .findOne({ expoToken });

    if (!tokenExist) {
      await getDb()
        .db()
        .collection("mobileUsers")
        .insertOne({ expoToken, tags });
      return res.json({ Message: "New User Inserted" });
    }

    const editedTags = await getDb()
      .db()
      .collection("mobileUsers")
      .updateOne({ expoToken }, { $set: { tags } });

    if (editedTags.modifiedCount === 1) {
      return res.json({ type: "success", Message: "Tags updated successfuly" });
    } else {
      return res.json({ Message: "Tags are same" });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({ type: "error", Message: "Try Again Later" });
  }
};
