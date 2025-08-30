import { ZodError } from 'zod';

/**
 * validate(schema)
 * schema is a Zod object that expects { body?: ..., params?: ..., query?: ... }
 *
 * Example:
 * router.post('/', validate(createAppointmentSchema), controller.createAppointment)
 */
export const validate = (schema) => (req, res, next) => {
  try {
    // Build object for parsing
    const toValidate = { body: req.body, params: req.params, query: req.query };
    // Parse - allow either a Zod schema or a function that returns parsed
    const parsed = typeof schema.parse === 'function' ? schema.parse(toValidate) : schema(toValidate);
    if (parsed) {
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
    }
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: 'Validation error', issues: err.issues });
    }
    return next(err);
  }
};
