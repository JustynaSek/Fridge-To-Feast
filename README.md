# 🍳 Fridge to Feast

Transform your ingredients into delicious recipes with AI-powered cooking suggestions. A modern, mobile-first web application that helps you create personalized meals from whatever you have in your kitchen.

## ✨ Features

### 🎯 Core Functionality
- **AI Recipe Generation**: Get personalized recipes using OpenAI's GPT-4
- **Image Recognition**: Upload photos of ingredients for automatic detection
- **Text Input**: Manually enter ingredients for recipe suggestions
- **Personalized Preferences**: Set dietary restrictions, health conditions, and cooking preferences

### 💾 Enhanced Local Storage
- **Recipe Management**: Save, view, and organize your favorite recipes
- **Export/Import**: Backup and restore your recipe collection
- **Storage Monitoring**: Automatic warnings when storage space is low
- **Data Cleanup**: Remove old recipes and corrupted data

### 📱 Mobile-First Design
- **Responsive UI**: Optimized for all screen sizes
- **Touch-Friendly**: Large buttons and intuitive gestures
- **PWA Ready**: Install as a mobile app
- **Offline Support**: Access saved recipes without internet

### 🎨 User Experience
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Smooth animations and progress indicators
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Dark Mode**: Beautiful dark theme support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

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
   
   Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: State management
- **Local Storage**: Client-side data persistence

### Backend
- **Next.js API Routes**: Serverless functions
- **OpenAI API**: Recipe generation
- **Google Cloud Vision**: Image recognition (optional)

### Deployment
- **Vercel**: Serverless deployment platform
- **Edge Functions**: Global CDN distribution

## 📱 Usage Guide

### Getting Started
1. **Set Preferences**: Click the settings icon to configure dietary restrictions and cooking preferences
2. **Add Ingredients**: Use the image upload or text input to add your ingredients
3. **Generate Recipes**: Click "Generate Recipes" to get AI-powered suggestions
4. **Save Favorites**: Click the heart icon to save recipes you love
5. **Manage Collection**: Use the saved recipes button to view, export, or delete recipes

### Input Methods

#### 📸 Image Upload
- Take photos of ingredients or upload from gallery
- AI automatically detects ingredients
- Edit detected ingredients before generating recipes
- Supports multiple images

#### ✏️ Text Input
- Manually type ingredient names
- Add multiple ingredients with comma separation
- Quick ingredient suggestions

### Recipe Management
- **Save Recipes**: Store your favorites locally
- **Export Data**: Download your recipe collection as JSON
- **Import Data**: Restore recipes from backup files
- **Share Recipes**: Copy recipe text or use native sharing
- **Print Recipes**: Generate print-friendly recipe cards

## 🔧 Configuration

### Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### User Preferences

The app supports comprehensive user preferences:

#### Health & Dietary
- Dietary restrictions (Vegetarian, Vegan, Gluten-Free, etc.)
- Health conditions (Diabetes, Heart Disease, etc.)
- Allergies and intolerances

#### Cooking Preferences
- Spice level (Mild to Very Hot)
- Flavor preferences (Salty, Sweet)
- Cooking skill level (Beginner to Advanced)
- Available kitchen equipment

#### Meal Planning
- Serving size (1-2 to 8+ people)
- Meal type (Breakfast, Lunch, Dinner, etc.)
- Maximum cooking time
- Budget-friendly options

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Configure Environment Variables**
   - Add `OPENAI_API_KEY` in Vercel dashboard
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

## 📊 Performance

### Optimizations
- **Image Optimization**: Automatic compression and resizing
- **Bundle Splitting**: Code splitting for faster loading
- **Caching**: Static generation where possible
- **Lazy Loading**: Components load on demand

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **Storage Management**: Automatic cleanup and warnings

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All user data stored locally
- **No Server Storage**: No personal data sent to servers
- **API Calls**: Only recipe generation requests sent to OpenAI
- **Image Processing**: Optional cloud vision API for ingredient detection

### Security Features
- **Input Validation**: Sanitized user inputs
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error messages
- **HTTPS Only**: Secure connections in production

## 🐛 Troubleshooting

### Common Issues

#### Recipe Generation Fails
- Check OpenAI API key configuration
- Verify API quota and billing
- Ensure ingredients are properly formatted

#### Image Upload Issues
- Check browser compatibility
- Verify file size limits
- Ensure proper file formats (JPG, PNG)

#### Storage Problems
- Clear browser data if storage is full
- Export recipes before clearing data
- Check browser storage permissions

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
- Add proper error handling
- Include loading states

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for recipe generation capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first styling
- Vercel for seamless deployment

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Made with ❤️ for food lovers everywhere**
