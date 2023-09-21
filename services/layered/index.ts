
import { getDbPool } from "/opt/nodejs/db";

module.exports.handler = async (event: any) => {
    const appConfig = {
        PGUSER: process.env.PGUSER || 'postgres',
        PGHOST: process.env.PGHOST || 'localhost',
        PGDATABASE: process.env.PGDATABASE || 'postgres',
        PGPASSWORD: process.env.PGPASSWORD || 'postgres',
        PGPORT: process.env.PGPORT || '5432',
    }
    const { isNewPool } = await getDbPool(appConfig);

    return {
        statusCode: 200,
        body: JSON.stringify({
        message: 'Hello from Research AWS Lambda!',
        isNewPool,
        }, null, 2),
    };
};
