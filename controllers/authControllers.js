const { getDb } = require("../config/db-setup");
//const { authValidation } = require("../validations/authValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.authRegister = async (req, res) => {
  try {
    //const result = await authValidation.validateAsync(req.body.userObj);

    const User = {
      name: req.body.name,
      password: req.body.password,
    };

    const nameExist = await getDb()
      .db()
      .collection("Users")
      .findOne({ name: User.name });
    if (nameExist) {
      return res.status(400).json({ error: "Name Already Exist" });
    }

    const hashPassword = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, hashPassword);

    User.password = hashedPassword;

    await getDb().db().collection("Users").insertOne(User);
    return res.json({ message: User });
  } catch (err) {
    return res.status(400).send(err);
  }
};

exports.authLogin = async (req, res) => {
  const { name, password } = req.body;

  const nameExist = await getDb().db().collection("Users").findOne({ name });

  if (!nameExist) {
    return res.status(400).send("name or password is wrong");
  }

  const hashedPassword = nameExist.password;

  const validPass = await bcrypt.compare(password, hashedPassword);
  if (!validPass) {
    return res.status(400).send("email or password is wrong");
  }
  const id = nameExist._id;

  const token = jwt.sign({ _id: id, name: name }, process.env.TOKEN_SECRET, {
    expiresIn: "24h",
  });
  const refreshToken = jwt.sign(
    { _id: id, name: name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "24h" }
  );
  res.header("auth-token", token).json({ token, refreshToken });
};

exports.renewToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) {
    return res.status(403).json({ message: "User Not Authenticated" });
  }
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (!err) {
      console.log(user);
      const accesToken = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      return res.status(201).json({ accesToken });
    } else {
      return res.status(403).json({ message: "User Not Authenticated" });
    }
  });
};
