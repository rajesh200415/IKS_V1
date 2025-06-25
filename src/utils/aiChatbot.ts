import { Disease } from '../types';
import { mockDiseases } from '../data/mockData';

export interface ChatResponse {
  text: string;
  relatedDiseases?: Disease[];
  suggestions?: string[];
}

// Simple keyword matching and scoring system
class VetCareAI {
  private diseases: Disease[];
  
  constructor(diseases: Disease[]) {
    this.diseases = diseases;
  }

  // Extract keywords from user input
  private extractKeywords(input: string): string[] {
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'his', 'her', 'my', 'what', 'how', 'when', 'where', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'them', 'us'];
    
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
  }

  // Score diseases based on keyword matches
  private scoreDiseaseRelevance(disease: Disease, keywords: string[], language: 'en' | 'ta'): number {
    let score = 0;
    const searchableText = this.getDiseaseSearchableText(disease, language).toLowerCase();
    
    keywords.forEach(keyword => {
      // Exact matches get higher scores
      if (searchableText.includes(keyword)) {
        score += 3;
      }
      
      // Partial matches get lower scores
      const words = searchableText.split(/\s+/);
      words.forEach(word => {
        if (word.includes(keyword) || keyword.includes(word)) {
          score += 1;
        }
      });
    });
    
    return score;
  }

  // Get all searchable text for a disease
  private getDiseaseSearchableText(disease: Disease, language: 'en' | 'ta'): string {
    if (language === 'ta' && disease.nameTa) {
      return [
        disease.nameTa,
        disease.treatmentNameTa || disease.treatmentName,
        ...(disease.symptomsTa || disease.symptoms),
        ...(disease.ingredientsTa || disease.ingredients),
        disease.preparationTa || disease.preparation,
        disease.dosageTa || disease.dosage,
        ...disease.affectedAnimals
      ].join(' ');
    }
    
    return [
      disease.name,
      disease.treatmentName,
      ...disease.symptoms,
      ...disease.ingredients,
      disease.preparation,
      disease.dosage,
      ...disease.affectedAnimals
    ].join(' ');
  }

  // Detect query intent
  private detectIntent(input: string): 'symptom_query' | 'disease_query' | 'treatment_query' | 'general_query' | 'greeting' {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey') || 
        lowerInput.includes('வணக்கம்') || lowerInput.includes('வாங்க')) {
      return 'greeting';
    }
    
    if (lowerInput.includes('symptom') || lowerInput.includes('sign') || lowerInput.includes('showing') ||
        lowerInput.includes('அறிகுறி') || lowerInput.includes('அடையாளம்')) {
      return 'symptom_query';
    }
    
    if (lowerInput.includes('treatment') || lowerInput.includes('cure') || lowerInput.includes('medicine') ||
        lowerInput.includes('சிகிச்சை') || lowerInput.includes('மருந்து') || lowerInput.includes('மருத்துவம்')) {
      return 'treatment_query';
    }
    
    if (lowerInput.includes('disease') || lowerInput.includes('illness') || lowerInput.includes('condition') ||
        lowerInput.includes('நோய்') || lowerInput.includes('வியாதி')) {
      return 'disease_query';
    }
    
    return 'general_query';
  }

  // Generate contextual suggestions
  private generateSuggestions(relatedDiseases: Disease[], language: 'en' | 'ta'): string[] {
    const suggestions = [];
    
    if (language === 'ta') {
      suggestions.push(
        'இந்த நோய்களின் அறிகுறிகள் என்ன?',
        'சிகிச்சை முறைகள் என்ன?',
        'தடுப்பு நடவடிக்கைகள் என்ன?'
      );
    } else {
      suggestions.push(
        'What are the symptoms of these diseases?',
        'How can I treat these conditions?',
        'What prevention measures should I take?'
      );
    }
    
    if (relatedDiseases.length > 0) {
      const commonAnimals = [...new Set(relatedDiseases.flatMap(d => d.affectedAnimals))];
      if (commonAnimals.length > 0) {
        const animal = commonAnimals[0];
        if (language === 'ta') {
          suggestions.push(`${animal === 'Cattle' ? 'மாடுகளில்' : 'எருமைகளில்'} மற்ற பொதுவான நோய்கள் என்ன?`);
        } else {
          suggestions.push(`What are other common diseases in ${animal.toLowerCase()}?`);
        }
      }
    }
    
    return suggestions.slice(0, 3);
  }

  // Main processing function
  public processQuery(input: string, language: 'en' | 'ta' = 'en'): ChatResponse {
    const intent = this.detectIntent(input);
    const keywords = this.extractKeywords(input);
    
    // Handle greetings
    if (intent === 'greeting') {
      return {
        text: language === 'ta' 
          ? 'வணக்கம்! நான் உங்கள் வெட்கேர் AI உதவியாளர். விலங்கு நல கேள்விகளில் உங்களுக்கு உதவ தயாராக இருக்கிறேன். எனக்கு அறிகுறிகள், நோய்கள் அல்லது சிகிச்சை முறைகளைப் பற்றி கேளுங்கள்!'
          : 'Hello! I\'m your VetCare AI assistant. I\'m ready to help you with animal health questions. Ask me about symptoms, diseases, or treatment methods!',
        suggestions: language === 'ta' 
          ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
          : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
      };
    }

    // If no keywords found, provide general help
    if (keywords.length === 0) {
      return {
        text: language === 'ta'
          ? 'உங்கள் கேள்வியை நான் புரிந்து கொள்ளவில்லை. தயவுசெய்து அறிகுறிகள், நோய் பெயர்கள் அல்லது சிகிச்சை முறைகளைப் பற்றி கேளுங்கள். உதாரணம்: "மாட்டில் காய்ச்சல்" அல்லது "பால் குறைவு"'
          : 'I didn\'t quite understand your question. Please ask about symptoms, disease names, or treatment methods. For example: "fever in cattle" or "milk reduction"',
        suggestions: this.generateSuggestions([], language)
      };
    }

    // Score and rank diseases
    const scoredDiseases = this.diseases
      .map(disease => ({
        disease,
        score: this.scoreDiseaseRelevance(disease, keywords, language)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const relatedDiseases = scoredDiseases.map(item => item.disease);

    // Generate response based on intent and findings
    let responseText = '';
    
    if (relatedDiseases.length === 0) {
      responseText = language === 'ta'
        ? `"${input}" பற்றிய குறிப்பிட்ட தகவல் எனக்கு கிடைக்கவில்லை. தயவுசெய்து மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்தி மேலும் விரிவான தகவல்களைப் பெறுங்கள். அல்லது வேறு வார்த்தைகளில் கேள்வியைக் கேளுங்கள்.`
        : `I couldn't find specific information about "${input}". Please use the search feature above for more detailed information, or try rephrasing your question with different keywords.`;
    } else {
      const diseaseCount = relatedDiseases.length;
      const diseaseNames = relatedDiseases.map(d => 
        language === 'ta' && d.nameTa ? d.nameTa : d.name
      ).join(', ');

      switch (intent) {
        case 'symptom_query':
          responseText = language === 'ta'
            ? `உங்கள் கேள்விக்கு தொடர்புடைய ${diseaseCount} நோய்(கள்) கண்டறியப்பட்டன: ${diseaseNames}. இந்த நோய்களின் முக்கிய அறிகுறிகளில் ${relatedDiseases[0].symptoms.slice(0, 3).join(', ')} ஆகியவை அடங்கும். மேலும் விரிவான தகவல்களுக்கு மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்துங்கள்.`
            : `I found ${diseaseCount} disease(s) related to your query: ${diseaseNames}. Key symptoms include ${relatedDiseases[0].symptoms.slice(0, 3).join(', ')}. Use the search feature above for more detailed information.`;
          break;
          
        case 'treatment_query':
          responseText = language === 'ta'
            ? `${diseaseNames} நோய்(களுக்கு) சிகிச்சை தகவல் கிடைத்துள்ளது. ${relatedDiseases[0].treatmentNameTa || relatedDiseases[0].treatmentName} போன்ற சிகிச்சை முறைகள் பயன்படுத்தப்படுகின்றன. முழுமையான சிகிச்சை விவரங்களுக்கு மேலே தேடுங்கள்.`
            : `Treatment information is available for ${diseaseNames}. Methods like ${relatedDiseases[0].treatmentName} are used. Search above for complete treatment details.`;
          break;
          
        case 'disease_query':
          responseText = language === 'ta'
            ? `${diseaseNames} பற்றிய தகவல் கிடைத்துள்ளது. இது ${relatedDiseases[0].affectedAnimals.join(', ')} ஆகியவற்றை பாதிக்கிறது. தீவிரத்தன்மை: ${relatedDiseases[0].severity}. மேலும் விவரங்களுக்கு தேடல் அம்சத்தைப் பயன்படுத்துங்கள்.`
            : `Information found for ${diseaseNames}. It affects ${relatedDiseases[0].affectedAnimals.join(', ')} with ${relatedDiseases[0].severity.toLowerCase()} severity. Use the search feature for more details.`;
          break;
          
        default:
          responseText = language === 'ta'
            ? `உங்கள் கேள்விக்கு ${diseaseCount} தொடர்புடைய நோய்(கள்) கண்டறியப்பட்டன: ${diseaseNames}. மேலும் விரிவான தகவல்களுக்கு மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்துங்கள்.`
            : `I found ${diseaseCount} related disease(s) for your query: ${diseaseNames}. Use the search feature above for detailed information.`;
      }
    }

    // Add medical disclaimer
    const disclaimer = language === 'ta'
      ? '\n\n⚠️ முக்கியமான குறிப்பு: இது கல்வி நோக்கங்களுக்காக மட்டுமே. சரியான நோயறிதல் மற்றும் சிகிச்சைக்கு எப்போதும் தகுதிவாய்ந்த கால்நடை மருத்துவரை அணுகவும்.'
      : '\n\n⚠️ Important: This is for educational purposes only. Always consult a qualified veterinarian for proper diagnosis and treatment.';

    return {
      text: responseText + disclaimer,
      relatedDiseases: relatedDiseases.slice(0, 2), // Limit to 2 for chat display
      suggestions: this.generateSuggestions(relatedDiseases, language)
    };
  }
}

// Export singleton instance
export const vetCareAI = new VetCareAI(mockDiseases);