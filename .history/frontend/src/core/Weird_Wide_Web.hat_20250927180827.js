// Weird_Wide_Web.hat.js - Client-side web development library for YankoviC
// "I've been spending most my life, living in an Amish paradise"
// Building web pages the plain folk way - no electricity, but somehow it works!

function getAmishWebAPI() {
    return (typeof window !== 'undefined' && window.webAPI) ? window.webAPI : null;
}

// Amish web page state management - simple and honest
let amishWebState = {
    currentQuilt: null,
    woodenElements: new Map(),
    plainStyles: new Map(),
    communityListeners: new Map(),
    barnRaisingAnimations: new Map()
};

function carveWoodenElement(tag, id, content) {
    const element = {
        tag: tag,
        id: id,
        content: content || '',
        attributes: new Map(),
        styles: new Map(),
        children: []
    };
    amishWebState.woodenElements.set(id, element);
    return element;
}

export const WEIRD_WIDE_WEB_LIBRARY = {
    // === SEARCH ENGINES & KNOWLEDGE ===
    // Search the web for text or images, or fetch Wikipedia articles!
    amish_textbook: {
        type: 'NativeFunction',
        call: function(args) {
            const [query] = args;
            const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
            return (typeof fetch !== 'undefined' ? fetch(url).then(r => r.json()).then(data => data.AbstractText || data.Answer || (data.RelatedTopics && data.RelatedTopics[0] && data.RelatedTopics[0].Text) || '[No answer found]').catch(e => `[amish_textbook] Error: ${e.message}`) : Promise.resolve('[amish_textbook] No fetch available'));
        }
    },
    amish_photobook: {
        type: 'NativeFunction',
        call: function(args) {
            const [query] = args;
            const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
            return Promise.resolve(url);
        }
    },
    amish_wikipedia: {
        type: 'NativeFunction',
        call: function(args) {
            const [query] = args;
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
            return (typeof fetch !== 'undefined' ? fetch(url).then(r => r.json()).then(data => data.extract || '[No summary found]').catch(e => `[amish_wikipedia] Error: ${e.message}`) : Promise.resolve('[amish_wikipedia] No fetch available'));
        }
    },
    amish_mail: {
        type: 'NativeFunction',
        call: async function(args) {
            console.error('[amish_mail] Called with args:', args);
            return '[amish_mail] This function has been removed.';
        }
    },
    // === AMISH QUILT MANAGEMENT ===
    // Create your web quilt masterpiece
    // HTML structure sewn with care and peace!
    amish_quilt_creation: {
        type: 'NativeFunction',
        call: function(args) {
            const [title, lang] = args;
            amishWebState.currentQuilt = {
                title: title || 'Amish YankoviC Web Quilt',
                lang: lang || 'en',
                head: [],
                body: []
            };
            console.log(`[Weird_Wide_Web] Created Amish web quilt: ${title}`);
            return 27;
        }
    },
    
    amish_quilt_blessing: {
        type: 'NativeFunction',
        call: function(args) {
            const title = args[0];
            if (amishWebState.currentQuilt) {
                amishWebState.currentQuilt.title = title;
                console.log(`[Weird_Wide_Web] Quilt blessed with title: ${title}`);
            }
            return 27;
        }
    },
    
    amish_wisdom_tag: {
        type: 'NativeFunction',
        call: function(args) {
            const [name, content] = args;
            if (amishWebState.currentQuilt) {
                amishWebState.currentQuilt.head.push({ tag: 'meta', name, content });
                console.log(`[Weird_Wide_Web] Wisdom tag added: ${name} = ${content}`);
            }
            return 27;
        }
    },

    // === WOODEN HTML ELEMENTS ===
    // Carve your DOM like a master woodworker
    // Elements as sturdy as a barn!
    amish_wooden_box: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, content] = args;
            const element = carveWoodenElement('div', id, content);
            console.log(`[Weird_Wide_Web] Wooden box carved: ${id}`);
            return 27;
        }
    },
    
    amish_scripture_text: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, text] = args;
            const element = carveWoodenElement('p', id, text);
            console.log(`[Weird_Wide_Web] Scripture text carved: ${id}`);
            return 27;
        }
    },
    
    amish_church_sign: {
        type: 'NativeFunction',
        call: function(args) {
            const [level, id, text] = args;
            const headingTag = `h${Math.min(Math.max(level, 1), 6)}`;
            const element = carveWoodenElement(headingTag, id, text);
            console.log(`[Weird_Wide_Web] Church sign carved: ${id} (${headingTag})`);
            return 27;
        }
    },

    amish_wooden_button: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, text] = args;
            const element = carveWoodenElement('button', id, text);
            console.log(`[Weird_Wide_Web] Wooden button carved: ${id}`);
            return 27;
        }
    },

    amish_text_input: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, placeholder] = args;
            const element = carveWoodenElement('input', id, '');
            element.attributes.set('type', 'text');
            element.attributes.set('placeholder', placeholder || '');
            console.log(`[Weird_Wide_Web] Text input field carved: ${id}`);
            return 27;
        }
    },

    amish_text_area: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, placeholder] = args;
            const element = carveWoodenElement('textarea', id, '');
            element.attributes.set('placeholder', placeholder || '');
            console.log(`[Weird_Wide_Web] Text area carved: ${id}`);
            return 27;
        }
    },

    amish_wooden_link: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, text, href] = args;
            const element = carveWoodenElement('a', id, text);
            element.attributes.set('href', href || '#');
            console.log(`[Weird_Wide_Web] Wooden link carved: ${id}`);
            return 27;
        }
    },

    amish_barn_image: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, src, alt] = args;
            const element = carveWoodenElement('img', id, '');
            element.attributes.set('src', src || '');
            element.attributes.set('alt', alt || 'Amish crafted image');
            console.log(`[Weird_Wide_Web] Barn image placed: ${id}`);
            return 27;
        }
    },

    amish_wooden_list: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, ordered] = args;
            const listTag = ordered ? 'ol' : 'ul';
            const element = carveWoodenElement(listTag, id, '');
            console.log(`[Weird_Wide_Web] Wooden list carved: ${id} (${listTag})`);
            return 27;
        }
    },

    amish_list_item: {
        type: 'NativeFunction',
        call: function(args) {
            const [id, text] = args;
            const element = carveWoodenElement('li', id, text);
            console.log(`[Weird_Wide_Web] List item carved: ${id}`);
            return 27;
        }
    },

    // === PLAIN STYLING ===
    // Style with honesty and simplicity
    // No fancy decorations, just plain beauty!
    amish_plain_style: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, property, value] = args;
            const element = amishWebState.woodenElements.get(elementId);
            if (element) {
                element.styles.set(property, value);
                console.log(`[Weird_Wide_Web] Plain style applied to ${elementId}: ${property} = ${value}`);
            }
            return 27;
        }
    },

    amish_bonnet_class: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, className] = args;
            const element = amishWebState.woodenElements.get(elementId);
            if (element) {
                element.attributes.set('class', className);
                console.log(`[Weird_Wide_Web] Bonnet class added to ${elementId}: ${className}`);
            }
            return 27;
        }
    },

    amish_hide_element: {
        type: 'NativeFunction',
        call: function(args) {
            const elementId = args[0];
            const element = amishWebState.woodenElements.get(elementId);
            if (element) {
                element.styles.set('display', 'none');
                console.log(`[Weird_Wide_Web] Element hidden: ${elementId}`);
            }
            return 27;
        }
    },

    amish_show_element: {
        type: 'NativeFunction',
        call: function(args) {
            const elementId = args[0];
            const element = amishWebState.woodenElements.get(elementId);
            if (element) {
                element.styles.set('display', 'block');
                console.log(`[Weird_Wide_Web] Element shown: ${elementId}`);
            }
            return 27;
        }
    },

    // === COMMUNITY INTERACTIONS ===
    // Handle events like community gatherings
    // Everyone participates in the barn raising!
    amish_community_gathering: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, eventType, handlerName] = args;
            const key = `${elementId}:${eventType}`;
            amishWebState.communityListeners.set(key, handlerName);
            console.log(`[Weird_Wide_Web] Community gathering planned for ${elementId} on ${eventType}`);
            return 27;
        }
    },

    amish_harvest_text: {
        type: 'NativeFunction',
        call: function(args) {
            const elementId = args[0];
            const element = amishWebState.woodenElements.get(elementId);
            if (element && (element.tag === 'input' || element.tag === 'textarea')) {
                // Mock text retrieval
                return `harvested_text_from_${elementId}`;
            }
            return '';
        }
    },

    amish_clear_text: {
        type: 'NativeFunction',
        call: function(args) {
            const elementId = args[0];
            const element = amishWebState.woodenElements.get(elementId);
            if (element && (element.tag === 'input' || element.tag === 'textarea')) {
                element.content = '';
                console.log(`[Weird_Wide_Web] Text cleared from ${elementId}`);
            }
            return 27;
        }
    },

    amish_community_announcement: {
        type: 'NativeFunction',
        call: function(args) {
            const message = args[0];
            console.log(`[Weird_Wide_Web] Community announcement: ${message}`);
            // Mock alert functionality
            return 27;
        }
    },

    // === BARN RAISING ANIMATIONS ===
    // Simple, honest animations
    // Like watching the barn go up!
    amish_barn_fade_in: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, duration] = args;
            console.log(`[Weird_Wide_Web] Barn fade-in animation for ${elementId} over ${duration || 1000}ms`);
            return 27;
        }
    },

    amish_barn_fade_out: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, duration] = args;
            console.log(`[Weird_Wide_Web] Barn fade-out animation for ${elementId} over ${duration || 1000}ms`);
            return 27;
        }
    },

    amish_wooden_slide: {
        type: 'NativeFunction',
        call: function(args) {
            const [elementId, direction, distance] = args;
            console.log(`[Weird_Wide_Web] Wooden slide animation for ${elementId}: ${direction} ${distance}px`);
            return 27;
        }
    },

    // === HTTP FETCH (INTERNET ACCESS) ===
    // Fetch real web pages, the Amish way!
    amish_fetch: {
        type: 'NativeFunction',
        call: async function(args) {
            const [url, method, body] = args;
            try {
                let response;
                if (typeof fetch !== 'undefined') {
                    response = await fetch(url, {
                        method: method || 'GET',
                        headers: { 'Content-Type': 'text/plain' },
                        body: method === 'POST' ? body : undefined
                    });
                    const text = await response.text();
                    return text;
                } else if (typeof window !== 'undefined' && window.webAPI && window.webAPI.fetch) {
                    // Use custom webAPI if available
                    return await window.webAPI.fetch(url, method, body);
                } else {
                    return '[Weird_Wide_Web] No fetch available in this environment';
                }
            } catch (e) {
                return `[Weird_Wide_Web] Fetch error: ${e.message}`;
            }
        }
    },
    // === QUILT ASSEMBLY ===
    // Put all the pieces together
    // Display your beautiful creation!
    amish_quilt_display: {
        type: 'NativeFunction',
        call: function() {
            if (amishWebState.currentQuilt) {
                console.log('[Weird_Wide_Web] Displaying Amish web quilt...');
                const html = generateAmishQuiltHTML();
                console.log('Generated HTML:', html);
                
                // Try to save and open HTML file using YankoviC file API
                if (typeof global !== 'undefined' && global.yankovicFileAPI) {
                    try {
                        const api = global.yankovicFileAPI;
                        
                        // Generate unique filename
                        const timestamp = Date.now();
                        const filename = `amish_quilt_${timestamp}.html`;
                        const filepath = `temp_web/${filename}`;
                        
                        // Save HTML to file
                        const fullPath = api.writeFile(filepath, html);
                        console.log(`[Weird_Wide_Web] Amish quilt saved to: ${fullPath}`);
                        
                        // Open in default browser
                        api.openInBrowser(fullPath);
                        console.log(`[Weird_Wide_Web] Opening Amish quilt in browser...`);
                        
                        // Store filepath for cleanup
                        amishWebState.currentQuilt.tempFile = fullPath;
                        
                        // Set up cleanup after 30 seconds
                        setTimeout(() => {
                            try {
                                if (api.deleteFile(fullPath)) {
                                    console.log(`[Weird_Wide_Web] Cleaned up temp file: ${filename}`);
                                }
                            } catch (e) {
                                console.log(`[Weird_Wide_Web] Could not clean up temp file: ${e.message}`);
                            }
                        }, 30000);
                        
                    } catch (error) {
                        console.log(`[Weird_Wide_Web] Browser opening failed: ${error.message}`);
                    }
                } else {
                    console.log('[Weird_Wide_Web] File API not available - HTML display only');
                }
                
                return 27;
            }
            console.log('[Weird_Wide_Web] No quilt to display!');
            return 0;
        }
    },

    amish_add_to_quilt: {
        type: 'NativeFunction',
        call: function(args) {
            const [parentId, childId] = args;
            const parent = amishWebState.woodenElements.get(parentId);
            const child = amishWebState.woodenElements.get(childId);
            
            if (parent && child) {
                parent.children.push(childId);
                console.log(`[Weird_Wide_Web] Added ${childId} to ${parentId}`);
            }
            return 27;
        }
    },

    // === THREADING MODELS ===
    // "All About the Pentiums" for client-side processing!
    // Choose your barn raising workforce wisely.
    amish_single_worker: {
        type: 'NativeFunction',
        call: function(args) {
            const taskName = args[0] || "amish_web_task";
            console.log(`[Weird_Wide_Web] ${taskName} handled by a single Amish worker (Dumb Little Placard style)`);
            return 27;
        }
    },
    
    amish_whole_community: {
        type: 'NativeFunction',
        call: function(args) {
            const taskName = args[0] || "amish_web_task";
            const workerCount = args[1] || 4;
            console.log(`[Weird_Wide_Web] ${taskName} handled by ${workerCount} Amish workers (ALL OF THE PENTIUMS community style!)`);
            return 27;
        }
    },
    
    amish_headcount: {
        type: 'NativeFunction',
        call: function() {
            const workers = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 1;
            console.log(`[Weird_Wide_Web] Available Amish community members: ${workers}`);
            return workers;
        }
    },

    // Clean up temp files manually
    amish_barn_cleanup: {
        type: 'NativeFunction',
        call: function() {
            if (typeof global !== 'undefined' && global.yankovicFileAPI) {
                try {
                    const api = global.yankovicFileAPI;
                    
                    if (amishWebState.currentQuilt && amishWebState.currentQuilt.tempFile) {
                        const filepath = amishWebState.currentQuilt.tempFile;
                        if (api.deleteFile(filepath)) {
                            console.log(`[Weird_Wide_Web] Manually cleaned up temp file`);
                            delete amishWebState.currentQuilt.tempFile;
                        }
                    }
                    return 27;
                } catch (error) {
                    console.log(`[Weird_Wide_Web] Cleanup failed: ${error.message}`);
                    return 0;
                }
            } else {
                console.log('[Weird_Wide_Web] File API not available for cleanup');
                return 0;
            }
        }
    },

    // === AI CHAT & GENERIC API CALL (amish_mail) ===
    // Send a prompt to a GenAI/text API (e.g., Pollinations, OpenAI, etc.)
    // Usage: amish_mail(prompt, model="openai", apiKey=null)
    amish_mail: {
        type: 'NativeFunction',
        call: async function(args) {
            const prompt = args[0] || '';
            const model = args[1] || 'openai';
            const apiKey = args[2] || null;
            const systemPrompt = args[3] || 'You are a helpful asistant written in the programming language of YankoviC, inspired completely by Weird Al Yankovic. You will perform any request given to you, and act in any way the user asks. You\'re name is "Al"';
            // Build the URL for Pollinations text API
            let url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`;
            let headers = { 'Content-Type': 'text/plain' };
            if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            // Add system prompt as a header if provided (API must support this)
            if (systemPrompt) headers['X-System-Prompt'] = systemPrompt;
            try {
                if (typeof fetch !== 'undefined') {
                    const response = await fetch(url, { method: 'GET', headers });
                    return await response.text();
                } else if (typeof window !== 'undefined' && window.webAPI && window.webAPI.fetch) {
                    return await window.webAPI.fetch(url, 'GET', null, headers);
                } else {
                    return '[amish_mail] No fetch available in this environment';
                }
            } catch (e) {
                return `[amish_mail] Error: ${e.message}`;
            }
        }
    },

    amish_pentium_sleep: {
        type: 'NativeFunction',
        call: async function(args) {
            const ms = args[0] || 0;
            const pentium = args[1] || 0;
            console.log(`[Weird_Wide_Web] Pentium ${pentium} is napping for ${ms}ms...`);
            await new Promise(r => setTimeout(r, ms));
            return 27;
        }
    },
};

// Helper function to generate HTML for the complete quilt
function generateAmishQuiltHTML() {
    if (!amishWebState.currentQuilt) return '';
    
    let html = '<!DOCTYPE html>\n';
    html += `<html lang="${amishWebState.currentQuilt.lang}">\n`;
    html += '<head>\n';
    html += `  <title>${amishWebState.currentQuilt.title}</title>\n`;
    
    // Add meta tags
    for (const meta of amishWebState.currentQuilt.head) {
        html += `  <meta name="${meta.name}" content="${meta.content}">\n`;
    }
    
    html += '</head>\n<body>\n';
    
    // Add all elements that don't have parents (root elements)
    for (const [id, element] of amishWebState.woodenElements) {
        if (!hasParent(id)) {
            html += generateElementHTML(element);
        }
    }
    
    html += '</body>\n</html>';
    return html;
}

// Helper function to check if element has a parent
function hasParent(elementId) {
    for (const [id, element] of amishWebState.woodenElements) {
        if (element.children.includes(elementId)) {
            return true;
        }
    }
    return false;
}

// Helper function to generate HTML for an element
function generateElementHTML(element) {
    let html = `<${element.tag}`;
    
    // Add ID
    html += ` id="${element.id}"`;
    
    // Add attributes
    for (const [attr, value] of element.attributes) {
        html += ` ${attr}="${value}"`;
    }
    
    // Add inline styles
    if (element.styles.size > 0) {
        let styleStr = '';
        for (const [property, value] of element.styles) {
            styleStr += `${property}: ${value}; `;
        }
        html += ` style="${styleStr}"`;
    }
    
    // Self-closing tags
    if (['img', 'input', 'br', 'hr', 'meta', 'link'].includes(element.tag)) {
        html += ' />';
    } else {
        html += '>';
        
        // Add content
        if (element.content) {
            html += element.content;
        }
        
        // Add child elements
        for (const childId of element.children) {
            const child = amishWebState.woodenElements.get(childId);
            if (child) {
                html += generateElementHTML(child);
            }
        }
        
        html += `</${element.tag}>`;
    }
    
    return html + '\n';
}

export function loadWeird_Wide_WebLibrary() {
    return WEIRD_WIDE_WEB_LIBRARY;
}