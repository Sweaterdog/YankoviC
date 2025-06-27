// YANKOVIC - The "Dare to be Stupid" Interpreter
// This is the definitive version with a completely rewritten statement parser
// that correctly handles all forms of declarations and expressions.
import { getFileContent } from './fileApiService.js';
import { UHF_LIBRARY, flushDrawCommands } from './UHF.hat.js';

console.log('=== YANKOVIC INTERPRETER LOADED ===');
console.log('UHF_LIBRARY keys:', Object.keys(UHF_LIBRARY));

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
    constructor() {
        this.outputBuffer = [];
        this.tokens = [];
        this.pos = 0;
        this.globalScope = null;
        this.polkaLoop = null; // Stores the AST for the game loop
        this.showIsOver = false; // Track if the UHF window is closed
        this.frameCount = 0; // Track number of frames executed
        this.drawCommandBuffer = []; // THE NEW BUFFER
        this.isRunningFrame = false; // Flag to allow frame execution of polka body
        this.imports = new Map(); // Track imported files to avoid circular imports
        this.projectName = 'default-project'; // Default project name
        this.uiState = { mouse: {}, keys: {}, buttons: {}, textBoxes: {}, checkboxes: {}, sliders: {} };

        // Listen for UI state updates from Electron
        if (typeof window !== 'undefined' && window.electronAPI) {
            window.electronAPI.onUIStateUpdate((state) => {
                this.uiState = state;
                console.log('[YankoviC] UI state updated:', this.uiState);
            });
        }
    }
    log(message) { 
        // Add timestamp and context to understand when logs are generated
        const context = this.isRunningFrame ? '[FRAME]' : '[MAIN]';
        this.outputBuffer.push(`${context} ${message}`); 
    }

    lexer(code) {
        const tokenRegexes = [
            [/^\s+/, null], [/^\/\/.*/, null], [/\/\*[\s\S]*?\*\//, null],
            [/^#eat\s*(<.*?>|".*?")/, 'DIRECTIVE'], 
            [/^lunchbox/, 'LUNCHBOX_KEYWORD'],
            [/^on_the_menu|^private_stash/, 'VISIBILITY_KEYWORD'],
            [/^spatula|^lasagna|^lyric|^verse|^horoscope|^accordion_solo/, 'TYPE_KEYWORD'],
            [/^jeopardy|^another_one|^polka|^hardware_store/, 'CONTROL_KEYWORD'],
            [/^twinkie_wiener_sandwich/, 'RETURN_KEYWORD'],
            [/^stupid/, 'CONST_KEYWORD'],
            [/^its_a_fact|^total_baloney/, 'BOOLEAN'],
            [/^[a-zA-Z_][a-zA-Z0-9_]*/, 'IDENTIFIER'],
            [/^\d+\.\d+/, 'NUMBER'], [/^\d+/, 'NUMBER'],
            [/^"([^"]*)"/, 'STRING'],
            [/^'([^']*)'/, 'STRING'],
            // THE FIX IS HERE, it's a simple case,
            // Just move the hyphen to the final space!
            [/^(?:\|\||&&|==|!=|<=|>=|[=+*\/><!%-])/, 'OPERATOR'],
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
            position += match.value.length;
            if (match.type) tokens.push({ type: match.type, value: match.type === 'STRING' ? match.raw || match.value.slice(1, -1) : match.value });
        }
        tokens.push({type: "EOF", value: "EOF"});
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
        while (this.currentToken().type !== 'EOF') {
            program.body.push(this.parseTopLevelDeclaration());
        }
        return program;
    }

    parseTopLevelDeclaration() {
        const token = this.currentToken();
        if (token.type === 'DIRECTIVE') { 
            this.pos++; 
            return { type: 'Directive', value: token.value }; 
        }
        if (token.type === 'LUNCHBOX_KEYWORD') return this.parseLunchboxDeclaration();
        if (token.type === 'TYPE_KEYWORD') return this.parseFunctionDeclaration();
        if (token.type === 'VISIBILITY_KEYWORD') return this.parseFunctionDeclaration();
        if (token.value === ';') { this.pos++; return { type: 'EmptyStatement' }; }
        throw new Error(`Parse Error: Only function or lunchbox declarations are allowed at the top level of a file.`);
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

    // THIS IS THE COMPLETELY REWRITTEN, CORRECTED FUNCTION
    parseStatement() {
        const token = this.currentToken();

        // Rule 1: Starts with 'stupid' or a primitive type keyword. This MUST be a variable declaration.
        if (token.type === 'CONST_KEYWORD' || token.type === 'TYPE_KEYWORD') {
            return this.parseVariableDeclaration();
        }
        
        // Rule 2: Starts with an Identifier. This could be a Lunchbox type declaration, or an expression.
        if (token.type === 'IDENTIFIER') {
            // If the next token is another identifier, it's a type-variable pair like `Duck my_duck;`
            if (this.peekToken()?.type === 'IDENTIFIER') {
                return this.parseVariableDeclaration();
            }
            // Otherwise, it's the start of an expression like `my_duck.x = ...` or `my_function()`
            return this.parseExpressionStatement();
        }
        
        // Rule 3: Handle all other statement types
        if (token.type === 'RETURN_KEYWORD') return this.parseReturnStatement();
        if (token.value === 'jeopardy') return this.parseIfStatement();
        if (token.value === 'hardware_store') return this.parseHardwareStoreStatement();
        if (token.value === 'polka') return this.parsePolkaStatement();
        if (token.value === '{') return this.parseBlock();

        // If nothing else matches, it's a syntax error.
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
        // A declaration can start with a primitive type or a custom type (Identifier)
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
    }    async createGlobalScope() {
         const scope = new Scope();
         // Always define the core parody function
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
             }
         });
        // Always load UHF and math functions (including random_spatula)
        await this.loadUHF(scope);
        this.loadMath(scope);
        this.loadInput(scope); // Add input functions
        
         return scope;
    }

    async interpret(node, scope) {
        // Removed guard to allow runFrame to evaluate test and body even when polkaLoop is set
         
         if (!node) return;
         switch (node.type) {
            case 'Program':
                // First pass: process imports and define all top-level structures
                for (const statement of node.body) {
                    if (statement.type === 'Directive') {
                        await this.processImport(statement, scope);
                    } else if (statement.type === 'FunctionDeclaration' || statement.type === 'LunchboxDeclaration') {
                        await this.interpret(statement, scope);
                    }
                }
                // Second pass: find and run the main function, which will now have access to all definitions.
                const mainFn = scope.get('want_a_new_duck');
                if (!mainFn) throw new Error("Program does not contain a 'want_a_new_duck' function.");
                await this.callFunction(mainFn, [], scope);
                return;
            
            case 'Directive': return; case 'EmptyStatement': return;

            // THIS IS THE FIX: The interpreter now knows what a LunchboxDeclaration is.
            // It stores the definition in the current scope for later use.
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
                    // Only halt synchronous execution (not during frame runs)
                    if (this.polkaLoop && !this.isRunningFrame) return;
                }
                return;
            case 'HardwareStoreStatement':
                const loopScope = new Scope(scope);
                if (node.init) await this.interpret(node.init, loopScope);
                while (true) {
                    if (this.polkaLoop) return; // Check before loop iteration
                    let testResult = true;
                    if (node.test) testResult = await this.interpret(node.test, loopScope);
                    if (!testResult) break;
                    await this.interpret(node.body, loopScope);
                    if (this.polkaLoop) return; // Check after loop body
                    if (node.update) await this.interpret(node.update, loopScope);
                }
                return;
            case 'PolkaStatement':
                // Store the polka loop for frame-based execution
                this.polkaLoop = {
                    test: node.test,
                    body: node.body,
                    scope: new Scope(scope) // Create a child scope for the loop
                };
                this.log(`Polka loop initialized. showIsOver = ${this.showIsOver}`);
                this.log("Polka loop initialized and ready for frame-based execution.");
                return;
            
            // THIS IS THE SECOND PART OF THE FIX:
            // The interpreter now knows how to create a lunchbox instance.
            case 'VariableDeclaration':
                let value = node.init ? await this.interpret(node.init, scope) : undefined;
                
                const primitiveTypes = ['spatula', 'lasagna', 'lyric', 'verse', 'horoscope', 'accordion_solo'];
                if (!primitiveTypes.includes(node.varType)) {
                    // It's a custom type, so look it up.
                    const typeDef = scope.get(node.varType);
                    if (typeDef && typeDef.type === 'LunchboxDefinition') {
                        value = {}; // Instantiate a lunchbox as a plain JS object
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
            // Always await NativeFunction calls to support async native functions
            return await func.call(args);
        }
        const functionScope = new Scope(func.closure);
        func.params.forEach((param, i) => {
            functionScope.define(param.name, args[i]);
        });
        try { await this.interpret(func.body, functionScope); }
        catch (e) { if (e.isReturnValue) return e.value; throw e; }
        return undefined; 
    }

    // THIS IS THE RE-ARCHITECTED FRAME LOGIC
    async runFrame() {
        if (!this.polkaLoop) return null;

        this.frameCount++; // Increment frame counter
        console.log(`[Interpreter] runFrame called, frameCount = ${this.frameCount}, Electron mode = ${typeof window !== 'undefined' && !!window.uhfAPI}`);
        const { test, body, scope } = this.polkaLoop;
        this.drawCommandBuffer = []; // Clear the buffer for the new frame

        // Set flag to indicate we're running a frame
        this.isRunningFrame = true;

        try {
            const testResult = await this.interpret(test, scope);
            console.log(`[Interpreter] runFrame/testResult: ${testResult}`);
            // Only log test result in CLI mode if verbose debugging is needed
            if (typeof window === 'undefined' && this.frameCount <= 3) {
                this.log(`[CLI] Frame ${this.frameCount} test result: ${testResult}`);
            }
            
            if (testResult) {
                await this.interpret(body, scope);
                // Electron mode: flush commands to UHF window
                if (typeof window !== 'undefined' && window.uhfAPI) {
                    console.log('[Interpreter] Electron mode detected in runFrame, flushing UHF commands');
                    flushDrawCommands();
                    this.isRunningFrame = false;
                    return null;
                }
                // Only log buffer contents for first few frames in CLI
                if (typeof window === 'undefined' && this.frameCount <= 3) {
                    this.log(`[CLI] Frame ${this.frameCount} generated ${this.drawCommandBuffer.length} draw commands`);
                }
                this.isRunningFrame = false;
                return this.drawCommandBuffer; // Return the populated buffer
            } else {
                this.log("Test failed, stopping loop");
                this.stopLoop(); // Gracefully stop if the condition is met
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
        console.log('[Interpreter] stopLoop called - user manually stopped');
        
        // If we're in Electron mode, close the UHF window
        if (typeof window !== 'undefined' && window.uhfAPI) {
            window.uhfAPI.cancelTheShow();
        }
        
        this.polkaLoop = null;
        this.showIsOver = true;
    }

    async run(code) {
        console.log('[Interpreter] run() called with code length:', code.length);
        console.log('[Interpreter] Environment check - window exists:', typeof window !== 'undefined');
        console.log('[Interpreter] Environment check - uhfAPI exists:', typeof window !== 'undefined' && !!window.uhfAPI);
        
        this.outputBuffer = [];
        this.pos = 0;
        this.polkaLoop = null;
        this.showIsOver = false; // Ensure show is not over at start
        this.frameCount = 0; // Reset frame counter
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
        console.log('[Interpreter] loadUHF called');
        console.log('[Interpreter] typeof window:', typeof window);
        console.log('[Interpreter] window.uhfAPI:', window.uhfAPI);
        console.log('[Interpreter] window.uhfAPI exists:', typeof window !== 'undefined' && !!window.uhfAPI);
        
        // If in Electron, use real UHF.hat library
        if (typeof window !== 'undefined' && window.uhfAPI) {
            console.log('[Interpreter] Using Electron UHF_LIBRARY');
            console.log('[Interpreter] UHF_LIBRARY keys:', Object.keys(UHF_LIBRARY));
            for (const [funcName, funcDef] of Object.entries(UHF_LIBRARY)) {
                scope.define(funcName, funcDef);
            }
            console.log('[Interpreter] Loaded', Object.keys(UHF_LIBRARY).length, 'UHF functions');
            return;
        }
        console.log('[Interpreter] Using fallback UHF library - CLI/web mode');
        // Fallback for CLI/web: define minimal draw buffer library
        const uhfLib = {
            start_the_show: { type: 'NativeFunction', call: args => { this.drawCommandBuffer.push({command:'start_show', args}); return 27; } },
            cancel_the_show: { type: 'NativeFunction', call: () => this.drawCommandBuffer.push({command:'cancel_show', args:[]}) },
            the_shows_over: { type: 'NativeFunction', call: () => this.showIsOver },
            set_polka_speed: { type: 'NativeFunction', call: args => { this.frameRate = args[0]||60; } },
            roll_the_camera: { type: 'NativeFunction', call: () => this.drawCommandBuffer = [] },
            that_is_a_wrap: { type: 'NativeFunction', call: () => this.drawCommandBuffer.push({command:'render_frame', args:[]}) },
            wait_for_a_moment: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'wait', args:[args[0]||1000]}) },
            paint_the_void: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'clear_screen', args:[args[0]||'BLACK']}) },
            pick_a_color: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'set_color', args}) },
            draw_a_rectangle: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_rectangle', args}) },
            draw_a_circle: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_circle', args}) },
            draw_a_text: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_text', args}) },
            draw_a_button: { type: 'NativeFunction', call: args => this.drawCommandBuffer.push({command:'draw_button', args}) }
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
            // YOUR BRILLIANT IDEA GOES RIGHT HERE, A BRAND NEW SKILL
            // A function for modulo, to bend the code to our will!
            polka_mod: {
                type: 'NativeFunction',
                call: (args) => {
                    const a = args[0];
                    const b = args[1];
                    // It's just a remainder, it's not hard to do,
                    // Now our parser will finally know what to do!
                    return a % b;
                }
            }
        };
        for(const func in mathLib) scope.define(func, mathLib[func]);
    }

    loadInput(scope) {
        const inputLib = {
            // Basic input functions
            ask_the_audience: { 
                type: 'NativeFunction', 
                call: () => {
                    if (typeof window !== 'undefined') {
                        // Web/Electron mode: use prompt
                        return prompt("Enter a value:") || "";
                    } else {
                        // CLI mode: use readline-sync
                        try {
                            const readlineSync = require('readline-sync');
                            return readlineSync.question("Enter a value: ");
                        } catch (e) {
                            console.log("Warning: readline-sync not available in CLI mode");
                            return "";
                        }
                    }
                }
            },
            ask_the_audience_for_a_number: { 
                type: 'NativeFunction', 
                call: () => {
                    if (typeof window !== 'undefined') {
                        // Web/Electron mode: use prompt
                        const input = prompt("Enter a number:") || "0";
                        return parseFloat(input) || 0;
                    } else {
                        // CLI mode: use readline-sync
                        try {
                            const readlineSync = require('readline-sync');
                            const input = readlineSync.question("Enter a number: ");
                            return parseFloat(input) || 0;
                        } catch (e) {
                            console.log("Warning: readline-sync not available in CLI mode");
                            return 0;
                        }
                    }
                }
            },
            // Text output functions
            print_a_string: {
                type: 'NativeFunction',
                call: (args) => {
                    const text = args[0] || "";
                    if (typeof window !== 'undefined') {
                        console.log(text);
                        // Also add to draw buffer for UI display
                        this.drawCommandBuffer.push({command: 'print_text', args: [text, 10, this.consoleY || 20]});
                        this.consoleY = (this.consoleY || 20) + 20;
                    } else {
                        console.log(text);
                    }
                }
            },
            print_a_number: {
                type: 'NativeFunction',
                call: (args) => {
                    const num = args[0] || 0;
                    if (typeof window !== 'undefined') {
                        console.log(num);
                        // Also add to draw buffer for UI display
                        this.drawCommandBuffer.push({command: 'print_text', args: [num.toString(), 10, this.consoleY || 20]});
                        this.consoleY = (this.consoleY || 20) + 20;
                    } else {
                        console.log(num);
                    }
                }
            },
        };
        for(const func in inputLib) scope.define(func, inputLib[func]);
    }

  async processImport(directive, scope) {
    // Extract the file path from the directive value
    const match = directive.value.match(/#eat\s*(?:<(.+?)>|"(.+?)")/);
    if (!match) {
      throw new Error(`Parse Error: Invalid #eat directive format: ${directive.value}`);
    }
    
    let filePath = match[1] || match[2]; // original path
    // Normalize leading './'
    if (filePath.startsWith('./')) filePath = filePath.slice(2);
    
    // Handle built-in libraries
    if (filePath === 'UHF.hat') {
      // UHF is already loaded in createGlobalScope, so just return
      return;
    }
    if (filePath === 'albuquerque.hat') {
      // Math is already loaded in createGlobalScope, so just return
      return;
    }
    
    // Avoid circular imports
    if (this.imports.has(filePath)) {
      return;
    }
    this.imports.set(filePath, true);
    
    try {
      // Load the .hat file content
      let content;
      if (typeof window === 'undefined') {
        // CLI mode: read from filesystem
        const fs = await import('fs');
        const path = await import('path');
        const fullPath = path.resolve(process.cwd(), 'backend/projects', this.projectName, filePath);
        content = fs.readFileSync(fullPath, 'utf-8');
      } else {
        // Web mode: use API
        content = await getFileContent(this.projectName, filePath);
      }
      
      // Parse and import declarations
      const tokens = this.lexer(content);
      const oldPos = this.pos, oldTokens = this.tokens;
      this.tokens = tokens; this.pos = 0;
      const declarations = [];
      while (this.currentToken().type !== 'EOF') {
        declarations.push(this.parseTopLevelDeclaration());
      }
      for (const stmt of declarations) {
        if (stmt.type === 'FunctionDeclaration' && stmt.visibility === 'public') {
          const funcDef = {
            type: 'Function', name: stmt.name, params: stmt.params,
            body: stmt.body, closure: scope, visibility: stmt.visibility
          };
          scope.define(stmt.name, funcDef);
        }
      }
      // Restore parser state
      this.tokens = oldTokens; this.pos = oldPos;
    } catch (error) {
      console.error(`Import Error Details: ${error.message}`);
      if (error.stack) console.error(`Stack: ${error.stack}`);
      throw new Error(`Import Error: Failed to import '${filePath}': ${error.message}`);
    }
  }
}
