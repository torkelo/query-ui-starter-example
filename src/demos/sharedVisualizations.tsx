import { VizConfigBuilders } from '@grafana/query-ui';
import { GraphGradientMode, LineInterpolation, useTheme2 } from '@grafana/ui';
import { VisibilityMode } from '@grafana/schema';
import { useMemo } from 'react';

export const plainTimeSeriesGraph = VizConfigBuilders.timeseries()
  .setCustomFieldConfig('fillOpacity', 30)
  .setCustomFieldConfig('gradientMode', GraphGradientMode.Opacity)
  .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
  .setCustomFieldConfig('showPoints', VisibilityMode.Never)
  .build();

export function useTimeSeriesConfig(index: number) {
  const theme = useTheme2();

  return useMemo(
    () =>
      VizConfigBuilders.timeseries()
        .setCustomFieldConfig('fillOpacity', 30)
        .setCustomFieldConfig('gradientMode', GraphGradientMode.Opacity)
        .setCustomFieldConfig('lineInterpolation', LineInterpolation.Smooth)
        .setCustomFieldConfig('showPoints', VisibilityMode.Never)
        .setColor({
          mode: 'fixed',
          fixedColor: theme.visualization.getColorByName(theme.visualization.palette[index % 8]),
        })
        .build(),
    [theme, index]
  );
}
