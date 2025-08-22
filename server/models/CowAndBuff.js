const mongoose = require('mongoose');

// Flexible schema for CowAndBuff collection
const cowAndBuffSchema = new mongoose.Schema({
  // Core fields
  name: { type: String, required: true },
  treatmentName: { type: String, required: true },
  symptoms: [String],
  ingredients: [String],
  preparation: String,
  dosage: String,
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  affectedAnimals: [String],
  
  // Multi-language support
  translations: {
    ta: {
      name: String,
      treatmentName: String,
      symptoms: [String],
      ingredients: [String],
      preparation: String,
      dosage: String
    },
    hi: {
      name: String,
      treatmentName: String,
      symptoms: [String],
      ingredients: [String],
      preparation: String,
      dosage: String
    },
    te: {
      name: String,
      treatmentName: String,
      symptoms: [String],
      ingredients: [String],
      preparation: String,
      dosage: String
    },
    ml: {
      name: String,
      treatmentName: String,
      symptoms: [String],
      ingredients: [String],
      preparation: String,
      dosage: String
    }
  },
  
  // Additional flexible fields
  category: String,
  tags: [String],
  imageUrl: String,
  videoUrl: String,
  references: [String],
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  // Allow additional fields not defined in schema
  strict: false,
  timestamps: true
});

// Indexes for better search performance
cowAndBuffSchema.index({ name: 'text', treatmentName: 'text', symptoms: 'text' });
cowAndBuffSchema.index({ severity: 1 });
cowAndBuffSchema.index({ affectedAnimals: 1 });
cowAndBuffSchema.index({ isActive: 1 });

module.exports = mongoose.model('CowAndBuff', cowAndBuffSchema);