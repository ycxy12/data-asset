<script setup>
import { ref, reactive, toRaw, computed, useTemplateRef } from 'vue'
import { addDomain, updateDomain, treeDomain } from '@/api/area'
import { FieldSource, CommonDict } from '@/utils/dict'
import { addStandardField, updateStandardField, getStandardFieldById } from '@/api/platform'
import { getSamples } from '@/api/databases'
import { getDictByFieldName } from '@/api/dict'
import { Search } from '@element-plus/icons-vue'
import { useSource } from './hooks/useSource'
import Upload from './components/upload.vue'
import { ElMessage } from 'element-plus'

// emits
const emits = defineEmits(['refresh'])

/** 引用组件实例 */
const fromInstance = useTemplateRef('formRef')
const descriptionInstance = useTemplateRef('descriptionUpload')
const displayNameInstance = useTemplateRef('displayNameUpload')

// 初始化表单
const initForm = {
    id: undefined,
    domainId: undefined,
    fieldCode: undefined,
    nameCn: undefined,
    nameEn: undefined,
    description: undefined,
    descriptionImg: undefined,
    displayName: undefined,
    displayNameImg: undefined,
    source: undefined,
    sourceRemark: undefined,
    originColumnType: undefined,
    originIsEncrypted: 0,
    isEnumType: 0,
    enumRemark: undefined,
    dictId: undefined,
    sourceAlias: 'polardb',
    dbName: undefined,
    tableName: undefined,
    fieldName: undefined,
}
const form = reactive({ ...initForm })
const confirmLoading = ref(false)

// 打开对话框
const visible = ref(false)
const handleOpen = async (id) => {
    getDomainTree()
    if (id) {
        await getFieldDetail(id)
    }
    visible.value = true
}

