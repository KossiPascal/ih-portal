// // setCookie("kossi", '{"organisationUnits":[{ "name":"Développement","id":"OrrsWJQHqxS" },{ "name":"3ASC","id":"leZHVB6LmDV" }]}', 3);

// import { User } from "../entity/User";
// import { httpHeaders, logNginx } from "./functions";

// const fetch = require('node-fetch')

// export function getBaseUrl() {
// 	return "https://dhis2.integratehealth.org/dhis/api/";
// }

// export async function getMe(dhisuserAuthorization: string): Promise<User> {
// 	try {
// 	  const option = {
// 		cache: 'no-cache',
// 		mode: 'cors',
// 		credentials: 'include',
// 		referrerPolicy: 'no-referrer',
// 		method: 'GET',
// 		headers: httpHeaders('Basic ' + dhisuserAuthorization, false),
// 	  };
  
// 	  const response = await fetch(getBaseUrl() + 'me', option);
// 	  const res = await response.json();
  
// 	  const userFound = new User();
  
// 	  if (res.userCredentials) {
// 		const user = res.userCredentials;
  
// 		if (user.userRoles) {
// 		  const allUserRole = user.userRoles.map((item: { id: string }) => item.id);
// 		  userFound.roles = allUserRole;
// 		}
  
// 		userFound.id = user.id;
// 		userFound.username = user.username;
// 		userFound.fullname = user.name;
// 		userFound.isActive = !user.disabled == true;
  
// 		if (res.userGroups) {
// 		  userFound.groups = res.userGroups.map((item: { id: string }) => item.id);
// 		}
// 	  }
  
// 	  return userFound;
// 	} catch (err) {
// 	  logNginx(err);
// 	  throw err; // Rethrow the error to indicate failure
// 	}
//   }
  

// export async function userLoginStatus(dhisuserAuthorization: string) {
// 	return await fetch(getBaseUrl(), {
// 		method: 'GET',
// 		headers: httpHeaders('Basic ' + dhisuserAuthorization)
// 	})
// 		.then((res: any) => true)
// 		.catch((err: any) => false);

// }

// // export function setCookie(res: Response, cname: string, cvalue: any, exdays = 1) {
// // 	var expires = new Date();
// // 	expires.setTime(expires.getTime() + (exdays * 24 * 60 * 60 * 1000));
// // 	res.cookie(cname, cvalue, {
// // 		maxAge: 5000, // would expire after 15 minutes
// // 		httpOnly: true, // The cookie only accessible by the web server
// // 		// signed: true, // Indicates if the cookie should be signed
// // 		expires: expires,// expires works the same as the maxAge
// // 		secure: true,
// // 		sameSite: 'lax',
// // 		path: '/'
// // 	});
// // }

// // export function getCookie(req: Request, cname: any, all: boolean = false) {
// // 	if (all) return req.cookies;
// // 	return req.cookies[`${cname}`];
// // }

// // export function eraseCookie(res: Response, name: string) {
// // 	res.clearCookie(name)
// // }