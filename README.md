# task-backoff

Small module to do smart delays in tight loops to maintain a certain event loop delay

```
npm install task-backoff
```

## Usage

``` js
const TaskBackoff = require('task-backoff')

const t = new TaskBackoff({ maxDelay: 100 })

let i = 0
while (true) {
  if (t.backoff()) await t.wait()
  console.log('gogo', i++, t.delay())
}
```

## License

Apache-2.0
