// The div Programing Language
// v 0.1.0
//
// Yihao Wang
// 8/3/2020

// the global environment
const global = new Map()

// the list of elements contained in the <body> element, representing the top level statements
const statements = new Array()

// display error message
const error = (e) => document.writeln("<p style='color:red'>ERROR: " + e + "</p>")

// get the expression/statement type from an element
// if the element is a div, then return its class name, else map tag name to the type
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

// deep copy an environment
// no need to deep copy each value in the environment, as they are immutable
// used when creating a new scope
const copy = (map) => {
    let res = new Map()
    for (let [k, v] of map)
        res.set(k, v)
    return res
}

// evaluate the first statement in the statement list
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

// evaluating an in statement displays the prompt onto the document
// and creates an input element, which, once something gets inputed,
// calls the next() function, to continue the evaluation
function eval_in(div) {
    const name = div.id
    const prompt = div.textContent
    document.writeln("<p><label style='color:dimgray;white-space:pre'>" + prompt + "</label>")
    document.writeln("<input style='color:limegreen' onchange='next()' name='" + name +"'></input></p>")
    inputList = document.getElementsByTagName("input")
    inputList[inputList.length - 1].focus()
}

// get called when user input something to the input element
// it creates a variable binding to the global environment
// and go on to evalute the rest statements
function next() {
    const inputList = document.getElementsByTagName("input")
    const input = inputList[inputList.length - 1]
    global.set(input.name, ["value", parse_string(input.value)])
    input.removeAttribute("onchange")
    input.setAttribute("disabled", "disabled")
    statements.splice(0, 1)
    eval_statements()
}

// evaluate the out statement
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

// display the result on the document
function print(expr) {
    document.writeln("<p style='white-space:pre'>" + get_display(expr) + "</p>")
}

// format an expression to a displayable string
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

// parse an html element to an expression
// an expression is represented by a js Array,
// with the first element being a string representing the expression type,
// and the contents are represented by the rest elements in the Array
// e.g. ["value", 3], and
//      ["condition", 
//        ["operator", "equal?", ["value", 3], ["value", 5]], 
//        ["value", "3 == 5"], ["value", "3 != 5"]]
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

// evaluate a parsed expression
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

// value expression: ["value", <literal>]
// evaluates to itself
function eval_value(expr) {
    return expr
}

// scope expression: 
// ["scope", <define expression>* , <expression>]
// creates a new environment, evaluates each contained expression in order
// the evaluation result is the value of the last expression
function eval_scope(expr, env) {
    const new_env = copy(env)
    for (let i = 1; i < expr.length - 1; ++i) {
        if (expr[i][0] != "define")
            throw "define expression expected, " + expr[i][0] + " was given"
        eval_expr(expr[i], new_env)
    }
    return eval_expr(expr[expr.length - 1], new_env)
}

// define expression: ["define", <identifier>, <expression>]
// evalates the last expression, then binds the identifier to the result,
// and add to the current environment
// the evaluation result is the value of the last expression
function eval_define(expr, env) {
    const value = eval_expr(expr[2], env)
    env.set(expr[1], value)
    return value
}

// variable expression: ["variable", <identifier>]
// look up the identifier in the current environment
// the evaluation result is the value found
function eval_variable(expr, env) {
    if (!env.has(expr[1]))
        throw "The variable " + expr[1] + " has not been defined in this scope"
    return env.get(expr[1])
}

// function expression: ["function", <identifier>, <expression>]
// evaluating a function expression creates a closure expression:
// ["closure", <identifier>, <expression>, <environment>]
// first copy the current environment, then add this environment with other parts from
// the function expression to make a closure expression,
// and finally binds the identifier to the closure expression itself and adds it to
// the environment of the closure
// this allows recursive functions
// note that if the identifier is not given, then it is not added to the environment
// evaluating a function expression will not excute the expression within the function
function eval_function(expr, env) {
    const environment = copy(env)
    const closure = ["closure", expr[1], expr[2], environment]
    if (expr[1] !== null)
        environment.set(expr[1], closure)
    return closure
}

