// state
let todos = [];

// Dom nodes
const $inputTodo = document.querySelector('.input-todo');
const $nav = document.querySelector('.nav');
const $todos = document.querySelector('.todos');
const $completeAll = document.querySelector('.complete-all');
const $clearCompleted = document.querySelector('.clear-completed');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');

// function
const render = () => {
  let html = '';
  todos.filter(todo => (document.querySelector('.active').id === 'all' ? todo
    : document.querySelector('.active').id === 'active' ? !todo.completed : todo.completed))
    .forEach(({ id, content, completed }) => {
      html += `<li id="${id}" class="todo-item">
      <input id="ck-${id}" class="checkbox" type="checkbox" ${completed ? 'checked' : ''}>
      <label for="ck-${id}">${content}</label>
      <i class="remove-todo far fa-times-circle"></i>
    </li>`;
    });
  $todos.innerHTML = html;
  $completedTodos.textContent = todos.filter(todo => todo.completed).length;
  $activeTodos.textContent = todos.filter(todo => !todo.completed).length;
};

const generateNextId = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

const fetchTodos = promise => {
  promise
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

const request = {
  get(url) {
    return fetchTodos(fetch(url));
  },
  post(url, payload) {
    return fetchTodos(fetch(url, {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  patch(url, payload) {
    return fetchTodos(fetch(url, {
      method: 'PATCH',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },
  delete(url) {
    return fetchTodos(fetch(url, {
      method: 'DELETE'
    }));
  }
};

// event handler
window.onload = () => {
  request.get('/todos');
};

$inputTodo.onkeyup = e => {
  if (e.key !== 'Enter' || $inputTodo.value === '') return;
  const content = $inputTodo.value;
  const newTodo = { id: generateNextId(), content, completed: false };
  document.getElementById('ck-complete-all').checked = false;
  request.post('/todos', newTodo);
  $inputTodo.value = '';
};

$nav.onclick = e => {
  if (!e.target.matches('.nav > li')) return;
  [...$nav.children].forEach(li => {
    li.classList.toggle('active', li === e.target);
  });
  request.get('/todos');
};

$todos.onchange = e => {
  request.patch(`/todos/${e.target.parentNode.id}`, { completed: e.target.checked });
  document.getElementById('ck-complete-all').checked = false;
};

$todos.onclick = e => {
  if (!e.target.classList.contains('remove-todo')) return;
  request.delete(`/todos/${e.target.parentNode.id}`);
};

$completeAll.onchange = e => {
  request.patch('/todos/completed', { completed: e.target.checked });
};

$clearCompleted.onclick = e => {
  if (!e.target.classList.contains('btn') && !e.target.classList.contains('completed-todos')) return;
  request.delete('/todos/completed');
  document.getElementById('ck-complete-all').checked = false;
};