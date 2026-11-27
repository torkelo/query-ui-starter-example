import type { SelectableValue } from '@grafana/data';

export type LayoutMode = 'grid' | 'rows';

export const layoutOptions: Array<SelectableValue<LayoutMode>> = [
  { label: 'Grid', value: 'grid' },
  { label: 'Rows', value: 'rows' },
];

/** Grid fits as many columns as possible, rows stacks the panels in a single column. */
export const GRID_TEMPLATE_COLUMNS: Record<LayoutMode, string> = {
  grid: 'repeat(auto-fit, minmax(400px, 1fr))',
  rows: '1fr',
};
