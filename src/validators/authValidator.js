import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(30).required(),
  lastName: Joi.string().min(2).max(30).required(),
  email: Joi.string().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().min(8).max(15).required(),
  sport: Joi.string()
    .trim()
    .valid("cricket", "football")
    .lowercase()
    .required(),
});
