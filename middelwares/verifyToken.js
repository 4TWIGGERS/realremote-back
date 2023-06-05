const jwt = require("jsonwebtoken");

exports.verify = (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(400).json({ error: "access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};
