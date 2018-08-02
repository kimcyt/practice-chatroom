const index = require("./index"); //一个包含了url处理函数的object
const router = require("koa-router")();

function addMapping(router, index) {
    for (let url in index){
        if(url==="/signup/" ||"/login/" || "/updateUsername/")
            router.post(url, index[url]);
        else
            router.get(url, index[url]);
    }
}

module.exports = function(){
    //router.prefix("/api");
    addMapping(router, index);
    return router.routes();
};