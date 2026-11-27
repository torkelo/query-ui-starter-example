/**
 * Picks a reasonable PromQL expression for a metric based on Prometheus naming conventions.
 * Pass `groupBy` to split the result into one series per value of that label.
 */
export function getMetricQuery(metric: string, groupBy?: string): string {
  if (metric.endsWith('_bucket')) {
    const labels = groupBy ? `le, ${groupBy}` : 'le';
    return `histogram_quantile(0.95, sum by (${labels}) (rate(${metric}[$__rate_interval])))`;
  }

  if (metric.endsWith('_total') || metric.endsWith('_count') || metric.endsWith('_sum')) {
    const by = groupBy ? ` by (${groupBy})` : '';
    return `sum${by}(rate(${metric}[$__rate_interval]))`;
  }

  const by = groupBy ? ` by (${groupBy})` : '';
  return `avg${by}(${metric})`;
}
