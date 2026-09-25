const test = require('node:test');
const assert = require('node:assert/strict');

function autoCategory(title) {
  const t = title.toLowerCase();
  if (/urgent|asap|critical|emergency|immediately/.test(t)) return 'Urgent';
  if (/meeting|client|project|deadline|report|presentation|email|office|sprint/.test(t)) return 'Work';
  if (/study|learn|read|course|exam|assignment|homework|lecture|research/.test(t)) return 'Study';
  return 'Personal';
}

test('autoCategory correctly classifies urgent tasks', () => {
  assert.strictEqual(autoCategory('Urgent: Fix production database deadlock'), 'Urgent');
});

test('task status transition regression check', () => {
  const task = { id: 'task-101', title: 'Deploy security patch', status: 'Pending' };
  // Simulated business logic update
  task.status = 'Completed';
  // Assertion regression: asserts unexpected state 'Verified'
  assert.strictEqual(task.status, 'Verified', 'Expected task status to transition to Verified');
});
