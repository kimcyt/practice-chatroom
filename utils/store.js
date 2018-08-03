/*
without external store, by default sessions are stored in cookies, which are not secure, and have limited length
if the session contains big data, it will cause error
we can store the session content in external stores (Redis, MongoDB or other DBs)
by passing options.store with three methods (these need to be async functions):
this store saves the sessions locally, when the server is shut down, all saved sessions are gone.
Redis/DBs are better options
 */

const sessions = new Map();

function get(key) {
    return sessions.get(key);
}

function set(key, sess, maxAge) {
    sessions.set(key, sess);
}

function destroy(key) {
    sessions.delete(key);
}

module.exports = {
    get,
    set,
    destroy
};