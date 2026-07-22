import client from 'prom-client';

export const initProcessMetrics = (registry) => {
  // Bu metod otomatik olarak event loop delay, heap size, active handles, active requests
  // ve CPU usage gibi bilgileri standart isimlerle (nodejs_*, process_*) registry'ye ekler.
  client.collectDefaultMetrics({
    register: registry,
    // obs_ prefix'i KALDIRILDI, standart isimler kullanılıyor
  });
};
