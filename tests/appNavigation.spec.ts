import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

test.describe('navigating app', () => {
  test('home page links to both demos', async ({ gotoPage, page }) => {
    await gotoPage('/');
    await expect(page.getByRole('link', { name: /Drilldown metrics/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Tabs and sub pages/ })).toBeVisible();
  });

  test('tabs and sub pages demo opens on the overview tab', async ({ gotoPage, page }) => {
    await gotoPage(`/${ROUTES.TabsAndSubPages}`);
    await expect(page).toHaveURL(new RegExp(`${ROUTES.TabsAndSubPages}/overview`));
    await expect(page.getByRole('tab', { name: 'HTTP handlers' })).toBeVisible();
  });

  test('tabs and sub pages demo drills down into an HTTP handler', async ({ gotoPage, page }) => {
    await gotoPage(`/${ROUTES.TabsAndSubPages}/http-handlers`);
    await page.getByRole('link', { name: '/api/search' }).click();
    await expect(page.getByText('/api/search requests')).toBeVisible();
  });

  test('drilldown metrics demo renders its data source and filter pickers', async ({ gotoPage, page }) => {
    await gotoPage(`/${ROUTES.DrilldownMetrics}`);
    await expect(page.getByPlaceholder('Search metrics')).toBeVisible();
  });
});
