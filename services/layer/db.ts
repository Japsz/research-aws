import { createPool, DatabasePool } from "slonik"

interface AppConfig {
    PGUSER: string,
    PGHOST: string,
    PGDATABASE: string,
    PGPASSWORD: string,
    PGPORT: string,
}

let dbPool: Promise<DatabasePool> | null = null

const getConnectionString = (appConfig: AppConfig) => {
    const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT } = appConfig
    return `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}`
}

const getDbPool = async (appConfig: AppConfig) => {
    let isNewPool = false
    if (!dbPool) {
        isNewPool = true
        dbPool = createPool(getConnectionString(appConfig))
    }
    return {dbPool, isNewPool}
}
export { getDbPool }
