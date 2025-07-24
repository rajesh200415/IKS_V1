import { pipeline, Pipeline } from '@xenova/transformers';

export interface BioBertResponse {
  answer: string;
  confidence: number;
  context?: string;
}

class BioBertModel {
  private questionAnsweringPipeline: Pipeline | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private isLoading = false;

  constructor() {
    // Don't auto-initialize, wait for first use
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
      console.log('Loading AI models...');
      
      // Use a lighter, more reliable model for question-answering
      this.questionAnsweringPipeline = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        {
          quantized: true,
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              console.log(`Downloading model: ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      );

      this.isInitialized = true;
      this.isLoading = false;
      console.log('AI models loaded successfully');
    } catch (error) {
      console.error('Error loading AI models:', error);
      this.isInitialized = false;
      this.isLoading = false;
      // Don't throw error, allow fallback
    }
  }

  public async isReady(): Promise<boolean> {
    if (this.isLoading) {
      return false;
    }
    
    if (!this.isInitialized && !this.initializationPromise) {
      // Start initialization on first check
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
    try {
      // Check if model is ready
      const modelReady = await this.isReady();
      
      if (!modelReady || !this.questionAnsweringPipeline) {
        throw new Error('AI model not ready');
      }

      // For Tamil questions, translate key terms to English for better processing
      const processedQuestion = language === 'ta' ? 
        this.translateTamilKeywords(question) : question;

      // Limit context length to avoid memory issues
      const limitedContext = context.length > 1000 ? 
        context.substring(0, 1000) + '...' : context;

      const result = await this.questionAnsweringPipeline(processedQuestion, limitedContext);

      let answer = result.answer || 'No specific answer found.';
      const confidence = result.score || 0;

      // If confidence is very low, provide a more general response
      if (confidence < 0.1) {
        answer = this.generateFallbackAnswer(processedQuestion, limitedContext, language);
      }

      // Translate back to Tamil if needed
      if (language === 'ta' && answer !== 'No specific answer found.') {
        answer = this.translateEnglishKeywords(answer);
      }

      return {
        answer,
        confidence: Math.max(confidence, 0.3), // Minimum confidence for user feedback
        context: limitedContext.substring(0, 200) + '...'
      };
    } catch (error) {
      console.error('Error in AI question answering:', error);
      
      // Provide intelligent fallback response
      const fallbackAnswer = this.generateFallbackAnswer(question, context, language);
      
      return {
        answer: fallbackAnswer,
        confidence: 0.2, // Low confidence to indicate fallback
      };
    }
  }

  private generateFallbackAnswer(question: string, context: string, language: 'en' | 'ta'): string {
    // Extract key information from context for a meaningful response
    const contextLines = context.split('\n').filter(line => line.trim());
    const relevantInfo = contextLines.slice(0, 3).join(' ');
    
    if (language === 'ta') {
      return `உங்கள் கேள்விக்கு தொடர்புடைய தகவல்: ${relevantInfo}. மேலும் விரிவான தகவல்களுக்கு கால்நடை மருத்துவரை அணுகவும்.`;
    } else {
      return `Based on the available information: ${relevantInfo}. For detailed guidance, please consult with a veterinarian.`;
    }
  }

  private translateTamilKeywords(text: string): string {
    const tamilToEnglish: { [key: string]: string } = {
      'காய்ச்சல்': 'fever',
      'வயிற்றுப்போக்கு': 'diarrhea',
      'இருமல்': 'cough',
      'மாடு': 'cattle',
      'எருமை': 'buffalo',
      'நோய்': 'disease',
      'சிகிச்சை': 'treatment',
      'மருந்து': 'medicine',
      'அறிகுறி': 'symptom',
      'பால்': 'milk',
      'குறைவு': 'reduction',
      'வீக்கம்': 'swelling',
      'என்ன': 'what',
      'எப்படி': 'how',
      'ஏன்': 'why',
      'எங்கே': 'where',
      'எப்போது': 'when'
    };

    let translatedText = text;
    Object.entries(tamilToEnglish).forEach(([tamil, english]) => {
      translatedText = translatedText.replace(new RegExp(tamil, 'g'), english);
    });

    return translatedText;
  }

  private translateEnglishKeywords(text: string): string {
    const englishToTamil: { [key: string]: string } = {
      'fever': 'காய்ச்சல்',
      'diarrhea': 'வயிற்றுப்போக்கு',
      'cough': 'இருமல்',
      'cattle': 'மாடு',
      'buffalo': 'எருமை',
      'disease': 'நோய்',
      'treatment': 'சிகிச்சை',
      'medicine': 'மருந்து',
      'symptom': 'அறிகுறி',
      'milk': 'பால்',
      'reduction': 'குறைவு',
      'swelling': 'வீக்கம்',
      'what': 'என்ன',
      'how': 'எப்படி',
      'why': 'ஏன்'
    };

    let translatedText = text;
    Object.entries(englishToTamil).forEach(([english, tamil]) => {
      translatedText = translatedText.replace(new RegExp(`\\b${english}\\b`, 'gi'), tamil);
    });

    return translatedText;
  }

  public async extractMedicalEntities(text: string): Promise<string[]> {
    // Simple entity extraction for veterinary terms
    const medicalTerms = [
      'fever', 'diarrhea', 'cough', 'swelling', 'infection', 'inflammation',
      'cattle', 'buffalo', 'livestock', 'animal', 'veterinary', 'treatment',
      'medicine', 'dosage', 'symptoms', 'diagnosis', 'therapy', 'vaccination',
      'milk', 'udder', 'mastitis', 'lameness', 'respiratory', 'digestive'
    ];

    const foundEntities = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );

    return [...new Set(foundEntities)];
  }

  public getModelStatus(): { isReady: boolean; isLoading: boolean } {
    return {
      isReady: this.isInitialized,
      isLoading: this.isLoading
    };
  }
}

// Export singleton instance
export const bioBertModel = new BioBertModel();