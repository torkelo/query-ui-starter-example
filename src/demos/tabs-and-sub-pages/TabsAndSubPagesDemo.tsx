import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AdhocFiltersProvider, DataSourceVariable } from '@grafana/query-ui';

import { HttpHandlerPage } from './HttpHandlerPage';
import { HttpHandlersTab } from './HttpHandlersTab';
import { OverviewTab } from './OverviewTab';
import { paths } from './DemoPage';

/**
 * A small app inside the demo app: two tabs, each a route of its own, and a
 * drilldown page per HTTP handler. The data source variable and the adhoc
 * filters sit above the routes, so every page shares them, and every link
 * between the pages carries the URL state along.
 */
export function TabsAndSubPagesDemo() {
  return (
    <DataSourceVariable name="ds" pluginId="grafana-testdata-datasource">
      <AdhocFiltersProvider datasource={{ uid: '$ds' }}>
        <Routes>
          <Route index element={<RedirectToOverview />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="http-handlers" element={<HttpHandlersTab />} />
          <Route path="http-handlers/:handler" element={<HttpHandlerPage />} />
          <Route path="*" element={<RedirectToOverview />} />
        </Routes>
      </AdhocFiltersProvider>
    </DataSourceVariable>
  );
}

/** Opens the first tab, keeping whatever URL state the link came with. */
function RedirectToOverview() {
  const { search } = useLocation();

  return <Navigate to={{ pathname: paths.overview, search }} replace />;
}
