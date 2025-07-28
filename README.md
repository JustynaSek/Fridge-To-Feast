# 🍳 Fridge to Feast

Transform your ingredients into delicious recipes with AI-powered cooking suggestions. A modern, mobile-first web application that helps you create personalized meals from whatever you have in your kitchen.

## ✨ Features

### 🎯 Core Functionality
- **AI Recipe Generation**: Get personalized recipes using OpenAI's GPT-4 with comprehensive dietary and preference customization
- **Multi-Image Recognition**: Upload multiple photos of ingredients for automatic detection using Google Cloud Vision API
- **Text Input**: Manually enter ingredients for recipe suggestions with autocomplete
- **Comprehensive Preferences**: Set dietary restrictions, health conditions, cooking preferences, and more
- **Real-time Streaming**: Watch recipes generate in real-time with streaming responses

### 🌍 Internationalization
- **Multi-language Support**: Available in 7 languages (English, Polish, French, Spanish, German, Italian, Portuguese)
- **Localized Content**: All UI elements, error messages, and recipe content in user's preferred language
- **Language Switching**: Easy language toggle with persistent preferences

### 💾 Enhanced Local Storage & Management
- **Recipe Management**: Save, view, and organize your favorite recipes locally
- **Export/Import**: Backup and restore your recipe collection as JSON files
- **Storage Monitoring**: Automatic warnings when storage space is low
- **Data Cleanup**: Remove old recipes and corrupted data with one click
- **Offline Support**: Access saved recipes without internet connection

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for all screen sizes with touch-friendly interactions
- **Image Upload**: Drag & drop or tap to upload multiple images
- **Image Compression**: Automatic optimization for faster uploads
- **Touch-Friendly**: Large buttons and intuitive gestures for mobile devices

### 🎨 User Experience
- **Toast Notifications**: Real-time feedback for all actions with success/error states
- **Loading States**: Smooth animations and progress indicators for all operations
- **Error Handling**: Graceful fallbacks and user-friendly error messages in multiple languages
- **Dark Mode**: Beautiful dark theme support with automatic preference saving
- **Offline Indicator**: Visual feedback when internet connection is lost

### 🔧 Advanced Features
- **Image Processing**: Automatic ingredient detection from photos with confidence scoring
- **Smart Deduplication**: Intelligent filtering of similar ingredients
- **Preference Persistence**: All user preferences saved locally and applied to recipe generation
- **Recipe Streaming**: Real-time recipe generation with live updates
- **Storage Management**: Comprehensive local storage tools with cleanup capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Google Cloud Vision API key (optional, for image recognition)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fridge-to-feast
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your API keys:
   ```env
   # Required for recipe generation
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional for image recognition
   GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router and Turbopack
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first styling with dark mode
- **React Hooks**: Advanced state management with useCallback and useEffect

### Backend & APIs
- **Next.js API Routes**: Serverless functions for recipe generation and image processing
- **OpenAI API**: GPT-4 integration for intelligent recipe generation
- **Google Cloud Vision**: Advanced image recognition for ingredient detection
- **Streaming Responses**: Real-time recipe generation with Server-Sent Events

### Data & Storage
- **Local Storage**: Client-side data persistence for recipes and preferences
- **IndexedDB**: Advanced local storage for larger datasets
- **File System**: Export/import functionality for recipe backups

### Deployment
- **Vercel**: Serverless deployment platform with edge functions
- **Edge Functions**: Global CDN distribution for optimal performance

## 📱 Usage Guide

### Getting Started
1. **Set Preferences**: Click the settings icon to configure dietary restrictions, health conditions, and cooking preferences
2. **Choose Input Method**: Use image upload or text input to add your ingredients
3. **Generate Recipes**: Click "Generate Recipes" to get AI-powered suggestions
4. **Save Favorites**: Click the heart icon to save recipes you love
5. **Manage Collection**: Use the saved recipes button to view, export, or delete recipes

### Input Methods

#### 📸 Multi-Image Upload
- Upload multiple photos of ingredients simultaneously
- Drag & drop or tap to select images
- AI automatically detects ingredients with confidence scoring
- Edit detected ingredients before generating recipes
- Individual image deletion and bulk clear operations
- Automatic image compression for faster processing

#### ✏️ Text Input
- Manually type ingredient names with autocomplete
- Add multiple ingredients with comma separation
- Quick ingredient suggestions and validation
- Real-time input validation and feedback

### Recipe Management
- **Save Recipes**: Store your favorites locally with one click
- **Export Data**: Download your recipe collection as JSON files
- **Import Data**: Restore recipes from backup files
- **Share Recipes**: Copy recipe text or use native sharing
- **Print Recipes**: Generate print-friendly recipe cards
- **Storage Monitoring**: Automatic warnings and cleanup tools

### Language Support
- **7 Languages**: English, Polish, French, Spanish, German, Italian, Portuguese
- **Localized UI**: All interface elements translated
- **Recipe Localization**: Recipes generated in user's preferred language
- **Error Messages**: User-friendly errors in multiple languages

## 🔧 Configuration

### Environment Variables

```env
# Required for recipe generation
OPENAI_API_KEY=your_openai_api_key

