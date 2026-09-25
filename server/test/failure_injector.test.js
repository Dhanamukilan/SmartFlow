const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');

const failureType = process.env.FAILURE_INJECTOR || 'none';

test('SmartFlow Baseline Health Check', () => {
  // Always runs and passes
  assert.strictEqual(1 + 1, 2, 'Core execution runtime is healthy');
});

if (failureType === 'none') {
  test('SmartFlow Standard Task Logic (Clean Baseline)', () => {
    const task = { id: 'task-100', title: 'Review pull request', status: 'Pending' };
    task.status = 'Completed';
    assert.strictEqual(task.status, 'Completed', 'Task status transition succeeded');
  });
}

if (failureType === 'assertion_failure') {
  test('SmartFlow Task Logic Regression Check [INJECTED]', () => {
    console.log('[GROUND_TRUTH: failure_type=assertion_failure]');
    const task = { id: 'task-101', title: 'Deploy security patch', status: 'Pending' };
    task.status = 'Completed';
    // Deliberate assertion error with realistic diff
    assert.strictEqual(task.status, 'Verified', 'Expected task status to transition to Verified');
  });
}

if (failureType === 'connection_error') {
  test('SmartFlow External Webhook Connection Check [INJECTED]', async () => {
    console.log('[GROUND_TRUTH: failure_type=connection_error]');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: '127.0.0.1', port: 54321 });
      socket.on('connect', () => { socket.end(); resolve(); });
      socket.on('error', (err) => {
        const connErr = new Error(`ConnectionError: connect ECONNREFUSED 127.0.0.1:54321 - Failed to connect to notification gateway`);
        connErr.name = 'ConnectionError';
        reject(connErr);
      });
    });
  });
}

if (failureType === 'timeout_error') {
  test('SmartFlow Deep Task Analytics Aggregation [INJECTED]', { timeout: 1500 }, async () => {
    console.log('[GROUND_TRUTH: failure_type=timeout_error]');
    // Exceeds configured timeout of 1500ms
    await new Promise(r => setTimeout(r, 3000));
  });
}

if (failureType === 'flaky_test') {
  test('SmartFlow Concurrent Task Worker Pool Check [INJECTED]', async () => {
    console.log('[GROUND_TRUTH: failure_type=flaky_test]');
    // Non-deterministic outcome simulating concurrency race
    const randomSeed = Math.random();
    assert.ok(randomSeed < 0.2, `FlakyTestError: Concurrency race condition in worker thread pool (seed: ${randomSeed})`);
  });
}

if (failureType === 'dependency_error') {
  test('SmartFlow Missing Dependency Resolution [INJECTED]', () => {
    console.log('[GROUND_TRUTH: failure_type=dependency_error]');
    // Throws real Node.js ModuleNotFoundError
    require('non_existent_smartflow_plugin_v3');
  });
}
