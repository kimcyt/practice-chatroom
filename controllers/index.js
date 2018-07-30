//session_id 存放在客户端cookie中
//id 为浏览器随机产生

const err = require("../configs/errors");
const Users = require("../models/users");
const tools = require("../utils/tools");
const url = require("url");
const formidable = require("formidable");
const fs = require("fs");


/*
response body = {
    status: "ok" / "error"
    cookie:
    errorMsg: "...."
    location: location html + cookie
}

 */

async function login(ctx, next) {
    let [userId, username, password] = tools.parseUser(ctx.url);
    let sess = ctx.session;
    let response = {};
    let user = await Users.findUser(userId);
    if(!user){
        response = {status: "error", errorMsg: "UserId does not exist. Please try again."};
    } else{
        //if user verified
        if(await Users.userVerified(user.userId, password)){
            sess.regenerateSession();
            sess.user = {userId: user.userId, username: user.username, icon: user.icon};
            response = {status: "ok"};
        } else{
            response = {status: "error", errorMsg: "Invalid userId or password. Please try again or sign up."}
        }
    }
    ctx.body = JSON.stringify(response);


    // let [userId, username, password] = tools.parseUser(ctx.url);
    // try{
    //     let user = await Users.findUser(userId);
    //     if(user){
    //         //session checking
    //         //if the session has not expired
    //         if(ctx.session.isLogin){
    //             // let username = ctx.session.username;
    //             // let userId = ctx.session.userId;
    //             response.status = "ok";
    //             return ctx.redirect("main.html");
    //         } else{
    //             if(!await Users.userVerified(user, password)){
    //                 response.errorMsg = "Invalid userId or password. Please try again or sign up.";
    //                 // } else if(isLoggedIn){
    //                 //     response.errorMsg = "The account was already logged in. Please log out the account and try again.";
    //             } else{
    //                 // await Users.logUser(userId, true);
    //                 user = await Users.findUser(userId);
    //                 // console.log("logged in", user["onLogin"]);
    //                 // let icon = user["icon"];
    //                 // let username = user["username"];
    //                 response.status = "ok";
    //                 // response.location = "main.html";
    //                 // response.userInfo = {
    //                 //     userId: userId,
    //                 //     username: username,
    //                 //     icon: icon
    //                 // }
    //                 //reset session
    //                 ctx.session.isLogin = true;
    //                 ctx.session.username= username;
    //                 ctx.session.userId = userId;
    //                 ctx.session.icon = user.icon;
    //             }
    //         }
    //         // let isLoggedIn = user["onLogin"];
    //
    //     } else {
    //
    //         response.errorMsg = "UserId does not exist. Please try again.";
    //     }
    //     ctx.response.body = JSON.stringify(response);
    //
    // } catch (e) {
    //     throw err;
    // }
}

async function signUp(ctx, next) {
    // let [userId, username, password] = tools.parseUser(ctx.url);
    let response = {};
    try {
        let user = await Users.findUser(ctx.req.body.userId);
        if(!user){
            //check whether username exists
            let userWithSameName = await Users.testUserName(username);
            if(userWithSameName){
                response.status = "error";
                response.errorMsg = "Username already taken, please try again."
            } else{
                await Users.addUser(userId, username, password);
                response.status = "ok";
                response.userInfo = {
                    userId: userId,
                    username: username,
                    icon: "./user_icons/default.png"
                }
                // ctx.cookies.set({"username": username});
            }
        } else{
            response.status = "error";
            response.errorMsg = "UserId already exists, please try again."
        }
        ctx.response.body = JSON.stringify(response);
    } catch (e) {
        throw e;
    }

}

async function logOut(ctx, next){
    // console.log("iam in logout!!!!!!!!" );
    // console.log("logging out");
    // let [userId] = tools.parseUser(ctx.url);
    // if(userId)
    //     Users.logUser(userId, false);
    ctx.req.session.destroy(function (err) {
        if(err){
            console.log("logout failed:", err);
            return;
        }
        ctx.cookies.clearAll();
        ctx.redirect("login.html");
    });

}

async function logIn(ctx, next){
    console.log("iam in logIn!!!!!!!!" );
    console.log("logging in");
    let [userId] = tools.parseUser(ctx.url);
    if(userId)
        Users.logUser(userId, true);
}

async function processFile(ctx){
    let [userId] = tools.parseUser(ctx.url);
    var form = new formidable.IncomingForm();
    form.parse(ctx.req, function (err, fields, files) {
        let temPath = files.filetoupload.path;
        let newPath = "C:/Users/PC1024/WebstormProjects/chatRoom/static/user_icons/" + files.filetoupload.name;
        fs.rename(temPath, newPath, function (err) {
            if(err)
                throw err;
        });
        Users.updateIcon(userId, "./user_icons/" + files.filetoupload.name);
    })
}

module.exports = {
    "/signup/": signUp,
    "/login/": login,
    "/logout/": logOut,
    "/logIn/": logIn,
    "/fileupload": processFile
};