import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { PluginPage } from '@grafana/runtime';
import { Card, Stack, Text, useStyles2 } from '@grafana/ui';
import { demos } from '../demos';
import { testIds } from '../components/testIds';
import { prefixRoute } from '../utils/utils.routing';

function Home() {
  const s = useStyles2(getStyles);

  return (
    <PluginPage>
      <div data-testid={testIds.home.container}>
        <Stack direction="column" gap={3}>
          <Text element="p" color="secondary">
            A starter for building Grafana apps with <code>@grafana/query-ui</code>. Each demo below is a self-contained
            example you can read, copy and adapt.
          </Text>
          <ul className={s.list}>
            {demos.map((demo) => (
              <li key={demo.route}>
                <Card noMargin href={prefixRoute(demo.route)}>
                  <Card.Heading>{demo.title}</Card.Heading>
                  <Card.Description>
                    {demo.description} {demo.requirement}
                  </Card.Description>
                  <Card.Tags>
                    {demo.highlights.map((highlight) => (
                      <span key={highlight} className={s.tag}>
                        {highlight}
                      </span>
                    ))}
                  </Card.Tags>
                </Card>
              </li>
            ))}
          </ul>
        </Stack>
      </div>
    </PluginPage>
  );
}

export default Home;

const getStyles = (theme: GrafanaTheme2) => ({
  list: css({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    listStyle: 'none',
    margin: 0,
    padding: 0,
  }),
  tag: css({
    background: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.border.weak}`,
    borderRadius: theme.shape.radius.default,
    fontSize: theme.typography.bodySmall.fontSize,
    padding: theme.spacing(0.25, 1),
  }),
});
