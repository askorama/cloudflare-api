function createError(message, cause) {
    // @ts-ignore
    return new Error(message, {
        cause
    });
}
export class CloudFlareApi {
    url;
    apiKey;
    constructor(option) {
        this.url = option.url || 'https://api.cloudflare.com/client/v4';
        this.apiKey = option.apiKey;
    }
    async uploadKv(accountId, namespaceId, key, value) {
        const url = `${this.url}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${this.apiKey}`);
        const formdata = new FormData();
        formdata.append('value', value);
        formdata.append('metadata', '{}');
        let response;
        try {
            response = await this.put(url, headers, formdata);
        }
        catch (e) {
            throw createError(`failed to upload kv "${key}"`, e);
        }
        const json = await response.json();
        if (json.success !== true) {
            throw createError(`failed to upload kv ${key}: ${JSON.stringify(json)}`);
        }
    }
    async put(url, headers, body) {
        const r = await fetch(url, {
            method: 'PUT',
            headers,
            body,
        });
        if (r.status !== 200) {
            let msg = `Received status code ${r.status} from PUT ${url}.`;
            try {
                msg += `Response body: ${await r.text()}`;
            }
            catch (e) {
                msg += `Unable to read error response body: ${e.message}`;
            }
            throw new Error(msg);
        }
        return r;
    }
}
