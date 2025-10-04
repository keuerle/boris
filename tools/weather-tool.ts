// Weather Tool - Example tool implementation for AI SDK
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Weather Tool Structure:
 * 
 * 1. description: Helps the AI understand when to use this tool
 * 2. inputSchema: Defines and validates the parameters (using Zod)
 * 3. execute: The actual function that runs when the tool is called
 */
export const weatherTool = tool({
  // Description helps the AI decide when to use this tool
  description: 'Get the current weather in a given location. Use this when the user asks about weather, temperature, or conditions.',
  
  // Input schema defines what parameters the tool accepts
  // The AI will generate these parameters based on the user's message
  inputSchema: z.object({
    location: z.string().describe('The city and state, e.g. San Francisco, CA'),
  }),
  
  // Execute function runs when the AI calls this tool
  // The AI will wait for this to complete before responding to the user
  execute: async ({ location }) => {
    // In a real application, you would:
    // 1. Call a weather API (OpenWeatherMap, WeatherAPI, etc.)
    // 2. Handle errors gracefully
    // 3. Return structured data
    
    // For this example, we'll simulate a weather API response
    console.log(`🌤️  Weather tool called for: ${location}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock weather data
    // The AI will use this information to craft a response
    const temperature = 72 + Math.floor(Math.random() * 21) - 10; // Random temp between 62-82°F
    const conditions = ['sunny', 'partly cloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)];
    
    return {
      location,
      temperature,
      conditions,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 15) + 5, // 5-20 mph
      unit: 'fahrenheit'
    };
  },
});

/**
 * HOW TO CREATE YOUR OWN TOOL:
 * 
 * 1. Copy this file and rename it (e.g., calculator-tool.ts, search-tool.ts)
 * 
 * 2. Update the description to explain what your tool does
 * 
 * 3. Define your inputSchema with the parameters your tool needs:
 *    - Use z.string() for text
 *    - Use z.number() for numbers
 *    - Use z.boolean() for true/false
 *    - Use z.array() for lists
 *    - Use z.object() for nested structures
 *    - Add .describe() to help the AI understand each parameter
 * 
 * 4. Implement the execute function:
 *    - It receives the validated parameters
 *    - It should be async if it does API calls or database queries
 *    - Return the data the AI needs to respond to the user
 *    - Handle errors appropriately
 * 
 * 5. Export your tool and import it in route.ts
 */