/** 提交表单 */
const handleSubmit = async () => {
    if (!fromInstance.value) return
    await fromInstance.value.validate(async (valid, fields) => {
        if (valid) {
            try {
                confirmLoading.value = true
                form.descriptionImg = descriptionInstance.value?.uploadImg
                form.displayNameImg = displayNameInstance.value?.uploadImg
                form.domainId = form.domainId[form.domainId.length - 1]
                const RequestApi = form.id ? updateStandardField : addStandardField
                await RequestApi(form)
                ElMessage.success(`${form.id ? '编辑' : '新增'}字段成功`)
                handleCancel()
                emits('refresh')
                confirmLoading.value = false
            } catch (error) {
                console.log(error)
                confirmLoading.value = false
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}

/** 取消并重置 */
const handleCancel = () => {
    if (!fromInstance.value) return
    fromInstance.value.resetFields()
    visible.value = false
    Object.assign(form, initForm)
}

// 获取字段详情
const getFieldDetail = async (id) => {
    const { data } = await getStandardFieldById(id)
    const [dbName, tableName, fieldName] = data.source.split('.')
    Object.assign(form, data, { dbName, tableName, fieldName, domainId: [data.domainId] })

    //处理字典值
    if (data.isEnumType === 1) {
        let dataList = data.enumRemark.split(';')
        tableData.value = dataList.map((item) => {
            return { value: item.split('-')[0], label: item.split('-')[1] }
        })
    }
}

// 获取tree
const treeData = ref([])
const getDomainTree = async () => {
    const { data } = await treeDomain()
    treeData.value = data || []
}

// 获取样例
const handleSample = () => {
    ElMessageBox.confirm('自动查询字段来源随机三条数据?', '', {
        type: 'success',
        showClose: false,
        customStyle: { fontWeight: 600 },
    }).then(async () => {
        if (form.source) {
            const query = { sourceAlias: form.sourceAlias, dbName: form.dbName, tableName: form.tableName, columnName: form.fieldName, sourceRemark: form.sourceRemark, limit: 3 }
            const { data } = await getSamples(query)
            form.enumRemark = data.join(';')
        } else {
            ElMessage.warning('请先选择字段来源')
        }
    })
}

const tableData = ref([])
// 获取字典
const handlePreview = async () => {
    if (form.source) {
        const { data } = await getDictByFieldName({ dbName: form.dbName, tableName: form.tableName, fieldName: form.fieldName })
        if (!data) ElMessage.warning('没有找到对应字典')
        tableData.value = data.dataList
        const dataList = data.dataList.map((item) => `${item.value}-${item.label}`)
        form.enumRemark = dataList.join(';')
    } else {
        ElMessage.warning('请先选择字段来源')
    }
}

/** 校验 */
const rules = {
    nameCn: [
        { required: true, message: '请输入字段编码', trigger: 'blur' },
        { pattern: /^\S+$/, message: '不能包含空格', trigger: 'blur' },
    ],
    nameEn: [
        { required: true, message: '请输入字段英文', trigger: 'blur' },
        { pattern: /^[a-zA-Z_]+$/, message: '仅支持英文和下划线', trigger: 'blur' },
    ],
    domainId: [{ required: true, message: '请选择字段领域', trigger: 'change' }],
    description: [{ required: true, message: '请输入字段说明', trigger: 'blur' }],
    source: [{ required: true, message: '请输入字段来源', trigger: 'blur' }],
    originColumnType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
    // originIsEncrypted: [{ required: true, message: '请选择是否加密', trigger: 'change' }],
}

const { databases, tableOptions, columnOptions, reset } = useSource(visible, form)

//数据来源
const onChange = (value, type) => {
    if (type === 'dbName') {
        form.tableName = undefined
        form.fieldName = undefined
    }
    if (type === 'tableName') {
        form.fieldName = undefined
    }
    if (type === 'fieldName') {
        form.source = `${form.dbName}.${form.tableName}.${form.fieldName}`
        fromInstance.value.validateField('source')

        //赋值字段类型
        const column = columnOptions.value.find((item) => item.value === form.fieldName)
        if (column) {
            // 查找是否有‘(’, 如果有则从0截取到‘(’的位置
            const index = column.dataType.indexOf('(')
            const type = index === -1 ? column.dataType : column.dataType.substring(0, index)
            form.originColumnType = type
        }
    }
    if (!value) {
        form.source = undefined
        fromInstance.value.validateField('source')
    }
    reset(value, type)
}

const props = { value: 'id', label: 'name' }
defineExpose({ handleOpen })
</script>
<template>
    <PlusDialog v-model="visible" :title="form.id ? '修改字段' : '新增字段'" width="1200px" top="9vh" :confirmLoading="confirmLoading" @confirm="handleSubmit" @cancel="handleCancel">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="auto">
            <el-form-item label="字段编码" prop="fieldCode" v-if="form.id">
                <el-input v-model="form.fieldCode" placeholder="请输入字段编码" style="width: 50%" :disabled="true" />
            </el-form-item>
            <el-form-item label="字段名称" prop="nameCn">
                <el-input v-model="form.nameCn" placeholder="请输入字段名称" style="width: 50%" />
                <span class="description">不能包含空格</span>
            </el-form-item>
            <el-form-item label="字段英文" prop="nameEn">
                <el-input v-model="form.nameEn" placeholder="请输入字段英文" style="width: 50%" />
                <span class="description">仅支持英文和下划线</span>
            </el-form-item>
            <el-form-item label="字段领域" prop="domainId">
                <el-cascader v-model="form.domainId" filterable :props="props" :options="treeData" :show-all-levels="false" placeholder="请输入字段领域" style="width: 50%" />
            </el-form-item>
            <el-form-item label="字段说明" prop="description" class="form-item">
                <el-input v-model="form.description" :rows="2" type="textarea" placeholder="请输入字段说明" style="width: 50%" />
                <Upload ref="descriptionUpload" :imgList="form.descriptionImg" />
            </el-form-item>
            <el-form-item label="业务展示名称" prop="displayName" class="form-item">
                <el-input v-model="form.displayName" placeholder="请输入业务展示名称" style="width: 50%" />
                <Upload ref="displayNameUpload" :imgList="form.displayNameImg" />
            </el-form-item>
            <el-form-item label="字段来源" prop="source">
                <el-row :gutter="10" style="width: 100%">
                    <el-col :span="5">
                        <el-form-item prop="dbName">
                            <el-select v-model="form.dbName" placeholder="请选择库" clearable @change="(value) => onChange(value, 'dbName')">
                                <el-option v-for="item in databases" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item prop="tableName">
                            <el-select v-model="form.tableName" placeholder="请选择表" clearable @change="(value) => onChange(value, 'tableName')">
                                <el-option v-for="item in tableOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item prop="fieldName">
                            <el-select v-model="form.fieldName" placeholder="请选择字段" clearable @change="(value) => onChange(value, 'fieldName')">
                                <el-option v-for="item in columnOptions" :key="item.value" :label="item.label" :value="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item prop="sourceRemark">
                            <el-input v-model="form.sourceRemark" placeholder="请输入补充内容" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="字段类型" prop="originColumnType">
                <el-select v-model="form.originColumnType" placeholder="请选择字段类型" style="width: 50%">
                    <el-option v-for="item in FieldSource" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="是否加密" prop="originColumnType">
                <el-radio-group v-model="form.originIsEncrypted">
                    <el-radio v-for="item in CommonDict" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="是否有对应字典" prop="isEnumType">
                <el-radio-group v-model="form.isEnumType">
                    <el-radio v-for="item in CommonDict" :key="item.value" :value="item.value">{{ item.label }}</el-radio>
                </el-radio-group>
            </el-form-item>
            <div class="dictionary">
                <div class="dictionary-content" v-if="form.isEnumType == 0">
                    <div class="title">
                        <p>补充样例（选填）</p>
                        <el-button type="primary" :icon="Search" circle size="small" @click="handleSample" />
                    </div>
                    <el-input v-model="form.enumRemark" :rows="4" type="textarea" placeholder="请输入补充样例" />
                </div>
                <div class="dictionary-dict" v-if="form.isEnumType == 1">
                    <el-button type="primary" size="small" @click="handlePreview">预览字典</el-button>
                    <el-table :data="tableData" border size="small" style="margin-left: 10px">
                        <el-table-column prop="value" label="字典值" />
                        <el-table-column prop="label" label="含义" />
                    </el-table>
                </div>
            </div>
        </el-form>
    </PlusDialog>
</template>
<style lang="scss" scoped>
.description {
    color: #909399;
    margin-left: 10px;
}
.dictionary {
    width: calc(50% + 50px);
    padding-left: 110px;
}
.dictionary-content {
    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        div {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #1890ff;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }
    }
    p {
        color: rgba(0, 0, 0, 0.88);
        font-size: 14px;
    }
}
.dictionary-dict {
    display: flex;
    .ant-table-wrapper {
        flex: 1;
        margin-left: 10px;
    }
}

.form-item :deep(.el-form-item__content) {
    align-items: flex-start;
}
</style>
