// YANKOVIC - The "Dare to be Stupid" Interpreter
import { getFileContent } from './fileApiService.js';
import { UHF_LIBRARY, flushDrawCommands } from './UHF.hat.js';
import { LIKE_A_SERVER_LIBRARY } from './Like_a_Server.hat.js';
import { WEIRD_WIDE_WEB_LIBRARY } from './Weird_Wide_Web.hat.js';
import { VIRUS_ALERT_LIBRARY } from './virus_alert.hat.js';

// Import readline for CLI input, only in Node.js environment


// console.log('=== YANKOVIC INTERPRETER LOADED v2024-07-06-YODA-RENAME-v4 ===');
// console.log('UHF_LIBRARY keys:', Object.keys(UHF_LIBRARY));

class Scope {
    constructor(parent = null) {
        this.parent = parent;
        this.variables = new Map();
    }
    set(name, value, isStupid = false) {
        if (this.variables.has(name) && this.variables.get(name).isStupid) throw new Error(`Word Crime! Cannot reassign a 'stupid' variable: ${name}`);
        this.variables.set(name, { value, isStupid });
    }
    assign(name, value) {
        if (this.variables.has(name)) {
            if (this.variables.get(name).isStupid) throw new Error(`Word Crime! Cannot reassign a 'stupid' variable: ${name}`);
            return this.variables.set(name, { ...this.variables.get(name), value });
        }
        if (this.parent) return this.parent.assign(name, value);
        throw new Error(`Reference Error: Cannot assign to undeclared variable '${name}'.`);
    }
    get(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name).value;
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        // Fallback to global scope for functions
        if (this.parent === null && globalThis.interpreter && globalThis.interpreter.globalScope.variables.has(name)) {
            return globalThis.interpreter.globalScope.get(name);
        }
        throw new Error(`Reference Error: The variable '${name}' is not defined. What're you thinkin'?`);
    }
}

export class YankoviCInterpreter {
    constructor(options = {}) {
        console.log("--- Interpreter Constructor ---");
        console.log("Received options:", options);
        console.log("Is streamPrintFunction a function?", typeof options.streamPrintFunction === 'function');

        this.globalScope = new Scope();
        this.outputBuffer = [];
        this.libraries = new Map();
        this.polkaLoop = false;
        this.frameCount = 0;
        this.maxFrames = null;
        this.isFrameRunning = false;
        this.activeSagas = []; // For async operations
        this.libraryOverrides = options.libraryOverrides || {};

        // Allow custom I/O functions to be passed in
        this.printFunction = options.printFunction || ((text) => this.outputBuffer.push(text));
        this.streamPrintFunction = options.streamPrintFunction || ((text) => {
            // Default behavior if no stream function is provided
            const last = this.outputBuffer.length > 0 ? this.outputBuffer.pop() : '';
            this.outputBuffer.push(last + text);
        });
        this.inputFunction = options.inputFunction || (() => Promise.resolve(""));

        console.log("Assigned streamPrintFunction:", this.streamPrintFunction.toString());
        console.log("-----------------------------");

        this.initializeStandardLibrary();
        globalThis.interpreter = this; // Make interpreter instance globally available
    }

    log(message) {
        this.printFunction(message);
    }

