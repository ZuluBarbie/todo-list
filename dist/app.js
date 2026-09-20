'use strict';
const KEY = 'done.tasks.v1';
const $ = selector => document.querySelector(selector);
let tasks = [], filter = 'all';
const notify = message => { $('#status').textContent = message; };
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (!Array.isArray(saved) || saved.some(t => !t || typeof t.id !== 'string' || typeof t.text !== 'string' || typeof t.done !== 'boolean')) throw new Error('Invalid data');
  tasks = saved;
} catch { notify('Saved tasks could not be loaded. New tasks can still be added.'); }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); return true; }
  catch { notify('Browser storage is unavailable. Changes will last only while this page is open.'); return false; }
}
function addTask(text) {
  if (typeof text !== 'string' || !text.trim() || text.trim().length > 240) throw new Error('Enter a task between 1 and 240 characters.');
  const task = { id: crypto.randomUUID(), text: text.trim(), done: false };
  tasks.push(task); filter = 'all'; const saved = save(); render();
  if (saved) notify('Task added.'); return task;
}
function button(text, action, label) {
  const el = document.createElement('button'); el.type = 'button'; el.className = 'quiet'; el.textContent = text; el.setAttribute('aria-label', label); el.addEventListener('click', action); return el;
}
function editTask(task, row) {
  row.replaceChildren(); const input = document.createElement('input'); input.className = 'edit-input'; input.value = task.text; input.maxLength = 240; input.setAttribute('aria-label', 'Edit task');
  const finish = () => { if (!input.value.trim()) { input.setCustomValidity('Enter a task.'); input.reportValidity(); return; } task.text = input.value.trim(); save(); render(); };
  input.addEventListener('input', () => input.setCustomValidity(''));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') finish(); if (e.key === 'Escape') render(); });
  row.append(input, button('Save', finish, 'Save task'), button('Cancel', render, 'Cancel editing')); input.focus(); input.select();
}
function render() {
  const done = tasks.filter(t => t.done).length, active = tasks.length - done;
  $('#count').textContent = `${active} ${active === 1 ? 'task' : 'tasks'} left`;
  $('#clear').hidden = !done;
  $('#progress-text').textContent = tasks.length ? `${done} of ${tasks.length} completed` : 'Ready when you are.';
  $('#progress').max = tasks.length || 1; $('#progress').value = done;
  document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
  const visible = tasks.filter(t => filter === 'all' || (filter === 'completed' ? t.done : !t.done));
  $('#tasks').replaceChildren(); $('#empty').hidden = visible.length > 0;
  $('#empty h3').textContent = !tasks.length ? 'A fresh start.' : filter === 'active' ? 'All caught up.' : 'Nothing here yet.';
  $('#empty p').textContent = !tasks.length ? 'Add your first task and take it from there.' : filter === 'active' ? 'Take a moment to enjoy your progress.' : 'Completed tasks will appear here.';
  visible.forEach(task => {
    const row = document.createElement('li'); row.className = `task${task.done ? ' completed' : ''}`;
    const check = document.createElement('input'); check.type = 'checkbox'; check.checked = task.done; check.id = `task-${task.id}`;
    check.addEventListener('change', () => { task.done = check.checked; save(); render(); const next = document.getElementById(check.id); (next || $('#task-input')).focus(); });
    const label = document.createElement('label'); label.htmlFor = check.id; label.textContent = task.text;
    const actions = document.createElement('div'); actions.className = 'actions';
    actions.append(button('Edit', () => editTask(task, row), `Edit ${task.text}`), button('Delete', () => { tasks = tasks.filter(t => t.id !== task.id); const saved = save(); render(); if (saved) notify('Task deleted.'); $('#task-input').focus(); }, `Delete ${task.text}`));
    row.append(check, label, actions); $('#tasks').append(row);
  });
}
$('#date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
$('#add-form').addEventListener('submit', e => { e.preventDefault(); try { addTask($('#task-input').value); $('#task-input').value = ''; $('#task-input').focus(); } catch (err) { notify(err.message); } });
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
$('#clear').addEventListener('click', () => { tasks = tasks.filter(t => !t.done); save(); render(); });
window.addEventListener('storage', e => { if (e.key !== KEY) return; try { const incoming = JSON.parse(e.newValue || '[]'); if (Array.isArray(incoming) && incoming.every(t => t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.done === 'boolean')) { tasks = incoming; render(); } } catch { notify('Tasks could not be refreshed from the other tab.'); } });
render();
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try { Promise.resolve(document.modelContext.registerTool({ name: 'add_task', description: 'Add a task to the visible to-do list in this browser.', inputSchema: { type: 'object', properties: { text: { type: 'string', minLength: 1, maxLength: 240 } }, required: ['text'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: input => addTask(input?.text) }, { signal: lifecycle.signal })).catch(() => {}); } catch {}
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}
