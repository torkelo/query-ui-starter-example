import { getMetricQuery } from './getMetricQuery';

describe('getMetricQuery', () => {
  it('averages a gauge', () => {
    expect(getMetricQuery('up')).toBe('avg(up)');
  });

  it('sums the rate of a counter', () => {
    expect(getMetricQuery('http_requests_total')).toBe('sum(rate(http_requests_total[$__rate_interval]))');
  });

  it('takes a quantile of a histogram', () => {
    expect(getMetricQuery('request_duration_bucket')).toBe(
      'histogram_quantile(0.95, sum by (le) (rate(request_duration_bucket[$__rate_interval])))'
    );
  });

  describe('with groupBy', () => {
    it('groups a gauge', () => {
      expect(getMetricQuery('up', 'cluster')).toBe('avg by (cluster)(up)');
    });

    it('groups a counter', () => {
      expect(getMetricQuery('http_requests_total', 'cluster')).toBe(
        'sum by (cluster)(rate(http_requests_total[$__rate_interval]))'
      );
    });

    it('keeps the le label when grouping a histogram', () => {
      expect(getMetricQuery('request_duration_bucket', 'cluster')).toBe(
        'histogram_quantile(0.95, sum by (le, cluster) (rate(request_duration_bucket[$__rate_interval])))'
      );
    });
  });
});
