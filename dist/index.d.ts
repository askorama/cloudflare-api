export interface CloudFlareApiOption {
    apiKey: string;
    url?: string;
}
export declare class CloudFlareApi {
    url: string;
    apiKey: string;
    constructor(option: CloudFlareApiOption);
    uploadKv(accountId: string, namespaceId: string, key: string, value: string | Blob): Promise<void>;
    private put;
}
