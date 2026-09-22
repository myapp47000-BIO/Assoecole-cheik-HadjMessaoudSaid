// Database Keys
const DB_KEYS = {
    PARENTS: 'PARENTS_DATABASE',
    CURRENT_USER: 'CURRENT_USER_ID',
    ADMIN_EMAIL: 'biohadji@gmail.com'
};

// Student Levels
const STUDENT_LEVELS = {
    preparatory: 'التحضيري',
    1: 'السنة الأولى ابتدائي',
    2: 'السنة الثانية ابتدائي',
    3: 'السنة الثالثة ابتدائي',
    4: 'السنة الرابعة ابتدائي',
    5: 'السنة الخامسة ابتدائي'
};

// Books Data
const GRADES_DATA = {
    grade1: {
        name: 'السنة الأولى ابتدائي',
        icon: '1',
        color: '#e74c3c',
        supplies: [
            { text: 'كراسان (2) 64 ص: القسم والاختبارات + المحاولة', category: 'كراسات' },
            { text: 'كراس واحد (1) للرسم', category: 'كراسات' },
            { text: '3 أغلفة بلاستيكية للكراريس', category: 'أغلفة' },
            { text: 'أغلفة بلاستيكية للكتب', category: 'أغلفة' },
            { text: '1 لوحة + ممسحة', category: 'لوازم' },
            { text: '2 سيالتان: زرقاء وخضراء', category: 'مقلمة' },
            { text: 'قلم رصاص، مبراة، ممحاة', category: 'مقلمة' },
            { text: '1 علبة لـ 6 أقلام ملونة', category: 'مقلمة' },
            { text: '1 مسطرة', category: 'مقلمة' },
            { text: 'قريصات وخشيبيات', category: 'مقلمة' },
            { text: 'عجينة', category: 'مقلمة' },
            { text: 'أوراق ملونة', category: 'مقلمة' }
        ]
    },
    grade2: {
        name: 'السنة الثانية ابتدائي',
        icon: '2',
        color: '#e67e22',
        supplies: [
            { text: 'كراسان (2) 64 ص: القسم والاختبارات + المحاولة', category: 'كراسات' },
            { text: 'كراس واحد (1) للرسم', category: 'كراسات' },
            { text: '3 أغلفة بلاستيكية للكراريس', category: 'أغلفة' },
            { text: 'أغلفة بلاستيكية للكتب', category: 'أغلفة' },
            { text: '1 لوحة + ممسحة', category: 'لوازم' },
            { text: '2 سيالتان: زرقاء وخضراء', category: 'مقلمة' },
            { text: 'قلم رصاص، مبراة، ممحاة', category: 'مقلمة' },
            { text: '1 علبة لـ 6 أقلام ملونة', category: 'مقلمة' },
            { text: '1 مسطرة', category: 'مقلمة' },
            { text: 'قريصات وخشيبيات', category: 'مقلمة' },
            { text: 'عجينة', category: 'مقلمة' },
            { text: 'أوراق ملونة', category: 'مقلمة' }
        ]
    },
    grade3: {
        name: 'السنة الثالثة ابتدائي',
        icon: '3',
        color: '#f1c40f',
        supplies: [
            { text: '7 كراريس 64 ص: القسم والاختبارات (ل.عربية + رياضيات)', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة عربية ورياضيات', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة فرنسية', category: 'كراسات' },
            { text: 'كراس التربية الإسلامية', category: 'كراسات' },
            { text: 'كراس التاريخ', category: 'كراسات' },
            { text: 'كراسان (2) أعمال تطبيقية صغير: التربية العلمية والتكنولوجية', category: 'كراسات' },
            { text: 'كراس أعمال تطبيقية صغير: الرسم والمحفوظات', category: 'كراسات' },
            { text: '9 أغلفة بلاستيكية للكراريس', category: 'أغلفة' },
            { text: 'أغلفة بلاستيكية للكتب', category: 'أغلفة' },
            { text: 'لوحة + ممسحة', category: 'لوازم' },
            { text: 'سيالتان (2): زرقاء وخضراء', category: 'مقلمة' },
            { text: 'قلم رصاص، مبراة، ممحاة', category: 'مقلمة' },
            { text: 'علبة لـ 6 أقلام ملونة', category: 'مقلمة' },
            { text: '1 مسطرة', category: 'مقلمة' },
            { text: '1 كوس', category: 'مقلمة' }
        ]
    },
    grade4: {
        name: 'السنة الرابعة ابتدائي',
        icon: '4',
        color: '#27ae60',
        supplies: [
            { text: '10 كراريس 64 ص: القسم والاختبارات (ل.عربية + رياضيات)', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة أمازيغية', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة فرنسية', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة عربية ورياضيات', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة أمازيغية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة فرنسية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس التربية المدنية، التربية الإسلامية', category: 'كراسات' },
            { text: 'كراس للقواعد (نحوية، صرفية، إملائية)', category: 'كراسات' },
            { text: '3 كراريس أعمال تطبيقية صغير: التربية العلمية والتكنولوجية', category: 'كراسات' },
            { text: 'كراس أعمال تطبيقية صغير: التاريخ والجغرافيا', category: 'كراسات' },
            { text: 'كراس أعمال تطبيقية صغير: الرسم والمحفوظات (عربية، فرنسية، أمازيغية)', category: 'كراسات' },
            { text: '13 غلافاً بلاستيكياً للكراريس', category: 'أغلفة' },
            { text: 'أغلفة بلاستيكية للكتب', category: 'أغلفة' },
            { text: 'لوحة + ممسحة', category: 'لوازم' },
            { text: 'سيالتان (2): زرقاء وخضراء', category: 'مقلمة' },
            { text: 'قلم رصاص، مبراة، ممحاة', category: 'مقلمة' },
            { text: 'علبة لـ 6 أقلام ملونة', category: 'مقلمة' },
            { text: 'مسطرة', category: 'مقلمة' },
            { text: 'كوس', category: 'مقلمة' },
            { text: 'منقلة', category: 'مقلمة' },
            { text: 'مدور', category: 'مقلمة' }
        ]
    },
    grade5: {
        name: 'السنة الخامسة ابتدائي',
        icon: '5',
        color: '#9b59b6',
        supplies: [
            { text: '10 كراريس 64 ص: القسم والاختبارات (ل.عربية + رياضيات)', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة أمازيغية', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة فرنسية', category: 'كراسات' },
            { text: 'كراس القسم والاختبارات - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة عربية ورياضيات', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة أمازيغية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة فرنسية', category: 'كراسات' },
            { text: 'كراس النشاطات/المحاولة - لغة إنجليزية', category: 'كراسات' },
            { text: 'كراس التربية المدنية، التربية الإسلامية', category: 'كراسات' },
            { text: 'كراس للقواعد (نحوية، صرفية، إملائية)', category: 'كراسات' },
            { text: '3 كراريس أعمال تطبيقية صغير: التربية العلمية والتكنولوجية', category: 'كراسات' },
            { text: 'كراس أعمال تطبيقية صغير: التاريخ والجغرافيا', category: 'كراسات' },
            { text: 'كراس أعمال تطبيقية صغير: الرسم والمحفوظات (عربية، فرنسية، أمازيغية)', category: 'كراسات' },
            { text: '13 غلافاً بلاستيكياً للكراريس', category: 'أغلفة' },
            { text: 'أغلفة بلاستيكية للكتب', category: 'أغلفة' },
            { text: 'لوحة + ممسحة', category: 'لوازم' },
            { text: 'سيالتان (2): زرقاء وخضراء', category: 'مقلمة' },
            { text: 'قلم رصاص، مبراة، ممحاة', category: 'مقلمة' },
            { text: 'علبة لـ 6 أقلام ملونة', category: 'مقلمة' },
            { text: 'مسطرة', category: 'مقلمة' },
            { text: 'كوس', category: 'مقلمة' },
            { text: 'منقلة', category: 'مقلمة' },
            { text: 'مدور', category: 'مقلمة' }
        ]
    }
};

const ARCHIVE_DATA = [
    {
        year: '2026/2027',
        title: 'الموسم 2026-2027',
        color: '#f1c40f'
    },
    {
        year: '2025/2026',
        title: 'الموسم 2025-2026',
        color: '#27ae60'
    },
    {
        year: '2024/2025',
        title: 'الموسم 2024-2025',
        color: '#3498db'
    },
    {
        year: '2023/2024',
        title: 'الموسم 2023-2024',
        color: '#9b59b6'
    },
    {
        year: '2022/2023',
        title: 'الموسم 2022-2023',
        color: '#e67e22'
    }
];

const FB_PAGE_URL = 'https://www.facebook.com/Association.Ecole.AmiHamou';

const EDUCATION_SITES = [
    {
        title: 'قناة المعرفة الجزائرية',
        url: 'https://www.youtube.com/channel/UC9W9IXqClron-nyOVbiINwQ',
        description: 'المنبر التعليمي الأول للتلاميذ - بث مباشر للدروس',
        icon: '📺',
        color: '#1a5276'
    },
    {
        title: 'المعلم إلياس شراد',
        url: 'https://www.youtube.com/@LyesCherrad',
        description: 'دروس تعليمية للمرحلة الابتدائية - اللغة العربية والرياضيات',
        icon: '👨‍🏫',
        color: '#27ae60'
    },
    {
        title: 'قناة الناجحون',
        url: 'https://www.youtube.com/@channelynaghoune',
        description: 'دروس وتمارين للمرحلة الابتدائية',
        icon: '📚',
        color: '#e67e22'
    },
    {
        title: 'تعلّم بلس',
        url: 'https://learn-plus.com/',
        description: 'منصة تعليمية رائدة - دروس من الابتدائي حتى البكالوريا',
        icon: '💻',
        color: '#8e44ad'
    },
    {
        title: 'نجمتي',
        url: 'https://nedjmati.com/',
        description: 'تطبيق تعليمي للأطفال - المنهج الجزائري',
        icon: '⭐',
        color: '#e74c3c'
    },
    {
        title: 'قلم الجزائر',
        url: 'https://www.dzpen.com/',
        description: 'منصة اجتماعية للمحتوى التعليمي - جميع الأطوار',
        icon: '📝',
        color: '#3498db'
    },
    {
        title: 'المنصة الوطنية للتعليم عن بُعد',
        url: 'https://www.education.gov.dz/%d9%81%d8%b6%d8%a7%d8%a1%d8%a7%d8%aa-%d8%a5%d9%84%d9%83%d8%aa%d8%b1%d9%88%d9%86%d9%8a%d8%a9/%d8%a7%d9%84%d8%aa%d8%b9%d9%84%d9%8a%d9%85-%d8%b9%d9%86-%d8%a8%d8%b9%d8%af/',
        description: 'منصة الوزارة للتعليم عن بُعد',
        icon: '🏫',
        color: '#1a5276'
    }
];

const EDUCATION_VIDEOS = [
    {
        title: 'السنة الأولى ابتدائي - اللغة العربية',
        channel: 'قناة المعرفة الجزائرية',
        url: 'https://www.youtube.com/watch?v=EFgWmHfHZZ4',
        thumbnail: 'https://img.youtube.com/vi/EFgWmHfHZZ4/mqdefault.jpg',
        description: 'دروس الدعم للسنة الأولى ابتدائي - اللغة العربية',
        cycle: 'الطور الأول',
        level: 'السنة الأولى',
        subject: 'اللغة العربية'
    },
    {
        title: 'السنة الأولى ابتدائي - الرياضيات',
        channel: 'المعلم إلياس شراد',
        url: 'https://www.youtube.com/watch?v=_VD0JJM5lic',
        thumbnail: 'https://img.youtube.com/vi/_VD0JJM5lic/mqdefault.jpg',
        description: 'أدعم وأقوم - المقطع 3 الصفحة 26 السنة الأولى ابتدائي',
        cycle: 'الطور الأول',
        level: 'السنة الأولى',
        subject: 'الرياضيات'
    },
    {
        title: 'السنة الثانية ابتدائي - اللغة العربية',
        channel: 'قناة الناجحون',
        url: 'https://www.youtube.com/watch?v=3L6is_5Qeuc',
        thumbnail: 'https://img.youtube.com/vi/3L6is_5Qeuc/mqdefault.jpg',
        description: 'تطبيقات الفصل الأول - السنة الثانية ابتدائي',
        cycle: 'الطور الأول',
        level: 'السنة الثانية',
        subject: 'اللغة العربية'
    },
    {
        title: 'السنة الثالثة ابتدائي - اللغة العربية',
        channel: 'المعلم إلياس شراد',
        url: 'https://www.youtube.com/watch?v=kH5DhFW3TZY',
        thumbnail: 'https://img.youtube.com/vi/kH5DhFW3TZY/mqdefault.jpg',
        description: 'دروس الدعم لعطلة الشتاء - اللغة العربية',
        cycle: 'الطور الثاني',
        level: 'السنة الثالثة',
        subject: 'اللغة العربية'
    },
    {
        title: 'السنة الرابعة ابتدائي - اللغة العربية',
        channel: 'المعلم إلياس شراد',
        url: 'https://www.youtube.com/watch?v=mOFndrv1u_4',
        thumbnail: 'https://img.youtube.com/vi/mOFndrv1u_4/mqdefault.jpg',
        description: 'دعم ومراجعة شاملة لمشكلات الفصل الأول',
        cycle: 'الطور الثاني',
        level: 'السنة الرابعة',
        subject: 'اللغة العربية'
    },
    {
        title: 'السنة الخامسة ابتدائي - الرياضيات',
        channel: 'المعلم إلياس شراد',
        url: 'https://www.youtube.com/watch?v=swZAFTMVhn0',
        thumbnail: 'https://img.youtube.com/vi/swZAFTMVhn0/mqdefault.jpg',
        description: 'دروس الدعم - الأسنان',
        cycle: 'الطور الثاني',
        level: 'السنة الخامسة',
        subject: 'الرياضيات'
    }
];

const FACEBOOK_POSTS_MOCK = [
    {
        id: 1,
        content: '📢 إعلان هام: يُُعلم أولياء التلاميذ بأن الموسم الدراسي الجديد سيبدأ يوم الاثنين 21 سبتمبر 2026. يُرجى التأكد من تجهيز الأدوات المدرسية المطلوبة حسب المستوى.',
        date: '2026-09-05',
        url: 'https://www.facebook.com/share/p/18PcCdETFY/',
        likes: 45,
        comments: 12,
        shares: 8
    },
    {
        id: 2,
        content: '📚 تم نشر قائمة الكتب المدرسية للموسم 2026/2027. يمكنكم الاطلاع عليها من تطبيق الجمعية.',
        date: '2026-09-03',
        url: 'https://www.facebook.com/share/p/1JMxvmqJTc/',
        likes: 32,
        comments: 8,
        shares: 5
    },
    {
        id: 3,
        content: '🤝 اجتماع اللجنة الإدارية للجمعية لمناقشة برنامج النشاطات للفصل الثاني.',
        date: '2026-09-01',
        url: 'https://www.facebook.com/share/p/1CofBWRCj4/',
        likes: 23,
        comments: 5,
        shares: 3
    },
    {
        id: 4,
        content: '🎉 مبروك لتخريج الدفعة الجديدة من تلاميذ السنة الخامسة ابتدائي. نتمنى لهم مسيرة موفقة في الثانوي.',
        date: '2026-06-28',
        url: 'https://www.facebook.com/share/p/1EQ6cmxELh/',
        likes: 78,
        comments: 23,
        shares: 15
    },
    {
        id: 5,
        content: '📸 صور من اليوم المفتوح الذي نظّمته الجمعية بمناسبة اليوم العالمي للتعليم. شكرا لكل الحاضرين.',
        date: '2026-04-05',
        url: 'https://www.facebook.com/share/p/1Hj2fSMpRq/',
        likes: 56,
        comments: 18,
        shares: 10
    },
    {
        id: 6,
        content: '🤝 اجتماع اللجنة الإدارية لمناقشة ميزانية الموسم 2025/2026.',
        date: '2026-01-15',
        url: 'https://www.facebook.com/share/p/19j54bbqhT/',
        likes: 23,
        comments: 5,
        shares: 3
    },
    {
        id: 7,
        content: '🏫 توزيع الشهادات على التلاميذ المتميزين في نهاية الموسم 2025/2026.',
        date: '2025-06-25',
        url: 'https://www.facebook.com/share/p/1BQQHPmVT8/',
        likes: 65,
        comments: 20,
        shares: 12
    },
    {
        id: 8,
        content: '🧹 حملة نظافة المدرسة بمشاركة الأولياء والتلاميذ.',
        date: '2025-11-10',
        url: 'https://www.facebook.com/share/p/1HH4rATxCR/',
        likes: 42,
        comments: 10,
        shares: 7
    },
    {
        id: 9,
        content: '⚽ البطولة الرياضية بين التلاميذ - نتائج المسابقة.',
        date: '2025-04-20',
        url: 'https://www.facebook.com/share/p/1Bu9pPxVYr/',
        likes: 55,
        comments: 15,
        shares: 8
    },
    {
        id: 10,
        content: '🏗️ مشروع ترميم فصل دراسي جديد بمساعدة الأولياء.',
        date: '2024-10-05',
        url: 'https://www.facebook.com/share/p/19P5bmQoYa/',
        likes: 48,
        comments: 12,
        shares: 9
    },
    {
        id: 11,
        content: '📚 ورشة تعليمية حول أهمية القراءة لدى التلاميذ.',
        date: '2024-03-15',
        url: 'https://www.facebook.com/share/p/1JSpq9Zyjy/',
        likes: 35,
        comments: 8,
        shares: 5
    },
    {
        id: 12,
        content: '🏗️ بناء السور الجديد للمدرسة بمساهمة الأولياء.',
        date: '2023-02-15',
        url: 'https://www.facebook.com/share/p/1Dvq4ZEv19/',
        likes: 52,
        comments: 14,
        shares: 11
    },
    {
        id: 13,
        content: '🎨 تحسين مرافق المدرسة وطلائها.',
        date: '2023-04-10',
        url: 'https://www.facebook.com/share/p/1EcQLQ6n8m/',
        likes: 38,
        comments: 9,
        shares: 6
    },
    {
        id: 14,
        content: '📢 اجتماع تأسيسي للجمعية مع أولياء التلاميذ.',
        date: '2022-10-20',
        url: 'https://www.facebook.com/share/p/1EqcTWcpux/',
        likes: 30,
        comments: 7,
        shares: 4
    },
    {
        id: 15,
        content: '🏫 إعداد الحفل الختامي للفصل الأول.',
        date: '2022-12-15',
        url: 'https://www.facebook.com/share/p/1DfZHGMtkA/',
        likes: 40,
        comments: 11,
        shares: 6
    },
    {
        id: 16,
        content: '📚 توزيع الكتب المدرسية على التلاميذ المحتاجين.',
        date: '2022-09-25',
        url: 'https://www.facebook.com/share/p/1CQ6FL3gay/',
        likes: 50,
        comments: 13,
        shares: 9
    },
    {
        id: 17,
        content: '🎨 مسابقة رسم بمناسبة اليوم العالمي للطفولة.',
        date: '2022-11-20',
        url: 'https://www.facebook.com/share/p/1DagAvb8Yo/',
        likes: 45,
        comments: 10,
        shares: 7
    },
    {
        id: 18,
        content: '🤝 لقاء تواصلي بين الأساتذة والأولياء.',
        date: '2022-10-10',
        url: 'https://www.facebook.com/share/p/1D3QvWcsSn/',
        likes: 28,
        comments: 6,
        shares: 3
    },
    {
        id: 19,
        content: '⚽ البطولة الرياضية الصيفية.',
        date: '2022-05-15',
        url: 'https://www.facebook.com/share/p/19W7JBD8Es/',
        likes: 55,
        comments: 15,
        shares: 8
    },
    {
        id: 20,
        content: '🏗️ مشروع تطوير فضاء اللعب بالمدرسة.',
        date: '2022-04-10',
        url: 'https://www.facebook.com/share/p/1Bc5CR2cac/',
        likes: 42,
        comments: 10,
        shares: 7
    },
    {
        id: 21,
        content: '📚 حملة توعوية بأهمية القراءة.',
        date: '2022-03-05',
        url: 'https://www.facebook.com/share/p/197Wfyqm8G/',
        likes: 35,
        comments: 8,
        shares: 5
    },
    {
        id: 22,
        content: '🎨 معرض أعمال التلاميذ.',
        date: '2022-02-20',
        url: 'https://www.facebook.com/share/p/1DJYNmUCnZ/',
        likes: 48,
        comments: 12,
        shares: 9
    },
    {
        id: 23,
        content: '🤝 نشاط تطوعي لتحسين المرافق المدرسية.',
        date: '2022-01-15',
        url: 'https://www.facebook.com/share/p/19MQ2Yk2MS/',
        likes: 32,
        comments: 7,
        shares: 4
    },
    {
        id: 24,
        content: '🏫 احتفال بعيد المعلم.',
        date: '2022-03-20',
        url: 'https://www.facebook.com/share/p/1F4AeeYCnP/',
        likes: 60,
        comments: 18,
        shares: 10
    },
    {
        id: 25,
        content: '📚 ورشة في العلوم للتلاميذ.',
        date: '2022-04-25',
        url: 'https://www.facebook.com/share/p/1CqvHQVNAg/',
        likes: 38,
        comments: 9,
        shares: 6
    },
    {
        id: 26,
        content: '🎨 يوم ترفيهي للتلاميذ.',
        date: '2022-06-10',
        url: 'https://www.facebook.com/share/p/1DgepJbyjK/',
        likes: 52,
        comments: 14,
        shares: 8
    },
    {
        id: 27,
        content: '🏗️ تركيب معدات اللعب الجديدة.',
        date: '2022-05-20',
        url: 'https://www.facebook.com/share/p/1GEvso192q/',
        likes: 45,
        comments: 11,
        shares: 7
    },
    {
        id: 28,
        content: '🤝 اجتماع المكتب المسير للجمعية.',
        date: '2022-09-10',
        url: 'https://www.facebook.com/share/p/1CBNUnj8XC/',
        likes: 25,
        comments: 5,
        shares: 3
    },
    {
        id: 29,
        content: '🏫 استقبال السنة الدراسية الجديدة 2022/2023.',
        date: '2022-09-01',
        url: 'https://www.facebook.com/share/p/1MFgu1nFiC/',
        likes: 70,
        comments: 20,
        shares: 12
    },
    {
        id: 30,
        content: '📸 لقطات من حفل نهاية الموسم 2021/2022.',
        date: '2022-06-28',
        url: 'https://www.facebook.com/share/p/1D5sx5aZzA/',
        likes: 65,
        comments: 18,
        shares: 11
    }
];

const NOTIFICATIONS_KEY = 'school_notifications';
const SUPPLIES_KEY = 'school_supplies';
const ADMIN_KEY = 'school_admin_auth';
const CHECKED_ITEMS_KEY = 'checked_supply_items';
const FB_POSTS_KEY = 'school_fb_posts';

const GITHUB_CONFIG = {
    owner: 'myapp47000-BIO',
    repo: 'Assoecole-cheik-HadjMessaoudSaid',
    apiBase: 'https://api.github.com/repos/myapp47000-BIO/Assoecole-cheik-HadjMessaoudSaid/contents',
    rawBase: 'https://myapp47000-bio.github.io/Assoecole-cheik-HadjMessaoudSaid/'
};

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'amihamou2026'
};

