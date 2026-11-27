import { Suspense, lazy } from 'react';
import { AppPlugin } from '@grafana/data';
import { initPluginTranslations } from '@grafana/i18n';
import { loadTranslations } from '@grafana/query-ui';
import { LoadingPlaceholder } from '@grafana/ui';
import pluginJson from './plugin.json';
import type { AppConfigProps } from './components/AppConfig/AppConfig';

// @grafana/query-ui calls t() while rendering, so its translations have to be loaded before anything renders.
await initPluginTranslations(pluginJson.id, [loadTranslations]);

const App = lazy(() => import('./components/App/App'));
const LazyAppConfig = lazy(() => import('./components/AppConfig/AppConfig'));

const AppConfig = (props: AppConfigProps) => (
  <Suspense fallback={<LoadingPlaceholder text="" />}>
    <LazyAppConfig {...props} />
  </Suspense>
);

export const plugin = new AppPlugin<{}>().setRootPage(App).addConfigPage({
  title: 'Configuration',
  icon: 'cog',
  body: AppConfig,
  id: 'configuration',
});
