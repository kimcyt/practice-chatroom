const mongo = require("mongoose");
const Schema = mongo.Schema;
const Users = new Schema({
    userId:{
        type: String,
        required:true,
        unique:true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true,
        default: "./user_icons/default.png"
    },
    onLogin: {
        type: Boolean,
        default: false
    }
});

Users.statics.findUser = async function (userId) {
    return this.findOne({userId: userId}, (err, doc) => {
        if (err)
            throw err;
        return doc;
    });
};

Users.statics.testUserName = async function(username){
    return this.findOne({username: username}, (err, doc) => {
        if (err)
            throw err;
        return doc;
    });
};

Users.statics.addUser = async function(userId, username, password){
    try{
        let newUser = new this({userId, username, password});
        await newUser.save();
        return newUser;
    } catch (e) {
        throw e;
    }
};

Users.statics.updateIcon = async function(userId, path){
    this.update({userId: userId}, {$set: {icon: path}}, function (err) {
        if(err)
            throw err;
    })
};


//
// Users.statics.logUser = async function(userId, logged){
//     console.log("------------changing login state to", logged);
//     await this.update({userId: userId}, {$set: {onLogin:logged}});
// };

Users.statics.userVerified = async function (user, password) {
    try {
        console.log(user, password);
        return (user && password === user["password"]);
    } catch (e) {
        throw e;
    }

};

module.exports = mongo.model("users", Users);