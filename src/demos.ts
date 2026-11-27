import { ComponentType, lazy } from 'react';
import { ROUTES } from './constants';

export interface Demo {
  /** Route path relative to the plugin base URL. The demo can add routes of its own below it. */
  route: ROUTES;
  title: string;
  description: string;
  /** What the demo needs from the Grafana instance it runs in. */
  requirement: string;
  /** What the demo shows off, as a short list of @grafana/query-ui building blocks. */
  highlights: string[];
  component: ComponentType;
}

/**
 * Every demo the app serves. App.tsx creates a route for each entry and the
 * home page links to each one, so adding a demo only needs a new entry here.
 * Each demo is loaded on demand, so the home page doesn't pay for them.
 */
export const demos: Demo[] = [
  {
    route: ROUTES.DrilldownMetrics,
    title: 'Drilldown metrics',
    description:
      'Browse the metrics of a Prometheus data source as a searchable grid of panels, then select one to break it down by label.',
    requirement: 'Needs a Prometheus data source.',
    highlights: ['DataSourceVariable', 'AdhocFiltersProvider', 'GridPanelLayout', 'VizPanel', 'useDataQuery'],
    component: lazy(() =>
      import('./demos/drilldown-metrics/DrilldownMetrics').then((m) => ({ default: m.DrilldownMetrics }))
    ),
  },
  {
    route: ROUTES.TabsAndSubPages,
    title: 'Tabs and sub pages',
    description:
      'A small app inside the app: two tabs that are routes of their own, plus a drilldown page for each HTTP handler. All pages share the data source, filters and time range through the URL.',
    requirement: 'Needs the TestData data source.',
    highlights: ['Routes and page navigation', 'UrlStateProvider', 'TimeRangeContextProvider', 'VizConfigBuilders'],
    component: lazy(() =>
      import('./demos/tabs-and-sub-pages/TabsAndSubPagesDemo').then((m) => ({ default: m.TabsAndSubPagesDemo }))
    ),
  },
];
