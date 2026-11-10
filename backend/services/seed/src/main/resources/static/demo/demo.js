const plan = document.querySelector('#plan');
const status = document.querySelector('[role="status"]');
const list = document.querySelector('[data-list="steps"]');
const run = document.querySelector('[data-action="run"]');

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};

const show = (report) => {
  list.replaceChildren(...report.steps.map((step) => {
    const li = element('li');
    const text = element('div');
    text.append(element('strong', step.step), element('small', step.error ?? `${step.calls} call(s)`));
    li.append(text, element('span', step.error ? 'stopped' : 'done', `badge ${step.error ? 'stopped' : 'done'}`));
    return li;
  }));
  status.textContent = report.completed ? 'The plan ran to the end.' : 'The plan stopped at the first failing call.';
};

run.addEventListener('click', async () => {
  run.disabled = true;
  status.textContent = 'Running…';
  try {
    const response = await fetch('/demo/api/run', { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: plan.value });
    const body = await response.json();
    if (body.steps) show(body);
    else status.textContent = [body.detail, ...(body.errors ?? [])].join(' · ');
  } catch (error) {
    status.textContent = error.message;
  } finally {
    run.disabled = false;
  }
});
