# AI Tools Directory

This directory contains tools that your AI assistant (Boris) can use to perform tasks.

## 📚 Reference Documentation

- [AI SDK Tools Overview](https://ai-sdk.dev/docs/foundations/tools)
- [Tool Calling Guide](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [Tool Components](https://ai-sdk.dev/elements/components/tool)

## 🔧 Tool Structure

Every tool has three main parts:

```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const myTool = tool({
  // 1. DESCRIPTION - Helps the AI decide when to use this tool
  description: 'A clear description of what this tool does',
  
  // 2. INPUT SCHEMA - Defines what parameters the tool needs
  inputSchema: z.object({
    parameter1: z.string().describe('What this parameter is for'),
    parameter2: z.number().describe('Another parameter'),
  }),
  
  // 3. EXECUTE FUNCTION - The actual code that runs
  execute: async ({ parameter1, parameter2 }) => {
    // Your logic here
    return {
      // Return data the AI needs to respond
    };
  },
});
```

## 📋 Available Tools

### 1. Weather Tool (`weather-tool.ts`)
**Purpose:** Get weather information for a location

**Example Prompts:**
- "What's the weather in San Francisco?"
- "Is it raining in New York?"
- "What's the temperature in London?"

**Shows you:**
- Async tool execution
- API simulation
- Returning structured data

---

### 2. Calculator Tool (`calculator-tool.ts`)
**Purpose:** Perform basic math operations

**Example Prompts:**
- "What is 25 times 4?"
- "Calculate 150 divided by 6"
- "Add 45 and 87"

**Shows you:**
- Using enums in schemas
- Multiple parameters
- Error handling
- Synchronous execution

---

## 🎯 Creating Your Own Tool

### Step 1: Create a new file
```bash
# Name it descriptively: toolname-tool.ts
touch tools/search-tool.ts
```

### Step 2: Define your tool
```typescript
import { tool } from 'ai';
import { z } from 'zod';

export const searchTool = tool({
  description: 'Search the web for information',
  
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  
  execute: async ({ query }) => {
    // Your implementation here
    const results = await fetch(`https://api.example.com/search?q=${query}`);
    return await results.json();
  },
});
```

### Step 3: Register it in `route.ts`
```typescript
// 1. Import your tool
import { searchTool } from '@/tools/search-tool';

// 2. Add it to the tools object
const result = streamText({
  // ... other config
  tools: {
    weather: weatherTool,
    calculator: calculatorTool,
    search: searchTool, // <-- Add here
  },
});
```

### Step 4: Test it
Ask Boris a question that would use your tool!

---

## 🧪 Schema Types Reference

### Basic Types
```typescript
z.string()           // Text input
z.number()           // Numbers (int or float)
z.boolean()          // true/false
z.date()             // Date objects
```

### Complex Types
```typescript
// Array of strings
z.array(z.string())

// Object with properties
z.object({
  name: z.string(),
  age: z.number(),
})

// Optional field
z.string().optional()

// With default value
z.string().default('default value')

// Enum (limited choices)
z.enum(['option1', 'option2', 'option3'])

// Union (multiple types)
z.union([z.string(), z.number()])
```

### Validation
```typescript
// Minimum/maximum
z.number().min(0).max(100)

// String length
z.string().min(3).max(50)

// Email validation
z.string().email()

// URL validation
z.string().url()

// Custom validation
z.string().refine((val) => val.startsWith('https://'), {
  message: 'Must be an HTTPS URL',
})
```

---

## 💡 Best Practices

### 1. **Clear Descriptions**
✅ Good: "Get the current weather forecast for a specific city"
❌ Bad: "weather"

### 2. **Describe Parameters**
```typescript
// Good
location: z.string().describe('The city and state, e.g. San Francisco, CA')

// Bad
location: z.string()
```

### 3. **Error Handling**
```typescript
execute: async ({ param }) => {
  try {
    const result = await riskyOperation(param);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

### 4. **Return Useful Data**
```typescript
// Good - structured and informative
return {
  location: 'San Francisco',
  temperature: 72,
  conditions: 'sunny',
  timestamp: new Date().toISOString(),
};

// Bad - just a string
return "It's 72 degrees";
```

### 5. **Log for Debugging**
```typescript
execute: async ({ param }) => {
  console.log(`🔍 Tool called with: ${param}`);
  // ... rest of code
}
```

---

## 🔍 Debugging Tips

### View Tool Calls
Check your terminal/console for these logs (configured in `route.ts`):
```
📝 Tool step completed:
  🔧 Tool calls: [ 'weather' ]
  ✅ Tool results: 1
  💬 Generated text: Based on the weather data...
```

### Test Individual Tools
You can test tools directly:
```typescript
import { weatherTool } from '@/tools/weather-tool';

const result = await weatherTool.execute({ 
  location: 'San Francisco' 
});
console.log(result);
```

### Common Issues

**Tool not being called?**
- Make description more specific
- Check if parameter types match what user is asking
- Try asking more directly: "Use the weather tool for San Francisco"

**Type errors?**
- Ensure your schema matches your execute parameters
- Check return type is serializable (no functions, classes, etc.)

**Tool called but no response?**
- Make sure you're returning data (not undefined)
- Check for errors in execute function
- Verify execute is async if doing I/O

---

## 🚀 Advanced Patterns

### Conditional Execution
```typescript
execute: async ({ location, detailed }) => {
  const data = await getWeather(location);
  
  if (detailed) {
    return getDetailedForecast(data);
  }
  
  return getBasicForecast(data);
}
```

### Multiple API Calls
```typescript
execute: async ({ query }) => {
  const [results1, results2] = await Promise.all([
    fetch(api1 + query),
    fetch(api2 + query),
  ]);
  
  return {
    source1: await results1.json(),
    source2: await results2.json(),
  };
}
```

### Timeout Handling
```typescript
execute: async ({ url }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## 📖 More Resources

- [AI SDK Core Documentation](https://ai-sdk.dev/docs/ai-sdk-core)
- [Zod Documentation](https://zod.dev)
- [Tool Calling Examples](https://ai-sdk.dev/examples)

---

Happy tool building! 🛠️


