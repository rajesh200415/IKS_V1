import React from 'react';
import { AlertTriangle, Stethoscope, Pill as Pills, ShieldCheck, Users, Leaf } from 'lucide-react';
import { Disease } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DiseaseCardProps {
  disease: Disease;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease }) => {
  const { t, language } = useLanguage();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'High': return t('card.severity.high');
      case 'Medium': return t('card.severity.medium');
      case 'Low': return t('card.severity.low');
      default: return severity;
    }
  };

  const getAnimalNames = (animals: string[]) => {
    return animals.map(animal => {
      switch (animal) {
        case 'Cattle': return t('animals.cattle');
        case 'Buffaloes': return t('animals.buffaloes');
        default: return animal;
      }
    }).join(', ');
  };

  // Get localized content based on current language
  const getLocalizedContent = () => {
    if (language === 'ta' && disease.nameTa) {
      return {
        name: disease.nameTa,
        treatmentName: disease.treatmentNameTa || disease.treatmentName,
        symptoms: disease.symptomsTa || disease.symptoms,
        ingredients: disease.ingredientsTa || disease.ingredients,
        preparation: disease.preparationTa || disease.preparation,
        dosage: disease.dosageTa || disease.dosage
      };
    }
    return {
      name: disease.name,
      treatmentName: disease.treatmentName,
      symptoms: disease.symptoms,
      ingredients: disease.ingredients,
      preparation: disease.preparation,
      dosage: disease.dosage
    };
  };

  const localizedContent = getLocalizedContent();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{localizedContent.name}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(disease.severity)}`}>
            <AlertTriangle size={14} className="inline mr-1" />
            {getSeverityText(disease.severity)}
          </span>
        </div>
        <div className="flex items-center mt-2">
          <Users size={16} className="text-gray-600 mr-2" />
          <span className="text-sm text-gray-600">
            {t('card.affects')}: {getAnimalNames(disease.affectedAnimals)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1 font-medium">{localizedContent.treatmentName}</p>
      </div>

      <div className="p-4">
        {/* Symptoms */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Stethoscope size={18} className="text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('card.symptoms')}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {localizedContent.symptoms.map((symptom, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Leaf size={18} className="text-green-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('card.ingredients')}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {localizedContent.ingredients.map((ingredient, index) => (
              <span
                key={index}
                className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm border border-green-200"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>

        {/* Preparation */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Pills size={18} className="text-purple-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('card.preparation')}</h4>
          </div>
          <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
            {localizedContent.preparation}
          </p>
        </div>

        {/* Dosage */}
        <div>
          <div className="flex items-center mb-2">
            <ShieldCheck size={18} className="text-orange-600 mr-2" />
            <h4 className="font-semibold text-gray-800">{t('card.dosage')}</h4>
          </div>
          <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
            {localizedContent.dosage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiseaseCard;