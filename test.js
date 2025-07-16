const test = require('brittle')
const TaskBackoff = require('.')

test('basic', async ({ plan, pass }) => {
  plan(5)

  let i = 0
  const interval = setInterval(() => {
    if (i++ < 5) {
      pass(`interval ${i}`)
    } else {
      clearInterval(interval)
    }
  }, 1000)

  const t = new TaskBackoff({ maxDelay: 100 })
  while (i < 5) { // eslint-disable-line no-unmodified-loop-condition
    if (t.backoff()) await t.wait()
  }
  t.destroy()
})
