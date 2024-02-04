// import { Injectable } from "@angular/core";
// import { User } from "../models/User";
// import { AppStorageService } from "./cookie.service";
// import { AuthService } from "./auth.service";
// import { GetRolesIdsOrNames, UserRoles } from "../models/Roles";

// @Injectable({
//   providedIn: "root",
// })
// export class UserIndexDbService {

//   private db: IDBDatabase | null = null;
//   private dbName = 'IhPortal';
//   private objectStoreName = 'userData';

//   constructor(private store: AppStorageService) {
//     this.initializeIndexedDB();
//   }

//   private initializeIndexedDB(): void {
//     const request = indexedDB.open(this.dbName, 1);
//     request.onupgradeneeded = (event) => {
//       this.db = (event.target as IDBOpenDBRequest).result;
//       const objectStore = this.db.createObjectStore(this.objectStoreName, { keyPath: 'uid', autoIncrement: false });
//       // const objectStore = this.db.createObjectStore(this.objectStoreName, { keyPath: 'id', autoIncrement: true });
//     };
//     request.onsuccess = (event) => {
//       this.db = (event.target as IDBOpenDBRequest).result;
//     };
//     request.onerror = (event) => {
//       console.error('Error opening IndexedDB:', (event.target as IDBOpenDBRequest).error);
//     };
//   }

//   public save(user: User): void {
//     if (!this.db) {
//       return;
//     }
//     const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
//     const objectStore = transaction.objectStore(this.objectStoreName);

//     user.uid = 1;
//     const putRequest = objectStore.put(user);

//     putRequest.onsuccess = (event) => {
//       // Handle the successful save/update
//       // const userId = (event.target as IDBRequest).result;
//       this.store.set('userId', `${user.uid}`, user.useLocalStorage);
//       this.store.set('expiresIn', `${user?.expiresIn}`, user.useLocalStorage);
//       this.store.set('token', `${user?.token}`, user.useLocalStorage);

//       const defaultPages = GetRolesIdsOrNames(user?.roles as UserRoles[], 'default_page');
//       const default_page = defaultPages ? (defaultPages as string[])[0] : '';
//       this.store.set('default_page', default_page, user.useLocalStorage);
//     };

//     putRequest.onerror = (event) => {
//       // Handle the error
//       console.error('Error saving/updating user to IndexedDB:', (event.target as IDBRequest).error);
//       // this.clean();
//       return;
//     };
//   }

//   public get(): User | null {
//     try {
//       if (!this.db) {
//         return null;
//       }
//       const transaction = this.db.transaction([this.objectStoreName], 'readonly');
//       const objectStore = transaction.objectStore(this.objectStoreName);
//       const request = objectStore.get(1);
//       if (request.result) {
//         return request.result;
//       } else {
//         console.log('User not found');
//         // this.clean();
//         return null;
//       }
//     } catch (error) {
//       return null;
//     }

//   }


//   public getUser(): Promise<User | null> {
//     return new Promise((resolve, reject) => {
//       try {
//         console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
//         if (!this.db) {
//           resolve(null);
//           return;
//         }
//         console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')

  
//         const transaction = this.db.transaction([this.objectStoreName], 'readonly');
//         const objectStore = transaction.objectStore(this.objectStoreName);
//         const request = objectStore.get(1);
  
//         request.onsuccess = (event) => {
//           const result = (event.target as IDBRequest).result;
//           if (result) {
//             resolve(result);
//           } else {
//             console.log('User not found');
//             // this.clean();
//             resolve(null);
//           }
//         };
  
//         request.onerror = (event) => {
//           console.error('Error fetching user:', (event.target as IDBRequest).error);
//           reject(null);
//         };
  
//       } catch (error) {
//         console.error('Error in get method:', error);
//         reject(null);
//       }
//     });
//   }
  

//   public delete(): void {
//     try {
//       if (this.db) {
//         const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
//         const objectStore = transaction.objectStore(this.objectStoreName);
//         objectStore.delete(1);
//       }
//     } catch (error) {

//     }
//   }

//   public clean(): void {
//     try {
//       this.store.delete('userId');
//       this.store.delete('expiresIn');
//       this.store.delete('token');
//       this.store.delete('default_page');

//       if (this.db) {
//         const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
//         const objectStore = transaction.objectStore(this.objectStoreName);
//         const clearRequest = objectStore.clear();
//         clearRequest.onsuccess = (event) => {
//           console.log('All users deleted from IndexedDB');
//         };
//         clearRequest.onerror = (event) => {
//           console.error('Error clearing users from IndexedDB:', (event.target as IDBRequest).error);
//         };
//       }
//     } catch (error) {

//     }
//   }

//   public find(): User[] {
//     const users: User[] = [];
//     if (this.db) {
//       const transaction = this.db.transaction([this.objectStoreName], 'readonly');
//       const objectStore = transaction.objectStore(this.objectStoreName);
//       const request = objectStore.openCursor();
//       request.onsuccess = (event) => {
//         const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
//         if (cursor) {
//           users.push(cursor.value);
//           cursor.continue();
//         }
//       };
//     }
//     return users;
//   }

//   public findOneBy(property: string, value: any): User | null {
//     if (this.db) {
//       const transaction = this.db.transaction([this.objectStoreName], 'readonly');
//       const objectStore = transaction.objectStore(this.objectStoreName);
//       const index = objectStore.index(property);
//       const request = index.get(value);
//       if (request.result) {
//         return request.result;
//       } else {
//         console.log('User not found');
//         return null;
//       }
//     }
//     return null;
//   }

//   public findBy(property: string, value: any): User[] {
//     const users: User[] = [];
//     if (this.db) {
//       const transaction = this.db.transaction([this.objectStoreName], 'readonly');
//       const objectStore = transaction.objectStore(this.objectStoreName);
//       const index = objectStore.index(property);
//       const request = index.openCursor(IDBKeyRange.only(value));
//       request.onsuccess = (event) => {
//         const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
//         if (cursor) {
//           users.push(cursor.value);
//           cursor.continue();
//         }
//       };
//     }
//     return users;
//   }
// }