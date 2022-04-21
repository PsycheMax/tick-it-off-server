require('dotenv').config();
const mongoose = require('mongoose');
const { errorLogging } = require('../middleware/logging');

const connectionString =
    `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_ADDRESS_PORT}/TaskManager?authSource=${process.env.MONGODB_ADMIN_DB}&readPreference=primary`;

async function connect() {
    await mongoose.connect(connectionString, {
        // OPTIONS, EVENTUALLY
    })
        .then(result => { /*console.log(result); */ })
        .catch(err => {
            errorLogging(err, "DBManager - connectFunction");
            console.log("Cannot connect because of " + err)
        });
}
connect().then(() => { console.log("Connected!") });

const db = mongoose.connection;
db.on('error', err => {
    errorLogging(err, "DBManager - on-error");
    console.log("Connection error - " + err)
});
db.once('open', () => {
    console.log("DB Connection successful!")
});

db.on('disconnected', () => {
    connect()
        .then(() => {
            console.log("Connection is up again.")
        })
        .catch((error) => {
            errorLogging(err, "DB Manager - Disconnected");
            console.error('The DB cannot be reached');
            console.log(error);
        })
})

module.exports.connect = connect;
module.exports.mongoose = mongoose;
module.exports = db;