
import { getDbPool } from "./db/db";

module.exports.handler = async (event: any) => {
    console.log('event', event);
    const { isNewPool } = await getDbPool();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
        message: 'Hello from Research AWS Lambda!',
        isNewPool,
        }, null, 2),
    };
};
