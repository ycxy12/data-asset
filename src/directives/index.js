import auth from './modules/auth'

const directivesList = { auth }

const directives = {
    install: function (app) {
        Object.keys(directivesList).forEach((key) => {
            app.directive(key, directivesList[key])
        })
    },
}

export default directives
