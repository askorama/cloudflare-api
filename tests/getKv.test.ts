import t from 'node:test'
import assert from 'node:assert'

import { CloudflareApi } from '../src/index.js'
import { buildFakeCloudflareServer } from './helper.js'

const API_KEY = 'a-fake-api-key'
const ACCOUNT_ID = '123'
const NAMESPACE_ID = '456'
const KEY = '789'

await t.test('getKv', async (t) => {
  await t.test('should get kv as json', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('GET', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { foo: 'bar' })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    const obj = await workerKv.getKv(KEY, 'json')

    assert.deepStrictEqual(obj, { foo: 'bar' })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should get kv as json', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('GET', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { foo: 'bar' })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    const obj = await workerKv.getKv(KEY, 'text')

    assert.deepStrictEqual(obj, '{"foo":"bar"}')

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should get kv as arrayBuffer', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('GET', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, Buffer.from([1, 2, 3]))

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    const obj = await workerKv.getKv(KEY, 'arrayBuffer')

    assert.deepStrictEqual(new Uint8Array(obj), new Uint8Array([1, 2, 3]))

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should get kv as blob', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('GET', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, Buffer.from([1, 2, 3]))

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    const obj = await workerKv.getKv(KEY, 'blob')

    assert.deepStrictEqual(obj, new Blob([Buffer.from([1, 2, 3])], {
      type: 'application/octet-stream'
    }))

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should get kv as response', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('GET', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { foo: 'bar' })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    const response = await workerKv.getKv(KEY, 'response')

    assert.deepStrictEqual(await response.json(), { foo: 'bar' })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  /*
  await t.test('should throw an error on success: false', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('DELETE', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: false })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.deleteKv(KEY), err => {
      return (err as Error).message === 'failed to delete kv 789: {"success":false}'
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should throw an error on 500', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('DELETE', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, {})

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.deleteKv(KEY), err => {
      return /Received status code 500 from DELETE/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should not break strage error on not JSON', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('DELETE', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, '{')

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.deleteKv(KEY), err => {
      return /Received status code 500 from DELETE/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })
  */
})
