const Koa = require("koa");
const WebSocket = require("ws");
//const crypto = require("./utils/crypto");
const tools = require("./utils/tools");
const mongoose = require("mongoose");
const serve = require("koa-static");
const controller = require("./controllers/controller");
const logger = require('koa-logger');
const settings = require("./configs/consts");
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const Users = require("./models/users");
const path = require("path");
const app = new Koa();
const MongoStore = require('./utils/MongoStore');
let userLogs = {};
let onlineUsers = [];

mongoose.connect(settings.database, { useNewUrlParser: true }).then(() => {
    console.log('db connected');
    // return Setting.getSetting().then(setting => {
    //     if (setting) config.setting = setting;
    // })
}).then(()=>{
    app.keys = ["this_is_my_secret"];
    app.use(logger());
    app.use(session({
        key: "big:face",
        maxAge: 30*60*1000,
        store: MongoStore
    }, app));
    app.use(bodyParser());
    app.use(controller());
    app.use(serve(path.resolve(__dirname, "static")));

    let server = app.listen(settings.port);
    let wsServer = new WebSocket.Server({server});

    wsServer.on("connection", (ws, req)=>{
        ws.wss = wsServer;  // // 绑定WebSocketServer对象:
        //--todo: if userId is already online, reject the connection

        ws.onmessage = async function (message) {
            if (message) {
                let parsedMessage = JSON.parse(message.data);
                let userId = parsedMessage.userId;
                let user = await Users.findUser(userId);

                if (parsedMessage.type === "join"){
                    ws.userId = userId;
                    console.log(".......join received");
                    //if the user is new, tie connection to the user
                    await Users.logUser(userId, true);
                    if(onlineUsers.indexOf(userId) === -1){
                        onlineUsers.push(userId);

                    }
                    //update user icon and username everytime new message received
                    userLogs[userId] = {userId: userId, username: user.username, icon: user.icon, online: true};
                }

                let msg = tools.formatMsg(
                    convertToList(userLogs), parsedMessage.type, user.username, user.userId, parsedMessage.data);
                this.wss.broadcast(JSON.stringify(msg));
            }
        };

        ws.onclose = async function () {
            console.log("------connection is closing", ws.userId);
            //triggered when client refreshes page or closing the tab
            try{
                let user = await Users.findUser(ws.userId);
                await Users.logUser(user.userId, false);
                removeFromOnlineUsers(user.userId);
                userLogs[user.userId].online = false;
                let msg = tools.formatMsg(convertToList(userLogs), "left", user.username, user.userId, " left the chat");
                this.wss.broadcast(JSON.stringify(msg));
            } catch (e) {
                console.log(e);
            }

        }
    });

    wsServer.broadcast = function (data) {
        this.clients.forEach(function (client) { //clients are all the ws objects that ties to it
            client.send(data);
        })
    };

}).catch((err)=>{
    console.log(err);
});

function removeFromOnlineUsers(left){
    // onlineUsers =  onlineUsers.filter((user) => {
    //     return user.userId !== left;
    // });
    onlineUsers = onlineUsers.filter((user)=>{
        return user.userId !== left;
    })
}

function convertToList(users) {
    let userList = [];
    for(let userId in users){
        userList.push(users[userId]);
    }
    return userList;
}



//WebSocketServer会首先判断请求是不是WS请求，如果是，它将处理该请求，如果不是，该请求仍由koa处理
//所以，WS请求会直接由WebSocketServer处理，它根本不会经过koa，koa的任何middleware都没有机会处理该请求。





// app.use(async (ctx, next) =>{
//     ctx.state.user = crypto.parseUser(ctx.cookies.get("username") || "");
//     await next();
// });

// every connection from a client returns its own webSocket object
