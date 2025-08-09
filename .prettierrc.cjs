module.exports = {
    printWidth: 400, // 每行最大长度
    tabWidth: 4, // tab 缩进大小
    useTabs: false, // 使用空格代替 tab
    semi: false, // 行尾加分号
    singleQuote: true, // 使用单引号
    quoteProps: 'as-needed', // 对象属性仅在必要时加引号
    jsxSingleQuote: true, // JSX 中使用单引号
    trailingComma: 'all', // 多行对象/数组末尾加逗号
    bracketSpacing: true, // 对象字面量括号间加空格
    jsxBracketSameLine: true, // JSX 多行标签的 > 放在最后一行末尾
    arrowParens: 'always', // 箭头函数参数强制加括号
    requirePragma: false, // 不要求文件顶部有 `@format` 注释
    insertPragma: false, // 不自动插入 `@format`
    proseWrap: 'preserve', // 保留原样折行（Markdown 文本等）
    htmlWhitespaceSensitivity: 'ignore', // 忽略 HTML 空白敏感度
    vueIndentScriptAndStyle: false, // Vue 文件中的 <script> 和 <style> 不缩进
    endOfLine: 'lf', // 换行符使用 LF（Unix 风格）
    embeddedLanguageFormatting: 'auto', // 自动格式化内嵌代码
    // plugins: ['prettier-plugin-vue'],    // 支持 Vue 格式化（可选）
};
