<template>
    <Card title="字段基础信息">
        <template #headerLeft>
            <el-tooltip effect="dark" content="编辑" placement="top">
                <el-icon v-auth="'platform:edit'" class="card_icon" color="#1677ff" size="16px" @click="editHandler"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip v-if="baseInfo.subscribed" effect="dark" content="取消关注" placement="top">
                <el-icon v-auth="'platform:subscribed'" class="card_icon" color="#e6a23c" size="16px" @click="handleSubscribe(false)"><StarFilled /></el-icon>
            </el-tooltip>
            <el-tooltip v-else effect="dark" content="添加关注" placement="top">
                <el-icon v-auth="'platform:subscribed'" class="card_icon" color="#909399" size="16px" @click="handleSubscribe(true)"><Star /></el-icon>
            </el-tooltip>
        </template>
        <template #headerRight>
            <el-dropdown placement="bottom-start">
                <el-icon class="card_icon"><MoreFilled /></el-icon>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item v-if="hasAuth('platform:change')" @click="handleChangeRecord">
                            <el-icon><Clock /></el-icon>
                            变更记录
                            <div class="dot" v-if="checkTime(baseInfo.updateTime)"></div>
                        </el-dropdown-item>
                        <el-dropdown-item v-if="hasAuth('platform:delete')" @click="deleteHandler">
                            <el-icon color="#cf1322"><Delete /></el-icon>
                            <span style="color: #cf1322">删除字段</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </template>
        <el-row :gutter="10">
            <el-col :span="6" class="items">
                <span>字段编码</span>
                <p>{{ baseInfo.fieldCode }}</p>
            </el-col>
            <el-col :span="6" class="items">
                <span>字段名称</span>
                <p>{{ baseInfo.nameCn }}</p>
            </el-col>
            <el-col :span="6" class="items">
                <span>字段英文</span>
                <p>{{ baseInfo.nameEn }}</p>
            </el-col>
            <el-col :span="6" class="items">
                <span>字段领域</span>
                <ColorTag color="#c41d7f">{{ baseInfo.domainName }}</ColorTag>
            </el-col>
            <el-col :span="6" class="items">
                <span>字段类型</span>
                <p>{{ baseInfo.originColumnType }}</p>
            </el-col>
            <el-col :span="6" class="items">
                <span>是否加密</span>
                <p>{{ baseInfo.originIsEncrypted ? '是' : '否' }}</p>
            </el-col>
            <el-col :span="12" class="items">
                <span>字段来源</span>
                <p>{{ baseInfo.source }}</p>
            </el-col>
            <el-col :span="24" class="items">
                <span>字段说明</span>
                <p>{{ baseInfo.description }}</p>
                <el-image v-for="(url, index) in descriptionImgs" :key="index" class="info_img" :src="url" fit="cover" @click="handlePreview(index, 'descriptionImgs')" />
            </el-col>
            <el-col :span="6" class="items">
                <span>业务展示名称</span>
                <p>{{ baseInfo.displayName }}</p>
                <el-image v-for="(url, index) in displayNameImgs" :key="index" class="info_img" :src="url" fit="cover" @click="handlePreview(index, 'displayNameImgs')" />
            </el-col>

            <el-col :span="24" class="items">
                <span>字段值枚举</span>
                <p>{{ truncateText(baseInfo.enumRemark) }}</p>
                <el-popover title="字段值枚举" v-if="baseInfo.enumRemark">
                    <template #reference>
                        <el-icon class="card_icon" color="#1677ff" size="16px"><FullScreen /></el-icon>
                    </template>
                    <p v-for="(item, index) in splitText(baseInfo.enumRemark)" :key="index" class="enum_remark">{{ item }}</p>
                </el-popover>
            </el-col>
        </el-row>
    </Card>
    <!-- 新增/编辑 -->
    <EditFiled ref="editRef" @refresh="getBaseInfo" />
    <!-- 变更记录 -->
    <changeRecord ref="changeRecordRef" />
    <!-- 图片预览 -->
    <el-image-viewer v-if="viewer.visible" :url-list="viewer.urlList" :initial-index="viewer.index" :zoom-rate="1.2" :max-scale="7" :min-scale="0.2" show-progress @close="viewer.visible = false" />
