import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheStorageService {
  private cacheName = 'my-cache';

  async addToCache(request: Request, response: Response): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(request, response.clone());
    } catch (error) {
      console.error('Error adding to cache:', error);
      throw error;
    }
  }

  async getFromCache(request: Request): Promise<Response | null> {
    try {
      const cache = await caches.open(this.cacheName);
      const cachedResponse = await cache.match(request);
      return cachedResponse || null;
    } catch (error) {
      console.error('Error getting from cache:', error);
      throw error;
    }
  }

  async removeFromCache(request: Request): Promise<void> {
    try {
      const cache = await caches.open(this.cacheName);
      await cache.delete(request);
    } catch (error) {
      console.error('Error removing from cache:', error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name === this.cacheName)
          .map((name) => caches.delete(name))
      );
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  async clearAllCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (error) {
      console.error('Error clearing all caches:', error);
      throw error;
    }
  }

  async listCacheKeys(): Promise<string[]> {
    try {
      const cache = await caches.open(this.cacheName);
      const keys = await cache.keys();
      return keys.map((request) => request.url);
    } catch (error) {
      console.error('Error listing cache keys:', error);
      throw error;
    }
  }
}