    initializeStandardLibrary() {
        this.globalScope.set('perform_a_parody', {
            type: 'NativeFunction',
            call: (args) => {
                if (args.length === 0) return;
                let formatString = args[0];
                let argIndex = 1;
                const result = formatString.replace(/%(\w+)/g, (match, type) => {
                    if (argIndex < args.length) {
                        const value = args[argIndex++];
                        if (type === 'verse') return String(value);
                        if (type === 'spatula') return Number(value);
                        if (type === 'horoscope') return value ? 'its_a_fact' : 'total_baloney';
                        return match; // Return original if type is unknown
                    }
                    return match;
                });
                this.printFunction(result);
            }
        });

        this.globalScope.set('string_along', {
            type: 'NativeFunction',
            call: (args) => {
                this.streamPrintFunction(args.join(' '));
            }
        });

        this.globalScope.set('the_saga_begins', {
            type: 'NativeFunction',
            call: (args) => {
                const [funcName, ...funcArgs] = args;
                console.log(`[SAGA] Starting saga for: ${funcName}`);
                const func = this.globalScope.get(funcName);
                if (!func) {
                    throw new Error(`Function '${funcName}' not found for the_saga_begins.`);
                }
                const sagaPromise = this.callFunction(func, funcArgs, this.globalScope)
                    .catch(e => console.error(`[SAGA] Error in background saga '${funcName}':`, e));
                
                this.activeSagas.push(sagaPromise);
                console.log(`[SAGA] Active sagas: ${this.activeSagas.length}`);
                return this.activeSagas.length;
            }
        });

        this.globalScope.set('wait_for_the_saga_to_end', {
            type: 'NativeFunction',
            call: async () => {
                console.log(`[SAGA] Waiting for ${this.activeSagas.length} sagas to finish...`);
                await Promise.all(this.activeSagas);
                console.log("[SAGA] All sagas have finished.");
                this.activeSagas = []; // Clear for next batch
                return null;
            }
        });

        this.globalScope.set('flesh_eating_weasels', {
            type: 'NativeFunction',
            call: async (args) => {
                const prompt = args[0] || '';

                // IDE/Electron environment
                if (this.inputProvider) {
                    return this.inputProvider(prompt);
                }

                // CLI (Node.js) environment
                if (!readline) {
                    this.log("FATAL WORD CRIME: CLI input is not supported in this environment.");
                    return "";
                }

                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                return new Promise(resolve => {
                    rl.question(prompt, (answer) => {
                        rl.close();
                        resolve(answer);
                    });
                });
            }
        });

        // This is the core of the fix.
        // If we were given a special set of functions (the "overrides"), we use them.
        if (Object.keys(this.libraryOverrides).length > 0) {
            for (const [name, func] of Object.entries(this.libraryOverrides)) {
                this.globalScope.set(name, { type: 'NativeFunction', call: func });
            }
        } else {
            // Otherwise, we behave as normal for the IDE and non-Electron CLI.
            this.loadMath(this.globalScope);
        }
        return this.globalScope;
    }

    lexer(code) {
        const tokenRegexes = [
            [/^\s+/, null], 
            [/^\/\/.*/, null], 
            [/\/\*[\s\S]*?\*\//, null],
            // Updated: match #eat <...>, #eat "...", #eat something.hat, #eat something.yc, with flexible whitespace and optional trailing comments
            [/^#eat\s+(<\s*[^>]+\s*>|"\s*[^\"]+\s*"|[.\/a-zA-Z0-9_\-]+\.(?:hat|yc))(\s*\/\/.*)?/, 'DIRECTIVE'], 
            [/^lunchbox/, 'LUNCHBOX_KEYWORD'],
            [/^dare_to_be_stupid/, 'TRY_KEYWORD'],
            [/^put_down_the_chainsaw/, 'CATCH_KEYWORD'],
            [/^on_the_menu|^private_stash/, 'VISIBILITY_KEYWORD'],
            [/^spatula|^lasagna|^lyric|^verse|^horoscope|^accordion_solo/, 'TYPE_KEYWORD'],
            [/^jeopardy|^another_one|^polka|^hardware_store/, 'CONTROL_KEYWORD'],
            [/^twinkie_wiener_sandwich/, 'RETURN_KEYWORD'],
            [/^stupid/, 'CONST_KEYWORD'],
            [/^its_a_fact|^total_baloney/, 'BOOLEAN'],
            [/^\d+\.\d+/, 'NUMBER'], [/^\d+/, 'NUMBER'],
            [/^"([^"]*)"/, 'STRING'],
            [/^'([^']*)'/, 'STRING'],
            // Put operators BEFORE identifiers to ensure proper tokenization
            [/^(?:\|\||&&|==|!=|<=|>=|[=+*\/><!%-])/, 'OPERATOR'],
            [/^[a-zA-Z_][a-zA-Z0-9_]*/, 'IDENTIFIER'],
            [/^\./, 'DOT'],
            [/^[{};(),]/, 'PUNCTUATION'],
        ];
        let tokens = []; let position = 0;
        while (position < code.length) {
            let match = null;
            for (const [regex, type] of tokenRegexes) {
                const result = regex.exec(code.slice(position));
                if (result) { match = { value: result[0], type, raw: result[1] }; break; }
            }
            if (!match) throw new Error(`Syntax Error: Unexpected character at position ${position}: ${code[position]}`);
            if (match.type) {
                const tokenValue = match.type === 'STRING' ? match.raw || match.value.slice(1, -1) : match.value;
                const token = { type: match.type, value: tokenValue };
                tokens.push(token);
                // console.log('[YankoviC Lexer] Token:', token);
            }
            position += match.value.length;
        }
        tokens.push({type: "EOF", value: "EOF"});
        // console.log('[YankoviC Lexer] All tokens:', tokens);
        return tokens;
    }

