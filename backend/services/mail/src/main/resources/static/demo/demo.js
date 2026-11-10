const status = document.querySelector('[role="status"]');
const lists = {
  people: document.querySelector('[data-list="people"]'),
  mail: document.querySelector('[data-list="mail"]'),
};

const call = async (path, method = 'GET') => {
  const response = await fetch(`/demo/api/${path}`, { method });
  if (!response.ok) throw new Error(`The service answered ${response.status}`);
  return response.json();
};

// A state is shown as its word; the colour says only whether it is done, still waiting, or stopped.
const meaning = { SENT: 'done', CONFIRMED: 'done', QUEUED: 'waiting', PENDING: 'waiting', FAILED: 'stopped', UNSUBSCRIBED: 'stopped' };

const item = (title, detail, badge, action) => {
  const li = document.createElement('li');
  const text = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = title;
  const small = document.createElement('small');
  small.textContent = detail;
  text.append(strong, small);
  const tag = document.createElement('span');
  tag.className = `badge ${meaning[badge] ?? ''}`;
  tag.textContent = badge.toLowerCase();
  li.append(text, tag);
  if (action) li.append(action);
  return li;
};

const confirmButton = (person) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Confirm';
  button.addEventListener('click', () => run(() => call(`people/${person.id}/confirm`, 'POST'), `${person.name} confirmed.`));
  return button;
};

const render = (state) => {
  lists.people.replaceChildren(...state.people.map((person) =>
    item(person.name, person.email, person.status, person.status === 'PENDING' ? confirmButton(person) : null)));
  lists.mail.replaceChildren(...state.mail.map((mail) => item(mail.subject, mail.to, mail.status)));
  if (state.people.length === 0) lists.people.replaceChildren(item('Nobody yet', 'Start with step 1.', 'empty'));
};

const run = async (action, message) => {
  try {
    const result = await action();
    status.textContent = typeof message === 'function' ? message(result) : message;
    render(await call('state'));
  } catch (error) {
    status.textContent = error.message;
  }
};

const actions = {
  invent: () => run(() => call('people?count=3', 'POST'), 'Three readers asked to subscribe. Their confirmation emails are in the inbox.'),
  campaign: () => run(() => call('campaign', 'POST'),
    (campaign) => `“${campaign.headline}” queued for ${campaign.queued} confirmed reader(s).`),
};

document.querySelectorAll('[data-action]').forEach((button) =>
  button.addEventListener('click', () => actions[button.dataset.action]()));

run(() => call('state'), '');
setInterval(() => call('state').then(render).catch(() => {}), 3000);
