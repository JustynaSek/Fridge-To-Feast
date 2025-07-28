import { NextRequest, NextResponse } from "next/server";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { setupVisionCredentials } from "../../../lib/vision-config";

// Helper to filter labels using LLM
async function filterFoodIngredients(labels: string[]): Promise<string[]> {
  try {
    // Get OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not found in environment variables");
    }

    // Import OpenAI SDK
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const prompt = `You are a food expert. From this list of detected objects in food images, identify ONLY food ingredients that could be used in cooking recipes. 

CRITICAL RULES:
1. Ignore non-food items like furniture, rooms, people, appliances, containers, lighting, brand names
2. Ignore generic terms like "Food", "Produce", "Ingredient", "Natural foods", "Vegetable", "Fruit"
3. DEDUPLICATE: If you see both "Onion" and "Yellow onion", return only "Onion"
4. DEDUPLICATE: If you see both "Banana" and "Saba banana", return only "Banana"
5. DEDUPLICATE: If you see both "Potato" and "Yukon Gold potato", return only "Potato"
6. Use the most common/generic name for recipe purposes
7. Focus on ingredients that work well in cooking

Detected objects: ${labels.join(", ")}

Return a JSON object with this exact format:
{
  "ingredients": ["onion", "potato", "banana"]
}

If no food ingredients are found, return: {"ingredients": []}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a food expert who identifies cooking ingredients from detected objects." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.1,
    });

    const llmResponse = completion.choices[0].message.content || "{}";
    console.log('LLM raw response:', llmResponse);
    
    const response = JSON.parse(llmResponse);
    console.log('LLM parsed response:', response);
    
    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    } else if (response.ingredients && Array.isArray(response.ingredients)) {
      return response.ingredients;
    } else if (response.food && Array.isArray(response.food)) {
      return response.food;
    } else {
      console.log('Unexpected response format, returning empty array');
      return [];
    }
    
  } catch (error) {
    console.error('LLM filtering error:', error);
    // Fallback: return original labels if LLM fails
    return labels;
  }
}

// Helper to call Google Cloud Vision API
async function detectIngredientsFromImages(images: Buffer[]): Promise<string[]> {
  try {
    console.log('Starting Vision API processing for', images.length, 'images');
    
    // Setup Vision credentials (works for both local and production)
    setupVisionCredentials();
    
    // Initialize Vision client
    console.log('Initializing Vision client...');
    const client = new ImageAnnotatorClient();
    console.log('Vision client initialized successfully');
    
    const allLabels: string[] = [];
    
    // Process each image
    for (let i = 0; i < images.length; i++) {
      try {
        console.log(`Processing image ${i + 1}/${images.length}`);
        
        // Convert buffer to base64
        const imageBase64 = images[i].toString('base64');
        
        // Call Vision API for label detection
        console.log('Calling Vision API...');
        const [result] = await client.labelDetection({
          image: { content: imageBase64 },
        });
        
        console.log('Vision API response received, labels found:', result.labelAnnotations?.length || 0);
        
        const labels = result.labelAnnotations || [];
        
        // Log all labels with their confidence scores
        console.log('\n📊 All detected labels with confidence scores:');
        labels.forEach((label, index) => {
          const confidence = label.score ? (label.score * 100).toFixed(1) : 'N/A';
          console.log(`  ${index + 1}. "${label.description}" - ${confidence}% confidence`);
        });
        
        // Collect all high-confidence labels (confidence > 0.6) - lowered for cluttered scenes
        const highConfidenceLabels = labels
          .filter(label => label.score && label.score > 0.6)
          .map(label => label.description)
          .filter((desc): desc is string => desc !== undefined);
        
        console.log('\n✅ High confidence labels (>60%):', highConfidenceLabels);
        
        // Also log labels with medium confidence (0.5-0.6) for comparison
        const mediumConfidenceLabels = labels
          .filter(label => label.score && label.score >= 0.5 && label.score <= 0.6)
          .map(label => label.description)
          .filter((desc): desc is string => desc !== undefined);
        
        console.log('⚠️  Medium confidence labels (50-60%):', mediumConfidenceLabels);
        
        allLabels.push(...highConfidenceLabels);
        
        // Analyze confidence patterns
        const specificFoodItems = labels.filter(label => 
          label.description && 
          !['Food', 'Produce', 'Ingredient', 'Natural foods', 'Vegetable', 'Fruit'].includes(label.description)
        );
        const genericTerms = labels.filter(label => 
          label.description && 
          ['Food', 'Produce', 'Ingredient', 'Natural foods', 'Vegetable', 'Fruit'].includes(label.description)
        );
        
        if (specificFoodItems.length > 0) {
          const avgSpecificConfidence = specificFoodItems.reduce((sum, label) => sum + (label.score || 0), 0) / specificFoodItems.length;
          console.log(`🍎 Specific food items average confidence: ${(avgSpecificConfidence * 100).toFixed(1)}%`);
        }
        
        if (genericTerms.length > 0) {
          const avgGenericConfidence = genericTerms.reduce((sum, label) => sum + (label.score || 0), 0) / genericTerms.length;
          console.log(`📦 Generic terms average confidence: ${(avgGenericConfidence * 100).toFixed(1)}%`);
        }
        
      } catch (error) {
        console.error(`Error processing image ${i + 1}:`, error);
        // Continue with other images even if one fails
      }
    }
    
    console.log('All images processed, total labels:', allLabels.length);
    console.log('All labels:', allLabels);
    
    // Use LLM to filter and identify only food ingredients
    console.log('Calling LLM for food filtering...');
    const foodIngredients = await filterFoodIngredients(allLabels);
    console.log('LLM filtered ingredients:', foodIngredients);
    
    // Smart deduplication - prefer generic names over specific ones
    const deduplicatedIngredients = foodIngredients.reduce((acc: string[], ingredient: string) => {
      const lowerIngredient = ingredient.toLowerCase();
      
      // Check if we already have a more generic version
      const hasGeneric = acc.some(existing => {
        const lowerExisting = existing.toLowerCase();
        return (
          (lowerIngredient.includes('onion') && lowerExisting.includes('onion')) ||
          (lowerIngredient.includes('potato') && lowerExisting.includes('potato')) ||
          (lowerIngredient.includes('banana') && lowerExisting.includes('banana'))
        );
      });
      
      if (!hasGeneric) {
        acc.push(ingredient);
      }
      
      return acc;
    }, []);
    
    console.log('Final deduplicated ingredients:', deduplicatedIngredients);
    
    return deduplicatedIngredients;
    
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error(`Failed to process images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse FormData
    const formData = await req.formData();
    const files = formData.getAll("images");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided." }, { status: 400 });
    }

    // Convert files to buffers
    const buffers: Buffer[] = [];
    for (const file of files) {
      if (typeof file === "object" && "arrayBuffer" in file) {
        const arrayBuffer = await file.arrayBuffer();
        buffers.push(Buffer.from(arrayBuffer));
      }
    }

    // Call Vision API
    const identifiedIngredients = await detectIngredientsFromImages(buffers);

    console.log('API returning:', { ingredients: identifiedIngredients });
    return NextResponse.json({ ingredients: identifiedIngredients });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 