const global = new Map()
const statements = new Array()
const error = (e) => document.writeln("<p style='color:red'>ERROR: " + e + "</p>")
const TYPE = {
    "":""
}
const type = (div) => div.tagName.toLowerCase() == "div" 
                    ? div.className.toLowerCase() 
                    : TYPE[div.tagName.toLowerCase()]

function eval_statements() {
    if (statements.length == 0)
        return
    const keyword = type(statements[0])
    if (keyword == "in")
        eval_in(statements[0])
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
        res = eval_expr(parse_expr(div.children[0]), global)
    }
    catch(e) {
        error(e)
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
        case "operator":
            return parse_operator(div)
        default:
            throw "the key word '" + type(div) + "' is not supported"
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
            return eval_argument(env)
        case "call": 
            return eval_call(expr, env)
        case "condition": 
            return eval_condition(expr, env)
        case "pair": 
            return eval_pair(expr, env)
        case "operator":
            return eval_operator(expr, env)
        case "closure":
            return eval_closure(expr)
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
        throw "The variable " + expr[1] + " has not been defined in this scope"
    return env.get(expr[1])
}

function eval_function(expr, env) {
    const environment = new Map()
    for (let [k, v] in env)
        environment.set(k, v)
    const closure = ["closure", expr[1], expr[2], environment]
    if (expr[1] != "___ANONYMOUS___")
        environment.set(expr[1], closure)
    return closure
}

function eval_closure(expr) {
    return expr
}

function eval_argument(env) {
    return env.get("___ARGUMENT___")
}

function eval_call(expr, env) {
    const func = eval_expr(expr[1], env)
    if (func[0] != "closure")
        throw func[0] + " is not callable"
    const argument = eval_expr(expr[2], env)
    func[3].set("___ARGUMENT___", argument)
    return eval_expr(func[2], func[3])
}

function eval_condition(expr, env) {
    const condition = eval_expr(expr[1], env)
    if (condition[0] != "value")
        throw "a value expression is expected, " + condition[0] + " was given"
    if (condition[1])
        return eval_expr(expr[2], env)
    else if (expr.length == 4)
        return eval_expr(expr[3], env)
}

function eval_operator(expr, env) {
    switch (expr[1]) {
        case "positive": case "negative": case "not": case "pair?":
        case "increment": case "decrement": case "car": case "cdr":
            return eval_unary(expr, env)
        case "add": case "minus": case "multiply": case "divide": case "intdevide":
        case "modulus": case "and": case "or": case "equal?":
        case "larger?": case "smaller?":
        case "notlarger?": case "notsmaller?":
            return eval_binary(expr, env)
        default:
            throw "The operator " + expr[1] + " is not supported"
    }
}

function eval_unary(expr, env) {
    if (expr.length != 3)
        throw "the operator " + expr[1] + " expects 1 operand, " + (expr.length - 2) + " was given"
    const value = eval_expr(expr[2], env)
    switch (expr[1]) {
        case "positive": 
            if (value[0] == "value")
                return ["value", + value[1]]
            else
                throw "the operator positive can only be applied to values, " + value[0] + " was given"
        case "negative": 
            if (value[0] == "value")
                return ["value", - value[1]]
            else
                throw "the operator negative can only be applied to values, " + value[0] + " was given"
        case "not": 
                if (value[0] == "value")
                return ["value", ! value[1]]
            else
                throw "the operator not can only be applied to values, " + value[0] + " was given"
        case "increment": 
            if (value[0] == "value")
                return ["value", value[1] + 1]
            else
                throw "the operator increment can only be applied to values, " + value[0] + " was given"
        case "decrement": 
            if (value[0] == "value")
                return ["value", + value[1] - 1]
            else
                throw "the operator decrement can only be applied to values, " + value[0] + " was given"
        case "pair?":
            return ["value", value[0] == "pair"]
        case "car": 
            if (value[0] == "pair")
                return value[1]
            else
                throw "the operator car can only be applied to pairs, " + value[0] + " was given"
        case "cdr":
            if (value[0] == "pair")
                return value[2]
            else
                throw "the operator cdr can only be applied to pairs, " + value[0] + " was given"
    }
}

function eval_binary(expr, env) {
    if (expr.length != 4)
        throw "operator " + expr[1] + " expects 2 operands, " + (expr.length - 2) + " was given"
    const first = eval_expr(expr[2], env)
    const second = eval_expr(expr[3], env)
    if (first[0] != "value")
        throw "the operator " + expr[0] + " can only be applied to values, " + first[0] + " was given"
    if (second[0] != "value")
        throw "the operator " + expr[0] + " can only be applied to values, " + first[0] + " was given"
    switch (expr[1]) {
        case "add": 
            return ["value", first + second]
        case "minus": 
            return ["value", first - second]
        case "multiply": 
            return ["value", first * second]
        case "divide": 
            return ["value", first / second]
        case "intdevide":
            return ["value", Math.floor(first / second)]
        case "modulus":  
            return ["value", first % second]
        case "and": 
            return ["value", first && second]
        case "or": 
            return ["value", first || second]
        case "equal?":
            return ["value", first === second]
        case "larger?": 
            return ["value", first > second]
        case "smaller?":
            return ["value", first < second]
        case "notlarger?": 
            return ["value", first <= second]
        case "notsmaller?":
            return ["value", first >= second]
    }
}

function eval_pair(expr, env) {
    const first = eval_expr(expr[1], env)
    const second = eval_expr(expr[2], env)
    return ["pair", first, second]
}

function parse_value(div) {
    let value = div.textContent
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"'))
        return ["value", value.substring(1, value.length - 1)]
    value = value.trim()
    if (value == "true")
        return ["value", true]
    if (value == "false")
        return ["value", false]
    if (value == "null")
        return ["value", null]
    const number = Number(value)
    if (!isNaN(number))
        return ["value", number]
    return ["value", value]
}

function parse_scope(div) {
    const children = div.children
    if (children.length == 0)
        throw "a scope expression cannot be empty"
    const res = ["scope"]
    for (let i = 0; i < children.length - 1; ++i) {
        if (type(children[i]) != "define")
            throw "a define expression is expected " + type(children[i]) + " was given"
        res.push(parse_expr(children[i]))
    }
    res.push(parse_expr(children[children.length - 1]))
    return res
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

function parse_operator(div) {

}

function parse_pair(div) {

}

window.onload = () => {
    statementList = document.body.cloneNode(true).children
    for (let i = 0; i < statementList.length; ++i)
        statements.push(statementList[i])
    document.body.innerHTML = ""
    eval_statements()
}