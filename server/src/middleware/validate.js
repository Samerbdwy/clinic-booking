// Runs a zod schema against req.body / req.query / req.params and stores the
// cleaned result in req.valid. Returns 400 with a short message on failure.
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const first = result.error.issues[0];
      const field = first?.path?.join('.') || 'request';
      return res.status(400).json({ error: `Invalid ${field}` });
    }
    req.valid = { ...(req.valid || {}), [source]: result.data };
    next();
  };
}
