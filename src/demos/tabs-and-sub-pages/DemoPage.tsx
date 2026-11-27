import { type ReactNode, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { NavModelItem } from '@grafana/data';
import { PluginPage } from '@grafana/runtime';
import {
  AdHocFiltersCombobox,
  TimeRangeContextPicker,
  TimeRangeRefresh,
  useDataQuery,
  useInterpolator,
  VariableValueCombobox,
} from '@grafana/query-ui';
import { Box, Field, Stack } from '@grafana/ui';

import { PLUGIN_BASE_URL, ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';

const demoRoute = ROUTES.TabsAndSubPages;

export const paths = {
  overview: prefixRoute(`${demoRoute}/overview`),
  httpHandlers: prefixRoute(`${demoRoute}/http-handlers`),
  /** Handlers are paths themselves, so the name is encoded to stay one route segment. */
  httpHandler: (handler: string) => prefixRoute(`${demoRoute}/http-handlers/${encodeURIComponent(handler)}`),
};

const tabs = [
  { text: 'Overview', path: paths.overview },
  { text: 'HTTP handlers', path: paths.httpHandlers },
];

/**
 * Turns a path into a link that carries the current query string along.
 *
 * The time range, the `ds` variable and the adhoc filters all sync from the
 * URL, and each falls back to its default when its key goes missing. A link to
 * a bare path would reset them. This carries every key, page-local ones
 * included, which is fine while all URL state belongs to the whole demo.
 */
export function useLinkWithUrlState(): (pathname: string) => string {
  const { search } = useLocation();

  return useCallback((pathname: string) => `${pathname}${search}`, [search]);
}

/** Shapes a testdata random walk so a stat lands in a plausible range. */
export interface RandomWalkRange {
  startValue: number;
  min: number;
  max: number;
}

/**
 * Runs a testdata random walk against the data source in `ds`, once it has
 * one. useDataQuery applies the adhoc filters on its own.
 */
export function useDemoQuery(alias: string, range?: RandomWalkRange) {
  const [ds, dsLoading] = useInterpolator('$ds');

  return useDataQuery({
    enabled: !dsLoading,
    queries: [{ refId: 'A', datasource: { uid: ds }, scenarioId: 'random_walk', alias, ...range }],
    maxDataPoints: 100,
  });
}

interface DemoPageProps {
  /** Makes this a drilldown page under the HTTP handlers tab, titled `drilldown`. */
  drilldown?: string;
  children: ReactNode;
}

/**
 * The page every route renders: the time controls, the tabs (or a drilldown's
 * breadcrumbs), and the data source and filter pickers above the content.
 */
export function DemoPage({ drilldown, children }: DemoPageProps) {
  const { pathname } = useLocation();
  const linkTo = useLinkWithUrlState();

  // Grafana renders `children` as tabs under the title and `parentItem` as breadcrumbs.
  const demoNav: NavModelItem = {
    text: 'Tabs and sub pages demo',
    url: linkTo(paths.overview),
    parentItem: { text: 'Query UI demos', url: PLUGIN_BASE_URL },
  };

  const pageNav: NavModelItem = drilldown
    ? {
        text: drilldown,
        parentItem: { text: 'HTTP handlers', url: linkTo(paths.httpHandlers), parentItem: demoNav },
      }
    : {
        ...demoNav,
        children: tabs.map((tab) => ({ text: tab.text, url: linkTo(tab.path), active: pathname === tab.path })),
      };

  return (
    <PluginPage
      pageNav={pageNav}
      actions={
        <>
          <TimeRangeContextPicker />
          <TimeRangeRefresh />
        </>
      }
    >
      <Stack direction="column" gap={2}>
        <Stack alignItems="flex-end">
          <VariableValueCombobox name="ds" />
          <Box grow={1}>
            <Field label="Filters" noMargin>
              <AdHocFiltersCombobox />
            </Field>
          </Box>
        </Stack>
        {children}
      </Stack>
    </PluginPage>
  );
}
