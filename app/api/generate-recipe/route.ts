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

interface Recipe {
  title: string;
  description: string;
  ingredients: string[] | Array<{ ingredient: string; quantity: string }>;
  instructions: string | string[];
  prepTime: string;
  cookTime: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🍳 Recipe generation API called');
    
    // Parse request body with error handling
    let ingredients: string[] = [];
    let preferences: UserPreferences | null = null;
    
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

LANGUAGE REQUIREMENT: You MUST respond in the user's preferred language. If no language is specified, respond in English.`;

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
CRITICAL: You MUST respond in ${language} language. All recipe titles, descriptions, and instructions must be in ${language}.
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
7. Format your response as a JSON array of recipe objects. Each recipe object must have the keys: "title", "description", "ingredients", "instructions", "prepTime", "cookTime".

Example JSON structure:
[
  {
    "title": "Kurczak z Cytryną i Ziołami z Pieczonym Brokułem",
    "description": "Szybkie i aromatyczne danie bezglutenowe...",
    "ingredients": ["2 piersi kurczaka bez skóry", "1 główka brokuła", "1 cytryna", ...],
    "instructions": [
      "Rozgrzej piekarnik do 200°C",
      "Przypraw kurczaka solą i pieprzem",
      "Piecz przez 25 minut"
    ],
    "prepTime": "15 min",
    "cookTime": "25 min"
  }
]

CRITICAL: Instructions must be an array of strings, not a single string. Each step should be a separate array element.`;
    } else {
      // Fallback to basic prompt if no preferences
      systemPrompt += `

IMPORTANT: You MUST generate recipes even for common ingredients like onion, potato, banana, chicken, garlic, tomato, etc. These are excellent ingredients for cooking!

For each recipe, provide:
- A creative title
- A brief description  
- A list of required ingredients (with quantities if possible)
- Step-by-step instructions
- Estimated prep and cook time

Recipe ideas for common ingredients:
- Onion + Potato: Fried potatoes with onions, hash browns, potato and onion soup
- Banana: Banana bread, smoothies, banana pancakes, grilled banana
- Onion: Caramelized onions, onion soup, onion rings
- Potato: Mashed potatoes, roasted potatoes, potato salad

All recipes must be delicious, practical, and safe for human consumption. Do not suggest combinations or instructions that could be harmful or inedible.

If the ingredient list is short, unusual, or seems incomplete, you MUST still generate plausible and creative recipes using the provided ingredients. If necessary, you may suggest logical additions or substitutions, but always return at least one recipe.

Respond ONLY with a valid JSON array of recipe objects, each with the keys: 'title', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime'. The response must be valid JSON.

CRITICAL: Instructions must be an array of strings, not a single string. Each step should be a separate array element.`;
    }

    const userPrompt = `Generate recipes using: ${ingredients.join(", ")}. Format your response as a JSON array of recipe objects.`;
    
    console.log('🤖 System prompt length:', systemPrompt.length);
    console.log('👤 User prompt:', userPrompt);

    // Call OpenAI Chat API with timeout
    console.log('🚀 Calling OpenAI API...');
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2048,
        temperature: 0.7,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
    ]) as { choices: Array<{ message: { content: string } }> };
    
    console.log('✅ OpenAI API response received');
    console.log('📝 Raw LLM response:', completion.choices[0].message.content);

    // Parse the response with enhanced error handling
    let recipes: Recipe[];
    try {
      console.log('🔍 Parsing LLM response...');
      const parsed = JSON.parse(completion.choices[0].message.content || "[]");
      console.log('📊 Parsed response:', parsed);
      console.log('📊 First recipe instructions type:', typeof parsed[0]?.instructions);
      console.log('📊 First recipe instructions:', parsed[0]?.instructions);
      
      if (Array.isArray(parsed)) {
        console.log('✅ Response is an array, using directly');
        recipes = parsed;
      } else if (parsed && Array.isArray(parsed.recipes)) {
        console.log('✅ Response has recipes array, extracting');
        recipes = parsed.recipes;
      } else if (parsed && typeof parsed === 'object' && parsed.title) {
        // Handle single recipe object
        console.log('✅ Response is a single recipe object, wrapping in array');
        recipes = [parsed];
      } else {
        console.log('⚠️  Unexpected response format, using empty array');
        recipes = [];
      }
      
      // Filter out invalid recipes (missing required properties)
      recipes = recipes.filter((recipe: Recipe) => {
        const isValid = recipe && 
          typeof recipe === 'object' && 
          recipe.title && 
          recipe.description &&
          recipe.ingredients && 
          Array.isArray(recipe.ingredients) && 
          recipe.ingredients.length > 0 &&
          recipe.instructions;
        
        if (!isValid) {
          console.log('⚠️  Filtering out invalid recipe:', recipe);
        }
        return isValid;
      });
      
      // If no valid recipes were generated, create a fallback message
      if (recipes.length === 0) {
        console.log('⚠️  No valid recipes generated, creating fallback message');
        
        // Get language-specific error messages
        const language = preferences?.language || 'English';
        let errorMessages;
        
        switch (language) {
          case 'Polish':
            errorMessages = {
              title: "Problem z generowaniem przepisu",
              description: "Nie udało się wygenerować przepisu z podanymi składnikami. Spróbuj z innymi składnikami lub sprawdź swoje preferencje.",
              ingredients: ["Spróbuj inne składniki"],
              instructions: ["1. Spróbuj dodać więcej składników", "2. Sprawdź swoje preferencje dietetyczne", "3. Spróbuj ponownie z inną kombinacją"]
            };
            break;
          case 'French':
            errorMessages = {
              title: "Problème de génération de recette",
              description: "Je n'ai pas pu générer une recette avec les ingrédients actuels. Essayez avec différents ingrédients ou vérifiez vos préférences.",
              ingredients: ["Essayez différents ingrédients"],
              instructions: ["1. Essayez d'ajouter plus d'ingrédients", "2. Vérifiez vos préférences alimentaires", "3. Essayez à nouveau avec une combinaison différente"]
            };
            break;
          case 'Spanish':
            errorMessages = {
              title: "Problema de generación de receta",
              description: "No pude generar una receta con los ingredientes actuales. Intenta con diferentes ingredientes o verifica tus preferencias.",
              ingredients: ["Intenta diferentes ingredientes"],
              instructions: ["1. Intenta agregar más ingredientes", "2. Verifica tus preferencias dietéticas", "3. Intenta de nuevo con una combinación diferente"]
            };
            break;
          case 'German':
            errorMessages = {
              title: "Rezeptgenerierungsproblem",
              description: "Ich konnte mit den aktuellen Zutaten kein Rezept generieren. Versuchen Sie es mit anderen Zutaten oder überprüfen Sie Ihre Einstellungen.",
              ingredients: ["Versuchen Sie andere Zutaten"],
              instructions: ["1. Versuchen Sie, mehr Zutaten hinzuzufügen", "2. Überprüfen Sie Ihre Ernährungseinstellungen", "3. Versuchen Sie es erneut mit einer anderen Kombination"]
            };
            break;
          case 'Italian':
            errorMessages = {
              title: "Problema di generazione ricetta",
              description: "Non sono riuscito a generare una ricetta con gli ingredienti attuali. Prova con ingredienti diversi o controlla le tue preferenze.",
              ingredients: ["Prova ingredienti diversi"],
              instructions: ["1. Prova ad aggiungere più ingredienti", "2. Controlla le tue preferenze dietetiche", "3. Riprova con una combinazione diversa"]
            };
            break;
          case 'Portuguese':
            errorMessages = {
              title: "Problema de geração de receita",
              description: "Não consegui gerar uma receita com os ingredientes atuais. Tente com ingredientes diferentes ou verifique suas preferências.",
              ingredients: ["Tente ingredientes diferentes"],
              instructions: ["1. Tente adicionar mais ingredientes", "2. Verifique suas preferências dietéticas", "3. Tente novamente com uma combinação diferente"]
            };
            break;
          case 'English':
          default:
            errorMessages = {
              title: "Recipe Generation Issue",
              description: "I couldn't generate a recipe with the current ingredients. Please try with different ingredients or check your preferences.",
              ingredients: ["Please try different ingredients"],
              instructions: ["1. Try adding more ingredients", "2. Check your dietary preferences", "3. Try again with a different combination"]
            };
        }
        
        recipes = [{
          title: errorMessages.title,
          description: errorMessages.description,
          ingredients: errorMessages.ingredients,
          instructions: errorMessages.instructions,
          prepTime: "5 minutes",
          cookTime: "0 minutes"
        }];
      }
      
      console.log('🍽️  Final recipes array:', recipes);
      
      const responseTime = Date.now() - startTime;
      console.log(`⏱️  Total API response time: ${responseTime}ms`);
      
      return NextResponse.json({ recipes });
      
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      console.error('📝 Raw response that failed to parse:', completion.choices[0].message.content);
      
      return NextResponse.json({ 
        error: "Failed to generate recipes. Please try again with different ingredients." 
      }, { status: 500 });
    }
    
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Recipe generation failed:', error);
    console.error(`⏱️  Failed after ${responseTime}ms`);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        return NextResponse.json({ 
          error: "Recipe generation is taking longer than expected. Please try again." 
        }, { status: 408 });
      }
    }
    
    // Handle OpenAI API errors
    const openaiError = error as { code?: string; status?: number };
    if (openaiError.code === 'insufficient_quota' || openaiError.status === 429) {
      return NextResponse.json({ 
        error: "Recipe generation service is temporarily unavailable due to high demand. Please try again later." 
      }, { status: 429 });
    }
    
    if (openaiError.status === 401) {
      return NextResponse.json({ 
        error: "Recipe generation service is temporarily unavailable. Please try again later." 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate recipes. Please try again." 
    }, { status: 500 });
  }
} 