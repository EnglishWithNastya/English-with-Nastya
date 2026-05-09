import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
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
  video: "💻",
  target: "🎯",
  brain: "🧠",
  globe: "🌍",
  pen: "✍️",
  star: "★",
  clock: "⏱️",
  heart: "🤝",
  menu: "☰",
  close: "×",
  headphones: "🎧",
  smile: "😊",
  rocket: "🚀",
  mail: "✉️",
  telegram: "✈",
  whatsapp: "☘",
  vk: "VK",
  user: "👤",
  parent: "👨‍👩‍👧",
  calendar: "📅",
  trophy: "🏆",
  shield: "🔒",
  chart: "📈",
  home: "🏠",
};

const accounts = {
  Max: "max2026",
  Masha: "masha2026",
  Polina: "polina2026",
  Igor: "igor2026",
  Sonja: "sonja2026",
  Vanja: "vanja2026",
  Katya: "katya2026",
  Amelia: "amelia2026",
  Denis: "denis2026",
  BesteLehrerin: "08.08.Eins!",
};

const adminUsername = "BesteLehrerin";
const students = Object.keys(accounts).filter((name) => name !== adminUsername);
const germanStudents = ["Sonja", "Vanja"];

const lessonSchedule = {
  Max: ["Saturday, 20:30–21:30"],
  Masha: ["Thursday, 19:30–20:30", "Saturday, 11:00–12:00"],
  Polina: ["Monday, 15:00–16:00", "Tuesday, 15:00–16:00", "Wednesday, 17:00–18:00", "Thursday, 17:00–18:00", "Friday, 15:00–16:00", "Saturday, 15:00–16:00"],
  Igor: ["Wednesday, 16:00–17:00", "Saturday, 12:00–13:00"],
  Sonja: ["Wednesday, 12:00–13:00", "Saturday, 13:00–14:00"],
  Vanja: ["Monday, 19:30–20:30", "Thursday, 20:30–21:30"],
  Katya: [],
  Amelia: [],
  Denis: ["Monday, 18:00–19:00", "Wednesday, 18:00–19:00", "Friday, 18:00–19:00"],
};

const hourlyRates = {
  Max: 1000,
  Vanja: 800,
  Amelia: 1200,
  Masha: 1000,
  Igor: 1000,
  Sonja: 500,
  Polina: 800,
  Denis: 1000,
};

const scheduleByDay = [
  ["Monday", ["15:00–16:00 — Polina", "18:00–19:00 — Denis", "19:30–20:30 — Vanja"]],
  ["Tuesday", ["15:00–16:00 — Polina"]],
  ["Wednesday", ["12:00–13:00 — Sonja", "16:00–17:00 — Igor", "17:00–18:00 — Polina", "18:00–19:00 — Denis"]],
  ["Thursday", ["17:00–18:00 — Polina", "19:30–20:30 — Masha", "20:30–21:30 — Vanja"]],
  ["Friday", ["15:00–16:00 — Polina", "18:00–19:00 — Denis"]],
  ["Saturday", ["11:00–12:00 — Masha", "12:00–13:00 — Igor", "13:00–14:00 — Sonja", "15:00–16:00 — Polina", "20:30–21:30 — Max"]],
];

const dailyWords = {
  en: {
    A0: [
      { word: "water", answer: "вода", options: ["вода", "стол", "день", "окно"], example: "I drink water every day." },
      { word: "book", answer: "книга", options: ["книга", "дверь", "сумка", "утро"], example: "This book is interesting." },
    ],
    A1: [
      { word: "breakfast", answer: "завтрак", options: ["завтрак", "поезд", "тетрадь", "окно"], example: "I usually have breakfast at 8 o'clock." },
      { word: "umbrella", answer: "зонт", options: ["ключ", "зонт", "сумка", "вода"], example: "Take an umbrella. It is raining." },
    ],
    A2: [
      { word: "homework", answer: "домашнее задание", options: ["покупка", "домашнее задание", "звонок", "погода"], example: "I finished my homework in the evening." },
      { word: "wallet", answer: "кошелёк", options: ["кошелёк", "зеркало", "ручка", "стул"], example: "I left my wallet at home." },
    ],
    B1: [
      { word: "appointment", answer: "встреча / запись", options: ["встреча / запись", "завтрак", "рубашка", "улица"], example: "I have a doctor's appointment tomorrow." },
      { word: "neighbour", answer: "сосед", options: ["врач", "сосед", "учитель", "водитель"], example: "Our neighbour is very friendly." },
    ],
    B2: [
      { word: "receipt", answer: "чек", options: ["чек", "карта", "дверь", "чай"], example: "Please keep the receipt." },
      { word: "schedule", answer: "расписание", options: ["расписание", "ошибка", "молоко", "письмо"], example: "My schedule is very busy this week." },
    ],
    C1: [
      { word: "commute", answer: "дорога на работу / учёбу", options: ["дорога на работу / учёбу", "подарок", "стакан", "праздник"], example: "My commute takes forty minutes." },
      { word: "errand", answer: "поручение / бытовое дело", options: ["поручение / бытовое дело", "перчатка", "здание", "сосиска"], example: "I need to run an errand after work." },
    ],
    C2: [
      { word: "leftovers", answer: "остатки еды", options: ["остатки еды", "квитанция", "навык", "расписание"], example: "We had leftovers for dinner." },
      { word: "household chores", answer: "домашние обязанности", options: ["домашние обязанности", "приглашение", "соседство", "сдача"], example: "Household chores are easier when everyone helps." },
    ],
  },
  de: {
    A0: [
      { word: "das Wasser", answer: "вода", options: ["вода", "стол", "день", "окно"], example: "Ich trinke Wasser." },
      { word: "das Buch", answer: "книга", options: ["книга", "дверь", "сумка", "утро"], example: "Das Buch ist interessant." },
    ],
    A1: [
      { word: "das Frühstück", answer: "завтрак", options: ["завтрак", "поезд", "тетрадь", "окно"], example: "Ich esse Frühstück um 8 Uhr." },
      { word: "der Regenschirm", answer: "зонт", options: ["ключ", "зонт", "сумка", "вода"], example: "Ich nehme einen Regenschirm mit." },
    ],
    A2: [
      { word: "die Hausaufgabe", answer: "домашнее задание", options: ["покупка", "домашнее задание", "звонок", "погода"], example: "Ich mache meine Hausaufgabe." },
      { word: "die Geldbörse", answer: "кошелёк", options: ["кошелёк", "зеркало", "ручка", "стул"], example: "Meine Geldbörse ist in der Tasche." },
    ],
    B1: [
      { word: "der Termin", answer: "встреча / запись", options: ["встреча / запись", "завтрак", "рубашка", "улица"], example: "Ich habe morgen einen Termin." },
      { word: "der Nachbar", answer: "сосед", options: ["врач", "сосед", "учитель", "водитель"], example: "Der Nachbar ist nett." },
    ],
    B2: [
      { word: "die Quittung", answer: "чек", options: ["чек", "карта", "дверь", "чай"], example: "Ich brauche die Quittung." },
      { word: "der Stundenplan", answer: "расписание", options: ["расписание", "ошибка", "молоко", "письмо"], example: "Mein Stundenplan ist voll." },
    ],
    C1: [
      { word: "der Arbeitsweg", answer: "дорога на работу / учёбу", options: ["дорога на работу / учёбу", "подарок", "стакан", "праздник"], example: "Mein Arbeitsweg dauert vierzig Minuten." },
      { word: "die Besorgung", answer: "поручение / бытовое дело", options: ["поручение / бытовое дело", "перчатка", "здание", "сосиска"], example: "Ich muss noch eine Besorgung machen." },
    ],
    C2: [
      { word: "die Essensreste", answer: "остатки еды", options: ["остатки еды", "квитанция", "навык", "расписание"], example: "Wir essen heute die Essensreste." },
      { word: "die Hausarbeit", answer: "домашние обязанности", options: ["домашние обязанности", "приглашение", "соседство", "сдача"], example: "Hausarbeit gehört zum Alltag." },
    ],
  },
};

const wordLevels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

