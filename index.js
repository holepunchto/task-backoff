const eld = require('event-loop-delay')
const rrp = require('resolve-reject-promise')

module.exports = class TaskBackoff {
  constructor ({ maxDelay = 100, ref = true } = {}) {
    this.sampler = eld()
    this.maxDelay = maxDelay
    this.prevDelay = 0
    this.prevPrevDelay = 0
    this.lastTick = Date.now()
    this.timer = setInterval(this._tick.bind(this), Math.min(maxDelay, 100))
    this.waiting = []
    this.destroyed = false

    if (!ref && this.timer.unref) this.timer.unref()
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
    return this.destroyed === false && (((this.sampler.delay - this.prevPrevDelay) >= this.maxDelay) || (Date.now() - this.lastTick) >= (this.maxDelay + 10))
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
