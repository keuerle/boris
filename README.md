# Boris - AI Chatbot with Tool Support

A modern AI chatbot built with Next.js 15, AI SDK v5, and Ollama, featuring real-time tool execution and beautiful UI components.

## 🚀 Features

- **AI SDK v5** - Latest Vercel AI SDK for streaming chat responses
- **Ollama Integration** - Local LLM support with multiple models
- **Tool Calling** - Real-time tool execution with visual feedback
- **Beautiful UI** - Modern design with AI Elements components
- **Multiple Models** - Switch between Llama, Phi, Qwen, and more
- **TypeScript** - Full type safety throughout the codebase

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **AI**: AI SDK v5 + Ollama Provider v2
- **UI**: React 19, Tailwind CSS 4, Radix UI
- **Language**: TypeScript 5

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd boris
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# .env.local
OLLAMA_BASE_URL=http://localhost:11434
```

4. Make sure Ollama is running locally or on your network with your desired models installed.

## 🏃 Running the App

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🧰 Available Tools

### Weather Tool
Fetches weather information for any location. Example usage:
- "What's the weather in New York?"
- "Get weather for San Francisco in fahrenheit"

### Calculator Tool (Coming Soon)
Perform mathematical calculations.

## 🎨 AI Elements Components

This project uses AI Elements from the AI SDK:

- **Message** - Chat message display with role-based styling
- **Response** - Markdown rendering for AI responses
- **Tool** - Collapsible tool execution display with state indicators
- **Reasoning** - Chain of thought visualization
- **Sources** - Reference link display
- **PromptInput** - Message input with model selection

## 🤖 Supported Models

Configure available models in `app/page.tsx`:

- Llama 3.2 Latest
- Llama 3.1 8B
- Phi-4 Mini
- Qwen 3 Coder

## 📁 Project Structure

```
boris/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint with tool support
│   ├── page.tsx                  # Main chat interface
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ai-elements/              # AI SDK UI components
│   │   ├── message.tsx
│   │   ├── response.tsx
│   │   ├── tool.tsx
│   │   ├── reasoning.tsx
│   │   └── ...
│   └── ui/                       # Base UI components (shadcn)
├── tools/
│   ├── weather-tool.ts           # Weather tool implementation
│   ├── calculator-tool.ts        # Calculator tool
│   └── README.md                 # Tool development guide
└── lib/
    └── utils.ts                  # Utility functions
```

## 🔧 Adding New Tools

1. Create a new tool file in `tools/`:
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const myTool = tool({
  description: 'Tool description',
  parameters: z.object({
    param: z.string().describe('Parameter description'),
  }),
  execute: async ({ param }) => {
    // Tool logic here
    return { result: 'success' };
  },
});
```

2. Import and register in `app/api/chat/route.ts`:
```typescript
import { myTool } from '@/tools/my-tool';

// In streamText tools object:
tools: {
  weather: weatherTool,
  myTool: myTool,  // Add your tool here
}
```

3. The UI will automatically display tool execution!

## 🎯 Configuration

### Ollama Server
Update the Ollama base URL in `app/api/chat/route.ts`:
```typescript
const getBaseUrl = () =>
  process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
```

### Default Model
Change the default model in `app/api/chat/route.ts`:
```typescript
const DEFAULT_MODEL = 'llama3.2:latest';
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT

## 👤 Author

Created by Kevin Euerle

---

Built with ❤️ using the [AI SDK](https://ai-sdk.dev/) by Vercel
