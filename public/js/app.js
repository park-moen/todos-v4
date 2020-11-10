// states
let todos = [];
let navState = 'all';

const $nav = document.querySelector('.nav');
const $inputTodo = document.querySelector('.input-todo');
const $todos = document.querySelector('.todos');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');
const $footer = document.querySelector('footer');
const $btn = document.querySelector('.btn');

const generateNextId = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

const render = () => {
  let html = '';

  const _todos = todos.filter(todo => (navState === 'completed' ? todo.completed : navState === 'active' ? !todo.completed : true));

  _todos.forEach(({ id, content, completed }) => {
    html += `
    <li id="${id}" class="todo-item">
      <input id="ck-${id}" class="checkbox" type="checkbox" ${completed ? 'checked' : ''}>
      <label for="ck-${id}">${content}</label>
      <i class="remove-todo far fa-times-circle"></i>
    </li>`;
  });

  $todos.innerHTML = html;
  $completedTodos.textContent = todos.filter(todo => todo.completed).length;
  $activeTodos.textContent = todos.filter(todo => !todo.completed).length;
};

const fetchTodos = promise => {
  promise
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

const require = {
  get(url) {
    return fetchTodos(fetch(url));
  },
  post(url, payload) {
    return fetchTodos(fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  patch(url, payload) {
    return fetchTodos(fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  delete(url) {
    return fetchTodos(fetch(url, {
      method: 'DELETE'
    }));
  }
};

window.onload = () => {
  require.get('/todos');
};

$inputTodo.onkeyup = e => {
  if (e.key !== 'Enter') return;

  const content = $inputTodo.value;
  const newTodo = { id: generateNextId(), content, completed: false };

  require.post('/todos', newTodo);

  $inputTodo.value = '';
};

$todos.onclick = e => {
  if (!e.target.matches('.remove-todo')) return;

  const removeId = e.target.parentNode.id;

  require.delete(`/todos/${removeId}`);
};

$todos.onchange = e => {
  const toggleCompleted = e.target.checked;
  const toggleId = e.target.parentNode.id;

  require.patch(`/todos/${toggleId}`, { completed: toggleCompleted });
};

$footer.onchange = e => {
  const toggleAll = e.target.checked;

  require.patch('/todos/completed', { completed: toggleAll });
};

$btn.onclick = () => {
  require.delete('/todos/completed');
};

$nav.onclick = ({ target }) => {
  if (!target.matches('.nav > li')) return;

  document.querySelector('.active').classList.remove('active');
  target.classList.add('active');

  navState = target.id;
  render();
};
