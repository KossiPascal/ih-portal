import { Injectable } from "@angular/core";
import { DataList, TodoItem, TodoList } from "@ih-app/models/IndexDb";
import { Sites, Zones, Families, Patients, Chws, ChwsDataFormDb } from "@ih-app/models/Sync";
import { User } from "@ih-app/models/User";
import { Functions } from "@ih-app/shared/functions";
import Dexie, { Table } from 'dexie';
import relationships from 'dexie-relationships'


@Injectable({
    providedIn: "root",
})

export class IndexDbService extends Dexie {

    public todoItems!: Table<TodoItem, number>;
    public todoLists!: Table<TodoList, number>;
    public user!: Table<User, number>;

    public data!: Table<DataList, string>;

    public sites!: Table<Sites, string>;
    public zones!: Table<Zones, string>;
    public families!: Table<Families, string>;
    public patients!: Table<Patients, string>;
    public mobileData!: Table<ChwsDataFormDb, string>;
    
    public chws!: Table<Chws, string>;

    public constructor() {
        super('ihdb', { addons: [relationships] });
        this.version(3).stores({
            // todoLists: '++id',
            // todoItems: '++id, todoListId',
            // user: 'id',
            // dataList: 'id'
            // dataList: 'id, site_id -> siteList.id, zone_id -> zoneList.id',

            sites: 'id,source,name,external_id,district,reported_date,reported_full_date',
            zones: 'id,source,name,external_id,site.id,chw_id,reported_date,reported_full_date',
            chws: 'id, source, name, external_id, code, role, site.id, zone.id, reported_date, reported_full_date',
            families: 'id,source,name,external_id,zone.id,site.id,reported_date,reported_full_date',
            patients: 'id,source,name,external_id,role,zone.id,site.id,family.id,reported_date,reported_full_date',
            mobileData: 'id,form,source,patient_id,fields,phone,zone.id,site.id,chw.id,geolocation,reported_date,reported_full_date',

        });
        //   this.on('populate', () => this.populate());
    }
 
    async  getlast(dbtable: Table){
        return  await dbtable.orderBy('id').last();
    }


    // getData from the database
   async getAll(dbtable: Table) {
        var data: any[] = [];
        const count = dbtable.count(count => {
            if (count) dbtable.each(obj => data.push(obj));
        });
        return data;
    };

    async create(dbtable: Table, items: any) {
        // let flag = this.empty(items);
        // delete items.id;
        try {
            dbtable.add(items);
            console.log("data inserted successfully...!");
        } catch (error) {
            console.log("Error" + error);
        }
    };

   async bulkCreate(dbtable: Table, items: any[]) {
        // let flag = this.empty(items);
        try {
            dbtable.bulkAdd(items);
            console.log("all data are inserted successfully...!");
        } catch (error) {
            // console.log("Error" + error);
            dbtable.bulkPut(items);
            console.log("all data are updated successfully...!");
        }
    };

   async bulkPut(dbtable: Table, items: any[]) {
        // let flag = this.empty(items);
        try {
            dbtable.bulkPut(items);
            console.log("all data are updated successfully...!");
        } catch (error) {
            console.log("Error" + error);
        }
    };

   async bulkDelete(dbtable: Table, keys: any[]) {
        if (keys.length > 0) {
            dbtable.bulkDelete(keys);
            console.log("all data are updated successfully...!");
        } else {
            console.log("Please provide data...!");
        }
    };

    // update data
   async update(dbtable: Table, items: any) {
        const id: any = items.id;
        delete items.id;
        if (id) {
            dbtable.update(id, items).then((updated) => {
                let updateMsg = updated ? 'data updated successfuly' : 'couldn\'t update data';
                console.log(updateMsg);
            })
        } else {
            console.log(`Please Select id: ${id}`);
        }
    }

    async getById(dbtable: Table, id: any) {
        try {
            const data = await dbtable.get(id);
            return data;
        } catch (err) {
            console.log(err);
            return {};
        }
    }

    async getAllByParams(dbtable: Table, filter?: any){
        return  await dbtable.toArray();
        // return  await dbtable.orderBy('id').toArray();
    }




//   async function listFriends() {
//     return await db.friends
//       .where("age")
//       .between(18, 65)
//       .toArray();
//   }

    async createOrUpdate(dbtable: Table, items: any) {
        const id = items.id;
        const found = await this.getById(dbtable, id);
        if (Functions.notNull(found)) {
          this.update(dbtable, items);
        } else {
          this.create(dbtable, items);
        }
      }

