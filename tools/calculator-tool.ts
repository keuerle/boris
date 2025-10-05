// Calculator Tool - Example showing a simple synchronous tool
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Calculator Tool - A simple math tool example
 * 
 * This demonstrates:
 * - Using enums in schemas
 * - Multiple parameters
 * - Synchronous execution (no async needed for simple operations)
 * - Error handling
 */

// Custom UI descriptions for different tool states
export const calculatorToolDescriptions = {
  workingDescription: 'Calculating...',
  completedDescription: 'Calculation completed',
  errorDescription: 'Calculation failed'
};

export const calculatorTool = tool({
  description: 'Perform basic mathematical operations: addition, subtraction, multiplication, or division.',
  
  inputSchema: z.object({
    // First number in the operation
    a: z.number().describe('The first number'),
    
    // Second number in the operation
    b: z.number().describe('The second number'),
    
    // Operation type using enum for limited choices
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The mathematical operation to perform'),
  }),
  
  // Note: This is NOT async because it's a simple calculation
  // Only use async when you need to:
  // - Call external APIs
  // - Query databases
  // - Read/write files
  // - Do any I/O operations
  execute: async ({ a, b, operation }) => {
    console.log(`🧮 Calculator: ${a} ${operation} ${b}`);
    
    let result: number;
    
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return {
            error: 'Cannot divide by zero',
            a,
            b,
            operation,
          };
        }
        result = a / b;
        break;
      default:
        return {
          error: 'Invalid operation',
          a,
          b,
          operation,
        };
    }
    
    return {
      a,
      b,
      operation,
      result,
    };
  },
});

/**
 * TO USE THIS TOOL:
 * 
 * 1. Import it in your route.ts:
 *    import { calculatorTool } from '@/tools/calculator-tool';
 * 
 * 2. Add it to the tools object:
 *    tools: {
 *      weather: weatherTool,
 *      calculator: calculatorTool, // <-- Add here
 *    }
 * 
 * 3. Test it by asking: "What is 25 times 4?"
 */


