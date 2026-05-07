import React, { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const icons = {
  book: "📚",
  chat: "💬",
  cap: "🎓",
  plane: "✈️",
  work: "💼",
  sparkle: "✨",
  check: "✓",
  video: "💻",
  target: "🎯",
  brain: "🧠",
  globe: "🌍",
  pen: "✍️",
  star: "★",
  clock: "⏱️",
  heart: "🤝",
  send: "➤",
  menu: "☰",
  close: "×",
  down: "⌄",
  quote: "“",
  headphones: "🎧",
  smile: "😊",
  rocket: "🚀",
  instagram: "📷",
  mail: "✉️",
  telegram: "✈",
  whatsapp: "☘",
  flagUk: "🇬🇧",
  flagDe: "🇩🇪",
};

const site = {
  en: {
    logo: "Anastasia English",
    subject: "английский онлайн",
    langLabel: "Английский",
    langIcon: "EN",
    hero: {
      headline: "Английский язык онлайн — понятно, интересно и с результатом",
      subtitle:
        "Индивидуальные онлайн-занятия по английскому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, разговорную практику и уверенность в речи.",
      primary: "Записаться на бесплатный пробный урок",
      secondary: "Посмотреть программу",
      trust: "Индивидуальный подход • Онлайн-формат • Понятные объяснения • Практика с первого урока",
      mini: [
        ["chat", "Говорим с первого урока", "Диалоги, вопросы, реальные ситуации и мягкая коррекция ошибок."],
        ["brain", "Грамматика понятно", "Без сложных терминов — с примерами, схемами и практикой."],
        ["book", "Лексика для жизни", "Слова и фразы, которые действительно пригодятся."],
        ["target", "План под вашу цель", "Школа, учёба, работа, путешествия или разговорная практика."],
      ],
    },
    aboutText:
      "Меня зовут Anastasia, я репетитор по английскому языку. Я помогаю ученикам разобраться в грамматике, расширить словарный запас и начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем английский в реальных ситуациях.",
    audience: [
      ["Школьники", "Помощь с домашними заданиями, грамматикой, словарным запасом и подготовкой к контрольным.", "cap"],
      ["Студенты", "Английский для учёбы, презентаций, экзаменов и академической коммуникации.", "book"],
      ["Взрослые", "Английский для работы, путешествий, повседневного общения и уверенности в речи.", "work"],
      ["Начинающие", "Спокойный старт без стресса: объясняем базу простым языком и сразу практикуем.", "smile"],
      ["Продолжающие", "Расширение словарного запаса, повторение грамматики и развитие разговорных навыков.", "rocket"],
    ],
    vocabTitle: "Лексика, которую вы действительно будете использовать",
    vocabText:
      "Мы изучаем слова через ситуации, примеры и разговорную практику, чтобы новая лексика не оставалась только в тетради.",
    vocabCards: [
      ["Travel English", "Аэропорт, отель, кафе, маршрут, вопросы в поездке.", "plane"],
      ["Business English", "Работа, встречи, письма, презентации и small talk.", "work"],
      ["Everyday English", "Фразы для общения, покупок, звонков и переписки.", "chat"],
      ["School English", "Слова и выражения для школы, заданий и контрольных.", "cap"],
      ["Useful Phrases", "Готовые фразы, которые легко применять в речи.", "sparkle"],
    ],
    grammarTitle: "Грамматика без страха и путаницы",
    grammarText:
      "Мы разбираем грамматику простым языком, на понятных примерах и сразу тренируем её в речи и письме.",
    grammarTopics: [
      "Времена английского языка",
      "Артикли",
      "Модальные глаголы",
      "Условные предложения",
      "Порядок слов",
      "Вопросы и отрицания",
      "Предлоги",
      "Типичные ошибки русскоговорящих учеников",
    ],
    speakingTitle: "Учимся говорить, а не только вспоминать правила",
    speakingCallout: "Главная цель — не просто знать английский, а уметь им пользоваться.",
    speakingItems: [
      "Диалоги из реальной жизни",
      "Ролевые ситуации",
      "Вопросы и ответы",
      "Тренировка произношения",
      "Развитие уверенности",
      "Исправление ошибок без давления",
    ],
    formatTitle: "Онлайн-уроки, которые удобно встроить в ваш график",
    formatText:
      "Все занятия проходят онлайн в удобном формате. Один урок длится 60 минут. На первом бесплатном пробном занятии мы определим ваш уровень, обсудим цели и подберём подходящий план обучения.",
    miniCards: [
      ["Word", "confidence", "Перевод: уверенность", "I want to speak English with confidence."],
      ["Grammar", "Present Perfect", "Пример", "I have already finished my homework."],
      ["Phrase", "Could you repeat that, please?", "Перевод", "Не могли бы вы повторить, пожалуйста?"],
    ],
    priceTitle: "Стоимость занятий",
    priceText: "Первый урок бесплатно. После пробного занятия вы сможете спокойно решить, подходит ли вам формат.",
    prices: [
      ["Бесплатный пробный урок", "0 ₽", "На пробном занятии мы познакомимся, определим ваш уровень английского, обсудим цели и составим индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["Индивидуальный онлайн-урок", "1400 ₽ / 60 минут", "Полноценное индивидуальное занятие онлайн с объяснением грамматики, расширением словарного запаса, разговорной практикой и обратной связью.", "Записаться на урок", "Стандартный формат"],
      ["Абонемент 2 раза в неделю", "1200 ₽ / 60 минут", "Выгодный формат для стабильного прогресса: две индивидуальные онлайн-встречи в неделю, регулярная практика и контроль результата.", "Выбрать абонемент", "Выгоднее при регулярных занятиях"],
    ],
    testimonials: [
      "После занятий я наконец-то понял времена и стал увереннее говорить.",
      "Очень понятные объяснения и приятная атмосфера на уроках.",
      "Мне нравится, что мы много практикуем лексику и реальные диалоги.",
    ],
    footerSubject: "Английский язык онлайн",
  },
  de: {
    logo: "Anastasia Deutsch",
    subject: "немецкий онлайн",
    langLabel: "Немецкий",
    langIcon: "DE",
    hero: {
      headline: "Немецкий язык онлайн — спокойно, понятно и с результатом",
      subtitle:
        "Индивидуальные онлайн-занятия по немецкому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, произношение, разговорную практику и уверенность в речи.",
      primary: "Записаться на бесплатный пробный урок",
      secondary: "Посмотреть программу",
      trust: "Индивидуальный подход • Онлайн-формат • Понятные объяснения • Практика с первого урока",
      mini: [
        ["chat", "Говорим с первого урока", "Диалоги, вопросы, повседневные ситуации и мягкая коррекция ошибок."],
        ["brain", "Грамматика понятно", "Падежи, артикли и порядок слов — простым языком и на примерах."],
        ["book", "Лексика для жизни", "Слова и фразы для учёбы, работы, поездок и общения."],
        ["target", "План под вашу цель", "Школа, экзамены, переезд, работа, путешествия или старт с нуля."],
      ],
    },
    aboutText:
      "Меня зовут Anastasia, я репетитор по немецкому языку. Я помогаю ученикам разобраться в грамматике, пополнить словарный запас и постепенно начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем немецкий в реальных ситуациях.",
    audience: [
      ["Школьники", "Помощь с домашними заданиями, грамматикой, словарным запасом и подготовкой к контрольным.", "cap"],
      ["Студенты", "Немецкий для учёбы, презентаций, экзаменов и академической коммуникации.", "book"],
      ["Взрослые", "Немецкий для работы, путешествий, переезда, повседневного общения и уверенности в речи.", "work"],
      ["Начинающие", "Спокойный старт без стресса: алфавит, чтение, базовая грамматика и первые фразы.", "smile"],
      ["Продолжающие", "Повторение грамматики, расширение словаря и развитие разговорных навыков.", "rocket"],
    ],
    vocabTitle: "Немецкая лексика, которую легко применять в жизни",
    vocabText:
      "Мы учим слова через темы, примеры и живые ситуации, чтобы новая лексика быстро переходила в активную речь.",
    vocabCards: [
      ["Deutsch für Reisen", "Вокзал, аэропорт, отель, кафе, маршрут и вопросы в поездке.", "plane"],
      ["Deutsch für Arbeit", "Работа, письма, встречи, собеседования и деловое общение.", "work"],
      ["Alltagsdeutsch", "Повседневные фразы для магазина, врача, переписки и разговоров.", "chat"],
      ["Schuldeutsch", "Лексика для школы, домашних заданий, контрольных и экзаменов.", "cap"],
      ["Nützliche Redemittel", "Готовые выражения, которые помогают говорить увереннее.", "sparkle"],
    ],
    grammarTitle: "Немецкая грамматика без паники",
    grammarText:
      "Мы разбираем грамматику простым языком: на понятных схемах, коротких примерах и практических упражнениях.",
    grammarTopics: [
      "Артикли der, die, das",
      "Падежи Nominativ, Akkusativ, Dativ, Genitiv",
      "Порядок слов в предложении",
      "Спряжение глаголов",
      "Модальные глаголы",
      "Времена Präsens, Perfekt, Präteritum",
      "Предлоги с падежами",
      "Типичные ошибки русскоговорящих учеников",
    ],
    speakingTitle: "Немецкий для реального общения",
    speakingCallout: "Главная цель — не просто знать немецкий, а уметь пользоваться им в жизни.",
    speakingItems: [
      "Диалоги из повседневной жизни",
      "Ролевые ситуации: магазин, кафе, поездка, учёба, работа",
      "Вопросы и ответы",
      "Тренировка произношения",
      "Развитие уверенности",
      "Исправление ошибок без давления",
    ],
    formatTitle: "Удобный онлайн-формат для изучения немецкого",
    formatText:
      "Все занятия проходят онлайн. Один урок длится 60 минут. На первом бесплатном пробном занятии мы определим ваш уровень, обсудим цели и подберём подходящий план обучения немецкому языку.",
    miniCards: [
      ["Wort", "die Sicherheit", "Перевод: уверенность, безопасность", "Ich möchte mit Sicherheit Deutsch sprechen."],
      ["Grammatik", "Perfekt", "Пример", "Ich habe meine Hausaufgaben gemacht."],
      ["Redemittel", "Könnten Sie das bitte wiederholen?", "Перевод", "Не могли бы Вы повторить, пожалуйста?"],
    ],
    priceTitle: "Стоимость занятий",
    priceText: "Первый урок бесплатно. После пробного занятия вы сможете спокойно решить, подходит ли вам формат.",
    prices: [
      ["Бесплатный пробный урок", "0 ₽", "На пробном занятии мы познакомимся, определим ваш уровень немецкого, обсудим цели и составим индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["Индивидуальный онлайн-урок", "1000 ₽ / 60 минут", "Полноценное индивидуальное занятие онлайн с объяснением грамматики, расширением словарного запаса, разговорной практикой и обратной связью.", "Записаться на урок", "Стандартный формат"],
      ["Абонемент 2 раза в неделю", "800 ₽ / 60 минут", "Выгодный формат для регулярного прогресса: две индивидуальные онлайн-встречи в неделю, повторение, практика и контроль результата.", "Выбрать абонемент", "Выгоднее при регулярных занятиях"],
    ],
    testimonials: [
      "После занятий я наконец-то разобрался с артиклями и падежами.",
      "Очень спокойные объяснения и дружелюбная атмосфера на уроках.",
      "Мне нравится, что мы много говорим и сразу используем новые немецкие слова.",
    ],
    footerSubject: "Немецкий язык онлайн",
  },
};

const shared = {
  benefits: [
    "Индивидуальный подход",
    "Простые объяснения",
    "Практика на каждом уроке",
    "Современные материалы",
    "Удобный онлайн-формат",
    "Поддержка между занятиями",
    "Работа с реальными жизненными ситуациями",
    "Спокойная и дружелюбная атмосфера",
    "Фокус на конкретный результат",
  ],
  results: [
    "увереннее говорить на иностранном языке",
    "лучше понимать грамматику",
    "использовать новые слова в речи",
    "понимать тексты и аудио",
    "писать более грамотно",
    "меньше бояться ошибок",
    "подготовиться к контрольным, экзаменам, путешествиям или рабочим ситуациям",
  ],
  faqs: [
    ["С какого уровня можно начать?", "Начать можно с любого уровня: с нуля, после большого перерыва или уже с базовыми знаниями. На пробном уроке мы определим стартовую точку."],
    ["Как проходит бесплатный пробный урок?", "Мы знакомимся, обсуждаем ваши цели, определяем уровень и выбираем удобный формат занятий. Первый урок бесплатно."],
    ["Сколько длится занятие?", "Один индивидуальный онлайн-урок длится 60 минут."],
    ["Сколько стоит урок?", "Стоимость зависит от выбранного языка и формата. При занятиях 2 раза в неделю цена за один урок ниже."],
    ["Сколько раз в неделю лучше заниматься?", "Оптимально 1–2 раза в неделю. Частота зависит от цели, сроков и вашей нагрузки."],
    ["Нужно ли покупать учебники?", "Нет, все необходимые материалы предоставляются. При желании можно дополнительно использовать ваш школьный или университетский учебник."],
    ["Есть ли домашние задания?", "Да, по необходимости. Задания помогают закрепить лексику, грамматику и разговорные конструкции без перегрузки."],
    ["Где проходят занятия?", "Занятия проходят онлайн: Zoom, Google Meet, Telegram или другая удобная платформа."],
    ["Подходят ли занятия взрослым?", "Да. Мы можем сфокусироваться на работе, путешествиях, повседневном общении или восстановлении базовых знаний."],
    ["Можно ли подготовиться к контрольной или экзамену?", "Да. Мы разберём нужные темы, типичные ошибки, формат заданий и составим план подготовки."],
  ],
};

const navItems = [
  ["Обо мне", "#about"],
  ["Программа", "#program"],
  ["Формат", "#format"],
  ["Стоимость", "#pricing"],
  ["FAQ", "#faq"],
  ["Контакты", "#contact"],
];

function Icon({ name, className = "" }) {
  return <span className={className} aria-hidden="true">{icons[name] || "✨"}</span>;
}

function Button({ children, variant = "primary", href = "#contact", className = "" }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-6 py-4 text-center font-black transition active:scale-[0.98]";
  const styles = variant === "secondary"
    ? "border-2 border-slate-200 bg-white text-slate-950 shadow-sm hover:bg-yellow-50"
    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700";
  return <a href={href} className={`${base} ${styles} ${className}`}>{children}</a>;
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow && <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm ring-1 ring-cyan-100"><Icon name="sparkle" />{eyebrow}</div>}
      <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{text}</p>}
    </motion.div>
  );
}

function IconBubble({ name, className = "" }) {
  return <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-violet-100 text-xl shadow-sm ${className}`}><Icon name={name} /></div>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[1.75rem] bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 ${className}`}>{children}</div>;
}

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-slate-900" onClick={() => setOpen(!open)}>
        <span>{item[0]}</span>
        <span className={`text-2xl text-cyan-600 transition-transform ${open ? "rotate-180" : ""}`}>{icons.down}</span>
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-6 text-slate-600 sm:text-base">{item[1]}</div>}
    </div>
  );
}

