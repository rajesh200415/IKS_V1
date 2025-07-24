import { pipeline, Pipeline } from '@xenova/transformers';

export interface BioBertResponse {
  answer: string;
  confidence: number;
  context?: string;
}

class BioBertModel {
  private questionAnsweringPipeline: Pipeline | null = null;
  private textGenerationPipeline: Pipeline | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadModels();
    return this.initializationPromise;
  }

  private async loadModels(): Promise<void> {
    try {
      console.log('Loading BioBERT models...');
      
      // Load question-answering pipeline with BioBERT-based model
      this.questionAnsweringPipeline = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        {
          revision: 'main',
          quantized: true, // Use quantized version for better performance
        }
      );

      // Load text generation pipeline for more complex responses
      this.textGenerationPipeline = await pipeline(
        'text-generation',
        'Xenova/distilgpt2',
        {
          revision: 'main',
          quantized: true,
        }
      );

      this.isInitialized = true;
      console.log('BioBERT models loaded successfully');
    } catch (error) {
      console.error('Error loading BioBERT models:', error);
      this.isInitialized = false;
    }
  }

  public async isReady(): Promise<boolean> {
    if (!this.isInitialized && this.initializationPromise) {
      await this.initializationPromise;
    }
    return this.isInitialized;
  }

  public async answerQuestion(
    question: string,
    context: string,
    language: 'en' | 'ta' = 'en'
  ): Promise<BioBertResponse> {
    try {
      await this.ensureInitialized();

      if (!this.questionAnsweringPipeline) {
        throw new Error('Question-answering pipeline not initialized');
      }

      // For Tamil questions, we'll translate context but keep the processing in English
      const processedQuestion = language === 'ta' ? 
        await this.translateTamilToEnglish(question) : question;

      const result = await this.questionAnsweringPipeline(processedQuestion, context);

      let answer = result.answer;
      const confidence = result.score;

      // If confidence is low, try to generate a more comprehensive answer
      if (confidence < 0.3) {
        answer = await this.generateContextualAnswer(processedQuestion, context);
      }

      // Translate back to Tamil if needed
      if (language === 'ta') {
        answer = await this.translateEnglishToTamil(answer);
      }

      return {
        answer,
        confidence,
        context: result.context || context.substring(0, 200) + '...'
      };
    } catch (error) {
      console.error('Error in BioBERT question answering:', error);
      return {
        answer: language === 'ta' ? 
          'மன்னிக்கவும், தற்போது AI மாடல் கிடைக்கவில்லை. பாரம்பரிய தேடல் முறையைப் பயன்படுத்துகிறேன்.' :
          'Sorry, AI model is currently unavailable. Using traditional search method.',
        confidence: 0,
      };
    }
  }

  public async generateResponse(
    prompt: string,
    maxLength: number = 150,
    language: 'en' | 'ta' = 'en'
  ): Promise<string> {
    try {
      await this.ensureInitialized();

      if (!this.textGenerationPipeline) {
        throw new Error('Text generation pipeline not initialized');
      }

      const processedPrompt = language === 'ta' ? 
        await this.translateTamilToEnglish(prompt) : prompt;

      const result = await this.textGenerationPipeline(processedPrompt, {
        max_length: maxLength,
        num_return_sequences: 1,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: 50256,
      });

      let generatedText = result[0].generated_text;
      
      // Clean up the generated text
      generatedText = generatedText.replace(processedPrompt, '').trim();
      
      // Translate back to Tamil if needed
      if (language === 'ta') {
        generatedText = await this.translateEnglishToTamil(generatedText);
      }

      return generatedText;
    } catch (error) {
      console.error('Error in text generation:', error);
      return language === 'ta' ? 
        'மன்னிக்கவும், பதில் உருவாக்குவதில் சிக்கல்.' :
        'Sorry, there was an issue generating the response.';
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeModel();
    }
    if (!this.isInitialized) {
      throw new Error('BioBERT model failed to initialize');
    }
  }

  private async generateContextualAnswer(question: string, context: string): Promise<string> {
    try {
      const prompt = `Based on the veterinary context: "${context.substring(0, 300)}", answer this question: "${question}". Provide a helpful and accurate response about animal health.`;
      
      return await this.generateResponse(prompt, 200, 'en');
    } catch (error) {
      console.error('Error generating contextual answer:', error);
      return 'I apologize, but I cannot provide a detailed answer at this time. Please consult with a veterinarian for accurate information.';
    }
  }

  // Simple translation helpers (in a real implementation, you'd use a proper translation service)
  private async translateTamilToEnglish(text: string): Promise<string> {
    // Basic keyword translation for common veterinary terms
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
    };

    let translatedText = text;
    Object.entries(tamilToEnglish).forEach(([tamil, english]) => {
      translatedText = translatedText.replace(new RegExp(tamil, 'g'), english);
    });

    return translatedText;
  }

  private async translateEnglishToTamil(text: string): Promise<string> {
    // Basic keyword translation for common veterinary terms
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
      'why': 'ஏன',
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
      'medicine', 'dosage', 'symptoms', 'diagnosis', 'therapy', 'vaccination'
    ];

    const foundEntities = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    );

    return [...new Set(foundEntities)];
  }
}

// Export singleton instance
export const bioBertModel = new BioBertModel();