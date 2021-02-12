const createEl = (el = 'div') => document.createElement(el);
const clearChildren = (node) => {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
};

const request = (url, method = 'GET', data = {}) => {
  let res = null;

  if (method === 'GET' || method === 'DELETE') {
    res = window.fetch(url, {
      method,
    });
  }

  if (method === 'PUT' || method === 'POST' || method === 'PATCH') {
    res = window.fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  if (!res) throw new Error(
    `All requests must have valid methods. Valid methods include: "GET", "PUT", "POST", "PATCH", "DELETE"`
  );

  return res;
}

const app = document.querySelector('#app');

const createForm = () => {
  const form = createEl('form');

  const taskLabel = createEl('label');
  const taskName = createEl('input');

  taskLabel.append(
    document.createTextNode('Task Name: '),
    taskName,
  );

  const createTask = createEl('button');

  createTask.appendChild(
    document.createTextNode('Add Task'),
  );

  form.append(
    taskLabel,
    createTask,
  );

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = taskName.value;
    createTask.disabled = true;

    console.log('Input: ', name);

    await request('/tasks', 'POST', { name });

    await render();

    taskName.value = '';
    createTask.disabled = false;
  });

  return form;
};

const createCard = (task) => {
  const card = createEl();
  card.style.margin = '10px';
  card.style.padding = '5px';
  card.style.display = 'flex';
  card.style['flex-direction'] = 'column';
  card.style.border = 'solid 1px gray';

  const cardTitle = createEl('h4');
  cardTitle.appendChild(document.createTextNode(task.name));

  const isCompleteLabel = createEl('label');
  isCompleteLabel.style['margin-bottom'] = '10px';

  const isComplete = createEl('input');
  isComplete.setAttribute('type', 'checkbox');
  if (task.complete) isComplete.setAttribute('checked', true);

  isComplete.addEventListener('change', async () => {
    const complete = isComplete.checked;

    await request(`/tasks/${task.id}`, 'PUT', { complete });

    render();
  });

  isCompleteLabel.append(
    document.createTextNode('Complete?'),
    isComplete,
  )

  const deleteButton = createEl('button');
  deleteButton.appendChild(document.createTextNode('Delete'));

  deleteButton.addEventListener('click', async () => {
    await request(`/tasks/${task.id}`, 'DELETE');

    render();
  });

  card.append(
    cardTitle,
    isCompleteLabel,
    deleteButton,
  );

  return card;
}

const createList = async () => {
  const list = createEl();
  list.style.display = 'flex';
  list.style['flex-wrap'] = 'wrap';

  const res = await request(`/tasks`);

  const { tasks } = await res.json();

  const taskCards = tasks.map(createCard);

  list.append(...taskCards);

  return list;
}

async function render() {
  clearChildren(app);

  const form = createForm();
  const list = await createList();

  app.append(
    form,
    createEl('hr'),
    list,
  );
}

render();
