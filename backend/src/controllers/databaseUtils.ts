import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { DataSource, EntityMetadata, In } from "typeorm";
import { AppDataSource } from "../data_source";
import { httpHeaders, sslFolder } from "../utils/functions";
import { getChwsDataSyncRepository, getChwsSyncRepository, getCouchDbUsersSyncRepository, getFamilySyncRepository, getPatientSyncRepository } from "../entity/Sync";
import { getChwsDataWithParams } from "./dataFromDB";
import { getPatients, getFamilies } from "./orgUnitsFromDB ";
import { Consts } from "../utils/constantes";
const request = require('request');
// const axios = require('axios');
// const fetch = require('node-fetch')
require('dotenv').config({ path: sslFolder('.ih-env') });
const { CHT_HOST, PROD_CHT_PORT, DEV_CHT_PORT } = process.env;

export async function databaseEntitiesList(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const Connection: DataSource = AppDataSource.manager.connection;
        const entities: EntityMetadata[] = Connection.entityMetadatas;
        var entitiesElements: { name: string, table: string }[] = [];
        for (const entity of entities) {
            entitiesElements.push({ name: entity.name, table: entity.tableName })
        }
        return res.status(200).json({ status: 200, data: entitiesElements });
    } catch (err) {
        // return next(err);
        return res.status(500).json({ status: 500, data: err });
    }
};

export async function truncatePostgresMysqlJsonDatabase(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(201).json({ status: 201, data: 'Informations you provided are not valid' });
    try {
        const { procide, entities } = req.body;
        if (procide == true) {
            const Connection: DataSource = AppDataSource.manager.connection;
            const _entities = entities as { name: string, table: string }[];
            for (const entity of _entities) {
                const _repo = Connection.getRepository(entity.name);
                await _repo.query(`TRUNCATE ${entity.table} RESTART IDENTITY CASCADE;`);
            }
            return res.status(200).json({ status: 200, data: 'Done successfully' });
        } else {
            return res.status(201).json({ status: 201, data: "You don't have permission de procide action" });
        }
    } catch (err) {
        // return next(err);
        return res.status(500).json({ status: 500, data: err });
    }
};

export async function getChwDataToBeDeleteFromCouchDb(req: Request, resp: Response, next: NextFunction) {
    var reqSource = req.body.sources;
    var reqDist = req.body.districts;
    var reqSite = req.body.sites;
    var reqZone = req.body.zones;
    var reqChw = req.body.chws;
    var reqType = req.body.type;

    if (reqSource && reqDist && reqSite && reqZone && reqChw && reqType) {
        var errorMsg = { status: 201, data: 'Error fond when fetching data! ' };
        try {
            if (reqType == 'data') {
                await getChwsDataWithParams(req, resp, next);
            } else if (reqType == 'patients') {
                await getPatients(req, resp, next)
            } else if (reqType == 'families') {
                await getFamilies(req, resp, next)
            }
        } catch (error) {
            return resp.status(201).json(errorMsg)
        }

        // https.get(CouchDbFetchDataOptions(params), async function (res) {
        //     var body = "";
        //     res.on('data', (data) => body += data.toString());
        //     res.on('end', async () => {
        //         var outPutData: { _id: string, _rev: string }[] = [];
        //         const _repoSite = await getSiteSyncRepository();
        //         try {
        //             var jsonBody: any = JSON.parse(body).rows;
        //             if (notEmpty(jsonBody)) {
        //                 var len = jsonBody.length;
        //                 for (let i = 0; i < len; i++) {
        //                     const row: any = jsonBody[i];
        //                     try {
        //                         const siteId = row.doc.contact.parent.parent._id;
        //                         const district = (await _repoSite.findOneBy({ id: siteId }))?.district;
        //                         const districtId = district ? district.id : undefined;
        //                         const zoneId = row.doc.contact.parent._id;
        //                         const chwId = row.doc.contact._id;
        //                         if (districtId && siteId && zoneId && chwId) {
        //                             if (siteId == reqSite && zoneId == reqZone && chwId == reqChw) {
        //                                 outPutData.push({ _id: row.doc._id, _rev: row.doc._rev });
        //                             }
        //                         }
        //                     } catch (error: any) {
        //                     }
        //                 }
        //             }
        //         } catch (err: any) {
        //             return resp.status(201).json(errorMsg);
        //         }
        //         return resp.status(200).json({ status: 200, data: outPutData });
        //     });
        //     process.on('uncaughtException', (err: any) => resp.status(201).json(errorMsg));
        //     res.on('error', (err: any) => resp.status(201).json(errorMsg));
        // });
    } else {
        return resp.status(resp.statusCode).json({ status: 200, data: "You dont'provide a valide parametters" })
    }
    // if (req.body.delete_one == true && req.body.dataId) {
    //     url = `https://${CHT_HOST}:${Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT}/medic/${req.body.dataId}`;
    // } else {
    //     url = (CouchDbFetchDataOptions(params) as any).url;
    // }

    // await fetch(url, {
    //     method: 'GET',
    //     headers: couchDbHeaders
    // })
    //     .then((response: any) => response.json())
    //     .then(async (jsonDatas: any[]) => {
    //         await deleteFromCouchDb(jsonDatas);
    //     })
    //     .catch((err: any) => {
    //         console.log(err)
    //     });
}

