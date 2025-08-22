# IKS - Indigenous Knowledge System for Veterinary Care

A comprehensive veterinary information system that provides traditional and indigenous knowledge for animal healthcare, with multi-language support and AI-powered assistance.

## Features

- 🐄 **Comprehensive Disease Database**: Extensive collection of cattle and buffalo diseases with traditional treatments
- 🌍 **Multi-language Support**: Available in English, Tamil, Hindi, Telugu, and Malayalam
- 🤖 **AI-Powered Chatbot**: BioBERT-based intelligent assistant for veterinary queries
- 🔍 **Advanced Search**: Search by symptoms or disease names with real-time results
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🗄️ **MongoDB Integration**: Real-time data from MongoDB database

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- BioBERT AI model integration

### Backend
- Node.js with Express
- MongoDB with Mongoose
- CORS enabled for cross-origin requests
- RESTful API design

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iks
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up MongoDB**
   - Ensure MongoDB is running locally on `mongodb://localhost:27017`
   - The database "IKS" will be created automatically

5. **Seed the Database**
   ```bash
   cd server
   node scripts/seedData.js
   ```

6. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on http://localhost:5000

7. **Start the Frontend Development Server**
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## API Endpoints

### Base URL: `http://localhost:5000/api`

- **GET** `/cowandbuff` - Get all diseases with optional filters
  - Query parameters: `language`, `search`, `severity`, `animal`, `limit`, `page`
- **GET** `/cowandbuff/:id` - Get single disease by ID
- **POST** `/cowandbuff` - Create new disease entry
- **GET** `/health` - Health check endpoint

### Example API Calls

```bash
# Get all diseases in Tamil
curl "http://localhost:5000/api/cowandbuff?language=ta"

# Search for fever symptoms
curl "http://localhost:5000/api/cowandbuff?search=fever&language=en"

# Get high severity diseases
curl "http://localhost:5000/api/cowandbuff?severity=High"
```

## Database Schema

The `CowAndBuff` collection supports flexible schema with the following core fields:

```javascript
{
  name: String,                    // Disease name
  treatmentName: String,           // Treatment name
  symptoms: [String],              // Array of symptoms
  ingredients: [String],           // Treatment ingredients
  preparation: String,             // Preparation instructions
  dosage: String,                  // Dosage and application
  severity: String,                // Low, Medium, High
  affectedAnimals: [String],       // Cattle, Buffaloes
  translations: {                  // Multi-language support
    ta: { /* Tamil translations */ },
    hi: { /* Hindi translations */ },
    te: { /* Telugu translations */ },
    ml: { /* Malayalam translations */ }
  },
  category: String,
  tags: [String],
  isActive: Boolean
}
```

## Multi-language Support

The application supports 5 languages:
- **English (en)** - Default
- **Tamil (ta)** - தமிழ்
- **Hindi (hi)** - हिन्दी
- **Telugu (te)** - తెలుగు
- **Malayalam (ml)** - മലയാളം

Language switching is available in the header, and all content including the AI chatbot responses are localized.

## AI Chatbot Features

- BioBERT-based question answering
- Multi-language query support
- Confidence scoring for responses
- Fallback mechanisms for better reliability
- Real-time disease information integration

## Development

### Adding New Diseases

You can add new diseases through the API or by modifying the seed script:

```bash
curl -X POST http://localhost:5000/api/cowandbuff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Disease",
    "treatmentName": "Treatment Name",
    "symptoms": ["symptom1", "symptom2"],
    "ingredients": ["ingredient1", "ingredient2"],
    "preparation": "Preparation instructions",
    "dosage": "Dosage instructions",
    "severity": "Medium",
    "affectedAnimals": ["Cattle"]
  }'
```

### Environment Variables

Backend environment variables (`.env` file):
```
MONGODB_URI=mongodb://localhost:27017/IKS
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env` file

2. **API Connection Failed**
   - Verify backend server is running on port 5000
   - Check CORS configuration
   - Ensure frontend is making requests to correct URL

3. **AI Model Loading Issues**
   - AI model downloads automatically on first use
   - Check browser console for loading progress
   - Ensure stable internet connection for model download

### Logs

- Backend logs: Check terminal where `npm run dev` is running
- Frontend logs: Check browser developer console
- MongoDB logs: Check MongoDB service logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
