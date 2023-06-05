const sgMail = require("@sendgrid/mail");
const { emailValidation } = require("../validations/emailValidation");
const { getDb } = require("../config/db-setup");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.addEmail = async (req, res) => {
  try {
    await emailValidation.validateAsync(req.body.userObj);
  } catch (err) {
    console.log(err);
    return res.json({ error: err });
  }

  const userObj = {
    email: req.body.email,
    category: req.body.category,
  };
  const email = userObj.email;
  const category = userObj.category;

  const emailExist = await getDb().db().collection("emails").findOne({ email });
  if (emailExist) {
    await getDb()
      .db()
      .collection("emails")
      .updateOne({ email }, { $set: { category } });
    return res.json({ message: "Email already exist" });
  } else {
    try {
      await getDb().db().collection("emails").insertOne(userObj);
      return res.send("email added to the database");
    } catch (err) {
      console.log(err);
      return res.json({ message: "Could not add try again" });
    }
  }
};

exports.unsubscribe = async (req, res) => {
  const email = req.body.email;

  const emailExist = await getDb().db().collection("emails").findOne({ email });

  if (emailExist) {
    const unsubscribed = await getDb()
      .db()
      .collection("emails")
      .deleteOne({ email });
    if (unsubscribed.deletedCount === 1) {
      return res.json({ message: "Successfully unsubscribed" });
    } else {
      return res.status(500).json({
        message: "Email found but could not be deleted, Try again",
      });
    }
  } else {
    return res.json({
      message: "You have entered an invalid e-mail address. please try again",
    });
  }
};

exports.sendEmail = async (req, res) => {
  let designJobs = [];
  let softwareJobs = [];
  let marketingJobs = [];
  let custommerJobs = [];

  const emails = await getDb().db().collection("emails").find().toArray();

  const jobIds = await getDb()
    .db()
    .collection("jobs")
    .find({
      createAt: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
    })
    .toArray();
  for (id of jobIds) {
    const bodyObj = {
      title: id.jobTitle,
      description: id.description,
      logo: `https://realremote.io/${id.logo}`,
      id: id._id,
      country: id.country,
      companyname: id.name,
    };
    if (id.category == "design") {
      designJobs.push(bodyObj);
    } else if (id.category == "softwareDevelopment") {
      softwareJobs.push(bodyObj);
    } else if (id.category == "managment") {
      marketingJobs.push(bodyObj);
    } else if (id.category == "informationTegnology") {
      custommerJobs.push(bodyObj);
    }
  }

  let messages = [
    {
      title: "Design",
      msgBody: designJobs,
    },
    {
      title: "Software Development",
      msgBody: softwareJobs,
    },
    {
      title: "Management",
      msgBody: marketingJobs,
    },
    {
      title: "Information Technology",
      msgBody: custommerJobs,
    },
  ];

  try {
    const isEmpty = (array) => {
      let counter = 0;
      for (let i = 0; i < array.length; i++) {
        console.log(array[i].length);
        if (array[i].length != 0) {
          counter += 1;
        }
      }
      if (counter === 0) {
        return true;
      } else {
        return false;
      }
    };
    for (fields of emails) {
      let obj = [];
      for (titles of messages) {
        if (fields.category.includes(titles.title)) {
          obj = [...obj, titles.msgBody];
        }
      }
      const MSG = {
        to: fields.email,
        from: {
          name: "RealRemote",
          email: "jobs@realremote.io",
        },
        template_id: "d-80f286a37f5449c88e369f9da32901c7",
        dynamic_template_data: {
          jobs: obj,
        },
      };
      if (isEmpty(obj) !== true) {
        sgMail.sendMultiple(MSG, (error, result) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email Sent");
          }
        });
      } else {
        console.log("no jobs to send to this user");
      }
    }
    return res.json({ type: "success", message: "emails sent" });
  } catch (err) {
    console.log(err);
  }
};
