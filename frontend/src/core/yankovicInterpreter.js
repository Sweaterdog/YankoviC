// YANKOVIC - The "Dare to be Stupid" Interpreter
import { getFileContent } from './fileApiService.js';
import { UHF_LIBRARY, flushDrawCommands } from './UHF.hat.js';
import { LIKE_A_SERVER_LIBRARY } from './Like_a_Server.hat.js';
import { WEIRD_WIDE_WEB_LIBRARY } from './Weird_Wide_Web.hat.js';
import { VIRUS_ALERT_LIBRARY } from './virus_alert.hat.js';

// console.log('=== YANKOVIC INTERPRETER LOADED v2024-07-06-YODA-RENAME-v4 ===');
// console.log('UHF_LIBRARY keys:', Object.keys(UHF_LIBRARY));

class Scope {
    constructor(parent = null) {
        this.parent = parent;
        this.variables = new Map();
    }
    define(name, value, isStupid = false) {
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
        if (this.variables.has(name)) return this.variables.get(name).value;
        if (this.parent) return this.parent.get(name);
        throw new Error(`Reference Error: The variable '${name}' is not defined. What're you thinkin'?`);
    }
}

export class YankoviCInterpreter {
    constructor(libraryOverrides = {}) {
        this.libraryOverrides = libraryOverrides;
        this.outputBuffer = [];
        this.tokens = [];
        this.pos = 0;
        this.globalScope = null;
        this.polkaLoop = null;
        this.showIsOver = false;
        this.frameCount = 0;
        this.drawCommandBuffer = [];
        this.isRunningFrame = false;
        this.imports = new Map();
        this.projectName = 'default-project';
        this.uiState = { mouse: {}, keys: {}, buttons: {}, textBoxes: {}, checkboxes: {}, sliders: {} };

        // Listen for UI state updates from Electron
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.onUIStateUpdate((state) => { this.uiState = state; });
        }
    }
    log(message) { 
        // Add timestamp and context to understand when logs are generated
        const context = this.isRunningFrame ? '[FRAME]' : '[MAIN]';
        this.outputBuffer.push(`${context} ${message}`); 
    }

    lexer(code) {
        const tokenRegexes = [
            [/^\s+/, null], 
            [/^\/\/.*/, null], 
            [/\/\*[\s\S]*?\*\//, null],
            [/^#eat\s*(<.*?>|".*?"|[a-zA-Z_][a-zA-Z0-9_]*\.hat)/, 'DIRECTIVE'], 
            [/^lunchbox/, 'LUNCHBOX_KEYWORD'],
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

        // --- All parsing functions ---
    parseProgram() {
        const program = { type: 'Program', body: [] };
        while (this.currentToken().type !== 'EOF') {
            program.body.push(this.parseTopLevelDeclaration());
        }
        return program;
    }

    parseTopLevelDeclaration() {
        const token = this.currentToken();
        // console.log('[YankoviC Parser] Parsing top level, current token:', token);
        if (token.type === 'DIRECTIVE') { 
            this.pos++; 
            return { type: 'Directive', value: token.value }; 
        }
        if (token.type === 'LUNCHBOX_KEYWORD') return this.parseLunchboxDeclaration();
        if (token.type === 'TYPE_KEYWORD') return this.parseFunctionDeclaration();
        if (token.type === 'VISIBILITY_KEYWORD') return this.parseFunctionDeclaration();
        if (token.value === ';') { this.pos++; return { type: 'EmptyStatement' }; }
        throw new Error(`Parse Error: Only function or lunchbox declarations are allowed at the top level. [Token: ${JSON.stringify(token)}]`);
    }

    parseLunchboxDeclaration() {
        this.consume('LUNCHBOX_KEYWORD', 'lunchbox');
        const name = this.consume('IDENTIFIER').value;
        this.consume('PUNCTUATION', '{');
        const fields = [];
        while(this.currentToken().value !== '}') {
            const fieldType = this.consume('TYPE_KEYWORD').value;
            const fieldName = this.consume('IDENTIFIER').value;
            fields.push({ name: fieldName, type: fieldType });
            this.consume('PUNCTUATION', ';');
        }
        this.consume('PUNCTUATION', '}');
        if (this.currentToken().value === ';') this.consume('PUNCTUATION', ';');
        return { type: 'LunchboxDeclaration', name, fields };
    }

    parseStatement() {
        const token = this.currentToken();
        if (token.type === 'CONST_KEYWORD' || token.type === 'TYPE_KEYWORD') return this.parseVariableDeclaration();
        if (token.type === 'IDENTIFIER') {
            if (this.peekToken()?.type === 'IDENTIFIER') return this.parseVariableDeclaration();
            return this.parseExpressionStatement();
        }
        if (token.type === 'RETURN_KEYWORD') return this.parseReturnStatement();
        if (token.value === 'jeopardy') return this.parseIfStatement();
        if (token.value === 'hardware_store') return this.parseHardwareStoreStatement();
        if (token.value === 'polka') return this.parsePolkaStatement();
        if (token.value === '{') return this.parseBlock();
        throw new Error(`Parse Error: Unexpected token at start of statement: '${token.value}'`);
    }
    
    parseStatementOrBlock() { if (this.currentToken().value === '{') return this.parseBlock(); return this.parseStatement(); }

    parseFunctionDeclaration() {
        let visibility = 'public';
        if (this.currentToken().type === 'VISIBILITY_KEYWORD') {
            visibility = this.consume('VISIBILITY_KEYWORD').value === 'on_the_menu' ? 'public' : 'private';
        }
        const returnType = this.consume('TYPE_KEYWORD').value;
        const name = this.consume('IDENTIFIER').value;
        this.consume('PUNCTUATION', '(');
        const params = [];
        if (this.currentToken().value !== ')') {
            do {
                if(this.currentToken().value === ',') this.consume('PUNCTUATION', ',');
                const paramTypeToken = this.consume(this.currentToken().type === 'TYPE_KEYWORD' ? 'TYPE_KEYWORD' : 'IDENTIFIER');
                const paramName = this.consume('IDENTIFIER').value;
                params.push({ type: 'Parameter', name: paramName, varType: paramTypeToken.value });
            } while (this.currentToken().value === ',');
        }
        this.consume('PUNCTUATION', ')');
        const body = this.parseBlock();
        return { type: 'FunctionDeclaration', name, returnType, params, body, visibility };
    }
    
    parseBlock() {
        const block = { type: 'BlockStatement', body: [] };
        this.consume('PUNCTUATION', '{');
        while (this.currentToken().value !== '}') {
            block.body.push(this.parseStatement());
        }
        this.consume('PUNCTUATION', '}');
        return block;
    }

    parseVariableDeclaration(isForLoopInit = false) {
        let isStupid = false;
        if (this.currentToken().type === 'CONST_KEYWORD') { isStupid = true; this.consume('CONST_KEYWORD'); }
        const varTypeToken = this.consume(this.currentToken().type === 'TYPE_KEYWORD' ? 'TYPE_KEYWORD' : 'IDENTIFIER');
        const id = this.consume('IDENTIFIER').value;
        let init = null;
        if(this.currentToken().value === '=') { this.consume('OPERATOR', '='); init = this.parseExpression(); }
        if (!isForLoopInit) this.consume('PUNCTUATION', ';');
        return { type: 'VariableDeclaration', id, varType: varTypeToken.value, init, isStupid };
    }

    parseHardwareStoreStatement() {
        this.consume('CONTROL_KEYWORD', 'hardware_store');
        this.consume('PUNCTUATION', '(');
        let init = null;
        if (this.currentToken().value !== ';') { init = this.parseVariableDeclaration(true); } else { this.consume('PUNCTUATION', ';'); }
        let test = null;
        if (this.currentToken().value !== ';') { test = this.parseExpression(); }
        this.consume('PUNCTUATION', ';');
        let update = null;
        if (this.currentToken().value !== ')') { update = this.parseExpression(); }
        this.consume('PUNCTUATION', ')');
        const body = this.parseStatementOrBlock();
        return { type: 'HardwareStoreStatement', init, test, update, body };
    }
    
    parsePolkaStatement() {
        this.consume('CONTROL_KEYWORD', 'polka');
        this.consume('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        const body = this.parseStatementOrBlock();
        return { type: 'PolkaStatement', test, body };
    }

    parseReturnStatement() {
        this.consume('RETURN_KEYWORD');
        const argument = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        return { type: 'ReturnStatement', argument };
    }

    parseIfStatement() {
        this.consume('CONTROL_KEYWORD', 'jeopardy');
        this.consume('PUNCTUATION', '(');
        const test = this.parseExpression();
        this.consume('PUNCTUATION', ')');
        const consequent = this.parseStatementOrBlock();
        let alternate = null;
        if (this.currentToken().value === 'another_one') { this.consume('CONTROL_KEYWORD'); alternate = this.parseStatementOrBlock(); }
        return { type: 'IfStatement', test, consequent, alternate };
    }

    parseExpressionStatement() {
        const expression = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        return { type: 'ExpressionStatement', expression };
    }

    parseExpression() { return this.parseAssignmentExpression(); }
    
    parseAssignmentExpression() {
        const left = this.parseBinaryExpression();
        if (this.currentToken().value === '=') {
            this.consume('OPERATOR');
            const right = this.parseAssignmentExpression();
            if (left.type !== 'Identifier' && left.type !== 'MemberExpression') throw new Error("Parse Error: Invalid assignment target.");
            return { type: 'AssignmentExpression', left, right };
        }
        return left;
    }

    parseBinaryExpression(precedence = 0) {
        let expr = this.parseUnaryExpression();
        while (true) {
            const opToken = this.currentToken();
            if (opToken.type !== 'OPERATOR' || this.getOperatorPrecedence(opToken.value) <= precedence) break;
            const currentPrecedence = this.getOperatorPrecedence(opToken.value);
            this.consume('OPERATOR');
            const right = this.parseBinaryExpression(currentPrecedence);
            expr = { type: 'BinaryExpression', operator: opToken.value, left: expr, right };
        }
        return expr;
    }
    
    parseUnaryExpression() {
        if (this.currentToken().value === '!' || this.currentToken().value === '-') {
            const operator = this.consume('OPERATOR').value;
            const right = this.parseUnaryExpression();
            return { type: 'UnaryExpression', operator, right };
        }
        return this.parseMemberAccessExpression();
    }

    getOperatorPrecedence(op) {
        switch(op) {
            case '||': return 1; case '&&': return 2;
            case '==': case '!=': return 3;
            case '<': case '>': case '<=': case '>=': return 4;
            case '+': case '-': return 5;
            case '*': case '/': return 6;
            default: return 0;
        }
    }

    parseMemberAccessExpression() {
        let expr = this.parsePrimary();
        while(this.currentToken().type === 'DOT') {
            this.consume('DOT');
            const property = this.consume('IDENTIFIER');
            expr = { type: 'MemberExpression', object: expr, property: { type: 'Identifier', name: property.value } };
        }
        return expr;
    }

    parsePrimary() {
        const token = this.currentToken();
        if (token.type === 'NUMBER') { this.pos++; return { type: 'Literal', value: parseFloat(token.value) }; }
        if (token.type === 'STRING') { this.pos++; return { type: 'Literal', value: token.value }; }
        if (token.type === 'BOOLEAN') { this.pos++; return { type: 'Literal', value: token.value === 'its_a_fact' }; }
        if (token.type === 'IDENTIFIER') {
            if (this.peekToken()?.value === '(') return this.parseCallExpression();
            this.pos++; return { type: 'Identifier', name: token.value };
        }
        if (token.value === '(') { this.consume('PUNCTUATION', '('); const expr = this.parseExpression(); this.consume('PUNCTUATION', ')'); return expr; }
        throw new Error(`Parse Error: Unexpected token ${token.type} ('${token.value}')`);
    }

    parseCallExpression() {
        const callee = this.consume('IDENTIFIER').value;
        this.consume('PUNCTUATION', '(');
        const args = [];
        if (this.currentToken().value !== ')') {
             do {
                if(this.currentToken().value === ',') this.consume('PUNCTUATION', ',');
                args.push(this.parseExpression());
            } while (this.currentToken().value === ',');
        }
        this.consume('PUNCTUATION', ')');
        return { type: 'CallExpression', callee, args };
    }
    
    async createGlobalScope() {
        const scope = new Scope();
        scope.define('perform_a_parody', {
            type: 'NativeFunction',
            call: (args) => {
                let formatString = String(args[0] || '');
                let argIndex = 1;
                const result = formatString.replace(/%verse|%spatula|%horoscope/g, (match) => {
                    const val = args[argIndex++];
                    return val === true ? 'its_a_fact' : val === false ? 'total_baloney' : String(val);
                });
                this.log(result);
                // Print directly to terminal if running in Node.js (CLI)
                if (typeof process !== 'undefined' && process.stdout && typeof process.stdout.write === 'function') {
                    process.stdout.write(result + '\n');
                }
            }
        });

        // This is the core of the fix.
        // If we were given a special set of functions (the "overrides"), we use them.
        if (Object.keys(this.libraryOverrides).length > 0) {
            for (const [name, func] of Object.entries(this.libraryOverrides)) {
                scope.define(name, { type: 'NativeFunction', call: func });
            }
        } else {
            // Otherwise, we behave as normal for the IDE and non-Electron CLI.
            this.loadMath(scope);
        }
        return scope;
    }

    async interpret(node, scope) {
         if (!node) return;
         switch (node.type) {
            case 'Program':
                for (const statement of node.body) {
                    // ---> CORRECTED: Check for API client before processing imports
                    if (statement.type === 'Directive' && typeof window !== 'undefined' && getFileContent) {
                        await this.processImport(statement, scope);
                    } else if (statement.type === 'FunctionDeclaration' || statement.type === 'LunchboxDeclaration') {
                        await this.interpret(statement, scope);
                    }
                }
                const mainFn = scope.get('want_a_new_duck');
                if (!mainFn) throw new Error("Program does not contain a 'want_a_new_duck' function.");
                await this.callFunction(mainFn, [], scope);
                return;
            
            case 'Directive': return; // Imports handled above or by pre-processor
            case 'EmptyStatement': return;

            case 'LunchboxDeclaration':
                scope.define(node.name, { type: 'LunchboxDefinition', name: node.name, fields: node.fields });
                return;
            
            case 'FunctionDeclaration': 
                const funcDef = { type: 'Function', name: node.name, params: node.params, body: node.body, closure: scope, visibility: node.visibility || 'public' };
                scope.define(node.name, funcDef); 
                return;
            case 'BlockStatement': 
                const blockScope = new Scope(scope);
                for (const statement of node.body) {
                    await this.interpret(statement, blockScope);
                    if (this.polkaLoop && !this.isRunningFrame) return;
                }
                return;
            case 'HardwareStoreStatement':
                const loopScope = new Scope(scope);
                if (node.init) await this.interpret(node.init, loopScope);
                while (true) {
                    if (this.polkaLoop) return;
                    let testResult = true;
                    if (node.test) testResult = await this.interpret(node.test, loopScope);
                    if (!testResult) break;
                    await this.interpret(node.body, loopScope);
                    if (this.polkaLoop) return;
                    if (node.update) await this.interpret(node.update, loopScope);
                }
                return;
            case 'PolkaStatement':
                this.polkaLoop = {
                    test: node.test,
                    body: node.body,
                    scope: new Scope(scope)
                };
                this.log("Polka loop initialized and ready for frame-based execution.");
                return;
            
            case 'VariableDeclaration':
                let value = node.init ? await this.interpret(node.init, scope) : undefined;
                
                const primitiveTypes = ['spatula', 'lasagna', 'lyric', 'verse', 'horoscope', 'accordion_solo'];
                if (!primitiveTypes.includes(node.varType)) {
                    const typeDef = scope.get(node.varType);
                    if (typeDef && typeDef.type === 'LunchboxDefinition') {
                        value = {}; // Instantiate a lunchbox
                    } else {
                        throw new Error(`Runtime Error: Unknown type '${node.varType}'.`);
                    }
                }
                
                scope.define(node.id, value, node.isStupid);
                return;

            case 'ExpressionStatement': await this.interpret(node.expression, scope); return;
            case 'IfStatement': if (await this.interpret(node.test, scope)) { await this.interpret(node.consequent, scope); } else if (node.alternate) { await this.interpret(node.alternate, scope); } return;
            case 'ReturnStatement': throw { isReturnValue: true, value: await this.interpret(node.argument, scope) };
            case 'AssignmentExpression':
                 const valueToAssign = await this.interpret(node.right, scope);
                 if (node.left.type === 'Identifier') { scope.assign(node.left.name, valueToAssign); }
                 else if (node.left.type === 'MemberExpression') {
                     const targetObject = await this.interpret(node.left.object, scope);
                     if (typeof targetObject !== 'object' || targetObject === null) throw new Error(`Runtime Error: Cannot assign to property of a non-lunchbox value.`);
                     targetObject[node.left.property.name] = valueToAssign;
                 }
                 return valueToAssign;
            case 'UnaryExpression':
                const rightUnary = await this.interpret(node.right, scope);
                switch(node.operator) {
                    case '!': return !rightUnary;
                    case '-': return -rightUnary;
                }
                return;
            case 'BinaryExpression':
                const left = await this.interpret(node.left, scope);
                if (node.operator === '||') return left || await this.interpret(node.right, scope);
                if (node.operator === '&&') return left && await this.interpret(node.right, scope);
                const right = await this.interpret(node.right, scope);
                switch (node.operator) {
                    case '+': return left + right; case '-': return left - right; case '*': return left * right; case '/': return left / right; case '%': return left % right;
                    case '==': return left === right; case '!=': return left !== right;
                    case '<': return left < right; case '>': return left > right; case '<=': return left <= right; case '>=': return left >= right;
                }
                return;
            case 'MemberExpression':
                const object = await this.interpret(node.object, scope);
                if (typeof object !== 'object' || object === null) throw new Error(`Runtime Error: Cannot access property '${node.property.name}' of a non-lunchbox value.`);
                return object[node.property.name];
            case 'CallExpression':
                const func = scope.get(node.callee);
                if (!func || (typeof func.call !== 'function' && func.type !== 'Function')) throw new Error(`Runtime Error: '${node.callee}' is not a function.`);
                const args = [];
                for (const arg of node.args) {
                    args.push(await this.interpret(arg, scope));
                }
                return await this.callFunction(func, args, scope);
            case 'Identifier': return scope.get(node.name);
            case 'Literal': return node.value;
            default: throw new Error(`Interpret Error: Unknown AST node type ${node.type}`);
        }
    }

    
    async callFunction(func, args, callingScope) {
        if (func.type === 'NativeFunction') {
            return await func.call.bind(this)(args); // Bind 'this' to access interpreter state
        }
        const functionScope = new Scope(func.closure);
        func.params.forEach((param, i) => {
            functionScope.define(param.name, args[i]);
        });
        try { await this.interpret(func.body, functionScope); }
        catch (e) { if (e.isReturnValue) return e.value; throw e; }
        return undefined; 
    }

    async runFrame() {
        if (!this.polkaLoop) return null;

        this.frameCount++;
        this.isRunningFrame = true;

        try {
            const testResult = await this.interpret(this.polkaLoop.test, this.polkaLoop.scope);
            if (testResult) {
                await this.interpret(this.polkaLoop.body, this.polkaLoop.scope);
                this.isRunningFrame = false;
                return this.drawCommandBuffer;
            } else {
                this.stopLoop();
                this.isRunningFrame = false;
                return null;
            }
        } catch (error) {
            this.log(`FATAL WORD CRIME in loop: ${error.message}`);
            this.stopLoop();
            this.isRunningFrame = false;
            return null;
        }
    }
    
    stopLoop() {
        if (!this.polkaLoop) return;
        if (typeof window !== 'undefined' && window.uhfAPI) {
            window.uhfAPI.cancelTheShow();
        }
        this.polkaLoop = null;
        this.showIsOver = true;
    }

    async run(code) {
        this.outputBuffer = [];
        this.pos = 0;
        this.polkaLoop = null;
        this.showIsOver = false;
        this.frameCount = 0;
        this.drawCommandBuffer = [];
        this.code = code;
        let exitCode = 27;

        try {
            this.tokens = this.lexer(code);
            this.globalScope = await this.createGlobalScope();
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

    
    // --- NATIVE LIBRARY LOADERS ---
    async loadUHF(scope) {
        if (typeof window !== 'undefined' && window.uhfAPI) {
            for (const [funcName, funcDef] of Object.entries(UHF_LIBRARY)) {
                scope.define(funcName, funcDef);
            }
            return;
        }
        const uhfLib = {
            start_the_show: { type: 'NativeFunction', call: args => { this.drawCommandBuffer.push({command:'start_show', args}); return 27; } },
            cancel_the_show: { type: 'NativeFunction', call: () => { this.drawCommandBuffer.push({command:'cancel_show', args:[]}); this.showIsOver = true; } },
            the_shows_over: { type: 'NativeFunction', call: () => this.showIsOver },
            set_polka_speed: { type: 'NativeFunction', call: args => { this.frameRate = args[0]||60; } },
            roll_the_camera: { type: 'NativeFunction', call: () => this.drawCommandBuffer = [] },
            that_is_a_wrap: { type: 'NativeFunction', call: () => this.drawCommandBuffer.push({command:'render_frame', args:[]}) },
            wait_for_a_moment: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'wait', args:[args[0]||1000]}) },
            paint_the_set: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'paint_set', args:[args[0]||'BLACK']}) },
            pick_a_hawaiian_shirt: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'pick_shirt', args:[args[0]]}) },
            draw_a_spamsicle: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_spamsicle', args}) },
            draw_a_big_ol_wheel_of_cheese: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_cheese', args}) },
            print_a_string_at: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'print_string', args}) },
            draw_a_button: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_button', args}) },
            button_was_clicked: { type: 'NativeFunction', call: args => false },
            draw_a_checkbox: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_checkbox', args}) },
            get_checkbox_value: { type: 'NativeFunction', call: args => false },
            draw_a_slider: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_slider', args}) },
            get_slider_value: { type: 'NativeFunction', call: args => 0 },
            mouse_was_clicked: { type: 'NativeFunction', call: () => false },
            get_mouse_x: { type: 'NativeFunction', call: () => 0 },
            get_mouse_y: { type: 'NativeFunction', call: () => 0 },
            AL_RED: { type: 'Literal', value: { r: 237, g: 28,  b: 36,  a: 255 } },
            WHITE_ZOMBIE: { type: 'Literal', value: { r: 240, g: 240, b: 240, a: 255 } },
            BLACK_MAGIC: { type: 'Literal', value: { r: 16,  g: 16,  b: 16,  a: 255 } },
            SPAM_GREEN: { type: 'Literal', value: { r: 0,   g: 255, b: 0,   a: 255 } },
            TWINKIE_GOLD: { type: 'Literal', value: { r: 255, g: 242, b: 0,   a: 255 } },
            ORANGE_CHEESE: { type: 'Literal', value: { r: 255, g: 127, b: 39,  a: 255 } },
            SKY_BLUE_FOR_YOU: { type: 'Literal', value: { r: 135, g: 206, b: 235, a: 255 } },
            SILVER_SPATULA: { type: 'Literal', value: { r: 200, g: 200, b: 200, a: 255 } }
        };
        for (const [name, def] of Object.entries(uhfLib)) {
            scope.define(name, def);
        }
    }
    
    loadMath(scope) {
        const mathLib = {
            sin: { type: 'NativeFunction', call: (args) => Math.sin(args[0]) },
            cos: { type: 'NativeFunction', call: (args) => Math.cos(args[0]) },
            random_spatula: { type: 'NativeFunction', call: () => Math.floor(Math.random() * 100) },
            yoda: { type: 'NativeFunction', call: (args) => args[0] % args[1] }
        };
        for(const func in mathLib) scope.define(func, mathLib[func]);
    }

    loadInput(scope) {
        const inputLib = {
            ask_the_audience: { 
                type: 'NativeFunction', 
                call: () => {
                    if (typeof window !== 'undefined') {
                        return prompt("Enter a value:") || "";
                    } else {
                        try {
                            const readlineSync = require('readline-sync');
                            return readlineSync.question("Enter a value: ");
                        } catch (e) { console.log("Warning: readline-sync not available"); return ""; }
                    }
                }
            },
        };
        for(const func in inputLib) scope.define(func, inputLib[func]);
    }

    loadLikeAServer(scope) {
        // console.log('[Interpreter] Loading Like_a_Server library');
        for (const [funcName, funcDef] of Object.entries(LIKE_A_SERVER_LIBRARY)) {
            scope.define(funcName, funcDef);
        }
        // console.log('[Interpreter] Loaded', Object.keys(LIKE_A_SERVER_LIBRARY).length, 'Like_a_Server functions');
    }

    loadWeirdWideWeb(scope) {
        // console.log('[Interpreter] Loading Weird_Wide_Web library');
        for (const [funcName, funcDef] of Object.entries(WEIRD_WIDE_WEB_LIBRARY)) {
            scope.define(funcName, funcDef);
        }
        // console.log('[Interpreter] Loaded', Object.keys(WEIRD_WIDE_WEB_LIBRARY).length, 'Weird_Wide_Web functions');
    }

    loadVirusAlert(scope) {
        // console.log('[Interpreter] Loading Virus_Alert library');
        for (const [funcName, funcDef] of Object.entries(VIRUS_ALERT_LIBRARY)) {
            scope.define(funcName, funcDef);
        }
        // console.log('[Interpreter] Loaded', Object.keys(VIRUS_ALERT_LIBRARY).length, 'Virus_Alert functions');
    }

    async processImport(directive, scope) {
        // console.log('[YankoviC Import] Processing import:', directive.value);
        
        // --- THIS IS THE FIX ---
        // If library overrides are present, we are in a special execution context
        // (like the --electron CLI runner) where all necessary functions are already
        // injected. In this case, we should IGNORE standard library imports because
        // they have already been provided.
        if (Object.keys(this.libraryOverrides).length > 0) {
            console.log('[YankoviC Import] Skipping import in special execution context (library overrides present)');
            return; 
        }

        // --- Original logic for IDE and non-electron CLI modes ---
        const match = directive.value.match(/#eat\s*(?:<(.+?)>|"(.+?)"|([a-zA-Z_][a-zA-Z0-9_]*\.hat))/);
        if (!match) {
            console.log('[YankoviC Import] No match found for directive');
            return;
        }
        let filePath = match[1] || match[2] || match[3];
        // console.log('[YankoviC Import] Extracted filePath:', filePath);

        // Normalize import name for built-in libraries
        const normalized = filePath.toLowerCase().replace(/\.hat(\.js)?$/, '');
        // console.log('[YankoviC Import] Normalized name:', normalized);
        const builtins = {
            'uhf': () => this.loadUHF(scope),
            'albuquerque': () => this.loadMath(scope),
            'like_a_server': () => this.loadLikeAServer(scope),
            'weird_wide_web': () => this.loadWeirdWideWeb(scope),
            'virus_alert': () => this.loadVirusAlert(scope)
        };
        // console.log('[YankoviC Import] Builtins available:', Object.keys(builtins));
        if (builtins[normalized]) {
            // console.log(`[YankoviC Import] Loading built-in library: ${normalized}`);
            return builtins[normalized]();
        } else {
            // console.log(`[YankoviC Import] Built-in library not found for: ${normalized}, falling back to user file load.`);
        }

        // console.log('[YankoviC Import] Attempting to load user file:', filePath);
        if (this.imports.has(filePath)) {
            // console.log('[YankoviC Import] File already imported, skipping');
            return;
        }
        this.imports.set(filePath, true);
        
        try {
            // console.log('[YankoviC Import] Getting file content for:', filePath);
            const content = await getFileContent(this.projectName, filePath);
            // console.log('[YankoviC Import] File content received, length:', content.length);
            // console.log('[YankoviC Import] First 100 chars of content:', content.slice(0, 100));
            const tokens = this.lexer(content);
            const oldState = { pos: this.pos, tokens: this.tokens };
            this.tokens = tokens;
            this.pos = 0;
            const ast = this.parseProgram();
            // Interpret the imported file in the current scope
            await this.interpret(ast, scope);
            // Restore parser state
            this.tokens = oldState.tokens;
            this.pos = oldState.pos;
        } catch (error) {
            // console.log('[YankoviC Import] Import error:', error.message);
            throw new Error(`Import Error: Failed to import '${filePath}': ${error.message}`);
        }
    }
}