import { FieldColorModeId } from '@grafana/data';
import { GridPanelLayout, VizConfigBuilders, VizPanel, type VizConfig } from '@grafana/query-ui';

import { plainTimeSeriesGraph } from '../sharedVisualizations';
import { DemoPage, type RandomWalkRange, useDemoQuery } from './DemoPage';

/** Colored from the palette, since the default thresholds turn anything above 80 red. */
function statViz(unit: string) {
  return VizConfigBuilders.stat()
    .setUnit(unit)
    .setDecimals(1)
    .setColor({ mode: FieldColorModeId.PaletteClassic })
    .build();
}

const stats: Array<{ title: string; vizConfig: VizConfig; range: RandomWalkRange }> = [
  { title: 'Requests / s', vizConfig: statViz('reqps'), range: { startValue: 120, min: 60, max: 200 } },
  { title: 'Error rate', vizConfig: statViz('percent'), range: { startValue: 1, min: 0, max: 5 } },
  { title: 'p95 latency', vizConfig: statViz('ms'), range: { startValue: 180, min: 80, max: 400 } },
];

function StatPanel({ title, vizConfig, range }: (typeof stats)[number]) {
  const { data } = useDemoQuery(title, range);

  return <VizPanel title={title} vizConfig={vizConfig} data={data} />;
}

function RequestsGraph() {
  const { data } = useDemoQuery('Requests');

  return <VizPanel title="Requests" vizConfig={plainTimeSeriesGraph} data={data} />;
}

/** Three stats over a graph, all testdata random walks. */
export function OverviewTab() {
  return (
    <DemoPage>
      <GridPanelLayout templateColumns="repeat(3, 1fr)" autoRows="140px">
        {stats.map((stat) => (
          <StatPanel key={stat.title} {...stat} />
        ))}
      </GridPanelLayout>
      <GridPanelLayout templateColumns="1fr" autoRows="320px">
        <RequestsGraph />
      </GridPanelLayout>
    </DemoPage>
  );
}
