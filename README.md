# Cloudflare API library

This library is a wrapper around the Cloudflare API.

## Installation

```sh
npm install @orama/cloudflare-api
```

## Usage

```ts
import { CloudFlareApi } from '@orama/cloudflare-api';

const apiKey = 'your-api-key'
const api = new CloudFlareApi({ apiKey })

// Worker KV
const ACCOUNT_ID = 'your-account-id'
const NAMESPACE_ID = 'your-namespace-id'
const workerKv = api.workerKv(ACCOUNT_ID, NAMESPACE_ID)

await workerKv.uploadKv('key', 'value')
await workerKv.getKv('key', 'value')
await workerKv.deleteKv('key', 'value')
```

## License

Apache-2.0
