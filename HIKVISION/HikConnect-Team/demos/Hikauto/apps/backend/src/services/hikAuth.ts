import axios from "axios";
import type { HikCredentials, HikApiResponse, TokenData } from "../types/hik.types.js";

/** Entrada en caché: token + dominio regional + momento de expiración. */
interface TokenCacheEntry {
  accessToken: string;
  expireTime: number;
  areaDomain: string;
  userId: string;
}

/** Margen de seguridad (segundos) antes de expireTime para renovar proactivamente. */
const REFRESH_BUFFER_SEC = 120;

/**
 * Gestor de sesión dinámica para Hik-Connect OpenAPI.
 *
 * Por qué una caché en memoria:
 * - El playground recibe credenciales distintas por usuario/sesión desde el frontend.
 * - token/get devuelve accessToken (header Token) y areaDomain (base URL regional).
 * - Renovar antes de expireTime evita errores 401 en polling MQ cada 500ms.
 */
class HikAuthService {
  private cache = new Map<string, TokenCacheEntry>();

  private cacheKey(credentials: HikCredentials): string {
    return `${credentials.serverAddress}:${credentials.appKey}`;
  }

  /**
   * Devuelve sesión válida; renueva token si está ausente o próximo a expirar.
   */
  async getValidSession(credentials: HikCredentials): Promise<TokenCacheEntry> {
    const key = this.cacheKey(credentials);
    const cached = this.cache.get(key);
    const nowSec = Math.floor(Date.now() / 1000);

    if (cached && nowSec < cached.expireTime - REFRESH_BUFFER_SEC) {
      return cached;
    }

    const fresh = await this.fetchAndCache(credentials);
    this.cache.set(key, fresh);
    return fresh;
  }

  /** Invalida caché forzando nuevo token/get en la siguiente llamada. */
  invalidate(credentials: HikCredentials): void {
    this.cache.delete(this.cacheKey(credentials));
  }

  private async fetchAndCache(credentials: HikCredentials): Promise<TokenCacheEntry> {
    const url = `${credentials.serverAddress}/api/hccgw/platform/v1/token/get`;
    const { data: raw } = await axios.post<HikApiResponse<TokenData>>(
      url,
      { appKey: credentials.appKey, secretKey: credentials.secretKey },
      { headers: { "Content-Type": "application/json" }, validateStatus: () => true }
    );
    const response = raw as HikApiResponse<TokenData>;

    if (response.errorCode !== "0" || !response.data?.accessToken) {
      throw new Error(
        `token/get falló: errorCode=${response.errorCode ?? "desconocido"}`
      );
    }

    const { accessToken, expireTime, areaDomain, userId } = response.data;

    // areaDomain es obligatorio para APIs de flota; si falta, usar serverAddress como fallback
    const domain = (areaDomain || credentials.serverAddress).replace(/\/$/, "");

    return {
      accessToken,
      expireTime,
      areaDomain: domain,
      userId,
    };
  }
}

export const hikAuthService = new HikAuthService();