const site = {
  en: {
    logo: "Anastasia English",
    subject: "английский онлайн",
    langLabel: "Английский",
    langIcon: "EN",
    accent: "from-cyan-500 to-blue-600",
    heroTitle: "Английский язык онлайн — понятно, интересно и с результатом",
    heroText: "Индивидуальные онлайн-занятия по английскому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, разговорную практику и уверенность в речи.",
    about: "Меня зовут Anastasia, я репетитор по английскому языку. Я помогаю ученикам разобраться в грамматике, расширить словарный запас и начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем английский в реальных ситуациях.",
    focus: ["Разговорный английский", "Грамматика без сложных терминов", "Лексика для жизни, школы и работы", "Подготовка к контрольным и экзаменам"],
    audience: [
      ["Школьники", "Домашние задания, грамматика, словарный запас и подготовка к контрольным.", "cap"],
      ["Студенты", "Английский для учёбы, презентаций, экзаменов и академической коммуникации.", "book"],
      ["Взрослые", "Английский для работы, путешествий, общения и уверенности в речи.", "work"],
      ["Начинающие", "Спокойный старт без стресса и понятная база.", "smile"],
      ["Продолжающие", "Повторение грамматики, активная лексика и разговорные навыки.", "rocket"],
    ],
    vocabTitle: "Лексика, которую вы действительно будете использовать",
    vocabCards: [
      ["Travel English", "Аэропорт, отель, кафе, маршрут и вопросы в поездке.", "plane"],
      ["Business English", "Работа, письма, встречи, презентации и small talk.", "work"],
      ["Everyday English", "Фразы для общения, покупок, звонков и переписки.", "chat"],
      ["School English", "Слова и выражения для школы, заданий и контрольных.", "cap"],
      ["Useful Phrases", "Готовые фразы, которые легко применять в речи.", "sparkle"],
    ],
    grammarTitle: "Грамматика без страха и путаницы",
    grammarText: "Мы разбираем грамматику простым языком, на понятных примерах и сразу тренируем её в речи и письме.",
    grammarTopics: ["Времена английского языка", "Артикли", "Модальные глаголы", "Условные предложения", "Порядок слов", "Вопросы и отрицания", "Предлоги", "Типичные ошибки русскоговорящих учеников"],
    speakingTitle: "Учимся говорить, а не только вспоминать правила",
    speakingCallout: "Главная цель — не просто знать английский, а уметь им пользоваться.",
    cards: [
      ["Word", "confidence", "Перевод: уверенность", "I want to speak English with confidence."],
      ["Grammar", "Present Perfect", "Пример", "I have already finished my homework."],
      ["Phrase", "Could you repeat that, please?", "Перевод", "Не могли бы вы повторить, пожалуйста?"],
    ],
    prices: [
      ["Бесплатный пробный урок", "0 ₽", "Знакомство, определение уровня, обсуждение целей и индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["1 урок в неделю", "1400 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях 1 раз в неделю.", "Записаться на урок", "Стандартный формат"],
      ["От 2 уроков в неделю", "1200 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях минимум 2 раза в неделю. 1200 ₽ за урок вместо 1400 ₽.", "Выбрать формат", "Популярный выбор"],
    ],
    testimonials: ["После занятий я наконец-то понял времена и стал увереннее говорить.", "Очень понятные объяснения и приятная атмосфера на уроках.", "Мне нравится, что мы много практикуем лексику и реальные диалоги."],
  },
  de: {
    logo: "Anastasia Deutsch",
    subject: "немецкий онлайн",
    langLabel: "Немецкий",
    langIcon: "DE",
    accent: "from-orange-400 to-violet-600",
    heroTitle: "Немецкий язык онлайн — спокойно, понятно и с результатом",
    heroText: "Индивидуальные онлайн-занятия по немецкому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, произношение, разговорную практику и уверенность в речи.",
    about: "Меня зовут Anastasia, я репетитор по немецкому языку. Я помогаю ученикам разобраться в грамматике, пополнить словарный запас и постепенно начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем немецкий в реальных ситуациях.",
    focus: ["Артикли der, die, das", "Падежи без паники", "Порядок слов", "Немецкий для школы, переезда и жизни"],
    audience: [
      ["Школьники", "Домашние задания, грамматика, словарный запас и подготовка к контрольным.", "cap"],
      ["Студенты", "Немецкий для учёбы, презентаций, экзаменов и академической коммуникации.", "book"],
      ["Взрослые", "Немецкий для работы, путешествий, переезда и общения.", "work"],
      ["Начинающие", "Спокойный старт: чтение, базовая грамматика и первые фразы.", "smile"],
      ["Продолжающие", "Повторение грамматики, словарь и разговорные навыки.", "rocket"],
    ],
    vocabTitle: "Немецкая лексика, которую легко применять в жизни",
    vocabCards: [
      ["Deutsch für Reisen", "Вокзал, аэропорт, отель, кафе и вопросы в поездке.", "plane"],
      ["Deutsch für Arbeit", "Работа, письма, встречи, собеседования и деловое общение.", "work"],
      ["Alltagsdeutsch", "Фразы для магазина, врача, переписки и разговоров.", "chat"],
      ["Schuldeutsch", "Лексика для школы, заданий, контрольных и экзаменов.", "cap"],
      ["Nützliche Redemittel", "Готовые выражения, которые помогают говорить увереннее.", "sparkle"],
    ],
    grammarTitle: "Немецкая грамматика без паники",
    grammarText: "Мы разбираем грамматику простым языком: на понятных схемах, коротких примерах и практических упражнениях.",
    grammarTopics: ["Артикли der, die, das", "Падежи", "Порядок слов", "Спряжение глаголов", "Модальные глаголы", "Времена Präsens, Perfekt, Präteritum", "Предлоги с падежами", "Типичные ошибки русскоговорящих учеников"],
    speakingTitle: "Немецкий для реального общения",
    speakingCallout: "Главная цель — не просто знать немецкий, а уметь пользоваться им в жизни.",
    cards: [
      ["Wort", "die Sicherheit", "Перевод: уверенность, безопасность", "Ich möchte mit Sicherheit Deutsch sprechen."],
      ["Grammatik", "Perfekt", "Пример", "Ich habe meine Hausaufgaben gemacht."],
      ["Redemittel", "Könnten Sie das bitte wiederholen?", "Перевод", "Не могли бы Вы повторить, пожалуйста?"],
    ],
    prices: [
      ["Бесплатный пробный урок", "0 ₽", "Знакомство, определение уровня, обсуждение целей и индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["1 урок в неделю", "1000 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях 1 раз в неделю.", "Записаться на урок", "Стандартный формат"],
      ["От 2 уроков в неделю", "800 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях минимум 2 раза в неделю. 800 ₽ за урок вместо 1000 ₽.", "Выбрать формат", "Популярный выбор"],
    ],
    testimonials: ["После занятий я наконец-то разобрался с артиклями и падежами.", "Очень спокойные объяснения и дружелюбная атмосфера на уроках.", "Мне нравится, что мы много говорим и сразу используем новые немецкие слова."],
  },
};

const faq = [
  ["С какого уровня можно начать?", "Начать можно с любого уровня: с нуля, после перерыва или уже с базовыми знаниями."],
  ["Как проходит бесплатный пробный урок?", "Мы знакомимся, обсуждаем цели, определяем уровень и выбираем удобный формат занятий."],
  ["Сколько длится занятие?", "Один индивидуальный онлайн-урок длится 60 минут."],
  ["Где проходят занятия?", "Занятия проходят онлайн в MTS Link, а для интерактивных материалов, схем, упражнений и совместной работы используется Miro."],
  ["Нужно ли покупать учебники?", "Нет, все необходимые материалы предоставляются."],
  ["Есть ли домашние задания?", "Да, по необходимости. Задания помогают закрепить лексику и грамматику без перегрузки."],
  ["Как отменить или перенести занятие?", "Лучше предупредить заранее. Детальные правила переноса можно согласовать индивидуально."],
];

function getTodayKey(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
}

function getStudentWordLevel(studentName) {
  return safeGet(`word-level-${studentName}`, "A0");
}

function getDailyQuiz(studentName) {
  const language = germanStudents.includes(studentName) ? "de" : "en";
  const level = getStudentWordLevel(studentName);
  const list = dailyWords[language][level] || dailyWords[language].A0;
  const start = new Date("2026-01-01T00:00:00");
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const dayIndex = Math.max(0, Math.floor((today - start) / (24 * 60 * 60 * 1000)));
  return { ...list[dayIndex % list.length], language, level, id: `${studentName}-${language}-${level}-${getTodayKey()}` };
}

function getWordStats(studentName) {
  return safeGet(`word-stats-${studentName}`, { correct: 0, wrong: 0, unanswered: 0, streak: 0, level: "A0" });
}

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable in some environments
  }
}

