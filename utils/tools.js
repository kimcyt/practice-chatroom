const url = require("url");


function formatMessage(users, type, user, data) {
    let msg = {};
    msg.users= users || "";
    msg.type = type || "";
    msg.user = user || "";
    if(type==="join" || type==="left")
        msg.data= user + data;
    else
        msg.data = user + " : " + data;
    return msg;
}

function parseUrl(reqUrl){
    let parsedUrl = url.parse(reqUrl, {parseQueryString: true});
    let userId = parsedUrl["query"]["userId"] || "";
    let username = parsedUrl["query"]["username"] || "";
    let password = parsedUrl["query"]["password"] || "";
    return [userId, username, password];
}

module.exports = {
    formatMsg: formatMessage,
    parseUser: parseUrl
};