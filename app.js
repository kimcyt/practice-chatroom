const Koa = require("koa");
const serve = require("koa-static");
const controller = require("./controllers/controller");
const logger = require('koa-logger');
const session = require("koa-session");
const bodyParser = require("koa-bodyparser");
const path = require("path");
const app = new Koa();
const MongoStore = require('./utils/MongoStore');

app.keys = ["this_is_my_secret"];
app.use(logger());
app.use(session({
    key: "big:face",
    maxAge: 30 * 60 * 1000,
    store: MongoStore
}, app));
app.use(bodyParser());
app.use(controller());
app.use(serve(path.resolve(__dirname, "static")));

module.exports = app;




// app.use(async (ctx, next) =>{
//     ctx.state.user = crypto.parseUser(ctx.cookies.get("username") || "");
//     await next();
// });

// every connection from a client returns its own webSocket object