function Icon({ name, className = "" }) {
  return <span className={className} aria-hidden="true">{icons[name] || "✨"}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[1.75rem] bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 ${className}`}>{children}</div>;
}

function IconBubble({ name, className = "" }) {
  return <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-violet-100 text-xl shadow-sm ${className}`}><Icon name={name} /></div>;
}

function Button({ children, href = "#contact", className = "", onClick, variant = "primary" }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-6 py-4 text-center font-black transition active:scale-[0.98]";
  const styles = variant === "light" ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 hover:bg-yellow-50" : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 hover:from-cyan-600 hover:to-blue-700";
  if (onClick) return <button onClick={onClick} className={`${base} ${styles} ${className}`}>{children}</button>;
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

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold text-slate-900" onClick={() => setOpen(!open)}>
        <span>{item[0]}</span>
        <span className={`text-2xl text-cyan-600 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-6 text-slate-600 sm:text-base">{item[1]}</div>}
    </div>
  );
}

function Home({ onChoose }) {
  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <BackgroundBlobs />
      <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center text-center">
        <motion.div variants={fadeUp} className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm ring-1 ring-cyan-100">Anastasia • онлайн-уроки английского и немецкого</motion.div>
        <motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Выберите, что вам нужно</motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Индивидуальные занятия, быстрый тест уровня и личный кабинет ученика в одном месте.</motion.p>
        <motion.div variants={fadeUp} className="mt-10 grid w-full gap-6 lg:grid-cols-3">
          <HomeChoice title="Английский язык" icon="EN" text="Лексика, грамматика, разговорная практика, школа, учёба, работа и путешествия." chip="Открыть страницу английского" onClick={() => onChoose("en")} color="from-cyan-500 to-blue-600" />
          <HomeChoice title="Немецкий язык" icon="DE" text="Артикли, падежи, порядок слов, произношение и разговорная практика." chip="Открыть страницу немецкого" onClick={() => onChoose("de")} color="from-orange-400 to-violet-600" />
          <HomeChoice title="Я уже ученик" icon="👤" text="Войдите в свой профиль: уроки, домашние задания, слово дня, баллы и расписание." chip="Войти в личный кабинет" onClick={() => onChoose("students")} color="from-slate-900 to-violet-600" />
        </motion.div>
        <motion.div variants={fadeUp} className="mt-8 grid gap-3 text-sm font-semibold text-slate-500 sm:grid-cols-3">
          <span>Первый пробный урок бесплатно</span>
          <span>MTS Link + Miro</span>
          <span>Начать можно с любого уровня</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/55 blur-3xl" />
      <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-yellow-200/55 blur-3xl" />
      <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/45 blur-3xl" />
    </div>
  );
}

function HomeChoice({ title, text, chip, onClick, icon, color }) {
  return (
    <button onClick={onClick} className="rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-slate-900/10 ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${color} text-2xl font-black text-white`}>{icon}</div>
      <h2 className="mt-6 text-3xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{text}</p>
      <div className="mt-6 rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-800">{chip}</div>
    </button>
  );
}