function LanguageChooser({ onChoose }) {
  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/55 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-yellow-200/55 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/45 blur-3xl" />
      </div>
      <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center text-center">
        <motion.div variants={fadeUp} className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm ring-1 ring-cyan-100">Anastasia • онлайн-уроки иностранных языков</motion.div>
        <motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Какой язык вы хотите изучать?</motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Выберите направление, и я покажу подходящую программу, формат занятий и стоимость.</motion.p>
        <motion.div variants={fadeUp} className="mt-10 grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <button onClick={() => onChoose("en")} className="group rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-cyan-900/10 ring-1 ring-cyan-100 transition hover:-translate-y-1 hover:shadow-cyan-500/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-black text-white">EN</div>
            <h2 className="mt-6 text-3xl font-black">Английский язык</h2>
            <p className="mt-3 leading-7 text-slate-600">Лексика, грамматика, разговорная практика, школа, учёба, работа, путешествия и уверенность в речи.</p>
            <div className="mt-6 rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-800">от 1200 ₽ / 60 минут при 2 уроках в неделю</div>
          </button>
          <button onClick={() => onChoose("de")} className="group rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100 transition hover:-translate-y-1 hover:shadow-violet-500/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-violet-600 text-2xl font-black text-white">DE</div>
            <h2 className="mt-6 text-3xl font-black">Немецкий язык</h2>
            <p className="mt-3 leading-7 text-slate-600">Артикли, падежи, порядок слов, произношение, разговорная практика и немецкий для реальных ситуаций.</p>
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 font-bold text-orange-800">от 800 ₽ / 60 минут при 2 уроках в неделю</div>
          </button>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-8 text-sm font-semibold text-slate-500">Первый пробный урок бесплатно • Начать можно с любого уровня</motion.p>
      </motion.div>
    </div>
  );
}

