import { CloudflareApiConfig } from './internal_types.js'
import { CloudflareWorkerKv } from './workerKv.js'

export interface CloudflareApiOption {
  apiKey: string
  url?: string
}

export class CloudflareApi {
  private readonly config: CloudflareApiConfig

  constructor (option: CloudflareApiOption) {
    this.config = {
      apiKey: option.apiKey,
      url: option.url ?? 'https://api.cloudflare.com/client/v4'
    }
  }

  workerKv (accountId: string, namespaceId: string): CloudflareWorkerKv {
    return new CloudflareWorkerKv({
      ...this.config,
      accountId,
      namespaceId
    })
  }
}
