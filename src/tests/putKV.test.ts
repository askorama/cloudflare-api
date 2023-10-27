import t from 'node:test'
import assert from 'node:assert'
import Fastify from 'fastify'
import fMultipart from '@fastify/multipart'

import { CloudFlareApi } from '../index.js'

const API_KEY = 'a-fake-api-key'
const ACCOUNT_ID = '123'
const NAMESPACE_ID = '456'
const KEY = '789'
const VALUE = 'value'
const VALUE_BLOB = new Blob([Buffer.from([1, 2, 3])])

await t.test('uploadKv', async (t) => {
  await t.test('should upload string kv', async (t) => {
    const fakeServer = await buildFakeCloudFlareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: true })

    const api = new CloudFlareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })

    await api.uploadKv(ACCOUNT_ID, NAMESPACE_ID, KEY, VALUE)

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)

    assert.deepStrictEqual(invocations[0].requestBody, { value: VALUE, metadata: '{}' })
  })

  await t.test('should upload blob kv', async (t) => {
    const fakeServer = await buildFakeCloudFlareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: true })

    const api = new CloudFlareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })

    await api.uploadKv(ACCOUNT_ID, NAMESPACE_ID, KEY, VALUE_BLOB)

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)

    assert.deepStrictEqual(invocations[0].requestBody, { value: '\x01\x02\x03', metadata: '{}' })
  })

  await t.test('should throw an error on success: false', async (t) => {
    const fakeServer = await buildFakeCloudFlareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 200, { success: false })

    const api = new CloudFlareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })

    await assert.rejects(api.uploadKv(ACCOUNT_ID, NAMESPACE_ID, KEY, 'value'), err => {
      return (err as Error).message === 'failed to upload kv 789: {"success":false}'
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should throw an error on 500', async (t) => {
    const fakeServer = await buildFakeCloudFlareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, {})

    const api = new CloudFlareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })

    await assert.rejects(api.uploadKv(ACCOUNT_ID, NAMESPACE_ID, KEY, 'value'), err => {
      return /Received status code 500 from PUT/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })

  await t.test('should not break strage error on not JSON', async (t) => {
    const fakeServer = await buildFakeCloudFlareServer(t, API_KEY)
    fakeServer.expectInvocation('PUT', `/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${KEY}`, 500, '{')

    const api = new CloudFlareApi({ apiKey: API_KEY, url: fakeServer.getBaseUrl() })

    await assert.rejects(api.uploadKv(ACCOUNT_ID, NAMESPACE_ID, KEY, 'value'), err => {
      return /Received status code 500 from PUT/.test((err as any).cause.message)
    })

    const invocations = fakeServer.getInvocations()
    assert.equal(invocations.length, 1)
  })
})

declare module 'fastify' {
  interface FastifyInstance {
    getBaseUrl: () => string
    expectInvocation: (method: string, url: string, statusCode: number, responseBody: object | string) => void
    getInvocations: () => Array<{ headers: any, requestBody: any }>
  }
}

async function buildFakeCloudFlareServer (t: any, apiKey: string): Promise<Fastify.FastifyInstance> {
  const server = Fastify({
    logger: {
      level: 'trace'
    }
  })
  await server.register(fMultipart, { attachFieldsToBody: 'keyValues' })

  const expectedInvocations: Array<{ method: string, url: string, statusCode: number, responseBody: any }> = []

  const invocations: Array<{
    headers: any
    requestBody: any
  }> = []

  server.addHook('onRequest', async (request, reply) => {
    if (request.headers.authorization !== `Bearer ${apiKey}`) {
      await reply.status(401).send('Unauthorized')
    }
  })

  server.decorate('getBaseUrl', function () {
    const address: { port: number } = this.addresses()[0]
    return `http://localhost:${address.port}`
  })

  server.all('*', async (request, reply) => {
    const url = request.url
    const expectedInvocation = expectedInvocations.shift()
    if (expectedInvocation == null) {
      t.diagnostic(`unexpected request: ${url}`)
      throw new Error(`unexpected request: ${url}`)
    }
    if (request.method !== expectedInvocation.method) {
      t.diagnostic(`unexpected method: ${request.method}`)
      throw new Error(`unexpected method: ${request.method}`)
    }

    if (url !== expectedInvocation.url) {
      t.diagnostic(`url should be ${expectedInvocation.url}: got ${url}`)
    }

    invocations.push({
      headers: request.headers,
      requestBody: request.body
    })

    await reply.status(expectedInvocation.statusCode).send(expectedInvocation.responseBody)
  })

  server.decorate('expectInvocation', function (method: string, url: string, statusCode: number, responseBody: object | string) {
    expectedInvocations.push({ method, url, statusCode, responseBody })
  })
  server.decorate('getInvocations', function () {
    return invocations
  })

  await server.listen()

  t.after(async () => {
    await server.close()
  })

  return await server
}