function StudentPortal({ onBack }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [student, setStudent] = useState(null);
  const [view, setView] = useState("dashboard");
  const [error, setError] = useState("");
  const [quizState, setQuizState] = useState(null);

  const quiz = student && student !== adminUsername ? getDailyQuiz(student) : null;
  const totalPoints = student ? safeGet(`points-${student}`, 0) : 0;
  const isAdmin = student === adminUsername;
  const language = student && (isAdmin ? "Admin" : germanStudents.includes(student) ? "Deutsch" : "English");

  const login = () => {
    const cleanName = name.trim();
    if (accounts[cleanName] && accounts[cleanName] === password) {
      setStudent(cleanName);
      setView(cleanName === adminUsername ? "admin" : "dashboard");
      setQuizState(cleanName === adminUsername ? null : safeGet(`daily-word-${getDailyQuiz(cleanName).id}`, { answered: false, correct: false, points: 0, selected: null }));
      setError("");
      setPassword("");
    } else {
      setError("Неверное имя или пароль. Проверьте данные и попробуйте ещё раз.");
    }
  };

  const logout = () => {
    setStudent(null);
    setName("");
    setPassword("");
    setError("");
    setView("dashboard");
    setQuizState(null);
  };

  const answerWeeklyQuiz = (option) => {
    if (!student || !quiz || quizState?.answered) return;
    const correct = option === quiz.answer;
    const nextState = { answered: true, correct, points: correct ? 10 : 0, selected: option };

    const currentStats = getWordStats(student);
    const currentLevel = currentStats.level || getStudentWordLevel(student);
    const currentLevelIndex = Math.max(0, wordLevels.indexOf(currentLevel));
    let nextLevelIndex = currentLevelIndex;
    const nextStats = {
      ...currentStats,
      correct: currentStats.correct + (correct ? 1 : 0),
      wrong: currentStats.wrong + (correct ? 0 : 1),
      streak: correct ? currentStats.streak + 1 : 0,
    };

    if (correct && nextStats.streak >= 3) {
      nextLevelIndex = Math.min(wordLevels.length - 1, currentLevelIndex + 1);
      nextStats.streak = 0;
    }
    if (!correct) {
      nextLevelIndex = Math.max(0, currentLevelIndex - 1);
    }

    nextStats.level = wordLevels[nextLevelIndex];
    safeSet(`daily-word-${quiz.id}`, nextState);
    safeSet(`word-stats-${student}`, nextStats);
    safeSet(`word-level-${student}`, nextStats.level);
    if (correct) safeSet(`points-${student}`, totalPoints + 10);
    setQuizState(nextState);
  };

  if (!student) {
    return <StudentLogin name={name} setName={setName} password={password} setPassword={setPassword} error={error} login={login} onBack={onBack} />;
  }

  if (isAdmin) {
    return <AdminPortal onBack={onBack} logout={logout} />;
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
      <BackgroundBlobs />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Вы вошли как: {student} • {language}</div>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Личный кабинет</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onBack} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-5">
          {[
            ["dashboard", "Обзор", "home"],
            ["student", "Для ученика", "user"],
            ["parents", "Для родителей", "parent"],
            ["schedule", "Учебный план", "calendar"],
            ["progress", "Прогресс", "chart"],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} className={`rounded-2xl p-4 text-left font-black shadow-sm ring-1 transition ${view === id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}><Icon name={icon} /> {label}</button>
          ))}
        </div>

        {view === "dashboard" && <StudentDashboard student={student} quiz={quiz} quizState={quizState} totalPoints={totalPoints} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "student" && <StudentInfo student={student} quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "parents" && <ParentsInfo student={student} />}
        {view === "schedule" && <StudentSchedule student={student} />}
        {view === "progress" && <ProgressInfo student={student} totalPoints={totalPoints} />}
      </div>
    </div>
  );
}

function AdminPortal({ onBack, logout }) {
  const [adminView, setAdminView] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendance, setAttendance] = useState(safeGet("attendance-records", {}));

  const actualLessons = (name) => (lessonSchedule[name] || []).filter((lesson) => lesson && !lesson.toLowerCase().includes("schedule will be added"));

  const allLessonRows = useMemo(() => {
    const rows = [];
    students.forEach((name) => {
      actualLessons(name).forEach((lesson) => rows.push({ student: name, lesson }));
    });
    return rows;
  }, []);

  const setAttendanceStatus = (studentName, lesson, status) => {
    const key = `${studentName}__${lesson}`;
    const next = { ...attendance, [key]: status };
    setAttendance(next);
    safeSet("attendance-records", next);
  };

  const attendanceStats = (studentName) => {
    const lessons = actualLessons(studentName);
    const values = lessons.map((lesson) => attendance[`${studentName}__${lesson}`]).filter(Boolean);
    return {
      total: lessons.length,
      came: values.filter((v) => v === "came").length,
      missed: values.filter((v) => v === "missed").length,
      moved: values.filter((v) => v === "moved").length,
      open: lessons.length - values.length,
    };
  };

  const earnedThisWeek = students.reduce((sum, name) => {
    const stats = attendanceStats(name);
    return sum + stats.came * (hourlyRates[name] || 0);
  }, 0);

  const plannedWeeklyRevenue = students.reduce((sum, name) => {
    return sum + actualLessons(name).length * (hourlyRates[name] || 0);
  }, 0);

  const movedPotential = students.reduce((sum, name) => {
    const stats = attendanceStats(name);
    return sum + stats.moved * (hourlyRates[name] || 0);
  }, 0);

  const missedLoss = students.reduce((sum, name) => {
    const stats = attendanceStats(name);
    return sum + stats.missed * (hourlyRates[name] || 0);
  }, 0);

  if (selectedStudent) {
    const quiz = getDailyQuiz(selectedStudent);
    const quizState = safeGet(`daily-word-${quiz.id}`, { answered: false, correct: false, points: 0, selected: null });
    const totalPoints = safeGet(`points-${selectedStudent}`, 0);
    const stats = attendanceStats(selectedStudent);
    return (
      <div className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
        <BackgroundBlobs />
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Админ-просмотр • профиль ученика</div>
              <h1 className="mt-3 text-4xl font-black text-slate-950">Профиль ученика: {selectedStudent}</h1>
              <p className="mt-2 leading-7 text-slate-600">Anastasia видит здесь те же разделы, которые доступны ученику, а также организационную информацию.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setSelectedStudent(null)} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← К админ-панели</button>
              <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="p-5"><div className="text-2xl">📅</div><div className="mt-2 text-sm font-bold text-slate-500">Занятий в неделю</div><div className="text-3xl font-black">{stats.total}</div></Card>
            <Card className="p-5"><div className="text-2xl">✅</div><div className="mt-2 text-sm font-bold text-slate-500">Пришёл</div><div className="text-3xl font-black">{stats.came}</div></Card>
            <Card className="p-5"><div className="text-2xl">↔️</div><div className="mt-2 text-sm font-bold text-slate-500">Перенос</div><div className="text-3xl font-black">{stats.moved}</div></Card>
            <Card className="p-5"><div className="text-2xl">❌</div><div className="mt-2 text-sm font-bold text-slate-500">Не пришёл</div><div className="text-3xl font-black">{stats.missed}</div></Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-6">
              <StudentDashboard student={selectedStudent} quiz={quiz} quizState={quizState} totalPoints={totalPoints} answerWeeklyQuiz={() => {}} />
              <StudentInfo student={selectedStudent} quiz={quiz} quizState={quizState} answerWeeklyQuiz={() => {}} />
            </div>
            <div className="grid gap-6">
              <StudentSchedule student={selectedStudent} />
              <ParentsInfo student={selectedStudent} />
              <ProgressInfo student={selectedStudent} totalPoints={totalPoints} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
      <BackgroundBlobs />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Админ-аккаунт • Anastasia</div>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Панель преподавателя</h1>
            <p className="mt-2 max-w-3xl leading-7 text-slate-600">Здесь можно открывать профили учеников, отмечать посещаемость и рассчитывать доход на основе календаря посещаемости.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onBack} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-4">
          {[["overview", "Ученики", "👥"], ["calendar", "Календарь посещаемости", "📅"], ["revenue", "Доход", "₽"], ["stats", "Статистика", "📊"]].map(([id, label, icon]) => (
            <button key={id} onClick={() => setAdminView(id)} className={`rounded-2xl p-4 text-left font-black shadow-sm ring-1 transition ${adminView === id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{icon} {label}</button>
          ))}
        </div>

        {adminView === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Card className="p-6">
              <h2 className="text-3xl font-black">Профили учеников</h2>
              <p className="mt-2 leading-7 text-slate-600">Нажмите на ученика, чтобы открыть его полный профиль.</p>
              <div className="mt-6 grid gap-4">
                {students.map((name) => {
                  const lang = germanStudents.includes(name) ? "Deutsch" : "English";
                  const points = safeGet(`points-${name}`, 0);
                  const wordStats = getWordStats(name);
                  const todayQuiz = getDailyQuiz(name);
                  const todayState = safeGet(`daily-word-${todayQuiz.id}`, { answered: false });
                  const unansweredToday = todayState.answered ? 0 : 1;
                  const stats = attendanceStats(name);
                  return (
                    <button key={name} onClick={() => setSelectedStudent(name)} className="rounded-3xl bg-slate-50 p-5 text-left ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-cyan-50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><h3 className="text-2xl font-black">{name}</h3><p className="text-sm font-bold text-slate-500">{lang} • баллы: {points} • ставка: {hourlyRates[name] || 0} ₽</p></div>
                        <div className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">Открыть профиль</div>
                      </div>
                      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-4"><span>Пришёл: {stats.came}</span><span>Не пришёл: {stats.missed}</span><span>Перенос: {stats.moved}</span><span>Открыто: {stats.open}</span></div>
                      <div className="mt-3 grid gap-2 text-sm font-bold text-slate-600 sm:grid-cols-4"><span>Слова правильно: {wordStats.correct}</span><span>Слова неправильно: {wordStats.wrong}</span><span>Сегодня не отвечено: {unansweredToday}</span><span>Уровень слов: {wordStats.level || "A0"}</span></div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-3xl font-black">Общий недельный план</h2>
              <p className="mt-2 leading-7 text-slate-600">Этот общий план виден только в админ-аккаунте.</p>
              <div className="mt-6 grid gap-4">{scheduleByDay.map(([day, lessons]) => <div key={day} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100"><h3 className="font-black text-slate-950">{day}</h3><div className="mt-3 grid gap-2">{lessons.map((lesson) => <div key={lesson} className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-700">{lesson}</div>)}</div></div>)}</div>
            </Card>
          </div>
        )}

        {adminView === "calendar" && (
          <Card className="p-6">
            <h2 className="text-3xl font-black">Календарь посещаемости</h2>
            <p className="mt-2 leading-7 text-slate-600">Отметьте для каждого занятия: ученик пришёл, не пришёл, перенёс занятие или статус пока открыт.</p>
            <div className="mt-6 grid gap-4">
              {allLessonRows.map(({ student: studentName, lesson }) => {
                const key = `${studentName}__${lesson}`;
                const status = attendance[key] || "open";
                return (
                  <div key={key} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="text-xl font-black">{studentName}</h3><p className="font-bold text-slate-600">{lesson}</p><p className="text-sm font-bold text-slate-500">Ставка: {hourlyRates[studentName] || 0} ₽</p></div>
                      <div className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">Статус: {status === "came" ? "пришёл" : status === "missed" ? "не пришёл" : status === "moved" ? "перенос" : "открыто"}</div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">{[["came", "Пришёл"], ["missed", "Не пришёл"], ["moved", "Перенос"], ["open", "Открыто"]].map(([id, label]) => <button key={id} onClick={() => setAttendanceStatus(studentName, lesson, id)} className={`rounded-2xl px-4 py-3 font-black ring-1 transition ${status === id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{label}</button>)}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {adminView === "revenue" && (
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card className="p-6">
              <h2 className="text-3xl font-black">Калькулятор дохода</h2>
              <p className="mt-2 leading-7 text-slate-600">Расчёт основан на календаре посещаемости. В доход засчитываются только занятия со статусом «Пришёл».</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100"><div className="text-sm font-bold text-emerald-700">Доход по отмеченным посещениям</div><div className="mt-2 text-4xl font-black text-emerald-900">{earnedThisWeek} ₽</div></div>
                <div className="rounded-3xl bg-cyan-50 p-5 ring-1 ring-cyan-100"><div className="text-sm font-bold text-cyan-700">Плановый доход за неделю</div><div className="mt-2 text-4xl font-black text-cyan-900">{plannedWeeklyRevenue} ₽</div></div>
                <div className="rounded-3xl bg-yellow-50 p-5 ring-1 ring-yellow-100"><div className="text-sm font-bold text-orange-700">Потенциально перенесено</div><div className="mt-2 text-4xl font-black text-orange-900">{movedPotential} ₽</div></div>
                <div className="rounded-3xl bg-red-50 p-5 ring-1 ring-red-100"><div className="text-sm font-bold text-red-700">Не получено из-за пропусков</div><div className="mt-2 text-4xl font-black text-red-900">{missedLoss} ₽</div></div>
                <div className="rounded-3xl bg-slate-950 p-5 text-white"><div className="text-sm font-bold text-white/70">Прогноз на месяц по текущим отмеченным посещениям</div><div className="mt-2 text-4xl font-black">{earnedThisWeek * 4} ₽</div><p className="mt-2 text-sm text-white/60">Расчёт: отмеченный доход × 4 недели.</p></div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-3xl font-black">Доход по ученикам</h2>
              <div className="mt-6 grid gap-4">
                {students.map((name) => {
                  const stats = attendanceStats(name);
                  const rate = hourlyRates[name] || 0;
                  const earned = stats.came * rate;
                  const planned = stats.total * rate;
                  const missed = stats.missed * rate;
                  const moved = stats.moved * rate;
                  return (
                    <div key={name} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-2xl font-black">{name}</h3><div className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">{rate} ₽ / урок</div></div>
                      <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700 sm:grid-cols-4"><span>Пришёл: {stats.came}</span><span>Доход: {earned} ₽</span><span>План: {planned} ₽</span><span>Пропуски: {missed} ₽</span><span>Переносы: {moved} ₽</span></div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {adminView === "stats" && (
          <Card className="p-6">
            <h2 className="text-3xl font-black">Статистика пропусков и переносов</h2>
            <p className="mt-2 leading-7 text-slate-600">Эта таблица показывает, как часто ученики не приходят или переносят занятия.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {students.map((name) => {
                const stats = attendanceStats(name);
                const problemRate = stats.total ? Math.round(((stats.missed + stats.moved) / stats.total) * 100) : 0;
                const wordStats = getWordStats(name);
                const todayQuiz = getDailyQuiz(name);
                const todayState = safeGet(`daily-word-${todayQuiz.id}`, { answered: false });
                const unansweredToday = todayState.answered ? 0 : 1;
                return (
                  <div key={name} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-2xl font-black">{name}</h3><div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-700">{problemRate}% проблемно</div></div>
                    <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700"><span>Запланировано: {stats.total}</span><span>Пришёл: {stats.came}</span><span>Не пришёл: {stats.missed}</span><span>Перенос: {stats.moved}</span><span>Открыто: {stats.open}</span></div>
                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 ring-1 ring-slate-100">
                      Слова: правильно {wordStats.correct} • неправильно {wordStats.wrong} • сегодня не отвечено {unansweredToday} • уровень {wordStats.level || "A0"} • серия {wordStats.streak}/3
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function StudentLogin({ name, setName, password, setPassword, error, login, onBack }) {
  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-10 sm:px-6 lg:px-8">
      <BackgroundBlobs />
      <div className="mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-6 rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
        <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm ring-1 ring-cyan-100">Личный кабинет ученика</motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Войдите в свой профиль</motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-slate-600">Введите имя и пароль. После входа откроется только ваш личный кабинет с расписанием, домашними заданиями, словом недели и баллами.</motion.p>
            <motion.div variants={fadeUp} className="mt-6 rounded-3xl bg-yellow-50 p-5 font-bold text-orange-800 ring-1 ring-yellow-100"><Icon name="shield" /> Демо-версия: для реального запуска нужен защищённый сервер и база данных.</motion.div>
          </motion.div>

          <Card className="p-7">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 text-3xl text-white">👤</div>
            <h2 className="text-3xl font-black">Вход для ученика</h2>
            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-slate-700">Имя пользователя<input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Например: Max" /></label>
              <label className="grid gap-2 text-sm font-bold text-slate-700">Пароль<input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} type="password" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Введите пароль" /></label>
              {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div>}
              <Button onClick={login} className="w-full">Войти в профиль</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ student, quiz, quizState, totalPoints, answerWeeklyQuiz }) {
  const nextLesson = lessonSchedule[student]?.[0] || "Будет добавлено позже";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat title="Следующий урок" value={nextLesson} icon="clock" />
            <Stat title="Баллы" value={`${totalPoints}`} icon="trophy" />
            <Stat title="Язык" value={germanStudents.includes(student) ? "Deutsch" : "English"} icon="book" />
          </div>
        </Card>
        <WeeklyWord quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />
      </div>
      <Card className="p-6">
        <h2 className="text-2xl font-black">Что важно на этой неделе</h2>
        <div className="mt-5 grid gap-3">
          {["Повторить слово дня", "Проверить домашнее задание", "Открыть Miro перед уроком", "Подготовить 2–3 вопроса к уроку"].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-700 ring-1 ring-slate-100">✓ {item}</div>)}
        </div>
      </Card>
    </div>
  );
}

function Stat({ title, value, icon }) {
  return <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="text-2xl"><Icon name={icon} /></div><div className="mt-2 text-sm font-bold text-slate-500">{title}</div><div className="mt-1 font-black text-slate-950">{value}</div></div>;
}

function WeeklyWord({ quiz, quizState, answerWeeklyQuiz }) {
  return (
    <div className="rounded-[1.75rem] bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6 ring-1 ring-cyan-100">
      <div className="mb-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">Слово дня • обновляется каждый день в 00:00 • уровень {quiz.level}</div>
      <h2 className="text-3xl font-black text-slate-950">{quiz.word}</h2>
      <p className="mt-2 text-slate-600">Выберите правильный перевод. За правильный ответ — 10 баллов. После 3 правильных ответов подряд уровень повышается. После ошибки уровень снижается на 1.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quiz.options.map((option) => (
          <button key={option} onClick={() => answerWeeklyQuiz(option)} disabled={quizState?.answered} className={`rounded-2xl p-4 text-left font-black ring-1 transition ${quizState?.answered && option === quiz.answer ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : quizState?.answered && option === quizState.selected ? "bg-red-50 text-red-700 ring-red-200" : "bg-white text-slate-800 ring-slate-100 hover:bg-cyan-50"}`}>{option}</button>
        ))}
      </div>
      {quizState?.answered && <div className={`mt-5 rounded-2xl p-4 font-black ${quizState.correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{quizState.correct ? "Правильно! +10 баллов." : `Неправильно. Правильный ответ: ${quiz.answer}.`}</div>}
      <div className="mt-4 rounded-2xl bg-white p-4 font-bold text-slate-700 shadow-sm">Пример: {quiz.example}</div>
    </div>
  );
}

function StudentInfo({ student, quiz, quizState, answerWeeklyQuiz }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <WeeklyWord quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />
      <Card className="p-6">
        <h2 className="text-3xl font-black">Материалы и задания</h2>
        <div className="mt-6 grid gap-4">
          {[
            ["Домашнее задание", "Будет добавлено после урока. Статус: ожидает обновления."],
            ["Miro-доска", "Здесь можно разместить индивидуальную ссылку на Miro."],
            ["Цель", "Короткая цель на ближайшие занятия будет добавлена здесь."],
            ["Повторение", "Повторить слова дня и примеры из урока."],
          ].map(([title, text]) => <div key={title} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></div>)}
        </div>
      </Card>
    </div>
  );
}

function ParentsInfo({ student }) {
  return (
    <Card className="p-8">
      <div className="mb-4 inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-orange-800">Для родителей • {student}</div>
      <h2 className="text-3xl font-black">Краткая информация</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {[
          ["Прогресс", "Здесь можно фиксировать прогресс ученика: грамматика, лексика, чтение, говорение."],
          ["Посещаемость", "Информация о прошедших и запланированных уроках."],
          ["Оплата", "Здесь можно добавить статус оплаты и выбранный формат занятий."],
          ["Рекомендации", "Короткие рекомендации для поддержки обучения дома."],
        ].map(([title, text]) => <div key={title} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100"><h3 className="text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></div>)}
      </div>
    </Card>
  );
}

function StudentSchedule({ student }) {
  return (
    <Card className="p-6">
      <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Расписание ученика: {student}</div>
      <h2 className="text-3xl font-black">Ваши занятия</h2>
      <p className="mt-3 leading-7 text-slate-600">В этом разделе отображается только ваше индивидуальное расписание. Данные других учеников скрыты.</p>
      <div className="mt-6 grid gap-3">
        {(lessonSchedule[student] || ["Расписание будет добавлено позже"]).map((lesson) => (
          <div key={lesson} className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-800 ring-1 ring-slate-100">{lesson}</div>
        ))}
      </div>
    </Card>
  );
}

function ProgressInfo({ student, totalPoints }) {
  const skills = germanStudents.includes(student) ? ["Артикли", "Падежи", "Порядок слов", "Говорение"] : ["Vocabulary", "Grammar", "Speaking", "Listening"];
  return (
    <Card className="p-8">
      <div className="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Прогресс • {student}</div>
      <h2 className="text-3xl font-black">Учебный прогресс</h2>
      <p className="mt-3 leading-7 text-slate-600">Этот раздел можно использовать для регулярной обратной связи после уроков.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {skills.map((skill, i) => <div key={skill} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100"><div className="flex justify-between font-black"><span>{skill}</span><span>{45 + i * 10}%</span></div><div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${45 + i * 10}%` }} /></div></div>)}
      </div>
      <div className="mt-6 rounded-3xl bg-yellow-50 p-5 font-black text-orange-800 ring-1 ring-yellow-100">Всего баллов за слова дня: {totalPoints}</div>
    </Card>
  );
}

function LevelTest({ type }) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [finished, setFinished] = useState(false);

  const levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const questionBank = getQuestionBank(type);
  const totalQuestions = 10;
  const currentLevel = levels[levelIndex];
  const currentQuestion = questionBank[currentLevel][currentIndex % questionBank[currentLevel].length];

  const answerQuestion = (option) => {
    const correct = option === currentQuestion.correct;
    const nextScore = score + (correct ? 1 : 0);
    const nextHistory = [...history, { level: currentLevel, selected: option, correctAnswer: currentQuestion.correct, correct }];
    setScore(nextScore);
    setHistory(nextHistory);
    if (currentIndex + 1 >= totalQuestions) {
      setFinished(true);
      return;
    }
    setLevelIndex(Math.max(0, Math.min(levels.length - 1, levelIndex + (correct ? 1 : -1))));
    setCurrentIndex(currentIndex + 1);
  };

  const resultIndex = Math.max(0, Math.min(levels.length - 1, Math.round((levelIndex + score / 2) / 2)));
  const resultLevel = score <= 1 ? "A0" : score <= 3 ? levels[Math.min(2, resultIndex)] : levels[Math.max(resultIndex, 2)];
  const recommendation = {
    A0: "Рекомендация: начать с основ, 2 раза в неделю, короткие домашние задания и много повторения.",
    A1: "Рекомендация: укрепить базовую грамматику и активную лексику, 1–2 раза в неделю.",
    A2: "Рекомендация: развивать разговорную практику, времена, вопросы и устойчивые фразы.",
    B1: "Рекомендация: больше говорения, текстов, пересказов и работы над типичными ошибками.",
    B2: "Рекомендация: расширять лексику, точность речи и уверенность в сложных ситуациях.",
    C1: "Рекомендация: работать над стилем, нюансами, академической или профессиональной речью.",
    C2: "Рекомендация: точечная работа над естественностью, идиоматикой и сложными текстами.",
  }[resultLevel];

  const reset = () => {
    setStarted(false);
    setCurrentIndex(0);
    setScore(0);
    setLevelIndex(0);
    setHistory([]);
    setFinished(false);
  };

  if (!started) {
    return (
      <Card className="p-6 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 text-3xl text-white">🎯</div>
        <h3 className="text-3xl font-black text-slate-950">Готовы пройти тест?</h3>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Тест начнётся с простых вопросов и будет автоматически менять сложность. Если ответ правильный, следующий вопрос станет сложнее; если ответ неправильный, следующий вопрос станет легче. В тесте есть задание на понимание текста.</p>
        <button type="button" onClick={() => setStarted(true)} className="mt-7 rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 px-8 py-4 font-black text-slate-950 shadow-lg shadow-orange-300/30">Начать тест</button>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white"><div className="text-sm font-bold text-white/70">Ваш примерный уровень</div><div className="mt-2 text-6xl font-black">{resultLevel}</div><p className="mt-4 text-lg leading-8 text-white/80">{recommendation}</p><div className="mt-4 rounded-2xl bg-white/10 p-4 font-bold">Правильных ответов: {score} из {totalQuestions}</div></div>
        <div className="mt-6 grid gap-3">{history.map((item, index) => <div key={index} className={`rounded-2xl p-4 text-sm font-bold ring-1 ${item.correct ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"}`}>{index + 1}. Уровень вопроса: {item.level} • {item.correct ? "правильно" : `неправильно, правильный ответ: ${item.correctAnswer}`}</div>)}</div>
        <button type="button" onClick={reset} className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Пройти ещё раз</button>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-5 ring-1 ring-cyan-100 sm:flex-row sm:items-center"><div><div className="mb-2 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">Вопрос {currentIndex + 1} из {totalQuestions}</div><h3 className="text-2xl font-black text-slate-950">Текущая сложность: {currentLevel}</h3></div><div className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm">Правильно: {score}</div></div>
      <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">{currentQuestion.reading && <div className="mb-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-800">Textverständnis</div>}<div className="mb-5 text-xl font-black leading-8 text-slate-950">{currentQuestion.q}</div><div className="grid gap-3 sm:grid-cols-2">{currentQuestion.options.map((option) => <button key={option} type="button" onClick={() => answerQuestion(option)} className="rounded-2xl bg-white p-4 text-left font-bold text-slate-700 ring-1 ring-slate-100 transition hover:bg-cyan-50 hover:text-cyan-800">{option}</button>)}</div></div>
    </Card>
  );
}

function getQuestionBank(type) {
  return type === "en" ? {
    A0: [{ q: "What ___ your name?", options: ["is", "are", "am", "be"], correct: "is" }, { q: "Choose the correct translation: cat", options: ["кошка", "окно", "книга", "машина"], correct: "кошка" }],
    A1: [{ q: "I ___ coffee every morning.", options: ["drink", "drinks", "drinking", "drank"], correct: "drink" }, { q: "She ___ from Russia.", options: ["is", "are", "am", "be"], correct: "is" }],
    A2: [{ q: "Yesterday we ___ to the cinema.", options: ["go", "went", "gone", "going"], correct: "went" }, { q: "I have lived here ___ 2020.", options: ["for", "since", "from", "during"], correct: "since" }],
    B1: [{ q: "If I had more time, I ___ learn another language.", options: ["will", "would", "can", "am"], correct: "would" }, { q: "Text: Anna missed the bus, so she called a taxi. Why did Anna call a taxi?", options: ["She missed the bus", "She lost her phone", "She was hungry", "She bought a ticket"], correct: "She missed the bus", reading: true }],
    B2: [{ q: "The report ___ by the manager yesterday.", options: ["was written", "wrote", "has write", "is wrote"], correct: "was written" }, { q: "She speaks English very fluently, ___?", options: ["does she", "doesn't she", "is she", "isn't it"], correct: "doesn't she" }],
    C1: [{ q: "Despite ___ tired, he continued working.", options: ["being", "be", "was", "to be"], correct: "being" }, { q: "The proposal was rejected because it was not financially ___.", options: ["viable", "vivid", "various", "vacant"], correct: "viable" }],
    C2: [{ q: "Had I known about the delay, I ___ earlier.", options: ["would leave", "would have left", "will leave", "left"], correct: "would have left" }, { q: "Text: The policy was criticised not for its ambition, but for its lack of practical implementation. What was the main criticism?", options: ["It was too ambitious", "It was not practical enough", "It was too short", "It was too cheap"], correct: "It was not practical enough", reading: true }],
  } : {
    A0: [{ q: "Ich ___ Anastasia.", options: ["bin", "bist", "ist", "sind"], correct: "bin" }, { q: "Was bedeutet: Haus?", options: ["дом", "книга", "вода", "улица"], correct: "дом" }],
    A1: [{ q: "Das ist ___ Buch.", options: ["ein", "eine", "einen", "einem"], correct: "ein" }, { q: "Ich ___ aus Russland.", options: ["komme", "kommt", "kommen", "kommst"], correct: "komme" }],
    A2: [{ q: "Gestern ___ ich Deutsch gelernt.", options: ["habe", "bin", "werde", "hat"], correct: "habe" }, { q: "Ich fahre ___ dem Bus.", options: ["mit", "für", "ohne", "durch"], correct: "mit" }],
    B1: [{ q: "Wenn ich Zeit hätte, ___ ich mehr lesen.", options: ["werde", "würde", "wurde", "bin"], correct: "würde" }, { q: "Text: Anna hat den Bus verpasst. Deshalb nimmt sie ein Taxi. Warum nimmt Anna ein Taxi?", options: ["Sie hat den Bus verpasst", "Sie hat Hunger", "Sie kauft ein Buch", "Sie lernt Deutsch"], correct: "Sie hat den Bus verpasst", reading: true }],
    B2: [{ q: "Der Brief ___ gestern geschrieben.", options: ["wurde", "hat", "ist", "war hat"], correct: "wurde" }, { q: "Ich freue mich ___ den Urlaub.", options: ["auf", "an", "bei", "mit"], correct: "auf" }],
    C1: [{ q: "Obwohl er krank war, ___ er zur Arbeit.", options: ["ging", "gegangen", "geht", "gehen"], correct: "ging" }, { q: "Die Entscheidung wurde nach sorgfältiger Prüfung ___.", options: ["getroffen", "gemacht", "genommen", "gestellt"], correct: "getroffen" }],
    C2: [{ q: "Hätte ich das gewusst, ___ ich anders reagiert.", options: ["hätte", "wäre", "würde haben", "hätte gehabt"], correct: "hätte" }, { q: "Text: Die Maßnahme wurde weniger wegen ihres Ziels kritisiert, sondern wegen der fehlenden praktischen Umsetzbarkeit. Was war das Hauptproblem?", options: ["Das Ziel war falsch", "Die Umsetzung war nicht praktikabel", "Die Maßnahme war zu billig", "Der Text war zu kurz"], correct: "Die Umsetzung war nicht praktikabel", reading: true }],
  };
}

function LanguagePage({ type, onHome }) {
  const data = site[type];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const nav = [["Обо мне", "#about"], ["Программа", "#program"], ["Формат", "#format"], ["Тест уровня", "#level-test"], ["Стоимость", "#pricing"], ["FAQ", "#faq"], ["Контакты", "#contact"]];

  return (
    <div className="min-h-screen scroll-smooth bg-[#f7fbff] text-slate-900">
      <BackgroundBlobs />
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><a href="#top" className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${data.accent} text-sm font-black text-white`}>{data.langIcon}</div><div><div className="text-base font-black leading-tight">{data.logo}</div><div className="text-xs font-semibold text-slate-500">{data.subject}</div></div></a><nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex">{nav.map(([label, href]) => <a key={label} href={href} className="hover:text-cyan-700">{label}</a>)}</nav><div className="hidden items-center gap-3 lg:flex"><button onClick={onHome} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">На главную</button><Button>Бесплатный урок</Button></div><button className="rounded-2xl bg-slate-100 p-2 text-2xl leading-none lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? "×" : "☰"}</button></div>
        {mobileOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden"><div className="grid gap-3">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2 font-semibold text-slate-700 hover:bg-cyan-50">{label}</a>)}<button onClick={onHome} className="rounded-2xl bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700">На главную</button></div></div>}
      </header>

      <main id="top">
        <Hero data={data} />
        <TrustSection />
        <AboutSection data={data} />
        <AudienceSection data={data} />
        <ProgramSection data={data} />
        <GrammarSection data={data} />
        <SpeakingSection data={data} />
        <FormatSection />
        <LevelTestSection type={type} />
        <LearningPlanSection type={type} />
        <MiniCards data={data} />
        <PricingSection data={data} type={type} />
        <Testimonials data={data} />
        <FAQSection />
        <ContactSection type={type} sent={sent} setSent={setSent} />
        <LegalSection />
      </main>

      <Footer data={data} onHome={onHome} />
    </div>
  );
}

function Hero({ data }) {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div initial="hidden" animate="visible" variants={stagger}><motion.div variants={fadeUp} className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-cyan-100"><span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-950">Первый урок бесплатно</span>Начать можно с любого уровня</motion.div><motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">{data.heroTitle}</motion.h1><motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">{data.heroText}</motion.p><motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row"><Button>Записаться на бесплатный пробный урок</Button><Button href="#level-test" variant="light">Пройти тест уровня</Button></motion.div><motion.div variants={fadeUp} className="mt-7 rounded-3xl border border-cyan-100 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm sm:text-base">Индивидуальный подход • MTS Link • Miro • Практика с первого урока</motion.div></motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.75 }} className="relative rounded-[2rem] bg-gradient-to-br from-white to-cyan-50 p-5 shadow-2xl shadow-cyan-900/10 ring-1 ring-white"><div className="grid gap-4 sm:grid-cols-2">{[["chat", "Говорим с первого урока", "Диалоги, вопросы и реальные ситуации."], ["brain", "Грамматика понятно", "Без сложных терминов — с примерами."], ["book", "Лексика для жизни", "Слова и фразы, которые пригодятся."], ["target", "План под вашу цель", "Школа, работа, путешествия или разговорная практика."]].map(([icon, title, text], i) => <div key={title} className={`rounded-3xl p-5 ${i === 0 ? "bg-yellow-50" : i === 1 ? "bg-cyan-50" : i === 2 ? "bg-violet-50" : "bg-orange-50"}`}><IconBubble name={icon} /><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div><div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white"><div className="font-black">Онлайн-уроки 60 минут</div><div className="text-sm text-white/70">MTS Link • Miro • домашние задания по необходимости</div></div></motion.div>
      </div>
    </section>
  );
}

function TrustSection() {
  return <section className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">{[["Опыт", "Индивидуальная работа с разными возрастами"], ["Формат", "Онлайн, удобно и структурно"], ["Материалы", "Miro, карточки, упражнения, примеры"], ["Результат", "Цель, обратная связь и контроль прогресса"]].map(([title, text]) => <Card key={title} className="p-5"><div className="text-2xl">✨</div><h3 className="mt-3 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></section>;
}

function AboutSection({ data }) {
  return <section id="about" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]"><div className="relative"><div className="aspect-square rounded-[2rem] bg-gradient-to-br from-cyan-200 via-yellow-100 to-violet-200 p-6 shadow-xl"><div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-white/90 bg-white/65 text-center"><div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-5xl text-white">😊</div><p className="mt-5 text-xl font-black">Фото Anastasia</p><p className="mt-2 max-w-xs text-sm text-slate-600">Здесь лучше разместить настоящее фото — это повышает доверие.</p></div></div><div className="absolute -bottom-5 left-8 rounded-3xl bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-lg">Ошибки — это часть обучения ✨</div></div><div><div className="mb-3 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-800">Обо мне</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Личный подход, понятные объяснения и спокойная атмосфера</h2><p className="mt-5 text-lg leading-8 text-slate-600">{data.about}</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{["Понятные объяснения без сложных терминов", "Индивидуальная программа под цель ученика", "Много практики и живого общения", "Поддержка между занятиями"].map((item) => <div key={item} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><span className="font-black text-cyan-600">✓</span><span className="font-semibold text-slate-700">{item}</span></div>)}</div></div></div></section>;
}

function AudienceSection({ data }) { return <section className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Для кого занятия" title={`${data.langLabel} под вашу цель и темп`} text="Занятия подходят тем, кто хочет понять язык, говорить увереннее и видеть реальный прогресс без лишнего стресса." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">{data.audience.map(([title, text, icon]) => <Card key={title} className="h-full p-6 transition hover:-translate-y-1"><IconBubble name={icon} /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></div></section>; }
function ProgramSection({ data }) { return <section id="program" className="bg-white px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Лексика" title={data.vocabTitle} text="Мы изучаем слова через ситуации, примеры и разговорную практику." /><div className="grid gap-4 lg:grid-cols-5">{data.vocabCards.map(([title, text, icon]) => <Card key={title} className="h-full bg-gradient-to-br from-cyan-50 to-white p-5"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></div></section>; }
function GrammarSection({ data }) { return <section className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Грамматика" title={data.grammarTitle} text={data.grammarText} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.grammarTopics.map((topic, index) => <div key={topic} className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"><IconBubble name="pen" /><div className="mt-4 text-xs font-black uppercase tracking-wider text-cyan-600">Тема {index + 1}</div><h3 className="mt-2 font-black text-slate-900">{topic}</h3></div>)}</div></div></section>; }
function SpeakingSection({ data }) { return <section className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-14"><div><div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">Разговорная практика</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{data.speakingTitle}</h2><p className="mt-5 text-lg leading-8 text-white/75">{data.speakingCallout}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Диалоги из реальной жизни", "Ролевые ситуации", "Вопросы и ответы", "Тренировка произношения", "Развитие уверенности", "Исправление ошибок без давления"].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-bold">✓ {item}</div>)}</div></div><div className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl"><div className="rounded-[1.35rem] bg-gradient-to-br from-cyan-50 via-yellow-50 to-violet-50 p-6"><div className="text-5xl">🎧</div><h3 className="mt-5 text-2xl font-black">Практика в комфортном темпе</h3><p className="mt-3 leading-7 text-slate-600">Вы говорите больше, получаете понятную обратную связь и постепенно перестаёте бояться ошибок.</p></div></div></div></section>; }
function FormatSection() { return <section id="format" className="bg-white px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Формат занятий" title="Онлайн-уроки, которые удобно встроить в ваш график" text="Все занятия проходят онлайн в MTS Link. Для интерактивных материалов, схем, упражнений и совместной работы используется Miro." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[["video", "Онлайн-занятия"], ["heart", "Индивидуальные уроки"], ["clock", "60 минут"], ["star", "Бесплатный пробный урок"], ["pen", "Домашние задания по необходимости"], ["book", "Все материалы предоставляются"], ["globe", "MTS Link и Miro"], ["sparkle", "Гибкое расписание"]].map(([icon, title]) => <div key={title} className="rounded-[1.5rem] bg-slate-50 p-5 shadow-sm ring-1 ring-slate-100"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3></div>)}</div></div></section>; }
function LevelTestSection({ type }) { return <section id="level-test" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl"><SectionHeader eyebrow="Тест уровня" title="Какой у вас уровень языка?" text="Короткий онлайн-тест поможет примерно определить уровень перед пробным занятием." /><LevelTest type={type} /></div></section>; }
function LearningPlanSection({ type }) { const month = type === "en" ? ["Месяц 1: база, активная лексика, простые диалоги", "Месяц 2: грамматика в речи, тексты и аудио", "Месяц 3: уверенное общение, типичные ситуации, итоговый прогресс"] : ["Месяц 1: произношение, артикли, базовые фразы", "Месяц 2: падежи, порядок слов, повседневные диалоги", "Месяц 3: уверенная речь, тексты, реальные ситуации"]; return <section className="bg-gradient-to-br from-cyan-50 via-white to-yellow-50 px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="План обучения" title="Что можно улучшить за 3 месяца" text="План всегда адаптируется под цель ученика, но общий прогресс обычно строится по понятным этапам." /><div className="grid gap-5 md:grid-cols-3">{month.map((item, index) => <Card key={item} className="p-6"><div className="text-4xl font-black text-cyan-500">{index + 1}</div><h3 className="mt-4 text-xl font-black">{item}</h3></Card>)}</div></div></section>; }
function MiniCards({ data }) { return <section className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Мини-карточки" title="Небольшие примеры того, как мы учимся" text="Карточки помогают повторять лексику, грамматику и полезные фразы." /><div className="grid gap-5 md:grid-cols-3">{data.cards.map(([label, title, meta, example]) => <Card key={title} className="bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6"><div className="mb-5 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">{label}</div><h3 className="text-2xl font-black text-slate-950">{title}</h3><p className="mt-3 font-bold text-cyan-700">{meta}</p><p className="mt-4 rounded-2xl bg-white p-4 text-slate-700 shadow-sm">{example}</p></Card>)}</div></div></section>; }
function PricingSection({ data, type }) { return <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Стоимость занятий" title="Стоимость занятий" text="Первый урок бесплатно. После пробного занятия вы сможете спокойно решить, подходит ли вам формат." /><div className="grid gap-6 lg:grid-cols-3">{data.prices.map(([title, price, desc, button, badge], index) => <Card key={title} className={`p-8 ${index === 2 ? "ring-2 ring-yellow-300" : "ring-cyan-100"}`}><div className={`${index === 2 ? "bg-yellow-300 text-slate-950" : "bg-cyan-100 text-cyan-800"} mb-4 inline-flex rounded-full px-4 py-2 text-sm font-black`}>{badge}</div><h3 className="text-2xl font-black text-slate-950">{title}</h3><div className="mt-5 text-4xl font-black text-slate-950">{price}</div>{type === "en" && index === 1 && <div className="mt-3 rounded-2xl bg-cyan-50 p-3 text-sm font-black text-cyan-800">1 раз в неделю — 1400 ₽ за 1 урок</div>}{type === "en" && index === 2 && <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm font-black text-orange-800 ring-1 ring-yellow-200">Минимум 2 раза в неделю — 1200 ₽ за 1 урок</div>}{type === "de" && index === 1 && <div className="mt-3 rounded-2xl bg-cyan-50 p-3 text-sm font-black text-cyan-800">1 раз в неделю — 1000 ₽ за 1 урок</div>}{type === "de" && index === 2 && <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm font-black text-orange-800 ring-1 ring-yellow-200">Минимум 2 раза в неделю — 800 ₽ за 1 урок</div>}<p className="mt-5 leading-7 text-slate-600">{desc}</p><Button className={`mt-7 w-full ${index === 2 ? "from-orange-400 to-yellow-400 text-slate-950 shadow-yellow-500/20 hover:from-orange-500 hover:to-yellow-500" : ""}`}>{button}</Button></Card>)}</div><p className="mt-6 text-center font-semibold text-slate-600">Занятия проходят онлайн. Материалы предоставляются. Расписание подбирается индивидуально.</p><div className="mt-5 rounded-3xl bg-white p-5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-100">Оплата, переносы и отмены согласуются индивидуально. Для стабильного результата обычно лучше заниматься 2 раза в неделю.</div></div></section>; }
function Testimonials({ data }) { return <section className="bg-white px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Отзывы учеников" title="Что говорят после занятий" /><div className="grid gap-5 md:grid-cols-3">{data.testimonials.map((text, index) => <Card key={text} className="bg-gradient-to-br from-slate-50 to-white p-6"><div className="text-5xl text-cyan-500">“</div><p className="mt-4 text-lg font-bold leading-8 text-slate-800">«{text}»</p><div className="mt-6 text-yellow-400">★★★★★</div><p className="mt-3 text-sm font-semibold text-slate-500">Ученик {index + 1}</p></Card>)}</div></div></section>; }
function FAQSection() { return <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><SectionHeader eyebrow="Частые вопросы" title="Перед первым уроком" text="Здесь собраны ответы на вопросы, которые чаще всего задают перед записью." /><div className="grid gap-3">{faq.map((item, index) => <FAQItem key={item[0]} item={item} index={index} />)}</div></div></section>; }
function ContactSection({ type, sent, setSent }) { return <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-6 text-white shadow-2xl sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14"><div><div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold">Запись на урок</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Хотите начать учить {type === "en" ? "английский" : "немецкий"} онлайн?</h2><p className="mt-5 text-lg leading-8 text-white/80">Оставьте заявку, и я свяжусь с вами, чтобы обсудить ваш уровень, цели и удобное время для бесплатного пробного урока.</p><div className="mt-8 grid gap-3">{[["telegram", "Telegram"], ["whatsapp", "WhatsApp"], ["mail", "E-mail"], ["vk", "VK"]].map(([icon, label]) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-bold"><Icon name={icon} />{label}</div>)}</div></div><form className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl sm:p-7" onSubmit={(e) => { e.preventDefault(); setSent(true); }}><div className="grid gap-4 sm:grid-cols-2">{["Имя", "Возраст или класс", "Уровень языка", "Удобный способ связи"].map((label) => <label key={label} className="grid gap-2 text-sm font-bold text-slate-700">{label}<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder={label} /></label>)}<label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Цель обучения<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Школа, работа, путешествия, разговорная практика..." /></label><label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Сообщение<textarea rows={4} className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Расскажите коротко, что хотите улучшить" /></label></div><button type="submit" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 py-4 text-base font-black text-slate-950 shadow-lg">➤ Отправить заявку</button>{sent && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center font-black text-emerald-800 ring-1 ring-emerald-100">Заявка визуально отправлена. Для реальной отправки нужно подключить форму к почте, CRM или мессенджеру.</div>}<p className="mt-4 text-center text-sm font-semibold text-slate-500">Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p></form></div></section>; }
function LegalSection() { return <section className="px-4 pb-20 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><Card className="p-6"><div className="grid gap-5 md:grid-cols-3">{[["Datenschutz", "Персональные данные используются только для связи, организации занятий и ведения учебного процесса."], ["Schülerdaten", "Для реального запуска личного кабинета нужен защищённый сервер, база данных и отдельные права доступа."], ["Regeln", "Условия оплаты, переноса и отмены занятий лучше согласовать письменно перед началом регулярных уроков."]].map(([title, text]) => <div key={title}><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></Card></div></section>; }
function Footer({ data, onHome }) { return <footer className="border-t border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><div><div className="flex items-center gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${data.accent} text-sm font-black`}>{data.langIcon}</div><div><div className="font-black">Anastasia</div><div className="text-sm text-white/60">{data.subject}</div></div></div><p className="mt-5 text-sm leading-6 text-white/60">Дружелюбные онлайн-занятия для школьников, студентов и взрослых.</p></div><div><h4 className="font-black">Занятия</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Бесплатный пробный урок</span><span>{data.prices[1][1]}</span><span>{data.prices[2][1]} при занятиях от 2 раз в неделю</span></div></div><div><h4 className="font-black">Контакты</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Telegram</span><span>WhatsApp</span><span>E-mail</span><span>VK</span></div></div><div><h4 className="font-black">Информация</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><a href="#contact" className="hover:text-white">Записаться на урок</a><a href="#level-test" className="hover:text-white">Тест уровня</a><button onClick={onHome} className="text-left hover:text-white">На главную</button></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-white/45">© 2026 Anastasia. Онлайн-занятия. Все права защищены.</div></footer>; }

export default function App() {
  const [page, setPage] = useState(null);
  if (page === "students") return <StudentPortal onBack={() => setPage(null)} />;
  if (page === "en" || page === "de") return <LanguagePage type={page} onHome={() => setPage(null)} />;
  return <Home onChoose={setPage} />;
}
