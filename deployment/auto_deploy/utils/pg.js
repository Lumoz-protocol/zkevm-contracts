const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { Client } = require('pg');

const pgConnect = async (connectionString) => {
    const client = new Client({ connectionString });

    /*
     *   client.connect().then(() => console.log('connected'))
     *   .catch((err) => {
     *     throw new Error('pg connection error: ' + err.stack);
     *   });
     */
    try {
        await client.connect();
    } catch (err) {
        throw new Error(`pg connection error: ${err.stack}`);
    }

    console.log('pg connected');
    return client;
};

module.exports = {
    pgConnect,
};