// Books Data - الديوان الوطني للمطبوعات المدرسية
const BOOKS_DATA = {
    preparatory: {
        name: 'الطور التحضيري',
        total: 360,
        books: [
            { code: '001', title: 'دفتر الأنشطة للقراءة العربية', price: 180 },
            { code: '002', title: 'دفتر الأنشطة للرياضيات', price: 180 }
        ]
    },
    grade1: {
        name: 'السنة الأولى ابتدائي',
        total: 910,
        books: [
            { code: '0101', title: 'كتابي في اللغة العربية والتربية الإسلامية والتربية المدنية', price: 260 },
            { code: '0102', title: 'كتابي في الرياضيات والتربية العلمية والتكنولوجية', price: 260 },
            { code: '0103', title: 'دفتر الأنشطة في اللغة العربية والتربية الإسلامية والتربية المدنية', price: 180 },
            { code: '0104', title: 'دفتر الأنشطة في الرياضيات والتربية العلمية والتكنولوجية', price: 210 }
        ]
    },
    grade2: {
        name: 'السنة الثانية ابتدائي',
        total: 1000,
        books: [
            { code: '0201', title: 'كتابي في اللغة العربية والتربية الإسلامية والتربية المدنية', price: 280 },
            { code: '0202', title: 'كتابي في الرياضيات والتربية العلمية والتكنولوجية', price: 280 },
            { code: '0203', title: 'دفتر الأنشطة في اللغة العربية والتربية الإسلامية والتربية المدنية', price: 230 },
            { code: '0204', title: 'دفتر الأنشطة في الرياضيات والتربية العلمية والتكنولوجية', price: 210 }
        ]
    },
    grade3: {
        name: 'السنة الثالثة ابتدائي',
        total: 1910,
        books: [
            { code: '0301', title: 'القراءة العربية', price: 230 },
            { code: '0302', title: 'الرياضيات', price: 215 },
            { code: '0303', title: 'التربية العلمية والتكنولوجية', price: 215 },
            { code: '0304', title: 'التاريخ والجغرافيا', price: 190 },
            { code: '0305', title: 'التربية الإسلامية', price: 180 },
            { code: '0306', title: 'الفرنسية', price: 215 },
            { code: '0307', title: 'كراس النشاطات في اللغة العربية', price: 215 },
            { code: '0308', title: 'كراس النشاطات في الرياضيات', price: 180 },
            { code: '0309', title: 'كراس النشاطات فرنسية', price: 180 },
            { code: '0314', title: 'التربية المدنية', price: 90 }
        ]
    },
    grade4: {
        name: 'السنة الرابعة ابتدائي',
        total: 2300,
        books: [
            { code: '0401', title: 'اللغة العربية', price: 240 },
            { code: '0402', title: 'الرياضيات', price: 210 },
            { code: '0403', title: 'التربية العلمية والتكنولوجية', price: 220 },
            { code: '0404', title: 'التاريخ والجغرافيا', price: 210 },
            { code: '0405', title: 'التربية الإسلامية', price: 180 },
            { code: '0406', title: 'الفرنسية', price: 210 },
            { code: '0408', title: 'الأمازيغية', price: 300 },
            { code: '0410', title: 'كراس النشاطات فرنسية', price: 210 },
            { code: '0411', title: 'كراس النشاطات في اللغة العربية', price: 210 },
            { code: '0412', title: 'كراس النشاطات في الرياضيات', price: 220 },
            { code: '0414', title: 'التربية المدنية', price: 90 }
        ]
    },
    grade5: {
        name: 'السنة الخامسة ابتدائي',
        total: 2800,
        books: [
            { code: '0501', title: 'القراءة العربية', price: 260 },
            { code: '0502', title: 'الرياضيات', price: 230 },
            { code: '0503', title: 'التربية العلمية والتكنولوجية', price: 230 },
            { code: '0505', title: 'التربية الإسلامية', price: 220 },
            { code: '0506', title: 'الفرنسية', price: 250 },
            { code: '0507', title: 'الأمازيغية', price: 300 },
            { code: '508/07', title: 'التاريخ', price: 190 },
            { code: '509/07', title: 'الجغرافيا', price: 210 },
            { code: '0510', title: 'كراس النشاطات فرنسية', price: 250 },
            { code: '0511', title: 'كراس النشاطات اللغوية', price: 220 },
            { code: '0512', title: 'كراس الأنشطة في رياضيات', price: 220 },
            { code: '0514', title: 'التربية المدنية', price: 220 }
        ]
    }
};
