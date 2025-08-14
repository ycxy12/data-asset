import { reactive, watchEffect, toRefs, toRaw } from 'vue'
import { getDatabases, getTablesInDatabases, getColumnsInTables } from '@/api/databases'

export const useSource = (visible, form) => {
    const state = reactive({
        databases: [],
        tableOptions: [],
        columnOptions: [],
    })

    //数据发生变化
    const reset = (value, type) => {
        if (type === 'dbName') {
            state.tableOptions = []
            state.columnOptions = []
        }
        if (type === 'tableName') {
            form.fieldName = undefined
            state.columnOptions = []
        }
    }

    /** 数据级联加载 */
    watchEffect(async () => {
        if (visible.value && form.sourceAlias) {
            const { data } = await getDatabases(toRaw(form))
            state.databases = data.map((item) => ({ value: item, label: item }))
        }
    })

    watchEffect(async () => {
        if (form.dbName) {
            const { data } = await getTablesInDatabases(toRaw(form))
            state.tableOptions = data.map((item) => ({
                label: item.tableName,
                value: item.tableName,
            }))
        }
    })

    watchEffect(async () => {
        if (form.dbName && form.tableName) {
            const { data } = await getColumnsInTables(toRaw(form))
            state.columnOptions = data.map((item) => ({
                label: item.columnName,
                value: item.columnName,
                dataType: item.dataType,
            }))
        }
    })
    return { ...toRefs(state), reset }
}
