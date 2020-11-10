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

const fetchTodos = () => {
  // todos = [
  //   { id: 1, content: 'HTML', completed: false },
  //   { id: 2, content: 'CSS', completed: true },
  //   { id: 3, content: 'Javascript', completed: false }
  // ].sort((todo1, todo2) => todo2.id - todo1.id);

  // render(todos);
  fetch('/todos')
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

window.onload = fetchTodos;

$inputTodo.onkeyup = e => {
  if (e.key !== 'Enter') return;

  const content = $inputTodo.value;
  const newTodo = { id: generateNextId(), content, completed: false };

  fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTodo)
  })
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .then($inputTodo.value = '')
    .catch(console.error);
};

$todos.onclick = e => {
  if (!e.target.matches('.remove-todo')) return;

  const removeId = e.target.parentNode.id;

  fetch(`/todos/${removeId}`, {
    method: 'DELETE'
  })
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

$todos.onchange = e => {
  const toggleCompleted = e.target.checked;
  const toggleId = e.target.parentNode.id;

  fetch(`/todos/${toggleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: toggleCompleted })
  })
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

$footer.onchange = e => {
  const toggleAll = e.target.checked;

  fetch('/todos/completed', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: toggleAll })
  })
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

$btn.onclick = e => {
  fetch('/todos/completed', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

$nav.onclick = ({ target }) => {
  if (!target.matches('.nav > li')) return;

  document.querySelector('.active').classList.remove('active');
  target.classList.add('active');

  navState = target.id;
  render();
};
