# The Accordion: A YankoviC IDE

Welcome to the most ridiculously over-engineered, thematically-consistent, and fun IDE for the YankoviC programming language.

## Features

- **VS Code-like Interface**: A familiar, professional-looking dark-mode layout.
- **Thematic Syntax Highlighting**: Multiple themes including "Poodle Hat", "UHF Mode", and the chaotic "Dare to be Stupid Mode".
- **The Al-gorithms of Style Linter**: Catches your errors and mocks you for them with style.
- **The Lyric Prompter**: An autocomplete that suggests thematically appropriate variable and function names.
- **The White & Nerdy Debugger**: An animated "Weird Al" head that judges your code's execution.
- **Dual AI Assistant ("Al")**: Powered by Pollinations.AI gateway for code completion and help.
- **File Management**: Create and switch between files in your workspace.

## Setup & Installation

1.  **Clone/Download:** Get these files onto your machine.
2.  **Install Node.js:** If you don't have it, get it from [nodejs.org](https://nodejs.org/).
3.  **Install Dependencies:** Open a terminal in the project root and run:
    ```bash
    npm install
    ```
4.  **Configure API Keys:**
    *   Open the `public/config.json` file.
    *   Add your API key for Pollinations to the `apiKeyPollinations` field (or leave blank for anonymous access).
    *   The `activeAIService` is set to `"pollinations"` by default.

## Running The Accordion

Once setup is complete, run the following command in your terminal:

```bash
npm run dev
```

This will start the development server. Open your web browser and navigate to the local URL it provides (usually `http://localhost:5173`).

Now, go write some code that dares to be stupid. And remember, the success code is **27**. You have to.