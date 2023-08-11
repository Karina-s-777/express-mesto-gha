const { celebrate, Joi } = require('celebrate');
const { URL_REGEX } = require('../utils/constants');

const validateUserBody = celebrate({
  // Joi позволяет указывать типы метки и задавать на них проверки
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi
      .string()
      .pattern(URL_REGEX),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

module.exports = { validateUserBody, validateLogin };
