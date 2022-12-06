export function Utils(): {expiredIn: string,secretOrPrivateKey: string} {
    return {
        expiredIn: '3600',
        secretOrPrivateKey: 'kossi-secretfortoken',
    }
}




// set it in an HTTP Only + Secure Cookie
// res.cookie("SESSIONID", token, { httpOnly: true, secure: true });


// import * as fs from "fs";
// const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
// const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {algorithm: 'RS256', expiresIn: 120,subject: userId}