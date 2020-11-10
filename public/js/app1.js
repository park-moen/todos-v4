// status
let todos = [];
let navState = 'all';

// DOMs
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
// console.log($inputTodo);

// function
const generateNextId = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

const render = () => {
  let html = '';
  todos.forEach(({ id, content, completed }) => {
    html += `
    <li id="${id}" class="todo-item">
      <input id="ck-${id}" class="checkbox" type="checkbox" ${completed ? ' checked' : ''}>
      <label for="ck-${id}">${content}</label>
      <i class="remove-todo far fa-times-circle"></i>
    </li>`;
  });

  $todos.innerHTML = html;
};

const fetchTodos = () => {
  fetch('/todos')
    .then(res => res.json())
    .then(_todos => { todos = _todos; })
    .then(render)
    .catch(console.error);
};

// Event Bindgin
window.onload = fetchTodos;

$inputTodo.onkeyup = e => {
  if (e.key !== 'Enter' || !e.target.value) return;

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
