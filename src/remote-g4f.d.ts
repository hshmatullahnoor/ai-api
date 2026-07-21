declare module "https://g4f.dev/dist/js/providers.js" {
  export function createClient(
    provider: string,
    options?: {
      apiKey?: string;
      baseUrl?: string;
      [key: string]: unknown;
    }
  ): Promise<any>;
}
