import Joi from "joi";

export const playerSchema = Joi.object({
  teamId: Joi.string().hex().length(24).allow(null).optional(),
  jerseyNumber: Joi.number().min(0).required(),
  position: Joi.string()
    .valid("forward", "midfielder", "defender", "goalkeeper")
    .required(),
  status: Joi.string().valid("active", "injured", "inactive").required(),
});
