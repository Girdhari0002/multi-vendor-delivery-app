// Generic Zod validation middleware.
// Usage: validate({ body: schema }) or validate({ params: schema, query: schema })
export const validate = (schemas) => (req, res, next) => {
  for (const key of ['params', 'query', 'body']) {
    const schema = schemas[key];
    if (!schema) continue;

    const result = schema.safeParse(req[key]);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Express 5 defines req.query as a getter-only property, so a plain assignment throws.
    // Redefining it as an own data property overrides the inherited getter safely.
    if (key === 'query') {
      Object.defineProperty(req, 'query', { value: result.data, writable: true, configurable: true, enumerable: true });
    } else {
      req[key] = result.data;
    }
  }
  next();
};
