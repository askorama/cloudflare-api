import { Method } from './internal_types.js'

export function createError (message: string, cause?: Error): Error {
  return new Error(message, {
    cause
  })
}

export function checkSuccess (json: any, errorStr: string): void {
  if (json != null && json.success !== true) {
    throw createError(`${errorStr}: ${JSON.stringify(json)}`)
  }
}

export async function makeHttpRequest (method: Method, url: string, headers: Headers, requestBody: BodyInit | undefined): Promise<Response> {
  const r = await fetch(
    url,
    { method, headers, body: requestBody }
  )

  if (r.status !== 200) {
    let msg = `Received status code ${r.status} from ${method} ${url}.`
    try {
      msg += `Response body: ${await r.text()}`
    } catch (e) {
      msg += `Unable to read error response body: ${(e as Error).message}`
    }
    throw new Error(msg)
  }

  return r
}
