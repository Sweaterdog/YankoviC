import { useEffect } from 'react';
import { nouns, verbs, adjectives } from '../data/lyricPrompter';

const yankovicKeywords = [
    'spatula', 'lasagna', 'lyric', 'verse', 'horoscope', 'accordion_solo',
    'jeopardy', 'what_if_god_was_one_of_us', 'another_one', 'polka',
    'do_the_polka', 'hardware_store', 'twinkie_wiener_sandwich',
    'stupid', 'its_a_fact', 'total_baloney', 'lunchbox', 'gimme_a',
    'in_the_blender', '#eat', 'give_up', 'do_it_again', 'this_box'
];

export const useYankoviC = (monaco) => {
  useEffect(() => {
    if (!monaco) return;

    // 1. Register the language
    monaco.languages.register({ id: 'yankovic' });

    // 2. Set up the tokenizer (syntax highlighting)
    monaco.languages.setMonarchTokensProvider('yankovic', {
      keywords: yankovicKeywords,
      tokenizer: {
        root: [
          [/[a-zA-Z_][\w]*/, {
            cases: {
              '@keywords': {
                cases: {
                    'spatula|lasagna|lyric|verse|horoscope|accordion_solo': 'keyword.type.yankovic',
                    'jeopardy|polka|hardware_store|another_one|do_the_polka': 'keyword.control.yankovic',
                    'twinkie_wiener_sandwich': 'keyword.return.yankovic',
                    'stupid': 'keyword.const.yankovic',
                    '@default': 'keyword'
                }
              },
              '@default': 'identifier'
            }
          }],
          [/#eat\s*<.*?>/, 'preprocessor'],
          [/"[^"]*"/, 'string'],
          [/\d+/, 'number'],
          [/[{}();,]/, 'delimiter'],
          [/\/\/.*/, 'comment'],
        ]
      }
    });

    // 3. Set up the Lyric Prompter (autocomplete)
    monaco.languages.registerCompletionItemProvider('yankovic', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        
        const keywordSuggestions = yankovicKeywords.map(k => ({
            label: k,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: k,
            range: range
        }));

        // Lyric Prompter Suggestions
        const nounSuggestions = nouns.map(n => ({
            label: `var: ${n}`,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: n,
            range: range,
            detail: 'Thematic Noun'
        }));
        const verbSuggestions = verbs.map(v => ({
            label: `func: ${v}()`,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${v}()`,
            range: range,
            detail: 'Thematic Verb'
        }));
        
        return {
          suggestions: [...keywordSuggestions, ...nounSuggestions, ...verbSuggestions],
        };
      },
    });

  }, [monaco]);
};
