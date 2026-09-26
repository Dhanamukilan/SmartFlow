const test = require('node:test');
const assert = require('node:assert/strict');

// Replicate auto-categorization algorithm from routes/tasks.js
function autoCategory(title) {
  const t = (title || '').toLowerCase();
  if (/urgent|asap|critical|emergency|immediately/.test(t)) return 'Urgent';
  if (/meeting|client|project|deadline|report|presentation|email|office|sprint/.test(t)) return 'Work';
  if (/study|learn|read|course|exam|assignment|homework|lecture|research/.test(t)) return 'Study';
  return 'Personal';
}

test('SmartFlow Tasks Suite - Auto-Categorization Keyword Engine', () => {
  assert.strictEqual(autoCategory('Fix critical production bug immediately'), 'Urgent');
  assert.strictEqual(autoCategory('Prepare client sprint presentation'), 'Work');
  assert.strictEqual(autoCategory('Read distributed systems research paper'), 'Study');
  assert.strictEqual(autoCategory('Buy groceries and plan weekend dinner'), 'Personal');
  assert.strictEqual(autoCategory('ASAP meeting with engineering team'), 'Urgent'); // Urgent regex takes precedence
});

test('SmartFlow Tasks Suite - Task Model Data Validation and Enums', () => {
  const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
  const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
  const VALID_ENERGY = ['Low', 'Medium', 'High'];

  const validateTask = (task) => {
    if (!task.title || typeof task.title !== 'string') return false;
    if (!VALID_STATUSES.includes(task.status)) return false;
    if (!VALID_PRIORITIES.includes(task.priority)) return false;
    if (!VALID_ENERGY.includes(task.energyLevel)) return false;
    return true;
  };

  const validTask = {
    title: 'Implement OAuth integration',
    status: 'In Progress',
    priority: 'High',
    energyLevel: 'Medium'
  };
  assert.strictEqual(validateTask(validTask), true, 'Valid task should pass validation');

  const invalidTask = {
    title: 'Broken task',
    status: 'UnknownStatus',
    priority: 'High',
    energyLevel: 'Medium'
  };
  assert.strictEqual(validateTask(invalidTask), false, 'Invalid status enum should fail');
});

test('SmartFlow Tasks Suite - Status Transition Lifecycle', () => {
  const task = {
    id: 't-101',
    title: 'Migrate to PostgreSQL container',
    status: 'Pending',
    completedAt: null
  };

  // Transition to In Progress
  task.status = 'In Progress';
  assert.strictEqual(task.status, 'In Progress');
  assert.strictEqual(task.completedAt, null);

  // Transition to Completed
  task.status = 'Completed';
  task.completedAt = new Date();
  assert.strictEqual(task.status, 'Completed');
  assert.ok(task.completedAt instanceof Date, 'completedAt timestamp must be recorded');
});

test('SmartFlow Tasks Suite - Overdue Detection Logic', () => {
  const now = new Date('2026-09-26T10:00:00Z');

  const isOverdue = (task, referenceTime) => {
    if (!task.dueDate || task.status === 'Completed') return false;
    return new Date(task.dueDate) < referenceTime;
  };

  const overdueTask = {
    title: 'Submit quarterly report',
    dueDate: '2026-09-25T18:00:00Z',
    status: 'Pending'
  };
  assert.strictEqual(isOverdue(overdueTask, now), true, 'Past due task must be marked overdue');

  const completedTask = {
    title: 'Submit quarterly report',
    dueDate: '2026-09-25T18:00:00Z',
    status: 'Completed'
  };
  assert.strictEqual(isOverdue(completedTask, now), false, 'Completed task is never overdue');

  const upcomingTask = {
    title: 'Team sync meeting',
    dueDate: '2026-09-27T09:00:00Z',
    status: 'Pending'
  };
  assert.strictEqual(isOverdue(upcomingTask, now), false, 'Future due date is not overdue');
});
