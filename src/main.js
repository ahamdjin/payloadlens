import './style.css';
import { comparePayloads } from './compare.js';

const before = document.querySelector('#before');
const after = document.querySelector('#after');
const paths = document.querySelector('#paths');
const status = document.querySelector('#status');
const exportButton = document.querySelector('#export');
let report;

function text(tag, className, content) {
  const element = document.createElement(tag); element.className = className; element.textContent = content; return element;
}
function render() {
  exportButton.disabled = true;
  paths.replaceChildren();
  try {
    report = comparePayloads(before.value, after.value);
    document.querySelector('#additions').textContent = report.summary.added;
    document.querySelector('#deletions').textContent = report.summary.removed;
    document.querySelector('#changes').textContent = report.summary.changed;
    document.querySelector('#delta').textContent = report.delta ? JSON.stringify(report.delta, null, 2) : 'No differences found.';
    status.textContent = report.changes.length ? report.changes.length + ' changed JSON paths. Report values are redacted.' : 'These payloads match after sensitive values are redacted.';
    for (const change of report.changes.slice(0, 200)) {
      const li = document.createElement('li');
      li.append(text('code', 'jsonpath', change.path), text('span', 'badge ' + change.type, change.type));
      paths.append(li);
    }
    if (!report.changes.length) paths.append(text('li', '', 'No changes in redacted data.'));
    if (report.changes.length > 200) paths.append(text('li', '', 'First 200 changes shown. Export report for full details.'));
    exportButton.disabled = false;
  } catch (error) {
    report = null;
    status.textContent = error.message || 'Unable to compare payloads.';
    document.querySelector('#delta').textContent = 'No report generated.';
    paths.append(text('li', '', 'Check your JSON syntax and try again.'));
  }
}
document.querySelector('#compare').addEventListener('click', render);
document.querySelector('#sample').addEventListener('click', () => {
  before.value = JSON.stringify({ id: 'evt_100', type: 'order.created', authorization: 'Bearer EXAMPLE_SECRET_12345', data: { order_id: 'ord_24', status: 'pending', total: 1999, items: ['notebook'] } }, null, 2);
  after.value = JSON.stringify({ id: 'evt_100', type: 'order.updated', authorization: 'Bearer EXAMPLE_SECRET_56789', data: { order_id: 'ord_24', status: 'paid', total: 1999, items: ['notebook', 'pen'], currency: 'USD' } }, null, 2);
  render();
});
exportButton.addEventListener('click', () => {
  if (!report) return;
  const content = JSON.stringify({ tool: 'PayloadLens', note: 'Redacted example data. Review before sharing.', generatedAt: new Date().toISOString(), baseline: report.before, revision: report.after, changes: report.changes, summary: report.summary }, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'payloadlens-redacted-fixture.json'; a.click(); URL.revokeObjectURL(url);
});
