/**
 * Verified Knowledge Base for STP Chickens / Thangam Farms
 * Strict business factual boundary: No fabricated prices, no fictitious reviews.
 */
module.exports = {
  business: {
    brandName: 'STP Chickens',
    parentEntity: 'Thangam Farms',
    businessType: 'B2B Wholesale Fresh Chicken Supplier & Commercial Processing',
    officialAddress: '152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103, Tamil Nadu, India.',
    serviceArea: 'Coimbatore, Tiruppur, Erode, and surrounding Western Tamil Nadu hospitality corridors.',
    establishedCorridor: 'Trichy Main Road (NH 81), Kannampalayam Logistics Hub',
    gpsCoordinates: {
      latitude: 11.0050,
      longitude: 77.1013,
      corridor: 'Trichy Road NH 81, Pappampatti Pirivu Entrance'
    }
  },

  commercialRules: {
    minimumOrder: '50 kg per commercial batch / drop',
    dailyDispatchWindow: 'Dawn dispatch from 04:00 AM to 06:30 AM (Designed for hotel & catering kitchen readiness)',
    secondaryDispatch: 'Morning replenishment by prior coordination',
    responseSla: 'Enquiries reviewed and prioritized within 2 hours',
    pricingPolicy: 'Wholesale prices vary daily based on market feed and bird rates. Daily customized quotes provided upon commercial enquiry submission.',
    confirmationNotice: 'Submitting an enquiry via the website or assistant registers a commercial procurement request; it is finalized into an order once confirmed by our dispatch team.'
  },

  products: [
    {
      id: 'fresh-whole-chicken',
      name: 'Fresh Whole Chicken',
      nameTa: 'புதிய முழு கோழி (Fresh Whole Chicken)',
      weightRange: '1.6 kg to 2.2 kg average dressed weight',
      description: 'Hygienically dressed whole broiler with natural moisture retained. Clean bio-secure handling, antibiotic-safe, and tailored for restaurants and rotisseries.',
      suitableFor: 'Hotels, Biryani specialists, Roast & Grill establishments, Supermarkets.'
    },
    {
      id: 'skinless-chicken',
      name: 'Skinless Chicken',
      nameTa: 'தோல் நீக்கப்பட்ட கோழி (Skinless Chicken)',
      weightRange: 'Precision trimmed per commercial pack',
      description: 'Ready-to-cook dressed broiler chicken with complete skin removal. Uniform butchering with minimal trimming loss.',
      suitableFor: 'Multi-cuisine restaurants, Catering banquets, Hospital & Corporate canteens.'
    },
    {
      id: 'chicken-cuts',
      name: 'Specialized Chicken Cuts',
      nameTa: 'பிரத்யேக சிக்கன் கட்டுகள் (Specialized Cuts)',
      types: ['Curry Cut', 'Biryani Cut', 'Breast Fillets', 'Drumsticks & Wings'],
      description: 'Standardized portioning ensuring precise piece-count and uniform cooking consistency across commercial kitchens.',
      suitableFor: 'High-volume biryani kitchens, Catering contractors, Fast-food & Quick-service kitchens.'
    },
    {
      id: 'bulk-supply',
      name: 'Bulk Poultry Supply',
      nameTa: 'மொத்த கொள்முதல் சப்ளை (Bulk Crates Supply)',
      capacity: '50 kg to 2000+ kg daily volume',
      description: 'High-volume poultry crates staged under strict cold-chain handling directly from the Kannampalayam processing unit.',
      suitableFor: 'Hospitality chains, College hostels, Food manufacturing units, Wholesale distributors.'
    }
  ],

  faqs: [
    {
      topics: ['minimum', 'order', 'qty', 'quantity', 'குறைந்தபட்ச', 'அளவு', 'kg'],
      en: 'Our minimum commercial wholesale order is 50 kg per delivery drop. For regular daily hotel contracts, volume tiers can be scheduled.',
      ta: 'எங்கள் மொத்த கொள்முதல் குறைந்தபட்ச அளவு (Minimum Order) 50 கிலோ ஆகும். ஹோட்டல்கள் மற்றும் கேட்டரிங் தினசரி தேவைகளுக்கு ஏற்ப திட்டமிடலாம்.'
    },
    {
      topics: ['timing', 'dispatch', 'delivery', 'time', 'நேரம்', 'டெலிவரி', 'காலை'],
      en: 'Our primary cold-chain dispatch operates during dawn hours from 04:00 AM to 06:30 AM to ensure commercial kitchens receive fresh dressed chicken before morning prep.',
      ta: 'எங்களின் காலை டெலிவரி நேரம் 04:00 AM முதல் 06:30 AM வரை செயல்படுகிறது. உணவகங்கள் மற்றும் கேட்டரிங் சமையலுக்கு உரிய நேரத்தில் சென்றடைகிறது.'
    },
    {
      topics: ['location', 'address', 'where', 'place', 'எங்கு', 'முகவரி', 'இடம்', 'maps'],
      en: 'STP Chickens (Thangam Farms) is located at 152, Trichy Road, Selvaraja Puram, Pappampatti Pirivu, Kannampalayam, Coimbatore – 641103. Direct highway access along NH 81.',
      ta: 'எங்கள் நிறுவனம் கோயம்புத்தூர் - திருச்சி மெயின் ரோடு (NH 81), பாப்பம்பட்டி பிரிவு, செல்வராஜபுரம், கண்ணம்பாளையம் – 641103 இல் அமைந்துள்ளது.'
    },
    {
      topics: ['price', 'rate', 'cost', 'விலை', 'ரேட்', 'ரூபாய்', 'pricing'],
      en: 'Wholesale chicken prices fluctuate daily based on prevailing market rates. Please submit an enquiry with your daily volume requirement, and our commercial desk will share today\'s best wholesale price.',
      ta: 'கோழி மொத்த விலை சந்தை நிலவரப்படி தினசரி மாறும். உங்கள் தினசரி தேவையான அளவை தெரிவித்து வினவல் (Enquiry) சமர்ப்பித்தால், எங்கள் குழு இன்றைய சிறந்த விலையை வழங்கும்.'
    },
    {
      topics: ['hotel', 'restaurant', 'catering', 'ஹோட்டல்', 'கேட்டரிங்', 'கல்யாணம்'],
      en: 'Yes, we specialize in B2B supply for hotels, fine-dining restaurants, biryani masters, wedding caterers, and institutional mess facilities with customized cuts and dawn drops.',
      ta: 'ஆம்! ஹோட்டல்கள், பிரியாணி உணவகங்கள், கேட்டரிங் மற்றும் திருமண ஆர்டர்களுக்கு பிரத்யேக கட்டிங் மற்றும் அதிகாலை டெலிவரி வசதி உள்ளது.'
    },
    {
      topics: ['cuts', 'types', 'products', 'பொருட்கள்', 'கட்டிங்', 'வகைகள்'],
      en: 'We supply: 1) Fresh Whole Chicken (1.6kg–2.2kg), 2) Fresh Skinless Chicken, 3) Specialized Cuts (Curry, Biryani, Drumstick, Breast), and 4) Bulk Food-Grade Crates (50kg–2000kg+).',
      ta: 'நாங்கள் வழங்குபவை: 1) முழு கோழி (Fresh Whole), 2) தோல் நீக்கிய கோழி (Skinless), 3) பிரியாணி / குழம்பு கட்டிங் (Curry / Biryani Cuts), 4) மொத்த சப்ளை (Bulk Crates 50kg+).'
    }
  ]
};

