const status = document.querySelector('[role="status"]');
const board = document.querySelector('[data-list="people"]');

const call = async (path, method = 'GET') => {
  const response = await fetch(`/demo/api/${path}`, { method });
  if (!response.ok) throw new Error(`The service answered ${response.status}`);
  return response.json();
};

const element = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};

const column = (person) => {
  const section = element('section', null, 'person');
  const header = element('header');
  const counter = element('span', '0', 'badge');
  header.append(element('strong', person.name), element('small', person.role), counter);
  const send = element('button', `Notify ${person.name.split(' ')[0]}`, 'primary');
  send.type = 'button';
  const list = element('ul', null, 'cards');
  section.append(header, send, list);

  const render = (notifications) => {
    counter.textContent = `${notifications.filter((n) => !n.read).length} unread`;
    list.replaceChildren(...notifications.map((notification) => {
      const li = element('li', null, notification.read ? 'read' : 'unread');
      const text = element('div');
      text.append(element('strong', notification.title), element('small', notification.body));
      li.append(text);
      if (!notification.read) {
        const mark = element('button', 'Read');
        mark.type = 'button';
        mark.addEventListener('click', async () => render(await call(`people/${person.id}/read/${notification.id}`, 'POST')));
        li.append(mark);
      }
      return li;
    }));
  };
  const refresh = async () => render(await call(`people/${person.id}`));

  send.addEventListener('click', async () => {
    try {
      const notification = await call(`people/${person.id}/notify`, 'POST');
      status.textContent = `Sent “${notification.title}” to ${person.name}.`;
    } catch (error) {
      status.textContent = error.message;
    }
  });

  const live = new EventSource(`/demo/api/people/${person.id}/stream`);
  live.addEventListener('notification', () => {
    section.classList.remove('flash');
    void section.offsetWidth;
    section.classList.add('flash');
    refresh();
  });

  refresh();
  return section;
};

call('people')
  .then((people) => board.replaceChildren(...people.map(column)))
  .catch((error) => { status.textContent = error.message; });
