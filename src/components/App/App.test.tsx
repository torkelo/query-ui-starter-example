import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppRootProps, PluginType } from '@grafana/data';
import { render, screen, waitFor } from '@testing-library/react';
import { demos } from '../../demos';
import { testIds } from '../testIds';
import App from './App';

// The page chrome comes from Grafana at runtime, so render only the page content.
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  PluginPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Components/App', () => {
  let props: AppRootProps;

  beforeEach(() => {
    jest.resetAllMocks();

    props = {
      basename: 'a/sample-app',
      meta: {
        id: 'sample-app',
        name: 'Sample App',
        type: PluginType.app,
        enabled: true,
        jsonData: {},
      },
      query: {},
      path: '',
      onNavChanged: jest.fn(),
    } as unknown as AppRootProps;
  });

  test('renders the home page with a link to every demo', async () => {
    render(
      <MemoryRouter>
        <App {...props} />
      </MemoryRouter>
    );

    // The home page is lazy loaded, so we need to wait for it to be rendered
    await waitFor(() => expect(screen.getByTestId(testIds.home.container)).toBeInTheDocument(), { timeout: 2000 });

    for (const demo of demos) {
      expect(screen.getByRole('link', { name: demo.title })).toHaveAttribute(
        'href',
        expect.stringContaining(`/${demo.route}`)
      );
    }
  });
});
