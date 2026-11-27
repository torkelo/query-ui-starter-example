import { type ComponentProps, useMemo } from 'react';
import { InteractiveTable, TextLink } from '@grafana/ui';

import { DemoPage, paths, useLinkWithUrlState } from './DemoPage';

interface HttpHandler {
  handler: string;
  requestsPerSecond: number;
  errorRatePercent: number;
  p95LatencyMs: number;
}

/** A fixed set of fake handlers, shaped after Grafana's own HTTP routes. */
const httpHandlers: HttpHandler[] = [
  { handler: '/api/dashboards/uid/:uid', requestsPerSecond: 42.3, errorRatePercent: 0.4, p95LatencyMs: 118 },
  { handler: '/api/ds/query', requestsPerSecond: 128.9, errorRatePercent: 1.8, p95LatencyMs: 640 },
  { handler: '/api/search', requestsPerSecond: 17.5, errorRatePercent: 0.1, p95LatencyMs: 95 },
  { handler: '/api/annotations', requestsPerSecond: 9.2, errorRatePercent: 0.0, p95LatencyMs: 54 },
  { handler: '/api/user', requestsPerSecond: 31.7, errorRatePercent: 0.2, p95LatencyMs: 22 },
  { handler: '/api/live/ws', requestsPerSecond: 3.1, errorRatePercent: 4.6, p95LatencyMs: 1210 },
];

type Columns = ComponentProps<typeof InteractiveTable<HttpHandler>>['columns'];

/** Every handler, each linking to its drilldown page. */
export function HttpHandlersTab() {
  const linkTo = useLinkWithUrlState();

  const columns = useMemo<Columns>(
    () => [
      {
        id: 'handler',
        header: 'Handler',
        sortType: 'string',
        cell: ({ row }) => (
          <TextLink href={linkTo(paths.httpHandler(row.original.handler))} inline={false}>
            {row.original.handler}
          </TextLink>
        ),
      },
      {
        id: 'requestsPerSecond',
        header: 'Requests / s',
        sortType: 'number',
        cell: ({ row }) => row.original.requestsPerSecond.toFixed(1),
      },
      {
        id: 'errorRatePercent',
        header: 'Error rate',
        sortType: 'number',
        cell: ({ row }) => `${row.original.errorRatePercent.toFixed(1)}%`,
      },
      {
        id: 'p95LatencyMs',
        header: 'p95 latency',
        sortType: 'number',
        cell: ({ row }) => `${row.original.p95LatencyMs} ms`,
      },
    ],
    [linkTo]
  );

  return (
    <DemoPage>
      <InteractiveTable columns={columns} data={httpHandlers} getRowId={(row) => row.handler} />
    </DemoPage>
  );
}
