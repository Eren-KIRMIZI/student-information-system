const flags = {
  CACHE_ENABLED:         process.env.CACHE_ENABLED === 'true',
  MAIL_ENABLED:          process.env.MAIL_ENABLED === 'true',
  NOTIFICATION_ENABLED:  process.env.NOTIFICATION_ENABLED === 'true',
  REGISTRATION_ENABLED:  process.env.REGISTRATION_ENABLED !== 'false',
  AUDIT_ENABLED:         process.env.AUDIT_ENABLED === 'true',
  QUEUE_ENABLED:         process.env.QUEUE_ENABLED === 'true',
  RATE_LIMIT_ENABLED:    process.env.RATE_LIMIT_ENABLED !== 'false',
  COMPRESSION_ENABLED:   process.env.COMPRESSION_ENABLED !== 'false',
  ETAG_ENABLED:          process.env.ETAG_ENABLED !== 'false',
  TELEMETRY_ENABLED:     process.env.TELEMETRY_ENABLED === 'true',
  IDEMPOTENCY_ENABLED:   process.env.IDEMPOTENCY_ENABLED === 'true',
  MAINTENANCE_MODE:      process.env.MAINTENANCE_MODE === 'true',
};

export const isFeatureEnabled = (flag) => flags[flag] === true;
export const getFeatureFlags = () => ({ ...flags });
