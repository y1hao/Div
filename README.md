# The div Programing Language

## Introduction
People keep saying that html is a **markup** language, not a **programing** language. While this is true, it kinds of ignores the expressiveness of the html language. The tree structure of a DOM suits very well to the job of representing an astract syntax tree. 

The **div Programing Languange** is an experiment which aims to illustrate the expressiveness of html. The so called div language is just a piece of js code which works as an interpreter. When you add this piece of code to an html5 file, it totally changes the semantics of all elements in the document, and turns the html file to a functional, lisp-like language.

To use Div, all you need to do is to add `div.js` to the `<head>` part of your html file, for example, if you download `div.js` file to the same level of the html file, then just add this line: 

```html
<script src="./div.js"></script>
```
And now you can write programs directly with the html `<div>`s.

Here is the hello world example:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>hello world</title>
        <script src="./div.js"></script>
    </head>
    <body>
        <div class="out">
            <div class="value">"hello world"</div>
        </div>
    </body>      
</html>
```
This program will display `'hello world'` on the screen when you open it with a browser

You can also use other tags than `<div>`s, as a short cut. For example, the `<body>` part of the hello world example could also be written as:
```html
<main><i>"hello world"</i></main>
```

This is much simpler.

Here is another example. It computes the greatest common divisor of two user inputs (only shows the `<body>` part for simpliciy):
```html
<body>
    <cite id="a">Please input the first number:</cite>
    <cite id="b">Please input the second number:</cite>
    <main><i>"The gcd is: "</i></main>
    <main>
        <div class="call">
            <div class="function" id="gcd">
                <article>
                    <section id="first"><div class="operator" title="car"><label></label></div></section>
                    <section id="second"><div class="operator" title="cdr"><label></label></div></section>
                    <nav>
                        <div class="operator" title="equal?"><a>second</a><i>0</i></div>
                        <a>first</a>
                        <div class="call">
                            <a>gcd</a>
                            <aside><a>second</a><div class="operator" title="modulus"><a>first</a><a>second</a></div></aside>
                        </div>
                    </nav>
                </article>
            </div>
            <aside><a>a</a><a>b</a></aside>
        </div>
    </main>
</body>    
```

## Language specification
### Program structure
A div program is written inside the `<body>` element in a html5 file. A program is composed of a series of statements. These statements are excuted in order.
### Statements
There are only two statements in the div language. These are `in statement` and `out statement`. They deal with IO. Everything else is an expression.
#### in statement
The `in statement` is in the following format:
```html
<div class="in" id="[identifier]"> [prompt] </div>
```
or
```html
<cite id="[identifier]"> [prompt] </cite>
```
Here `[prompt]` is a string to display to the user, `[identifier]` is a variable identifier. A variable identifier can be anything acceptible as the value of `id` attribute in html. Variables with the same identifier is not allowed in div (even in different scopes), because the `id` attribute could not have repeated value throughout the document.

The `in statement` displays the prompt message to the user, and an `<input>` element. Once the user input something into the `<input>`, it creates a top-level variable binding to the identifier provided.

#### out statement
Anything other than the user input goes inside the `out statement`. The `out statement` is in the format:
```html
<div class="out"> [expression] </div>
```
or
```html
<main> [expression] </main>
```
The `out statement` first evaluates the expression inside of it, and then displays its result on the screen. One `out statement` can only hold one expression. For multple output, you may use multiple `out statement`.

The expressions are explained next.

### Expressions
There are 10 expressions in div.

#### literal expression
The `literal expression` is in the format:
```html
<div class="value"> [literal] </div>
```
or
```html
<i> [literal] </i>
```
The `literal` expression represent a literal. The `[literal]` must be a number literal (64-bit floating point, not including `NaN`), boolean literal (`true` or `false`), `null`, or a string (wrapped in ""). If the value given is not in "", and not `true`, `false`, or `null`, and cannot be converted to a number, then it will be treated as a string.

#### scope expression
The `scope expression` is in the format:
```html
<div class="scope"> 
    [variable binding expression]* 
    [expression]
</div>
```
or
```html
<article> 
    [variable binding expression]*
    [expression]    
