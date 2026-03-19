const { PayOS } = require('@payos/node');

let cachedClient = null;

function getPayOSClient() {
    if (cachedClient) return cachedClient;

    cachedClient = new PayOS({
        clientId: process.env.CLIENT_ID,
        apiKey: process.env.API_KEY,
        checksumKey: process.env.CHECKSUM_KEY,
    });

    return cachedClient;
}

module.exports = {
    getPayOSClient,
};
