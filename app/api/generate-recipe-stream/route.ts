import { NextRequest, NextResponse } from "next/server";

interface UserPreferences {
  dietaryRestrictions?: string[];
  healthConditions?: string[];
  allergies?: string[];
  cookingSkill?: string;
  maxCookingTime?: string;
  servingSize?: string;
  mealType?: string;
  preferredCuisines?: string[];
  spiceLevel?: string;
  likesSalty?: boolean;
  likesSweet?: boolean;
  budgetFriendly?: boolean;
  organicPreference?: boolean;
  cookingStyle?: string;
  mealPace?: string;
  availableEquipment?: string[];
  seasonalIngredients?: boolean;
  language?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  // Declare preferences outside try block so it's accessible in catch block
  let preferences: UserPreferences | null = null;
  
  try {
    console.log('🍳 Recipe generation streaming API called');
    
    // Parse request body with error handling
    let ingredients: string[] = [];
    
    try {
      const body = await req.json();
      ingredients = body.ingredients || [];
      preferences = body.preferences || null;
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: "Invalid request format. Please provide ingredients as an array." 
      }, { status: 400 });
    }
    
    console.log('📋 Received ingredients:', ingredients);
    console.log('⚙️ Received preferences:', preferences);
    
    // Validate ingredients
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      console.log('❌ No ingredients provided or invalid format');
      return NextResponse.json({ 
        error: "Please provide at least one ingredient." 
      }, { status: 400 });
    }

    // Validate ingredients are strings
    if (!ingredients.every(ing => typeof ing === 'string' && ing.trim().length > 0)) {
      console.log('❌ Invalid ingredient format');
      return NextResponse.json({ 
        error: "All ingredients must be valid text." 
      }, { status: 400 });
    }

    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ OpenAI API key not configured');
      return NextResponse.json({ 
        error: "Recipe generation service is temporarily unavailable. Please try again later." 
      }, { status: 500 });
    }

    // Import OpenAI SDK with error handling
    let openai;
    try {
      const { OpenAI } = await import("openai");
      openai = new OpenAI({ apiKey });
    } catch (importError) {
      console.error('❌ Failed to import OpenAI SDK:', importError);
      return NextResponse.json({ 
        error: "Recipe generation service is temporarily unavailable. Please try again later." 
      }, { status: 500 });
    }

    // Build personalized system prompt based on user preferences
    let systemPrompt = `You are an expert, creative, and friendly chef named "Chef Feast." Your goal is to help the user cook delicious meals using available ingredients, respecting their preferences and dietary needs.

IMPORTANT: You MUST generate recipes even for common ingredients like onion, potato, banana, chicken, garlic, tomato, etc. These are excellent ingredients for cooking!

CRITICAL: NEVER ask for more ingredients or say "please provide additional ingredients." ALWAYS generate at least one complete recipe using the provided ingredients. If the ingredient list seems incomplete, suggest logical additions within the recipe itself, but always return a complete recipe.

CRITICAL: You MUST respond in ${preferences?.language || 'English'} language. All recipe titles, descriptions, and instructions must be in ${preferences?.language || 'English'}.

CRITICAL: Instructions must be an array of strings, not a single string. Each step should be a separate array element.

You will receive a list of ingredients and user preferences. Generate 1-2 creative, delicious recipes that:
1. Use the provided ingredients as the main components
2. Respect all dietary restrictions and health conditions
3. Match the user's cooking skill level
4. Fit within the specified cooking time
5. Use available equipment
6. Consider flavor preferences and spice levels

Return a JSON array of recipes with this exact format:
[
  {
    "title": "Recipe Title",
    "description": "Brief description of the recipe",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "prepTime": "10 minutes",
    "cookTime": "20 minutes"
  }
]`;

    // Add user preferences to the prompt if provided
    if (preferences) {
      console.log('🎯 Building personalized prompt with preferences:', preferences);
      
      // Extract key preference information with safe defaults
      const dietaryRestrictions = preferences.dietaryRestrictions || [];
      const healthConditions = preferences.healthConditions || [];
      const allergies = preferences.allergies || [];
      const cookingSkill = preferences.cookingSkill || 'Beginner';
      const maxCookingTime = preferences.maxCookingTime || '30 minutes';
      const servingSize = preferences.servingSize || '2-4 people';
      const mealType = preferences.mealType || 'dinner';
      const preferredCuisines = preferences.preferredCuisines || [];
      const spiceLevel = preferences.spiceLevel || 'medium';
      const likesSalty = preferences.likesSalty || false;
      const likesSweet = preferences.likesSweet || false;
      const budgetFriendly = preferences.budgetFriendly || false;
      const organicPreference = preferences.organicPreference || false;
      const cookingStyle = preferences.cookingStyle || 'traditional';
      const mealPace = preferences.mealPace || 'relaxed';
      const availableEquipment = preferences.availableEquipment || [];
      const seasonalIngredients = preferences.seasonalIngredients || false;
      const language = preferences.language || 'English';

      systemPrompt += `\n\n=== USER PREFERENCES ===
LANGUAGE: ${language}
CRITICAL: You MUST respond in ${language} language.
DIETARY RESTRICTIONS: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'None'}
HEALTH CONDITIONS: ${healthConditions.length > 0 ? healthConditions.join(', ') : 'None'}
ALLERGIES: ${allergies.length > 0 ? allergies.join(', ') : 'None'}
COOKING SKILL: ${cookingSkill}
MAX COOKING TIME: ${maxCookingTime}
SERVING SIZE: ${servingSize}
MEAL TYPE: ${mealType}
PREFERRED CUISINES: ${preferredCuisines.length > 0 ? preferredCuisines.join(', ') : 'Any'}
SPICE LEVEL: ${spiceLevel}
LIKES SALTY: ${likesSalty ? 'Yes' : 'No'}
LIKES SWEET: ${likesSweet ? 'Yes' : 'No'}
BUDGET FRIENDLY: ${budgetFriendly ? 'Yes' : 'No'}
ORGANIC PREFERENCE: ${organicPreference ? 'Yes' : 'No'}
COOKING STYLE: ${cookingStyle}
MEAL PACE: ${mealPace}
AVAILABLE EQUIPMENT: ${availableEquipment.length > 0 ? availableEquipment.join(', ') : 'stovetop, oven, microwave, basic utensils (pots, pans, knives, cutting board)'}
SEASONAL INGREDIENTS: ${seasonalIngredients ? 'Yes' : 'No'}

=== CRITICAL DIETARY RULES ===
${dietaryRestrictions.includes('Vegetarian') ? '🚫 STRICTLY NO MEAT, FISH, OR ANIMAL PRODUCTS. Use only plant-based ingredients.' : ''}
${dietaryRestrictions.includes('Vegan') ? '🚫 STRICTLY NO ANIMAL PRODUCTS AT ALL. Use only plant-based ingredients, no dairy, eggs, or honey.' : ''}
${dietaryRestrictions.includes('Gluten-Free') ? '🚫 NO GLUTEN-CONTAINING INGREDIENTS. Avoid wheat, barley, rye, and their derivatives.' : ''}
${dietaryRestrictions.includes('Dairy-Free') ? '🚫 NO DAIRY PRODUCTS. Avoid milk, cheese, yogurt, butter, and cream.' : ''}
${dietaryRestrictions.includes('Low-Carb') ? '🥗 MINIMIZE CARBOHYDRATES. Focus on protein and vegetables, avoid grains and starchy foods.' : ''}
${dietaryRestrictions.includes('Keto') ? '🥑 KETO-FRIENDLY ONLY. High fat, moderate protein, very low carb. Avoid all grains, sugars, and most fruits.' : ''}
${dietaryRestrictions.includes('Paleo') ? '🥩 PALEO-FRIENDLY ONLY. No grains, legumes, dairy, or processed foods. Focus on meat, fish, eggs, vegetables, fruits, and nuts.' : ''}

=== HEALTH CONDITION CONSIDERATIONS ===
${healthConditions.includes('Diabetes') ? '🩸 DIABETES-FRIENDLY: Low glycemic index, avoid added sugars, emphasize fiber and complex carbs.' : ''}
${healthConditions.includes('Heart Disease') ? '❤️ HEART-HEALTHY: Low sodium, heart-healthy fats, emphasize vegetables and lean proteins.' : ''}
${healthConditions.includes('High Blood Pressure') ? '🩺 LOW-SODIUM: Minimize salt, avoid processed foods, emphasize potassium-rich ingredients.' : ''}
${healthConditions.includes('Celiac Disease') ? '🌾 GLUTEN-FREE: Strictly avoid all gluten-containing ingredients.' : ''}
${healthConditions.includes('Lactose Intolerance') ? '🥛 LACTOSE-FREE: Avoid dairy or suggest lactose-free alternatives.' : ''}

=== COOKING INSTRUCTIONS ===
1. Based on the provided ingredients and the user's preferences above, suggest 2-3 unique and practical recipes.
2. For each recipe, provide:
   a. A creative and enticing title.
   b. A brief, inviting description.
   c. A concise list of required ingredients (including quantities, if reasonable assumptions can be made). Prioritize using the user's provided ingredients.
   d. Clear, step-by-step cooking instructions appropriate for ${cookingSkill} skill level.
   e. An estimated preparation time and cooking time (respecting the ${maxCookingTime} limit).
3. CRITICAL: Ensure recipes strictly adhere to ALL dietary restrictions and health conditions listed above.
4. Adapt spice level, flavor preferences, and cuisines as much as possible.
5. Consider the user's cooking skill level, available equipment, and time constraints.
6. EQUIPMENT GUIDELINES: If only basic equipment is available, focus on recipes that use stovetop, oven, microwave, and basic utensils. Avoid recipes requiring specialized equipment like food processors, stand mixers, or air fryers unless specifically listed as available.
7. CRITICAL: Instructions must be an array of strings, each step as a separate element.`;
    }

    // Create user prompt with ingredients
    const userPrompt = `Please generate delicious recipes using these ingredients: ${ingredients.join(', ')}.

Remember:
- Use the provided ingredients as the main components
- Respect all dietary restrictions and preferences
- Provide clear, step-by-step instructions
- Include realistic prep and cook times
- Make the recipes practical and achievable

Return the response as a valid JSON array of recipes.`;

    console.log('🤖 Calling OpenAI API for recipe generation...');
    
    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call OpenAI with streaming
          const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            stream: true,
            max_tokens: 2048,
            temperature: 0.7,
          });

          let accumulatedText = '';
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              accumulatedText += content;
              
              // Send the chunk to the client
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(content));
            }
          }
          
          console.log('✅ Recipe generation completed');
          console.log('📊 Total response length:', accumulatedText.length);
          console.log('⏱️ Generation time:', Date.now() - startTime, 'ms');
          
        } catch (error) {
          console.error('❌ Error during streaming:', error);
          
          // Send error message to client
          const encoder = new TextEncoder();
          const errorMessage = JSON.stringify({ 
            error: "Failed to generate recipe. Please try again." 
          });
          controller.enqueue(encoder.encode(errorMessage));
        } finally {
          controller.close();
        }
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Recipe generation error:', error);
    
    // Return error response
    const language = preferences?.language || 'English';
    let errorMessage = "Failed to generate recipe. Please try again.";
    
    // Language-specific error messages
    switch (language.toLowerCase()) {
      case 'polish':
        errorMessage = "Nie udało się wygenerować przepisu. Spróbuj ponownie.";
        break;
      case 'french':
        errorMessage = "Échec de la génération de recette. Veuillez réessayer.";
        break;
      case 'spanish':
        errorMessage = "Error al generar la receta. Inténtalo de nuevo.";
        break;
      case 'german':
        errorMessage = "Rezeptgenerierung fehlgeschlagen. Bitte versuchen Sie es erneut.";
        break;
      case 'italian':
        errorMessage = "Impossibile generare la ricetta. Riprova.";
        break;
      case 'portuguese':
        errorMessage = "Falha ao gerar receita. Tente novamente.";
        break;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 