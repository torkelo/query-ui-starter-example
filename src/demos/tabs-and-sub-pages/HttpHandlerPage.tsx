import { useParams } from 'react-router-dom';
import { GridPanelLayout, VizPanel } from '@grafana/query-ui';

import { plainTimeSeriesGraph } from '../sharedVisualizations';
import { DemoPage, useDemoQuery } from './DemoPage';

function HandlerPanel({ title }: { title: string }) {
  const { data } = useDemoQuery(title);

  return <VizPanel title={title} vizConfig={plainTimeSeriesGraph} data={data} />;
}

/** The drilldown page of one handler, titled after the `:handler` route parameter. */
export function HttpHandlerPage() {
  const { handler = '' } = useParams();

  return (
    <DemoPage drilldown={handler}>
      <GridPanelLayout>
        <HandlerPanel title={`${handler} requests`} />
        <HandlerPanel title={`${handler} errors`} />
        <HandlerPanel title={`${handler} latency`} />
      </GridPanelLayout>
    </DemoPage>
  );
}
