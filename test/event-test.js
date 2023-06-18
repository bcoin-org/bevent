'use strict';

const assert = require('bsert');
const AsyncEmitter = require('..');

describe('Event', function() {
  it('should wait for the async listeners', async () => {
    const emitter = new AsyncEmitter();

    let done = false;
    emitter.on('foo', async () => {
      await new Promise(r => setTimeout(r, 100));
      done = true;
    });

    await emitter.emitAsync('foo');
    assert.strictEqual(done, true);
  });
});
