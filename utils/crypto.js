const crypto =  require('crypto');
const err = require("../configs/errors");

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function parseUser(users, url){
    if(!url)
        throw new Error(err.Invalid_Url_Error);
}

module.exports = {
    encrypt: aesEncrypt,
    decrept: aesDecrypt,
    parseUser: parseUser
};