export default function EnglishTutorLandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const data = language ? site[language] : null;

  if (!language) return <LanguageChooser onChoose={setLanguage} />;

  return (
    <div className="min-h-screen scroll-smooth bg-[#f7fbff] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-yellow-200/45 blur-3xl" />
        <div className="absolute bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 text-sm font-black text-white shadow-lg shadow-cyan-500/20">{data.langIcon}</div>
            <div>
              <div className="text-base font-black leading-tight">{data.logo}</div>
              <div className="text-xs font-semibold text-slate-500">{data.subject}</div>
            </div>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">
            {navItems.map(([label, href]) => <a key={label} href={href} className="transition hover:text-cyan-700">{label}</a>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <button onClick={() => setLanguage(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">Сменить язык</button>
            <Button className="from-orange-400 to-yellow-400 px-5 text-slate-950 shadow-orange-300/30 hover:from-orange-500 hover:to-yellow-500">Бесплатный урок</Button>
          </div>
          <button className="rounded-2xl bg-slate-100 p-2 text-2xl leading-none lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? icons.close : icons.menu}</button>
        </div>
        {mobileOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden"><div className="grid gap-3">{navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2 font-semibold text-slate-700 hover:bg-cyan-50">{label}</a>)}<button onClick={() => { setLanguage(null); setMobileOpen(false); }} className="rounded-2xl bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700">Сменить язык</button></div></div>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-cyan-100"><span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-950">Первый урок бесплатно</span>Начать можно с любого уровня</motion.div>
              <motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">{data.hero.headline}</motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">{data.hero.subtitle}</motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row"><Button>{data.hero.primary}</Button><Button href="#program" variant="secondary">{data.hero.secondary}</Button></motion.div>
              <motion.div variants={fadeUp} className="mt-7 rounded-3xl border border-cyan-100 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm sm:text-base">{data.hero.trust}</motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.75, ease: "easeOut" }} className="relative">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-yellow-300/70 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-cyan-300/60 blur-2xl" />
              <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-cyan-50 p-5 shadow-2xl shadow-cyan-900/10 ring-1 ring-white">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 p-1">
                  <div className="rounded-[1.35rem] bg-white p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {data.hero.mini.map(([icon,title,text], i) => <div key={title} className={`rounded-3xl p-5 ${i===0?"bg-yellow-50":i===1?"bg-cyan-50":i===2?"bg-violet-50":"bg-orange-50"}`}><IconBubble name={icon} className="bg-white" /><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}
                    </div>
                    <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl"><Icon name="video" /></div><div><div className="font-black">Онлайн-уроки 60 минут</div><div className="text-sm text-white/70">Zoom • Google Meet • Telegram</div></div></div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
              <div className="aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-cyan-200 via-yellow-100 to-violet-200 p-6 shadow-xl shadow-cyan-900/10"><div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-white/90 bg-white/65 text-center backdrop-blur"><div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-5xl text-white shadow-lg">😊</div><p className="mt-5 text-xl font-black">Фото или аватар</p><p className="mt-2 max-w-xs text-sm text-slate-600">Добавьте личное фото, чтобы сайт выглядел ещё доверительнее.</p></div></div>
              <div className="absolute -bottom-5 left-8 rounded-3xl bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-lg">Ошибки — это часть обучения ✨</div>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
              <motion.div variants={fadeUp} className="mb-3 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-800">Обо мне</motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight sm:text-5xl">Личный подход, понятные объяснения и спокойная атмосфера</motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-slate-600">{data.aboutText}</motion.p>
              <motion.div variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-2">{["Понятные объяснения без сложных терминов","Индивидуальная программа под цель ученика","Много практики и живого общения","Удобный онлайн-формат"].map(item => <motion.div variants={fadeUp} key={item} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><span className="font-black text-cyan-600">✓</span><span className="font-semibold text-slate-700">{item}</span></motion.div>)}</motion.div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Для кого занятия" title={`${data.langLabel} под вашу цель и темп`} text="Занятия подходят тем, кто хочет понять язык, говорить увереннее и видеть реальный прогресс без лишнего стресса." />
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">{data.audience.map(([title,text,icon]) => <motion.div variants={fadeUp} key={title}><Card className="h-full p-6 transition hover:-translate-y-1 hover:shadow-xl"><IconBubble name={icon} /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></Card></motion.div>)}</motion.div>
          </div>
        </section>

        <section id="program" className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Лексика" title={data.vocabTitle} text={data.vocabText} />
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 grid gap-4 lg:grid-cols-5">{data.vocabCards.map(([title,text,icon]) => <motion.div variants={fadeUp} key={title}><Card className="h-full bg-gradient-to-br from-cyan-50 to-white p-5 shadow-sm ring-cyan-100"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card></motion.div>)}</motion.div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">{["Тематические слова и выражения","Лексика для повседневного общения, путешествий, школы, учёбы и работы","Повторение с примерами","Активное использование новых слов в разговоре","Мини-упражнения и карточки слов"].map(item => <div key={item} className="rounded-3xl bg-yellow-50 p-5 text-sm font-bold leading-6 text-slate-700 ring-1 ring-yellow-100">{item}</div>)}</div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Грамматика" title={data.grammarTitle} text={data.grammarText} />
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.grammarTopics.map((topic, index) => <motion.div variants={fadeUp} key={topic} className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"><IconBubble name="pen" className="mb-4 from-orange-100 to-yellow-100" /><div className="text-xs font-black uppercase tracking-wider text-cyan-600">Тема {index + 1}</div><h3 className="mt-2 font-black text-slate-900">{topic}</h3></motion.div>)}</motion.div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-2xl shadow-blue-950/20 sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-14">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}><div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 ring-1 ring-white/10">Разговорная практика</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{data.speakingTitle}</h2><p className="mt-5 text-lg leading-8 text-white/75">{data.speakingCallout}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{data.speakingItems.map(item => <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm font-bold ring-1 ring-white/10"><span className="text-yellow-300">✓</span>{item}</div>)}</div></motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl"><div className="rounded-[1.35rem] bg-gradient-to-br from-cyan-50 via-yellow-50 to-violet-50 p-6"><div className="text-5xl">🎧</div><h3 className="mt-5 text-2xl font-black">Практика в комфортном темпе</h3><p className="mt-3 leading-7 text-slate-600">Вы говорите больше, получаете понятную обратную связь и постепенно перестаёте бояться пауз, ошибок и незнакомых слов.</p><div className="mt-6 rounded-3xl bg-white p-4 text-sm font-bold text-slate-700 shadow-sm">Ошибки — это часть обучения, а не повод молчать.</div></div></motion.div>
          </div>
        </section>

        <section id="format" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Формат занятий" title={data.formatTitle} text={data.formatText} />
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[["video","Онлайн-занятия"],["heart","Индивидуальные уроки"],["clock","60 минут"],["star","Бесплатный пробный урок"],["pen","Домашние задания по необходимости"],["book","Все материалы предоставляются"],["globe","Zoom, Google Meet, Telegram"],["sparkle","Гибкое расписание"]].map(([icon,title]) => <motion.div variants={fadeUp} key={title} className="rounded-[1.5rem] bg-slate-50 p-5 shadow-sm ring-1 ring-slate-100"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3></motion.div>)}</motion.div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeader eyebrow="Как проходит обучение" title="От пробного урока до уверенного результата" text="План обучения строится вокруг вашей цели, уровня и реальных ситуаций, где вам нужен язык." />
            <div className="grid gap-5 md:grid-cols-4">{[["01","Бесплатный пробный урок","Знакомимся, обсуждаем цель и текущие трудности."],["02","Определение уровня и целей","Понимаем, что уже получается и что нужно усилить."],["03","Индивидуальный план обучения","Подбираем темы, материалы и темп занятий."],["04","Занятия и контроль прогресса","Регулярная практика, обратная связь и понятные шаги дальше."]].map(([num,title,text]) => <Card key={num} className="p-6"><div className="text-4xl font-black text-cyan-500">{num}</div><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-cyan-50 via-white to-yellow-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Почему выбирают мои занятия" title="Понятно, спокойно, современно и с фокусом на результат" /><motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shared.benefits.map(benefit => <motion.div variants={fadeUp} key={benefit} className="flex items-center gap-3 rounded-3xl bg-white p-5 font-bold shadow-sm ring-1 ring-slate-100"><span className="text-cyan-600">✓</span>{benefit}</motion.div>)}</motion.div></div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]"><div><div className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">Чему вы научитесь</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">После занятий вы сможете использовать язык увереннее</h2><p className="mt-5 text-lg leading-8 text-slate-600">Результат — это не только оценки или правила. Это чувство, что язык становится инструментом, а не барьером.</p></div><div className="grid gap-3 sm:grid-cols-2">{shared.results.map(item => <div key={item} className="rounded-3xl bg-white p-5 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100"><span className="mb-3 block text-2xl text-orange-500">✓</span>{item}</div>)}</div></div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Мини-карточки" title="Небольшие примеры того, как мы учимся" text="Карточки помогают быстро повторять лексику, грамматику и полезные фразы." /><div className="grid gap-5 md:grid-cols-3">{data.miniCards.map(([label,title,meta,example]) => <Card key={title} className="bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6"><div className="mb-5 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">{label}</div><h3 className="text-2xl font-black text-slate-950">{title}</h3><p className="mt-3 font-bold text-cyan-700">{meta}</p><p className="mt-4 rounded-2xl bg-white p-4 text-slate-700 shadow-sm">{example}</p></Card>)}</div></div>
        </section>

        <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Стоимость занятий" title={data.priceTitle} text={data.priceText} /><div className="grid gap-6 lg:grid-cols-3">{data.prices.map(([title,price,desc,button,badge], index) => <Card key={title} className={`p-8 ${index === 2 ? "bg-slate-950 text-white shadow-xl shadow-slate-900/20" : "ring-cyan-100"}`}><div className={`${index === 2 ? "bg-yellow-300 text-slate-950" : "bg-cyan-100 text-cyan-800"} mb-4 inline-flex rounded-full px-4 py-2 text-sm font-black`}>{badge}</div><h3 className="text-2xl font-black">{title}</h3><div className="mt-5 text-4xl font-black">{price}</div><p className={`mt-5 leading-7 ${index === 2 ? "text-white/75" : "text-slate-600"}`}>{desc}</p><Button className={`mt-7 w-full ${index === 2 ? "from-orange-400 to-yellow-400 text-slate-950 shadow-yellow-500/20 hover:from-orange-500 hover:to-yellow-500" : ""}`}>{button}</Button></Card>)}</div><p className="mt-6 text-center font-semibold text-slate-600">Занятия проходят онлайн. Материалы предоставляются. Расписание подбирается индивидуально.</p></div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Отзывы учеников" title="Что говорят после занятий" /><div className="grid gap-5 md:grid-cols-3">{data.testimonials.map((text,index) => <Card key={text} className="bg-gradient-to-br from-slate-50 to-white p-6"><div className="text-5xl text-cyan-500">“</div><p className="mt-4 text-lg font-bold leading-8 text-slate-800">«{text}»</p><div className="mt-6 text-yellow-400">★★★★★</div><p className="mt-3 text-sm font-semibold text-slate-500">Ученик {index + 1}</p></Card>)}</div></div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl"><SectionHeader eyebrow="Частые вопросы" title="Перед первым уроком" text="Здесь собраны ответы на вопросы, которые чаще всего задают перед записью." /><div className="grid gap-3">{shared.faqs.map((item,index) => <FAQItem key={item[0]} item={item} index={index} />)}</div></div>
        </section>

        <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-6 text-white shadow-2xl shadow-blue-900/20 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14">
            <div><div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold ring-1 ring-white/20">Запись на урок</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Хотите начать учить {language === "en" ? "английский" : "немецкий"} онлайн?</h2><p className="mt-5 text-lg leading-8 text-white/80">Оставьте заявку, и я свяжусь с вами, чтобы обсудить ваш уровень, цели и удобное время для бесплатного пробного урока.</p><div className="mt-8 grid gap-3">{[["telegram","Telegram"],["whatsapp","WhatsApp"],["mail","E-mail"],["instagram","Instagram"]].map(([icon,label]) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-bold ring-1 ring-white/15"><Icon name={icon} />{label}</div>)}</div></div>
            <form className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl sm:p-7"><div className="grid gap-4 sm:grid-cols-2">{["Имя","Возраст или класс","Уровень языка","Удобный способ связи"].map(label => <label key={label} className="grid gap-2 text-sm font-bold text-slate-700">{label}<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder={label} /></label>)}<label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Цель обучения<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Школа, работа, путешествия, разговорная практика..." /></label><label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Сообщение<textarea rows={4} className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Расскажите коротко, что хотите улучшить" /></label></div><button type="button" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 py-4 text-base font-black text-slate-950 shadow-lg shadow-orange-300/30 hover:from-orange-500 hover:to-yellow-500">➤ Отправить заявку</button><p className="mt-4 text-center text-sm font-semibold text-slate-500">Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p></form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-black">{data.langIcon}</div><div><div className="font-black">Anastasia</div><div className="text-sm text-white/60">{data.footerSubject}</div></div></div><p className="mt-5 text-sm leading-6 text-white/60">Дружелюбные онлайн-занятия для школьников, студентов и взрослых.</p></div><div><h4 className="font-black">Занятия</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Бесплатный пробный урок</span><span>{data.prices[1][1]}</span><span>{data.prices[2][1]} при 2 уроках в неделю</span></div></div><div><h4 className="font-black">Контакты</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Telegram</span><span>WhatsApp</span><span>E-mail</span><span>Instagram</span></div></div><div><h4 className="font-black">Информация</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><a href="#" className="hover:text-white">Политика конфиденциальности</a><a href="#contact" className="hover:text-white">Записаться на урок</a><button onClick={() => setLanguage(null)} className="text-left hover:text-white">Сменить язык</button></div></div></div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-white/45">© 2026 Anastasia. Онлайн-занятия. Все права защищены.</div>
      </footer>
    </div>
  );
}
