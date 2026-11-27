import {
  VariableValueCombobox,
  DataSourceVariable,
  DefineVariable,
  useVariable,
  type VariableValue,
  AdhocFiltersProvider,
  AdHocFiltersCombobox,
  AdhocFiltersVariable,
  TimeRangeContextPicker,
  TimeRangeRefresh,
} from '@grafana/query-ui';
import { Box, Field, Stack } from '@grafana/ui';

import { MetricScene } from './MetricScene';
import { MetricSelect } from './MetricSelect';
import { VAR_FILTERS, VAR_METRIC, trailDS } from './shared/shared';
import { PLUGIN_BASE_URL } from '../../constants';
import { PluginPage } from '@grafana/runtime';
import { locationUtil, NavModelItem, PageLayoutType } from '@grafana/data';
import { useLocation } from 'react-router-dom';

export function DrilldownMetrics() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const metric = search.get('var-metric');

  let pageNav: NavModelItem = {
    text: 'Drilldown metrics',
    parentItem: { text: 'Query UI demos', url: PLUGIN_BASE_URL },
    url: locationUtil.getUrlForPartial(location, { 'var-metric': null }),
  };

  if (metric) {
    pageNav = { text: metric, parentItem: pageNav };
  }

  return (
    <PluginPage pageNav={pageNav} layout={PageLayoutType.Canvas}>
      <DataSourceVariable name="ds" pluginId="prometheus">
        <AdhocFiltersProvider datasource={trailDS}>
          <AdhocFiltersVariable name={VAR_FILTERS}>
            <DefineVariable name={VAR_METRIC} value={{ value: '' }}>
              <Stack direction="column" gap={2}>
                <Stack alignItems="flex-end">
                  <VariableValueCombobox name="ds" />
                  <Field label="Filters" noMargin>
                    <AdHocFiltersCombobox />
                  </Field>
                  <div style={{ flexGrow: 1 }} />
                  <TimeRangeContextPicker />
                  <TimeRangeRefresh />
                </Stack>
                <ViewRenderer />
              </Stack>
            </DefineVariable>
          </AdhocFiltersVariable>
        </AdhocFiltersProvider>
      </DataSourceVariable>
    </PluginPage>
  );
}

/** Shows the selected metric, or the list of metrics to pick from when none is selected. */
function ViewRenderer() {
  const metric = useVariable<VariableValue>(VAR_METRIC).value.value;

  return metric ? (
    // Keeps the original spacing below the variables, which the parent gap no longer provides.
    <Box paddingTop={0}>
      <MetricScene metric={String(metric)} />
    </Box>
  ) : (
    <MetricSelect />
  );
}
