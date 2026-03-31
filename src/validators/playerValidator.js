import Joi from "joi";

const baseSchema = {
  teamId: Joi.string().hex().length(24).allow(null),
  jerseyNumber: Joi.number().integer().min(0),
  position: Joi.string()
    .trim()
    .valid("forward", "midfielder", "defender", "goalkeeper"),
  status: Joi.string().trim().valid("active", "injured", "inactive"),
};

const createPlayerSchema = Joi.object({
  ...baseSchema,
  teamId: baseSchema.teamId,
  jerseyNumber: baseSchema.jerseyNumber.required(),
  position: baseSchema.position.required(),
  status: baseSchema.status.required(),
});

const updatePlayerSchema = Joi.object(baseSchema).min(1);

export { createPlayerSchema, updatePlayerSchema };
