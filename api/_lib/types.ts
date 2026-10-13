import type { IncomingMessage, ServerResponse } from 'node:http'

export interface ApiRequest extends IncomingMessage {
  body?: any
  query?: Record<string, string | string[]>
  cookies?: Record<string, string>
}

export interface ApiResponse extends ServerResponse {
  status(statusCode: number): ApiResponse
  json(data: unknown): void
  send(body: unknown): void
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void> | void
