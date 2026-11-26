require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const GovernmentOrder = require('../models/GovernmentOrder');
const { ensureSamplePDF } = require('./generatePdf');

const sampleOrders = [
  {
    orderNumber: 'GO-2026-ED-101',
    department: 'Higher Education',
    category: 'Scholarship',
    publicationDate: new Date('2026-02-15T10:00:00Z'),
    status: 'published',
    title: {
      en: 'National Merit Scholarship Scheme 2026-27 for Undergraduate Students',
      hi: 'स्नातक छात्रों के लिए राष्ट्रीय मेरिट छात्रवृत्ति योजना 2026-27',
      pa: 'ਅੰਡਰਗ੍ਰੈਜੂਏਟ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਰਾਸ਼ਟਰੀ ਮੈਰਿਟ ਸਕਾਲਰਸ਼ਿਪ ਸਕੀਮ 2026-27',
    },
    description: {
      en: 'Notification regarding financial assistance and monthly stipends for meritorious undergraduate students enrolled in accredited technical, science, and humanities universities across the state.',
      hi: 'राज्य भर के मान्यता प्राप्त तकनीकी, विज्ञान और मानविकी विश्वविद्यालयों में नामांकित मेधावी स्नातक छात्रों के लिए वित्तीय सहायता और मासिक वजीफे के संबंध में अधिसूचना।',
      pa: 'ਰਾਜ ਭਰ ਦੀਆਂ ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਤਕਨੀਕੀ, ਵਿਗਿਆਨ ਅਤੇ ਮਨੁੱਖਤਾ ਯੂਨੀਵਰਸਿਟੀਆਂ ਵਿੱਚ ਦਾਖਲ ਹੋਏ ਹੋਣਹਾਰ ਅੰਡਰਗ੍ਰੈਜੂਏਟ ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਿੱਤੀ ਸਹਾਇਤਾ ਅਤੇ ਮਾਸਿਕ ਵਜ਼ੀਫ਼ੇ ਸੰਬੰਧੀ ਨੋਟੀਫਿਕੇਸ਼ਨ।',
    },
  },
  {
    orderNumber: 'GO-2026-HL-204',
    department: 'Health & Family Welfare',
    category: 'Notification',
    publicationDate: new Date('2026-02-18T11:30:00Z'),
    status: 'published',
    title: {
      en: 'Universal Healthcare Diagnostics & Free Medicine Distribution Mandate',
      hi: 'सार्वभौमिक स्वास्थ्य देखभाल निदान और मुफ्त दवा वितरण आदेश',
      pa: 'ਸਰਵ ਵਿਆਪਕ ਸਿਹਤ ਸੰਭਾਲ ਜਾਂਚ ਅਤੇ ਮੁਫਤ ਦਵਾਈਆਂ ਦੀ ਵੰਡ ਦਾ ਆਦੇਸ਼',
    },
    description: {
      en: 'Directive instructing all district civil hospitals, community health centers, and sub-divisional dispensaries to provide 120 essential generic medicines and 45 diagnostic blood tests free of cost.',
      hi: 'सभी जिला नागरिक अस्पतालों, सामुदायिक स्वास्थ्य केंद्रों और उप-मंडल औषधालयों को 120 आवश्यक जेनेरिक दवाएं और 45 नैदानिक रक्त परीक्षण निःशुल्क उपलब्ध कराने का निर्देश।',
      pa: 'ਸਾਰੇ ਜ਼ਿਲ੍ਹਾ ਸਿਵਲ ਹਸਪਤਾਲਾਂ, ਕਮਿਊਨਿਟੀ ਹੈਲਥ ਸੈਂਟਰਾਂ ਅਤੇ ਸਬ-ਡਿਵੀਜ਼ਨਲ ਡਿਸਪੈਂਸਰੀਆਂ ਨੂੰ 120 ਜ਼ਰੂਰੀ ਜੈਨੇਰਿਕ ਦਵਾਈਆਂ ਅਤੇ 45 ਡਾਇਗਨੌਸਟਿਕ ਖੂਨ ਟੈਸਟ ਮੁਫਤ ਪ੍ਰਦਾਨ ਕਰਨ ਦੇ ਨਿਰਦੇਸ਼।',
    },
  },
  {
    orderNumber: 'GO-2026-AG-309',
    department: 'Agriculture & Farmer Welfare',
    category: 'Policy Order',
    publicationDate: new Date('2026-02-20T09:15:00Z'),
    status: 'published',
    title: {
      en: 'Subsidy on Solar Water Pumps and Micro-Irrigation Systems 2026',
      hi: 'सौर जल पंपों और सूक्ष्म सिंचाई प्रणालियों पर सब्सिडी योजना 2026',
      pa: 'ਸੋਲਰ ਵਾਟਰ ਪੰਪਾਂ ਅਤੇ ਮਾਈਕ੍ਰੋ-ਸਿੰਚਾਈ ਪ੍ਰਣਾਲੀਆਂ \'ਤੇ ਸਬਸਿਡੀ ਸਕੀਮ 2026',
    },
    description: {
      en: 'Financial subsidy of up to 75% for marginal and small farmers for installing 3HP, 5HP, and 7.5HP solar agricultural pump sets to conserve groundwater and ensure daytime uninterrupted irrigation.',
      hi: 'भूजल संरक्षण और दिन के समय निर्बाध सिंचाई सुनिश्चित करने के लिए 3HP, 5HP और 7.5HP सौर कृषि पंप सेट स्थापित करने के लिए सीमांत और छोटे किसानों के लिए 75% तक वित्तीय सब्सिडी।',
      pa: 'ਧਰਤੀ ਹੇਠਲੇ ਪਾਣੀ ਨੂੰ ਬਚਾਉਣ ਅਤੇ ਦਿਨ ਵੇਲੇ ਨਿਰਵਿਘਨ ਸਿੰਚਾਈ ਯਕੀਨੀ ਬਣਾਉਣ ਲਈ 3HP, 5HP ਅਤੇ 7.5HP ਸੋਲਰ ਖੇਤੀਬਾੜੀ ਪੰਪ ਸੈੱਟ ਲਗਾਉਣ ਲਈ ਸੀਮਾਂਤ ਅਤੇ ਛੋਟੇ ਕਿਸਾਨਾਂ ਲਈ 75% ਤੱਕ ਵਿੱਤੀ ਸਬਸਿਡੀ।',
    },
  },
  {
    orderNumber: 'GO-2026-TR-412',
    department: 'Transport & Highways',
    category: 'Circular',
    publicationDate: new Date('2026-02-21T14:45:00Z'),
    status: 'published',
    title: {
      en: 'Electric Vehicle (EV) Transition Guidelines for Public Passenger Fleets',
      hi: 'सार्वजनिक यात्री बेड़े के लिए इलेक्ट्रिक वाहन (ईवी) संक्रमण दिशानिर्देश',
      pa: 'ਜਨਤਕ ਯਾਤਰੀ ਫਲੀਟਾਂ ਲਈ ਇਲੈਕਟ੍ਰਿਕ ਵਾਹਨ (ਈਵੀ) ਤਬਦੀਲੀ ਦੇ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼',
    },
    description: {
      en: 'Guidelines requiring state road transport corporations and authorized private bus operators to ensure 40% fleet electrification by December 2027 with dedicated fast charging hubs.',
      hi: 'राज्य सड़क परिवहन निगमों और अधिकृत निजी बस ऑपरेटरों को समर्पित फास्ट चार्जिंग हब के साथ दिसंबर 2027 तक 40% बेड़े के विद्युतीकरण को सुनिश्चित करने के दिशानिर्देश।',
      pa: 'ਰਾਜ ਸੜਕੀ ਆਵਾਜਾਈ ਨਿਗਮਾਂ ਅਤੇ ਅਧਿਕਾਰਤ ਪ੍ਰਾਈਵੇਟ ਬੱਸ ਆਪਰੇਟਰਾਂ ਨੂੰ ਸਮਰਪਿਤ ਫਾਸਟ ਚਾਰਜਿੰਗ ਹੱਬਾਂ ਨਾਲ ਦਸੰਬਰ 2027 ਤੱਕ 40% ਫਲੀਟ ਬਿਜਲੀਕਰਨ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਣ ਦੇ ਦਿਸ਼ਾ-ਨਿਰਦੇਸ਼।',
    },
  },
  {
    orderNumber: 'GO-2026-IT-518',
    department: 'Information Technology',
    category: 'Tender',
    publicationDate: new Date('2026-02-22T16:00:00Z'),
    status: 'published',
    title: {
      en: 'Tender Notice for High-Speed Fiber Optic Connectivity in Rural Gram Panchayats',
      hi: 'ग्रामीण ग्राम पंचायतों में हाई-स्पीड फाइबर ऑप्टिक कनेक्टिविटी के लिए निविदा सूचना',
      pa: 'ਪੇਂਡੂ ਗ੍ਰਾਮ ਪੰਚਾਇਤਾਂ ਵਿੱਚ ਹਾਈ-ਸਪੀਡ ਫਾਈਬਰ ਆਪਟਿਕ ਕਨੈਕਟੀਵਿਟੀ ਲਈ ਟੈਂਡਰ ਨੋਟਿਸ',
    },
    description: {
      en: 'Invitation of competitive e-tenders for the deployment, commissioning, and 5-year maintenance of gigabit broadband fiber optic internet across 1,200 rural Gram Panchayat secretariats.',
      hi: '1,200 ग्रामीण ग्राम पंचायत सचिवालयों में गीगाबिट ब्रॉडबैंड फाइबर ऑप्टिक इंटरनेट की तैनाती, चालू करने और 5 साल के रखरखाव के लिए प्रतिस्पर्धी ई-निविदाओं का आमंत्रण।',
      pa: '1,200 ਪੇਂਡੂ ਗ੍ਰਾਮ ਪੰਚਾਇਤ ਸਕੱਤਰੇਤਾਂ ਵਿੱਚ ਗੀਗਾਬਿਟ ਬਰਾਡਬੈਂਡ ਫਾਈਬਰ ਆਪਟਿਕ ਇੰਟਰਨੈਟ ਦੀ ਤੈਨਾਤੀ, ਚਾਲੂ ਕਰਨ ਅਤੇ 5-ਸਾਲ ਦੇ ਰੱਖ-ਰਖਾਅ ਲਈ ਪ੍ਰਤੀਯੋਗੀ ਈ-ਟੈਂਡਰਾਂ ਦਾ ਸੱਦਾ।',
    },
  },
  {
    orderNumber: 'GO-2026-SJ-625',
    department: 'Social Justice & Empowerment',
    category: 'Notification',
    publicationDate: new Date('2026-02-23T12:00:00Z'),
    status: 'published',
    title: {
      en: 'Enhancement of Monthly Pension for Senior Citizens and Divyang Persons',
      hi: 'वरिष्ठ नागरिकों और दिव्यांगजनों के लिए मासिक पेंशन में वृद्धि',
      pa: 'ਸੀਨੀਅਰ ਸਿਟੀਜ਼ਨਾਂ ਅਤੇ ਦਿਵਿਆਂਗ ਵਿਅਕਤੀਆਂ ਲਈ ਮਾਸਿਕ ਪੈਨਸ਼ਨ ਵਿੱਚ ਵਾਧਾ',
    },
    description: {
      en: 'Executive order revising monthly social security pensions from Rs. 2,500 to Rs. 3,500 effective from 1st April 2026, payable directly into DBT-linked bank accounts.',
      hi: '1 अप्रैल 2026 से प्रभावी मासिक सामाजिक सुरक्षा पेंशन को 2,500 रुपये से बढ़ाकर 3,500 रुपये करने का कार्यकारी आदेश, जो सीधे डीबीटी-लिंक्ड बैंक खातों में देय होगा।',
      pa: '1 ਅਪ੍ਰੈਲ 2026 ਤੋਂ ਲਾਗੂ ਹੋਣ ਵਾਲੀ ਮਾਸਿਕ ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਪੈਨਸ਼ਨ ਨੂੰ 2,500 ਰੁਪਏ ਤੋਂ ਵਧਾ ਕੇ 3,500 ਰੁਪਏ ਕਰਨ ਦਾ ਕਾਰਜਕਾਰੀ ਆਦੇਸ਼, ਜੋ ਸਿੱਧਾ ਡੀਬੀਟੀ-ਲਿੰਕਡ ਬੈਂਕ ਖਾਤਿਆਂ ਵਿੱਚ ਦਿੱਤਾ ਜਾਵੇਗਾ।',
    },
  },
  {
    orderNumber: 'GO-2026-FN-730',
    department: 'Finance & Taxation',
    category: 'Circular',
    publicationDate: new Date('2026-02-24T15:20:00Z'),
    status: 'published',
    title: {
      en: 'Quarterly Commercial Tax Settlement and Interest Waiver Amnesty Scheme',
      hi: 'त्रैमासिक वाणिज्यिक कर निपटान और ब्याज माफी माफी योजना',
      pa: 'ਤਿਮਾਹੀ ਵਪਾਰਕ ਟੈਕਸ ਨਿਪਟਾਰਾ ਅਤੇ ਵਿਆਜ ਛੋਟ ਸਕੀਮ',
    },
    description: {
      en: 'One-time voluntary disclosure and tax dispute resolution scheme waiving 100% of penalties and accumulated interest upon full payment of principal assessment dues.',
      hi: 'मूल मूल्यांकन देय राशि के पूर्ण भुगतान पर 100% जुर्माना और संचित ब्याज माफ करने वाली एकमुश्त स्वैच्छिक प्रकटीकरण और कर विवाद समाधान योजना।',
      pa: 'ਮੂਲ ਮੁਲਾਂਕਣ ਬਕਾਏ ਦੀ ਪੂਰੀ ਅਦਾਇਗੀ \'ਤੇ ਜੁਰਮਾਨੇ ਅਤੇ ਇਕੱਠੇ ਹੋਏ ਵਿਆਜ ਦੀ 100% ਛੋਟ ਦੇਣ ਵਾਲੀ ਇਕ-ਵਾਰੀ ਸਵੈ-ਇੱਛਤ ਖੁਲਾਸਾ ਅਤੇ ਟੈਕਸ ਵਿਵਾਦ ਹੱਲ ਸਕੀਮ।',
    },
  },
  {
    orderNumber: 'GO-2026-PR-801',
    department: 'Personnel & Administrative Reforms',
    category: 'Recruitment',
    publicationDate: new Date('2026-02-25T09:00:00Z'),
    status: 'published',
    title: {
      en: 'Combined State Civil Services Examination 2026 Notification',
      hi: 'संयुक्त राज्य सिविल सेवा परीक्षा 2026 अधिसूचना',
      pa: 'ਸੰਯੁਕਤ ਰਾਜ ਸਿਵਲ ਸੇਵਾਵਾਂ ਪ੍ਰੀਖਿਆ 2026 ਨੋਟੀਫਿਕੇਸ਼ਨ',
    },
    description: {
      en: 'Public Service Commission announcement for 420 Grade-A and Grade-B administrative, police, excise, and revenue executive positions. Online registration opens March 1st.',
      hi: '420 ग्रेड-ए और ग्रेड-बी प्रशासनिक, पुलिस, उत्पाद शुल्क और राजस्व कार्यकारी पदों के लिए लोक सेवा आयोग की घोषणा। ऑनलाइन पंजीकरण 1 मार्च से शुरू होगा।',
      pa: '420 ਗ੍ਰੇਡ-ਏ ਅਤੇ ਗ੍ਰੇਡ-ਬੀ ਪ੍ਰਬੰਧਕੀ, ਪੁਲਿਸ, ਆਬਕਾਰੀ ਅਤੇ ਮਾਲ ਕਾਰਜਕਾਰੀ ਅਹੁਦਿਆਂ ਲਈ ਲੋਕ ਸੇਵਾ ਕਮਿਸ਼ਨ ਦਾ ਐਲਾਨ। ਆਨਲਾਈਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ 1 ਮਾਰਚ ਤੋਂ ਸ਼ੁਰੂ ਹੋਵੇਗੀ।',
    },
  },
  {
    orderNumber: 'GO-2026-DR-901',
    department: 'Higher Education',
    category: 'Policy Order',
    publicationDate: new Date('2026-02-26T08:00:00Z'),
    status: 'draft',
    title: {
      en: 'Draft Policy for State Research and Innovation Seed Grants',
      hi: 'राज्य अनुसंधान और नवाचार बीज अनुदान के लिए मसौदा नीति',
      pa: 'ਰਾਜ ਖੋਜ ਅਤੇ ਨਵੀਨਤਾ ਸੀਡ ਗ੍ਰਾਂਟਾਂ ਲਈ ਖਰੜਾ ਨੀਤੀ',
    },
    description: {
      en: 'Internal administrative draft proposing competitive seed grants up to Rs. 25 Lakhs for university faculty and doctoral scholars conducting applied scientific research.',
      hi: 'विश्वविद्यालय के संकाय और डॉक्टरेट विद्वानों द्वारा व्यावहारिक वैज्ञानिक अनुसंधान करने के लिए 25 लाख रुपये तक के प्रतिस्पर्धी बीज अनुदान का प्रस्ताव करने वाला आंतरिक प्रशासनिक मसौदा।',
      pa: 'ਯੂਨੀਵਰਸਿਟੀ ਦੇ ਫੈਕਲਟੀ ਅਤੇ ਡਾਕਟੋਰਲ ਵਿਦਵਾਨਾਂ ਵੱਲੋਂ ਲਾਗੂ ਵਿਗਿਆਨਕ ਖੋਜ ਕਰਨ ਲਈ 25 ਲੱਖ ਰੁਪਏ ਤੱਕ ਦੀਆਂ ਪ੍ਰਤੀਯੋਗੀ ਸੀਡ ਗ੍ਰਾਂਟਾਂ ਦਾ ਪ੍ਰਸਤਾਵ ਕਰਨ ਵਾਲਾ ਅੰਦਰੂਨੀ ਪ੍ਰਬੰਧਕੀ ਖਰੜਾ।',
    },
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govt_order_portal';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // 1. Seed or Verify Administrator
    const initialEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@rajpatra.gov.in').toLowerCase().trim();
    let admin = await Admin.findOne({ email: initialEmail });

    if (!admin) {
      console.log(`[Seed] Creating initial administrator: ${initialEmail}`);
      admin = await Admin.create({
        name: process.env.ADMIN_INITIAL_NAME || 'System Administrator',
        email: initialEmail,
        password: process.env.ADMIN_INITIAL_PASSWORD || 'Admin@12345',
        role: 'superadmin',
      });
      console.log(`[Seed] Administrator created successfully with default password.`);
    } else {
      console.log(`[Seed] Administrator already exists: ${admin.email}`);
    }

    // 2. Clear old orders and re-seed clean realistic government orders
    console.log('[Seed] Clearing previous orders for clean state...');
    await GovernmentOrder.deleteMany({});

    console.log('[Seed] Generating official PDF documents and populating multilingual orders...');
    for (const item of sampleOrders) {
      const pdfMeta = ensureSamplePDF(item.orderNumber, item.title.en, item.department);

      await GovernmentOrder.create({
        ...item,
        pdfUrl: pdfMeta.url,
        pdfPublicId: pdfMeta.filename,
        pdfOriginalName: pdfMeta.filename,
        pdfSize: pdfMeta.size,
        createdBy: admin._id,
      });
    }

    const total = await GovernmentOrder.countDocuments();
    const published = await GovernmentOrder.countDocuments({ status: 'published' });
    const draft = await GovernmentOrder.countDocuments({ status: 'draft' });

    console.log(`[Seed] Database successfully seeded with:`);
    console.log(`   - Total Orders: ${total}`);
    console.log(`   - Published Orders: ${published}`);
    console.log(`   - Draft Orders: ${draft}`);
    console.log(`   - Admin Account: ${admin.email} (Password: Admin@12345)`);

    await mongoose.disconnect();
    console.log('[Seed] Completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedDatabase();
