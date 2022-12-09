import { Injectable } from '@angular/core';



@Injectable({
    providedIn: "root",
})
export class CacheService {

    private cacheName: string;

    constructor() {
        // TODO: AF idealmente este cache name debería estar en configuración
        this.cacheName = 'ngsw:1:data:dynamic:bin-api-performance:cache';

        // this.clearCacheStorage().then(() => {
        //     window.location.reload();
        //   });
    }

    async getCaches() {
        const keyList = await caches.keys();
        return keyList
        // const keys = await window.caches.keys();
        // await Promise.all(keys.map(key => caches.delete(key)));
    }



    async clearAllCache(selectedCache?: string[]): Promise<void> {
        const keyList: string[] = await caches.keys();
        keyList.map((key) => {
            if (selectedCache) {
                if (selectedCache.includes(key)) return caches.delete(key);
            } else {
                return caches.delete(key);
            }
            return false;
        })
    }

    clearCacheByKey(keyName: string): void {
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (keyName == key) caches.delete(key);
                    console.log(`Cache with key (${key}) was deleted successfully!`);
                })
            )
        )
    }

    /**
     * Elimina una cache en especifico o todas si se pasa como true el parametro allKeys
     * @param nameCacheParam
     */
    private clearCacheByNameOrAll(nameCacheParam?: string) {
        const self = this;
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName: string) => {
                    if (nameCacheParam && nameCacheParam == cacheName) return true;
                    return true
                }).map(async (cacheName) => {
                    const res = await caches.delete(cacheName);
                    return self.logDelete(res, cacheName);
                })
            );
        });
    }

    /**
     * Elimina una key(si encuentra la URL) dentro de una cache
     * @param nameCache
     * @param url
     */
    private clearCacheByUrl(nameCache: string, url: string) {
        caches.open(nameCache).then((c) => {
            c.keys().then((keys) => {
                keys.filter((p) => { return p.url.includes(url); })
                    .map((keySearched) => c.delete(keySearched.url).then((res) => this.logDelete(res, keySearched)));
            });
        }
        );
    }

    private async clearCacheStorage(): Promise<(Promise<boolean>[] | undefined)[]> {
        const cacheKeys = await caches.keys();
        return await Promise.all(
            cacheKeys.map(cacheKey => {
                const ngswRegex = /^(ngsw).*/;
                if (ngswRegex.test(cacheKey)) {
                    return caches
                        .open(cacheKey)
                        .then(cache => cache.keys().then(requests => requests.map(req => cache.delete(req))));
                }
                return undefined;
            })
        );
    }


    private logDelete(result: boolean, cache: any) {
        console.log(`eliminado de cache para ${cache} =>`, (result ? 'Satisfactorio' : 'Fallido'));
    }
}
