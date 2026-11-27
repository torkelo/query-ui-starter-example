import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

/** Route of each demo, relative to the plugin base URL. */
export enum ROUTES {
  DrilldownMetrics = 'drilldown-metrics',
  TabsAndSubPages = 'tabs-and-sub-pages-demo',
}