</template>
<script setup>
import Card from '../components/Card.vue'
import { getStandardFieldById, subscribeStandardField } from '@/api/platform'
import { ref, reactive, onMounted, useTemplateRef, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteStandardField } from '@/api/platform'
import { useHandleData } from '@/hooks/useHandleData.js'
import { checkTime } from '@/utils/business'
import { hasAuth } from '@/directives/modules/auth'
import ColorTag from '@/components/ColorTag/index.vue'
import { ElMessage } from 'element-plus'
const EditFiled = defineAsyncComponent(() => import('@/views/field/platform/edit.vue'))
const changeRecord = defineAsyncComponent(() => import('@/views/field/platform/details/baseInfo/changeRecord.vue'))

const emits = defineEmits(['updateFieldName'])
// 编辑区域Ref
const editInstance = useTemplateRef('editRef')
const changeRecordInstance = useTemplateRef('changeRecordRef')
const route = useRoute()
const router = useRouter()
const baseInfo = reactive({
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
    originColumnType: undefined,
    originIsEncrypted: undefined,
    isEnumType: 0,
    enumRemark: undefined,
    dictId: undefined,
})
const descriptionImgs = ref([])
const displayNameImgs = ref([])

const getBaseInfo = async () => {
    const { data } = await getStandardFieldById(route.query.id)
    Object.assign(baseInfo, data)
    if (data.descriptionImg) descriptionImgs.value = splitImages(data.descriptionImg)
    if (data.displayNameImg) displayNameImgs.value = splitImages(data.displayNameImg)
    emits('updateFieldName', data.nameCn)
}
const splitImages = (value) => {
    const list = value.split(' || ')
    const files = list.map((item, index) => {
        const [name, url] = item.split(' | ')
        return url
    })
    return files
}

// 编辑
const editHandler = () => {
    editInstance.value.handleOpen(baseInfo.id)
}
// 删除
const deleteHandler = async () => {
    await useHandleData(deleteStandardField, baseInfo, `删除【${baseInfo.nameCn}】字段`, '删除后所有关联字段映射和调用会同步删除，操作不可恢复!')
    router.go(-1)
}
// 变更记录
const handleChangeRecord = () => {
    changeRecordInstance.value.openDialog()
}

// 关注
const handleSubscribe = async (subscribe) => {
    const { code } = await subscribeStandardField({ fieldId: baseInfo.id, subscribe })
    if (code === 200) {
        ElMessage.success(subscribe ? '添加关注成功' : '取消关注成功')
        getBaseInfo()
    }
}

// 图片预览
const viewer = reactive({ visible: false, index: 0, urlList: [] })
const handlePreview = (index, type) => {
    if (type == 'descriptionImgs') {
        viewer.urlList = descriptionImgs.value
    } else {
        viewer.urlList = displayNameImgs.value
    }
    viewer.index = index
    viewer.visible = true
}

// 处理字段值枚举
const truncateText = (text, maxLength = 80) => {
    if (!text) return ''
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}
// 处理字段值枚举
const splitText = (text) => {
    if (!text) return []
    if (baseInfo.isEnumType == 1) {
        return text.split(';')
    } else {
        return text.split(';')
    }
}

onMounted(() => {
    getBaseInfo()
})
</script>

<style lang="scss" scoped>
.baseInfo {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    & > div {
        width: 25%;
        flex-shrink: 0;
        display: flex;
        align-items: center;
    }
}
.items {
    display: flex;
    align-items: center;
    line-height: 36px;
    font-size: 14px;
    & > span:first-child {
        display: inline-block;
        width: 100px;
        flex-shrink: 0;
        font-weight: 600;
        color: #25406a;
        &::after {
            content: '：';
        }
    }
    p {
        color: #6c6c6c;
        font-weight: 600;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    :deep(.ant-image) {
        margin-left: 10px;
    }
    .card_icon {
        margin-left: 10px;
        cursor: pointer;
    }
    .enum_remark {
        line-height: 32px;
    }
}
.dot {
    display: inline-block;
    margin-bottom: 2px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #f36161;
    margin-left: 5px;
}
.info_img {
    width: 30px;
    height: 30px;
    margin-left: 10px;
    cursor: pointer;
}
</style>
