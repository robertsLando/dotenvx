const t = require('tap')
const sinon = require('sinon')
const capcon = require('capture-console')

const main = require('./../../../src/lib/main')
const get = require('./../../../src/cli/actions/get')

t.beforeEach((ct) => {
  sinon.restore()
})

t.test('get', ct => {
  const optsStub = sinon.stub().returns({})
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns({ HELLO: 'World' })

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, undefined)
  })

  t.ok(stub.called, 'main.get() called')
  t.equal(stdout, JSON.stringify({ HELLO: 'World' }, null, 0))

  ct.end()
})

t.test('get KEY', ct => {
  const optsStub = sinon.stub().returns({})
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns('World')

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, 'HELLO')
  })

  t.ok(stub.called, 'main.get() called')
  t.equal(stdout, 'World')

  ct.end()
})

t.test('get --format shell', ct => {
  const optsStub = sinon.stub().returns({ format: 'shell' })
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns({ HELLO: 'World' })

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, undefined)
  })

  t.ok(stub.called, 'main.get() called')
  t.equal(stdout, 'HELLO=World')

  ct.end()
})

t.test('get --pretty-print', ct => {
  const optsStub = sinon.stub().returns({ prettyPrint: true })
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns({ HELLO: 'World' })

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, undefined)
  })

  t.ok(stub.called, 'main.get() called')
  t.equal(stdout, JSON.stringify({ HELLO: 'World' }, null, 2))

  ct.end()
})

t.test('get KEY --convention', ct => {
  const optsStub = sinon.stub().returns({ convention: 'nextjs' })
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns('World')

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, undefined)
  })

  t.ok(stub.called, 'main.get() called')
  t.equal(stdout, 'World')

  ct.end()
})

t.test('get KEY (not found)', ct => {
  const optsStub = sinon.stub().returns({})
  const fakeContext = { opts: optsStub }
  const stub = sinon.stub(main, 'get').returns(undefined)
  const processExitStub = sinon.stub(process, 'exit')

  const stdout = capcon.interceptStdout(() => {
    get.call(fakeContext, 'NOTFOUND')
  })

  t.ok(stub.called, 'main.get() called')
  t.ok(processExitStub.calledWith(1), 'process.exit(1)')
  t.equal(stdout, '') // send empty string if key's value undefined

  ct.end()
})
