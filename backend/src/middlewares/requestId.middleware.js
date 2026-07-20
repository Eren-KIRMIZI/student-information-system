import crypto from 'crypto';
import { runWithCorrelation } from '../utils/correlation.js';

export const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  runWithCorrelation(id, () => next());
};
