
function createError (message: string, cause?: Error): Error {
  return new Error(message, {
    cause
  })
}

export interface CloudFlareApiOption {
  apiKey: string
  url?: string
}

export class CloudFlareApi {
  url: string
  apiKey: string

  constructor (option: CloudFlareApiOption) {
    this.url = option.url ?? 'https://api.cloudflare.com/client/v4'
    this.apiKey = option.apiKey
  }

  async uploadKv (accountId: string, namespaceId: string, key: string, value: string | Blob): Promise<void> {
    const url = `${this.url}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${this.apiKey}`)

    const formdata = new FormData()
    formdata.append('value', value)
    formdata.append('metadata', '{}')

    let response
    try {
      response = await this.put(url, headers, formdata)
    } catch (e) {
      throw createError(`failed to upload kv "${key}"`, e as Error)
    }
    const json = await response.json()

    if (json.success !== true) {
      throw createError(`failed to upload kv ${key}: ${JSON.stringify(json)}`)
    }
  }

  private async put (url: string, headers: Headers, body: FormData): Promise<Response> {
    const r = await fetch(
      url,
      {
        method: 'PUT',
        headers,
        body
      }
    )

    if (r.status !== 200) {
      let msg = `Received status code ${r.status} from PUT ${url}.`
      try {
        msg += `Response body: ${await r.text()}`
      } catch (e) {
        msg += `Unable to read error response body: ${(e as Error).message}`
      }
      throw new Error(msg)
    }

    return r
  }
}
