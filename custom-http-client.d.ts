import type { HttpClient } from "abap-adt-api";

declare class CustomHttpClient implements HttpClient {
  constructor(baseURL: string);
  request(options: any): Promise<any>;
}

export default CustomHttpClient;