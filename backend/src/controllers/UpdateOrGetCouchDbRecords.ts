import { CouchDbFetchData } from "../utils/appInterface";
import { Consts } from "../utils/constantes";
import { date_to_milisecond } from "../utils/date-utils";
import { CouchDbFetchDataOptions, sslFolder } from "../utils/functions";
import https from 'https';
const axios = require('axios');

require('dotenv').config({ path: sslFolder('.ih-env') });
const { CHT_USER, CHT_PASS, CHT_PROD_HOST, CHT_DEV_HOST } = process.env;

const databaseName = 'medic';
const couchDbUrl = `${Consts.isProdEnv ? CHT_PROD_HOST : CHT_DEV_HOST}`;
const username = CHT_USER;
const password = CHT_PASS;


async function getAllDocumentsWithAxios() {
    try {
        const startKey = date_to_milisecond('2023-12-21', true);
        const endKey = date_to_milisecond('2024-03-20', false);
        
        var couchArg = ['include_docs=true', 'returnDocs=true', 'attachments=false', 'binary=false', 'reduce=false', 'descending=true', 'key=['+startKey+']','endkey=['+endKey+']'];
        const response = await axios.get(`${couchDbUrl}/${databaseName}/_design/medic-client/_view/reports_by_date?${couchArg.join('&')}`, {
            auth: {
                username,
                password
            }
        });
        var rows: any = response.data.rows;
        prociedTraitement(rows)


    } catch (error: any) {
        console.error('Error retrieving documents:', error.message);
        throw error;
    }
}



export async function getAllDocuments() {

    const startKey = date_to_milisecond('2023-12-21', true);
    const endKey = date_to_milisecond('2024-03-20', false);

    var params: CouchDbFetchData = {
        viewName: 'reports_by_date',
        startKey: [startKey],
        endKey: [endKey],
    };

    try {
        https.get(CouchDbFetchDataOptions(params), async function (res) {
            var body = "";
            res.on('data', (data) => {
                body += data.toString();
            });
            res.on('end', async () => {
                try {
                    var jsonBody: any = JSON.parse(body).rows;
                    prociedTraitement(jsonBody)
                } catch (err: any) {
                    //
                }
            });
            process.on('uncaughtException', (err: any) => {
                //
            });
            res.on('error', (err: any) => {
                //
            });
        });
    } catch (err: any) {
        //
    }
}



async function prociedTraitement(jsonBody:any){
    if (jsonBody !== undefined && jsonBody !== '' && jsonBody !== null) {
        var len = jsonBody.length;

        for (let i = 0; i < len; i++) {
            const row: any = jsonBody[i];
            if (row.doc.hasOwnProperty('form') && row.doc.hasOwnProperty('fields')) {

                if (row.doc.form == "drug_quantities" && row.doc.fields.hasOwnProperty("h_drug_quantities") && row.doc.fields.hasOwnProperty("b_drug_quantities")) {
                    
                    const activity_date = row.doc.fields.h_drug_quantities.activity_date;
                    if (activity_date && activity_date != '') {
                        const date: Date = new Date(activity_date);
                        const d = date.getDate();
                        var month = date.getUTCMonth()+1;
                        if (d > 24 && d < 31) month = month+1;

                        row.doc.fields.h_drug_quantities["med_year_type"] = 'current';
                        row.doc.fields.h_drug_quantities["med_month"] = `${month < 10 ? '0' + month : month}`;;
                        delete row.doc.fields.h_drug_quantities.activity_date;

                        // console.log(row.doc._id)
                        await updateDocument(row.doc._id, row.doc);

                        
                    } else {
                        if (!(row.doc.fields.h_drug_quantities.med_year_type)) {
                            row.doc.fields.h_drug_quantities["med_year_type"] = 'current';
                            await updateDocument(row.doc._id, row.doc);
                        }
                    }
                    

                } else if (row.doc.form == "drug_movements" && row.doc.fields.hasOwnProperty("h_drug_movements") && row.doc.fields.hasOwnProperty("b_drug_movements")) {
                    const activity_date = row.doc.fields.h_drug_movements.activity_date;
                    if (activity_date && activity_date != '') {
                        const date: Date = new Date(activity_date);
                        const d = date.getDate();
                        var month = date.getUTCMonth()+1;
                        if (d > 24 && d < 31) month = month+1;

                        row.doc.fields.h_drug_movements["med_year_type"] = 'current';
                        row.doc.fields.h_drug_movements["med_month"] = `${month < 10 ? '0' + month : month}`;
                        delete row.doc.fields.h_drug_movements.activity_date;

                        // console.log(row.doc._id)
                        await updateDocument(row.doc._id, row.doc);
                        
                    } else {
                        if (!(row.doc.fields.h_drug_movements.med_year_type)) {
                            row.doc.fields.h_drug_movements["med_year_type"] = 'current';
                            await updateDocument(row.doc._id, row.doc);
                        }
                    }
                }
            }
        }

        console.log('FINISHED');

    } else {
    }
}

// Function to retrieve the current version of the document
async function getDocument(documentId:string) {
    try {
        const response = await axios.get(`${couchDbUrl}/${databaseName}/${documentId}`, {
            auth: {
                username,
                password
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error retrieving document:', error.message);
        throw error;
    }
}
// Function to update the document
async function updateDocument(documentId:string, updatedDocument: any) {
    try {
        const response = await axios.put(`${couchDbUrl}/${databaseName}/${documentId}`, updatedDocument, {
            auth: {
                username,
                password
            }
        });
        console.log('Document updated:', documentId);
    } catch (error: any) {
        console.error('Error updating document:', error.message);
        throw error;
    }
}

async function bulkUpdateDocuments(docs:any[]) {
    try {
        const response = await axios.post(`${couchDbUrl}/${databaseName}/_bulk_docs`, { docs }, {
            auth: {
                username,
                password
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error:any) {
        console.error('Error performing bulk update:', error.message);
        throw error;
    }
}

// Usage example
export async function GetDocumentUpdateDocument() {
    try {

        await getAllDocuments()
        // Retrieve the current version of the document
        // const currentDocument = await getDocument();

        // console.log(currentDocument)

        // Make changes to the document
        // currentDocument.updatedField = 'new value';

        // // Update the document
        // await updateDocument(currentDocument);
    } catch (error: any) {
        console.error('An error occurred:', error.message);
    }
}


