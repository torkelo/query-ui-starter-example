import { useInterpolator, VizPanel } from '@grafana/query-ui';
import { Stack, Tab, TabsBar } from '@grafana/ui';
import { useState } from 'react';

import { plainTimeSeriesGraph } from '../sharedVisualizations';
import { BreakdownTab } from './Breakdown/BreakdownTab';
import { useMetricData } from './useMetricData';

interface MetricSceneProps {
  metric: string;
}

type TabId = 'breakdown' | 'related-metrics' | 'related-logs' | 'query-results';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'breakdown', label: 'Breakdown' },
  { id: 'related-metrics', label: 'Related metrics' },
  { id: 'related-logs', label: 'Related logs' },
  { id: 'query-results', label: 'Query results' },
];

/** The view for a single selected metric. */
export function MetricScene({ metric }: MetricSceneProps) {
  const [dsUid] = useInterpolator('${ds}');
  const data = useMetricData(metric, dsUid);
  const [activeTab, setActiveTab] = useState<TabId>('breakdown');

  return (
    <Stack direction="column" gap={2}>
      <div style={{ height: 300 }}>
        <VizPanel title={metric} vizConfig={plainTimeSeriesGraph} data={data.data} />
      </div>

      <TabsBar>
        {TABS.map((tab) => (
          <Tab key={tab.id} label={tab.label} active={activeTab === tab.id} onChangeTab={() => setActiveTab(tab.id)} />
        ))}
      </TabsBar>

      {activeTab === 'breakdown' ? <BreakdownTab metric={metric} dsUid={dsUid} /> : <div>Not implemented yet.</div>}
    </Stack>
  );
}
