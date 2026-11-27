import { useDataQuery } from '@grafana/query-ui';

import { getMetricQuery } from './getMetricQuery';

interface MetricDataOptions {
  /** Splits the result into one series per value of this label. */
  groupBy?: string;
}

/** Runs the PromQL query that {@link getMetricQuery} picks for the metric. */
export function useMetricData(metric: string, dsUid: string, { groupBy }: MetricDataOptions = {}) {
  return useDataQuery({
    queries: [
      {
        refId: 'A',
        datasource: { uid: dsUid },
        expr: getMetricQuery(metric, groupBy),
        // Names each series after its label value, like `evals` instead of `{app_feature="evals"}`
        ...(groupBy && { legendFormat: `{{${groupBy}}}` }),
      },
    ],
    maxDataPoints: 100,
  });
}
