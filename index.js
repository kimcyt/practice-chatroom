const mongoose = require("mongoose");
const settings = require("./configs/consts");
const tools = require("./utils/tools");
const Users = require("./models/users");
const app = require("./app");
const WebSocket = require("ws");

mongoose.connect(settings.database, { useNewUrlParser: true }).then(() => {
    console.log('db connected');

}).then(()=>{
    let server = app.listen(settings.port);
    let wsServer = new WebSocket.Server({server});
    wsServer.userLogs = {};
    wsServer.onlineUsers = [];
    wsServer.removeFromOnlineUsers = function (left) {
        this.onlineUsers = this.onlineUsers.filter((user)=>{
            return user.userId !== left;
        })
    };

    wsServer.on("connection", (ws)=>{
        ws.wss = wsServer;

        ws.onmessage = async function (message) {
            if (message) {
                let parsedMessage = JSON.parse(message.data);
                let userId = parsedMessage.userId;
                let user = await Users.findUser(userId);

                if (parsedMessage.type === "join"){
                    ws.userId = userId;
                    //if the user is new, tie connection to the user
                    await Users.logUser(userId, true);
                    if(this.wss.onlineUsers.indexOf(userId) === -1){
                        this.wss.onlineUsers.push(userId);
                    }
                    //update user icon and username everytime new message received
                    this.wss.userLogs[userId] = {userId: userId, username: user.username, icon: user.icon, online: true};
                }

                let msg = tools.formatMsg(
                    tools.convertToList(this.wss.userLogs), parsedMessage.type, user.username, user.userId, parsedMessage.data);
                this.wss.broadcast(JSON.stringify(msg));
            }
        };

        ws.onclose = async function () {
            console.log("------connection is closing", ws.userId);
            try{
                let user = await Users.findUser(ws.userId);
                await Users.logUser(user.userId, false);
                this.wss.removeFromOnlineUsers(user.userId);
                this.wss.userLogs[user.userId].online = false;
                let msg = tools.formatMsg(tools.convertToList(this.wss.userLogs), "left", user.username, user.userId, " left the chat");
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
}).catch((err) => {
    console.log('process exit: ', err);
    process.exit(1);
});


