import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppRootProps } from '@grafana/data';
import { TimeRangeContextProvider, UrlStateProvider } from '@grafana/query-ui';
import { LoadingPlaceholder } from '@grafana/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { demos } from '../../demos';

const Home = React.lazy(() => import('../../pages/Home'));

const queryClient = new QueryClient();

function App(props: AppRootProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UrlStateProvider>
        <TimeRangeContextProvider>
          <Suspense fallback={<LoadingPlaceholder text="Loading..." />}>
            <Routes>
              {/* The wildcard lets any demo add routes of its own below `route`. */}
              {demos.map(({ route, component: Component }) => (
                <Route key={route} path={`${route}/*`} element={<Component />} />
              ))}

              {/* Default page */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </TimeRangeContextProvider>
      </UrlStateProvider>
    </QueryClientProvider>
  );
}

export default App;
