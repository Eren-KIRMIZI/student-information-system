import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { getContextValue } from './context.js';
import { trace, context } from '@opentelemetry/api';

/**
 * OpenTelemetry SDK'yı başlatır.
 * Sadece env.OTEL_ENABLED="true" ise aktif olur.
 */
let sdk = null;

export const initOpenTelemetry = () => {
  if (process.env.OTEL_ENABLED !== 'true') {
    return;
  }

  try {
    // Tüm Node modüllerini otomatik dinleyen instrumentations paketi
    const instrumentations = [
      getNodeAutoInstrumentations({
        // Gerekirse özel ayarlar eklenebilir
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Dosya sistemi işlemlerini loglayıp kalabalık yapmaması için
        },
      }),
    ];

    sdk = new NodeSDK({
      instrumentations,
      // Şu an için Console exporter veya OTLP exporter yok.
      // Sadece memory'de trace context taşınacak.
      // İleride export edilmek istenirse buraya TraceExporter eklenebilir.
    });

    sdk.start();
    
    // Uygulama kapandığında SDK'yı düzgün kapat
    process.on('SIGTERM', () => {
      sdk.shutdown().finally(() => process.exit(0));
    });

    console.log('[Observability] OpenTelemetry initialized.');
  } catch (err) {
    console.error('[Observability] OpenTelemetry initialization failed', err);
  }
};

/**
 * Yeni OpenTelemetry API kullanarak trace ID ve span bilgisini alır.
 * Uygulamada `winston` veya `morgan` gibi araçlarda kullanmak için.
 * Eğer `@opentelemetry/api` içinde trace yoksa AsyncLocalStorage'daki (legacy tracer)
 * traceId veya request_id fallback olarak dönülür.
 */
export const getActiveTraceId = () => {
  const activeContext = context.active();
  const spanContext = trace.getSpanContext(activeContext);
  if (spanContext?.traceId) {
    return spanContext.traceId;
  }
  
  // OTel aktif değilse kendi context'imizden çekiyoruz
  return getContextValue('traceId');
};
