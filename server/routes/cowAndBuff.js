const express = require('express');
const router = express.Router();
const CowAndBuff = require('../models/CowAndBuff');

// GET /api/cowandbuff - Get all documents
router.get('/', async (req, res) => {
  try {
    console.log('📡 Fetching all CowAndBuff documents...');
    
    const { 
      language = 'en',
      search,
      severity,
      animal,
      limit = 50,
      page = 1
    } = req.query;

    // Build query
    let query = { isActive: { $ne: false } };
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { treatmentName: { $regex: search, $options: 'i' } },
        { symptoms: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by severity
    if (severity) {
      query.severity = severity;
    }
    
    // Filter by affected animals
    if (animal) {
      query.affectedAnimals = { $regex: animal, $options: 'i' };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const documents = await CowAndBuff.find(query)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ lastUpdated: -1 });

    // Get total count for pagination
    const total = await CowAndBuff.countDocuments(query);

    console.log(`✅ Found ${documents.length} documents (${total} total)`);

    // Transform documents based on language
    const transformedDocuments = documents.map(doc => {
      const docObj = doc.toObject();
      
      // If language is not English and translations exist, merge them
      if (language !== 'en' && docObj.translations && docObj.translations[language]) {
        const translation = docObj.translations[language];
        return {
          ...docObj,
          id: docObj._id.toString(),
          // Override with translated content where available
          name: translation.name || docObj.name,
          treatmentName: translation.treatmentName || docObj.treatmentName,
          symptoms: translation.symptoms && translation.symptoms.length > 0 
            ? translation.symptoms 
            : docObj.symptoms,
          ingredients: translation.ingredients && translation.ingredients.length > 0 
            ? translation.ingredients 
            : docObj.ingredients,
          preparation: translation.preparation || docObj.preparation,
          dosage: translation.dosage || docObj.dosage,
          // Add language-specific fields for frontend compatibility
          nameTa: language === 'ta' ? (translation.name || docObj.name) : undefined,
          treatmentNameTa: language === 'ta' ? (translation.treatmentName || docObj.treatmentName) : undefined,
          symptomsTa: language === 'ta' ? (translation.symptoms || docObj.symptoms) : undefined,
          ingredientsTa: language === 'ta' ? (translation.ingredients || docObj.ingredients) : undefined,
          preparationTa: language === 'ta' ? (translation.preparation || docObj.preparation) : undefined,
          dosageTa: language === 'ta' ? (translation.dosage || docObj.dosage) : undefined
        };
      }
      
      return {
        ...docObj,
        id: docObj._id.toString()
      };
    });

    res.json({
      success: true,
      data: transformedDocuments,
      pagination: {
        current: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        language,
        search,
        severity,
        animal
      }
    });

  } catch (error) {
    console.error('❌ Error fetching CowAndBuff documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// GET /api/cowandbuff/:id - Get single document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;
    
    console.log(`📡 Fetching CowAndBuff document with ID: ${id}`);
    
    const document = await CowAndBuff.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const docObj = document.toObject();
    
    // Apply language transformation
    let transformedDoc = { ...docObj, id: docObj._id.toString() };
    
    if (language !== 'en' && docObj.translations && docObj.translations[language]) {
      const translation = docObj.translations[language];
      transformedDoc = {
        ...transformedDoc,
        name: translation.name || docObj.name,
        treatmentName: translation.treatmentName || docObj.treatmentName,
        symptoms: translation.symptoms || docObj.symptoms,
        ingredients: translation.ingredients || docObj.ingredients,
        preparation: translation.preparation || docObj.preparation,
        dosage: translation.dosage || docObj.dosage
      };
    }

    console.log('✅ Document found and transformed');
    
    res.json({
      success: true,
      data: transformedDoc
    });

  } catch (error) {
    console.error('❌ Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message
    });
  }
});

// POST /api/cowandbuff - Create new document (for testing)
router.post('/', async (req, res) => {
  try {
    console.log('📝 Creating new CowAndBuff document...');
    
    const document = new CowAndBuff(req.body);
    const savedDocument = await document.save();
    
    console.log('✅ Document created successfully');
    
    res.status(201).json({
      success: true,
      data: savedDocument,
      message: 'Document created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating document:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create document',
      error: error.message
    });
  }
});

module.exports = router;