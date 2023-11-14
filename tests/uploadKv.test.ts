import t from 'node:test'
import assert from 'node:assert'

import { CloudflareApi } from '../src/index.js'
import { buildFakeCloudflareServer } from './helper.js'

const API_KEY = 'a-fake-api-key'
const ACCOUNT_ID = '123'
const NAMESPACE_ID = '456'
const KEY = '789'
const VALUE = 'value'
const VALUE_BLOB = new Blob([Buffer.from([1, 2, 3])])

await t.test('uploadKv', async (t) => {
  await t.test('should upload string kv', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: true })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await workerKv.uploadKv(KEY, VALUE)

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)

    assert.deepStrictEqual(invocations[0].requestBody, { value: VALUE, metadata: '{}' })
  })

  await t.test('should upload blob kv', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: true })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await workerKv.uploadKv(KEY, VALUE_BLOB)

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)

    assert.deepStrictEqual(invocations[0].requestBody, { value: '\x01\x02\x03', metadata: '{}' })
  })

  await t.test('should throw an error on success: false', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: false })

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.uploadKv(KEY, 'value'), err => {
      return (err as Error).message === 'failed to upload kv 789: {"success":false}'
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should throw an error on 500', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, {})

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.uploadKv(KEY, 'value'), err => {
      return /Received status code 500 from PUT/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should not break strage error on not JSON', async (t) => {
    const fakeServer = await buildFakeCloudflareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, '{')

    const api = new CloudflareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })
    const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

    await assert.rejects(workerKv.uploadKv(KEY, 'value'), err => {
      return /Received status code 500 from PUT/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })
})
