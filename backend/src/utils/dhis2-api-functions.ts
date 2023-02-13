// setCookie("kossi", '{"organisationUnits":[{ "name":"Développement","id":"OrrsWJQHqxS" },{ "name":"3ASC","id":"leZHVB6LmDV" }]}', 3);

import { Request, Response } from "express";
import { User } from "../entity/User";
import { httpHeaders } from "./functions";

const fetch = require('node-fetch')

export function getBaseUrl() {
	return "https://dhis2.integratehealth.org/dhis/api/";
}

export async function getMe(dhisuserAuthorization: string): Promise<User> {
	var userFound = new User();
	var option = {
		cache: 'no-cache',
		mode: "cors",
		credentials: "include",
		referrerPolicy: 'no-referrer',
		method: 'GET',
		headers: httpHeaders(dhisuserAuthorization, false)
	};


	await fetch(getBaseUrl() + "me", option)
		.then((response: any) => response.json())
		.then(async (res: any) => {
			try {
				var allUserRole = [];
			if (res.hasOwnProperty('userCredentials')) {
				const user = res["userCredentials"];

				if (user.hasOwnProperty('userRoles')) {
					for (let item in user["userRoles"]) {
						if (user["userRoles"][item].hasOwnProperty("id")) {
							allUserRole.push(user["userRoles"][item]["id"]);
						}
					}
				}

				userFound.id = user["id"];
				userFound.username = user["username"];
				userFound.fullname = user["name"];
				userFound.isActive = user["disabled"] == false;
				userFound.roles = allUserRole;
			}
			} catch (err) {
				console.log(err);
			}
		}).catch((err: any) => {
			console.log(err);
		});

	return userFound;

}

export async function userLoginStatus(dhisuserAuthorization: string) {
	return await fetch(getBaseUrl(), {
		method: 'GET',
		headers: httpHeaders(dhisuserAuthorization)
	})
		.then((res: any) => true)
		.catch((err: any) => false);

}

// export function setCookie(res: Response, cname: string, cvalue: any, exdays = 1) {
// 	var expires = new Date();
// 	expires.setTime(expires.getTime() + (exdays * 24 * 60 * 60 * 1000));
// 	res.cookie(cname, cvalue, {
// 		maxAge: 5000, // would expire after 15 minutes
// 		httpOnly: true, // The cookie only accessible by the web server
// 		// signed: true, // Indicates if the cookie should be signed
// 		expires: expires,// expires works the same as the maxAge
// 		secure: true,
// 		sameSite: 'lax',
// 		path: '/'
// 	});
// }

// export function getCookie(req: Request, cname: any, all: boolean = false) {
// 	if (all) return req.cookies;
// 	return req.cookies[`${cname}`];
// }

// export function eraseCookie(res: Response, name: string) {
// 	res.clearCookie(name)
// }