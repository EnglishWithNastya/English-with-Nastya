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

const learningPasswords = {
  Max: "learn-max-2026",
  Masha: "learn-masha-2026",
  Polina: "learn-polina-2026",
  Igor: "learn-igor-2026",
  Sonja: "learn-sonja-2026",
  Vanja: "learn-vanja-2026",
  Katya: "learn-katya-2026",
  Amelia: "learn-amelia-2026",
  Denis: "learn-denis-2026",
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
const learningLevels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
const puzzlesPerLevel = 100;
const questionsPerPuzzle = 10;

const learningTaskBank = {
  en: {
    A0: {
      words: [["apple", "яблоко"], ["water", "вода"], ["book", "книга"], ["home", "дом"], ["school", "школа"], ["mother", "мама"], ["day", "день"], ["bag", "сумка"], ["milk", "молоко"], ["street", "улица"]],
      grammar: [["I ___ Max.", "am", ["am", "is", "are", "be"], "После I используется форма am: I am Max."], ["She ___ a student.", "is", ["is", "are", "am", "be"], "С he/she/it используется is."], ["They ___ friends.", "are", ["are", "is", "am", "be"], "С they используется are."], ["This is ___ book.", "a", ["a", "an", "the", "-"], "Перед согласным звуком обычно используется a."], ["___ you ready?", "Are", ["Are", "Is", "Am", "Be"], "В вопросе с you используется Are."], ["I have ___ apple.", "an", ["an", "a", "the", "-"], "Перед гласным звуком используется an."], ["He ___ not here.", "is", ["is", "are", "am", "be"], "He is not here — правильная форма."], ["We ___ at home.", "are", ["are", "is", "am", "be"], "С we используется are."], ["It is ___ pen.", "a", ["a", "an", "the", "-"], "Pen начинается с согласного звука, поэтому a."], ["My name ___ Anna.", "is", ["is", "are", "am", "be"], "My name is — устойчивый базовый шаблон."]],
      reading: [["Tom has a cat. The cat is black. What animal does Tom have?", "cat", ["cat", "dog", "bird", "fish"], "В тексте сказано: Tom has a cat."], ["Anna drinks water. What does Anna drink?", "water", ["water", "tea", "milk", "coffee"], "В тексте сказано: Anna drinks water."], ["This is my bag. It is blue. What color is the bag?", "blue", ["blue", "red", "green", "white"], "В тексте сказано: It is blue."], ["I go to school. Where do I go?", "school", ["school", "shop", "park", "bank"], "В тексте сказано: I go to school."], ["My mother is at home. Who is at home?", "mother", ["mother", "father", "teacher", "friend"], "В тексте сказано: My mother is at home."]]
    },
    A1: {
      words: [["breakfast", "завтрак"], ["umbrella", "зонт"], ["window", "окно"], ["lesson", "урок"], ["teacher", "учитель"], ["family", "семья"], ["city", "город"], ["ticket", "билет"], ["phone", "телефон"], ["evening", "вечер"]],
      grammar: [["I ___ coffee every morning.", "drink", ["drink", "drinks", "drinking", "drank"], "В Present Simple с I используется базовая форма: I drink."], ["She ___ English.", "speaks", ["speaks", "speak", "speaking", "spoke"], "С she в Present Simple добавляется -s."], ["We ___ TV yesterday.", "watched", ["watched", "watch", "watches", "watching"], "Yesterday указывает на Past Simple: watched."], ["There ___ two books.", "are", ["are", "is", "am", "be"], "С множественным числом используется there are."], ["I don't ___ meat.", "eat", ["eat", "eats", "ate", "eating"], "После don't используется базовая форма глагола."], ["Does he ___ football?", "play", ["play", "plays", "played", "playing"], "После does используется базовая форма."], ["She is ___ than me.", "taller", ["taller", "tall", "tallest", "more tall"], "Сравнительная степень: taller."], ["I can ___.", "swim", ["swim", "swims", "swam", "swimming"], "После can используется базовая форма глагола."], ["We are ___ now.", "studying", ["studying", "study", "studied", "studies"], "Now часто требует Present Continuous."], ["I need ___ help.", "some", ["some", "any", "many", "few"], "В утвердительном предложении обычно some."]],
      reading: [["Maria works in a small shop. She starts at nine. Where does Maria work?", "shop", ["shop", "school", "hospital", "airport"], "В тексте сказано: works in a small shop."], ["Ben has breakfast at home and then takes the bus. What does he take?", "bus", ["bus", "taxi", "train", "bike"], "В тексте сказано: takes the bus."], ["Kate is tired because she studied all evening. Why is Kate tired?", "she studied", ["she studied", "she ran", "she cooked", "she travelled"], "В тексте указана причина: because she studied."], ["Alex buys a ticket for the museum. Where is he going?", "museum", ["museum", "cinema", "bank", "office"], "Он покупает билет в museum."], ["The lesson starts at five. When does the lesson start?", "at five", ["at five", "at nine", "in the morning", "on Sunday"], "В тексте сказано: starts at five."]]
    },
    A2: {
      words: [["homework", "домашнее задание"], ["wallet", "кошелёк"], ["appointment", "встреча / запись"], ["neighbour", "сосед"], ["receipt", "чек"], ["schedule", "расписание"], ["queue", "очередь"], ["medicine", "лекарство"], ["entrance", "вход"], ["receipt", "чек"]],
      grammar: [["I have lived here ___ 2020.", "since", ["since", "for", "from", "during"], "Since используется с начальной точкой во времени."], ["She has worked here ___ three years.", "for", ["for", "since", "from", "while"], "For используется с периодом времени."], ["If it rains, we ___ stay home.", "will", ["will", "would", "did", "are"], "Первый тип условных: If + Present, will + verb."], ["This book is ___ interesting than that one.", "more", ["more", "most", "much", "many"], "Для long adjectives используется more."], ["I was cooking when he ___.", "called", ["called", "calls", "calling", "call"], "Past Continuous + Past Simple для действия, которое прервало процесс."], ["You ___ smoke here.", "mustn't", ["mustn't", "don't have to", "should", "can"], "Mustn't означает запрет."], ["I haven't finished it ___.", "yet", ["yet", "already", "still", "ever"], "Yet часто используется в отрицаниях Present Perfect."], ["Have you ___ been to London?", "ever", ["ever", "yet", "since", "for"], "Ever используется в вопросах об опыте."], ["The train is late, ___?", "isn't it", ["isn't it", "is it", "doesn't it", "wasn't he"], "Question tag согласуется с is: isn't it."], ["She asked me where I ___.", "lived", ["lived", "live", "am living", "will live"], "Косвенный вопрос часто требует сдвига времени."]],
      reading: [["Nina has an appointment at the clinic at 3 p.m. She leaves home early because the bus is often late. Why does Nina leave early?", "the bus is often late", ["the bus is often late", "she wants coffee", "the clinic is closed", "she lost her wallet"], "Причина указана после because."], ["Oleg bought a jacket but kept the receipt. He might return it tomorrow. Why did he keep the receipt?", "to return the jacket", ["to return the jacket", "to buy food", "to call a friend", "to check the weather"], "Receipt нужен, если он might return it."], ["Anna checked the schedule before leaving for the station. What did she check?", "schedule", ["schedule", "wallet", "medicine", "neighbour"], "В тексте сказано: checked the schedule."], ["The queue was long, so Max bought the tickets online. Why did Max buy tickets online?", "the queue was long", ["the queue was long", "he was hungry", "it was raining", "he forgot his phone"], "So показывает следствие длинной очереди."], ["Lena took medicine after dinner because she had a headache. Why did she take medicine?", "headache", ["headache", "appointment", "homework", "receipt"], "В тексте сказано: because she had a headache."]]
    },
    B1: {
      words: [["commute", "дорога на работу / учёбу"], ["errand", "поручение / бытовое дело"], ["leftovers", "остатки еды"], ["household chores", "домашние обязанности"], ["refund", "возврат денег"], ["shortcut", "короткий путь"], ["deadline", "срок сдачи"], ["appointment", "запись / встреча"], ["groceries", "продукты"], ["rent", "аренда"]],
      grammar: [["If I had more time, I ___ learn another language.", "would", ["would", "will", "can", "am"], "Второй тип условных: If + Past Simple, would + verb."], ["The report ___ yesterday.", "was written", ["was written", "wrote", "is write", "has wrote"], "Пассив в Past Simple: was/were + V3."], ["I look forward to ___ you.", "seeing", ["seeing", "see", "saw", "seen"], "После look forward to используется -ing."], ["She suggested ___ earlier.", "leaving", ["leaving", "to leave", "left", "leave"], "После suggest используется герундий."], ["I wish I ___ more free time.", "had", ["had", "have", "will have", "am having"], "После I wish для нереального настоящего используется Past Simple."], ["He is used to ___ early.", "getting up", ["getting up", "get up", "got up", "gets up"], "Be used to требует noun/gerund."], ["Neither answer ___ correct.", "is", ["is", "are", "be", "were"], "Neither в значении 'ни один' обычно singular."], ["She told me she ___ busy.", "was", ["was", "is", "will be", "be"], "Reported speech: is → was."], ["I had my phone ___.", "repaired", ["repaired", "repair", "repairing", "repairs"], "Have something done: had + object + V3."], ["The film was worth ___.", "watching", ["watching", "watch", "watched", "to watch"], "Worth требует -ing."]],
      reading: [["Masha usually takes a shortcut through the park, but today it was closed, so her commute took longer. Why was her commute longer?", "the shortcut was closed", ["the shortcut was closed", "she missed breakfast", "she lost her receipt", "she worked from home"], "Причина: shortcut through the park was closed."], ["Igor had several errands to run after work: buying groceries, picking up medicine and paying rent. Which task is not mentioned?", "calling a neighbour", ["calling a neighbour", "buying groceries", "picking up medicine", "paying rent"], "В тексте нет calling a neighbour."], ["Polina missed the deadline because she underestimated the task. What caused the problem?", "she underestimated the task", ["she underestimated the task", "she had no internet", "she forgot her wallet", "she took a shortcut"], "Because указывает причину."], ["Denis asked for a refund after the headphones stopped working. Why did he ask for a refund?", "the headphones stopped working", ["the headphones stopped working", "he lost the box", "he liked the colour", "he needed groceries"], "Refund связан с тем, что товар перестал работать."], ["Sonja cooked too much, so she put the leftovers in the fridge. What did she put in the fridge?", "leftovers", ["leftovers", "rent", "deadline", "shortcut"], "В тексте сказано: put the leftovers in the fridge."]]
    },
    B2: {
      words: [["maintenance", "техническое обслуживание"], ["housewarming", "новоселье"], ["commuter", "человек, ездящий на работу"], ["overdue", "просроченный"], ["appliance", "бытовой прибор"], ["storage", "хранение"], ["subscription", "подписка"], ["notice", "уведомление"], ["landlord", "арендодатель"], ["tenant", "арендатор"]],
      grammar: [["Had I known, I ___ earlier.", "would have left", ["would have left", "would leave", "left", "will leave"], "Инверсия в third conditional: Had I known = If I had known."], ["The issue needs ___ immediately.", "to be fixed", ["to be fixed", "fix", "fixed", "fixing by"], "Need + passive infinitive: needs to be fixed."], ["Not only ___ late, but he also forgot the documents.", "was he", ["was he", "he was", "is he", "he is"], "После Not only в начале предложения используется инверсия."], ["The more you practise, ___ you become.", "the more confident", ["the more confident", "more confident", "most confident", "the confident"], "Конструкция: The more..., the more..."], ["It is high time we ___.", "left", ["left", "leave", "will leave", "are leaving"], "После It's high time часто используется Past Simple."], ["She denied ___ the message.", "having received", ["having received", "to receive", "receive", "has received"], "Deny может использоваться с perfect gerund."], ["This is the person ___ car was damaged.", "whose", ["whose", "which", "who", "whom"], "Whose выражает принадлежность."], ["The meeting was postponed, ___ caused some confusion.", "which", ["which", "what", "that", "who"], "Which относится ко всей предыдущей ситуации."], ["He is unlikely ___ on time.", "to arrive", ["to arrive", "arrive", "arriving", "arrived"], "Be unlikely + to infinitive."], ["The flat, ___ is near the station, is expensive.", "which", ["which", "that", "what", "who"], "В non-defining relative clause используется which."]],
      reading: [["The landlord sent a notice about maintenance work in the building. Tenants were asked not to use the lift between 9 and 12. What was restricted?", "using the lift", ["using the lift", "paying rent", "buying appliances", "renewing a subscription"], "В notice сказано: not to use the lift."], ["The subscription was overdue because the payment card had expired. Why was it overdue?", "the card had expired", ["the card had expired", "the landlord called", "the lift was broken", "the tenant moved"], "Because указывает причину."], ["After the housewarming party, there was not enough storage space for the new appliances. What problem appeared?", "not enough storage space", ["not enough storage space", "overdue rent", "no commuters", "a broken subscription"], "Проблема: not enough storage space."], ["The tenant complained that maintenance had been delayed twice. What did the tenant complain about?", "delayed maintenance", ["delayed maintenance", "a new housewarming", "a cheap appliance", "a short commute"], "В тексте сказано maintenance had been delayed."], ["Many commuters prefer the early train because it is less crowded. Why do they prefer it?", "it is less crowded", ["it is less crowded", "it is overdue", "it has storage", "it is a notice"], "Because it is less crowded."]]
    },
    C1: { words: [["clutter", "беспорядок / хлам"], ["downtime", "время простоя / отдыха"], ["trade-off", "компромисс"], ["setback", "неудача / шаг назад"], ["workload", "рабочая нагрузка"], ["feasible", "осуществимый"], ["upkeep", "содержание / уход"], ["hassle", "морока"], ["constraint", "ограничение"], ["priority", "приоритет"]], grammar: [], reading: [] },
    C2: { words: [["makeshift", "временный / самодельный"], ["tedious", "утомительный"], ["meticulous", "тщательный"], ["procrastinate", "откладывать на потом"], ["convoluted", "запутанный"], ["pragmatic", "прагматичный"], ["inconvenience", "неудобство"], ["resilient", "устойчивый"], ["frugal", "экономный"], ["mundane", "повседневный / обыденный"]], grammar: [], reading: [] }
  },
  de: {
    A0: { words: [["das Wasser", "вода"], ["das Buch", "книга"], ["das Haus", "дом"], ["die Schule", "школа"], ["der Tag", "день"], ["die Tasche", "сумка"], ["die Milch", "молоко"], ["die Straße", "улица"], ["die Mutter", "мама"], ["das Fenster", "окно"]], grammar: [["Ich ___ Max.", "bin", ["bin", "bist", "ist", "sind"], "С ich используется bin."], ["Du ___ nett.", "bist", ["bist", "bin", "ist", "seid"], "С du используется bist."], ["Er ___ hier.", "ist", ["ist", "bist", "bin", "sind"], "С er/sie/es используется ist."], ["Wir ___ Schüler.", "sind", ["sind", "seid", "ist", "bin"], "С wir используется sind."], ["Das ist ___ Buch.", "ein", ["ein", "eine", "einen", "einem"], "Buch — das, поэтому ein Buch."], ["Das ist ___ Tasche.", "eine", ["eine", "ein", "einen", "einem"], "Tasche — die, поэтому eine Tasche."], ["Ich ___ Wasser.", "trinke", ["trinke", "trinkt", "trinken", "trinkst"], "С ich: trinke."], ["Er ___ Deutsch.", "lernt", ["lernt", "lerne", "lernen", "lernst"], "С er: lernt."], ["___ du hier?", "Bist", ["Bist", "Bin", "Ist", "Sind"], "Вопрос с du: Bist du...?"], ["Ich habe ___ Tasche.", "eine", ["eine", "ein", "einen", "einem"], "Tasche — feminine, Akkusativ eine."]], reading: [["Anna hat ein Buch. Was hat Anna?", "Buch", ["Buch", "Tasche", "Wasser", "Fenster"], "В тексте сказано: Anna hat ein Buch."], ["Max trinkt Wasser. Was trinkt Max?", "Wasser", ["Wasser", "Milch", "Tee", "Kaffee"], "В тексте сказано: Max trinkt Wasser."], ["Das Haus ist groß. Wie ist das Haus?", "groß", ["groß", "klein", "rot", "alt"], "В тексте сказано: ist groß."], ["Ich gehe zur Schule. Wohin gehe ich?", "Schule", ["Schule", "Bank", "Park", "Kino"], "В тексте сказано: zur Schule."], ["Die Tasche ist blau. Welche Farbe hat die Tasche?", "blau", ["blau", "rot", "weiß", "grün"], "В тексте сказано: blau."]] },
    A1: { words: [["das Frühstück", "завтрак"], ["der Regenschirm", "зонт"], ["der Lehrer", "учитель"], ["die Familie", "семья"], ["die Stadt", "город"], ["die Fahrkarte", "билет"], ["das Handy", "телефон"], ["der Abend", "вечер"], ["der Unterricht", "урок"], ["die Frage", "вопрос"]], grammar: [], reading: [] },
    A2: { words: [["die Hausaufgabe", "домашнее задание"], ["die Geldbörse", "кошелёк"], ["der Termin", "встреча / запись"], ["der Nachbar", "сосед"], ["die Quittung", "чек"], ["der Stundenplan", "расписание"], ["die Schlange", "очередь"], ["das Medikament", "лекарство"], ["der Eingang", "вход"], ["der Ausgang", "выход"]], grammar: [], reading: [] },
    B1: { words: [["der Arbeitsweg", "дорога на работу / учёбу"], ["die Besorgung", "поручение / бытовое дело"], ["die Essensreste", "остатки еды"], ["die Hausarbeit", "домашние обязанности"], ["die Rückerstattung", "возврат денег"], ["die Abkürzung", "короткий путь"], ["die Frist", "срок сдачи"], ["die Miete", "аренда"], ["die Lebensmittel", "продукты"], ["der Alltag", "повседневность"]], grammar: [], reading: [] },
    B2: { words: [["die Wartung", "техническое обслуживание"], ["die Einweihungsfeier", "новоселье"], ["der Pendler", "человек, ездящий на работу"], ["überfällig", "просроченный"], ["das Haushaltsgerät", "бытовой прибор"], ["die Aufbewahrung", "хранение"], ["das Abonnement", "подписка"], ["die Mitteilung", "уведомление"], ["der Vermieter", "арендодатель"], ["der Mieter", "арендатор"]], grammar: [], reading: [] },
    C1: { words: [["die Unordnung", "беспорядок"], ["die Auszeit", "время отдыха"], ["der Kompromiss", "компромисс"], ["der Rückschlag", "неудача"], ["die Arbeitsbelastung", "рабочая нагрузка"], ["machbar", "осуществимый"], ["die Instandhaltung", "содержание / уход"], ["der Aufwand", "хлопоты / затраты усилий"], ["die Einschränkung", "ограничение"], ["die Priorität", "приоритет"]], grammar: [], reading: [] },
    C2: { words: [["provisorisch", "временный / самодельный"], ["mühsam", "утомительный"], ["sorgfältig", "тщательный"], ["aufschieben", "откладывать"], ["verworren", "запутанный"], ["pragmatisch", "прагматичный"], ["die Unannehmlichkeit", "неудобство"], ["belastbar", "устойчивый"], ["sparsam", "экономный"], ["alltäglich", "повседневный"]], grammar: [], reading: [] }
  }
};

function normalizeLearningBank() {
  ["en", "de"].forEach((lang) => {
    learningLevels.forEach((level, idx) => {
      const bank = learningTaskBank[lang][level];
      const fallbackLevel = idx > 0 ? learningTaskBank[lang][learningLevels[idx - 1]] : learningTaskBank[lang].A0;
      if (!bank.grammar.length) bank.grammar = fallbackLevel.grammar;
      if (!bank.reading.length) bank.reading = fallbackLevel.reading;
    });
  });
}
normalizeLearningBank();

function getLearningLanguage(studentName) {
  if (studentName === adminUsername) return "en";
  return germanStudents.includes(studentName) ? "de" : "en";
}

function getLearningProgress(studentName) {
  return safeGet(`learning-progress-${studentName}`, { unlockedLevel: "A0", completed: {}, scores: {} });
}

function saveLearningProgress(studentName, progress) {
  safeSet(`learning-progress-${studentName}`, progress);
}

function deterministicShuffle(items, seed = 0) {
  const arr = [...items];
  let value = Math.abs(Number(seed)) + 17;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    value = (value * 9301 + 49297) % 233280;
    const j = value % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function makeOptions(correct, pool, seed = 0) {
  const unique = [correct, ...pool.filter((item) => item !== correct)].filter((item, index, arr) => arr.indexOf(item) === index);
  return deterministicShuffle(unique.slice(0, 4), seed);
}

function isLearningPuzzleUnlocked(studentName, level, puzzleNumber, adminMode = false) {
  if (adminMode) return true;
  const progress = getLearningProgress(studentName);
  const unlockedLevelIndex = learningLevels.indexOf(progress.unlockedLevel || "A0");
  const levelIndex = learningLevels.indexOf(level);
  if (levelIndex < unlockedLevelIndex) return true;
  if (levelIndex > unlockedLevelIndex) return false;
  if (puzzleNumber === 1) return true;
  return Boolean(progress.completed?.[`${level}-${puzzleNumber - 1}`]);
}

function generateLearningPuzzle(studentName, level, puzzleNumber, adminMode = false, languageOverride = null) {
  const lang = languageOverride || (adminMode && studentName === adminUsername ? "en" : getLearningLanguage(studentName));
  const bank = learningTaskBank[lang][level] || learningTaskBank[lang].A0;
  const tasks = [];
  for (let i = 0; i < questionsPerPuzzle; i += 1) {
    const type = i % 3 === 0 ? "reading" : i % 3 === 1 ? "grammar" : "word";
    if (type === "word") {
      const item = bank.words[(puzzleNumber + i) % bank.words.length];
      const wrongPool = bank.words.map((entry) => entry[1]).filter((answer) => answer !== item[1]);
      tasks.push({ type: "Слова", q: lang === "en" ? `What does “${item[0]}” mean?` : `Что означает «${item[0]}»?`, correct: item[1], options: makeOptions(item[1], wrongPool), explanation: `Правильный ответ: ${item[0]} — ${item[1]}.` });
    } else if (type === "grammar") {
      const item = bank.grammar[(puzzleNumber + i) % bank.grammar.length];
      tasks.push({ type: "Грамматика", q: item[0], correct: item[1], options: item[2], explanation: item[3] });
    } else {
      const item = bank.reading[(puzzleNumber + i) % bank.reading.length];
      tasks.push({ type: "Чтение", q: item[0], correct: item[1], options: item[2], explanation: item[3] });
    }
  }
  return tasks;
}

function completeLearningPuzzle(studentName, level, puzzleNumber, score) {
  const progress = getLearningProgress(studentName);
  const key = `${level}-${puzzleNumber}`;
  const next = {
    ...progress,
    completed: { ...(progress.completed || {}), [key]: score >= 8 },
    scores: { ...(progress.scores || {}), [key]: score },
  };
  if (score >= 8 && puzzleNumber >= puzzlesPerLevel) {
    const levelIndex = learningLevels.indexOf(level);
    next.unlockedLevel = learningLevels[Math.min(learningLevels.length - 1, levelIndex + 1)];
  }
  saveLearningProgress(studentName, next);
  return next;
}

const bonusTypes = [
  ["reading", "Бонус: чтение"],
  ["dialog", "Бонус: диалоги"],
];
const bonusPerLevel = 20;

function getBonusProgress(studentName) {
  return safeGet(`bonus-progress-${studentName}`, { completed: {}, scores: {} });
}

function saveBonusProgress(studentName, progress) {
  safeSet(`bonus-progress-${studentName}`, progress);
}

function isBonusUnlocked(studentName, type, level, bonusNumber, adminMode = false) {
  if (adminMode || studentName === adminUsername) return true;
  if (bonusNumber === 1) return true;
  const progress = getBonusProgress(studentName);
  return Boolean(progress.completed?.[`${type}-${level}-${bonusNumber - 1}`]);
}

function generateReadingBonus(studentName, level, bonusNumber, adminMode = false, languageOverride = null) {
  const lang = languageOverride || (adminMode && studentName === adminUsername ? "en" : getLearningLanguage(studentName));
  const levelIndex = Math.max(0, learningLevels.indexOf(level));

  const easyText = lang === "de"
    ? "Anna steht morgens früh auf und frühstückt zu Hause. Danach fährt sie mit dem Bus zur Schule. Am Nachmittag macht sie Hausaufgaben und wiederholt neue Wörter. Am Abend plant sie den nächsten Tag."
    : "Anna gets up early and has breakfast at home. Then she takes the bus to school. In the afternoon, she does her homework and reviews new words. In the evening, she plans the next day.";

  const b2Text = lang === "de"
    ? "Lena wollte ihre wöchentlichen Ausgaben senken, ohne auf soziale Aktivitäten zu verzichten. Deshalb verglich sie Abonnements, plante ihre Einkäufe genauer und legte eine kleine Rücklage für unerwartete Reparaturen an. Nach einigen Wochen bemerkte sie, dass nicht einzelne große Entscheidungen, sondern viele kleine Gewohnheiten den größten Unterschied machten."
    : "Lena wanted to reduce her weekly expenses without giving up social activities. She compared subscriptions, planned her grocery shopping more carefully and set aside a small amount for unexpected repairs. After a few weeks, she noticed that it was not one major decision, but many small habits that made the biggest difference.";

  const c1Text = lang === "de"
    ? "Obwohl die neue Lernroutine zunächst sehr ambitioniert wirkte, erwies sie sich im Alltag als erstaunlich praktikabel. Der entscheidende Vorteil lag nicht in der Menge der Übungen, sondern in ihrer Regelmäßigkeit: kurze Wiederholungen, gezielte Fehleranalyse und bewusste Anwendung neuer Redemittel führten zu stabileren Fortschritten als lange, aber seltene Lerneinheiten."
    : "Although the new learning routine seemed rather ambitious at first, it proved surprisingly practical in everyday life. Its main advantage was not the quantity of exercises, but their consistency: short revision sessions, targeted error analysis and deliberate use of new phrases led to more stable progress than long but infrequent study sessions.";

  const c2Text = lang === "de"
    ? "Die Debatte über digitale Lernwerkzeuge wird häufig so geführt, als stünden Effizienz und pädagogische Tiefe zwangsläufig im Widerspruch. Tatsächlich hängt der Nutzen solcher Werkzeuge jedoch weniger von ihrer technischen Raffinesse ab als von der didaktischen Einbettung: Ohne klare Lernziele, reflektierte Rückmeldung und angemessene Progression bleibt selbst eine beeindruckende Plattform oberflächlich; mit einem durchdachten Konzept kann dagegen schon ein schlichtes digitales Board komplexe Lernprozesse sichtbar und steuerbar machen."
    : "The debate about digital learning tools is often framed as if efficiency and pedagogical depth were necessarily at odds. In practice, however, the value of such tools depends less on their technical sophistication than on their didactic integration: without clear learning goals, reflective feedback and appropriate progression, even an impressive platform remains superficial; with a well-designed concept, even a simple digital board can make complex learning processes visible and manageable.";

  const text = levelIndex >= 6 ? c2Text : levelIndex >= 5 ? c1Text : levelIndex >= 4 ? b2Text : easyText;

  const easyQuestions = lang === "de"
    ? [
        { q: "Wann steht Anna auf?", correct: "morgens früh", options: ["nachts", "morgens früh", "am Mittag", "nie"], explanation: "Im Text steht: Anna steht morgens früh auf." },
        { q: "Womit fährt Anna zur Schule?", correct: "mit dem Bus", options: ["mit dem Taxi", "zu Fuß", "mit dem Bus", "mit dem Zug"], explanation: "Im Text steht: fährt sie mit dem Bus zur Schule." },
        { q: "Was macht Anna am Nachmittag?", correct: "Hausaufgaben", options: ["einkaufen", "Hausaufgaben", "kochen", "schlafen"], explanation: "Im Text steht: Am Nachmittag macht sie Hausaufgaben." },
        { q: "Was wiederholt Anna?", correct: "neue Wörter", options: ["neue Wörter", "alte Filme", "Telefonnummern", "Rezepte"], explanation: "Im Text steht: wiederholt neue Wörter." },
        { q: "Was plant Anna am Abend?", correct: "den nächsten Tag", options: ["eine Reise", "den nächsten Tag", "ein Fest", "einen Einkauf"], explanation: "Im Text steht: Am Abend plant sie den nächsten Tag." },
      ]
    : [
        { q: "When does Anna get up?", correct: "early", options: ["at night", "early", "at noon", "never"], explanation: "The text says: Anna gets up early." },
        { q: "How does Anna go to school?", correct: "by bus", options: ["by taxi", "on foot", "by bus", "by train"], explanation: "The text says: she takes the bus to school." },
        { q: "What does Anna do in the afternoon?", correct: "homework", options: ["shopping", "homework", "cooking", "sleeping"], explanation: "The text says: she does her homework." },
        { q: "What does Anna review?", correct: "new words", options: ["new words", "old films", "phone numbers", "recipes"], explanation: "The text says: reviews new words." },
        { q: "What does Anna plan in the evening?", correct: "the next day", options: ["a trip", "the next day", "a party", "shopping"], explanation: "The text says: she plans the next day." },
      ];

  const advancedQuestions = lang === "de"
    ? [
        { q: "Wovon hängt der Nutzen digitaler Lernwerkzeuge laut Text vor allem ab?", correct: "von der didaktischen Einbettung", options: ["von der didaktischen Einbettung", "von möglichst vielen Funktionen", "vom Preis der Plattform", "von der Länge der Übungen"], explanation: "Der Text betont, dass die didaktische Einbettung wichtiger ist als technische Raffinesse." },
        { q: "Welche Aussage entspricht der zentralen These?", correct: "Technik allein garantiert keine Lerntiefe.", options: ["Technik allein garantiert keine Lerntiefe.", "Komplexe Plattformen sind immer besser.", "Feedback ist im digitalen Lernen unwichtig.", "Kurze Übungen verhindern Fortschritt."], explanation: "Im Text heißt es, dass ohne Ziele, Feedback und Progression auch beeindruckende Plattformen oberflächlich bleiben." },
        { q: "Was bedeutet hier „oberflächlich“ am ehesten?", correct: "ohne tiefere pädagogische Wirkung", options: ["ohne tiefere pädagogische Wirkung", "besonders kreativ", "technisch fehlerhaft", "sehr kostengünstig"], explanation: "Oberflächlich beschreibt hier fehlende inhaltliche oder didaktische Tiefe." },
        { q: "Welche Bedingung wird nicht als wichtig genannt?", correct: "automatische Ranglisten", options: ["automatische Ranglisten", "klare Lernziele", "reflektierte Rückmeldung", "angemessene Progression"], explanation: "Ranglisten werden nicht genannt; die anderen drei Punkte stehen ausdrücklich im Text." },
        { q: "Welche Schlussfolgerung lässt sich ziehen?", correct: "Auch einfache Tools können wirksam sein, wenn sie gut eingesetzt werden.", options: ["Auch einfache Tools können wirksam sein, wenn sie gut eingesetzt werden.", "Digitale Boards sind grundsätzlich ungeeignet.", "Effizienz schließt Lerntiefe immer aus.", "Technische Raffinesse ist der einzige Erfolgsfaktor."], explanation: "Der letzte Satz sagt, dass ein schlichtes digitales Board mit gutem Konzept komplexe Lernprozesse sichtbar machen kann." },
      ]
    : [
        { q: "According to the text, what does the value of digital learning tools mainly depend on?", correct: "their didactic integration", options: ["their didactic integration", "the number of features", "the platform's price", "the length of exercises"], explanation: "The text states that didactic integration matters more than technical sophistication." },
        { q: "Which statement best reflects the central argument?", correct: "Technology alone does not guarantee depth of learning.", options: ["Technology alone does not guarantee depth of learning.", "Complex platforms are always better.", "Feedback is irrelevant in digital learning.", "Short exercises prevent progress."], explanation: "The text says that without goals, feedback and progression, even impressive platforms remain superficial." },
        { q: "What does “superficial” most nearly mean in this context?", correct: "lacking deeper pedagogical value", options: ["lacking deeper pedagogical value", "highly creative", "technically broken", "very inexpensive"], explanation: "Superficial refers to a lack of meaningful educational depth." },
        { q: "Which condition is not mentioned as important?", correct: "automatic leaderboards", options: ["automatic leaderboards", "clear learning goals", "reflective feedback", "appropriate progression"], explanation: "Leaderboards are not mentioned; the other three are explicitly named." },
        { q: "What conclusion follows from the text?", correct: "Even simple tools can be effective if used thoughtfully.", options: ["Even simple tools can be effective if used thoughtfully.", "Digital boards are inherently unsuitable.", "Efficiency always excludes depth.", "Technical sophistication is the only success factor."], explanation: "The final sentence says that even a simple digital board can be effective with a well-designed concept." },
      ];

  const questions = levelIndex >= 5 ? advancedQuestions : levelIndex >= 4 ? advancedQuestions : easyQuestions;
  return { text, tasks: questions.map((item, index) => ({ ...item, options: deterministicShuffle(item.options, bonusNumber * 31 + index * 7 + levelIndex), type: "Чтение" })) };
}

function generateDialogBonus(studentName, level, bonusNumber, adminMode = false, languageOverride = null) {
  const lang = languageOverride || (adminMode && studentName === adminUsername ? "en" : getLearningLanguage(studentName));
  const levelIndex = Math.max(0, learningLevels.indexOf(level));
  const context = lang === "de"
    ? "Dialog im Alltag: Ergänzen Sie passende Wörter oder ganze Sätze. Ab B2 werden indirekte Bedeutungen, Register und pragmatische Antworten wichtiger."
    : "Everyday dialogue: Complete missing words or whole sentences. From B2 upward, implied meaning, register and pragmatic responses become more important.";

  const easy = lang === "de"
    ? [
        { q: "A: Hallo! Wie ___ du? B: Gut, danke.", correct: "geht es", options: ["kommst", "geht es", "trinkst", "kaufst"], explanation: "Die Frage lautet: Wie geht es dir?" },
        { q: "A: Hast du heute Zeit? B: Ja, ich habe um fünf ___.", correct: "Zeit", options: ["Wasser", "Zeit", "Buch", "Fenster"], explanation: "Man sagt: Ich habe Zeit." },
        { q: "A: Wo treffen wir uns? B: ___ dem Café.", correct: "Vor", options: ["Ohne", "Bis", "Vor", "Seit"], explanation: "Vor dem Café beschreibt den Treffpunkt." },
        { q: "A: Soll ich dich anrufen? B: Ja, ___ mich bitte an.", correct: "ruf", options: ["lies", "iss", "ruf", "schlaf"], explanation: "Anrufen: Ruf mich bitte an." },
        { q: "A: Bis später! B: ___.", correct: "Bis später", options: ["Guten Appetit", "Keine Milch", "Bis später", "Sehr alt"], explanation: "Die passende Antwort ist: Bis später." },
      ]
    : [
        { q: "A: Hi! How ___ you? B: I'm fine, thanks.", correct: "are", options: ["is", "are", "am", "be"], explanation: "The correct question is: How are you?" },
        { q: "A: Are you free today? B: Yes, I have ___ at five.", correct: "time", options: ["water", "time", "book", "window"], explanation: "We say: I have time." },
        { q: "A: Where shall we meet? B: ___ the café.", correct: "In front of", options: ["Without", "Since", "In front of", "During"], explanation: "In front of the café describes the meeting point." },
        { q: "A: Should I call you? B: Yes, please ___.", correct: "call me", options: ["eat me", "read me", "call me", "sleep me"], explanation: "The correct phrase is: please call me." },
        { q: "A: See you later! B: ___.", correct: "See you later", options: ["Good appetite", "No milk", "See you later", "Very old"], explanation: "The matching reply is: See you later." },
      ];

  const b2 = lang === "de"
    ? [
        { q: "A: Ich schaffe es heute nicht pünktlich. B: Kein Problem, wir können den Termin ___.", correct: "verschieben", options: ["vergessen", "verschieben", "bezahlen", "öffnen"], explanation: "Einen Termin kann man verschieben." },
        { q: "A: Ich habe die Quittung verloren. B: Dann wird die Rückgabe wahrscheinlich ___.", correct: "schwierig", options: ["hungrig", "schwierig", "laut", "rund"], explanation: "Ohne Quittung ist eine Rückgabe oft schwierig." },
        { q: "A: Könnten Sie das bitte wiederholen? B: Ja, ___.", correct: "natürlich", options: ["gestern", "trotzdem", "natürlich", "kaum"], explanation: "Natürlich ist eine passende höfliche Antwort." },
        { q: "A: Ich finde den Vorschlag gut, aber die Umsetzung wirkt riskant. B: Dann sollten wir ihn zuerst ___.", correct: "prüfen", options: ["prüfen", "vergessen", "verstecken", "bezahlen"], explanation: "Einen riskanten Vorschlag sollte man prüfen." },
        { q: "A: Das klingt machbar. B: Ja, wenn wir den Plan ___.", correct: "vereinfachen", options: ["verstecken", "vereinfachen", "verschlafen", "vergessen"], explanation: "Einen Plan kann man vereinfachen." },
      ]
    : [
        { q: "A: I can't make it on time today. B: No problem, we can ___ the appointment.", correct: "reschedule", options: ["forget", "reschedule", "repair", "rent"], explanation: "You can reschedule an appointment." },
        { q: "A: I lost the receipt. B: Then the refund may be ___.", correct: "difficult", options: ["hungry", "difficult", "round", "loud"], explanation: "Without a receipt, a refund can be difficult." },
        { q: "A: Could you repeat that, please? B: Yes, ___.", correct: "of course", options: ["yesterday", "despite", "of course", "hardly"], explanation: "Of course is a polite reply." },
        { q: "A: I like the proposal, but the implementation seems risky. B: Then we should ___ it first.", correct: "review", options: ["review", "hide", "rent", "forget"], explanation: "A risky proposal should be reviewed first." },
        { q: "A: That sounds feasible. B: Yes, if we ___ the plan.", correct: "simplify", options: ["hide", "simplify", "oversleep", "forget"], explanation: "You can simplify a plan." },
      ];

  const c2 = lang === "de"
    ? [
        { q: "A: Der Plan ist elegant, aber unter den gegebenen Einschränkungen kaum tragfähig. B: Mit anderen Worten: Er ist theoretisch überzeugend, aber praktisch ___.", correct: "nicht belastbar", options: ["nicht belastbar", "völlig nebensächlich", "sprachlich veraltet", "zufällig entstanden"], explanation: "Die Antwort fasst die implizite Kritik zusammen: praktisch nicht belastbar." },
        { q: "A: Ich möchte die Entscheidung nicht grundsätzlich infrage stellen, nur ihre Folgen sauber abwägen. B: Sie plädieren also für eine ___ Bewertung.", correct: "differenzierte", options: ["differenzierte", "willkürliche", "oberflächliche", "überstürzte"], explanation: "Eine differenzierte Bewertung berücksichtigt verschiedene Aspekte, ohne alles abzulehnen." },
        { q: "A: Wenn wir das Problem nur kosmetisch lösen, taucht es in zwei Wochen wieder auf. B: Dann brauchen wir keine Zwischenlösung, sondern eine ___ Lösung.", correct: "nachhaltige", options: ["nachhaltige", "beliebige", "provisorische", "dekorative"], explanation: "Nachhaltig bedeutet hier langfristig tragfähig." },
        { q: "A: Ihre Formulierung ist korrekt, klingt aber etwas schroff. B: Dann sollte ich sie wohl ___.", correct: "abmildern", options: ["abmildern", "ignorieren", "beschleunigen", "vergrößern"], explanation: "Eine schroffe Formulierung kann man abmildern." },
        { q: "A: Das Argument ist nicht falsch, greift aber zu kurz. B: Es müsste also stärker ___.", correct: "kontextualisiert werden", options: ["kontextualisiert werden", "auswendig gelernt werden", "verkürzt werden", "verschwiegen werden"], explanation: "Wenn ein Argument zu kurz greift, braucht es mehr Kontext." },
      ]
    : [
        { q: "A: The plan is elegant, but under the current constraints it is hardly viable. B: In other words, it is theoretically persuasive but practically ___.", correct: "unworkable", options: ["unworkable", "irrelevant", "outdated", "accidental"], explanation: "Unworkable captures the implied criticism: it cannot realistically be implemented." },
        { q: "A: I don't want to dismiss the decision outright; I just want to weigh its consequences carefully. B: So you're calling for a more ___ assessment.", correct: "nuanced", options: ["nuanced", "arbitrary", "superficial", "hasty"], explanation: "A nuanced assessment considers complexity rather than rejecting something outright." },
        { q: "A: If we only address the problem cosmetically, it will reappear in two weeks. B: Then we need a ___ solution, not a temporary fix.", correct: "sustainable", options: ["sustainable", "random", "decorative", "makeshift"], explanation: "Sustainable means lasting and structurally sound in this context." },
        { q: "A: Your wording is accurate, but it sounds rather blunt. B: Then I should probably ___.", correct: "soften it", options: ["soften it", "ignore it", "speed it up", "enlarge it"], explanation: "If wording is too blunt, you soften it." },
        { q: "A: The argument isn't wrong, but it lacks sufficient context. B: It needs to be more thoroughly ___.", correct: "contextualised", options: ["contextualised", "memorised", "shortened", "concealed"], explanation: "An argument lacking context needs to be contextualised." },
      ];

  const tasks = levelIndex >= 6 ? c2 : levelIndex >= 4 ? b2 : easy;
  return { context, tasks: tasks.map((item, index) => ({ ...item, options: deterministicShuffle(item.options, bonusNumber * 41 + index * 9 + levelIndex), type: "Диалог" })) };
}

function completeBonus(studentName, type, level, bonusNumber, score) {
  const progress = getBonusProgress(studentName);
  const key = `${type}-${level}-${bonusNumber}`;
  const next = {
    ...progress,
    completed: { ...(progress.completed || {}), [key]: score >= 4 },
    scores: { ...(progress.scores || {}), [key]: score },
  };
  saveBonusProgress(studentName, next);
  return next;
}

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

        <div className="mb-6 grid gap-3 md:grid-cols-6">
          {[
            ["dashboard", "Обзор", "home"],
            ["student", "Для ученика", "user"],
            ["parents", "Для родителей", "parent"],
            ["schedule", "Учебный план", "calendar"],
            ["learning", "Учебное меню", "book"],
            ["progress", "Прогресс", "chart"],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} className={`rounded-2xl p-4 text-left font-black shadow-sm ring-1 transition ${view === id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}><Icon name={icon} /> {label}</button>
          ))}
        </div>

        {view === "dashboard" && <StudentDashboard student={student} quiz={quiz} quizState={quizState} totalPoints={totalPoints} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "student" && <StudentInfo student={student} quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "parents" && <ParentsInfo student={student} />}
        {view === "schedule" && <StudentSchedule student={student} />}
        {view === "learning" && <LearningMenu student={student} />}
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
              <LearningMenu student={selectedStudent} adminMode />
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

        <div className="mb-6 grid gap-3 md:grid-cols-5">
          {[["overview", "Ученики", "👥"], ["calendar", "Календарь посещаемости", "📅"], ["revenue", "Доход", "₽"], ["learning", "Учебные меню", "📚"], ["stats", "Статистика", "📊"]].map(([id, label, icon]) => (
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

        {adminView === "learning" && (
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <Card className="p-6">
              <h2 className="text-3xl font-black">Учебные меню учеников</h2>
              <p className="mt-2 leading-7 text-slate-600">Anastasia может открыть учебное меню любого ученика. Для неё все уровни и все 100 заданий открыты.</p>
              <div className="mt-6 grid gap-3">
                {students.map((name) => {
                  const progress = getLearningProgress(name);
                  const bonusProgress = getBonusProgress(name);
                  const completedCount = Object.values(progress.completed || {}).filter(Boolean).length;
                  const completedBonusCount = Object.values(bonusProgress.completed || {}).filter(Boolean).length;
                  return (
                    <button key={name} onClick={() => setSelectedStudent(name)} className="rounded-3xl bg-slate-50 p-5 text-left ring-1 ring-slate-100 transition hover:bg-cyan-50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div><h3 className="text-2xl font-black">{name}</h3><p className="text-sm font-bold text-slate-500">Открытый уровень: {progress.unlockedLevel || "A0"} • обычные задания: {completedCount} • бонусы: {completedBonusCount}</p></div>
                        <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">Открыть профиль</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
            <LearningMenu student={adminUsername} adminMode />
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

function LearningMenu({ student, adminMode = false }) {
  const [access, setAccess] = useState(adminMode || student === adminUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(getLearningProgress(student));
  const [selectedLevel, setSelectedLevel] = useState("A0");
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [adminLearningLanguage, setAdminLearningLanguage] = useState("en");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [selectedMode, setSelectedMode] = useState("normal");
  const [selectedBonusType, setSelectedBonusType] = useState("reading");
  const [bonusProgress, setBonusProgress] = useState(getBonusProgress(student));

  const activeLearningLanguage = adminMode && student === adminUsername ? adminLearningLanguage : getLearningLanguage(student);

  const completedCount = Object.values(progress.completed || {}).filter(Boolean).length;

  const enterLearningMenu = () => {
    if (adminMode || student === adminUsername || learningPasswords[student] === password) {
      setAccess(true);
      setError("");
      setPassword("");
    } else {
      setError("Неверный пароль для учебного меню.");
    }
  };

  const openPuzzle = (level, puzzleNumber) => {
    if (!isLearningPuzzleUnlocked(student, level, puzzleNumber, adminMode || student === adminUsername)) return;
    setSelectedMode("normal");
    setSelectedLevel(level);
    setSelectedPuzzle(puzzleNumber);
    setAnswers({});
    setSubmitted(false);
    setRevealedAnswers({});
  };

  const openBonus = (type, level, bonusNumber) => {
    if (!isBonusUnlocked(student, type, level, bonusNumber, adminMode || student === adminUsername)) return;
    setSelectedMode("bonus");
    setSelectedBonusType(type);
    setSelectedLevel(level);
    setSelectedPuzzle(bonusNumber);
    setAnswers({});
    setSubmitted(false);
    setRevealedAnswers({});
  };

  const bonusData = selectedMode === "bonus" && selectedPuzzle
    ? selectedBonusType === "reading"
      ? generateReadingBonus(student, selectedLevel, selectedPuzzle, adminMode || student === adminUsername, activeLearningLanguage)
      : generateDialogBonus(student, selectedLevel, selectedPuzzle, adminMode || student === adminUsername, activeLearningLanguage)
    : null;
  const tasks = selectedPuzzle
    ? selectedMode === "normal"
      ? generateLearningPuzzle(student, selectedLevel, selectedPuzzle, adminMode || student === adminUsername, activeLearningLanguage)
      : bonusData.tasks
    : [];
  const score = tasks.reduce((sum, task, index) => sum + (answers[index] === task.correct ? 1 : 0), 0);
  const passMark = selectedMode === "normal" ? 8 : 4;
  const maxScore = selectedMode === "normal" ? questionsPerPuzzle : 5;

  const finishPuzzle = () => {
    setSubmitted(true);
    if (student === adminUsername) return;
    if (selectedMode === "normal" && score >= 8) {
      const next = completeLearningPuzzle(student, selectedLevel, selectedPuzzle, score);
      setProgress(next);
    }
    if (selectedMode === "bonus" && score >= 4) {
      const nextBonus = completeBonus(student, selectedBonusType, selectedLevel, selectedPuzzle, score);
      setBonusProgress(nextBonus);
    }
  };

  if (!access) {
    return (
      <Card className="p-8">
        <div className="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Защищённое учебное меню</div>
        <h2 className="text-3xl font-black">Введите отдельный пароль</h2>
        <p className="mt-3 leading-7 text-slate-600">Это не пароль от личного кабинета. Для учебного меню используется отдельный пароль.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enterLearningMenu()} type="password" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Пароль учебного меню" />
          <button onClick={enterLearningMenu} className="rounded-2xl bg-slate-950 px-6 py-3 font-black text-white">Открыть</button>
        </div>
        {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 font-bold text-red-700 ring-1 ring-red-100">{error}</div>}
      </Card>
    );
  }

  if (selectedPuzzle) {
    return (
      <Card className="p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div><div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">{selectedMode === "normal" ? `${selectedLevel} • Задание ${selectedPuzzle} / ${puzzlesPerLevel}` : `${selectedLevel} • ${selectedBonusType === "reading" ? "Бонус чтение" : "Бонус диалог"} ${selectedPuzzle} / ${bonusPerLevel}`}</div><h2 className="mt-3 text-3xl font-black">Учебное меню: {student}</h2></div>
          <button onClick={() => { setSelectedPuzzle(null); setSubmitted(false); setAnswers({}); setRevealedAnswers({}); }} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← Назад к заданиям</button>
        </div>

        {selectedMode === "bonus" && bonusData && (
          <div className="mb-6 rounded-3xl bg-violet-50 p-5 font-bold text-violet-900 ring-1 ring-violet-100">
            {selectedBonusType === "reading" ? bonusData.text : bonusData.context}
          </div>
        )}

        <div className="grid gap-4">
          {tasks.map((task, index) => {
            const selected = answers[index];
            const wrong = submitted && selected && selected !== task.correct;
            const correct = submitted && selected === task.correct;
            return (
              <div key={`${task.q}-${index}`} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-violet-800 shadow-sm">{index + 1}. {task.type}</div>
                <h3 className="text-lg font-black leading-7 text-slate-950">{task.q}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {task.options.map((option) => (
                    <button key={option} disabled={submitted} onClick={() => setAnswers({ ...answers, [index]: option })} className={`rounded-2xl p-3 text-left font-bold ring-1 transition ${correct && option === selected ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : wrong && option === selected ? "bg-red-50 text-red-700 ring-red-200" : submitted && option === task.correct ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : selected === option ? "bg-cyan-50 text-cyan-800 ring-cyan-200" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{option}</button>
                  ))}
                </div>
                {adminMode && (
                  <button
                    type="button"
                    onClick={() => setRevealedAnswers({ ...revealedAnswers, [index]: !revealedAnswers[index] })}
                    className="mt-4 rounded-2xl bg-violet-100 px-4 py-3 text-sm font-black text-violet-800 ring-1 ring-violet-200"
                  >
                    {revealedAnswers[index] ? "Скрыть ответ" : "Показать ответ и объяснение"}
                  </button>
                )}
                {(wrong || revealedAnswers[index]) && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">Правильный ответ: {task.correct}. {task.explanation}</div>}
              </div>
            );
          })}
        </div>

        {!submitted ? (
          <button onClick={finishPuzzle} className="mt-6 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-yellow-400 px-6 py-4 font-black text-slate-950 shadow-lg">Проверить результат</button>
        ) : (
          <div className={`mt-6 rounded-[1.75rem] p-6 font-black ${score >= 8 ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}>
            Результат: {score} / {maxScore}. {score >= passMark ? (selectedMode === "normal" ? "Задание выполнено, следующее задание открыто." : "Бонус выполнен.") : `Нужно минимум ${passMark} правильных ответов. Повторите задание.`}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Учебное меню • {student}</div><h2 className="mt-3 text-3xl font-black">Уровни A0–C2 и 100 заданий на уровень</h2><p className="mt-2 leading-7 text-slate-600">Каждое задание содержит 10 вопросов: чтение, грамматика и слова. Для открытия следующего задания нужно минимум 8 из 10.</p></div>
        <div className="rounded-3xl bg-yellow-50 p-4 text-sm font-black text-orange-800 ring-1 ring-yellow-100">Завершено: {completedCount}</div>
      </div>

      {adminMode && student === adminUsername && (
        <div className="mb-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="mb-3 text-sm font-black text-slate-600">Язык учебного меню Anastasia</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => { setAdminLearningLanguage("en"); setSelectedPuzzle(null); }} className={`rounded-2xl px-4 py-3 font-black ring-1 ${adminLearningLanguage === "en" ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100"}`}>Английские уровни A0–C2</button>
            <button onClick={() => { setAdminLearningLanguage("de"); setSelectedPuzzle(null); }} className={`rounded-2xl px-4 py-3 font-black ring-1 ${adminLearningLanguage === "de" ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100"}`}>Немецкие уровни A0–C2</button>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[["normal", "Обычные уровни"], ["bonus-reading", "Бонус: чтение"], ["bonus-dialog", "Бонус: диалоги"]].map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              if (id === "normal") setSelectedMode("normal");
              if (id === "bonus-reading") { setSelectedMode("bonus"); setSelectedBonusType("reading"); }
              if (id === "bonus-dialog") { setSelectedMode("bonus"); setSelectedBonusType("dialog"); }
              setSelectedPuzzle(null);
            }}
            className={`rounded-2xl px-4 py-3 font-black ring-1 transition ${selectedMode === "normal" && id === "normal" || selectedMode === "bonus" && selectedBonusType === "reading" && id === "bonus-reading" || selectedMode === "bonus" && selectedBonusType === "dialog" && id === "bonus-dialog" ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-7">
        {learningLevels.map((level) => {
          const unlocked = adminMode || student === adminUsername || learningLevels.indexOf(level) <= learningLevels.indexOf(progress.unlockedLevel || "A0");
          return <button key={level} onClick={() => setSelectedLevel(level)} disabled={!unlocked} className={`rounded-2xl px-4 py-3 font-black ring-1 transition ${selectedLevel === level ? "bg-slate-950 text-white ring-slate-950" : unlocked ? "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50" : "bg-slate-100 text-slate-400 ring-slate-100"}`}>{level}</button>;
        })}
      </div>

      {selectedMode === "normal" ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-20">
          {Array.from({ length: puzzlesPerLevel }, (_, i) => i + 1).map((number) => {
            const key = `${selectedLevel}-${number}`;
            const unlocked = isLearningPuzzleUnlocked(student, selectedLevel, number, adminMode || student === adminUsername);
            const completed = Boolean(progress.completed?.[key]) || adminMode || student === adminUsername;
            const score = progress.scores?.[key];
            return (
              <button key={key} onClick={() => openPuzzle(selectedLevel, number)} disabled={!unlocked} title={score !== undefined ? `${score}/10` : ""} className={`rounded-xl p-2 text-sm font-black ring-1 transition ${completed ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : unlocked ? "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50" : "bg-slate-100 text-slate-400 ring-slate-100"}`}>{number}</button>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-4 rounded-3xl bg-violet-50 p-5 font-bold text-violet-900 ring-1 ring-violet-100">
            {selectedBonusType === "reading" ? "Бонус чтение: один текст по выбранному уровню и 5 вопросов. Нужно минимум 4 из 5." : "Бонус диалоги: два или несколько собеседников, пропущенные слова или фразы и 5 заданий. Нужно минимум 4 из 5."}
          </div>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-20">
            {Array.from({ length: bonusPerLevel }, (_, i) => i + 1).map((number) => {
              const key = `${selectedBonusType}-${selectedLevel}-${number}`;
              const unlocked = isBonusUnlocked(student, selectedBonusType, selectedLevel, number, adminMode || student === adminUsername);
              const completed = Boolean(bonusProgress.completed?.[key]) || adminMode || student === adminUsername;
              const score = bonusProgress.scores?.[key];
              return (
                <button key={key} onClick={() => openBonus(selectedBonusType, selectedLevel, number)} disabled={!unlocked} title={score !== undefined ? `${score}/5` : ""} className={`rounded-xl p-2 text-sm font-black ring-1 transition ${completed ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : unlocked ? "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50" : "bg-slate-100 text-slate-400 ring-slate-100"}`}>{number}</button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
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
