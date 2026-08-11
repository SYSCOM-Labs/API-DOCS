import axios from "axios";
import type { HikCredentials, HikApiResponse, TokenData } from "../types/hik.types.js";

interface TokenCacheEntry {
  accessToken: string;
  expireTime: number;
  areaDomain: string;
  userId: string;
}

const REFRESH_BUFFER_SEC = 120;

class HikAuthService {
  private cache = new Map<string, TokenCacheEntry>();

  private cacheKey(credentials: HikCredentials): string {
    return `${credentials.serverAddress}:${credentials.appKey}`;
  }

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

    if (raw.errorCode !== "0" || !raw.data?.accessToken) {
      throw new Error(`token/get falló: errorCode=${raw.errorCode ?? "desconocido"}`);
    }

    const { accessToken, expireTime, areaDomain, userId } = raw.data;
    const domain = (areaDomain || credentials.serverAddress).replace(/\/$/, "");

    return { accessToken, expireTime, areaDomain: domain, userId };
  }
}

export const hikAuthService = new HikAuthService();