</article>
```
The `scope expression` opens a scope. It takes 0 or more `[variable binding expression]`s, add those into the current environment to create a new environment, and evaluate the `[expression]` under this new environment. The value is the value of the last `[expression]`.

#### variable binding expression
The `variable binding expression` is in the format:
```html
<div class="define" id="[identifier]"> [expression] </div>
```
or
```html
<section id="[identifier]"> [expression] </section>
```
The `variable binding expression` binds the evaluation result of `[expression]` to the `[identifier]` in the current scope. The `[identifier]` does not allow repeated value throughout the file. So there are no re-binding, assignment, mutation, or shadowing in the div languange.

#### variable use expression
The `variable use expression` is in the format:
```html
<div class="variable"> [identifier] </div>
```
or
```html
<a> [identifier] </a>
```
The `variable use expression` looks up the `[identifier]` in the current environment. The `[identifier]` is not wrapped in "".

#### function expression
The `function expression` is in the format:
```html
<div class="function" id="[identifier]"?> [expression] </div>
```
This expression does not have short hand tag.

The `function expression` defines a function. Every function in div only takes one argument, so there is no need to give a name to this only argument. The `[expression]` represents the function body. In the body, use a `argument expression` as a placeholder for where the argument is used.

The `function expression` also binds the function itself to the `[identifier]` and adds it to the environment. This allows recursion. The `[identifier]` part is optional, but if it is missing, you cannot call this function in itself.

#### argument expression
The `argument expression` is in the format:
```html
<div class="argument"></div>
```
or
```html
<label></label>
```
The `argument expression` is a placeholder in the function body for the argument. It contains nothing, all contained elements or text will be ignored.

#### condition expression
The `condition expression` is in the format:
```html
<div class="condition"> [expression] [expression] [expression]? </div>
```
or
```html
<nav> [expression] [expression] [expression]? </nav>
```
The `condition expression` takes two or three `[expression]`s. It first evaluates the first one. This one must evaluates to a `literal expression`. If the value is convertible to true according to js rules, the value of the `condition expression` is the value of the second `[expression]`. Otherwise the value is the value of the third `[expression]`.

Only one of the second and third `[expression]`s is evaluated.

The third `[expression]` is optional. If the third `[expression]` is not given but the first `[expression]` evaluates to false, a `literal expression` with value `null` is the evaluating result.

#### pair expression
The `pair expression` is in the format:
```html
<div class="pair"> [expression] [expression] </div>
```
or
```html
<aside> [expression] [expression] </aside>
```
The `pair expression` takes two `[expression]`s, and make a pair of them. The pair is the only compound data structure in div. It can be nested.

#### function call expression
The `function call expression` is in the format:
```html
<div class="call"> [function expression] [expression] </div>
```
or
This expression does not have a short hand tag.

The `function call expression` takes two `[expression]`s. The first must evaluate to a function. Evaluting a `function call expression` will first evalute the `[function expression]` to a function, and then evaluate the `[expression]` to a value. Then it will evaluate the function's body, in which where an `argument expression` is encountered, it will be evaluated to the value of the `[expression]`.

#### operator expression
The `operator expression` is in the format:
```html
<div class="operator" title="[operator name]"> [expression] [expression]? </div>
```
This expression does not have a short hand tag.

The `operator expression` represents the usage of an operator. The name of the operator is given as the title attribute. There are 8 unary operators and 13 binary operators. Where a unary operator is given, the `operator expression` must take exactly 1 `[expression]`; where a binary operator is given, it must take two. 

Evaluating an `operator expression` will evaluate the `[expression]`(s) in order, and perform the operation

**Unary operators:**
|*name*|*result on a value v*|
|--|--|
|`positive`|+v|
|`negative`|-v|
|`not`|!v|
|`increment`|v + 1|
|`decrement`|v - 1|
|`pair?`|`true` if v is a pair, `false` otherwise|
|`car`|the first element of a pair|
|`cdr`|the second element of a pair|

**Binary operators**
|*name*|*result on values a and b*|
|--|--|
|`add`|a + b|
|`minus`|a - b|
|`multiply`|a * b|
|`divide`|a / b (as floating point numebrs)|
|`intdivide`|a / b (as integers)|
|`modulus`|a % b|
|`and`|a && b|
|`or`|a \|\| b|
|`equal?`|a === b|
|`larger?`|a > b|
|`smaller?`|a < b|
|`notlarger?`|a <= b|
|`notsmaller?`|a >= b|

## Programing tips
### Loops
Is it possible to program when there are no loops at all? 

Yes, you can, as long as you can use recursions.
This [example](https://github.com/CoderYihaoWang/Div/blob/master/examples/loveyou365.html) displays 'Love you x' 365 times on the screen (i.e. Love you 1  Love you 2 ... Love you 365). The plan was to write a loveyou3000, but doing so will exceed the limitation of recursions of the browser. Sadly, tail recursion has not been implemented.  

### Arrays
What can I use when I need some data structure like an array, given that the only data structure is simply a pair?

You can use nested pairs. [Here](https://github.com/CoderYihaoWang/Div/blob/master/examples/fibonacci.html) is an example displaying the first nth elements of the Fibonacci sequence onto the screen.

### Multi-argument functions
What can I do if I want to let the functions take multiple arguments, instead of only one?

Say if you want to pass two arguments, you can either wrap the arguments into a pair, and use the operators `car` and `cdr` to extract the elements of the pair inside the function body, or curry the function.

[Here](https://github.com/CoderYihaoWang/Div/blob/master/examples/primes.html) is a comprehensive example which displays the first nth prime numbers in the form of nested pairs. It uses both pairing and currying to deal with multi-argument functions.

As the div program can be extremely hard to read, here is a js version which adopts the same logic:
```js
// suppose the user input is bound to the variable count
const count = 20

const from = n => [n, () => from(n + 1)]
const take = (list, n) => n == 0 ? [] : [list[0], ...take(list[1](), n - 1)]
const sift = p => list => list[0] % p 
                        ? [list[0], () => sift(p)(list[1]())]
                        : sift(p)(list[1]())
const sieve = list => [list[0], () => sieve(sift(list[0])(list[1]()))]

console.log(take(sieve(from(2)), count))
```
