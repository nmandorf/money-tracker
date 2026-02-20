const counters = new Map();

export function increment(metricName, value = 1) {
  counters.set(metricName, (counters.get(metricName) ?? 0) + value);
}

export function snapshotMetrics() {
  return Object.fromEntries(counters.entries());
}