    // delete data
   async deleteOne(dbtable: Table, id: any) {
        dbtable.delete(id).then((val: any) => console.log(val));
    }

   async clearDb(dbtable: Table) {
        dbtable.clear().then((val: any) => console.log(val));
    }

    // check textbox validation
    empty(object: any) {
        let flag = false;
        for (const value in object) {
            if (object[value] != "" && object.hasOwnProperty(value)) {
                flag = true;
            } else {
                flag = false;
            }
        }
        return flag;
    };


}




// db.bands
//   .where('name').startsWithAnyOf('A', 'B') // can be replaced with your custom query
//   .with({albums: 'albums', genre: 'genreId'}) // makes referred items included
//   .then(bands => {
//       // Let's print the result:
//       bands.forEach (band => {
//           console.log (`Band Name: ${band.name}`)
//           console.log (`Genre: ${band.genre.name}`)
//           console.log (`Albums: ${JSON.stringify(band.albums, null, 4)}`)
//       });
// })


// /**
//  * Delete the entire database
//  */
// export async function deleteDatabase(db) {
//   await db.delete()
// }

// /**
//  * Open a  database
//  */
// export async function openDatabase(db) {
//   await db.open()
// }

// /**
//  * Clear all tables
//  */
// export async function clearAllTables(db) {
//     await Promise.all(
//       [db.contacts.clear(), 
//        db.emails.clear(), 
//        db.phones.clear()]);
// }

// /**
//  * Read all contacts
//  */
// export async function readAllContacts(db) {
//   return await db.contacts.toArray()
// }

// /**
//  * Delete all contacts
//  */
// export async function deleteAllContact(db) {
//   return await db.contacts.clear()
// }

// /**
//  * Create a contact
//  * 
//  * Note that since the contact is guaranteed
//  * to have a unique ID we are using `put` 
//  * to update the databse.
//  */
// export  async function createContact(db, contact:Contact):Promise<string> {
//   return await db.contacts.put(contact)
// }

// /**
//  * Read a contact
//  */
// export  async function readContact(db, contactGID:string):Promise<Contact> {
//   return await db.contacts.get(contactGID)
// }

// /**
//  * Update contact
//  */
// export async function updateContact(db, contact:Contact) {
//   return await db.contacts.put(contact)
// }

// /**
//  * Delete contact
//  */
// export async function deleteContact(db, contact:Contact) {
//   return await db.contacts.where('gid').equals(contact.gid).delete()
// }

// /**
//  * Read all email addresses
//  */
// export async function readAllEmailAddresses(db) {
//   return await db.emails.toArray()
// }

// /**
//  * Delete all email addresses
//  */
// export async function deleteAllEmailAddresses(db) {
//   return await db.emails.clear()
// }

// /**
//  * Create email address record
//  * 
//  * Note that since the EmailAddress instance
//  * is guaranteed
//  * to have a unique ID we are using `put` 
//  * to update the databse.
//  */
// export async function createEmailAddress(db, email:EmailAddress) {
//   return await db.emails.put(email)
// }

// /**
//  * Update an email address record
//  */
// export async function updateEmailAddress(db, email:EmailAddress) {
//   return await db.emails.put(email)
// }

// /**
//  * Delete contact
//  */
// export async function deleteEmail(db, email:EmailAddress) {
//   await db.contacts.where('gid').equals(email.gid).delete()
// }

// /**
//  * Read all phone number records
//  */
// export async function readAllPhoneNumbers(db) {
//   return await db.phones.toArray()
// }

// /**
//  * Delete all phone numbers
//  */
// export async function deleteAllPhoneNumbers(db) {
//   await db.phones.clear()
// }

// /**
//  * Create email address record
//  */
// export async function createPhoneNumber(db, phone:PhoneNumber) {
//   return await db.phones.put(phone)
// }

// /**
//  * Update the PhoneNumber record
//  */
// export async function updatePhoneNumber(db, phone:PhoneNumber) {
//   await db.phones.put(phone)
// }

// /**
//  * Deletre the phone number
//  */
// export async function deletePhoneNumber(db, phone:PhoneNumber) {
//   await db.phones.where('gid').equals(phone.gid).delete()
// }

