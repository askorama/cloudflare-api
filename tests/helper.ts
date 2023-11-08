
import Fastify from 'fastify'
import fMultipart from '@fastify/multipart'

declare module 'fastify' {
  interface FastifyInstance {
    getBaseUrl: () => string
    expectInvocation: (method: string, url: string, statusCode: number, responseBody: object | string) => void
    getInvocations: () => Array<{ headers: any, requestBody: any }>
  }
}

export async function buildFakeCloudFlareServer (t: any, apiKey: string): Promise<Fastify.FastifyInstance> {
  const server = Fastify({
    logger: {
      level: 'error'
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
