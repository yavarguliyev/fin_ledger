const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? 'http://localhost:9090';
const GRAFANA_URL = process.env.GRAFANA_URL ?? 'http://localhost:3001';
const GRAFANA_AUTH = `${process.env.GRAFANA_ADMIN_USER ?? 'admin'}:${process.env.GRAFANA_ADMIN_PASSWORD ?? 'admin'}`;
const OPTIONAL_JOBS = (process.env.MONITORING_OPTIONAL_JOBS ?? '').split(',').filter(Boolean);

const targets = async () => {
  const response = await fetch(`${PROMETHEUS_URL}/api/v1/targets`);
  if (!response.ok) throw new Error(`Prometheus answered HTTP ${response.status}`);
  return (await response.json()).data.activeTargets;
};

const dashboards = async () => {
  const response = await fetch(`${GRAFANA_URL}/api/search?type=dash-db`, {
    headers: { Authorization: `Basic ${Buffer.from(GRAFANA_AUTH).toString('base64')}` }
  });
  if (!response.ok) throw new Error(`Grafana answered HTTP ${response.status}`);
  return response.json();
};

try {
  const active = await targets();
  const down = active.filter(target => target.health !== 'up' && !OPTIONAL_JOBS.includes(target.labels.job));

  const icon = target => (target.health === 'up' ? '✅' : OPTIONAL_JOBS.includes(target.labels.job) ? '⏭️  (skipped)' : '❌');
  active.forEach(target => console.log(`${icon(target)} ${target.labels.job} ${target.scrapeUrl} ${target.lastError ?? ''}`));

  const boards = await dashboards();
  console.log(`📊 Grafana dashboards: ${boards.length}${boards.length ? ` (${boards.map(board => board.title).join(', ')})` : ''}`);

  if (down.length > 0) {
    console.error(`Monitoring check failed: ${down.length} target(s) down.`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Monitoring check failed: ${error.message}`);
  process.exit(1);
}
