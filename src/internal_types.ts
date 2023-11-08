
export interface CloudFlareApiConfig {
  apiKey: string
  url: string
}

export const enum Method {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}
