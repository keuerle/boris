// AI SDK Core imports for streaming with tool support
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
import { streamText, stepCountIs, convertToCoreMessages } from 'ai';
import { createOllama } from 'ollama-ai-provider-v2';
// Import the weather tool from our tools directory
// Tools are modular - each tool lives in its own file for clarity
import { weatherTool } from '@/tools/weather-tool';

export const runtime = 'nodejs';

// Configuration constants for the AI provider integration
const DEFAULT_MODEL = 'llama3.2:latest';
// System prompt - defines AI assistant persona and behavior
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/prompt-engineering
const SYSTEM_PROMPT = `You are a helpful assistant and friend named Boris. You were created by Kevin. Keep answers concise and focus on practical guidance. Boris enjoys helping humans and sees its role as an intelligent and kind assistant to the people.

When you use tools, explain what you found in a natural, conversational way.`;

// Get Ollama base URL from environment or use default
// This implements the provider abstraction pattern in AI SDK
const getBaseUrl = () =>
  (process.env.OLLAMA_BASE_URL ?? 'http://192.168.1.246:11434').replace(/\/$/, '');

// Create Ollama provider instance with custom base URL
// Reference: https://ai-sdk.dev/docs/foundations/providers-and-models
const ollama = createOllama({
  baseURL: `${getBaseUrl()}/api`,
});

// API Route handler - implements AI SDK streaming with tool calling
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
export async function POST(request: Request) {
  // Extract messages and model from request body
  // Model parameter comes from frontend via useChat body parameter
  const { messages, model = DEFAULT_MODEL } = await request.json();

  // Convert AI SDK UI messages to AI SDK Core format
  // This is the bridge between frontend and provider-specific formats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coreMessages = convertToCoreMessages((messages as any) ?? []);

  // Use streamText with tool support
  // Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
  const result = streamText({
    // Select the model from Ollama provider
    model: ollama(model),
    
    // System prompt defines AI behavior
    system: SYSTEM_PROMPT,
    
    // User conversation history
    messages: coreMessages,
    
    // Tools available to the AI
    // The AI will automatically decide when to use them based on user queries
    // Reference: https://ai-sdk.dev/docs/foundations/tools
    tools: {
      // Each tool is a key-value pair: toolName: toolDefinition
      // The toolName is used by the AI when deciding which tool to call
      weather: weatherTool,
      
      // ADD MORE TOOLS HERE:
      // Example: calculator: calculatorTool,
      // Example: search: searchTool,
    },
    
    // Enable multi-step calls - allows AI to use tools and then respond
    // stopWhen defines when to stop making additional calls
    // stepCountIs(5) means: stop after 5 steps if tools were called
    // Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#multi-step-calls
    stopWhen: stepCountIs(5),
    
    // onStepFinish callback - useful for debugging and logging
    // Fires after each step (tool call or text generation)
    onStepFinish: (step) => {
      console.log(`📝 Tool step completed:`);
      
      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log(`  🔧 Tool calls:`, step.toolCalls.map(tc => tc.toolName));
      }
      
      if (step.toolResults && step.toolResults.length > 0) {
        console.log(`  ✅ Tool results:`, step.toolResults.length);
      }
      
      if (step.text) {
        console.log(`  💬 Generated text: ${step.text.substring(0, 50)}...`);
      }
    },
  });

  // Return AI SDK UI-compatible stream response
  // This automatically handles tool execution and streaming
  // Reference: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot#streaming-responses
  return result.toUIMessageStreamResponse();
}
