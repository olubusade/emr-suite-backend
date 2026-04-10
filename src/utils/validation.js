import { ZodError } from 'zod';

/**
 * validate(schema)
 * schema is a Zod object that expects { body?: ..., params?: ..., query?: ... }
 *
 * Example:
 * router.post('/', validate(createAppointmentSchema), controller.createAppointment)
 */
export const validate = (schema) => (req, res, next) => {
  //console.log('PARAMS VALIDATE>>>',req.query)
  try {
    // Build object for parsing
    const toValidate = { body: req.body, params: req.params, query: req.query };
   // console.log('toValidate::', toValidate);
    // Parse - allow either a Zod schema or a function that returns parsed
    const parsed = typeof schema.parse === 'function' ? schema.parse(toValidate) : schema(toValidate);
    if (parsed) {
      //console.log('PARAMS VALIDATE>>>',parsed.query)
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
    }
    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map(i => {
        const fieldName = i.path[i.path.length - 1].toString();
        
        // Transform camelCase/snake_case to Friendly Labels
        // e.g., 'bloodPressure' -> 'Blood Pressure'
        const friendlyField = fieldName
          .replace(/([A-Z])/g, ' $1') 
          .replace(/_/g, ' ')
          .replace(/^./, str => str.toUpperCase())
          .trim();

        return {
          path: fieldName,
          message: `${friendlyField}: ${i.message}`
        };
      });

      return res.status(400).json({ 
        success: false, 
        message: details[0].message, 
        details 
      });
    }
    return next(err);
  }
};

error: (err) => {
  this.snackBar.open(err?.message || 'Error loading staff list', 'Close', {
    duration: 5000,
    panelClass: ['error-snackbar']
  });
}
  
error: (err) => {
  this.isLoading = false;
  this.snackBar.open(err?.message || 'check your input', 'Close', {
    duration: 5000,
    panelClass: ['error-snackbar']
  });
}