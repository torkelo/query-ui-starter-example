import { type DataFrame, type PanelData, VariableSort } from '@grafana/data';
import { GridPanelLayout, useAdhocFilters, useVariableOptionsQuery, VizPanel } from '@grafana/query-ui';
import { Button, Combobox, Field, LoadingPlaceholder, RadioButtonGroup, Stack } from '@grafana/ui';
import React, { useMemo, useState } from 'react';

import { plainTimeSeriesGraph, useTimeSeriesConfig } from '../../sharedVisualizations';
import { GRID_TEMPLATE_COLUMNS, layoutOptions, type LayoutMode } from '../shared/panelLayout';
import { useMetricData } from '../useMetricData';

/** Labels that describe the metric itself rather than a dimension worth breaking down by. */
const EXCLUDED_LABELS = new Set(['__name__', 'le']);

/** Caps the panels for a label with many values, so they don't all render at once. */
const MAX_PANELS = 50;

interface BreakdownTabProps {
  metric: string;
  dsUid: string;
}

/** Shows the metric grouped by each of its labels, one panel per label. */
export function BreakdownTab({ metric, dsUid }: BreakdownTabProps) {
  const query = `label_names(${metric})`;
  const [selectedLabel, setSelectedLabel] = useState<string>();
  const [layout, setLayout] = useState<LayoutMode>('grid');

  const labelNames = useVariableOptionsQuery({
    enabled: true,
    datasource: { uid: dsUid },
    query,
    sort: VariableSort.alphabeticalAsc,
  });

  const labels = useMemo(
    () => (labelNames.data ?? []).map((option) => String(option.value)).filter((name) => !EXCLUDED_LABELS.has(name)),
    [labelNames.data]
  );

  const labelOptions = useMemo(() => labels.map((label) => ({ label, value: label })), [labels]);

  // The label can disappear when the filters or the time range change.
  const activeLabel = selectedLabel && labels.includes(selectedLabel) ? selectedLabel : undefined;

  return (
    <Stack direction="column" gap={2}>
      <Stack justifyContent="space-between" alignItems="flex-end">
        <Field label="By label" noMargin>
          <Combobox
            width={30}
            options={labelOptions}
            value={activeLabel ?? null}
            placeholder="All"
            loading={labelNames.isLoading}
            isClearable
            onChange={(option) => setSelectedLabel(option?.value)}
          />
        </Field>
        <Field label="View" noMargin>
          <RadioButtonGroup options={layoutOptions} value={layout} onChange={setLayout} />
        </Field>
      </Stack>
      {labelNames.isError && <pre>{labelNames.error.message}</pre>}
      {labelNames.data && labels.length === 0 && <div>This metric has no labels to break down by.</div>}
      {activeLabel ? (
        <LabelValuePanels metric={metric} dsUid={dsUid} label={activeLabel} layout={layout} />
      ) : (
        labels.length > 0 && (
          <GridPanelLayout isLazy templateColumns={GRID_TEMPLATE_COLUMNS[layout]}>
            {labels.map((label) => (
              <BreakdownPanel key={label} metric={metric} dsUid={dsUid} label={label} onSelect={setSelectedLabel} />
            ))}
          </GridPanelLayout>
        )
      )}
    </Stack>
  );
}

interface LabelValuePanelsProps {
  metric: string;
  dsUid: string;
  label: string;
  layout: LayoutMode;
}

/**
 * Shows one panel for each value of the label. A single query returns every value
 * as its own data frame, and each panel gets one of those frames.
 */
function LabelValuePanels({ metric, dsUid, label, layout }: LabelValuePanelsProps) {
  const data = useMetricData(metric, dsUid, { groupBy: label });
  const panelData = data.data;

  const panels = useMemo(() => {
    if (!panelData) {
      return [];
    }

    return panelData.series.map((frame) => {
      const value = getLabelValue(frame, label);

      return {
        value,
        title: value ?? frame.name ?? frame.refId ?? label,
        data: { ...panelData, series: [frame] },
      };
    });
  }, [panelData, label]);

  if (data.isError) {
    return <pre>{data.error.message}</pre>;
  }

  if (!panelData) {
    return <LoadingPlaceholder text="Loading..." />;
  }

  return (
    <Stack direction="column" gap={2}>
      <span>
        {panels.length > MAX_PANELS
          ? `Showing ${MAX_PANELS} of ${panels.length} values of ${label}`
          : `${panels.length} values of ${label}`}
      </span>
      <GridPanelLayout isLazy templateColumns={GRID_TEMPLATE_COLUMNS[layout]}>
        {panels.slice(0, MAX_PANELS).map((panel, index) => (
          <SeriesPanel
            key={panel.title}
            title={panel.title}
            data={panel.data}
            index={index}
            label={label}
            value={panel.value}
          />
        ))}
      </GridPanelLayout>
    </Stack>
  );
}

interface SeriesPanelProps {
  title: string;
  data: PanelData;
  /** Picks the series color, so that neighboring panels look different. */
  index: number;
  /** The label the panel belongs to. */
  label: string;
  /** The value of the label in this panel's series. Without it the panel can't be added to the filters. */
  value: string | undefined;
}

function SeriesPanel({ title, data, index, label, value }: SeriesPanelProps) {
  const vizConfig = useTimeSeriesConfig(index);
  const { filters, onAddFilter } = useAdhocFilters();

  const isFiltered = filters.some((f) => f.key === label && f.operator === '=' && f.value === value);

  return (
    <VizPanel
      title={title}
      vizConfig={vizConfig}
      data={data}
      actions={
        value !== undefined ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={isFiltered}
            onClick={() => onAddFilter({ key: label, operator: '=', value })}
          >
            Add to filters
          </Button>
        ) : undefined
      }
    />
  );
}

/** The value of the label in a series, which is what the query grouped it by. */
function getLabelValue(frame: DataFrame, label: string): string | undefined {
  return frame.fields.find((f) => f.labels?.[label] !== undefined)?.labels?.[label];
}

interface BreakdownPanelProps {
  metric: string;
  dsUid: string;
  label: string;
  /** Adds a Select button to the panel. Leave it out to hide the button. */
  onSelect?: (label: string) => void;
}

const BreakdownPanel = React.memo(function BreakdownPanel({ metric, dsUid, label, onSelect }: BreakdownPanelProps) {
  const data = useMetricData(metric, dsUid, { groupBy: label });
  const seriesCount = data.data?.series.length;

  return (
    <VizPanel
      title={seriesCount === undefined ? label : `${label} (${seriesCount})`}
      vizConfig={plainTimeSeriesGraph}
      data={data.data}
      actions={
        // A label with a single value has nothing to compare, so selecting it adds nothing.
        onSelect && seriesCount !== undefined && seriesCount > 1 ? (
          <Button size="sm" variant="secondary" onClick={() => onSelect(label)}>
            Select
          </Button>
        ) : undefined
      }
    />
  );
});
