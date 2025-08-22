import { Disease } from '../types';
import { apiService } from '../services/api';
import { bioBertModel, BioBertResponse } from './bioBertModel';

export interface EnhancedChatResponse {
  text: string;
  relatedDiseases?: Disease[];
  suggestions?: string[];
  confidence?: number;
  isAiGenerated?: boolean;
  modelStatus?: string;
}

class EnhancedVetCareAI {
  private diseasesCache: Disease[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize with empty cache
    this.loadDiseases();
  }

  private async loadDiseases(language: 'en' | 'ta' = 'en'): Promise<Disease[]> {
    try {
      // Check if cache is still valid
      const now = Date.now();
      if (this.diseasesCache.length > 0 && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        return this.diseasesCache;
      }

      console.log('🔄 Loading diseases from API...');
      const diseases = await apiService.getDiseases({ language, limit: 100 });
      
      this.diseasesCache = diseases;
      this.lastCacheUpdate = now;
      
      console.log(`✅ Loaded ${diseases.length} diseases into cache`);
      return diseases;
    } catch (error) {
      console.error('❌ Error loading diseases:', error);
      // Return cached data if available, otherwise empty array
      return this.diseasesCache;
    }
  }

  private buildVeterinaryContext(relatedDiseases: Disease[], language: 'en' | 'ta'): string {
    if (relatedDiseases.length === 0) {
      return language === 'ta' ? 
        'கால்நடை மருத்துவம் மற்றும் விலங்கு நலன் பற்றிய பொதுவான தகவல்கள்' :
        'General veterinary medicine and animal health information';
    }

    let context = '';
    
    relatedDiseases.forEach((disease, index) => {
      if (language === 'ta') {
        context += `நோய் ${index + 1}: ${disease.nameTa || disease.name}\n`;
        context += `அறிகுறிகள்: ${(disease.symptomsTa || disease.symptoms).join(', ')}\n`;
        context += `சிகிச்சை: ${disease.treatmentNameTa || disease.treatmentName}\n`;
        context += `பொருட்கள்: ${(disease.ingredientsTa || disease.ingredients).slice(0, 3).join(', ')}\n`;
        context += `தயாரிப்பு: ${(disease.preparationTa || disease.preparation).substring(0, 200)}\n`;
        context += `அளவு: ${(disease.dosageTa || disease.dosage).substring(0, 150)}\n`;
        context += `தீவிரத்தன்மை: ${disease.severity}\n`;
        context += `பாதிக்கும் விலங்குகள்: ${disease.affectedAnimals.join(', ')}\n\n`;
      } else {
        context += `Disease ${index + 1}: ${disease.name}\n`;
        context += `Symptoms: ${disease.symptoms.join(', ')}\n`;
        context += `Treatment: ${disease.treatmentName}\n`;
        context += `Ingredients: ${disease.ingredients.slice(0, 3).join(', ')}\n`;
        context += `Preparation: ${disease.preparation.substring(0, 200)}\n`;
        context += `Dosage: ${disease.dosage.substring(0, 150)}\n`;
        context += `Severity: ${disease.severity}\n`;
        context += `Affected Animals: ${disease.affectedAnimals.join(', ')}\n\n`;
      }
    });

    return context;
  }

  private async findRelevantDiseases(query: string, language: 'en' | 'ta'): Promise<Disease[]> {
    // Load fresh diseases data
    const diseases = await this.loadDiseases(language);
    
    const keywords = this.extractKeywords(query, language);
    
    const scoredDiseases = diseases
      .map(disease => ({
        disease,
        score: this.scoreDiseaseRelevance(disease, keywords, language)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scoredDiseases.map(item => item.disease);
  }

  private extractKeywords(input: string, language: 'en' | 'ta'): string[] {
    const stopWords = language === 'ta' 
      ? ['அது', 'இது', 'என்று', 'ஆக', 'மற்றும்', 'அல்லது', 'ஆனால்', 'எனவே', 'அதனால்', 'இல்லை', 'இல்லாமல்', 'உள்ள', 'உள்ளது', 'இருக்கும்', 'இருக்கிறது', 'செய்ய', 'செய்து', 'வேண்டும்', 'முடியும்', 'கூடும்']
      : ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'his', 'her', 'my', 'what', 'how', 'when', 'where', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'them', 'us'];
    
    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word));
  }

