import { Disease } from '../types';
import { mockDiseases } from '../data/mockData';

export interface ChatResponse {
  text: string;
  relatedDiseases?: Disease[];
  suggestions?: string[];
}

// Enhanced Tamil keyword mapping for better accuracy
const tamilKeywordMap: { [key: string]: string[] } = {
  // Symptoms in Tamil
  'காய்ச்சல்': ['fever', 'temperature', 'hot'],
  'வயிற்றுப்போக்கு': ['diarrhea', 'loose', 'watery', 'stool'],
  'இருமல்': ['cough', 'coughing'],
  'மூச்சுத்திணறல்': ['breathing', 'difficulty', 'respiratory'],
  'பால்குறைவு': ['milk', 'reduction', 'decrease', 'low'],
  'பசியின்மை': ['appetite', 'loss', 'eating', 'feed'],
  'வீக்கம்': ['swelling', 'inflammation', 'bloating'],
  'நடுக்கம்': ['shivering', 'trembling', 'shaking'],
  'சோர்வு': ['weakness', 'fatigue', 'tired'],
  'வாந்தி': ['vomiting', 'nausea'],
  
  // Animals in Tamil
  'மாடு': ['cattle', 'cow', 'bull'],
  'மாடுகள்': ['cattle', 'cows', 'bulls'],
  'எருமை': ['buffalo', 'buffaloes'],
  'எருமைகள்': ['buffalo', 'buffaloes'],
  'கால்நடை': ['livestock', 'animal', 'cattle'],
  'கால்நடைகள்': ['livestock', 'animals', 'cattle'],
  
  // Diseases in Tamil
  'நோய்': ['disease', 'illness', 'condition'],
  'நோய்கள்': ['diseases', 'illnesses', 'conditions'],
  'தொற்று': ['infection', 'infectious'],
  'வியாதி': ['disease', 'ailment'],
  
  // Treatment in Tamil
  'சிகிச்சை': ['treatment', 'therapy', 'cure'],
  'மருந்து': ['medicine', 'medication', 'drug'],
  'மருத்துவம்': ['medical', 'treatment', 'therapy'],
  'தடுப்பூசி': ['vaccine', 'vaccination', 'immunization'],
  'குணப்படுத்து': ['cure', 'heal', 'treat'],
  
  // Common Tamil words
  'எப்படி': ['how', 'what', 'method'],
  'என்ன': ['what', 'which'],
  'எங்கே': ['where'],
  'எப்போது': ['when'],
  'ஏன்': ['why', 'reason'],
  'யார்': ['who'],
};

// Enhanced English to Tamil symptom mapping
const symptomTranslationMap: { [key: string]: string } = {
  'fever': 'காய்ச்சல்',
  'diarrhea': 'வயிற்றுப்போக்கு',
  'cough': 'இருமல்',
  'breathing difficulty': 'மூச்சுத்திணறல்',
  'milk reduction': 'பால் குறைவு',
  'loss of appetite': 'பசியின்மை',
  'swelling': 'வீக்கம்',
  'weakness': 'சோர்வு',
  'vomiting': 'வாந்தி',
  'shivering': 'நடுக்கம்',
};

// Simple keyword matching and scoring system
class VetCareAI {
  private diseases: Disease[];
  
  constructor(diseases: Disease[]) {
    this.diseases = diseases;
  }

  // Enhanced Tamil keyword extraction
  private extractKeywords(input: string, language: 'en' | 'ta'): string[] {
    const stopWords = language === 'ta' 
      ? ['அது', 'இது', 'என்று', 'ஆக', 'மற்றும்', 'அல்லது', 'ஆனால்', 'எனவே', 'அதனால்', 'இல்லை', 'இல்லாமல்', 'உள்ள', 'உள்ளது', 'இருக்கும்', 'இருக்கிறது', 'செய்ய', 'செய்து', 'வேண்டும்', 'முடியும்', 'கூடும்']
      : ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'his', 'her', 'my', 'what', 'how', 'when', 'where', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'them', 'us'];
    
