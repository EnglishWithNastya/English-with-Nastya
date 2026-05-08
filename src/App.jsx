import React, { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const students = ["Max", "Masha", "Polina", "Igor", "Sonja", "Vanja", "Katya", "Amelia", "Denis"];

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
  down: "⌄",
  headphones: "🎧",
  smile: "😊",
  rocket: "🚀",
  mail: "✉️",
  telegram: "✈",
  whatsapp: "☘",
  vk: "VK",
  user: "👤",
  parent: "👨‍👩‍👧",
  checklist: "✅",
};

const site = {
  en: {
    logo: "Anastasia English",
    subject: "английский онлайн",
    langLabel: "Английский",
    langIcon: "EN",
    heroTitle: "Английский язык онлайн — понятно, интересно и с результатом",
    heroText:
      "Индивидуальные онлайн-занятия по английскому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, разговорную практику и уверенность в речи.",
    about:
      "Меня зовут Anastasia, я репетитор по английскому языку. Я помогаю ученикам разобраться в грамматике, расширить словарный запас и начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем английский в реальных ситуациях.",
    audience: [
      ["Школьники", "Домашние задания, грамматика, словарный запас и подготовка к контрольным.", "cap"],
      ["Студенты", "Английский для учёбы, презентаций, экзаменов и академической коммуникации.", "book"],
      ["Взрослые", "Английский для работы, путешествий, общения и уверенности в речи.", "work"],
      ["Начинающие", "Спокойный старт без стресса и понятная база.", "smile"],
      ["Продолжающие", "Повторение грамматики, лексика и разговорные навыки.", "rocket"],
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
      ["Бесплатный пробный урок", "0 ₽", "На пробном занятии мы познакомимся, определим ваш уровень английского, обсудим цели и составим индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["1 урок в неделю", "1400 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока, если вы занимаетесь 1 раз в неделю.", "Записаться на урок", "Стандартный формат"],
      ["От 2 уроков в неделю", "1200 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях минимум 2 раза в неделю. 1200 ₽ за урок вместо 1400 ₽.", "Выбрать формат", "Выгоднее при регулярных занятиях"],
    ],
    testimonials: ["После занятий я наконец-то понял времена и стал увереннее говорить.", "Очень понятные объяснения и приятная атмосфера на уроках.", "Мне нравится, что мы много практикуем лексику и реальные диалоги."],
  },
  de: {
    logo: "Anastasia Deutsch",
    subject: "немецкий онлайн",
    langLabel: "Немецкий",
    langIcon: "DE",
    heroTitle: "Немецкий язык онлайн — спокойно, понятно и с результатом",
    heroText:
      "Индивидуальные онлайн-занятия по немецкому языку для школьников, студентов и взрослых — с акцентом на лексику, грамматику, произношение, разговорную практику и уверенность в речи.",
    about:
      "Меня зовут Anastasia, я репетитор по немецкому языку. Я помогаю ученикам разобраться в грамматике, пополнить словарный запас и постепенно начать говорить увереннее. На занятиях мы не просто учим правила, а сразу применяем немецкий в реальных ситуациях.",
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
      ["Бесплатный пробный урок", "0 ₽", "На пробном занятии мы познакомимся, определим ваш уровень немецкого, обсудим цели и составим индивидуальный план обучения.", "Записаться бесплатно", "Первый шаг"],
      ["1 урок в неделю", "1000 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока, если вы занимаетесь 1 раз в неделю.", "Записаться на урок", "Стандартный формат"],
      ["От 2 уроков в неделю", "800 ₽ / 60 минут", "Стоимость одного индивидуального онлайн-урока при занятиях минимум 2 раза в неделю. 800 ₽ за урок вместо 1000 ₽.", "Выбрать формат", "Выгоднее при регулярных занятиях"],
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
];

function Icon({ name, className = "" }) {
  return <span className={className}>{icons[name] || "✨"}</span>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[1.75rem] bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 ${className}`}>{children}</div>;
}

function IconBubble({ name }) {
  return <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 via-blue-100 to-violet-100 text-xl shadow-sm"><Icon name={name} /></div>;
}

function Button({ children, href = "#contact", className = "", onClick }) {
  if (onClick) {
    return <button onClick={onClick} className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-700 ${className}`}>{children}</button>;
  }
  return <a href={href} className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 text-center font-black text-white shadow-xl shadow-cyan-500/25 transition hover:from-cyan-600 hover:to-blue-700 ${className}`}>{children}</a>;
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
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/55 blur-3xl" />
        <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-yellow-200/55 blur-3xl" />
        <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/45 blur-3xl" />
      </div>
      <motion.div initial="hidden" animate="visible" variants={stagger} className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center text-center">
        <motion.div variants={fadeUp} className="mb-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm ring-1 ring-cyan-100">Anastasia • онлайн-уроки иностранных языков</motion.div>
        <motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">Что вы хотите сделать?</motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Выберите направление обучения или войдите в личный профиль ученика.</motion.p>
        <motion.div variants={fadeUp} className="mt-10 grid w-full gap-6 lg:grid-cols-3">
          <button onClick={() => onChoose("en")} className="rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-cyan-900/10 ring-1 ring-cyan-100 transition hover:-translate-y-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl font-black text-white">EN</div>
            <h2 className="mt-6 text-3xl font-black">Английский язык</h2>
            <p className="mt-3 leading-7 text-slate-600">Лексика, грамматика, разговорная практика, школа, учёба, работа и путешествия.</p>
            <div className="mt-6 rounded-2xl bg-cyan-50 p-4 font-bold text-cyan-800">Открыть страницу английского</div>
          </button>
          <button onClick={() => onChoose("de")} className="rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-violet-900/10 ring-1 ring-violet-100 transition hover:-translate-y-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-violet-600 text-2xl font-black text-white">DE</div>
            <h2 className="mt-6 text-3xl font-black">Немецкий язык</h2>
            <p className="mt-3 leading-7 text-slate-600">Артикли, падежи, порядок слов, произношение и разговорная практика.</p>
            <div className="mt-6 rounded-2xl bg-yellow-50 p-4 font-bold text-orange-800">Открыть страницу немецкого</div>
          </button>
          <button onClick={() => onChoose("students")} className="rounded-[2rem] bg-white p-7 text-left shadow-2xl shadow-slate-900/10 ring-1 ring-slate-100 transition hover:-translate-y-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-violet-600 text-3xl text-white">👤</div>
            <h2 className="mt-6 text-3xl font-black">Я уже ученик</h2>
            <p className="mt-3 leading-7 text-slate-600">Перейдите в профиль ученика и выберите информацию для ученика или для родителей.</p>
            <div className="mt-6 rounded-2xl bg-violet-50 p-4 font-bold text-violet-800">Открыть профили учеников</div>
          </button>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-8 text-sm font-semibold text-slate-500">Первый пробный урок бесплатно • Начать можно с любого уровня</motion.p>
      </motion.div>
    </div>
  );
}

function StudentPortal({ onBack }) {
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
  };

  const germanStudents = ["Sonja", "Vanja"];

  const weeklyWords = {
    en: [
      { word: "breakfast", answer: "завтрак", options: ["завтрак", "поезд", "тетрадь", "окно"] },
      { word: "umbrella", answer: "зонт", options: ["ключ", "зонт", "сумка", "вода"] },
      { word: "homework", answer: "домашнее задание", options: ["покупка", "домашнее задание", "звонок", "погода"] },
      { word: "wallet", answer: "кошелёк", options: ["кошелёк", "зеркало", "ручка", "стул"] },
      { word: "appointment", answer: "встреча / запись", options: ["встреча / запись", "завтрак", "рубашка", "улица"] },
      { word: "neighbour", answer: "сосед", options: ["врач", "сосед", "учитель", "водитель"] },
      { word: "receipt", answer: "чек", options: ["чек", "карта", "дверь", "чай"] },
      { word: "schedule", answer: "расписание", options: ["расписание", "ошибка", "молоко", "письмо"] },
    ],
    de: [
      { word: "das Frühstück", answer: "завтрак", options: ["завтрак", "поезд", "тетрадь", "окно"] },
      { word: "der Regenschirm", answer: "зонт", options: ["ключ", "зонт", "сумка", "вода"] },
      { word: "die Hausaufgabe", answer: "домашнее задание", options: ["покупка", "домашнее задание", "звонок", "погода"] },
      { word: "die Geldbörse", answer: "кошелёк", options: ["кошелёк", "зеркало", "ручка", "стул"] },
      { word: "der Termin", answer: "встреча / запись", options: ["встреча / запись", "завтрак", "рубашка", "улица"] },
      { word: "der Nachbar", answer: "сосед", options: ["врач", "сосед", "учитель", "водитель"] },
      { word: "die Quittung", answer: "чек", options: ["чек", "карта", "дверь", "чай"] },
      { word: "der Stundenplan", answer: "расписание", options: ["расписание", "ошибка", "молоко", "письмо"] },
    ],
  };

  function getMondayWeekKey() {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  }

  function getQuizForStudent(studentName) {
    const language = germanStudents.includes(studentName) ? "de" : "en";
    const list = weeklyWords[language];
    const weekKey = getMondayWeekKey();
    const start = new Date("2026-01-05T00:00:00");
    const monday = new Date(`${weekKey}T00:00:00`);
    const weekIndex = Math.max(0, Math.floor((monday - start) / (7 * 24 * 60 * 60 * 1000)));
    return { ...list[weekIndex % list.length], language, weekKey, id: `${studentName}-${language}-${weekKey}` };
  }

  function readQuizState(studentName) {
    const quiz = getQuizForStudent(studentName);
    const raw = localStorage.getItem(`weekly-word-${quiz.id}`);
    return raw ? JSON.parse(raw) : { answered: false, correct: false, points: 0, selected: null };
  }

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [student, setStudent] = useState(null);
  const [view, setView] = useState(null);
  const [error, setError] = useState("");
  const [quizState, setQuizState] = useState(null);

  const login = () => {
    const cleanName = name.trim();
    if (accounts[cleanName] && accounts[cleanName] === password) {
      setStudent(cleanName);
      setView(null);
      setError("");
      setPassword("");
      setQuizState(readQuizState(cleanName));
      return;
    }
    setError("Неверное имя или пароль. Проверьте данные и попробуйте ещё раз.");
  };

  const logout = () => {
    setStudent(null);
    setView(null);
    setName("");
    setPassword("");
    setError("");
    setQuizState(null);
  };

  const currentQuiz = student ? getQuizForStudent(student) : null;

  const answerWeeklyQuiz = (option) => {
    if (!student || !currentQuiz || quizState?.answered) return;
    const correct = option === currentQuiz.answer;
    const nextState = { answered: true, correct, points: correct ? 10 : 0, selected: option };
    localStorage.setItem(`weekly-word-${currentQuiz.id}`, JSON.stringify(nextState));
    setQuizState(nextState);
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-[#f7fbff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-200/55 blur-3xl" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-yellow-200/55 blur-3xl" />
          <div className="absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-violet-200/45 blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl">
          <button onClick={onBack} className="mb-6 rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
          <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm ring-1 ring-cyan-100">Личный кабинет ученика</motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">Войдите в свой профиль</motion.h1>
              <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-slate-600">Введите своё имя и пароль. После входа вы увидите только свой личный профиль, материалы, домашние задания и информацию для родителей.</motion.p>
              <motion.div variants={fadeUp} className="mt-6 rounded-3xl bg-yellow-50 p-5 font-bold text-orange-800 ring-1 ring-yellow-100">Данные каждого ученика открываются только после входа.</motion.div>
            </motion.div>

            <Card className="p-7">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-600 text-3xl text-white">👤</div>
              <h2 className="text-3xl font-black">Вход для ученика</h2>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Имя пользователя
                  <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Например: Max" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Пароль
                  <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} type="password" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Введите пароль" />
                </label>
                {error && <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div>}
                <Button onClick={login} className="w-full">Войти в профиль</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (view) {
    return (
      <div className="min-h-screen bg-[#f7fbff] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex flex-wrap gap-3">
            <button onClick={() => setView(null)} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← Назад к разделам</button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
          </div>
          <Card className="p-8">
            <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Профиль ученика: {student}</div>
            <h1 className="text-4xl font-black">{view === "student" ? "Информация для ученика" : "Информация для родителей"}</h1>
            {view === "student" ? (
              <>
                <div className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6 ring-1 ring-cyan-100">
                  <div className="mb-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">
                    Слово недели • обновляется каждый понедельник в 00:00
                  </div>
                  <h2 className="text-3xl font-black text-slate-950">{currentQuiz?.word}</h2>
                  <p className="mt-2 text-slate-600">
                    Выберите правильный перевод. За правильный ответ — 10 баллов. За ошибку — 0 баллов.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {currentQuiz?.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => answerWeeklyQuiz(option)}
                        disabled={quizState?.answered}
                        className={`rounded-2xl p-4 text-left font-black ring-1 transition ${quizState?.answered && option === currentQuiz.answer ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : quizState?.answered && option === quizState.selected ? "bg-red-50 text-red-700 ring-red-200" : "bg-white text-slate-800 ring-slate-100 hover:bg-cyan-50"}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {quizState?.answered && (
                    <div className={`mt-5 rounded-2xl p-4 font-black ${quizState.correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                      {quizState.correct ? "Правильно! Вы получили 10 баллов." : `Неправильно. Правильный ответ: ${currentQuiz.answer}. Баллы: 0.`}
                    </div>
                  )}
                  <div className="mt-4 rounded-2xl bg-white p-4 font-bold text-slate-700 shadow-sm">
                    Баллы за это слово недели: {quizState?.points || 0} / 10
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {[
                    ["Следующий урок", "Дата и время будут добавлены здесь."],
                    ["Домашнее задание", "Здесь будет домашнее задание после урока."],
                    ["Материалы", "Ссылки на Miro, слова, грамматику и упражнения."],
                    ["Цель", "Короткая цель на ближайшие занятия."],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                      <h3 className="text-xl font-black">{title}</h3>
                      <p className="mt-2 leading-7 text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  ["Прогресс", "Здесь можно кратко фиксировать прогресс ученика."],
                  ["Посещаемость", "Информация о прошедших и запланированных уроках."],
                  ["Оплата", "Здесь можно добавить статус оплаты и выбранный формат занятий."],
                  ["Рекомендации", "Короткие рекомендации для поддержки обучения дома."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                    <h3 className="text-xl font-black">{title}</h3>
                    <p className="mt-2 leading-7 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <button onClick={onBack} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
          <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
        </div>
        <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Вы вошли как: {student}</div>
        <h1 className="text-4xl font-black sm:text-5xl">Личный профиль</h1>
        <p className="mt-4 text-lg text-slate-600">Выберите, какой раздел открыть.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <button onClick={() => setView("student")} className="rounded-[2rem] bg-white p-8 text-left shadow-xl ring-1 ring-cyan-100 transition hover:-translate-y-1">
            <div className="text-5xl">👤</div>
            <h2 className="mt-5 text-3xl font-black">Для ученика</h2>
            <p className="mt-3 leading-7 text-slate-600">Домашнее задание, материалы, цель урока и полезные заметки.</p>
          </button>
          <button onClick={() => setView("parents")} className="rounded-[2rem] bg-white p-8 text-left shadow-xl ring-1 ring-yellow-100 transition hover:-translate-y-1">
            <div className="text-5xl">👨‍👩‍👧</div>
            <h2 className="mt-5 text-3xl font-black">Для родителей</h2>
            <p className="mt-3 leading-7 text-slate-600">Прогресс, посещаемость, рекомендации и организационная информация.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguagePage({ type, onHome }) {
  const data = site[type];
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = [["Обо мне", "#about"], ["Программа", "#program"], ["Формат", "#format"], ["Стоимость", "#pricing"], ["FAQ", "#faq"], ["Контакты", "#contact"]];

  return (
    <div className="min-h-screen scroll-smooth bg-[#f7fbff] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500 text-sm font-black text-white">{data.langIcon}</div>
            <div><div className="text-base font-black leading-tight">{data.logo}</div><div className="text-xs font-semibold text-slate-500">{data.subject}</div></div>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 lg:flex">{nav.map(([label, href]) => <a key={label} href={href} className="hover:text-cyan-700">{label}</a>)}</nav>
          <div className="hidden items-center gap-3 lg:flex"><button onClick={onHome} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">На главную</button><Button>Бесплатный урок</Button></div>
          <button className="rounded-2xl bg-slate-100 p-2 text-2xl leading-none lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? "×" : "☰"}</button>
        </div>
        {mobileOpen && <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden"><div className="grid gap-3">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded-2xl px-3 py-2 font-semibold text-slate-700 hover:bg-cyan-50">{label}</a>)}<button onClick={onHome} className="rounded-2xl bg-slate-100 px-3 py-2 text-left font-semibold text-slate-700">На главную</button></div></div>}
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-5 inline-flex flex-wrap items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-cyan-100"><span className="rounded-full bg-yellow-300 px-2 py-0.5 text-slate-950">Первый урок бесплатно</span>Начать можно с любого уровня</motion.div>
              <motion.h1 variants={fadeUp} className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">{data.heroTitle}</motion.h1>
              <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-8 text-slate-600 sm:text-xl">{data.heroText}</motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row"><Button>Записаться на бесплатный пробный урок</Button><a href="#program" className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-6 py-4 text-center font-black text-slate-950 shadow-sm hover:bg-yellow-50">Посмотреть программу</a></motion.div>
              <motion.div variants={fadeUp} className="mt-7 rounded-3xl border border-cyan-100 bg-white/80 p-4 text-sm font-bold text-slate-700 shadow-sm sm:text-base">Индивидуальный подход • Онлайн-формат • Понятные объяснения • Практика с первого урока</motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.75 }} className="relative rounded-[2rem] bg-gradient-to-br from-white to-cyan-50 p-5 shadow-2xl shadow-cyan-900/10 ring-1 ring-white">
              <div className="grid gap-4 sm:grid-cols-2">
                {[["chat", "Говорим с первого урока", "Диалоги, вопросы и реальные ситуации."], ["brain", "Грамматика понятно", "Без сложных терминов — с примерами."], ["book", "Лексика для жизни", "Слова и фразы, которые пригодятся."], ["target", "План под вашу цель", "Школа, работа, путешествия или разговорная практика."]].map(([icon, title, text], i) => (
                  <div key={title} className={`rounded-3xl p-5 ${i === 0 ? "bg-yellow-50" : i === 1 ? "bg-cyan-50" : i === 2 ? "bg-violet-50" : "bg-orange-50"}`}><IconBubble name={icon} /><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>
                ))}
              </div>
              <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white"><div className="font-black">Онлайн-уроки 60 минут</div><div className="text-sm text-white/70">MTS Link • Miro</div></div>
            </motion.div>
          </div>
        </section>

        <section id="about" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative">
              <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-cyan-200 via-yellow-100 to-violet-200 p-6 shadow-xl"><div className="flex h-full flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-white/90 bg-white/65 text-center"><div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-5xl text-white">😊</div><p className="mt-5 text-xl font-black">Фото или аватар</p><p className="mt-2 max-w-xs text-sm text-slate-600">Добавьте личное фото, чтобы сайт выглядел ещё доверительнее.</p></div></div>
              <div className="absolute -bottom-5 left-8 rounded-3xl bg-white px-5 py-3 text-sm font-black text-slate-800 shadow-lg">Ошибки — это часть обучения ✨</div>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp} className="mb-3 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-800">Обо мне</motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl font-black tracking-tight sm:text-5xl">Личный подход, понятные объяснения и спокойная атмосфера</motion.h2>
              <motion.p variants={fadeUp} className="mt-5 text-lg leading-8 text-slate-600">{data.about}</motion.p>
              <motion.div variants={stagger} className="mt-8 grid gap-4 sm:grid-cols-2">{["Понятные объяснения без сложных терминов", "Индивидуальная программа под цель ученика", "Много практики и живого общения", "Удобный онлайн-формат"].map((item) => <motion.div variants={fadeUp} key={item} className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100"><span className="font-black text-cyan-600">✓</span><span className="font-semibold text-slate-700">{item}</span></motion.div>)}</motion.div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Для кого занятия" title={`${data.langLabel} под вашу цель и темп`} text="Занятия подходят тем, кто хочет понять язык, говорить увереннее и видеть реальный прогресс без лишнего стресса." /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">{data.audience.map(([title, text, icon]) => <Card key={title} className="h-full p-6 transition hover:-translate-y-1"><IconBubble name={icon} /><h3 className="mt-5 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></div>
        </section>

        <section id="program" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Лексика" title={data.vocabTitle} text="Мы изучаем слова через ситуации, примеры и разговорную практику." /><div className="grid gap-4 lg:grid-cols-5">{data.vocabCards.map(([title, text, icon]) => <Card key={title} className="h-full bg-gradient-to-br from-cyan-50 to-white p-5"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card>)}</div></div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Грамматика" title={data.grammarTitle} text={data.grammarText} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.grammarTopics.map((topic, index) => <div key={topic} className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-100"><IconBubble name="pen" /><div className="mt-4 text-xs font-black uppercase tracking-wider text-cyan-600">Тема {index + 1}</div><h3 className="mt-2 font-black text-slate-900">{topic}</h3></div>)}</div></div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950 p-6 text-white shadow-2xl sm:p-10 lg:grid-cols-[1fr_0.9fr] lg:p-14"><div><div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100">Разговорная практика</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">{data.speakingTitle}</h2><p className="mt-5 text-lg leading-8 text-white/75">{data.speakingCallout}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Диалоги из реальной жизни", "Ролевые ситуации", "Вопросы и ответы", "Тренировка произношения", "Развитие уверенности", "Исправление ошибок без давления"].map((item) => <div key={item} className="rounded-2xl bg-white/10 p-4 text-sm font-bold">✓ {item}</div>)}</div></div><div className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl"><div className="rounded-[1.35rem] bg-gradient-to-br from-cyan-50 via-yellow-50 to-violet-50 p-6"><div className="text-5xl">🎧</div><h3 className="mt-5 text-2xl font-black">Практика в комфортном темпе</h3><p className="mt-3 leading-7 text-slate-600">Вы говорите больше, получаете понятную обратную связь и постепенно перестаёте бояться ошибок.</p></div></div></div>
        </section>

        <section id="format" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Формат занятий" title="Онлайн-уроки, которые удобно встроить в ваш график" text="Все занятия проходят онлайн в MTS Link. Для интерактивных материалов, схем, упражнений и совместной работы используется Miro." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[["video", "Онлайн-занятия"], ["heart", "Индивидуальные уроки"], ["clock", "60 минут"], ["star", "Бесплатный пробный урок"], ["pen", "Домашние задания по необходимости"], ["book", "Все материалы предоставляются"], ["globe", "MTS Link и Miro"], ["sparkle", "Гибкое расписание"]].map(([icon, title]) => <div key={title} className="rounded-[1.5rem] bg-slate-50 p-5 shadow-sm ring-1 ring-slate-100"><IconBubble name={icon} /><h3 className="mt-4 font-black">{title}</h3></div>)}</div></div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Мини-карточки" title="Небольшие примеры того, как мы учимся" text="Карточки помогают повторять лексику, грамматику и полезные фразы." /><div className="grid gap-5 md:grid-cols-3">{data.cards.map(([label, title, meta, example]) => <Card key={title} className="bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6"><div className="mb-5 inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">{label}</div><h3 className="text-2xl font-black text-slate-950">{title}</h3><p className="mt-3 font-bold text-cyan-700">{meta}</p><p className="mt-4 rounded-2xl bg-white p-4 text-slate-700 shadow-sm">{example}</p></Card>)}</div></div>
        </section>

        <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Стоимость занятий" title="Стоимость занятий" text="Первый урок бесплатно. После пробного занятия вы сможете спокойно решить, подходит ли вам формат." /><div className="grid gap-6 lg:grid-cols-3">{data.prices.map(([title, price, desc, button, badge], index) => <Card key={title} className={`p-8 ${index === 2 ? "ring-2 ring-yellow-300" : "ring-cyan-100"}`}><div className={`${index === 2 ? "bg-yellow-300 text-slate-950" : "bg-cyan-100 text-cyan-800"} mb-4 inline-flex rounded-full px-4 py-2 text-sm font-black`}>{badge}</div><h3 className="text-2xl font-black text-slate-950">{title}</h3><div className="mt-5 text-4xl font-black text-slate-950">{price}</div>{type === "en" && index === 1 && <div className="mt-3 rounded-2xl bg-cyan-50 p-3 text-sm font-black text-cyan-800">1 раз в неделю — 1400 ₽ за 1 урок</div>}{type === "en" && index === 2 && <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm font-black text-orange-800 ring-1 ring-yellow-200">Минимум 2 раза в неделю — 1200 ₽ за 1 урок</div>}{type === "de" && index === 2 && <div className="mt-3 rounded-2xl bg-yellow-50 p-3 text-sm font-black text-orange-800 ring-1 ring-yellow-200">Минимум 2 раза в неделю — 800 ₽ за 1 урок</div>}<p className="mt-5 leading-7 text-slate-600">{desc}</p><Button className={`mt-7 w-full ${index === 2 ? "from-orange-400 to-yellow-400 text-slate-950 shadow-yellow-500/20 hover:from-orange-500 hover:to-yellow-500" : ""}`}>{button}</Button></Card>)}</div><p className="mt-6 text-center font-semibold text-slate-600">Занятия проходят онлайн. Материалы предоставляются. Расписание подбирается индивидуально.</p></div>
        </section>

        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Отзывы учеников" title="Что говорят после занятий" /><div className="grid gap-5 md:grid-cols-3">{data.testimonials.map((text, index) => <Card key={text} className="bg-gradient-to-br from-slate-50 to-white p-6"><div className="text-5xl text-cyan-500">“</div><p className="mt-4 text-lg font-bold leading-8 text-slate-800">«{text}»</p><div className="mt-6 text-yellow-400">★★★★★</div><p className="mt-3 text-sm font-semibold text-slate-500">Ученик {index + 1}</p></Card>)}</div></div>
        </section>

        <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl"><SectionHeader eyebrow="Частые вопросы" title="Перед первым уроком" text="Здесь собраны ответы на вопросы, которые чаще всего задают перед записью." /><div className="grid gap-3">{faq.map((item, index) => <FAQItem key={item[0]} item={item} index={index} />)}</div></div>
        </section>

        <section id="contact" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 p-6 text-white shadow-2xl sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-14"><div><div className="mb-4 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold">Запись на урок</div><h2 className="text-3xl font-black tracking-tight sm:text-5xl">Хотите начать учить {type === "en" ? "английский" : "немецкий"} онлайн?</h2><p className="mt-5 text-lg leading-8 text-white/80">Оставьте заявку, и я свяжусь с вами, чтобы обсудить ваш уровень, цели и удобное время для бесплатного пробного урока.</p><div className="mt-8 grid gap-3">{[["telegram", "Telegram"], ["whatsapp", "WhatsApp"], ["mail", "E-mail"], ["vk", "VK"]].map(([icon, label]) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 font-bold"><Icon name={icon} />{label}</div>)}</div></div><form className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-xl sm:p-7"><div className="grid gap-4 sm:grid-cols-2">{["Имя", "Возраст или класс", "Уровень языка", "Удобный способ связи"].map((label) => <label key={label} className="grid gap-2 text-sm font-bold text-slate-700">{label}<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder={label} /></label>)}<label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Цель обучения<input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Школа, работа, путешествия, разговорная практика..." /></label><label className="grid gap-2 text-sm font-bold text-slate-700 sm:col-span-2">Сообщение<textarea rows={4} className="resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Расскажите коротко, что хотите улучшить" /></label></div><button type="button" className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 py-4 text-base font-black text-slate-950 shadow-lg">➤ Отправить заявку</button><p className="mt-4 text-center text-sm font-semibold text-slate-500">Нажимая кнопку, вы соглашаетесь на обработку данных для связи по заявке.</p></form></div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4"><div><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-black">{data.langIcon}</div><div><div className="font-black">Anastasia</div><div className="text-sm text-white/60">{data.subject}</div></div></div><p className="mt-5 text-sm leading-6 text-white/60">Дружелюбные онлайн-занятия для школьников, студентов и взрослых.</p></div><div><h4 className="font-black">Занятия</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Бесплатный пробный урок</span><span>{data.prices[1][1]}</span><span>{data.prices[2][1]} при занятиях от 2 раз в неделю</span></div></div><div><h4 className="font-black">Контакты</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><span>Telegram</span><span>WhatsApp</span><span>E-mail</span><span>VK</span></div></div><div><h4 className="font-black">Информация</h4><div className="mt-4 grid gap-2 text-sm text-white/65"><a href="#" className="hover:text-white">Политика конфиденциальности</a><a href="#contact" className="hover:text-white">Записаться на урок</a><button onClick={onHome} className="text-left hover:text-white">На главную</button></div></div></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-sm text-white/45">© 2026 Anastasia. Онлайн-занятия. Все права защищены.</div></footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(null);
  if (page === "students") return <StudentPortal onBack={() => setPage(null)} />;
  if (page === "en" || page === "de") return <LanguagePage type={page} onHome={() => setPage(null)} />;
  return <Home onChoose={setPage} />;
}
