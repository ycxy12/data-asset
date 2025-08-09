import { dayjs } from 'element-plus'
/**
 * @description: createWaterMark.js 加水印功能
 */
let waterMarkDOM
let clearWaterMark = () => {
    if (waterMarkDOM) waterMarkDOM.remove()
}

/**
 * @description: 创建水印
 * @param {String} contentText 水印内容
 */
export default function createWaterMark(waterMarkName) {
    clearWaterMark()
    if (!waterMarkName) {
        return
    }
    let now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    let width = window.parseInt(document.body.clientWidth)
    let canvasWidth = width / window.parseInt(width / 320)
    let fontFamily = window.getComputedStyle(document.body)['font-family']
    const fragment = document.createDocumentFragment()
    waterMarkDOM = document.createElement('div')
    waterMarkDOM.className = 'water-mark-wrap'
    let spanStr = ''
    for (let i = 0; i < 100; i++) {
        spanStr += `<span class="water-word" style=width:${canvasWidth}px;height:200px;font: ${fontFamily}>${waterMarkName}<br/>${now}</span>`
    }
    waterMarkDOM.innerHTML = spanStr
    fragment.appendChild(waterMarkDOM)
    document.body.appendChild(fragment)
}