export async function deleteFromCouchDb(req: Request, res: Response, next: NextFunction) {
    var todelete: { _deleted: boolean, _id: string, _rev: string }[] = req.body.array_data_to_delete;
    var reqType = req.body.type;
    var allIds: string[] = [];

    for (let i = 0; i < todelete.length; i++) {
        const ids = todelete[i];
        allIds.push(ids._id);
    }

    if (todelete.length > 0 && allIds.length > 0 && reqType) {
        request({
            url: `https://${CHT_HOST}:${Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT}/medic/_bulk_docs`,
            method: 'POST',
            body: JSON.stringify({ "docs": todelete }),
            headers: httpHeaders()
        }, async function (err: any, response: any, body: any) {
            if (err) {
                return res.status(201).json({ status: 201, data: err });
            } else {
                if (reqType == 'data') {
                    const _repoData = await getChwsDataSyncRepository();
                    _repoData.delete({ id: In(allIds) });
                } else if (reqType == 'patients') {
                    const _repoPatient = await getPatientSyncRepository();
                    _repoPatient.delete({ id: In(allIds) });
                } else if (reqType == 'families') {
                    const _repoFamily = await getFamilySyncRepository();
                    _repoFamily.delete({ id: In(allIds) });
                }
                return res.status(200).json({ status: 200, data: body })
            }
        });
    } else {
        return res.status(201).json({ status: 201, data: 'No Data Provided' });
    }
}

async function updateChwsZone(chwId: string, zoneId: any) {
    try {
        const _repo = await getChwsSyncRepository();
        const chw = await _repo.findOneBy({ id: chwId });
        if (chw) { 
            chw.zone = zoneId;
            await _repo.save(chw);
            return true;
        }
    } catch (err: any) {}
    return false;
}

export async function updateUserFacilityIdAndContactPlace(req: Request, res: Response, next: NextFunction) {
    // const req_params: ChwUserParams = req.body;  

    try {
        const { code, parent, contact, new_parent, } = req.body;

        

        const _repo = await getCouchDbUsersSyncRepository();

        const user = await _repo.findOneBy({ type: 'chw', role: 'chw', code: code, place: parent, contact: contact });

        if (user) {
            // start updating facility_id
            return request({
                url: `https://${CHT_HOST}:${Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT}/api/v1/users/${user.username}`,
                method: 'POST',
                body: JSON.stringify({ "place": new_parent }),
                headers: httpHeaders()
            }, function (error: any, response: any, body: any) {
                if (error) return res.status(201).json({ status: 201, message: 'Error Found!' });
                request({
                    url: `https://${CHT_HOST}:${Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT}/medic/${user.contact}`,
                    method: 'GET',
                    headers: httpHeaders()
                }, function (error: any, response: any, body: any) {
                    try {
                        if (error) return res.status(201).json({ status: 201, message: 'Error Found!' });
                        const data = JSON.parse(body);
                        data.parent._id = new_parent;

                        // start updating Contact Place Informations
                        request({
                            url: `https://${CHT_HOST}:${Consts.isProdEnv ? PROD_CHT_PORT : DEV_CHT_PORT}/api/v1/people`,
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: httpHeaders()
                        }, async function (error: any, response: any, body: any) {
                            try {
                                if (error) return res.status(201).json({ status: 201, message: 'Error Found!' });
                                const update = await updateChwsZone(contact, new_parent);
                                if (update) {
                                    user.place = new_parent;
                                    await _repo.save(user);
                                    return res.status(200).json({ status: 200, message: "Vous avez changé la zone de l'ASC avec succes!" });
                                } else {
                                    return res.status(201).json({ status: 201, message: "Erruer trouvée, Contacter immédiatement l'administrateur!" });
                                }
                            } catch (err: any) {
                                return res.status(500).json({ status: 500, message: err.toString() });
                            }
                        });
                    } catch (err: any) {
                        return res.status(500).json({ status: 500, message: err.toString() });
                    }
                });
            });
        } else {
            return res.status(201).json({ status: 201, message: "Pas d'ASC trouvé pour procéder à l'opération, Réessayer !" });
        }
    } catch (err: any) {
        return res.status(500).json({ status: 500, message: err.toString() });
    }
}


