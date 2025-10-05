// Weather Tool - Powered by Open-Meteo API
// Reference: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
// Open-Meteo API: https://open-meteo.com/
import { tool } from 'ai';
import { z } from 'zod';

// State abbreviation mapping for better location parsing
const stateAbbreviations: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

// Common location variations and corrections
const locationCorrections: Record<string, string> = {
  'reston va': 'Reston, Virginia',
  'reston, va': 'Reston, Virginia',
  'reston virginia': 'Reston, Virginia',
  'dc': 'Washington, District of Columbia',
  'washington dc': 'Washington, District of Columbia',
  'washington d.c.': 'Washington, District of Columbia',
  'nyc': 'New York, New York',
  'new york city': 'New York, New York',
  'la': 'Los Angeles, California',
  'san fran': 'San Francisco, California',
  'sf': 'San Francisco, California',
  'chi': 'Chicago, Illinois',
  'miami fl': 'Miami, Florida',
  'miami, fl': 'Miami, Florida'
};

/**
 * Normalize location input to improve geocoding success
 */
function normalizeLocation(location: string): string {
  // Convert to lowercase for consistent matching
  const normalized = location.toLowerCase().trim();
  
  // Check for direct corrections first
  if (locationCorrections[normalized]) {
    return locationCorrections[normalized];
  }
  
  // Handle state abbreviations (e.g., "Reston, VA" -> "Reston, Virginia")
  const stateAbbrevMatch = normalized.match(/^(.+),\s*([a-z]{2})$/);
  if (stateAbbrevMatch) {
    const [, city, stateAbbr] = stateAbbrevMatch;
    const fullStateName = stateAbbreviations[stateAbbr.toUpperCase()];
    if (fullStateName) {
      return `${city.charAt(0).toUpperCase() + city.slice(1)}, ${fullStateName}`;
    }
  }
  
  // Handle "City, State" format without abbreviations
  const cityStateMatch = normalized.match(/^(.+),\s*(.+)$/);
  if (cityStateMatch) {
    const [, city, state] = cityStateMatch;
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1);
    const capitalizedState = state.charAt(0).toUpperCase() + state.slice(1);
    return `${capitalizedCity}, ${capitalizedState}`;
  }
  
  // If no comma, try to capitalize properly
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
}

/**
 * Try multiple search strategies for better location finding
 */
async function findLocationWithFallbacks(originalLocation: string): Promise<any> {
  const searchStrategies = [
    originalLocation,
    normalizeLocation(originalLocation),
    // Try without state if it has one
    originalLocation.split(',')[0].trim(),
    // Try with just the city name
    originalLocation.split(',')[0].trim() + ', US'
  ];
  
  // Remove duplicates
  const uniqueStrategies = [...new Set(searchStrategies)];
  
  for (const searchLocation of uniqueStrategies) {
    try {
      console.log(`🔍 Trying location search: "${searchLocation}"`);
      
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchLocation)}&count=5&language=en&format=json`;
      const geocodeResponse = await fetch(geocodeUrl);
      
      if (!geocodeResponse.ok) {
        continue;
      }
      
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData.results && geocodeData.results.length > 0) {
        console.log(`✅ Found ${geocodeData.results.length} results for "${searchLocation}"`);
        return geocodeData;
      }
    } catch (error) {
      console.log(`❌ Search failed for "${searchLocation}":`, error);
      continue;
    }
  }
  
  return null;
}

/**
 * Weather Tool Structure:
 * 
 * 1. description: Helps the AI understand when to use this tool
 * 2. inputSchema: Defines and validates the parameters (using Zod)
 * 3. execute: The actual function that runs when the tool is called
 */

// Weather code mapping from Open-Meteo
// Reference: https://open-meteo.com/en/docs
const weatherCodeMap: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  71: 'slight snow',
  73: 'moderate snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
};

// Custom UI descriptions for different tool states
export const weatherToolDescriptions = {
  workingDescription: '🌤️ Checking the weather...',
  completedDescription: 'Found it!',
  errorDescription: 'Failed to fetch weather data'
};

export const weatherTool = tool({
  // Description helps the AI decide when to use this tool
  description: 'Get the current weather in a given location using real weather data from Open-Meteo API.',
  
  // Input schema defines what parameters the tool accepts
  // The AI will generate these parameters based on the user's message
  inputSchema: z.object({
    location: z.string().describe('City name or location. Supports various formats: "Reston, VA", "Reston, Virginia", "New York City", "NYC", "San Francisco, CA", etc.'),
  }),
  
  // Execute function runs when the AI calls this tool
  // The AI will wait for this to complete before responding to the user
  execute: async ({ location }) => {
    console.log(`🌤️  Weather tool called for: ${location}`);
    
    try {
      // Step 1: Try to find the location using multiple strategies
      const geocodeData = await findLocationWithFallbacks(location);
      
      if (!geocodeData || !geocodeData.results || geocodeData.results.length === 0) {
        // Provide helpful suggestions for common issues
        const suggestions = [];
        if (location.toLowerCase().includes('va')) {
          suggestions.push('Try "Reston, Virginia" or "Reston, VA"');
        }
        if (location.toLowerCase().includes('reston')) {
          suggestions.push('Try "Reston, Virginia" or "Reston, VA"');
        }
        
        const suggestionText = suggestions.length > 0 ? `\n\nSuggestions: ${suggestions.join(', ')}` : '';
        
        return {
          error: true,
          message: `Location "${location}" not found. Please try a different city name or format.${suggestionText}`
        };
      }
      
      // Use the first (most relevant) result
      const { latitude, longitude, name, country, admin1 } = geocodeData.results[0];
      const fullLocationName = admin1 ? `${name}, ${admin1}, ${country}` : `${name}, ${country}`;
      
      console.log(`📍 Using location: ${fullLocationName} (${latitude}, ${longitude})`);
      
      // Step 2: Get weather data using coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) {
        throw new Error(`Weather API failed: ${weatherResponse.statusText}`);
      }
      
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      
      // Map weather code to description
      const weatherCode = current.weather_code;
      const conditions = weatherCodeMap[weatherCode] || 'unknown';
      
      return {
        location: fullLocationName,
        coordinates: { latitude, longitude },
        temperature: Math.round(current.temperature_2m),
        conditions,
        weatherCode,
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10, // Round to 1 decimal
        unit: 'fahrenheit',
        timestamp: current.time
      };
      
    } catch (error) {
      console.error('Weather tool error:', error);
      return {
        error: true,
        message: `Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
});
