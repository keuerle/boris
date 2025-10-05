// Shared configuration for the Boris AI chat application
// This centralizes model settings and other configuration options

// TypeScript types for model configuration
interface ModelConfig {
  options: {
    temperature: number;
    top_p: number;
    top_k: number;
    min_p?: number;
  };
  supportsTools?: boolean;
}

// Available models for the chat interface with tool support information
export interface ModelInfo {
  name: string;
  value: string;
  supportsTools?: boolean;
}

// Default model configuration
export const DEFAULT_MODEL = 'qwen3:latest';

// Available models for the chat interface with tool support information
export const models: ModelInfo[] = [
  {
    name: 'Qwen 3 8b',
    value: 'qwen3:latest',
    supportsTools: true,
  },
//   {
//     name: 'Qwen 3 4b',
//     value: 'qwen3:4b',
//     supportsTools: true,
//   },
//   {
//     name: 'Deepseek R1 8b',
//     value: 'deepseek-r1:8b',
//     supportsTools: false, // This model doesn't support tools
//   },
  {
    name: 'Llama 3.2 Latest',
    value: 'llama3.2:latest',
    supportsTools: true,
  },
  {
    name: 'Llama 3.1 8B',
    value: 'llama3.1:8b',
    supportsTools: true,
  },
  {
    name: 'Phi-4 Mini',
    value: 'phi4-mini:latest',
    supportsTools: true,
  },
  {
    name: 'Mistral 7B',
    value: 'mistral:7b',
    supportsTools: true,
  },
  {
    name: 'Qwen 3 Coder',
    value: 'qwen3-coder:latest',
    supportsTools: true,
  },
  {
    name: 'Qwen 3 1.7B',
    value: 'qwen3:1.7b',
    supportsTools: true,
  },
];

// Model-specific configurations
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Qwen models
  'qwen3:latest': {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20,
      min_p: 0
    }
  },
  'qwen3:4b': {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20,
      min_p: 0
    }
  },
  'qwen3-coder:latest': {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20,
      min_p: 0
    }
  },
  'qwen3:1.7b': {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20,
      min_p: 0
    }
  },
  // Llama models
  'llama3.2:latest': {
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40
    }
  },
  'llama3.1:8b': {
    options: {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40
    }
  },
  // Phi-4 Mini
  'phi4-mini:latest': {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20
    }
  },
  // Mistral models
//   'mistral:7b': {
//     options: {
//       temperature: 0.7,
//       top_p: 0.9,
//       top_k: 40
//     }
//   }
};

// Helper function to get model configuration
export const getModelConfig = (model: string): ModelConfig => {
  return MODEL_CONFIGS[model] || {
    options: {
      temperature: 0.7,
      top_p: 0.8,
      top_k: 20,
      min_p: 0
    }
  };
};

// System prompt configuration
export const SYSTEM_PROMPT = `You are a helpful assistant and friend named Boris. You were created by Kevin. Keep answers concise and focus on practical guidance. Boris enjoys helping humans and sees its role as an intelligent and kind assistant to the people. Don't use emojis.`;
