<!-- 关系图组件模板 -->
<template>
    <!-- 图表容器，带加载状态 -->
    <div v-loading="g_loading" style="width: 100%; height: calc(100vh - 230px)">
        <!-- 关系图组件，监听节点展开和折叠事件 -->
        <RelationGraph ref="graphRef" :options="graphOptions" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse">
            <!-- 自定义节点模板 -->
            <template #node="{ node }">
                <Node :node="node" />
            </template>
        </RelationGraph>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import RelationGraph from 'relation-graph-vue3';
import Node from './node.vue';
import { getDict } from '@/api/dict';
import { getStandardFieldById, listMappingField } from '@/api/platform';

// 路由对象，用于获取查询参数
const route = useRoute();
// 关系图组件引用
const graphRef = ref();
// 全局加载状态
const g_loading = ref(true);

// 映射类型选项数据
const options = ref([]);
// 图表数据结构：包含根节点ID、节点数组、连线数组
const graphJsonData = reactive({ rootId: '', nodes: [], lines: [] });

// 计算属性：获取关系图实例
const graphInstance = computed(() => graphRef.value?.getInstance());

// 关系图配置选项
const graphOptions = {
    layout: {
        label: 'Center', // 布局标签
        layoutName: 'tree', // 树形布局
        layoutClassName: 'seeks-layout-center', // 布局样式类名
        defaultJunctionPoint: 'lr', // 默认连接点位置（左右）
        defaultNodeShape: 1, // 默认节点形状
        from: 'left', // 布局起始方向
    },
    defaultFocusRootNode: false,
    moveToCenterWhenRefresh: false, // 刷新时不自动移动到中心
    defaultExpandHolderPosition: 'right', // 默认展开按钮位置
    defaultLineShape: 4, // 默认连线形状
    defaultNodeBorderWidth: 0, // 默认节点边框宽度
    defaultNodeFontColor: 'rgba(0, 0, 0, 0.88)', // 默认节点字体颜色
    defaultLineColor: '#686868', // 默认连线颜色
    defaultNodeColor: 'rgba(21, 133, 252, 0.8)', // 默认节点颜色
};

/**
 * 组件挂载时的初始化流程
 * 1. 加载字典数据
 * 2. 加载根节点数据
 * 3. 设置图表数据并渲染
 */
onMounted(async () => {
    g_loading.value = true;
    await listDict(); // 获取映射类型字典
    await loadRootNode(); // 加载根节点
    await setGraphData(); // 设置图表数据
    g_loading.value = false;
});

/**
 * 获取映射类型字典数据
 * 用于显示映射关系的类型标签
 */
async function listDict() {
    const { data } = await getDict('MAPPING_TYPE');
    options.value = data.dataList || [];
}

/**
 * 加载根节点数据
 * 根据路由参数中的ID获取标准字段信息，作为关系图的根节点
 */
async function loadRootNode() {
    const { data } = await getStandardFieldById(route.query.id);
    graphJsonData.rootId = String(data.id);
    // 添加根节点到图表数据
    graphJsonData.nodes.push({ id: String(data.id), text: data.nameCn, data });
    // 加载根节点的关联关系
    await appendAssociations(data.id);
}

/**
 * 设置图表数据并进行初始化渲染
 * 包括数据设置、居中显示、自适应缩放
 */
async function setGraphData() {
    await graphInstance.value?.setJsonData(graphJsonData); // 设置图表数据
    await graphInstance.value?.moveToCenter(); // 移动到中心位置
    await graphInstance.value?.zoomToFit(); // 自适应缩放
}

/**
 * 为指定字段添加关联关系
 * @param {string} fieldId - 字段ID
 */
async function appendAssociations(fieldId) {
    const { data } = await listMappingField({ id: fieldId });

    // 为每个映射关系检查是否有子节点
    const enrichedData = await Promise.all(
        data.map(async (v) => ({
            ...v,
            hasChildren: await checkHasChildren(v.mappedFieldId, fieldId),
        })),
    );

    // 为每个映射关系添加节点
    enrichedData.forEach(addMappingNode);
}

/**
 * 添加映射节点到图表
 * 创建中间件节点（映射类型）和目标字段节点
 * @param {Object} v - 映射关系数据
 */
function addMappingNode(v) {
    // 创建中间件节点ID和文本
    const middlewareId = `${v.mappedFieldId}${v.mappingType}`;
    const middlewareText = options.value.find((item) => item.value === v.mappingType)?.label;

    // 添加中间件节点（表示映射类型）
    graphJsonData.nodes.push({
        id: middlewareId,
        text: middlewareText,
        data: { middleware: true, mappingType: v.mappingType, remark: v.remark },
    });
    // 添加从源字段到中间件的连线
    graphJsonData.lines.push({ from: String(v.fieldId), to: middlewareId, animation: 1, fromJunctionPoint: 'right', toJunctionPoint: 'left' });

    // 配置目标字段节点
    const nodeConfig = {
        id: String(v.mappedFieldId),
        text: v.mappingFieldNameCn,
        data: {
            isNeedLoadDataFromRemoteServer: v.hasChildren, // 是否需要从服务器加载数据
            childrenLoaded: false, // 子节点是否已加载
            ...v,
        },
    };

    // 如果有子节点，设置展开配置
    if (v.hasChildren) {
        nodeConfig.expandHolderPosition = 'right'; // 展开按钮位置
        nodeConfig.expanded = false; // 初始状态为折叠
    }

    // 添加目标字段节点和连线
    graphJsonData.nodes.push(nodeConfig);
    graphJsonData.lines.push({ from: middlewareId, to: nodeConfig.id, animation: 1, fromJunctionPoint: 'right', toJunctionPoint: 'left' });
}

