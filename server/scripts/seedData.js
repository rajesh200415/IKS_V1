const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CowAndBuff = require('../models/CowAndBuff');

// Load environment variables
dotenv.config();

// Sample data with translations
const sampleData = [
  {
    name: 'Teat Obstruction',
    treatmentName: 'Teat Obstruction Treatment 1',
    symptoms: [
      'Teat obstructions due to granulation tissue after injury',
      'interferes with milk flow',
      'may present as diffuse, tightly adherent lesions or highly mobile discrete lesions'
    ],
    ingredients: ['Neem leaf stalk', 'turmeric powder', 'butter or ghee'],
    preparation: 'Cut neem leaf stalk to teat size, coat with turmeric and butter/ghee mixture. Clean teat opening thoroughly.',
    dosage: 'Insert coated neem stalk into affected teat in an anti-clockwise direction after each milking.',
    severity: 'Medium',
    affectedAnimals: ['Cattle', 'Buffaloes'],
    translations: {
      ta: {
        name: 'முலைக்காம்பு அடைப்பு',
        treatmentName: 'முலைக்காம்பு அடைப்பு சிகிச்சை 1',
        symptoms: [
          'காயத்திற்குப் பிறகு கிரானுலேஷன் திசுவால் முலைக்காம்பு அடைப்பு',
          'பால் ஓட்டத்தில் தடை',
          'பரவலான, இறுக்கமாக ஒட்டிய புண்கள் அல்லது அதிக அசையும் தனித்த புண்களாக தோன்றலாம்'
        ],
        ingredients: ['வேப்பிலை தண்டு', 'மஞ்சள் தூள்', 'வெண்ணெய் அல்லது நெய்'],
        preparation: 'வேப்பிலை தண்டை முலைக்காம்பு அளவுக்கு வெட்டி, மஞ்சள் மற்றும் வெண்ணெய்/நெய் கலவையால் பூசவும். முலைக்காம்பு திறப்பை நன்கு சுத்தம் செய்யவும்.',
        dosage: 'ஒவ்வொரு கறவைக்குப் பிறகும் பூசப்பட்ட வேப்பிலை தண்டை பாதிக்கப்பட்ட முலைக்காம்பில் எதிர் கடிகார திசையில் செருகவும்.'
      },
      hi: {
        name: 'थन अवरोध',
        treatmentName: 'थन अवरोध उपचार 1',
        symptoms: [
          'चोट के बाद ग्रेन्युलेशन टिश्यू के कारण थन अवरोध',
          'दूध के प्रवाह में बाधा',
          'फैले हुए, कसकर चिपके घाव या अत्यधिक गतिशील अलग घावों के रूप में प्रस्तुत हो सकता है'
        ],
        ingredients: ['नीम पत्ती का डंठल', 'हल्दी पाउडर', 'मक्खन या घी'],
        preparation: 'नीम पत्ती के डंठल को थन के आकार में काटें, हल्दी और मक्खन/घी के मिश्रण से लेप करें। थन के मुंह को अच्छी तरह साफ करें।',
        dosage: 'हर दुहने के बाद लेपित नीम डंठल को प्रभावित थन में घड़ी की विपरीत दिशा में डालें।'
      }
    },
    category: 'Udder Health',
    tags: ['teat', 'obstruction', 'milk flow', 'neem'],
    isActive: true
  },
  {
    name: 'Udder Edema',
    treatmentName: 'Udder Edema Treatment 1',
    symptoms: [
      'Swelling of udder',
      'dermatitis',
      'reduced milk production',
      'restlessness during milking'
    ],
    ingredients: ['Sesame or mustard oil (200 ml)', 'turmeric powder (1 handful)', 'garlic (2 cloves)'],
    preparation: 'Heat oil, add turmeric powder and sliced garlic, stir until aroma develops (do not boil), cool.',
    dosage: 'Apply in circular motion with force over oedematous region and udder 4 times a day for 3 days.',
    severity: 'Medium',
    affectedAnimals: ['Cattle', 'Buffaloes'],
    translations: {
      ta: {
        name: 'மடி வீக்கம்',
        treatmentName: 'மடி வீக்கம் சிகிச்சை 1',
        symptoms: [
          'மடியில் வீக்கம்',
          'தோல் அழற்சி',
          'பால் உற்பத்தி குறைவு',
          'கறவையின் போது அமைதியின்மை'
        ],
        ingredients: ['எள் அல்லது கடுகு எண்ணெய் (200 மிலி)', 'மஞ்சள் தூள் (1 கைப்பிடி)', 'பூண்டு (2 பல்)'],
        preparation: 'எண்ணெயை சூடாக்கி, மஞ்சள் தூள் மற்றும் நறுக்கிய பூண்டு சேர்த்து, நறுமணம் வரும் வரை கிளறவும் (கொதிக்க வைக்க வேண்டாம்), ஆறவிடவும்.',
        dosage: 'வீக்கமான பகுதி மற்றும் மடியில் வட்ட இயக்கத்தில் வலுவாக தடவி, நாளுக்கு 4 முறை 3 நாட்களுக்கு பயன்படுத்தவும்.'
      },
      hi: {
        name: 'थन की सूजन',
        treatmentName: 'थन की सूजन का उपचार 1',
        symptoms: [
          'थन में सूजन',
          'त्वचा की सूजन',
          'दूध उत्पादन में कमी',
          'दुहने के दौरान बेचैनी'
        ],
        ingredients: ['तिल या सरसों का तेल (200 मिली)', 'हल्दी पाउडर (1 मुट्ठी)', 'लहसुन (2 कली)'],
        preparation: 'तेल गर्म करें, हल्दी पाउडर और कटा हुआ लहसुन डालें, खुशबू आने तक हिलाएं (उबालें नहीं), ठंडा करें।',
        dosage: 'सूजन वाले क्षेत्र और थन पर गोलाकार गति में जोर से लगाएं, 3 दिनों तक दिन में 4 बार।'
      }
    },
    category: 'Udder Health',
    tags: ['udder', 'edema', 'swelling', 'milk production'],
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing data...');
    await CowAndBuff.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('🌱 Seeding sample data...');
    const createdDocuments = await CowAndBuff.insertMany(sampleData);
    console.log(`✅ Successfully seeded ${createdDocuments.length} documents`);

    console.log('📊 Sample documents created:');
    createdDocuments.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.name} (ID: ${doc._id})`);
    });

    console.log('🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();