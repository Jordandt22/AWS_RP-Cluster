module.exports = {
  bodyValidator: (schema) => async (req, res, next) => {
    try {
      await schema.validate(req.body);
      next();
    } catch (err) {
      res.status(422).json({ errors: err.errors });
    }
  },
  paramsValidator: (schema) => async (req, res, next) => {
    try {
      await schema.validate(req.params);
      next();
    } catch (err) {
      res.status(422).json({ errors: err.errors });
    }
  },
};
