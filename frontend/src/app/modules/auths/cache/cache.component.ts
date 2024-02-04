import { Component, OnInit } from '@angular/core';
import { AuthService } from '@ih-app/services/auth.service';
import { CacheService } from '@ih-app/services/cache.service';

declare var $: any;
declare var document: any;

@Component({
  templateUrl: './cache.component.html'
})
export class CacheComponent implements OnInit {
  caches$: string[] = [];

  selectedCache: string[] = [];

  constructor(private cache:CacheService, private authService:AuthService) { }

  ngOnInit() {
    this.listCache();
  }

  async listCache(){
    const allCache:string[] = await this.cache.getCaches();
    this.caches$ = allCache;
  }

  async cleanCache(){
    await this.cache.clearAllCache(this.selectedCache);
    this.listCache();
  }

  checkAll(){
    const checkAllCible = document.getElementById('check-all');
    if (checkAllCible) {
      for (let i = 0; i < this.caches$.length; i++) {
        const cacheKey = this.caches$[i];
        const cible = document.getElementById(this.generateId(cacheKey));
        if (cible) {
          cible.checked = checkAllCible.checked;
          this.selectedCache = checkAllCible.checked ? this.caches$ : [];
        }
        
      }
    }
  }

  checkOrNot(cacheKey:string, checkAllCache:boolean = false){
    const cible = document.getElementById(this.generateId(cacheKey));
    if (cible) {
      if (checkAllCache) {
          this.selectedCache = cible.checked ? this.caches$ : [];
      } else {
          if (cible.checked && !this.selectedCache.includes(cacheKey)) this.selectedCache.push(cacheKey)
          if (!cible.checked && this.selectedCache.includes(cacheKey)) this.selectedCache = this.selectedCache.filter(e => e !== cacheKey);
      }
    } 
  }

  generateId(cacheKey:string){
    return `${cacheKey}`.replace('ngsw:/:','').replace(':','-');
  }


 

}
