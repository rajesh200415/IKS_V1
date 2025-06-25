export interface Disease {
  id: string;
  name: string;
  treatmentName: string;
  symptoms: string[];
  ingredients: string[];
  preparation: string;
  dosage: string;
  severity: 'Low' | 'Medium' | 'High';
  affectedAnimals: string[];
  // Tamil translations
  nameTa?: string;
  treatmentNameTa?: string;
  symptomsTa?: string[];
  ingredientsTa?: string[];
  preparationTa?: string;
  dosageTa?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export type SearchType = 'symptoms' | 'disease';