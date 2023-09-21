import { createPool, DatabasePool } from "slonik"
const appConfig = {
    PGUSER: process.env.PGUSER || 'postgres',
    PGHOST: process.env.PGHOST || 'localhost',
    PGDATABASE: process.env.PGDATABASE || 'postgres',
    PGPASSWORD: process.env.PGPASSWORD || 'postgres',
    PGPORT: process.env.PGPORT || '5432',
}
let dbPool: DatabasePool | null = null

const getConnectionString = () => {
    const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } = appConfig
    return `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}`
}

const getDbPool = async () => {
    let isNewPool = false
    if (!dbPool) {
        isNewPool = true
        dbPool = await createPool(getConnectionString())
    }
    return {dbPool, isNewPool}
}
export { getDbPool }