    currentToken() { return this.tokens[this.pos]; }
    peekToken(offset = 1) { return this.tokens[this.pos + offset]; }
    consume(type, value = null) {
        const token = this.currentToken();
        if (token.type === type && (value === null || token.value === value)) { this.pos++; return token; }
        throw new Error(`Parse Error: Expected ${type} ('${value || 'any'}') but got ${token.type} ('${token.value}')`);
    }

    parseProgram() {
        const program = { type: 'Program', body: [] };
        // Allow comments and #eat directives anywhere before the first function/lunchbox
        while (this.currentToken().type !== 'EOF') {
            program.body.push(this.parseTopLevelDeclaration());
        }
        return program;
    }

    parseTopLevelDeclaration() {
        const current = this.currentToken();
        if (current.type === 'DIRECTIVE') {
            return this.parseDirective();
        } else if (current.type === 'TYPE_KEYWORD' || this.peekToken().type === 'TYPE_KEYWORD') {
            return this.parseFunctionDeclaration();
        } else if (current.type === 'LUNCHBOX_KEYWORD' || this.peekToken().type === 'LUNCHBOX_KEYWORD') {
            return this.parseLunchboxDeclaration();
        } else {
            return this.parseStatement();
        }
    }

    parseDirective() {
        const directive = this.consume('DIRECTIVE');
        return { type: 'Directive', value: directive.value };
    }

    parseFunctionDeclaration() {
        let visibility = 'on_the_menu'; // Default visibility
        if (this.currentToken().type === 'VISIBILITY_KEYWORD') {
            visibility = this.consume('VISIBILITY_KEYWORD').value;
        }
        const returnType = this.consume('TYPE_KEYWORD');
        const name = this.consume('IDENTIFIER');
        this.consume('PUNCTUATION', '(');
        const params = [];
        while (this.currentToken().value !== ')') {
            const paramVis = this.currentToken().type === 'VISIBILITY_KEYWORD' ? this.consume('VISIBILITY_KEYWORD').value : 'private_stash';
            const paramType = this.consume('TYPE_KEYWORD');
            const paramName = this.consume('IDENTIFIER');
            params.push({ visibility: paramVis, type: paramType.value, name: paramName.value });
            if (this.currentToken().value === ',') this.consume('PUNCTUATION', ',');
        }
        this.consume('PUNCTUATION', ')');
        const body = this.parseBlock();
        return { type: 'FunctionDeclaration', visibility, returnType: returnType.value, name: name.value, params, body };
    }

    parseLunchboxDeclaration() {
        let visibility = 'on_the_menu'; // Default visibility
        if (this.currentToken().type === 'VISIBILITY_KEYWORD') {
            visibility = this.consume('VISIBILITY_KEYWORD').value;
        }
        this.consume('LUNCHBOX_KEYWORD');
        const name = this.consume('IDENTIFIER').value;
        this.consume('PUNCTUATION', '{');
        const members = [];
        while (this.currentToken().value !== '}') {
            const memberVis = this.currentToken().type === 'VISIBILITY_KEYWORD' ? this.consume('VISIBILITY_KEYWORD').value : 'private_stash';
            const memberType = this.consume('TYPE_KEYWORD').value;
            const memberName = this.consume('IDENTIFIER').value;
            this.consume('PUNCTUATION', ';');
            members.push({ visibility: memberVis, type: memberType, name: memberName });
        }
        this.consume('PUNCTUATION', '}');
        return { type: 'LunchboxDeclaration', visibility, name, members };
    }

