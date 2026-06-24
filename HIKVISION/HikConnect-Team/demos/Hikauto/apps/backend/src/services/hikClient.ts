import axios, { type AxiosRequestConfig, type Method } from "axios";
import type { HikCredentials, ProxyDebugEnvelope } from "../types/hik.types.js";
import { hikAuthService } from "./hikAuth.js";

export interface ProxyMeta {
  sourceFile: string;
}

/**
 * Cliente HTTP centralizado para todas las llamadas a Hik-Connect tras obtener token.
 * Envuelve cada respuesta con metadatos de debug para el Code HUD del frontend.
 */
class HikClient {
  /**
   * Ejecuta POST contra areaDomain con header Token.
   * areaDomain proviene del token/get y puede diferir de serverAddress.
   */
  async proxyPost<T>(
    credentials: HikCredentials,
    relativePath: string,
    body: unknown,
    meta: ProxyMeta
  ): Promise<ProxyDebugEnvelope<T>> {
    return this.proxyRequest<T>("POST", credentials, relativePath, body, meta);
  }

  /** Ejecuta GET contra areaDomain con header Token. */
  async proxyGet<T>(
    credentials: HikCredentials,
    relativePath: string,
    meta: ProxyMeta
  ): Promise<ProxyDebugEnvelope<T>> {
    return this.proxyRequest<T>("GET", credentials, relativePath, undefined, meta);
  }

  private async proxyRequest<T>(
    method: Method,
    credentials: HikCredentials,
    relativePath: string,
    body: unknown,
    meta: ProxyMeta
  ): Promise<ProxyDebugEnvelope<T>> {
    const session = await hikAuthService.getValidSession(credentials);
    const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
    const targetUrl = `${session.areaDomain}${path}`;

    const config: AxiosRequestConfig = {
      method,
      url: targetUrl,
      headers: {
        Token: session.accessToken,
        "Content-Type": "application/json",
      },
      data: method === "GET" ? undefined : body ?? {},
      validateStatus: () => true,
    };

    const response = await axios.request<T>(config);

    return {
      debug: {
        verb: method,
        targetUrl,
        requestPayload: method === "GET" ? null : body,
        responseBody: response.data,
        sourceFile: meta.sourceFile,
      },
      data: response.data,
    };
  }

}

export const hikClient = new HikClient();
