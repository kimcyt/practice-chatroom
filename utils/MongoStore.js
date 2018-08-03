const Sessions = require("../models/sessions");

async function get(key) {
    // console.log('get', key);
    return await Sessions.getSession(key);
}

async function set(key, sess, maxAge) {
    // console.log('set', key, sess);
    await Sessions.setSession(key, sess);
}

async function destroy(key) {
    // console.log('destroy', key);
    await Sessions.destroySession(key);
}

module.exports = {
    get,
    set,
    destroy
};