# Optional for image recognition
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key

# Optional for production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### User Preferences

The app supports comprehensive user preferences:

#### Health & Dietary
- Dietary restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Paleo, Low-Carb, Pescatarian)
- Health conditions (Diabetes, Heart Disease, High Blood Pressure, Celiac Disease, Lactose Intolerance, IBS, Kidney Disease)
- Allergies and intolerances with automatic filtering

#### Cooking Preferences
- Spice level (Mild to Very Hot)
- Flavor preferences (Salty, Sweet)
- Cooking skill level (Beginner to Expert)
- Available kitchen equipment
- Cooking style (Traditional, Modern, Fusion)
- Meal pace (Quick, Moderate, Relaxed)

#### Meal Planning
- Serving size (1-2 to 8+ people)
- Meal type (Breakfast, Lunch, Dinner, Snack, Dessert)
- Maximum cooking time
- Budget-friendly options
- Organic preference
- Seasonal ingredients preference

#### Cuisine Preferences
- Preferred cuisines (Italian, Mexican, Asian, Mediterranean, Indian, French, American, Thai, Japanese, Greek, Spanish, Middle Eastern)

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Configure Environment Variables**
   - Add `OPENAI_API_KEY` in Vercel dashboard
   - Add `GOOGLE_CLOUD_VISION_API_KEY` if using image recognition
   - Set other optional variables

3. **Deploy**
   - Vercel automatically deploys on push
   - Custom domain configuration available

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Setup

Ensure these environment variables are set in production:

```bash
# Required for recipe generation
OPENAI_API_KEY=sk-...

# Optional for image recognition
GOOGLE_CLOUD_VISION_API_KEY=...
```

## 📊 Performance & Optimization

### Optimizations
- **Image Optimization**: Automatic compression and resizing for faster uploads
- **Bundle Splitting**: Code splitting for faster loading with Turbopack
- **Streaming Responses**: Real-time recipe generation without waiting
- **Lazy Loading**: Components load on demand
- **Caching**: Static generation where possible

### Monitoring
- **Error Tracking**: Comprehensive error logging with user-friendly messages
- **Performance Metrics**: Response time monitoring for API calls
- **Storage Management**: Automatic cleanup and warnings for local storage
- **Offline Detection**: Real-time connection status monitoring

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All user data stored locally in the browser
- **No Server Storage**: No personal data sent to servers except for API calls
- **API Calls**: Only recipe generation requests sent to OpenAI
- **Image Processing**: Optional cloud vision API for ingredient detection
- **Data Export**: Users can export and delete their data at any time

### Security Features
- **Input Validation**: Sanitized user inputs with comprehensive validation
- **Rate Limiting**: API request throttling to prevent abuse
- **Error Handling**: Secure error messages without exposing sensitive data
- **HTTPS Only**: Secure connections in production
- **No Data Retention**: Images and personal data not stored on servers

## 🐛 Troubleshooting

### Common Issues

#### Recipe Generation Fails
- Check OpenAI API key configuration
- Verify API quota and billing status
- Ensure ingredients are properly formatted
- Check internet connection for API calls

#### Image Upload Issues
- Check browser compatibility (Chrome, Firefox, Safari, Edge)
- Verify file size limits (automatic compression helps)
- Ensure proper file formats (JPG, PNG, WebP)
- Check Google Cloud Vision API key if using image recognition

#### Storage Problems
- Clear browser data if storage is full
- Export recipes before clearing data
- Check browser storage permissions
- Use the storage management tools in the app

#### Language Issues
- Clear browser cache if language switching doesn't work
- Check if the language file is properly loaded
- Verify browser language settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain mobile-first responsive design
- Add proper error handling and loading states
- Include comprehensive logging for debugging
- Test with multiple languages and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for recipe generation capabilities
- Google Cloud for image recognition technology
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling
- Vercel for seamless deployment
- React team for the powerful component system

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation
- Test with different browsers and devices

---

**Made with ❤️ for food lovers everywhere**

*Current Version: 0.1.0 - Phase 2.5 (User Experience Enhancement)*
