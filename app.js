const Koa = require("koa");
const WebSocket = require("ws");
//const crypto = require("./utils/crypto");
const tools = require("./utils/tools");
const mongoose = require("mongoose");
const serve = require("koa-static");
const controller = require("./controllers/controller");
const logger = require('koa-logger');
const settings = require("./configs/consts");
const session = require("koa-generic-session");
const redisStore = require("koa-redis");
const path = require("path");
const app = new Koa();
const Users = require("./models/users");
let users = [];



mongoose.connect(settings.database, { useNewUrlParser: true }).then(() => {
    console.log('db connected');
    // return Setting.getSetting().then(setting => {
    //     if (setting) config.setting = setting;
    // })
}).then(()=>{
    app.use(logger());
    app.use(controller());
    app.use(serve(path.resolve(__dirname, "static")));
    app.keys = "this_is_my_secret";
    app.use(session({
        store: new redisStore(),
        ttl: 30*60*1000
        // cookie: {maxAge: 1000*60*30}
    }));
    let server = app.listen(settings.port);
    let wsServer = new WebSocket.Server({server});
    ///tie user list to server
    // wsServer.userLogs = [];
    //everytime refresh(receive join), when new connection is generated, add to user
    //everytime refresh/close tab, remove user
    wsServer.on("connection", (ws, req)=>{
        ws.wss = wsServer;  // // 绑定WebSocketServer对象:


        ws.onmessage = function (message) {
            if (message) {
                console.log('received message; ', message.data);
                let parsedMessage = JSON.parse(message.data);

                let username = parsedMessage.user;

                if (parsedMessage.type === "join" && users.indexOf(username) === -1){
                    //if the message is from a new user, add to the list
                    console.log("new user");
                    // ws.userId = parsedMessage.userId;
                    users.push(username);
                }
                else if(parsedMessage.type === "left"){
                    console.log("left received");
                    removeFromList(username);
                }
                console.log("current users", users);
                // remove a user
                // broadcast to all users in the chat
                let msg = tools.formatMsg(users, parsedMessage.type, username, parsedMessage.data);
                this.wss.broadcast(JSON.stringify(msg));
            }
        };
        // ws.onopen = async function () {
        //     console.log("connection is opening-------");
        //     try{
        //         await Users.logUser(this.userId, true);
        //     } catch (e) {
        //         console.log(e);
        //     }
        //         //send to server
        // };
        // ws.onclose = async function () {
        //     console.log("------connection is closing");
        //     //triggered when client refreshes page or closing the tab
        //     try{
        //         removeFromList(ws.username);
        //         let msg = tools.formatMsg(ws.username, " left the chat");
        //         this.wss.broadcast(JSON.stringify(msg));
        //         // await Users.logUser(this.userId, false);
        //     } catch (e) {
        //         console.log(e);
        //     }
        //
        // }
    });

    wsServer.broadcast = function (data) {
        this.clients.forEach(function (client) { //clients are all the ws objects that ties to it
            client.send(data);
        })
    };

}).catch((err)=>{
    console.log(err);
});

function removeFromList(left) {
    users =  users.filter((user) => {
        return user !== left;
    })
}




//WebSocketServer会首先判断请求是不是WS请求，如果是，它将处理该请求，如果不是，该请求仍由koa处理
//所以，WS请求会直接由WebSocketServer处理，它根本不会经过koa，koa的任何middleware都没有机会处理该请求。





// app.use(async (ctx, next) =>{
//     ctx.state.user = crypto.parseUser(ctx.cookies.get("username") || "");
//     await next();
// });

// every connection from a client returns its own webSocket object
