const knowledge = require('./assistantKnowledge');
const { getEnquiryService } = require('./storageFactory');

/**
 * Detect language: 'ta' (Tamil script), 'tanglish' (Tamil in English alphabet), or 'en'
 */
function detectLanguage(text = '') {
  const tamilRegex = /[\u0B80-\u0BFF]/;
  if (tamilRegex.test(text)) {
    return 'ta';
  }

  const tanglishPatterns = [
    /\b(vanakkam|yenna|enna|eppadi|vilai|velai|vilay|rate|alavu|engirukku|enga|irukku|theva|kaalai|neram|hotelukku|kudukuringala|kudupingala|kudukareengala|chicken|koli|kozhi|kilo|aama|illa|nanri|ungalukku|solunga|thangam|kannampalayam)\b/i
  ];

  for (const pattern of tanglishPatterns) {
    if (pattern.test(text)) {
      return 'tanglish';
    }
  }

  return 'en';
}

/**
 * Match query against verified business knowledge
 */
function findBestKnowledgeMatch(query = '', lang = 'en') {
  const lower = query.toLowerCase();

  // 1. Check for specific FAQs
  for (const faq of knowledge.faqs) {
    const hasMatch = faq.topics.some(t => lower.includes(t.toLowerCase()));
    if (hasMatch) {
      if (lang === 'ta') {
        return faq.ta;
      } else if (lang === 'tanglish') {
        return `${faq.ta} (English: ${faq.en})`;
      } else {
        return faq.en;
      }
    }
  }

  // 2. Location checks
  if (lower.includes('location') || lower.includes('address') || lower.includes('route') || lower.includes('map') || lower.includes('enga') || lower.includes('engirukku') || lower.includes('edam')) {
    if (lang === 'ta') {
      return `STP Chickens (Thangam Farms) கோயம்புத்தூர் - திருச்சி மெயின் ரோடு (NH 81), பாப்பம்பட்டி பிரிவு, செல்வராஜபுரம், கண்ணம்பாளையம் – 641103 இல் அமைந்துள்ளது. எங்கள் வரைபடம் (Map) மூலமாக நேரடி வழியையும் பார்க்கலாம்.`;
    }
    return `STP Chickens (Thangam Farms) is centrally located on Trichy Main Road (NH 81), Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103. You can also view turn-by-turn driving directions right on our website map.`;
  }

  // 3. Products checks
  if (lower.includes('product') || lower.includes('item') || lower.includes('cut') || lower.includes('whole') || lower.includes('skinless') || lower.includes('biryani') || lower.includes('curry')) {
    if (lang === 'ta') {
      return `நாங்கள் தினசரி சப்ளை செய்யும் பொருட்கள்: 1) புதிய முழு கோழி (1.6kg–2.2kg), 2) தோல் நீக்கிய கோழி (Skinless), 3) பிரியாணி & குழம்பு கட்டிங், 4) மொத்த சப்ளை (Bulk Crates 50kg முதல் 2000kg வரை). உங்களுக்கு எந்த வகை தேவை?`;
    }
    return `We specialize in 4 core wholesale categories: 1) Fresh Whole Chicken (1.6kg–2.2kg moisture-retained), 2) Fresh Skinless Chicken, 3) Specialized Cuts (Biryani Cut, Curry Cut, Boneless Breast & Drumsticks), and 4) Institutional Bulk Crates (50kg–2000kg+ daily drops).`;
  }

  // 4. Default fallback
  if (lang === 'ta') {
    return `வணக்கம்! நான் STP Chickens ஸ்மார்ட் அசிஸ்டண்ட். எங்கள் மொத்த சப்ளை (50kg+), காலை டெலிவரி நேரம் (04:00 AM–06:30 AM), அல்லது பிரத்யேக சிக்கன் கட்டிங் பற்றி கேட்கலாம். மேலும் உங்கள் வணிக வினவலை (Commercial Enquiry) பதிவு செய்யவும் நான் உதவ முடியும்.`;
  } else if (lang === 'tanglish') {
    return `Vanakkam! Naan STP Chickens Smart Assistant. Enga wholesale chicken supply (minimum 50 kg), dawn dispatch timings (04:00 AM–06:30 AM), location, or bulk cuts patri kekkalam. Ungalukku enquiry podanum na solunga, help panren!`;
  } else {
    return `Hello! I am the STP Chickens Smart Assistant. I can assist you with wholesale supply details, our minimum order (50 kg), dawn dispatch hours (04:00 AM–06:30 AM), custom cuts, or placing a direct commercial enquiry with our Kannampalayam dispatch desk.`;
  }
}

/**
 * Check if the user intends to submit an enquiry
 */
