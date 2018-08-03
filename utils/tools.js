const url = require("url");


function formatMessage(users, type, user, icon, data) {
    let msg = {};
    let defaultIcon = "user_icons/default.png";
    msg.userList = users || "";
    msg.type = type || "";
    msg.user = user || "";
    if(type==="join" || type==="left")
        msg.data= {icon: icon || defaultIcon, data: user + data};
    else
        msg.data = {icon: icon || defaultIcon, data: data};
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