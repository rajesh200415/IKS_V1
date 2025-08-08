import { pipeline, Pipeline } from '@xenova/transformers';

export interface BioBertResponse {
  answer: string;
  confidence: number;
  context?: string;
  debugInfo?: {
    originalQuestion: string;
    processedQuestion: string;
    contextLength: number;
    modelReady: boolean;
    translationApplied: boolean;
  };
}

class BioBertModel {
  private questionAnsweringPipeline: Pipeline | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private isLoading = false;
  private loadingProgress = 0;

  constructor() {
    // Start initialization immediately for better UX
    this.initializeModel().catch(error => {
      console.warn('Initial model loading failed:', error);
    });
  }

  private async initializeModel(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.isLoading) {
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!this.isLoading) {
            resolve();
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    this.initializationPromise = this.loadModels();
    return this.initializationPromise;
  }

  private async loadModels(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadingProgress = 0;
      console.log('🤖 Starting AI model initialization...');
      
      // Use a more reliable and faster model for question-answering
      this.questionAnsweringPipeline = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        {
          quantized: true,
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              this.loadingProgress = Math.round(progress.progress || 0);
              console.log(`📥 Downloading AI model: ${this.loadingProgress}%`);
            } else if (progress.status === 'loading') {
              console.log('🔄 Loading AI model into memory...');
            }
          }
        }
      );

      // Test the model with a simple question to ensure it's working
      const testResult = await this.questionAnsweringPipeline(
        'What is this?',
        'This is a test to verify the model is working correctly.'
      );
      
      if (!testResult || !testResult.answer) {
        throw new Error('Model test failed - no answer returned');
      }

      this.isInitialized = true;
      this.isLoading = false;
      this.loadingProgress = 100;
      console.log('✅ AI model loaded and tested successfully');
    } catch (error) {
      console.error('❌ Error loading AI models:', error);
      this.isInitialized = false;
      this.isLoading = false;
      this.loadingProgress = 0;
      // Don't throw error, allow fallback
    }
  }

  public async isReady(): Promise<boolean> {
    if (this.isLoading) {
      console.log(`⏳ AI model loading: ${this.loadingProgress}%`);
      return false;
    }
    
    if (!this.isInitialized && !this.initializationPromise) {
      // Start initialization if not already started
      this.initializeModel().catch(() => {
        // Ignore errors, will use fallback
      });
      return false;
    }
    
    if (this.initializationPromise && !this.isInitialized) {
      try {
        await this.initializationPromise;
      } catch {
        // Ignore errors, will use fallback
      }
    }
    
    return this.isInitialized;
  }

  public async answerQuestion(
    question: string,
    context: string,
    language: 'en' | 'ta' = 'en'
  ): Promise<BioBertResponse> {
    const debugInfo = {
      originalQuestion: question,
      processedQuestion: question,
      contextLength: context.length,
      modelReady: false,
      translationApplied: false
    };

    try {
      console.log('🔍 Processing question:', question.substring(0, 100) + '...');
      console.log('📄 Context length:', context.length);

      // Check if model is ready with timeout
      const modelReady = await Promise.race([
        this.isReady(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 5000))
      ]);
      
      debugInfo.modelReady = modelReady;

      if (!modelReady || !this.questionAnsweringPipeline) {
        console.log('⚠️ AI model not ready, using fallback');
        throw new Error('AI model not ready');
      }

      // Enhanced translation for Tamil questions
      let processedQuestion = question;
      if (language === 'ta') {
        processedQuestion = this.translateTamilKeywords(question);
        debugInfo.translationApplied = processedQuestion !== question;
        console.log('🔄 Tamil translation applied:', debugInfo.translationApplied);
        console.log('📝 Processed question:', processedQuestion);
      }
      debugInfo.processedQuestion = processedQuestion;

      // Optimize context length for better performance
      let optimizedContext = context;
      if (context.length > 2000) {
        // Keep most relevant parts of context
        const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const relevantSentences = sentences
          .map(sentence => ({
            sentence: sentence.trim(),
            relevance: this.calculateRelevance(sentence, processedQuestion)
          }))
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 10)
          .map(item => item.sentence);
        
        optimizedContext = relevantSentences.join('. ') + '.';
        console.log('✂️ Context optimized from', context.length, 'to', optimizedContext.length, 'characters');
      }

      console.log('🤖 Querying AI model...');
      const result = await this.questionAnsweringPipeline(processedQuestion, optimizedContext);
      console.log('📤 AI model response:', result);

      if (!result || !result.answer) {
        throw new Error('No answer returned from model');
      }

      let answer = result.answer.trim();
      let confidence = result.score || 0;

      console.log('📊 Raw confidence:', confidence);
      console.log('📝 Raw answer:', answer);

      // Enhanced confidence calculation
      confidence = this.calculateEnhancedConfidence(answer, processedQuestion, optimizedContext, confidence);
      console.log('📊 Enhanced confidence:', confidence);

      // Improve answer quality
      answer = this.improveAnswerQuality(answer, processedQuestion, language);

      // If confidence is still very low, provide a more contextual response
      if (confidence < 0.2) {
        console.log('⚠️ Low confidence, generating contextual fallback');
        answer = this.generateContextualFallback(processedQuestion, optimizedContext, language);
        confidence = 0.3; // Set minimum confidence for contextual responses
      }

      // Translate back to Tamil if needed
      if (language === 'ta' && answer !== 'No specific answer found.') {
        const translatedAnswer = this.translateEnglishKeywords(answer);
        if (translatedAnswer !== answer) {
          answer = translatedAnswer;
          console.log('🔄 Answer translated back to Tamil');
        }
      }

      console.log('✅ Final answer:', answer.substring(0, 100) + '...');
      console.log('📊 Final confidence:', confidence);

      return {
        answer,
        confidence,
        context: optimizedContext.substring(0, 200) + '...',
        debugInfo
      };
    } catch (error) {
      console.error('❌ Error in AI question answering:', error);
      
      // Enhanced fallback response
      const fallbackAnswer = this.generateIntelligentFallback(question, context, language);
      
      return {
        answer: fallbackAnswer,
        confidence: 0.25, // Slightly higher confidence for intelligent fallbacks
        debugInfo
      };
    }
  }

  private calculateRelevance(sentence: string, question: string): number {
    const questionWords = question.toLowerCase().split(/\s+/);
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    
    let relevanceScore = 0;
    questionWords.forEach(qWord => {
      if (qWord.length > 2) {
        sentenceWords.forEach(sWord => {
          if (sWord.includes(qWord) || qWord.includes(sWord)) {
            relevanceScore += 1;
          }
        });
      }
    });
    
    return relevanceScore / questionWords.length;
  }

  private calculateEnhancedConfidence(answer: string, question: string, context: string, originalConfidence: number): number {
    let enhancedConfidence = originalConfidence;
    
    // Boost confidence if answer contains question keywords
    const questionWords = question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const answerWords = answer.toLowerCase().split(/\s+/);
    const keywordMatches = questionWords.filter(qw => 
      answerWords.some(aw => aw.includes(qw) || qw.includes(aw))
    ).length;
    
    const keywordBoost = (keywordMatches / questionWords.length) * 0.3;
    enhancedConfidence += keywordBoost;
    
    // Reduce confidence for very short or generic answers
    if (answer.length < 10) {
      enhancedConfidence *= 0.5;
    } else if (answer.length < 30) {
      enhancedConfidence *= 0.7;
    }
    
    // Boost confidence for medical/veterinary terms
    const medicalTerms = ['treatment', 'symptom', 'disease', 'medicine', 'dosage', 'cattle', 'buffalo'];
    const medicalMatches = medicalTerms.filter(term => 
      answer.toLowerCase().includes(term) || context.toLowerCase().includes(term)
    ).length;
    
    if (medicalMatches > 0) {
      enhancedConfidence += medicalMatches * 0.1;
    }
    
    return Math.min(Math.max(enhancedConfidence, 0), 1);
  }

  private improveAnswerQuality(answer: string, question: string, language: 'en' | 'ta'): string {
    // Remove common artifacts
    let improvedAnswer = answer
      .replace(/^(the|a|an)\s+/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Capitalize first letter
    if (improvedAnswer.length > 0) {
      improvedAnswer = improvedAnswer.charAt(0).toUpperCase() + improvedAnswer.slice(1);
    }
    
    // Add period if missing
    if (improvedAnswer.length > 0 && !improvedAnswer.match(/[.!?]$/)) {
      improvedAnswer += '.';
    }
    
    return improvedAnswer;
  }

  private generateContextualFallback(question: string, context: string, language: 'en' | 'ta'): string {
    // Extract key information from context for a meaningful response
    const contextSentences = context.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const relevantSentences = contextSentences
      .map(sentence => ({
        sentence: sentence.trim(),
        relevance: this.calculateRelevance(sentence, question)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 2)
      .map(item => item.sentence);
    
    const relevantInfo = relevantSentences.join('. ');
    
    if (language === 'ta') {
      return relevantInfo.length > 20 
        ? `தொடர்புடைய தகவல்: ${relevantInfo}. மேலும் விரிவான தகவல்களுக்கு கால்நடை மருத்துவரை அணுகவும்.`
        : 'உங்கள் கேள்விக்கு குறிப்பிட்ட தகவல் கிடைக்கவில்லை. தயவுசெய்து கால்நடை மருத்துவரை அணுகவும்.';
    } else {
      return relevantInfo.length > 20
        ? `Based on available information: ${relevantInfo}. For detailed guidance, please consult with a veterinarian.`
        : 'I couldn\'t find specific information for your question. Please consult with a veterinarian for detailed guidance.';
    }
  }

  private generateIntelligentFallback(question: string, context: string, language: 'en' | 'ta'): string {
    // Analyze question intent for better fallback
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('symptom') || questionLower.includes('அறிகுறி')) {
      return language === 'ta'
        ? 'அறிகுறிகள் பற்றிய கேள்விக்கு, மேலே உள்ள தேடல் அம்சத்தைப் பயன்படுத்தி குறிப்பிட்ட அறிகுறிகளைத் தேடவும்.'
        : 'For symptom-related questions, please use the search feature above to find specific symptoms.';
    }
    
    if (questionLower.includes('treatment') || questionLower.includes('சிகிச்சை')) {
      return language === 'ta'
        ? 'சிகிச்சை பற்றிய தகவல்களுக்கு, நோய் பெயரைக் குறிப்பிட்டு தேடவும் அல்லது கால்நடை மருத்துவரை அணுகவும்.'
        : 'For treatment information, please search by disease name or consult with a veterinarian.';
    }
    
    return language === 'ta'
      ? 'உங்கள் கேள்விக்கு தற்போது குறிப்பிட்ட பதில் கிடைக்கவில்லை. தயவுசெய்து வேறு வார்த்தைகளில் கேட்கவும் அல்லது கால்நடை மருத்துவரை அணுகவும்.'
      : 'I don\'t have a specific answer for your question right now. Please try rephrasing or consult with a veterinarian.';
  }

  private translateTamilKeywords(text: string): string {
    const tamilToEnglish: { [key: string]: string } = {
      // Enhanced medical terms
      'காய்ச்சல்': 'fever',
      'வயிற்றுப்போக்கு': 'diarrhea',
      'இருமல்': 'cough',
      'மூச்சுத்திணறல்': 'breathing difficulty',
      'வீக்கம்': 'swelling',
      'வலி': 'pain',
      'நடுக்கம்': 'shivering',
      'சோர்வு': 'weakness',
      'வாந்தி': 'vomiting',
      'பசியின்மை': 'loss of appetite',
      
      // Animals
      'மாடு': 'cattle',
      'மாடுகள்': 'cattle',
      'எருமை': 'buffalo',
      'எருமைகள்': 'buffaloes',
      'கால்நடை': 'livestock',
      'கால்நடைகள்': 'livestock',
      'விலங்கு': 'animal',
      'விலங்குகள்': 'animals',
      
      // Medical terms
      'நோய்': 'disease',
      'நோய்கள்': 'diseases',
      'சிகிச்சை': 'treatment',
      'மருந்து': 'medicine',
      'மருத்துவம்': 'medical treatment',
      'தடுப்பூசி': 'vaccination',
      'அறிகுறி': 'symptom',
      'அறிகுறிகள்': 'symptoms',
      'தொற்று': 'infection',
      'வியாதி': 'illness',
      
      // Body parts
      'பால்': 'milk',
      'மடி': 'udder',
      'முலைக்காம்பு': 'teat',
      'வயிறு': 'stomach',
      'கால்': 'leg',
      'கண்': 'eye',
      'காது': 'ear',
      'வாய்': 'mouth',
      
      // Question words
      'என்ன': 'what',
      'எப்படி': 'how',
      'ஏன்': 'why',
      'எங்கே': 'where',
      'எப்போது': 'when',
      'யார்': 'who',
      
      // Common words
      'குறைவு': 'reduction',
      'அதிகம்': 'increase',
      'தடுப்பு': 'prevention',
      'குணப்படுத்து': 'cure',
      'சரி': 'correct',
      'பிரச்சனை': 'problem'
    };

    let translatedText = text;
    
    // Apply translations with word boundaries for better accuracy
    Object.entries(tamilToEnglish).forEach(([tamil, english]) => {
      const regex = new RegExp(`\\b${tamil}\\b`, 'g');
      translatedText = translatedText.replace(regex, english);
    });

    console.log('🔄 Tamil to English translation:', text, '->', translatedText);
    return translatedText;
  }

  private translateEnglishKeywords(text: string): string {
    const englishToTamil: { [key: string]: string } = {
      // Medical terms
      'fever': 'காய்ச்சல்',
      'diarrhea': 'வயிற்றுப்போக்கு',
      'cough': 'இருமல்',
      'breathing difficulty': 'மூச்சுத்திணறல்',
      'swelling': 'வீக்கம்',
      'pain': 'வலி',
      'shivering': 'நடுக்கம்',
      'weakness': 'சோர்வு',
      'vomiting': 'வாந்தி',
      'loss of appetite': 'பசியின்மை',
      
      // Animals
      'cattle': 'மாடுகள்',
      'buffalo': 'எருமை',
      'buffaloes': 'எருமைகள்',
      'livestock': 'கால்நடைகள்',
      'animal': 'விலங்கு',
      'animals': 'விலங்குகள்',
      
      // Treatment terms
      'disease': 'நோய்',
      'diseases': 'நோய்கள்',
      'treatment': 'சிகிச்சை',
      'medicine': 'மருந்து',
      'medical treatment': 'மருத்துவம்',
      'vaccination': 'தடுப்பூசி',
      'symptom': 'அறிகுறி',
      'symptoms': 'அறிகுறிகள்',
      'infection': 'தொற்று',
      'illness': 'வியாதி',
      
      // Body parts
      'milk': 'பால்',
      'udder': 'மடி',
      'teat': 'முலைக்காம்பு',
      'stomach': 'வயிறு',
      'leg': 'கால்',
      'eye': 'கண்',
      'ear': 'காது',
      'mouth': 'வாய்',
      
      // Common terms
      'reduction': 'குறைவு',
      'increase': 'அதிகம்',
      'prevention': 'தடுப்பு',
      'cure': 'குணப்படுத்துதல்',
      'problem': 'பிரச்சனை'
    };

    let translatedText = text;
    
    // Apply translations with word boundaries
    Object.entries(englishToTamil).forEach(([english, tamil]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translatedText = translatedText.replace(regex, tamil);
    });

    console.log('🔄 English to Tamil translation:', text, '->', translatedText);
    return translatedText;
  }

  public async extractMedicalEntities(text: string): Promise<string[]> {
    // Enhanced entity extraction for veterinary terms
    const medicalTerms = [
      'fever', 'diarrhea', 'cough', 'swelling', 'infection', 'inflammation',
      'cattle', 'buffalo', 'livestock', 'animal', 'veterinary', 'treatment',
      'medicine', 'dosage', 'symptoms', 'diagnosis', 'therapy', 'vaccination',
      'milk', 'udder', 'mastitis', 'lameness', 'respiratory', 'digestive',
      'bloating', 'constipation', 'dehydration', 'anemia', 'parasites'
    ];

    const foundEntities = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );

    return [...new Set(foundEntities)];
  }

  public getModelStatus(): { isReady: boolean; isLoading: boolean; progress: number } {
    return {
      isReady: this.isInitialized,
      isLoading: this.isLoading,
      progress: this.loadingProgress
    };
  }

  public async warmUp(): Promise<void> {
    // Warm up the model with a simple question
    if (await this.isReady()) {
      try {
        await this.answerQuestion(
          'What is veterinary medicine?',
          'Veterinary medicine is the branch of medicine that deals with the prevention, diagnosis and treatment of disease, disorder and injury in animals.',
          'en'
        );
        console.log('🔥 AI model warmed up successfully');
      } catch (error) {
        console.warn('⚠️ Model warm-up failed:', error);
      }
    }
  }
}

// Export singleton instance
export const bioBertModel = new BioBertModel();