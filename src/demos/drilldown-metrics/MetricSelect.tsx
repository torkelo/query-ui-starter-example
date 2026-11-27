import { GridPanelLayout, useInterpolator, useVariableOptionsQuery, VizPanel } from '@grafana/query-ui';
import { Icon, Input, LinkButton, RadioButtonGroup, Stack } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useTimeSeriesConfig } from '../sharedVisualizations';
import { VAR_FILTERS, VAR_METRIC } from './shared/shared';
import { GRID_TEMPLATE_COLUMNS, layoutOptions, type LayoutMode } from './shared/panelLayout';
import { useMetricData } from './useMetricData';

/** Caps the number of panels so a large Prometheus instance doesn't fire thousands of queries. */
const MAX_PANELS = 50;

const SEARCH_DEBOUNCE_MS = 300;

/** Returns `value`, but only after it has stopped changing for `delayMs`. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}

/** Lists the metrics of the data source as a searchable grid of panels. */
export const MetricSelect = React.memo(function MetricSelect() {
  const [ds, loading] = useInterpolator('${ds}');
  const [query, _] = useInterpolator(`label_values({$${VAR_FILTERS}}, __name__)`);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const metrics = useVariableOptionsQuery({
    enabled: !loading,
    datasource: { uid: ds },
    query: query,
  });

  const filteredMetrics = useMemo(() => {
    const needle = search.trim().toLowerCase();
    // The index is the position in the full list, which keeps a panel's color the same while searching.
    const all = (metrics.data ?? []).map((metric, index) => ({ name: String(metric.value), index }));
    return needle ? all.filter(({ name }) => name.toLowerCase().includes(needle)) : all;
  }, [metrics.data, search]);

  return (
    <Stack direction="column" gap={3}>
      <Stack gap={2} alignItems="center">
        <div style={{ flexGrow: 1 }}>
          <Input
            prefix={<Icon name="search" />}
            suffix={
              searchInput ? (
                <Icon
                  name="times"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                />
              ) : undefined
            }
            value={searchInput}
            placeholder="Search metrics"
            onChange={(evt) => setSearchInput(evt.currentTarget.value)}
          />
        </div>
        <RadioButtonGroup options={layoutOptions} value={layout} onChange={setLayout} />
        {metrics.data && (
          <span>
            {filteredMetrics.length > MAX_PANELS
              ? `Showing ${MAX_PANELS} of ${filteredMetrics.length} metrics`
              : `${filteredMetrics.length} metrics`}
          </span>
        )}
      </Stack>
      {metrics.isError && <pre>{metrics.error.message}</pre>}
      {metrics.data && (
        <GridPanelLayout isLazy templateColumns={GRID_TEMPLATE_COLUMNS[layout]}>
          {filteredMetrics.slice(0, MAX_PANELS).map(({ name, index }) => (
            <MetricPanel key={name} metric={name} dsUid={ds} index={index} />
          ))}
        </GridPanelLayout>
      )}
    </Stack>
  );
});

interface MetricPanelProps {
  metric: string;
  dsUid: string;
  /** Picks the series color. It is the position in the full metric list, so it stays put while searching. */
  index: number;
}

const MetricPanel = React.memo(function MetricPanel({ metric, dsUid, index }: MetricPanelProps) {
  const data = useMetricData(metric, dsUid);
  const vizConfig = useTimeSeriesConfig(index);
  const location = useLocation();

  // Keeps the other query parameters, like the time range and data source
  const getSelectUrl = () => {
    const params = new URLSearchParams(location.search);
    params.set(`var-${VAR_METRIC}`, metric);
    return `${location.pathname}?${params.toString()}`;
  };

  return (
    <VizPanel
      title={metric}
      vizConfig={vizConfig}
      data={data.data}
      actions={
        <LinkButton size="sm" variant="secondary" href={getSelectUrl()}>
          Select
        </LinkButton>
      }
    />
  );
});