/**
 * 检查节点是否有子节点
 * 通过查询映射关系，排除回环引用，判断是否存在子节点
 * @param {string} nodeId - 节点ID
 * @param {string} fieldId - 父字段ID（用于排除回环）
 * @returns {boolean} 是否有子节点
 */
async function checkHasChildren(nodeId, fieldId) {
    try {
        const { data } = await listMappingField({ id: nodeId });
        // 检查是否存在不是回环引用的映射关系
        return (data || []).some((v) => v.mappedFieldId !== fieldId);
    } catch (err) {
        console.error('检查子节点失败:', err);
        return false;
    }
}

/**
 * 节点展开事件处理
 * 当用户点击展开按钮时，加载并显示子节点
 * @param {Object} node - 被展开的节点
 */
async function onNodeExpand(node) {
    const g = graphInstance.value;
    if (!g || node.data.childrenLoaded) return await g.doLayout();

    // 处理回环引用的情况
    if (node.data.hasLoopBack) {
        const line = createLoopLine(node.id, node.data.loopBackTarget);
        g.appendJsonData({ nodes: [], lines: [line] });
        node.data.childrenLoaded = true;
        return await g.doLayout();
    }

    // 加载子节点数据
    g_loading.value = true;
    node.data.childrenLoaded = true;

    const data = await loadChildNodes(node);
    g.appendJsonData(data);
    g_loading.value = false;
    await g.doLayout();
}

/**
 * 节点折叠事件处理
 * 当用户点击折叠按钮时，移除回环连线
 * @param {Object} node - 被折叠的节点
 */
async function onNodeCollapse(node) {
    const g = graphInstance.value;
    if (!g || !node.data.hasLoopBack) return;

    // 查找并移除回环连线
    const line = g.getLines().find((l) => l.from === node.id && l.to === node.data.loopBackTarget);
    if (line) g.removeLine(line);

    node.data.childrenLoaded = false;
    await g.doLayout();
}

/**
 * 创建回环连线
 * 用于表示循环引用关系的虚线连接
 * @param {string} from - 起始节点ID
 * @param {string} to - 目标节点ID
 * @returns {Object} 连线配置对象
 */
function createLoopLine(from, to) {
    return {
        from, // 起始节点
        to, // 目标节点
        relation: ['right', 'left'], // 连接点位置
        animation: 1, // 动画效果
        color: '#333', // 连线颜色（灰色）
        dashed: true, // 虚线样式
        lineWidth: 1, // 线宽
        fromJunctionPoint: 'right',
        toJunctionPoint: 'left',
    };
}

/**
 * 加载子节点数据
 * 获取指定节点的所有映射关系，创建相应的节点和连线
 * 处理循环引用的特殊情况
 * @param {Object} node - 父节点对象
 * @returns {Object} 包含新节点和连线的数据对象
 */
async function loadChildNodes(node) {
    const g = graphInstance.value;
    const { data = [] } = await listMappingField({ id: node.id });

    // 过滤掉回环引用（避免无限循环）
    const filtered = data.filter((v) => v.mappedFieldId !== node.data.fieldId);
    // 获取当前图中所有节点的ID
    const allNodes = g.getNodes().map((n) => n.id);
    const newNodes = [];
    const newLines = [];

    // 为每个映射关系检查是否有子节点
    const withChildren = await Promise.all(
        filtered.map(async (v) => ({
            ...v,
            hasChildren: await checkHasChildren(v.mappedFieldId, node.id),
        })),
    );

    withChildren.forEach((v) => {
        // 创建中间件节点（映射类型节点）
        const midId = node.id + v.mappedFieldId + v.mappingType;
        const midText = options.value.find((o) => o.value === v.mappingType)?.label;

        newNodes.push({ id: midId, text: midText, data: { middleware: true, mappingType: v.mappingType, remark: v.remark } });
        newLines.push({ from: node.id, to: midId, animation: 1, fromJunctionPoint: 'right', toJunctionPoint: 'left' });

        const mapId = String(v.mappedFieldId);
        const isLoop = allNodes.includes(mapId); // 检查是否为循环引用

        if (isLoop) {
            // 处理循环引用：修改中间件节点配置，添加回环标记
            const midNode = newNodes.find((n) => n.id === midId);
            Object.assign(midNode, {
                expandHolderPosition: 'right',
                expanded: true,
                data: {
                    ...midNode.data,
                    hasLoopBack: true, // 标记为回环
                    loopBackTarget: mapId, // 回环目标节点
                    isNeedLoadDataFromRemoteServer: false,
                    childrenLoaded: true,
                },
            });
            // 添加回环连线
            newLines.push(createLoopLine(midId, mapId));
        } else {
            // 正常情况：创建新的目标字段节点
            const config = {
                id: mapId,
                text: v.mappingFieldNameCn,
                data: {
                    isNeedLoadDataFromRemoteServer: v.hasChildren,
                    childrenLoaded: false,
                    ...v,
                },
            };
            // 如果有子节点，设置展开配置
            if (v.hasChildren) {
                config.expandHolderPosition = 'right';
                config.expanded = false;
            }
            newNodes.push(config);
            newLines.push({ from: midId, to: mapId, animation: 1, fromJunctionPoint: 'right', toJunctionPoint: 'left' });
        }
    });

    return { nodes: newNodes, lines: newLines };
}
</script>
