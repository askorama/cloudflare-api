import { CloudFlareApiConfig, Method } from './internal_types.js'
import { checkSuccess, createError, makeHttpRequest } from './utils.js'

export interface CloudFlareWorkerKvConfig extends CloudFlareApiConfig {
  accountId: string
  namespaceId: string
}

type ReturnAs = 'json' | 'blob' | 'arrayBuffer' | 'text' | 'response'

type ReturnAsType<T> =
    T extends 'json' ? unknown :
      T extends 'text' ? string :
        T extends 'blob' ? Blob :
          T extends 'arrayBuffer' ? ArrayBuffer :
            T extends 'response' ? Response :
              never

export class CloudFlareWorkerKv {
  constructor (private readonly config: CloudFlareWorkerKvConfig) {}

  async getKv<T extends ReturnAs>(key: string, returnAs: T): Promise<ReturnAsType<T>> {
    const response = await this.perform(Method.GET, key, undefined)

    switch (returnAs) {
      case 'json':
        return await response.json()
      case 'blob':
        return await (response.blob() as Promise<ReturnAsType<T>>)
      case 'arrayBuffer':
        return await (response.arrayBuffer() as Promise<ReturnAsType<T>>)
      case 'text':
        return await (response.text() as Promise<ReturnAsType<T>>)
      case 'response':
        return response as ReturnAsType<T>
      default:
        throw new Error(`unknown type ${returnAs}`)
    }
  }

  async uploadKv (key: string, value: string | Blob): Promise<void> {
    const formdata = new FormData()
    formdata.append('value', value)
    formdata.append('metadata', '{}')

    const response = await this.perform(Method.PUT, key, formdata)
    const json = await response.json()
    checkSuccess(json, `failed to upload kv ${key}`)
  }

  async deleteKv (key: string): Promise<void> {
    const response = await this.perform(Method.DELETE, key, undefined)
    const json = await response.json()
    checkSuccess(json, `failed to delete kv ${key}`)
  }

  private async perform (method: Method, key: string, body: FormData | undefined): Promise<Response> {
    const url = `${this.config.url}/accounts/${this.config.accountId}/storage/kv/namespaces/${this.config.namespaceId}/values/${key}`
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${this.config.apiKey}`)

    let response
    try {
      response = await makeHttpRequest(method, url, headers, body)
    } catch (e) {
      throw createError(`failed to upload kv "${key}"`, e as Error)
    }

    return response
  }
}
