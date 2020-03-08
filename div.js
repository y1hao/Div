const global = new Map()
const statements = new Array()
const error = (e) => document.writeln("<p style='color:red'>ERROR: " + e + "</p>")
const TYPE = {
    "cite":       "in",
    "main":       "out",
    "i":          "value",
    "a":          "variable",
    "label":      "argument",
    "aside":      "pair",
    "article":    "scope",
    "section":    "define",
    "nav":        "condition"
}
const type = (div) => div.tagName.toLowerCase() == "div" 
                    ? div.className.toLowerCase() 
                    : TYPE[div.tagName.toLowerCase()]
const copy = (map) => {
    let res = new Map()
    for (let [k, v] of map)
        res.set(k, v)
    return res
}

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
    global.set(input.name, ["value", parse_string(input.value)])
    input.removeAttribute("onchange")
    input.setAttribute("disabled", "disabled")
    statements.splice(0, 1)
    eval_statements()
}

function eval_in(div) {
    const name = div.id
    const prompt = div.textContent
    document.writeln("<p><label style='color:dimgray;white-space:pre'>" + prompt + "</label>")
    document.writeln("<input style='color:limegreen' onchange='next()' name='" + name +"'></input></p>")
    inputList = document.getElementsByTagName("input")
    inputList[inputList.length - 1].focus()
}

function eval_out(div) {
    let res
    if (div.children.length != 1)
        error("the out statement only takes exactly 1 element, " + div.children.length + " was given")
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
    document.writeln("<p style='white-space:pre'>" + get_display(expr) + "</p>")
}

function get_display(expr) {
    switch (expr[0]) {
        case "value":
            if (expr[1] === true || expr[1] === false)
                return "<span style='color:darkorange'>" + expr[1] + "</span>"
            if (expr[1] === null)
                return "<span style='color:gray'>" + expr[1] + "</span>"
            if (expr[1] === +expr[1])
                return "<span style='color:indigo'>" + expr[1] + "</span>"
            return "<span style='color:dodgerblue'>'" 
                    + expr[1].replace(/\\n/g, "</span><br><span style='color:dodgerblue'>") 
                    + "'</span>"
        case "closure":
            return "<span style='color:darkcyan'>[function]</span>"
        case "pair":
            return "<span style='color:green'>( </span>"
                + get_display(expr[1])
                + "<span style='color:green'> , </span>"
                + get_display(expr[2])
                + "<span style='color:green'> )</span>"
    }
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
            return parse_argument()
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
    const new_env = copy(env)
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
    const environment = copy(env)
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
    const new_env = copy(func[3])
    new_env.set("___ARGUMENT___", argument)
    return eval_expr(func[2], new_env)
}

function eval_condition(expr, env) {
    const condition = eval_expr(expr[1], env)
    if (condition[0] != "value")
        throw "a value expression is expected, " + condition[0] + " was given"
    if (condition[1])
        return eval_expr(expr[2], env)
    else if (expr.length == 4)
        return eval_expr(expr[3], env)
    else
        return ["value", null]
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
            return ["value", first[1] + second[1]]
        case "minus": 
            return ["value", first[1] - second[1]]
        case "multiply": 
            return ["value", first[1] * second[1]]
        case "divide": 
            return ["value", first[1] / second[1]]
        case "intdevide":
            return ["value", Math.floor(first[1] / second[1])]
        case "modulus":  
            return ["value", first[1] % second[1]]
        case "and": 
            return ["value", first[1] && second[1]]
        case "or": 
            return ["value", first[1] || second[1]]
        case "equal?":
            return ["value", first[1] === second[1]]
        case "larger?": 
            return ["value", first[1] > second[1]]
        case "smaller?":
            return ["value", first[1] < second[1]]
        case "notlarger?": 
            return ["value", first[1] <= second[1]]
        case "notsmaller?":
            return ["value", first[1] >= second[1]]
    }
}

function eval_pair(expr, env) {
    const first = eval_expr(expr[1], env)
    const second = eval_expr(expr[2], env)
    return ["pair", first, second]
}

function parse_value(div) {
    let value = div.textContent
    return ["value", parse_string(value)]
}

function parse_string(str) {
    if (str.length >= 2 && str.startsWith('"') && str.endsWith('"'))
        return str.substring(1, str.length - 1)
    str = str.trim()
    if (str == "true")
        return true
    if (str == "false")
        return false
    if (str == "null")
        return null
    const number = Number(str)
    if (!isNaN(number))
        return number
    return str
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
    const id = div.id
    if (div.children.length == 0)
        throw "empty define for " + id
    return ["define", id, parse_expr(div.children[0])]
}

function parse_variable(div) {
    const id = div.textContent.trim()
    return ["variable", id]
}

function parse_function(div) {
    let id
    if (!div.hasAttribute("id"))
        id = "___ANONYMOUS___"
    else
        id = div.id
    return ["function", id, parse_expr(div.children[0])]
}

function parse_argument() {
    return ["argument"]
}

function parse_call(div) {
    const children = div.children
    if (children.length < 2)
        throw "a call expression must have a function and an argument"
    return ["call", parse_expr(children[0]), parse_expr(children[1])]
}

function parse_condition(div) {
    const children = div.children
    if (children.length == 2)
        return ["condition", parse_expr(children[0]), parse_expr(children[1])]
    if (children.length == 3)
        return ["condition", parse_expr(children[0]), parse_expr(children[1]), parse_expr(children[2])]
    throw "a condition expression must have 2 or 3 elements"
}

function parse_operator(div) {
    const children = div.children
    if (!div.hasAttribute("title"))
        throw "the title of the operator has not been given"
    const res = ["operator", div.getAttribute("title")]
    for (let i = 0; i < children.length; ++i)
        res.push(parse_expr(children[i]))
    return res
}

function parse_pair(div) {
    const children = div.children
    if (children.length != 2)
        throw "the pair expression must take two elements"
    return ["pair", parse_expr(children[0]), parse_expr(children[1])]
}

window.onload = () => {
    statementList = document.body.cloneNode(true).children
    for (let i = 0; i < statementList.length; ++i)
        if (statementList[i].tagName.toLowerCase() != 'script')
            statements.push(statementList[i])
    document.body.innerHTML = ""
    eval_statements()
}