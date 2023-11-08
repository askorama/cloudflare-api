# Cloudflare API library

[![Nodejs](https://github.com/oramasearch/cloudflare-api/actions/workflows/nodejs.yml/badge.svg)](https://github.com/oramasearch/cloudflare-api/actions/workflows/nodejs.yml)

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

await workerKv.uploadKv('key', 'value') // upload a value to the KV
await workerKv.getKv('key', 'text') // return the text representation of the value
await workerKv.deleteKv('key') // delete the value from the KV
```

## License

Apache-2.0
