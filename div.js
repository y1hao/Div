const global = new Map()
const statements = new Array()
const error = (e) => document.writeln("<p style='color:red'>ERROR: " + e + "</p>")
const TYPE = {
    "":""
}
const type = (div) => div.tagName == "div" ? div.className : TYPE[div.tagName]

function eval_statements() {
    if (statements.length == 0)
        return
    const keyword = type(statements[0])
    if (keyword == "in")
        eval_in()
    else if (keyword == "out")
        eval_out(statements[0])
    else
        error("in / out statement expected, " + keyword + " was given")
}

function next() {
    const inputList = document.getElementsByTagName("input")
    const input = inputList[inputList.length - 1]
    global.set(input.name, ["value", input.value])
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
    let res
    try {
        res = eval_expr(parse_expr(div.children[0], global))
    }
    catch(e) {
        error(e.message)
    }
    print(res)
    statements.splice(0, 1)
    eval_statements()
}

function print(expr) {
    document.writeln("<p>" + expr[1] + "</p>")
}

function parse_expr(div) {
    switch (type(div)) {
        case "value": 
            return parse_value(div)
        case "scope": 
            return parse_scope(div)
        case "define": 
            return parse_define(div)
        case "variable": 
            return parse_variable(div)
        case "function": 
            return parse_function(div)
        case "argument": 
            return parse_argument(div)
        case "call": 
            return parse_call(div)
        case "condition": 
            return parse_condition(div)
        case "pair": 
            return parse_pair(div)
        case "list": 
            return parse_list(div)
        case "operator":
            return parse_operator(div)
        default:
            throw "the key word '" + div.className + "' is not supported"
    }
}

function eval_expr(expr, env) {
    switch(expr[0]) {
        case "value": 
            return eval_value(expr)
        case "scope": 
            return eval_scope(expr, env)
        case "define": 
            return eval_define(expr, env)
        case "variable": 
            return eval_variable(expr, env)
        case "function": 
            return eval_function(expr, env)
        case "argument": 
            return eval_argument(expr, env)
        case "call": 
            return eval_call(expr, env)
        case "condition": 
            return eval_condition(expr, env)
        case "pair": 
            return eval_pair(expr, env)
        case "list": 
            return eval_list(expr, env)
        case "operator":
            return eval_operator(expr, env)
    }
}

function eval_value(expr) {
    return expr
}

function eval_scope(expr, env) {
    const new_env = new Map()
    for (let [k, v] of env)
        new_env.set(k, new Array(v))
    for (let i = 1; i < expr.length - 1; ++i) {
        if (expr[i][0] != "define")
            throw "define expression expected, " + expr[i][0] + " was given"
        eval_expr(expr[i], new_env)
    }
    return eval_expr(expr[expr.length - 1], new_env)
}

function eval_define(expr, env) {
    const value = eval_expr(expr[2], env)
    env.set(expr[1], value)
    return value
}

function eval_variable(expr, env) {
    if (!env.has(expr[1]))
        throw "The variable " + expr[0] + " has not been defined in this scope"
    return env.get(expr[1])
}

function eval_function(expr, env) {
    
}

function eval_argument(expr, env) {

}

function eval_call(expr, env) {

}

function eval_condition(expr, env) {

}

function eval_unary(expr, env) {

}

function eval_binary(expr, env) {

}

function eval_multiple(expr, env) {

}

function eval_pair(expr, env) {

}

function eval_list(expr, env) {

}


function parse_value(div) {
    const val = div.textContent
    if (val.length >= 2 && val.startsWith('"') && val.endsWith('"'))
        return ["val", val.substring(1, val.length - 1)]
    val = val.trim()
    if (val == "true")
        return ["val", true]
    if (val == "false")
        return ["val", false]
    if (val == "null")
        return ["val", null]
    const num = Number(val)
    if (!isNaN(num))
        return ["val", num]
    throw val + " is not a valid value for val expressoin"
}


function parse_scope(div) {
    
}

function parse_define(div) {

}

function parse_variable(div) {

}

function parse_function(div) {

}

function parse_argument(div) {

}

function parse_call(div) {

}

function parse_condition(div) {

}

function parse_unary(div) {

}

function parse_binary(div) {

}

function parse_multiple(div) {

}

function parse_pair(div) {

}

function parse_list(div) {

}

window.onload = () => {
    statementList = document.body.cloneNode(true).children
    for (let i = 0; i < statementList.length; ++i)
        statements.push(statementList[i])
    document.body.innerHTML = ""
    eval_statements()
}