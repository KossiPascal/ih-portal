import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SharedStorageService {
    private storage: Storage = localStorage; // or sessionStorage for session-based storage

    setValue(key: string, value: any): void {
        this.storage.setItem(key, JSON.stringify(value));
    }

    getValue<T>(key: string): T | null {
        try {
            const storedValue = this.storage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : null;
        } catch (e) {
            return null;
        }
    }

    removeValue(key: string): void {
        this.storage.removeItem(key);
    }

    clearStorage(): void {
        this.storage.clear();
    }

    getKeys(): string[] {
        return Object.keys(this.storage);
    }

    containsKey(key: string): boolean {
        return this.storage.getItem(key) !== null;
    }

    getStorageSize(): number {
        return this.getKeys().length;
    }

    getStorageUsage(): number {
        let totalSize = 0;
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key) {
                const value = this.storage.getItem(key);
                if (value) totalSize += key.length + value.length;
            }
        }
        return totalSize;
    }
}
