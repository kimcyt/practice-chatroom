const url = require("url");


function formatMessage(users, type, username, userId, data) {
    let msg = {};
    msg.userList = users || "";
    msg.type = type || "";
    if(type==="join")
        msg.data= {userId: userId, data: username + data};
    else
        msg.data = {userId: userId, data: data};
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