    parseTryCatchStatement() {
        this.consume('TRY_KEYWORD');
        const tryBlock = this.parseBlock();
        let catchParam = null;
        let catchBlock = null;
        if (this.currentToken().value === 'put_down_the_chainsaw') {
            this.consume('CATCH_KEYWORD');
            this.consume('PUNCTUATION', '(');
            catchParam = this.parseIdentifier();
            this.consume('PUNCTUATION', ')');
            catchBlock = this.parseBlock();
        }
        return { type: 'TryCatchStatement', tryBlock, catchParam, catchBlock };
    }

    parseBlock() {
        this.consume('PUNCTUATION', '{');
        const body = [];
        while (this.currentToken().value !== '}') {
            body.push(this.parseStatement());
        }
        this.consume('PUNCTUATION', '}');
        return { type: 'BlockStatement', body };
    }

    parseStatement() {
        const current = this.currentToken();
        switch (current.type) {
            case 'CONTROL_KEYWORD':
                switch (current.value) {
                    case 'jeopardy':
                        return this.parseIfStatement();
                    case 'polka':
                        return this.parseWhileStatement();
                    case 'hardware_store':
                        return this.parseForStatement();
                }
            case 'RETURN_KEYWORD':
                return this.parseReturnStatement();
            case 'TYPE_KEYWORD':
            case 'CONST_KEYWORD':
                return this.parseVariableDeclaration();
            case 'LUNCHBOX_KEYWORD':
                return this.parseLunchboxDeclaration();
            case 'TRY_KEYWORD':
                return this.parseTryCatchStatement();
            default:
                return this.parseExpressionStatement();
        }
    }