  private scoreDiseaseRelevance(disease: Disease, keywords: string[], language: 'en' | 'ta'): number {
    let score = 0;
    const searchableText = this.getDiseaseSearchableText(disease, language).toLowerCase();
    
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (searchableText.includes(keywordLower)) {
        score += 5;
      }
      
      const words = searchableText.split(/\s+/);
      words.forEach(word => {
        if (word.includes(keywordLower) || keywordLower.includes(word)) {
          score += 2;
        }
      });
    });
    
    return score;
  }

  private getDiseaseSearchableText(disease: Disease, language: 'en' | 'ta'): string {
    const texts: string[] = [];
    
    if (language === 'ta') {
      texts.push(disease.nameTa || disease.name);
      texts.push(disease.treatmentNameTa || disease.treatmentName);
      texts.push(...(disease.symptomsTa || disease.symptoms));
      texts.push(...(disease.ingredientsTa || disease.ingredients));
      texts.push(disease.preparationTa || disease.preparation);
      texts.push(disease.dosageTa || disease.dosage);
    } else {
      texts.push(disease.name, disease.treatmentName);
      texts.push(...disease.symptoms);
      texts.push(...disease.ingredients);
      texts.push(disease.preparation, disease.dosage);
    }
    
    texts.push(...disease.affectedAnimals);
    return texts.join(' ');
  }

  private generateIntelligentResponse(query: string, relatedDiseases: Disease[], language: 'en' | 'ta'): string {
    if (relatedDiseases.length === 0) {
      return language === 'ta'
        ? `"${query}" பற்றிய குறிப்பிட்ட தகவல் தற்போது கிடைக்கவில்லை. தயவுசெய்து:\n\n• மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்துங்கள்\n• வேறு வார்த்தைகளில் கேள்வியைக் கேளுங்கள்\n• அறிகுறிகளை விரிவாக விவரிக்கவும்`
        : `I couldn't find specific information about "${query}". Please try:\n\n• Using the search feature above\n• Rephrasing your question\n• Providing more detailed symptoms`;
    }

    const diseaseNames = relatedDiseases.map(d => 
      language === 'ta' && d.nameTa ? d.nameTa : d.name
    );

    const primaryDisease = relatedDiseases[0];
    
    // Generate contextual response based on query intent
    const queryLower = query.toLowerCase();
    let response = '';
    
    if (language === 'ta') {
      if (queryLower.includes('சிகிச்சை') || queryLower.includes('மருந்து')) {
        response = `**${diseaseNames[0]}** நோய்க்கான சிகிச்சை:\n\n`;
        response += `💊 **சிகிச்சை முறை:** ${primaryDisease.treatmentNameTa || primaryDisease.treatmentName}\n`;
        response += `🌿 **முக்கிய பொருட்கள்:** ${(primaryDisease.ingredientsTa || primaryDisease.ingredients).slice(0, 3).join(', ')}\n`;
        response += `📋 **தயாரிப்பு:** ${(primaryDisease.preparationTa || primaryDisease.preparation).substring(0, 150)}...\n`;
        response += `⚡ **அளவு:** ${(primaryDisease.dosageTa || primaryDisease.dosage).substring(0, 100)}...`;
      } else if (queryLower.includes('அறிகுறி')) {
        response = `**${diseaseNames[0]}** நோயின் அறிகுறிகள்:\n\n`;
        response += `🔍 **முக்கிய அறிகுறிகள்:** ${(primaryDisease.symptomsTa || primaryDisease.symptoms).slice(0, 4).join(', ')}\n`;
        response += `⚠️ **தீவிரத்தன்மை:** ${primaryDisease.severity === 'High' ? 'அதிகம்' : primaryDisease.severity === 'Medium' ? 'நடுத்தரம்' : 'குறைவு'}\n`;
        response += `🐄 **பாதிக்கும் விலங்குகள்:** ${primaryDisease.affectedAnimals.map(a => a === 'Cattle' ? 'மாடுகள்' : 'எருமைகள்').join(', ')}`;
      } else {
        response = `**${diseaseNames[0]}** பற்றிய தகவல்:\n\n`;
        response += `🔍 **அறிகுறிகள்:** ${(primaryDisease.symptomsTa || primaryDisease.symptoms).slice(0, 3).join(', ')}\n`;
        response += `💊 **சிகிச்சை:** ${primaryDisease.treatmentNameTa || primaryDisease.treatmentName}\n`;
        response += `⚠️ **தீவிரத்தன்மை:** ${primaryDisease.severity === 'High' ? 'அதிகம்' : primaryDisease.severity === 'Medium' ? 'நடுத்தரம்' : 'குறைவு'}`;
      }
    } else {
      if (queryLower.includes('treatment') || queryLower.includes('cure') || queryLower.includes('medicine')) {
        response = `**Treatment for ${diseaseNames[0]}:**\n\n`;
        response += `💊 **Treatment Method:** ${primaryDisease.treatmentName}\n`;
        response += `🌿 **Key Ingredients:** ${primaryDisease.ingredients.slice(0, 3).join(', ')}\n`;
        response += `📋 **Preparation:** ${primaryDisease.preparation.substring(0, 150)}...\n`;
        response += `⚡ **Dosage:** ${primaryDisease.dosage.substring(0, 100)}...`;
      } else if (queryLower.includes('symptom') || queryLower.includes('sign')) {
        response = `**Symptoms of ${diseaseNames[0]}:**\n\n`;
        response += `🔍 **Key Symptoms:** ${primaryDisease.symptoms.slice(0, 4).join(', ')}\n`;
        response += `⚠️ **Severity:** ${primaryDisease.severity}\n`;
        response += `🐄 **Affects:** ${primaryDisease.affectedAnimals.join(', ')}`;
      } else {
        response = `**Information about ${diseaseNames[0]}:**\n\n`;
        response += `🔍 **Symptoms:** ${primaryDisease.symptoms.slice(0, 3).join(', ')}\n`;
        response += `💊 **Treatment:** ${primaryDisease.treatmentName}\n`;
        response += `⚠️ **Severity:** ${primaryDisease.severity}`;
      }
    }
    
    return response;
  }

  private generateSuggestions(relatedDiseases: Disease[], language: 'en' | 'ta'): string[] {
    const suggestions: string[] = [];
    
    if (language === 'ta') {
      suggestions.push(
        'இந்த நோயின் தடுப்பு முறைகள் என்ன?',
        'சிகிச்சையின் பக்க விளைவுகள் உள்ளதா?',
        'எத்தனை நாட்களில் குணமாகும்?'
      );
      
      if (relatedDiseases.length > 0) {
        const commonAnimals = [...new Set(relatedDiseases.flatMap(d => d.affectedAnimals))];
        if (commonAnimals.includes('Cattle')) {
          suggestions.push('மாடுகளின் பொதுவான நோய்கள்');
        }
        if (commonAnimals.includes('Buffaloes')) {
          suggestions.push('எருமைகளின் பொதுவான நோய்கள்');
        }
      }
    } else {
      suggestions.push(
        'What are the prevention methods?',
        'Are there any side effects?',
        'How long does recovery take?'
      );
      
      if (relatedDiseases.length > 0) {
        const commonAnimals = [...new Set(relatedDiseases.flatMap(d => d.affectedAnimals))];
        if (commonAnimals.includes('Cattle')) {
          suggestions.push('Common cattle diseases');
        }
        if (commonAnimals.includes('Buffaloes')) {
          suggestions.push('Common buffalo diseases');
        }
      }
    }
    
    return suggestions.slice(0, 3);
  }

  public async processQuery(input: string, language: 'en' | 'ta' = 'en'): Promise<EnhancedChatResponse> {
    try {
      console.log('🚀 Processing query:', input);
      console.log('🌐 Language:', language);

      // Handle greetings
      if (this.isGreeting(input, language)) {
        return this.generateGreetingResponse(language);
      }

      // Find relevant diseases first
      const relatedDiseases = await this.findRelevantDiseases(input, language);
      
      // Check AI model status
      const modelStatus = bioBertModel.getModelStatus();
      console.log('🤖 Model status:', modelStatus);
      
      let finalResponse = '';
      let confidence = 0.5;
      let isAiGenerated = false;
      let statusMessage = '';

      if (modelStatus.isLoading) {
        statusMessage = language === 'ta' 
          ? `AI மாடல் ஏற்றுகிறது... ${modelStatus.progress}%` 
          : `AI model loading... ${modelStatus.progress}%`;
        finalResponse = this.generateIntelligentResponse(input, relatedDiseases, language);
        console.log('⏳ Using traditional method while AI loads');
      } else if (modelStatus.isReady) {
        try {
          console.log('🤖 Using AI model for response');
          // Build context from related diseases
          const context = this.buildVeterinaryContext(relatedDiseases, language);
          console.log('📄 Built context length:', context.length);
          
          // Use BioBERT for question answering
          const bioBertResponse: BioBertResponse = await bioBertModel.answerQuestion(
            input,
            context,
            language
          );

          console.log('🤖 BioBERT response:', {
            answer: bioBertResponse.answer.substring(0, 100) + '...',
            confidence: bioBertResponse.confidence,
            debugInfo: bioBertResponse.debugInfo
          });

          finalResponse = bioBertResponse.answer;
          confidence = bioBertResponse.confidence;
          isAiGenerated = true;
          statusMessage = language === 'ta' ? 'AI மாடல் செயலில்' : 'AI model active';

          // If AI confidence is low, enhance with traditional method
          if (confidence < 0.4) {
            console.log('⚠️ Low AI confidence, enhancing with traditional method');
            const traditionalResponse = this.generateIntelligentResponse(input, relatedDiseases, language);
            finalResponse = `${bioBertResponse.answer}\n\n${language === 'ta' ? '**अतिरिक्त जानकारी:**' : '**Additional Information:**'}\n${traditionalResponse}`;
            confidence = Math.max(confidence, 0.6);
          }
        } catch (error) {
          console.error('AI processing error:', error);
          finalResponse = this.generateIntelligentResponse(input, relatedDiseases, language);
          statusMessage = language === 'ta' ? 'AI மாடல் பிழை - பாரம்பரிய முறை' : 'AI model error - traditional method';
          console.log('❌ Falling back to traditional method due to AI error');
        }
      } else {
        console.log('🔄 Using traditional method - AI not ready');
        // Use intelligent traditional method
        finalResponse = this.generateIntelligentResponse(input, relatedDiseases, language);
        statusMessage = language === 'ta' ? 'பாரம்பரிய முறை' : 'Traditional method';
      }

      console.log('✅ Final response generated:', {
        responseLength: finalResponse.length,
        confidence,
        isAiGenerated,
        relatedDiseasesCount: relatedDiseases.length
      });

      // Add medical disclaimer
      const disclaimer = language === 'ta'
        ? '\n\n⚠️ **மருத்துவ அறிவிப்பு:** இது கல்வி நோக்கங்களுக்காக மட்டுமே. சரியான நோயறிதல் மற்றும் சிகிச்சைக்கு எப்போதும் தகுதிவாய்ந்த கால்நடை மருத்துவரை அணுகவும்.'
        : '\n\n⚠️ **Medical Disclaimer:** This is for educational purposes only. Always consult a qualified veterinarian for proper diagnosis and treatment.';

      return {
        text: finalResponse + disclaimer,
        relatedDiseases: relatedDiseases.slice(0, 2),
        suggestions: this.generateSuggestions(relatedDiseases, language),
        confidence,
        isAiGenerated,
        modelStatus: statusMessage
      };

    } catch (error) {
      console.error('Error in enhanced AI processing:', error);
      
      console.log('🔄 Using fallback method due to processing error');
      // Fallback to traditional method
      const relatedDiseases = await this.findRelevantDiseases(input, language);
      return {
        text: this.generateIntelligentResponse(input, relatedDiseases, language),
        relatedDiseases: relatedDiseases.slice(0, 2),
        suggestions: this.generateSuggestions(relatedDiseases, language),
        confidence: 0.3,
        isAiGenerated: false,
        modelStatus: language === 'ta' ? 'பிழை - பாரம்பரிய முறை' : 'Error - traditional method'
      };
    }
  }

  private isGreeting(input: string, language: 'en' | 'ta'): boolean {
    const lowerInput = input.toLowerCase();
    const greetingPatterns = language === 'ta' 
      ? ['வணக்கம்', 'வாங்க', 'ஹலோ', 'ஹாய்', 'நமஸ்காரம்']
      : ['hello', 'hi', 'hey', 'greetings'];
    
    return greetingPatterns.some(pattern => lowerInput.includes(pattern));
  }

  private generateGreetingResponse(language: 'en' | 'ta'): EnhancedChatResponse {
    const modelStatus = bioBertModel.getModelStatus();
    let statusText = '';
    
    if (modelStatus.isLoading) {
      statusText = language === 'ta' 
        ? `\n\n🤖 AI மாடல் ஏற்றுகிறது... ${modelStatus.progress}%` 
        : `\n\n🤖 AI model is loading... ${modelStatus.progress}%`;
    } else if (modelStatus.isReady) {
      statusText = language === 'ta' ? '\n\n🤖 AI மாடல் தயார்!' : '\n\n🤖 AI model ready!';
      
      // Warm up the model in the background
      bioBertModel.warmUp().catch(error => {
        console.warn('Model warm-up failed:', error);
      });
    }

    return {
      text: (language === 'ta' 
        ? 'வணக்கம்! 🙏 நான் உங்கள் AI-powered வெட்கேர் உதவியாளர். விலங்கு நல கேள்விகளில் உங்களுக்கு உதவ தயாராக இருக்கிறேன்.\n\n🤖 **AI திறன்கள்:**\n• BioBERT மாடல் பயன்படுத்தி அறிவார்ந்த பதில்கள்\n• அறிகுறிகள் அடையாளம் காணுதல்\n• நோய் தகவல்கள்\n• சிகிச்சை முறைகள்\n• தடுப்பு நடவடிக்கைகள்\n\nஎனக்கு எதையும் கேளுங்கள்!'
        : 'Hello! 🙏 I\'m your AI-powered VetCare assistant, ready to help with animal health questions.\n\n🤖 **AI Capabilities:**\n• Intelligent responses using BioBERT model\n• Symptom identification\n• Disease information\n• Treatment methods\n• Prevention measures\n\nAsk me anything!') + statusText,
      suggestions: language === 'ta' 
        ? ['மாட்டில் காய்ச்சல் அறிகுறிகள்', 'எருமையின் பால் குறைவு', 'கால்நடை தடுப்பூசி']
        : ['Fever symptoms in cattle', 'Milk reduction in buffaloes', 'Livestock vaccination'],
      confidence: 1.0,
      isAiGenerated: true,
      modelStatus: modelStatus.isLoading ? (language === 'ta' ? `ஏற்றுகிறது ${modelStatus.progress}%` : `Loading ${modelStatus.progress}%`) : 
                   modelStatus.isReady ? (language === 'ta' ? 'தயார்' : 'Ready') : 
                   (language === 'ta' ? 'பாரம்பரிய' : 'Traditional')
    };
  }
}

// Export singleton instance
export const enhancedVetCareAI = new EnhancedVetCareAI();