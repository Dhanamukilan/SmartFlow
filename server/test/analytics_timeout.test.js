const test = require('node:test');

test('compute deep task analytics aggregation within timeout deadline', { timeout: 1500 }, async () => {
  // Real timeout: asynchronous operation exceeds test deadline
  await new Promise((resolve) => setTimeout(resolve, 3000));
});
