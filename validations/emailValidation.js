const Joi = require("joi");

exports.emailValidation = Joi.object({
  email: Joi.string().email(),
  category: Joi.array().items(Joi.string()),
});
