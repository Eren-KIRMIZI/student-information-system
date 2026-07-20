export const tracer = {
  startSpan(name, attributes = {}) {
    const span = {
      name,
      attributes,
      startTime: Date.now(),
      events: [],
    };

    return {
      end: () => {
        span.endTime = Date.now();
        span.durationMs = span.endTime - span.startTime;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Tracer] ${span.name} (${span.durationMs}ms)`, span.attributes);
        }
        return span;
      },
      addEvent: (name, attributes) => {
        span.events.push({ name, attributes, timestamp: Date.now() });
      },
      setAttribute: (key, value) => {
        span.attributes[key] = value;
      },
    };
  },
};
