'use strict';

const assert = require('bsert');
const AsyncEmitter = require('..');

describe('Event', function() {
  it('should wait for the async listeners', async () => {
    const emitter = new AsyncEmitter();

    let done = false;
    let receivedArgs = null;

    emitter.on('foo', async (...args) => {
      receivedArgs = args;
      await new Promise(r => setTimeout(r, 100));
      done = true;
    });

    await emitter.emitAsync('foo', 1, 2, 3);
    assert.strictEqual(done, true);
    assert.deepStrictEqual(receivedArgs, [1, 2, 3]);
  });

  it('should not wait for the async listener with normal emit', async () => {
    const emitter = new AsyncEmitter();

    let done = false;
    let receivedArgs = null;

    emitter.on('foo', async (...args) => {
      receivedArgs = args;
      await new Promise(r => setTimeout(r, 100));
      done = true;
    });

    emitter.emit('foo', 1, 2, 3);
    assert.strictEqual(done, false);
    assert.deepStrictEqual(receivedArgs, [1, 2, 3]);
  });

  it('should throw with no error listener', () => {
    const emitter = new AsyncEmitter();

    emitter.on('foo', (err) => {
      throw err;
    });

    const fooErr = new Error('foo');

    let err;
    try {
      emitter.emit('foo', fooErr);
    } catch (e) {
      err = e;
    }

    assert(err);
    assert.strictEqual(err, fooErr);

    err = null;
    try {
      emitter.emit('foo', 123);
    } catch (e) {
      err = e;
    }

    assert(err);
    assert.strictEqual(err.context, 123);
  });

  it('should not throw with error listener', () => {
    const emitter = new AsyncEmitter();

    let caughErr = null;

    emitter.on('error', (err) => {
      caughErr = err;
    });

    emitter.on('foo', (err) => {
      throw err;
    });

    const fooErr = new Error('foo');

    emitter.emit('foo', fooErr);
    assert.strictEqual(caughErr, fooErr);

    emitter.emit('foo', 123);
    assert.strictEqual(caughErr, 123);
  });

  it('should throw from async with no error listener', async () => {
    const emitter = new AsyncEmitter();

    emitter.on('foo', async (err) => {
      await new Promise(r => setTimeout(r, 100));
      throw err;
    });

    const fooErr = new Error('foo');

    let err;
    try {
      await emitter.emitAsync('foo', fooErr);
    } catch (e) {
      err = e;
    }

    assert(err);
    assert.strictEqual(err, fooErr);

    err = null;
    try {
      await emitter.emitAsync('foo', 123);
    } catch (e) {
      err = e;
    }

    assert(err);
    assert.strictEqual(err.context, 123);
  });

  it('should not throw with error listener', async () => {
    const emitter = new AsyncEmitter();

    let caughErr = null;

    emitter.on('error', (err) => {
      caughErr = err;
    });

    emitter.on('foo', async (err) => {
      await new Promise(r => setTimeout(r, 100));
      throw err;
    });

    const fooErr = new Error('foo');

    await emitter.emitAsync('foo', fooErr);
    assert.strictEqual(caughErr, fooErr);

    await emitter.emitAsync('foo', 123);
    assert.strictEqual(caughErr, 123);
  });
});
