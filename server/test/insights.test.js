const test = require('node:test');
const assert = require('node:assert/strict');

test('SmartFlow Insights Suite - Productivity Percentage Calculation', () => {
  const computeProductivity = (total, completed) => {
    return total ? Math.round((completed / total) * 100) : 0;
  };

  assert.strictEqual(computeProductivity(10, 8), 80);
  assert.strictEqual(computeProductivity(3, 1), 33);
  assert.strictEqual(computeProductivity(0, 0), 0, 'Zero total tasks should yield 0% productivity');
  assert.strictEqual(computeProductivity(5, 5), 100, 'All completed yields 100%');
});

test('SmartFlow Insights Suite - Aggregation Metrics by Category, Priority & Energy', () => {
  const tasks = [
    { category: 'Work', priority: 'High', energyLevel: 'High', status: 'Completed' },
    { category: 'Work', priority: 'Medium', energyLevel: 'Low', status: 'In Progress' },
    { category: 'Personal', priority: 'Low', energyLevel: 'Medium', status: 'Pending' },
    { category: 'Study', priority: 'High', energyLevel: 'High', status: 'Completed' }
  ];

  const byCategory = {};
  const byPriority = {};
  const byEnergy = {};

  tasks.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byEnergy[t.energyLevel] = (byEnergy[t.energyLevel] || 0) + 1;
  });

  assert.deepStrictEqual(byCategory, { Work: 2, Personal: 1, Study: 1 });
  assert.deepStrictEqual(byPriority, { High: 2, Medium: 1, Low: 1 });
  assert.deepStrictEqual(byEnergy, { High: 2, Low: 1, Medium: 1 });
});

test('SmartFlow Insights Suite - Streak State Machine Logic', () => {
  // Simulates streakHelper algorithm
  const processDayCompletion = (currentStreak, longestStreak, lastDateStr, newDateStr) => {
    const today = new Date(newDateStr);
    today.setHours(0, 0, 0, 0);

    let streak = currentStreak;
    let longest = longestStreak;

    if (lastDateStr) {
      const last = new Date(lastDateStr);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day – streak count unchanged
      } else if (diffDays === 1) {
        streak += 1;
      } else {
        // Gap > 1 day – streak resets to 1
        streak = 1;
      }
    } else {
      streak = 1;
    }

    if (streak > longest) longest = streak;
    return { currentStreak: streak, longestStreak: longest, lastDate: today.toISOString() };
  };

  // Day 1
  let s = processDayCompletion(0, 0, null, '2026-09-24T12:00:00Z');
  assert.strictEqual(s.currentStreak, 1);
  assert.strictEqual(s.longestStreak, 1);

  // Day 1 second task (same day)
  s = processDayCompletion(s.currentStreak, s.longestStreak, s.lastDate, '2026-09-24T18:00:00Z');
  assert.strictEqual(s.currentStreak, 1, 'Same day must not increment streak');

  // Day 2 (consecutive day)
  s = processDayCompletion(s.currentStreak, s.longestStreak, s.lastDate, '2026-09-25T09:00:00Z');
  assert.strictEqual(s.currentStreak, 2);
  assert.strictEqual(s.longestStreak, 2);

  // Day 4 (gap of 2 days -> broken streak)
  s = processDayCompletion(s.currentStreak, s.longestStreak, s.lastDate, '2026-09-27T09:00:00Z');
  assert.strictEqual(s.currentStreak, 1, 'Broken streak must reset to 1');
  assert.strictEqual(s.longestStreak, 2, 'Longest streak record must be preserved');
});