// a closure expression evaluates to itself
function eval_closure(expr) {
    return expr
}

// argument expression: ["argument"]
// look up the identifier "___ARGUMENT___" from environment
function eval_argument(env) {
    return env.get("___ARGUMENT___")
}

// call expression: ["call", <function expression>, <expression>]
// first evaluate the function expression to a closure
// then evaluate the last expression, bind the result to "___ARGURMENT___" and add to
// the closure's environment, and then evaluate the expression within the closure
function eval_call(expr, env) {
    const func = eval_expr(expr[1], env)
    if (func[0] != "closure")
        throw func[0] + " is not callable"
    const argument = eval_expr(expr[2], env)
    const new_env = copy(func[3])
    new_env.set("___ARGUMENT___", argument)
    return eval_expr(func[2], new_env)
}

// condition expression: ["condition", <expression>, <expression>, <expression>?]
// first evaluate the first expression, if the result is a value, and its value is
// convertible to true according to js rules, then evalute the second expression,
// otherwise evalute the third expression
// the third expression can be ommitted
// if the third expression is ommitted but the first expression evaluates to false, return null
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

// operator expression: ["operator", <operator name>, <expression>, <expression>?]
// evaluate the expression(s), and then conduct the operation on them(it)
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

// pair expression: ["pair", <expression>, <expression>]
// evaluate the two expressions within the pair, the result is a reducted pair expression
function eval_pair(expr, env) {
    const first = eval_expr(expr[1], env)
    const second = eval_expr(expr[2], env)
    return ["pair", first, second]
}

// parse an html element to a value
function parse_value(div) {
    let value = div.textContent
    return ["value", parse_string(value)]
}

// parse a literal
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

// parse an html element to a scope expression
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

// parse an html element to a define expression
function parse_define(div) {
    const id = div.id
    if (div.children.length == 0)
        throw "empty define for " + id
    return ["define", id, parse_expr(div.children[0])]
}

// parse an html element to a variable expression
function parse_variable(div) {
    const id = div.textContent.trim()
    return ["variable", id]
}

// parse an html element to a function expression
function parse_function(div) {
    let id
    if (!div.hasAttribute("id"))
        id = null
    else
        id = div.id
    return ["function", id, parse_expr(div.children[0])]
}

// parse an html element to an argument expression
function parse_argument() {
    return ["argument"]
}

// parse an html element to a call expression
function parse_call(div) {
    const children = div.children
    if (children.length < 2)
        throw "a call expression must have a function and an argument"
    return ["call", parse_expr(children[0]), parse_expr(children[1])]
}

// parse an html element to a condition expression
function parse_condition(div) {
    const children = div.children
    if (children.length == 2)
        return ["condition", parse_expr(children[0]), parse_expr(children[1])]
    if (children.length == 3)
        return ["condition", parse_expr(children[0]), parse_expr(children[1]), parse_expr(children[2])]
    throw "a condition expression must have 2 or 3 elements"
}

// parse an html element to an operator expression
function parse_operator(div) {
    const children = div.children
    if (!div.hasAttribute("title"))
        throw "the title of the operator has not been given"
    const res = ["operator", div.getAttribute("title")]
    for (let i = 0; i < children.length; ++i)
        res.push(parse_expr(children[i]))
    return res
}

// parse an html element to a pair expression
function parse_pair(div) {
    const children = div.children
    if (children.length != 2)
        throw "the pair expression must take two elements"
    return ["pair", parse_expr(children[0]), parse_expr(children[1])]
}

// start to run the program
window.onload = () => {
    statement_list = document.body.cloneNode(true).children
    for (let i = 0; i < statement_list.length; ++i)
        if (statement_list[i].tagName.toLowerCase() != 'script')
            statements.push(statement_list[i])
    document.body.innerHTML = ""
    eval_statements()
}