    let keywords = input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word));

    // For Tamil, also add mapped English keywords
    if (language === 'ta') {
      const mappedKeywords: string[] = [];
      keywords.forEach(keyword => {
        if (tamilKeywordMap[keyword]) {
          mappedKeywords.push(...tamilKeywordMap[keyword]);
        }
      });
      keywords = [...keywords, ...mappedKeywords];
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  // Enhanced scoring with Tamil context
  private scoreDiseaseRelevance(disease: Disease, keywords: string[], language: 'en' | 'ta'): number {
    let score = 0;
    const searchableText = this.getDiseaseSearchableText(disease, language).toLowerCase();
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // Exact matches get highest scores
      if (searchableText.includes(keywordLower)) {
        score += 5;
      }
      
      // Check individual words for partial matches
      const words = searchableText.split(/\s+/);
      words.forEach(word => {
        if (word.includes(keywordLower) || keywordLower.includes(word)) {
          score += 2;
        }
        
        // Tamil-specific fuzzy matching
        if (language === 'ta') {
          // Check if Tamil keyword maps to English word in disease data
          Object.entries(tamilKeywordMap).forEach(([tamilWord, englishWords]) => {
            if (keywordLower.includes(tamilWord) || tamilWord.includes(keywordLower)) {
              englishWords.forEach(englishWord => {
                if (word.includes(englishWord.toLowerCase())) {
                  score += 3;
                }
              });
            }
          });
        }
      });
    });
    
    return score;
  }

  // Enhanced searchable text with better Tamil support
  private getDiseaseSearchableText(disease: Disease, language: 'en' | 'ta'): string {
    const texts: string[] = [];
    
    if (language === 'ta') {
      // Prioritize Tamil content
      texts.push(disease.nameTa || disease.name);
      texts.push(disease.treatmentNameTa || disease.treatmentName);
      texts.push(...(disease.symptomsTa || disease.symptoms));
      texts.push(...(disease.ingredientsTa || disease.ingredients));
      texts.push(disease.preparationTa || disease.preparation);
      texts.push(disease.dosageTa || disease.dosage);
      
      // Also include English for cross-reference
      texts.push(disease.name, disease.treatmentName);
      texts.push(...disease.symptoms);
    } else {
      texts.push(disease.name, disease.treatmentName);
      texts.push(...disease.symptoms);
      texts.push(...disease.ingredients);
      texts.push(disease.preparation, disease.dosage);
    }
    
    texts.push(...disease.affectedAnimals);
    return texts.join(' ');
  }

  // Enhanced intent detection with Tamil support
  private detectIntent(input: string, language: 'en' | 'ta'): 'symptom_query' | 'disease_query' | 'treatment_query' | 'general_query' | 'greeting' {
    const lowerInput = input.toLowerCase();
    
    // Greeting detection
    const greetingPatterns = language === 'ta' 
      ? ['வணக்கம்', 'வாங்க', 'ஹலோ', 'ஹாய்', 'நமஸ்காரம்']
      : ['hello', 'hi', 'hey', 'greetings'];
    
    if (greetingPatterns.some(pattern => lowerInput.includes(pattern))) {
      return 'greeting';
    }
    
    // Symptom query detection
    const symptomPatterns = language === 'ta'
      ? ['அறிகுறி', 'அடையாளம்', 'லக்ஷணம்', 'காய்ச்சல்', 'வயிற்றுப்போக்கு', 'இருமல்', 'வீக்கம்']
      : ['symptom', 'sign', 'showing', 'fever', 'cough', 'diarrhea'];
    
    if (symptomPatterns.some(pattern => lowerInput.includes(pattern))) {
      return 'symptom_query';
    }
    
    // Treatment query detection
    const treatmentPatterns = language === 'ta'
      ? ['சிகிச்சை', 'மருந்து', 'மருத்துவம்', 'குணப்படுத்து', 'தடுப்பூசி', 'எப்படி சரி']
      : ['treatment', 'cure', 'medicine', 'therapy', 'heal', 'remedy'];
    
    if (treatmentPatterns.some(pattern => lowerInput.includes(pattern))) {
      return 'treatment_query';
    }
    
    // Disease query detection
    const diseasePatterns = language === 'ta'
      ? ['நோய்', 'வியாதி', 'தொற்று', 'பிரச்சனை']
      : ['disease', 'illness', 'condition', 'problem'];
    
    if (diseasePatterns.some(pattern => lowerInput.includes(pattern))) {
      return 'disease_query';
    }
    
    return 'general_query';
  }

  // Enhanced suggestions with better Tamil context
  private generateSuggestions(relatedDiseases: Disease[], language: 'en' | 'ta', intent: string): string[] {
    const suggestions: string[] = [];
    
    if (language === 'ta') {
      switch (intent) {
        case 'symptom_query':
          suggestions.push(
            'இந்த அறிகுறிகளுக்கான சிகிச்சை என்ன?',
            'இந்த நோய் எவ்வளவு தீவிரமானது?',
            'தடுப்பு நடவடிக்கைகள் என்ன?'
          );
          break;
        case 'treatment_query':
          suggestions.push(
            'இந்த மருந்துகளின் அளவு என்ன?',
            'எத்தனை நாட்கள் சிகிச்சை தேவை?',
            'பக்க விளைவுகள் உள்ளதா?'
          );
          break;
        case 'disease_query':
          suggestions.push(
            'இந்த நோயின் முக்கிய அறிகுறிகள் என்ன?',
            'இது எப்படி பரவுகிறது?',
            'சிகிச்சை முறைகள் என்ன?'
          );
          break;
        default:
          suggestions.push(
            'மாட்டில் காய்ச்சல் அறிகுறிகள்',
            'எருமையின் பால் குறைவு',
            'கால்நடை தடுப்பூசி அட்டவணை'
          );
      }
    } else {
      switch (intent) {
        case 'symptom_query':
          suggestions.push(
            'What treatment is needed for these symptoms?',
            'How serious is this condition?',
            'What prevention measures should I take?'
          );
          break;
        case 'treatment_query':
          suggestions.push(
            'What is the correct dosage?',
            'How long does treatment take?',
            'Are there any side effects?'
          );
          break;
        case 'disease_query':
          suggestions.push(
            'What are the main symptoms?',
            'How does this disease spread?',
            'What treatment options are available?'
          );
          break;
        default:
          suggestions.push(
            'Fever symptoms in cattle',
            'Milk reduction in buffaloes',
            'Livestock vaccination schedule'
          );
      }
    }
    
    // Add animal-specific suggestions if relevant diseases found
    if (relatedDiseases.length > 0) {
      const commonAnimals = [...new Set(relatedDiseases.flatMap(d => d.affectedAnimals))];
      if (commonAnimals.includes('Cattle')) {
        suggestions.push(language === 'ta' ? 'மாடுகளின் பொதுவான நோய்கள்' : 'Common cattle diseases');
      }
      if (commonAnimals.includes('Buffaloes')) {
        suggestions.push(language === 'ta' ? 'எருமைகளின் பொதுவான நோய்கள்' : 'Common buffalo diseases');
      }
    }
    
    return suggestions.slice(0, 3);
  }

  // Enhanced response generation with better Tamil context
  private generateContextualResponse(relatedDiseases: Disease[], intent: string, language: 'en' | 'ta', originalQuery: string): string {
    if (relatedDiseases.length === 0) {
      return language === 'ta'
        ? `"${originalQuery}" பற்றிய குறிப்பிட்ட தகவல் தற்போது கிடைக்கவில்லை. தயவுசெய்து:\n\n• மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்துங்கள்\n• வேறு வார்த்தைகளில் கேள்வியைக் கேளுங்கள்\n• அறிகுறிகளை விரிவாக விவரிக்கவும்`
        : `I couldn't find specific information about "${originalQuery}". Please try:\n\n• Using the search feature above\n• Rephrasing your question\n• Providing more detailed symptoms`;
    }

    const diseaseCount = relatedDiseases.length;
    const primaryDisease = relatedDiseases[0];
    const diseaseNames = relatedDiseases.map(d => 
      language === 'ta' && d.nameTa ? d.nameTa : d.name
    );

    let response = '';

    if (language === 'ta') {
      switch (intent) {
        case 'symptom_query':
          response = `உங்கள் கேள்விக்கு ${diseaseCount} தொடர்புடைய நோய்(கள்) கண்டறியப்பட்டன:\n\n`;
          response += `🔍 **முக்கிய கண்டுபிடிப்புகள்:**\n`;
          response += `• ${diseaseNames.join(', ')}\n`;
          response += `• முக்கிய அறிகுறிகள்: ${(primaryDisease.symptomsTa || primaryDisease.symptoms).slice(0, 3).join(', ')}\n`;
          response += `• தீவிரத்தன்மை: ${primaryDisease.severity === 'High' ? 'அதிகம்' : primaryDisease.severity === 'Medium' ? 'நடுத்தரம்' : 'குறைவு'}\n`;
          response += `• பாதிக்கும் விலங்குகள்: ${primaryDisease.affectedAnimals.map(a => a === 'Cattle' ? 'மாடுகள்' : 'எருமைகள்').join(', ')}`;
          break;
          
        case 'treatment_query':
          response = `${diseaseNames.join(', ')} நோய்(களுக்கு) சிகிச்சை தகவல்:\n\n`;
          response += `💊 **சிகிச்சை முறை:** ${primaryDisease.treatmentNameTa || primaryDisease.treatmentName}\n`;
          response += `🌿 **முக்கிய பொருட்கள்:** ${(primaryDisease.ingredientsTa || primaryDisease.ingredients).slice(0, 3).join(', ')}\n`;
          response += `📋 **தயாரிப்பு:** ${(primaryDisease.preparationTa || primaryDisease.preparation).substring(0, 100)}...\n`;
          response += `⚡ **அளவு:** ${(primaryDisease.dosageTa || primaryDisease.dosage).substring(0, 80)}...`;
          break;
          
        case 'disease_query':
          response = `${diseaseNames.join(', ')} பற்றிய விரிவான தகவல்:\n\n`;
          response += `📊 **நோய் விவரம்:**\n`;
          response += `• பெயர்: ${primaryDisease.nameTa || primaryDisease.name}\n`;
          response += `• பாதிக்கும் விலங்குகள்: ${primaryDisease.affectedAnimals.map(a => a === 'Cattle' ? 'மாடுகள்' : 'எருமைகள்').join(', ')}\n`;
          response += `• தீவிரத்தன்மை: ${primaryDisease.severity === 'High' ? 'அதிகம்' : primaryDisease.severity === 'Medium' ? 'நடுத்தரம்' : 'குறைவு'}\n`;
          response += `• சிகிச்சை: ${primaryDisease.treatmentNameTa || primaryDisease.treatmentName}`;
          break;
          
        default:
          response = `உங்கள் கேள்விக்கு ${diseaseCount} தொடர்புடைய நோய்(கள்) கண்டறியப்பட்டன: **${diseaseNames.join(', ')}**\n\n`;
          response += `விரிவான தகவல்களுக்கு மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்துங்கள் அல்லது கீழே உள்ள நோய் அட்டைகளைக் கிளிக் செய்யுங்கள்.`;
      }
    } else {
      switch (intent) {
        case 'symptom_query':
          response = `Found ${diseaseCount} disease(s) related to your symptoms:\n\n`;
          response += `🔍 **Key Findings:**\n`;
          response += `• Diseases: ${diseaseNames.join(', ')}\n`;
          response += `• Main symptoms: ${primaryDisease.symptoms.slice(0, 3).join(', ')}\n`;
          response += `• Severity: ${primaryDisease.severity}\n`;
          response += `• Affects: ${primaryDisease.affectedAnimals.join(', ')}`;
          break;
          
        case 'treatment_query':
          response = `Treatment information for ${diseaseNames.join(', ')}:\n\n`;
          response += `💊 **Treatment Method:** ${primaryDisease.treatmentName}\n`;
          response += `🌿 **Key Ingredients:** ${primaryDisease.ingredients.slice(0, 3).join(', ')}\n`;
          response += `📋 **Preparation:** ${primaryDisease.preparation.substring(0, 100)}...\n`;
          response += `⚡ **Dosage:** ${primaryDisease.dosage.substring(0, 80)}...`;
          break;
          
        case 'disease_query':
          response = `Detailed information about ${diseaseNames.join(', ')}:\n\n`;
          response += `📊 **Disease Details:**\n`;
          response += `• Name: ${primaryDisease.name}\n`;
          response += `• Affects: ${primaryDisease.affectedAnimals.join(', ')}\n`;
          response += `• Severity: ${primaryDisease.severity}\n`;
          response += `• Treatment: ${primaryDisease.treatmentName}`;
          break;
          
        default:
          response = `Found ${diseaseCount} related disease(s): **${diseaseNames.join(', ')}**\n\n`;
          response += `Use the search feature above for detailed information or click on the disease cards below.`;
      }
    }

    return response;
  }

  // Main processing function with enhanced Tamil support
  public processQuery(input: string, language: 'en' | 'ta' = 'en'): ChatResponse {
    const intent = this.detectIntent(input, language);
    const keywords = this.extractKeywords(input, language);
    
    // Handle greetings with better Tamil context
    if (intent === 'greeting') {
      return {
        text: language === 'ta' 
          ? 'வணக்கம்! 🙏 நான் உங்கள் வெட்கேர் AI உதவியாளர். விலங்கு நல கேள்விகளில் உங்களுக்கு உதவ தயாராக இருக்கிறேன்.\n\n🔍 **நான் உதவக்கூடிய விஷயங்கள்:**\n• அறிகுறிகள் அடையாளம் காணுதல்\n• நோய் தகவல்கள்\n• சிகிச்சை முறைகள்\n• தடுப்பு நடவடிக்கைகள்\n\nஎனக்கு எதையும் கேளுங்கள்!'
          : 'Hello! 🙏 I\'m your VetCare AI assistant, ready to help with animal health questions.\n\n🔍 **I can help with:**\n• Symptom identification\n• Disease information\n• Treatment methods\n• Prevention measures\n\nAsk me anything!',
        suggestions: language === 'ta' 
          ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
          : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination']
      };
    }

    // Enhanced keyword processing
    if (keywords.length === 0) {
      return {
        text: language === 'ta'
          ? '🤔 உங்கள் கேள்வியை நான் முழுமையாக புரிந்து கொள்ளவில்லை.\n\n**தயவுசெய்து இவற்றை முயற்சிக்கவும்:**\n• குறிப்பிட்ட அறிகுறிகளைக் குறிப்பிடுங்கள்\n• நோய் பெயர்களைப் பயன்படுத்துங்கள்\n• விலங்கின் வகையைக் குறிப்பிடுங்கள்\n\n**உதாரணம்:** "மாட்டில் காய்ச்சல்" அல்லது "எருமையின் பால் குறைவு"'
          : '🤔 I didn\'t fully understand your question.\n\n**Please try:**\n• Mentioning specific symptoms\n• Using disease names\n• Specifying the animal type\n\n**Example:** "fever in cattle" or "milk reduction in buffalo"',
        suggestions: this.generateSuggestions([], language, intent)
      };
    }

    // Score and rank diseases with enhanced algorithm
    const scoredDiseases = this.diseases
      .map(disease => ({
        disease,
        score: this.scoreDiseaseRelevance(disease, keywords, language)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const relatedDiseases = scoredDiseases.map(item => item.disease);

    // Generate enhanced contextual response
    const responseText = this.generateContextualResponse(relatedDiseases, intent, language, input);

    // Add medical disclaimer
    const disclaimer = language === 'ta'
      ? '\n\n⚠️ **மருத்துவ அறிவிப்பு:** இது கல்வி நோக்கங்களுக்காக மட்டுமே. சரியான நோயறிதல் மற்றும் சிகிச்சைக்கு எப்போதும் தகுதிவாய்ந்த கால்நடை மருத்துவரை அணுகவும்.'
      : '\n\n⚠️ **Medical Disclaimer:** This is for educational purposes only. Always consult a qualified veterinarian for proper diagnosis and treatment.';

    return {
      text: responseText + disclaimer,
      relatedDiseases: relatedDiseases.slice(0, 2),
      suggestions: this.generateSuggestions(relatedDiseases, language, intent)
    };
  }
}

// Export singleton instance
export const vetCareAI = new VetCareAI(mockDiseases);