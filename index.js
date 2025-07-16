const eld = require('event-loop-delay')
const rrp = require('resolve-reject-promise')

module.exports = class TaskBackoff {
  constructor ({ maxDelay = 100 } = {}) {
    this.sampler = eld()
    this.maxDelay = maxDelay
    this.prevDelay = 0
    this.prevPrevDelay = 0
    this.ops = 0
    this.lastTick = Date.now()
    this.timer = setInterval(this._tick.bind(this), 100)
    // if (this.timer.unref) this.timer.unref()
    this.waiting = []
    this.destroyed = false
  }

  _tick () {
    this.lastTick = Date.now()
    this.prevPrevDelay = this.prevDelay
    this.prevDelay = this.sampler.delay
    if (this.backoff()) return
    while (this.waiting.length > 0) this.waiting.pop().resolve()
  }

  delay () {
    return this.sampler.delay - this.prevPrevDelay
  }

  backoff () {
    return this.destroyed === false && (((this.sampler.delay - this.prevPrevDelay) >= 100) || (Date.now() - this.lastTick) >= this.maxDelay)
  }

  destroy () {
    this.destroyed = true
    this.sampler.destroy()
    clearInterval(this.timer)
    while (this.waiting.length > 0) this.waiting.pop().resolve()
  }

  async wait () {
    while (this.backoff()) {
      const p = rrp()
      this.waiting.push(p)
      await p.promise
    }
  }
}