    parseIfStatement() {
        this.consume('CONTROL_KEYWORD', 'jeopardy');
        this.consume('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        const consequent = this.parseBlock();
        let alternate = null;
        if (this.currentToken().value === 'another_one') {
            this.consume('CONTROL_KEYWORD', 'another_one');
            alternate = this.parseBlock();
        }
        return { type: 'IfStatement', test, consequent, alternate };
    }

    parseWhileStatement() {
        this.consume('CONTROL_KEYWORD', 'polka');
        this.consume('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        const body = this.parseBlock();
        return { type: 'WhileStatement', test, body };
    }

    parseForStatement() {
        this.consume('CONTROL_KEYWORD', 'hardware_store');
        this.consume('PUNCTUATION', '(');
        const init = this.parseVariableDeclaration();
        const test = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        const update = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        const body = this.parseBlock();
        return { type: 'ForStatement', init, test, update, body };
    }

    parseReturnStatement() {
        this.consume('RETURN_KEYWORD');
        const argument = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        return { type: 'ReturnStatement', argument };
    }

    parseVariableDeclaration() {
        let isConst = false;
        if (this.currentToken().type === 'CONST_KEYWORD') {
            this.consume('CONST_KEYWORD');
            isConst = true;
        }
        const type = this.consume('TYPE_KEYWORD').value;
        const name = this.consume('IDENTIFIER').value;
        let init = null;
        if (this.currentToken().value === '=') {
            this.consume('OPERATOR', '=');
            init = this.parseExpression();
        }
        this.consume('PUNCTUATION', ';');
        return { type: 'VariableDeclaration', kind: type, name, init, isConst };
    }

    parseExpressionStatement() {
        const expr = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        return { type: 'ExpressionStatement', expression: expr };
    }

    parseExpression() {
        return this.parseAssignmentExpression();
    }

    parseAssignmentExpression() {
        let left = this.parseLogicalExpression();
        if (this.currentToken().type === 'OPERATOR' && this.currentToken().value === '=') {
            this.consume('OPERATOR', '=');
            const right = this.parseAssignmentExpression();
            return { type: 'AssignmentExpression', operator: '=', left, right };
        }
        return left;
    }

    parseLogicalExpression() {
        let left = this.parseEqualityExpression();
        while (this.currentToken().type === 'OPERATOR' && ['&&', '||'].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseEqualityExpression();
            left = { type: 'LogicalExpression', operator, left, right };
        }
        return left;
    }

    parseEqualityExpression() {
        let left = this.parseRelationalExpression();
        while (this.currentToken().type === 'OPERATOR' && ['==', '!='].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseRelationalExpression();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    parseRelationalExpression() {
        let left = this.parseAdditiveExpression();
        while (this.currentToken().type === 'OPERATOR' && ['<', '>', '<=', '>='].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseAdditiveExpression();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();
        while (this.currentToken().type === 'OPERATOR' && ['+', '-'].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseMultiplicativeExpression();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    parseMultiplicativeExpression() {
        let left = this.parseUnaryExpression();
        while (this.currentToken().type === 'OPERATOR' && ['*', '/', '%'].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseUnaryExpression();
            left = { type: 'BinaryExpression', operator, left, right };
        }
        return left;
    }

    parseUnaryExpression() {
        if (this.currentToken().type === 'OPERATOR' && ['!', '-', '+'].includes(this.currentToken().value)) {
            const operator = this.consume('OPERATOR').value;
            const argument = this.parseUnaryExpression();
            return { type: 'UnaryExpression', operator, argument };
        }
        return this.parsePrimaryExpression();
    }

    parsePrimaryExpression() {
        const current = this.currentToken();
        switch (current.type) {
            case 'NUMBER':
                return { type: 'Literal', value: Number(this.consume('NUMBER').value) };
            case 'STRING':
                return { type: 'Literal', value: this.consume('STRING').value };
            case 'BOOLEAN':
                return { type: 'Literal', value: current.value === 'its_a_fact' };
            case 'IDENTIFIER':
                return this.parseIdentifierExpression();
            case 'PUNCTUATION':
                if (current.value === '(') {
                    this.consume('PUNCTUATION', '(');
                    const expr = this.parseExpression();
                    this.consume('PUNCTUATION', ')');
                    return expr;
                }
            default:
                throw new Error(`Unexpected token in primary expression: ${current.type}`);
        }
    }

    parseIdentifierExpression() {
        const id = this.parseIdentifier();
        if (this.currentToken().value === '(') {
            return this.parseCallExpression(id);
        }
        return id;
    }

    parseCallExpression(callee) {
        this.consume('PUNCTUATION', '(');
        const args = [];
        while (this.currentToken().value !== ')') {
            args.push(this.parseExpression());
            if (this.currentToken().value === ',') this.consume('PUNCTUATION', ',');
        }
        this.consume('PUNCTUATION', ')');
        return { type: 'CallExpression', callee, arguments: args };
    }

    parseIdentifier() {
        const token = this.consume('IDENTIFIER');
        return { type: 'Identifier', name: token.value };
    }

    async interpret(node, scope) {
        switch (node.type) {
            case 'Program':
                for (const statement of node.body) {
                    await this.interpret(statement, scope);
                }
                break;
            case 'Directive':
                await this.processImport(node, scope);
                break;
            case 'FunctionDeclaration':
                scope.set(node.name, {
                    type: 'Function',
                    params: node.params,
                    body: node.body,
                    closure: scope
                });
                break;
            case 'LunchboxDeclaration':
                const lunchboxType = {
                    type: 'LunchboxType',
                    members: node.members.reduce((acc, m) => {
                        acc[m.name] = { type: m.type, visibility: m.visibility };
                        return acc;
                    }, {})
                };
                scope.set(node.name, lunchboxType);
                break;
            case 'TryCatchStatement':
                try {
                    await this.interpret(node.tryBlock, scope);
                } catch (error) {
                    if (node.catchBlock) {
                        const catchScope = new Scope(scope);
                        catchScope.set(node.catchParam.name, error.message); // Pass error message as string
                        await this.interpret(node.catchBlock, catchScope);
                    } else {
                        throw error;
                    }
                }
                break;
            case 'BlockStatement':
                const blockScope = new Scope(scope);
                for (const stmt of node.body) {
                    await this.interpret(stmt, blockScope);
                }
                break;
            case 'IfStatement':
                const testValue = await this.interpret(node.test, scope);
                if (testValue) {
                    await this.interpret(node.consequent, scope);
                } else if (node.alternate) {
                    await this.interpret(node.alternate, scope);
                }
                break;
            case 'WhileStatement':
                while (await this.interpret(node.test, scope)) {
                    await this.interpret(node.body, scope);
                }
                break;
            case 'ForStatement':
                const forScope = new Scope(scope);
                await this.interpret(node.init, forScope);
                while (await this.interpret(node.test, forScope)) {
                    await this.interpret(node.body, forScope);
                    await this.interpret(node.update, forScope);
                }
                break;
            case 'ReturnStatement':
                const returnValue = await this.interpret(node.argument, scope);
                const error = new Error('Return');
                error.isReturnValue = true;
                error.value = returnValue;
                throw error;
            case 'VariableDeclaration':
                const initValue = node.init ? await this.interpret(node.init, scope) : undefined;
                scope.set(node.name, initValue, node.isConst);
                break;
            case 'ExpressionStatement':
                await this.interpret(node.expression, scope);
                break;
            case 'AssignmentExpression':
                const left = node.left;
                if (left.type !== 'Identifier') throw new Error('Invalid assignment target');
                const value = await this.interpret(node.right, scope);
                scope.assign(left.name, value);
                break;
            case 'BinaryExpression':
            case 'LogicalExpression':
                const leftVal = await this.interpret(node.left, scope);
                const rightVal = await this.interpret(node.right, scope);
                switch (node.operator) {
                    case '+': return leftVal + rightVal;
                    case '-': return leftVal - rightVal;
                    case '*': return leftVal * rightVal;
                    case '/': return leftVal / rightVal;
                    case '%': return leftVal % rightVal;
                    case '==': return leftVal === rightVal;
                    case '!=': return leftVal !== rightVal;
                    case '<': return leftVal < rightVal;
                    case '>': return leftVal > rightVal;
                    case '<=': return leftVal <= rightVal;
                    case '>=': return leftVal >= rightVal;
                    case '&&': return leftVal && rightVal;
                    case '||': return leftVal || rightVal;
                    default: throw new Error(`Unknown operator: ${node.operator}`);
                }
            case 'UnaryExpression':
                const arg = await this.interpret(node.argument, scope);
                switch (node.operator) {
                    case '!': return !arg;
                    case '-': return -arg;
                    case '+': return +arg;
                    default: throw new Error(`Unknown unary operator: ${node.operator}`);
                }
            case 'Literal':
                return node.value;
            case 'Identifier':
                return scope.get(node.name);
            case 'CallExpression':
                const callee = await this.interpret(node.callee, scope);
                const args = [];
                for (const arg of node.arguments) {
                    args.push(await this.interpret(arg, scope));
                }
                return await this.callFunction(callee, args, scope);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    async callFunction(func, args, scope) {
        if (func.type === 'NativeFunction') {
            const boundCall = func.call.bind(this);
            const result = boundCall(args);
            return await Promise.resolve(result);
        }
        if (func.type !== 'Function') {
            throw new Error(`'${func.name}' is not a function.`);
        }
        const functionScope = new Scope(func.closure);
        func.params.forEach((param, i) => {
            functionScope.set(param.name, args[i]);
        });
        try { await this.interpret(func.body, functionScope); }
        catch (e) { if (e.isReturnValue) return e.value; throw e; }
        return undefined; 
    }

    async run(code, entryFilePath = null) {
        this.outputBuffer = [];
        this.pos = 0;
        this.polkaLoop = null;
        this.showIsOver = false;
        this.frameCount = 0;
        this.drawCommandBuffer = [];
        this.code = code;
        this.currentFilePath = entryFilePath || null;
        let exitCode = 27;
        try {
            this.tokens = this.lexer(code);
            const ast = this.parseProgram();
            await this.interpret(ast, this.globalScope);
            if (!this.polkaLoop) {
                 this.log("Program finished.");
            } else {
                 this.log("Graphics program initialized. Polka loop is now running...");
            }
        } catch (e) {
             console.error('YankoviC Interpreter Error:', e);
             if (e.isReturnValue) exitCode = e.value;
             else { 
                 this.log(`FATAL WORD CRIME: ${e.message}`); 
                 console.error('Full error object:', e);
                 exitCode = 1; 
             }
        }
        return { output: this.outputBuffer.join('\n'), exitCode };
    }

    // --- Universal, recursive import resolution ---
    async processImport(directive, scope) {
        // console.log('[YankoviC Import] Processing import directive:', directive.value);
        if (Object.keys(this.libraryOverrides).length > 0) {
            // console.log('[YankoviC Import] Skipping import in special execution context (library overrides present)');
            return;
        }
        // Parse import directive
        const match = directive.value.match(/#eat\s*(?:<(.+?)>|"(.+?)"|([a-zA-Z_][a-zA-Z0-9_]*\.(?:hat|yc)))/);
        if (!match) {
            console.log('[YankoviC Import] No match found for directive:', directive.value);
            return;
        }
        let filePath = match[1] || match[2] || match[3];
        // Enforce import rules
        if (match[2] && !filePath.endsWith('.hat')) {
            throw new Error('Import Error: Quoted imports only work for .hat files. Use #eat myfile.yc for .yc files.');
        }
        if (this.currentFilePath && !filePath.match(/^([/\\]|[a-zA-Z]:)/)) {
            const base = this.currentFilePath.split('/').slice(0, -1).join('/');
            filePath = base + '/' + filePath;
            filePath = filePath.replace(/\\/g, '/').replace(/\/\//g, '/');
            const parts = [];
            for (const part of filePath.split('/')) {
                if (part === '.' || part === '') continue;
                if (part === '..') parts.pop();
                else parts.push(part);
            }
            filePath = parts.join('/');
        }
        // console.log('[YankoviC Import] Final resolved file path for import:', filePath);
        const normalized = filePath.toLowerCase().replace(/\.(hat|yc)(\.js)?$/, '');
        const builtins = {
            'uhf': () => this.loadUHF(scope),
            'albuquerque': () => this.loadMath(scope),
            'like_a_server': () => this.loadLikeAServer(scope),
            'weird_wide_web': () => this.loadWeirdWideWeb(scope),
            'virus_alert': () => this.loadVirusAlert(scope)
        };
        if (builtins[normalized]) {
            // console.log('[YankoviC Import] Loading built-in library:', normalized);
            return builtins[normalized]();
        }
        // User file import (recursive)
        for (const ext of ['.hat', '.yc']) {
            let importPath = filePath;
            if (!importPath.endsWith(ext)) importPath = importPath.replace(/\.(hat|yc)$/, ext);
            if (this.imports.has(importPath)) {
                // console.log('[YankoviC Import] File already imported, skipping:', importPath);
                return;
            }
            try {
                this.imports.set(importPath, true);
                const content = await getFileContent(this.projectName, importPath);
                // Recursively scan for #eat directives in the imported file
                const importTokens = this.lexer(content);
                for (let i = 0; i < importTokens.length; i++) {
                    if (importTokens[i].type === 'DIRECTIVE') {
                        await this.processImport({ value: importTokens[i].value }, scope);
                    }
                }
                // Parse and interpret the imported file
                const oldState = { pos: this.pos, tokens: this.tokens, currentFilePath: this.currentFilePath };
                this.tokens = importTokens;
                this.pos = 0;
                this.currentFilePath = importPath;
                const ast = this.parseProgram();
                await this.interpret(ast, scope);
                this.tokens = oldState.tokens;
                this.pos = oldState.pos;
                this.currentFilePath = oldState.currentFilePath;
                // console.log('[YankoviC Import] Import completed successfully:', importPath);
                return;
            } catch (error) {
                console.error('[YankoviC Import] Error importing file:', importPath, error);
            }
        }
        throw new Error(`Import Error: Failed to import user file '${filePath}': File not found or invalid import syntax.`);
    }

    // --- Built-in Math Library: Albuquerque ---
    loadMath(scope) {
        // Trig functions
        scope.set('sin', { type: 'NativeFunction', call: (args) => Math.sin(args[0]) });
        scope.set('cos', { type: 'NativeFunction', call: (args) => Math.cos(args[0]) });
        scope.set('tan', { type: 'NativeFunction', call: (args) => Math.tan(args[0]) });
        scope.set('asin', { type: 'NativeFunction', call: (args) => Math.asin(args[0]) });
        scope.set('acos', { type: 'NativeFunction', call: (args) => Math.acos(args[0]) });
        scope.set('atan', { type: 'NativeFunction', call: (args) => Math.atan(args[0]) });
        // Exponentials and roots
        scope.set('pow', { type: 'NativeFunction', call: (args) => Math.pow(args[0], args[1]) });
        scope.set('sqrt', { type: 'NativeFunction', call: (args) => Math.sqrt(args[0]) });
        scope.set('abs', { type: 'NativeFunction', call: (args) => Math.abs(args[0]) });
        // Rounding
        scope.set('floor', { type: 'NativeFunction', call: (args) => Math.floor(args[0]) });
        scope.set('ceil', { type: 'NativeFunction', call: (args) => Math.ceil(args[0]) });
        scope.set('round', { type: 'NativeFunction', call: (args) => Math.round(args[0]) });
        // Random and modulo
        scope.set('random_spatula', { type: 'NativeFunction', call: () => Math.floor(Math.random() * 100) });
        scope.set('yoda', { type: 'NativeFunction', call: (args) => args[0] % args[1] });
        // Constants
        scope.set('PI', { type: 'NativeFunction', call: () => Math.PI });
        scope.set('E', { type: 'NativeFunction', call: () => Math.E });
        // Weird Al–themed aliases (for fun)
        scope.set('eat_a_spam', { type: 'NativeFunction', call: (args) => Math.abs(args[0]) });
        scope.set('like_a_surgeon', { type: 'NativeFunction', call: (args) => Math.sqrt(args[0]) });
        scope.set('dare_to_be_stupid', { type: 'NativeFunction', call: (args) => Math.random() });
    }

    // --- Built-in UHF Graphics Library ---
    loadUHF(scope) {
        // Import all functions/constants from UHF_LIBRARY into the given scope
        for (const [name, value] of Object.entries(UHF_LIBRARY)) {
            // If it's a function, bind 'this' to the interpreter for UI state access
            if (value && typeof value === 'object' && value.type === 'NativeFunction') {
                // Bind interpreter context for UI state, draw buffer, etc.
                scope.set(name, { ...value, call: value.call.bind(this) });
            } else {
                scope.set(name, value);
            }
        }
    }

    // --- Built-in Like_a_Server Library ---
    loadLikeAServer(scope) {
        for (const [name, value] of Object.entries(LIKE_A_SERVER_LIBRARY)) {
            if (value && typeof value === 'object' && value.type === 'NativeFunction') {
                scope.set(name, { ...value, call: value.call.bind(this) });
            } else {
                scope.set(name, value);
            }
        }
    }
    // --- Built-in Weird_Wide_Web Library ---
    loadWeirdWideWeb(scope) {
        for (const [name, value] of Object.entries(WEIRD_WIDE_WEB_LIBRARY)) {
            if (value && typeof value === 'object' && value.type === 'NativeFunction') {
                scope.set(name, { ...value, call: value.call.bind(this) });
            } else {
                scope.set(name, value);
            }
        }
    }
    // --- Built-in Virus_Alert Library ---
    loadVirusAlert(scope) {
        for (const [name, value] of Object.entries(VIRUS_ALERT_LIBRARY)) {
            if (value && typeof value === 'object' && value.type === 'NativeFunction') {
                scope.set(name, { ...value, call: value.call.bind(this) });
            } else {
                scope.set(name, value);
            }
        }
    }
}