// /**
//  * Load email records and 
//  * update the corresponding ocntact fields.
//  */
// export async function loadContactEmails(contact, db) {
//     contact.emails = 
//     await db.emails.where('contactId').equals(contact.id).toArray()
// }

// /**
//  * Load phone records and 
//  * update the ocrresponding ocntact fields.
//  */
// export async function loadContactPhones(contact:Contact, db) {
//     contact.phones = 
//     await db.phones.where('contactId').equals(contact.gid).toArray()
// }

// /**
//  * Load navgiation properties (Email and Phone records) and 
//  * update the ocrresponding ocntact fields.
//  */
// export async function loadNavigationProperties(db, contact:Contact) {
//     [contact.emails, contact.phones] = await Promise.all([
//         db.emails.where('contactId').equals(contact.gid).toArray(),
//         db.phones.where('contactId').equals(contact.gid).toArray()
//     ]);
// }

// /**
//  * Save a contact entity.  If email or phone records 
//  * were removed from the contact, then these will also
//  * be deleted from the database.
//  */
// export async function saveContact(db, contact:Contact) {
//     return db.transaction('rw', db.contacts, db.emails, db.phones, async () => {
        
//         // Add or update contact. If add, record contact.id.
//         contact.gid = await db.contacts.put(contact);
//         // Save all navigation properties (arrays of emails and phones)
//         // Some may be new and some may be updates of existing objects.
//         // put() will handle both cases.
//         // (record the result keys from the put() operations into emailIds and phoneIds
//         //  so that we can find local deletes)
//         let [emailIds, phoneIds] = await Promise.all ([
//             Promise.all(contact.emails.map(email => updateEmailAddress(db, email))),
//             Promise.all(contact.phones.map(phone => updatePhoneNumber(db, phone)))
//         ]);
                        
//         // Was any email or phone number deleted from out navigation properties?
//         // Delete any item in DB that reference us, but is not present
//         // in our navigation properties:
//         await Promise.all([
//             db.emails.where('contactId').equals(contact.gid) // references us
//                 .and(email => emailIds.indexOf(email.id) === -1) // Not anymore in our array
//                 .delete(),
        
//             db.phones.where('contactId').equals(contact.gid)
//                 .and(phone => phoneIds.indexOf(phone.id) === -1)
//                 .delete()
//         ])
//     });
// }











// Supported operations

// above(key): Collection;
// aboveOrEqual(key): Collection;
// add(item, key?): Promise;
// and(filter: (x) => boolean): Collection;
// anyOf(keys[]): Collection;
// anyOfIgnoreCase(keys: string[]): Collection;
// below(key): Collection;
// belowOrEqual(key): Collection;
// between(lower, upper, includeLower?, includeUpper?): Collection;
// bulkAdd(items: Array): Promise;
// bulkDelete(keys: Array): Promise;
// bulkPut(items: Array): Promise;
// clear(): Promise;
// count(): Promise;
// delete(key): Promise;
// distinct(): Collection;
// each(callback: (obj) => any): Promise;
// eachKey(callback: (key) => any): Promise;
// eachPrimaryKey(callback: (key) => any): Promise;
// eachUniqueKey(callback: (key) => any): Promise;
// equals(key): Collection;
// equalsIgnoreCase(key): Collection;
// filter(fn: (obj) => boolean): Collection;
// first(): Promise;
// get(key): Promise;
// inAnyRange(ranges): Collection;
// keys(): Promise;
// last(): Promise;
// limit(n: number): Collection;
// modify(changeCallback: (obj: T, ctx:{value: T}) => void): Promise;
// modify(changes: { [keyPath: string]: any } ): Promise;
// noneOf(keys: Array): Collection;
// notEqual(key): Collection;
// offset(n: number): Collection;
// or(indexOrPrimayKey: string): WhereClause;
// orderBy(index: string): Collection;
// primaryKeys(): Promise;
// put(item: T, key?: Key): Promise;
// reverse(): Collection;
// sortBy(keyPath: string): Promise;
// startsWith(key: string): Collection;
// startsWithAnyOf(prefixes: string[]): Collection;
// startsWithAnyOfIgnoreCase(prefixes: string[]): Collection;
// startsWithIgnoreCase(key: string): Collection;
// toArray(): Promise;
// toCollection(): Collection;
// uniqueKeys(): Promise;
// until(filter: (value) => boolean, includeStopEntry?: boolean): Collection;
// update(key: Key, changes: { [keyPath: string]: any }): Promise;