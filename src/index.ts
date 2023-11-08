import { CloudFlareApiConfig } from "./internal_types.js"
import { CloudFlareWorkerKv } from "./workerKv.js"

export interface CloudFlareApiOption {
  apiKey: string
  url?: string
}


export class CloudFlareApi {
  private config: CloudFlareApiConfig

  constructor (option: CloudFlareApiOption) {
    this.config = {
      apiKey: option.apiKey,
      url: option.url ?? 'https://api.cloudflare.com/client/v4'
    }
  }

  workerKv(accountId: string, namespaceId: string): CloudFlareWorkerKv {
    return new CloudFlareWorkerKv({
      ...this.config,
      accountId,
      namespaceId
    })
  }
}
