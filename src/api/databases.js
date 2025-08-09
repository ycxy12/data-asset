import http from '@/utils/request'

/**
 * @name 公告接口-外部数据源 API
 * @description 平台字段相关的 API 接口
 */

// 外部数据源 - 数据库
export function getDatabases({ sourceAlias }) {
    return http.get(`/api/v1/${sourceAlias}/databases`)
}

// 外部数据源 - 数据库中的所有表
export function getTablesInDatabases({ sourceAlias, dbName }) {
    return http.get(`/api/v1/${sourceAlias}/databases/${dbName}/tables`)
}

// 外部数据源 - 数据库中的指定表的所有字段
export function getColumnsInTables({ sourceAlias, dbName, tableName }) {
    return http.get(`/api/v1/${sourceAlias}/databases/${dbName}/tables/${tableName}/columns`)
}

// 外部数据源 - 数据库中的指定表的所有字段
export function getSamples(params) {
    return http.post('/api/v1/field/samples', params)
}
