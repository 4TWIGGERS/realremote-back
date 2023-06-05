const joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

exports.authValidation = joi.object({
  name: joi.required(),
  email: joi.required(),
  //password: joi.passwordComplexity(complexityOptions).required(),
});
