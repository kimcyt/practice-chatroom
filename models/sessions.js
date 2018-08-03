const mongo = require("mongoose");
const Schema = mongo.Schema;
const Sessions = new Schema({

    sid: {
        type: String,
        required: true,
        unique: true
    },

    session: {
        type: Object,
        required: true,
        default: {}
    }

});

Sessions.statics.getSession = async function(key){
    return this.findOne({sid: key}).then(doc=>{
        if (doc) {
            return doc.session;
        }
        return {};
    });
};

Sessions.statics.setSession = async function(key, sess){
    try{
        // let session = await this.findOne({sid: key});
        // if(session)
        //     this.destroySession(key);
        // let newSession = new this(sess);
        // await newSession.save()
        await this.updateOne({sid: key}, {$set: {session:sess}}, {upsert: true});
    } catch (e) {
        throw e;
    }
};

Sessions.statics.destroySession = async function(key){
    return this.deleteOne({ sid: key }, (err, doc)=>{
        if(err)
            throw err;
    })
};


module.exports = mongo.model("sessions", Sessions);

