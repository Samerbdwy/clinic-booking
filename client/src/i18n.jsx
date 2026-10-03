import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const dict = {
  en: {
    clinicName: 'Smile Dental Clinic',
    navServices: 'Services',
    navDoctors: 'Doctors',
    navBook: 'Book',
    navContact: 'Contact',
    switchLang: 'العربية',
    heroTitle: 'Healthy smiles, booked in a minute.',
    heroSub: 'Choose your doctor, pick a time that suits you, and book online. No phone calls, no waiting.',
    heroCta: 'Book an appointment',
    heroNote: 'Open Saturday to Thursday, 10:00 to 17:00',
    servicesTitle: 'Our services',
    services: {
      checkup: ['Check-up', 'A full exam and a clear plan for your teeth.'],
      cleaning: ['Cleaning', 'Professional scaling and polishing.'],
      whitening: ['Whitening', 'A brighter smile, safely.'],
      braces: ['Braces', 'Straighter teeth with modern orthodontics.'],
      implants: ['Implants', 'Natural-looking replacements that last.'],
      emergency: ['Emergency visit', 'Pain or a broken tooth? We will see you quickly.'],
    },
    doctorsTitle: 'Meet the doctors',
    doctorsEmpty: 'Doctors will appear here once the clinic adds them.',
    bookTitle: 'Book your appointment',
    bookSub: 'It takes less than a minute. We will confirm by phone or WhatsApp.',
    fService: 'Service',
    fDoctor: 'Doctor',
    fDate: 'Date',
    fTime: 'Time',
    fName: 'Full name',
    fPhone: 'Phone number',
    fNotes: 'Notes (optional)',
    choose: 'Choose...',
    pickDateFirst: 'Pick a doctor and a date to see available times.',
    loadingSlots: 'Loading times...',
    noSlots: 'No free times on this day. Please try another date.',
    closedFriday: 'The clinic is closed on Fridays.',
    submit: 'Request appointment',
    sending: 'Sending...',
    successTitle: 'Request received',
    successText: 'Thank you. We will contact you to confirm your appointment.',
    successSummary: 'Your request',
    whatsappBtn: 'Confirm on WhatsApp',
    newBooking: 'Book another appointment',
    errGeneric: 'Something went wrong. Please try again.',
    errName: 'Please enter your full name.',
    errPhone: 'Please enter a valid phone number.',
    errMissing: 'Please fill in all the required fields.',
    contactTitle: 'Visit or call us',
    contactHours: 'Saturday to Thursday, 10:00 to 17:00. Closed on Friday.',
    contactPhone: 'Phone',
    footer: 'Demo website. All names and numbers are samples.',
    waMessage: (n, d, t) => `Hello, this is ${n}. I requested an appointment on ${d} at ${t}.`,
  },
  ar: {
    clinicName: 'عيادة سمايل لطب الأسنان',
    navServices: 'الخدمات',
    navDoctors: 'الأطباء',
    navBook: 'احجز',
    navContact: 'تواصل معنا',
    switchLang: 'English',
    heroTitle: 'ابتسامة صحية، وحجزك في دقيقة.',
    heroSub: 'اختر طبيبك وحدد الموعد المناسب واحجز أونلاين. بدون مكالمات وبدون انتظار.',
    heroCta: 'احجز موعدك',
    heroNote: 'نعمل من السبت إلى الخميس، من 10:00 إلى 17:00',
    servicesTitle: 'خدماتنا',
    services: {
      checkup: ['كشف وفحص', 'فحص شامل وخطة واضحة لأسنانك.'],
      cleaning: ['تنظيف الأسنان', 'تنظيف وتلميع احترافي.'],
      whitening: ['تبييض الأسنان', 'ابتسامة أكثر إشراقًا وبأمان.'],
      braces: ['تقويم الأسنان', 'أسنان أكثر انتظامًا بأحدث طرق التقويم.'],
      implants: ['زراعة الأسنان', 'بدائل طبيعية المظهر تدوم طويلًا.'],
      emergency: ['حالة طارئة', 'ألم أو سن مكسور؟ سنستقبلك بسرعة.'],
    },
    doctorsTitle: 'تعرّف على الأطباء',
    doctorsEmpty: 'سيظهر الأطباء هنا بعد أن تضيفهم العيادة.',
    bookTitle: 'احجز موعدك',
    bookSub: 'يستغرق أقل من دقيقة. سنؤكد معك بالهاتف أو واتساب.',
    fService: 'الخدمة',
    fDoctor: 'الطبيب',
    fDate: 'التاريخ',
    fTime: 'الوقت',
    fName: 'الاسم بالكامل',
    fPhone: 'رقم الهاتف',
    fNotes: 'ملاحظات (اختياري)',
    choose: 'اختر...',
    pickDateFirst: 'اختر الطبيب والتاريخ لعرض المواعيد المتاحة.',
    loadingSlots: 'جارٍ تحميل المواعيد...',
    noSlots: 'لا توجد مواعيد متاحة في هذا اليوم. جرّب تاريخًا آخر.',
    closedFriday: 'العيادة مغلقة يوم الجمعة.',
    submit: 'اطلب الموعد',
    sending: 'جارٍ الإرسال...',
    successTitle: 'تم استلام طلبك',
    successText: 'شكرًا لك. سنتواصل معك لتأكيد الموعد.',
    successSummary: 'تفاصيل طلبك',
    whatsappBtn: 'أكّد عبر واتساب',
    newBooking: 'احجز موعدًا آخر',
    errGeneric: 'حدث خطأ ما. حاول مرة أخرى.',
    errName: 'من فضلك اكتب اسمك بالكامل.',
    errPhone: 'من فضلك اكتب رقم هاتف صحيح.',
    errMissing: 'من فضلك املأ جميع الحقول المطلوبة.',
    contactTitle: 'زرنا أو اتصل بنا',
    contactHours: 'من السبت إلى الخميس، من 10:00 إلى 17:00. مغلق يوم الجمعة.',
    contactPhone: 'الهاتف',
    footer: 'موقع تجريبي. جميع الأسماء والأرقام أمثلة.',
    waMessage: (n, d, t) => `مرحبًا، أنا ${n}. طلبت موعدًا يوم ${d} الساعة ${t}.`,
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'ar' || saved === 'en') return saved;
    } catch { /* storage unavailable */ }
    return navigator.language?.startsWith('ar') ? 'ar' : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch { /* ignore */ }
  }, [lang]);

  const value = useMemo(
    () => ({ lang, isAr: lang === 'ar', t: dict[lang], toggle: () => setLang((l) => (l === 'ar' ? 'en' : 'ar')) }),
    [lang]
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
