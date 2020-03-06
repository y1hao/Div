const environment = new Map()
const statements = new Array()
let outBegin = false
const error = (e) => document.writeln("<p style='color:red'>ERROR: " + e + "</p>")

function eval_statements() {
    if (statements.length == 0)
        return
    if (statements[0].className == "out")
        outBegin = true
    if (outBegin) {
        if (statements[0].className != "out") {
            error("out statement expected, " + statements[0].className + " was given")
            return
        }
        eval_out(statements[0])
    }
    else {
        if (statements[0].className != "in") {
            error("in statement expected, " + statements[0].className + " was given")
            return
        }
        eval_in(statements[0])
    }
}

function next() {
    const inputList = document.getElementsByTagName("input")
    const input = inputList[inputList.length - 1]
    environment.set(input.name, input.value)
    input.removeAttribute("onchange")
    statements.splice(0, 1)
    eval_statements()
}

function eval_in(div) {
    const name = div.id
    const prompt = div.textContent
    document.writeln("<label>" + prompt + "</label>")
    document.writeln("<input onchange='next()' name='" + name +"'></input><br>")
}

function eval_out(div) {
    const res = eval_expr(div.children[0], environment)
    document.writeln("<p>" + res + "</p>")
}

function eval_expr(div, env) {
    switch (div.className) {
        case "val": 
            return eval_val(div)
        case "let": 
            return eval_let(div, env)
        case "var": 
            return eval_var(div, env)
        case "function": 
            return eval_function(div, env)
        case "argument": 
            return eval_argument(div, env)
        case "call": 
            return eval_call(div, env)
        case "if": 
            return eval_if(div, env)
        case "pair": 
            return eval_pair(div, env)
        case "list": 
            return eval_list(div, env)
        case "positive": case "negative": case "not": case "increment":
        case "decrement": case "null?": case "car": case "cdr":
            return eval_unary(div, env)
        case "minus": case "divide": case "intdivide": case "modulus": case "equal?":
        case "larger?": case "smaller?": case "notlarger?": case "notsmaller?":
            return eval_binary(div, env)
        case "add": case "multiply": case "and": case "or":
            return eval_multiple(div, env)
        default:
            error("the class name '" + div.className + "' is not supported")
    }
}

function eval_val(div) {
    const val = div.textContent
    if (val.length >= 2 && val[0] == '"' && val[val.length - 1] == '"')
        return val.substring(1, val.length - 1)
    const num = Number(val)
    if (!isNaN(num))
        return num
    return val
}

function eval_let(div, env) {

}

function eval_var(div, env) {

}

function eval_function(div, env) {

}

function eval_argument(div, env) {

}

function eval_call(div, env) {

}

function eval_if(div, env) {

}

function eval_unary(div, env) {

}

function eval_binary(div, env) {

}

function eval_multiple(div, env) {

}

function eval_pair(div, env) {

}

function eval_list(div, env) {

}

window.onload = () => {
    statementList = document.body.cloneNode(true).children
    for (let i = 0; i < statementList.length; ++i)
        statements.push(statementList[i])
    document.body.innerHTML = ""
    eval_statements()
}