function parseEnquiryIntent(text = '', extractedData = {}) {
  const lower = text.toLowerCase();
  const intentKeywords = [
    'enquiry', 'order', 'book', 'quote', 'quotation', 'contact', 'call me', 'register',
    'supply', 'need', 'require', 'தேவை', 'ஆர்டர்', 'விலைப்பட்டியல்', 'வாங்க', 'வேண்டும்'
  ];

  const hasIntent = intentKeywords.some(k => lower.includes(k));

  // Phone number extraction regex (Indian 10-digit mobile)
  const phoneMatch = text.match(/(?:\+91[\-\s]?)?[6-9]\d{9}/);
  const quantityMatch = text.match(/(\d+)\s*(?:kg|kilos|kilo|ton|tons|packets|crates)/i);

  return {
    hasIntent,
    detectedPhone: phoneMatch ? phoneMatch[0].replace(/[\s\-+91]/g, '').slice(-10) : extractedData.phone || null,
    detectedQuantity: quantityMatch ? quantityMatch[0] : extractedData.quantity || null
  };
}

/**
 * Handle user conversation turn
 */
async function processChatMessage({ message, history = [], languagePreference = null, sessionData = {} }) {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    throw new Error('Message content is required');
  }

  // Detect language
  const detectedLang = languagePreference || detectLanguage(trimmed);

  // Check enquiry submission workflow
  const enquiryCheck = parseEnquiryIntent(trimmed, sessionData);

  // If user provides a phone number and expresses intent to order/enquire, prioritize commercial registration
  if ((sessionData.isSubmittingEnquiry || enquiryCheck.hasIntent) && enquiryCheck.detectedPhone) {
    const candidateData = {
      fullName: sessionData.fullName || extractName(trimmed) || 'Wholesale Buyer (Assistant Lead)',
      businessName: sessionData.businessName || 'B2B Trade Buyer (Via Assistant)',
      phone: enquiryCheck.detectedPhone,
      email: sessionData.email || 'enquiry@stpchickens.trade',
      productInterest: sessionData.productInterest || matchProductInterest(trimmed) || 'Fresh Whole Chicken',
      quantity: enquiryCheck.detectedQuantity || sessionData.quantity || '50 kg daily (Standard Batch)',
      deliveryLocation: sessionData.deliveryLocation || 'Coimbatore Commercial Hub',
      message: `Registered via STP Smart Assistant: "${trimmed}"`
    };

    if (candidateData.phone && candidateData.phone.length === 10) {
      try {
        const enquiryService = getEnquiryService();
        const created = await enquiryService.createEnquiry(candidateData);

        const refId = created.id;
        let confirmationText = '';
        if (detectedLang === 'ta') {
          confirmationText = `நன்றி! உங்கள் வணிக வினவல் (Enquiry) வெற்றிகரமாக பதிவு செய்யப்பட்டது. உங்கள் குறிப்பு எண்: **${refId}**. எங்கள் கண்ணம்பாளையம் வர்த்தக குழுவினர் 2 மணி நேரத்திற்குள் உங்களை அழைப்பார்கள்.`;
        } else if (detectedLang === 'tanglish') {
          confirmationText = `Romba Nandri! Ungal enquiry successfully registered. Reference ID: **${refId}**. Engal Kannampalayam commercial desk 2 hours-kulle ungalai contact pannuvaanga.`;
        } else {
          confirmationText = `Thank you! Your commercial enquiry has been successfully registered under reference ID: **${refId}**. Our Kannampalayam dispatch desk will review and contact you within 2 hours.`;
        }

        return {
          reply: confirmationText,
          language: detectedLang,
          enquiryRegistered: true,
          enquiryId: refId,
          suggestedChips: [
            'What is the delivery timing?',
            'Where is your facility?',
            'What chicken cuts are available?'
          ]
        };
      } catch (err) {
        console.error('[Assistant] Enquiry creation error:', err.message);
      }
    }
  }

  // Standard knowledge-based answer
  const answer = findBestKnowledgeMatch(trimmed, detectedLang);

  return {
    reply: answer,
    language: detectedLang,
    enquiryRegistered: false,
    suggestedChips: getSuggestedChips(detectedLang)
  };
}

function extractName(text) {
  const match = text.match(/(?:my name is|i am|பெயர்)\s+([A-Za-z\s]{3,25})/i);
  return match ? match[1].trim() : null;
}

function matchProductInterest(text) {
  const lower = text.toLowerCase();
  if (lower.includes('skinless')) return 'Skinless Chicken';
  if (lower.includes('cut') || lower.includes('curry') || lower.includes('biryani')) return 'Chicken Cuts';
  if (lower.includes('bulk') || lower.includes('crate')) return 'Bulk Chicken Supply';
  if (lower.includes('whole')) return 'Fresh Whole Chicken';
  return null;
}

function getSuggestedChips(lang) {
  if (lang === 'ta') {
    return [
      'குறைந்தபட்ச அளவு என்ன? (Minimum Order)',
      'டெலிவரி நேரம் என்ன? (Dispatch Timings)',
      'பொருட்களின் வகைகள் (Available Products)',
      'முகவரி மற்றும் வழி (Facility Location)'
    ];
  } else if (lang === 'tanglish') {
    return [
      'Minimum order evlo kg?',
      'Delivery timings enna?',
      'Enna products irukku?',
      'STP Chickens location enga?'
    ];
  }
  return [
    'What products do you supply?',
    'What is your minimum order?',
    'What are the dispatch timings?',
    'Where is STP Chickens located?',
    'How do I place a wholesale enquiry?'
  ];
}

module.exports = {
  detectLanguage,
  processChatMessage,
  findBestKnowledgeMatch
};
