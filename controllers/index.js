/*
bugs: user leave/rejoin the chat when refresh/go to new page
all users in the chat use the same icon
after rename, new name appears as new member
 */

//session_id 存放在客户端cookie中
//id 为浏览器随机产生

const err = require("../configs/errors");
const Users = require("../models/users");
const tools = require("../utils/tools");


async function login(ctx, next) {
    let userInput = ctx.request.body;
    let response = {};
    let user = await Users.findUser(userInput.userId);
    if (!user) {
        response = {status: "error", errorMsg: "UserId does not exist. Please try again."};
    } else {
        //if user verified
        if (await Users.userVerified(user, userInput.password)) {
            let userInfo = {userId: user.userId, username: user.username, icon: user.icon};
            // console.log(ctx.request.headers);
            ctx.session = userInfo;
            response = {status: "ok", userInfo: userInfo, location: "main.html"};
        } else {
            response = {status: "error", errorMsg: "Invalid userId or password. Please try again or sign up."}
        }
    }
    ctx.body = JSON.stringify(response);
}


async function signUp(ctx, next) {
    let user = ctx.request.body;
    // let [userId, username, password] = tools.parseUser(ctx.url);
    let response = {};
    try {
        let userExist = await Users.findUser(user.userId);
        if(!userExist){
            //check whether username exists
            let userWithSameName = await Users.testUserName(user.username);
            if(userWithSameName){
                response.status = "error";
                response.errorMsg = "Username already taken, please try again."
            } else{
                await Users.addUser(user.userId, user.username, user.password);
                response.status = "ok";
                response.userInfo = {
                    userId: user.userId,
                    username: user.username,
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
    ctx.session = null;
    // ctx.session.destroy(function (err) {
    //     if(err){
    //         console.log("logout failed:", err);
    //         return;
    //     }
    //     ctx.cookies.clearAll();
    //     // ctx.redirect("login.html");
    // });

}

async function logIn(ctx, next){
    let [userId] = tools.parseUser(ctx.url);
    if(userId)
        Users.logUser(userId, true);
}

async function getUserInfo(ctx){
    ctx.response.body = JSON.stringify(ctx.session.user);
}

async function updateUsername(ctx){
    let userInput = ctx.request.body;
    let userId = ctx.session.userId;
    console.log("session", ctx.session);
    await Users.rename(userId, userInput.username);
    ctx.session.username = userInput.username;
    ctx.response.body = JSON.stringify({msg: "Username has been updated."});
}

async function updatePassword(ctx){
    let userInput = ctx.request.body;
    let userId = ctx.session.userId;
    let user =  await Users.findUser(userId);
    if (await Users.userVerified(user, userInput.oldPwd)){
        await Users.changePassword(userId, userInput.newPwd);
        ctx.response.body = JSON.stringify({msg:"Password has been updated."});
    } else{
        ctx.response.body = JSON.stringify({msg: "Old password does not match."});
    }
}

async function updateIcon(ctx){
    let data = ctx.request.body;
    let userId = ctx.session.userId;
    await Users.changeIcon(userId, data.newIcon);
    ctx.session.icon = data.newIcon;
    ctx.response.body = JSON.stringify({msg: "Icon has been updated."});
}


module.exports = {
    "/signup/": signUp,
    "/login/": login,
    "/logout/": logOut,
    "/logIn/": logIn,
    "/getUserInfo/": getUserInfo,
    "/updateUsername/": updateUsername,
    "/updatePassword/": updatePassword,
    "/updateIcon/": updateIcon
}