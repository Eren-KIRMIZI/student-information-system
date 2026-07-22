import { initOpenTelemetry } from '../observability/otel.js';
import { initMetrics } from '../observability/metrics/index.js';

/**
 * Uygulama ayağa kalkarken tüm observability bileşenlerini başlatır.
 * Sadece server.js'in en üstünde çağrılmalıdır.
 */
export const bootstrapObservability = () => {
  // 1. OpenTelemetry Initialization
  // (SDK'nın erken başlaması gerekiyor ki require() edilen tüm modülleri kancalayabilsin)
  initOpenTelemetry();

  // 2. Metrics Initialization
  initMetrics();
};
