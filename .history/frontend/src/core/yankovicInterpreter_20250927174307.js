// YANKOVIC - The "Dare to be Stupid" Interpreter
import { getFileContent } from './fileApiService.js';
import { UHF_LIBRARY, flushDrawCommands } from './UHF.hat.js';
import { LIKE_A_SERVER_LIBRARY } from './Like_a_Server.hat.js';
import { WEIRD_WIDE_WEB_LIBRARY } from './Weird_Wide_Web.hat.js';
import { VIRUS_ALERT_LIBRARY } from './virus_alert.hat.js';


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
    constructor({ printFunction, streamPrintFunction, inputFunction, libraryOverrides = {} } = {}) {
        this.globalScope = new Scope();
        this.outputBuffer = [];
        this.libraries = new Map();
        this.polkaLoop = false;
        this.frameCount = 0;
        this.maxFrames = null;
        this.isFrameRunning = false;
        this.activeSagas = []; // For async operations
        this.libraryOverrides = libraryOverrides;

        // Allow custom I/O functions to be passed in
        this.printFunction = printFunction || ((text) => this.outputBuffer.push(text));
        this.streamPrintFunction = streamPrintFunction || ((text) => {
            const last = this.outputBuffer.length > 0 ? this.outputBuffer.pop() : '';
            this.outputBuffer.push(last + text);
        });
        this.inputFunction = inputFunction || (() => Promise.resolve(""));
        
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

                // IDE/Browser environment
                if (this.inputProvider) {
                    return this.inputProvider(prompt);
                }

                // CLI (Node.js) environment - dynamically import readline
                if (typeof process !== 'undefined' && process.stdin.isTTY) {
                    try {
                        const readline = await import('readline');
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
                    } catch (e) {
                        this.log(`FATAL WORD CRIME: Could not initialize CLI input. ${e.message}`);
                        return "";
                    }
                }
                
                // Fallback for non-interactive Node.js or other environments
                this.log("FATAL WORD CRIME: CLI input is not supported in this environment.");
                return "";
            }
        });

        // This is the core of the fix.
        // If we were given a special set of functions (the "overrides"), we use them.
        if (Object.keys(this.libraryOverrides).length > 0) {
            for (const [name, func] of Object.entries(this.libraryOverrides)) {
                this.globalScope.set(name, { type: 'NativeFunction', call: func });
            }
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
        // Allow comments and #eat directives anywhere before the first function/lunchbox
        while (this.currentToken().type !== 'EOF') {
            const currentToken = this.currentToken();
            
            // Accept #eat directives and empty statements (comments/whitespace)
            if (currentToken.type === 'DIRECTIVE' || currentToken.type === 'EmptyStatement') {
                program.body.push(this.parseTopLevelDeclaration());
                continue;
            }
            // Accept function or lunchbox declarations
            if (currentToken.type === 'LUNCHBOX_KEYWORD' || currentToken.type === 'TYPE_KEYWORD' || currentToken.type === 'VISIBILITY_KEYWORD') {
                program.body.push(this.parseTopLevelDeclaration());
                continue;
            }
            // Check if this is a user-defined lunchbox type used as a return type
            if (currentToken.type === 'IDENTIFIER' && this.declaredLunchboxTypes.has(currentToken.value)) {
                program.body.push(this.parseTopLevelDeclaration());
                continue;
            }
            // Accept stray semicolons (from comments/whitespace)
            if (currentToken.value === ';') {
                this.pos++;
                continue;
            }
            // If we see anything else, error
            console.error('[YankoviC Parser] UNEXPECTED TOKEN at top level:', JSON.stringify(currentToken));
            console.error('[YankoviC Parser] Position:', this.pos, 'of', this.tokens.length);
            console.error('[YankoviC Parser] Previous 3 tokens:', this.tokens.slice(Math.max(0, this.pos - 3), this.pos));
            console.error('[YankoviC Parser] Next 3 tokens:', this.tokens.slice(this.pos + 1, this.pos + 4));
            console.error('[YankoviC Parser] Declared lunchbox types:', Array.from(this.declaredLunchboxTypes));
            throw new Error(`Parse Error: Only function, lunchbox, #eat, or comments are allowed at the top level. [Token: ${JSON.stringify(currentToken)}]`);
        }
        return program;
    }

    parseTopLevelDeclaration() {
        const token = this.currentToken();
        
        if (token.type === 'DIRECTIVE') { 
            this.pos++; 
            return { type: 'Directive', value: token.value }; 
        }
        if (token.type === 'LUNCHBOX_KEYWORD') {
            return this.parseLunchboxDeclaration();
        }
        if (token.type === 'TYPE_KEYWORD') {
            return this.parseFunctionDeclaration();
        }
        if (token.type === 'VISIBILITY_KEYWORD') {
            return this.parseFunctionDeclaration();
        }
        // Check if this is a user-defined lunchbox type used as a return type
        if (token.type === 'IDENTIFIER' && this.declaredLunchboxTypes.has(token.value)) {
            return this.parseFunctionDeclaration();
        }
        if (token.value === ';') { 
            this.pos++; 
            return { type: 'EmptyStatement' }; 
        }
        
        console.error('[YankoviC Parser] UNHANDLED TOKEN in parseTopLevelDeclaration:', JSON.stringify(token));
        console.error('[YankoviC Parser] Token position:', this.pos, 'of', this.tokens.length);
        console.error('[YankoviC Parser] Surrounding tokens:', this.tokens.slice(Math.max(0, this.pos - 2), this.pos + 3));
        console.error('[YankoviC Parser] Declared lunchbox types:', Array.from(this.declaredLunchboxTypes));
        throw new Error(`Parse Error: Only function or lunchbox declarations are allowed at the top level. [Token: ${JSON.stringify(token)}]`);
    }

    parseLunchboxDeclaration() {
        this.consume('LUNCHBOX_KEYWORD', 'lunchbox');
        const name = this.consume('IDENTIFIER').value;
        
        // Track this lunchbox type for future function declarations
        this.declaredLunchboxTypes.add(name);
        console.log('[YankoviC Parser] Registered lunchbox type:', name);
        
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
        if (token.value === 'dare_to_be_stupid') return this.parseTryCatchStatement();
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

    parseTryCatchStatement() {
        this.consume('IDENTIFIER', 'dare_to_be_stupid');
        const tryBlock = this.parseBlock();
        let catchParam = null;
        let catchBlock = null;
        if (this.currentToken().value === 'put_down_the_chainsaw') {
            this.consume('IDENTIFIER', 'put_down_the_chainsaw');
            this.consume('PUNCTUATION', '(');
            catchParam = this.consume('IDENTIFIER').value;
            this.consume('PUNCTUATION', ')');
            catchBlock = this.parseBlock();
        }
        return { type: 'TryCatchStatement', tryBlock, catchParam, catchBlock };
    }

    parseStatementOrBlock() { if (this.currentToken().value === '{') return this.parseBlock(); return this.parseStatement(); }

    parseFunctionDeclaration() {
        let visibility = 'public';
        if (this.currentToken().type === 'VISIBILITY_KEYWORD') {
            visibility = this.consume('VISIBILITY_KEYWORD').value === 'on_the_menu' ? 'public' : 'private';
        }
        
        // The return type can be either a TYPE_KEYWORD or a user-defined lunchbox type (IDENTIFIER)
        let returnType;
        const currentToken = this.currentToken();
        if (currentToken.type === 'TYPE_KEYWORD') {
            returnType = this.consume('TYPE_KEYWORD').value;
        } else if (currentToken.type === 'IDENTIFIER' && this.declaredLunchboxTypes.has(currentToken.value)) {
            returnType = this.consume('IDENTIFIER').value;
            console.log('[YankoviC Parser] Using user-defined return type:', returnType);
        } else {
            throw new Error(`Parse Error: Expected return type (built-in or user-defined), got ${currentToken.type}: ${currentToken.value}`);
        }
        
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
        // Add support for stop_forwarding_that_crap as a sleep statement
        if (this.currentToken().value === 'stop_forwarding_that_crap') {
            return this.parseSleepStatement();
        }
        const expression = this.parseExpression();
        this.consume('PUNCTUATION', ';');
        return { type: 'ExpressionStatement', expression };
    }

    parseSleepStatement() {
        this.consume('IDENTIFIER', 'stop_forwarding_that_crap');
        let duration = 0;
        let pentium = null;
        if (this.currentToken().value !== ';') {
            duration = this.parseExpression();
            if (this.currentToken().value !== ';') {
                pentium = this.parseExpression();
            }
        }
        this.consume('PUNCTUATION', ';');
        return { type: 'SleepStatement', duration, pentium };
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
    
    async interpret(node, scope) {
         if (!node) return;
         switch (node.type) {
            case 'Program':
                for (const statement of node.body) {
                    if (statement.type === 'Directive') {
                        await this.processImport(statement, scope);
                    } else {
                        await this.interpret(statement, scope);
                    }
                }
                const mainFn = scope.get('want_a_new_duck');
                if (mainFn) {
                    await this.callFunction(mainFn, [], scope);
                }
                return;
            
            case 'Directive': return; // Imports handled above or by pre-processor
            case 'EmptyStatement': return;

            case 'LunchboxDeclaration':
                scope.set(node.name, { type: 'LunchboxDefinition', name: node.name, fields: node.fields });
                return;
            
            case 'FunctionDeclaration': 
                const funcDef = { type: 'Function', name: node.name, params: node.params, body: node.body, closure: scope, visibility: node.visibility || 'public' };
                scope.set(node.name, funcDef); 
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
                
                scope.set(node.id, value, node.isStupid);
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

    
    async callFunction(func, args, scope) {
        if (!func) {
            throw new Error(`Attempted to call a non-existent function.`);
        }

        if (func.type === 'NativeFunction') {
            // Bind 'this' to the interpreter instance for native functions
            const boundCall = func.call.bind(this);
            const result = boundCall(args);
            // Ensure native async functions are awaited
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
            // The global scope is now created in the constructor
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
        // Parse import directive to see what's being requested
        const match = directive.value.match(/#eat\s*(?:<(.+?)>|"(.+?)"|([a-zA-Z_][a-zA-Z0-9_]*\.(?:hat|yc)))/);
        if (!match) {
            // console.log('[YankoviC Import] No match found for directive:', directive.value);
            return;
        }

        let filePath = match[1] || match[2] || match[3];
        const normalized = filePath.toLowerCase().replace(/\.(hat|yc)(\.js)?$/, '');

        // If we are in an override context (like --electron) and trying to load UHF, skip it.
        // This allows other libraries like <albuquerque.hat> to still be loaded.
        if (normalized === 'uhf' && Object.keys(this.libraryOverrides).length > 0) {
            // console.log('[YankoviC Import] Skipping <UHF.hat> due to library overrides.');
            return;
        }
        
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