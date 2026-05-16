import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

// Live-Synchronisation: Firebase-Projekt in .env.local eintragen.
// Beispiel:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "",
};

const LIVE_COLLECTION = "language-school-live-state";
const ACTIVITY_KEY = "live-activity";

let firestoreDb = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    signInAnonymously(auth).catch((error) => {
      console.warn("Anonyme Firebase-Anmeldung fehlgeschlagen. Firestore-Regeln können Schreibzugriffe blockieren.", error);
    });
  }
} catch (error) {
  console.warn("Firebase konnte nicht initialisiert werden. Die App arbeitet lokal weiter.", error);
}

function encodeLiveKey(key) {
  return encodeURIComponent(String(key)).replace(/\./g, "%2E");
}

function getLiveDocRef(key) {
  return firestoreDb ? doc(firestoreDb, LIVE_COLLECTION, encodeLiveKey(key)) : null;
}

function emitLiveUpdate(key, value) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("live-store-update", { detail: { key, value } }));
}

function writeLocalCache(key, value) {
  liveCache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage kann in Preview-/Privacy-Umgebungen gesperrt sein.
  }
}

async function writeLiveValue(key, value) {
  const ref = getLiveDocRef(key);
  if (!ref) return;
  await setDoc(ref, { key, value, updatedAt: serverTimestamp() }, { merge: true });
}

function subscribeLiveKey(key, fallback, onValue) {
  let closed = false;
  const initial = safeGet(key, fallback);
  onValue(initial);

  const localHandler = (event) => {
    if (event.detail?.key === key) onValue(event.detail.value);
  };
  const storageHandler = (event) => {
    if (event.key !== key || event.newValue == null) return;
    try {
      onValue(JSON.parse(event.newValue));
    } catch {
      onValue(fallback);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("live-store-update", localHandler);
    window.addEventListener("storage", storageHandler);
  }

  const ref = getLiveDocRef(key);
  const unsubscribeFirestore = ref
    ? onSnapshot(ref, (snapshot) => {
        if (closed || !snapshot.exists()) return;
        const next = snapshot.data()?.value ?? fallback;
        writeLocalCache(key, next);
        onValue(next);
      }, (error) => console.warn(`Realtime-Listener für ${key} fehlgeschlagen`, error))
    : () => {};

  return () => {
    closed = true;
    unsubscribeFirestore();
    if (typeof window !== "undefined") {
      window.removeEventListener("live-store-update", localHandler);
      window.removeEventListener("storage", storageHandler);
    }
  };
}

function useRealtimeKey(key, fallback) {
  const fallbackRef = useRef(fallback);
  const [value, setValueState] = useState(() => safeGet(key, fallbackRef.current));

  useEffect(() => {
    fallbackRef.current = fallback;
  }, [fallback]);

  useEffect(() => {
    return subscribeLiveKey(key, fallbackRef.current, setValueState);
  }, [key]);

  const setValue = (nextValue) => {
    const resolved = typeof nextValue === "function" ? nextValue(safeGet(key, fallbackRef.current)) : nextValue;
    setValueState(resolved);
    safeSet(key, resolved);
    return resolved;
  };

  return [value, setValue];
}

function publishLiveActivity(user, activity, details = {}) {
  if (!user) return;
  const current = safeGet(ACTIVITY_KEY, {});
  safeSet(ACTIVITY_KEY, {
    ...current,
    [user]: { user, activity, details, at: Date.now() },
  });
}

function useLiveActivities(currentUser) {
  const [activities] = useRealtimeKey(ACTIVITY_KEY, {});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    return Object.values(activities || {})
      .filter((item) => item?.user && item.user !== currentUser && now - Number(item.at || 0) < 45000)
      .sort((a, b) => Number(b.at || 0) - Number(a.at || 0));
  }, [activities, currentUser, now]);
}

function LiveActivityPanel({ currentUser }) {
  const activities = useLiveActivities(currentUser);
  return (
    <div className="mb-6 rounded-[1.75rem] bg-white/90 p-4 shadow-sm ring-1 ring-cyan-100 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className={`rounded-full px-4 py-2 text-sm font-black ${firestoreDb ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-orange-800"}`}>{firestoreDb ? "● Live-Synchronisation aktiv" : "● Lokal aktiv – Firebase-Konfiguration fehlt"}</div>
        <div className="text-sm font-bold text-slate-600">Änderungen an Aufgaben, Chats, Notizen und Fortschritt werden live geteilt.</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {activities.length ? activities.map((item) => (
          <span key={`${item.user}-${item.at}`} className="rounded-full bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-800 ring-1 ring-cyan-100">
            {item.user}: {item.activity}
          </span>
        )) : (
          <span className="rounded-full bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500 ring-1 ring-slate-100">Gerade keine andere sichtbare Aktivität.</span>
        )}
      </div>
    </div>
  );
}


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
  Liebling: "liebling2026",
  Artjom: "artjom2026",
  Maria: "maria2026",
  Kris: "kris2026",
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
  Liebling: "learn-liebling-2026",
  Artjom: "learn-artjom-2026",
  Maria: "learn-maria-2026",
  Kris: "learn-kris-2026",
};

const adminUsername = "BesteLehrerin";
const students = Object.keys(accounts).filter((name) => name !== adminUsername);
const germanStudents = ["Sonja", "Vanja"];
const bilingualStudents = ["Liebling", "Artjom", "Maria", "Kris"];
const studentLanguages = {
  Sonja: ["de"],
  Vanja: ["de"],
  Liebling: ["en", "de"],
  Artjom: ["en", "de", "es"],
  Maria: ["en", "de"],
  Kris: ["en", "de"],
};
const languageLabels = {
  en: "English",
  de: "Deutsch",
  es: "Español",
};

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
  Liebling: [],
  Artjom: [],
  Maria: [],
  Kris: [],
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
  Liebling: 0,
  Artjom: 0,
  Maria: 0,
  Kris: 0,
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
  es: {
    A0: [
      { word: "agua", answer: "вода", options: ["вода", "книга", "окно", "улица"], example: "Bebo agua todos los días." },
      { word: "libro", answer: "книга", options: ["книга", "стол", "день", "молоко"], example: "El libro es interesante." },
    ],
    A1: [
      { word: "desayuno", answer: "завтрак", options: ["завтрак", "зонт", "город", "чек"], example: "Tomo el desayuno a las ocho." },
      { word: "paraguas", answer: "зонт", options: ["зонт", "учитель", "кошелёк", "дом"], example: "Necesito un paraguas." },
    ],
    A2: [
      { word: "deberes", answer: "домашнее задание", options: ["домашнее задание", "билет", "лекарство", "окно"], example: "Hago los deberes por la tarde." },
      { word: "cartera", answer: "кошелёк", options: ["кошелёк", "сосед", "очередь", "школа"], example: "Mi cartera está en la bolsa." },
    ],
    B1: [
      { word: "cita", answer: "встреча / запись", options: ["встреча / запись", "аренда", "остатки еды", "город"], example: "Tengo una cita mañana." },
      { word: "vecino", answer: "сосед", options: ["сосед", "завтрак", "подписка", "школа"], example: "Mi vecino es amable." },
    ],
    B2: [
      { word: "recibo", answer: "чек", options: ["чек", "подписка", "вход", "окно"], example: "Guarda el recibo." },
      { word: "horario", answer: "расписание", options: ["расписание", "молоко", "дверь", "учитель"], example: "Mi horario está lleno." },
    ],
    C1: [
      { word: "trayecto", answer: "дорога на работу / учёбу", options: ["дорога на работу / учёбу", "подарок", "зонт", "молоко"], example: "El trayecto dura cuarenta minutos." },
      { word: "recado", answer: "поручение / бытовое дело", options: ["поручение / бытовое дело", "чек", "город", "лекарство"], example: "Tengo que hacer un recado." },
    ],
    C2: [
      { word: "sobras", answer: "остатки еды", options: ["остатки еды", "расписание", "окно", "сосед"], example: "Comimos las sobras para cenar." },
      { word: "quehaceres", answer: "домашние обязанности", options: ["домашние обязанности", "встреча", "подписка", "город"], example: "Los quehaceres forman parte de la vida diaria." },
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
  },
  es: {
    A0: {
      words: [["agua", "вода"], ["libro", "книга"], ["casa", "дом"], ["escuela", "школа"], ["día", "день"], ["bolsa", "сумка"], ["leche", "молоко"], ["calle", "улица"], ["madre", "мама"], ["ventana", "окно"]],
      grammar: [["Yo ___ estudiante.", "soy", ["soy", "eres", "es", "son"], "С yo используется soy: Yo soy estudiante."], ["Tú ___ amable.", "eres", ["eres", "soy", "es", "somos"], "С tú используется eres."], ["Él ___ en casa.", "está", ["está", "estoy", "están", "estás"], "Для местоположения используется estar: él está."], ["Nosotros ___ español.", "hablamos", ["hablamos", "hablo", "habla", "hablan"], "С nosotros окончание -amos."], ["La casa ___ grande.", "es", ["es", "está", "son", "soy"], "Постоянное качество: ser, la casa es grande."], ["Tengo ___ libro.", "un", ["un", "una", "unos", "unas"], "Libro — мужской род: un libro."], ["Tengo ___ bolsa.", "una", ["una", "un", "unos", "unas"], "Bolsa — женский род: una bolsa."], ["¿Cómo te ___?", "llamas", ["llamas", "llamo", "llama", "llaman"], "Правильная фраза: ¿Cómo te llamas?"], ["Me ___ Artjom.", "llamo", ["llamo", "llamas", "llama", "llaman"], "Правильно: Me llamo..."], ["Yo ___ agua.", "bebo", ["bebo", "bebes", "bebe", "beben"], "С yo: bebo." ]],
      reading: [["Ana tiene un libro. ¿Qué tiene Ana?", "libro", ["libro", "agua", "casa", "bolsa"], "В тексте сказано: Ana tiene un libro."], ["Max bebe agua. ¿Qué bebe Max?", "agua", ["agua", "leche", "té", "café"], "В тексте сказано: bebe agua."], ["La casa es grande. ¿Cómo es la casa?", "grande", ["grande", "pequeña", "roja", "vieja"], "В тексте сказано: es grande."], ["Voy a la escuela. ¿Adónde voy?", "escuela", ["escuela", "banco", "parque", "cine"], "В тексте сказано: a la escuela."], ["La bolsa es azul. ¿De qué color es la bolsa?", "azul", ["azul", "roja", "blanca", "verde"], "В тексте сказано: azul."]]
    },
    A1: { words: [["desayuno", "завтрак"], ["paraguas", "зонт"], ["profesor", "учитель"], ["familia", "семья"], ["ciudad", "город"], ["billete", "билет"], ["móvil", "телефон"], ["tarde", "вечер"], ["clase", "урок"], ["pregunta", "вопрос"]], grammar: [], reading: [] },
    A2: { words: [["deberes", "домашнее задание"], ["cartera", "кошелёк"], ["cita", "встреча / запись"], ["vecino", "сосед"], ["recibo", "чек"], ["horario", "расписание"], ["cola", "очередь"], ["medicina", "лекарство"], ["entrada", "вход"], ["salida", "выход"]], grammar: [], reading: [] },
    B1: { words: [["trayecto", "дорога на работу / учёбу"], ["recado", "поручение / бытовое дело"], ["sobras", "остатки еды"], ["quehaceres", "домашние обязанности"], ["reembolso", "возврат денег"], ["atajo", "короткий путь"], ["plazo", "срок сдачи"], ["alquiler", "аренда"], ["comestibles", "продукты"], ["vida cotidiana", "повседневность"]], grammar: [], reading: [] },
    B2: { words: [["mantenimiento", "техническое обслуживание"], ["inauguración de casa", "новоселье"], ["viajero habitual", "человек, ездящий на работу"], ["vencido", "просроченный"], ["electrodoméstico", "бытовой прибор"], ["almacenamiento", "хранение"], ["suscripción", "подписка"], ["aviso", "уведомление"], ["arrendador", "арендодатель"], ["inquilino", "арендатор"]], grammar: [], reading: [] },
    C1: { words: [["desorden", "беспорядок"], ["pausa", "время отдыха"], ["compromiso", "компромисс"], ["contratiempo", "неудача"], ["carga de trabajo", "рабочая нагрузка"], ["viable", "осуществимый"], ["mantenimiento", "содержание / уход"], ["molestia", "хлопоты"], ["restricción", "ограничение"], ["prioridad", "приоритет"]], grammar: [], reading: [] },
    C2: { words: [["provisional", "временный / самодельный"], ["tedioso", "утомительный"], ["meticuloso", "тщательный"], ["posponer", "откладывать"], ["enrevesado", "запутанный"], ["pragmático", "прагматичный"], ["inconveniente", "неудобство"], ["resistente", "устойчивый"], ["austero", "экономный"], ["mundano", "повседневный"]], grammar: [], reading: [] }
  }
};

function normalizeLearningBank() {
  ["en", "de", "es"].forEach((lang) => {
    learningLevels.forEach((level, idx) => {
      const bank = learningTaskBank[lang][level];
      const fallbackLevel = idx > 0 ? learningTaskBank[lang][learningLevels[idx - 1]] : learningTaskBank[lang].A0;
      if (!bank.grammar.length) bank.grammar = fallbackLevel.grammar;
      if (!bank.reading.length) bank.reading = fallbackLevel.reading;
    });
  });
}
normalizeLearningBank();

function getStudentLanguages(studentName) {
  return studentLanguages[studentName] || (germanStudents.includes(studentName) ? ["de"] : ["en"]);
}

function getStudentActiveLanguage(studentName) {
  const languages = getStudentLanguages(studentName);
  if (languages.length > 1) {
    const saved = safeGet(`active-language-${studentName}`, languages[0]);
    return languages.includes(saved) ? saved : languages[0];
  }
  return languages[0];
}

function saveStudentActiveLanguage(studentName, language) {
  const languages = getStudentLanguages(studentName);
  if (languages.length <= 1 || !languages.includes(language)) return;
  safeSet(`active-language-${studentName}`, language);
}

function getLearningLanguage(studentName) {
  if (studentName === adminUsername) return "en";
  return getStudentActiveLanguage(studentName);
}

function getStudentLanguageLabel(studentName) {
  return getStudentLanguages(studentName).map((lang) => languageLabels[lang] || lang).join(" & ");
}

function getActiveLanguageLabel(studentName) {
  const active = getStudentActiveLanguage(studentName);
  return languageLabels[active] || active;
}

function getLearningProgress(studentName) {
  return safeGet(`learning-progress-${studentName}`, { unlockedLevel: "A0", completed: {}, scores: {}, answers: {} });
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

function getSpanishStructuredLearningData() {
  return {
    words: {
      A0: [["agua", "вода"], ["libro", "книга"], ["casa", "дом"], ["escuela", "школа"], ["día", "день"], ["bolsa", "сумка"], ["leche", "молоко"], ["calle", "улица"], ["madre", "мама"], ["ventana", "окно"], ["manzana", "яблоко"], ["mesa", "стол"], ["puerta", "дверь"], ["bolígrafo", "ручка"], ["gato", "кошка"]],
      A1: [["desayuno", "завтрак"], ["paraguas", "зонт"], ["profesor", "учитель"], ["familia", "семья"], ["ciudad", "город"], ["billete", "билет"], ["móvil", "телефон"], ["tarde", "вечер"], ["clase", "урок"], ["pregunta", "вопрос"], ["amigo", "друг"], ["tienda", "магазин"], ["tren", "поезд"], ["tiempo", "погода / время"], ["cocina", "кухня"]],
      A2: [["deberes", "домашнее задание"], ["cartera", "кошелёк"], ["cita", "запись / встреча"], ["vecino", "сосед"], ["recibo", "чек"], ["horario", "расписание"], ["cola", "очередь"], ["medicina", "лекарство"], ["entrada", "вход"], ["salida", "выход"], ["entrega", "доставка"], ["mensaje", "сообщение"], ["reunión", "встреча"], ["esquina", "угол"], ["cambio", "сдача / изменение"]],
      B1: [["trayecto", "дорога на работу"], ["recado", "поручение"], ["sobras", "остатки еды"], ["quehaceres", "домашние обязанности"], ["reembolso", "возврат денег"], ["atajo", "короткий путь"], ["plazo", "срок сдачи"], ["alquiler", "аренда"], ["comestibles", "продукты"], ["rutina", "режим / рутина"], ["queja", "жалоба"], ["encuesta", "опрос"], ["retraso", "задержка"], ["elección", "выбор"], ["hábito", "привычка"]],
      B2: [["mantenimiento", "техническое обслуживание"], ["suscripción", "подписка"], ["aviso", "уведомление"], ["arrendador", "арендодатель"], ["inquilino", "арендатор"], ["vencido", "просроченный"], ["electrodoméstico", "бытовой прибор"], ["almacenamiento", "хранение"], ["normativa", "правило / регламент"], ["capacidad", "вместимость / способность"], ["suposición", "предположение"], ["impacto", "влияние"], ["requisito", "требование"], ["disponibilidad", "доступность"], ["prioridad", "приоритет"]],
      C1: [["restricción", "ограничение"], ["compromiso", "компромисс"], ["contratiempo", "неудача"], ["carga de trabajo", "рабочая нагрузка"], ["viable", "осуществимый"], ["mantenimiento", "содержание / уход"], ["molestia", "морока / хлопоты"], ["resiliencia", "устойчивость"], ["responsabilidad", "ответственность"], ["ambigüedad", "двусмысленность"], ["implicación", "последствие / смысл"], ["coherencia", "последовательность"], ["deficiencia", "недостаток"], ["perspectiva", "понимание / взгляд"], ["enfoque", "подход"]],
      C2: [["enrevesado", "запутанный"], ["meticuloso", "тщательный"], ["pragmático", "прагматичный"], ["tedioso", "утомительный"], ["austero", "экономный"], ["mundano", "повседневный"], ["plausible", "правдоподобный"], ["sutil", "тонкий / едва заметный"], ["perjudicial", "вредный"], ["escrutinio", "тщательное изучение"], ["coherente", "последовательный"], ["redundante", "избыточный"], ["controvertido", "спорный"], ["exhaustivo", "основательный"], ["sostenible", "устойчивый"]],
    },
    grammar: [
      ["ser", ["Yo ___ estudiante.", "soy", ["soy", "eres", "es", "son"], "С yo используется soy: Yo soy estudiante."], ["Ella ___ profesora.", "es", ["es", "soy", "eres", "son"], "С él/ella используется es."]],
      ["estar", ["Yo ___ en casa.", "estoy", ["estoy", "soy", "está", "eres"], "Для местоположения используется estar: estoy en casa."], ["El libro ___ en la mesa.", "está", ["está", "es", "son", "estoy"], "Местоположение предмета: está." ]],
      ["presente", ["Nosotros ___ español.", "hablamos", ["hablamos", "hablo", "habla", "hablan"], "С nosotros окончание -amos."], ["Tú ___ mucho.", "estudias", ["estudias", "estudio", "estudia", "estudian"], "С tú часто окончание -as/-es." ]],
      ["género", ["Tengo ___ libro.", "un", ["un", "una", "unos", "unas"], "Libro — мужской род: un libro."], ["Tengo ___ casa.", "una", ["una", "un", "unos", "unas"], "Casa — женский род: una casa." ]],
      ["pretérito", ["Ayer yo ___ una carta.", "escribí", ["escribí", "escribo", "escribiré", "escribiendo"], "Ayer указывает на прошедшее время."], ["La semana pasada ellos ___.", "viajaron", ["viajaron", "viajan", "viajarán", "viajando"], "La semana pasada требует pretérito indefinido." ]],
      ["subjuntivo básico", ["Quiero que tú ___ más.", "practiques", ["practiques", "practicas", "practicar", "practicabas"], "После quiero que используется subjuntivo."], ["Es importante que ella ___ puntual.", "sea", ["sea", "es", "ser", "está"], "После es importante que используется subjuntivo." ]],
      ["advanced", ["Si lo hubiera sabido, ___ antes.", "habría venido", ["habría venido", "vendré", "vengo", "vine"], "Условная конструкция прошлого: si + pluscuamperfecto de subjuntivo, condicional compuesto."], ["No solo ___ tarde, sino que olvidó los documentos.", "llegó", ["llegó", "llega", "llegando", "llegar"], "В прошедшем повествовании используется pretérito: llegó." ]],
    ],
    readingPeople: ["Ana", "Max", "Lena", "Igor", "Masha", "Denis", "Polina", "Sofía"],
    places: ["escuela", "oficina", "biblioteca", "estación", "clínica", "clase de idiomas", "supermercado", "aeropuerto"],
    actions: ["revisa el horario", "repite palabras nuevas", "pregunta por el camino", "guarda el recibo", "cambia la cita", "prepara una presentación corta", "compara dos opciones", "explica el problema"],
  };
}

function getStructuredLearningData(lang) {
  const data = {
    en: {
      words: {
        A0: [["water", "вода"], ["book", "книга"], ["house", "дом"], ["school", "школа"], ["day", "день"], ["bag", "сумка"], ["milk", "молоко"], ["street", "улица"], ["mother", "мама"], ["window", "окно"], ["apple", "яблоко"], ["table", "стол"], ["door", "дверь"], ["pen", "ручка"], ["cat", "кошка"]],
        A1: [["breakfast", "завтрак"], ["umbrella", "зонт"], ["teacher", "учитель"], ["family", "семья"], ["city", "город"], ["ticket", "билет"], ["phone", "телефон"], ["evening", "вечер"], ["lesson", "урок"], ["question", "вопрос"], ["friend", "друг"], ["shop", "магазин"], ["train", "поезд"], ["weather", "погода"], ["kitchen", "кухня"]],
        A2: [["homework", "домашнее задание"], ["wallet", "кошелёк"], ["appointment", "запись / встреча"], ["neighbour", "сосед"], ["receipt", "чек"], ["schedule", "расписание"], ["queue", "очередь"], ["medicine", "лекарство"], ["entrance", "вход"], ["exit", "выход"], ["delivery", "доставка"], ["message", "сообщение"], ["meeting", "встреча"], ["corner", "угол"], ["change", "сдача / изменение"]],
        B1: [["commute", "дорога на работу"], ["errand", "поручение"], ["leftovers", "остатки еды"], ["household chores", "домашние обязанности"], ["refund", "возврат денег"], ["shortcut", "короткий путь"], ["deadline", "срок сдачи"], ["rent", "аренда"], ["groceries", "продукты"], ["routine", "режим / рутина"], ["complaint", "жалоба"], ["survey", "опрос"], ["delay", "задержка"], ["choice", "выбор"], ["habit", "привычка"]],
        B2: [["maintenance", "техническое обслуживание"], ["subscription", "подписка"], ["notice", "уведомление"], ["landlord", "арендодатель"], ["tenant", "арендатор"], ["overdue", "просроченный"], ["appliance", "бытовой прибор"], ["storage", "хранение"], ["policy", "правило / политика"], ["capacity", "вместимость / способность"], ["assumption", "предположение"], ["impact", "влияние"], ["requirement", "требование"], ["availability", "доступность"], ["priority", "приоритет"]],
        C1: [["constraint", "ограничение"], ["trade-off", "компромисс"], ["setback", "неудача"], ["workload", "рабочая нагрузка"], ["feasible", "осуществимый"], ["upkeep", "содержание / уход"], ["hassle", "морока"], ["resilience", "устойчивость"], ["accountability", "ответственность"], ["ambiguity", "двусмысленность"], ["implication", "последствие / смысл"], ["consistency", "последовательность"], ["shortcoming", "недостаток"], ["insight", "понимание / вывод"], ["approach", "подход"]],
        C2: [["convoluted", "запутанный"], ["meticulous", "тщательный"], ["pragmatic", "прагматичный"], ["tedious", "утомительный"], ["frugal", "экономный"], ["mundane", "повседневный"], ["plausible", "правдоподобный"], ["subtle", "тонкий / едва заметный"], ["detrimental", "вредный"], ["scrutiny", "тщательное изучение"], ["coherent", "последовательный"], ["redundant", "избыточный"], ["contentious", "спорный"], ["thorough", "основательный"], ["sustainable", "устойчивый"]],
      },
      grammar: [
        ["to be", ["I ___ ready.", "am", ["am", "is", "are", "be"], "С I используется am."], ["She ___ ready.", "is", ["is", "are", "am", "be"], "С he/she/it используется is."]],
        ["present simple", ["He usually ___ tea.", "drinks", ["drink", "drinks", "drinking", "drank"], "В Present Simple с he/she/it добавляется -s."], ["They ___ English every day.", "study", ["study", "studies", "studied", "studying"], "С they используется базовая форма глагола."]],
        ["past simple", ["Yesterday she ___ home late.", "came", ["come", "came", "comes", "coming"], "Yesterday указывает на Past Simple."], ["We ___ the film last night.", "watched", ["watch", "watched", "watches", "watching"], "Last night требует Past Simple."]],
        ["present perfect", ["I have lived here ___ 2020.", "since", ["since", "for", "from", "during"], "Since используется с точкой начала."], ["She has worked here ___ two years.", "for", ["for", "since", "during", "from"], "For используется с периодом времени."]],
        ["conditionals", ["If I had more time, I ___ practise more.", "would", ["would", "will", "can", "am"], "Second conditional: If + Past, would + verb."], ["If it rains, we ___ stay home.", "will", ["will", "would", "did", "are"], "First conditional: If + Present, will + verb."]],
        ["passive", ["The report ___ yesterday.", "was written", ["was written", "wrote", "is write", "has wrote"], "Пассив Past Simple: was/were + V3."], ["The room ___ every day.", "is cleaned", ["is cleaned", "cleans", "cleaned", "clean"], "Пассив Present Simple: is/are + V3."]],
        ["advanced", ["Not only ___ late, but he also forgot the file.", "was he", ["was he", "he was", "is he", "he is"], "После Not only в начале предложения нужна инверсия."], ["Had I known, I ___ earlier.", "would have left", ["would have left", "would leave", "left", "will leave"], "Инверсия в third conditional: Had I known..."]],
      ],
      readingPeople: ["Anna", "Max", "Lena", "Igor", "Masha", "Denis", "Polina", "Sonja"],
      places: ["school", "office", "library", "station", "clinic", "language class", "supermarket", "airport"],
      actions: ["checks the schedule", "reviews new words", "asks for directions", "keeps the receipt", "changes the appointment", "prepares a short presentation", "compares two options", "explains the problem"],
    },
    de: {
      words: {
        A0: [["das Wasser", "вода"], ["das Buch", "книга"], ["das Haus", "дом"], ["die Schule", "школа"], ["der Tag", "день"], ["die Tasche", "сумка"], ["die Milch", "молоко"], ["die Straße", "улица"], ["die Mutter", "мама"], ["das Fenster", "окно"], ["der Apfel", "яблоко"], ["der Tisch", "стол"], ["die Tür", "дверь"], ["der Stift", "ручка"], ["die Katze", "кошка"]],
        A1: [["das Frühstück", "завтрак"], ["der Regenschirm", "зонт"], ["der Lehrer", "учитель"], ["die Familie", "семья"], ["die Stadt", "город"], ["die Fahrkarte", "билет"], ["das Handy", "телефон"], ["der Abend", "вечер"], ["der Unterricht", "урок"], ["die Frage", "вопрос"], ["der Freund", "друг"], ["das Geschäft", "магазин"], ["der Zug", "поезд"], ["das Wetter", "погода"], ["die Küche", "кухня"]],
        A2: [["die Hausaufgabe", "домашнее задание"], ["die Geldbörse", "кошелёк"], ["der Termin", "запись / встреча"], ["der Nachbar", "сосед"], ["die Quittung", "чек"], ["der Stundenplan", "расписание"], ["die Schlange", "очередь"], ["das Medikament", "лекарство"], ["der Eingang", "вход"], ["der Ausgang", "выход"], ["die Lieferung", "доставка"], ["die Nachricht", "сообщение"], ["die Besprechung", "встреча"], ["die Ecke", "угол"], ["das Wechselgeld", "сдача"]],
        B1: [["der Arbeitsweg", "дорога на работу"], ["die Besorgung", "поручение"], ["die Essensreste", "остатки еды"], ["die Hausarbeit", "домашние обязанности"], ["die Rückerstattung", "возврат денег"], ["die Abkürzung", "короткий путь"], ["die Frist", "срок сдачи"], ["die Miete", "аренда"], ["die Lebensmittel", "продукты"], ["die Routine", "режим / рутина"], ["die Beschwerde", "жалоба"], ["die Umfrage", "опрос"], ["die Verspätung", "задержка"], ["die Wahl", "выбор"], ["die Gewohnheit", "привычка"]],
        B2: [["die Wartung", "техническое обслуживание"], ["das Abonnement", "подписка"], ["die Mitteilung", "уведомление"], ["der Vermieter", "арендодатель"], ["der Mieter", "арендатор"], ["überfällig", "просроченный"], ["das Haushaltsgerät", "бытовой прибор"], ["die Aufbewahrung", "хранение"], ["die Regelung", "правило"], ["die Kapazität", "вместимость / способность"], ["die Annahme", "предположение"], ["die Auswirkung", "влияние"], ["die Anforderung", "требование"], ["die Verfügbarkeit", "доступность"], ["die Priorität", "приоритет"]],
        C1: [["die Einschränkung", "ограничение"], ["der Kompromiss", "компромисс"], ["der Rückschlag", "неудача"], ["die Arbeitsbelastung", "рабочая нагрузка"], ["machbar", "осуществимый"], ["die Instandhaltung", "содержание / уход"], ["der Aufwand", "морока / усилие"], ["die Belastbarkeit", "устойчивость"], ["die Verantwortlichkeit", "ответственность"], ["die Mehrdeutigkeit", "двусмысленность"], ["die Konsequenz", "последствие"], ["die Beständigkeit", "последовательность"], ["der Mangel", "недостаток"], ["die Einsicht", "понимание / вывод"], ["der Ansatz", "подход"]],
        C2: [["verworren", "запутанный"], ["sorgfältig", "тщательный"], ["pragmatisch", "прагматичный"], ["mühsam", "утомительный"], ["sparsam", "экономный"], ["alltäglich", "повседневный"], ["plausibel", "правдоподобный"], ["subtil", "тонкий / едва заметный"], ["schädlich", "вредный"], ["die Prüfung", "тщательное изучение"], ["schlüssig", "последовательный"], ["überflüssig", "избыточный"], ["umstritten", "спорный"], ["gründlich", "основательный"], ["nachhaltig", "устойчивый"]],
      },
      grammar: [
        ["sein", ["Ich ___ müde.", "bin", ["bin", "bist", "ist", "sind"], "С ich используется bin."], ["Du ___ hier.", "bist", ["bist", "bin", "ist", "seid"], "С du используется bist."]],
        ["Präsens", ["Er ___ Deutsch.", "lernt", ["lernt", "lerne", "lernen", "lernst"], "С er окончание -t."], ["Wir ___ morgen.", "kommen", ["kommen", "kommt", "komme", "kommst"], "С wir используется kommen."]],
        ["Perfekt", ["Ich ___ meine Hausaufgaben gemacht.", "habe", ["habe", "bin", "hat", "ist"], "Для machen в Perfekt используется haben."], ["Sie ___ nach Hause gegangen.", "ist", ["ist", "hat", "sind", "haben"], "Для движения часто используется sein."]],
        ["Fälle", ["Ich helfe ___ Freund.", "dem", ["dem", "den", "der", "das"], "Helfen требует Dativ: dem Freund."], ["Ich sehe ___ Mann.", "den", ["den", "dem", "der", "das"], "Sehen требует Akkusativ: den Mann."]],
        ["Nebensätze", ["Ich bleibe zu Hause, weil ich müde ___.", "bin", ["bin", "bist", "ist", "sind"], "В придаточном предложении глагол стоит в конце."], ["Wenn ich Zeit habe, ___ ich dich an.", "rufe", ["rufe", "anrufe", "gerufen", "rufst"], "В главном предложении после wenn глагол стоит на позиции 2."]],
        ["Passiv", ["Der Brief ___ gestern geschrieben.", "wurde", ["wurde", "hat", "ist", "war hat"], "Passiv Präteritum: wurde + Partizip II."], ["Das Zimmer ___ jeden Tag gereinigt.", "wird", ["wird", "hat", "ist", "war"], "Passiv Präsens: wird + Partizip II."]],
        ["advanced", ["Hätte ich das gewusst, ___ ich anders reagiert.", "hätte", ["hätte", "wäre", "würde", "hatte"], "Konjunktiv II der Vergangenheit."], ["Je mehr man übt, ___ sicherer wird man.", "desto", ["desto", "weil", "obwohl", "wenn"], "Корреляция: je..., desto..."]],
      ],
      readingPeople: ["Anna", "Max", "Lena", "Igor", "Masha", "Denis", "Polina", "Sonja"],
      places: ["Schule", "Büro", "Bibliothek", "Bahnhof", "Klinik", "Sprachkurs", "Supermarkt", "Flughafen"],
      actions: ["prüft den Stundenplan", "wiederholt neue Wörter", "fragt nach dem Weg", "behält die Quittung", "verschiebt den Termin", "bereitet eine Präsentation vor", "vergleicht zwei Optionen", "erklärt das Problem"],
    },
  };
  if (lang === "es") return getSpanishStructuredLearningData();
  return data[lang] || data.en;
}

function createWordQuestion(lang, level, puzzleNumber, questionIndex, globalDifficulty) {
  const data = getStructuredLearningData(lang);
  const levelWords = data.words[level] || data.words.A0;
  const allAnswers = Object.values(data.words).flat().map((entry) => entry[1]);
  const item = levelWords[(puzzleNumber * 7 + questionIndex * 3) % levelWords.length];
  const wrongPool = allAnswers.filter((answer) => answer !== item[1]);
  const levelIndex = Math.max(0, learningLevels.indexOf(level));
  let q;
  if (lang === "es") {
    q = levelIndex <= 2 && questionIndex % 2 === 0
      ? `Что означает испанское слово «${item[0]}»?`
      : `Elige la traducción correcta de «${item[0]}».`;
  } else if (lang === "de") {
    q = `Что означает «${item[0]}»?`;
  } else {
    q = `What does “${item[0]}” mean?`;
  }
  const label = lang === "es" ? `Nivel ${level}, ejercicio ${puzzleNumber}` : `${level}, задание ${puzzleNumber}`;
  return { type: "Слова", q: `${q} (${label})`, correct: item[1], options: makeOptions(item[1], wrongPool, globalDifficulty + questionIndex), explanation: `Правильный перевод: ${item[0]} — ${item[1]}.` };
}

function createGrammarQuestion(lang, level, puzzleNumber, questionIndex, globalDifficulty) {
  const data = getStructuredLearningData(lang);
  const levelIndex = Math.max(0, learningLevels.indexOf(level));

  if (levelIndex === 0) {
    const easy = lang === "de"
      ? [
          ["Ich ___ Anna.", "bin", ["bin", "bist", "ist", "sind"], "A0: после ich используется bin."],
          ["Das ist ___ Buch.", "ein", ["ein", "eine", "einen", "einem"], "A0: Buch — das, поэтому ein Buch."],
          ["Du ___ hier.", "bist", ["bist", "bin", "ist", "seid"], "A0: после du используется bist."],
        ]
      : lang === "es"
        ? [
            ["Yo ___ Ana.", "soy", ["soy", "eres", "es", "son"], "A0: с yo используется soy."],
            ["Tengo ___ libro.", "un", ["un", "una", "unos", "unas"], "A0: libro — мужской род, поэтому un libro."],
            ["Tú ___ aquí.", "estás", ["estás", "estoy", "está", "son"], "A0: для местоположения с tú используется estás."],
          ]
        : [
            ["I ___ Anna.", "am", ["am", "is", "are", "be"], "A0: после I используется am."],
            ["This is ___ book.", "a", ["a", "an", "the", "are"], "A0: book начинается с согласного звука, поэтому a book."],
            ["You ___ here.", "are", ["are", "is", "am", "be"], "A0: после you используется are."],
          ];
    const item = easy[(puzzleNumber + questionIndex) % easy.length];
    return { type: "Грамматика", q: `${item[0]} (${level}, простая грамматика ${puzzleNumber}-${questionIndex + 1})`, correct: item[1], options: deterministicShuffle(item[2], globalDifficulty + questionIndex * 11), explanation: item[3] };
  }

  if (levelIndex >= 6) {
    const hard = lang === "de"
      ? [
          ["Hätte man die langfristigen Folgen früher berücksichtigt, ___ die Entscheidung anders ausgefallen.", "wäre", ["wäre", "war", "ist", "wird"], "C2: Konjunktiv II der Vergangenheit; die Entscheidung wäre anders ausgefallen."],
          ["Die These ist nicht falsch, ___ sie ohne Kontext leicht missverstanden wird.", "wenngleich", ["wenngleich", "weil nur", "seit wann", "ob dann"], "C2: wenngleich verbindet eine Einschränkung: obwohl/auch wenn."],
          ["Je differenzierter die Analyse, ___ belastbarer die Schlussfolgerung.", "desto", ["desto", "weil", "trotz", "seit"], "C2: feste Struktur je ... desto ..."],
        ]
      : lang === "es"
        ? [
            ["Si se hubieran considerado antes las consecuencias, la decisión ___ distinta.", "habría sido", ["habría sido", "será", "fue", "es"], "C2: si + pluscuamperfecto de subjuntivo требует condicional compuesto."],
            ["La propuesta parece viable, ___ requiere una evaluación más rigurosa.", "si bien", ["si bien", "por cuánto", "desde que no", "al menos de"], "C2: si bien вводит уступку: хотя / несмотря на то что."],
            ["Cuanto más matizada sea la explicación, ___ convincente resultará.", "más", ["más", "menos de", "nunca", "desde"], "C2: cuanto más..., más..."],
          ]
        : [
            ["Had the long-term implications been assessed earlier, the outcome ___ different.", "would have been", ["would have been", "will be", "was", "is"], "C2: inverted third conditional: Had ... been assessed, ... would have been."],
            ["The argument is plausible, ___ it rests on a questionable assumption.", "albeit", ["albeit", "because of", "since when", "in case to"], "C2: albeit introduces a concession or limitation."],
            ["The more nuanced the analysis, ___ robust the conclusion becomes.", "the more", ["the more", "the most", "more than", "as much"], "C2: comparative correlative: the more..., the more..."],
          ];
    const item = hard[(puzzleNumber + questionIndex) % hard.length];
    return { type: "Грамматика", q: `${item[0]} (${level}, сложная грамматика ${puzzleNumber}-${questionIndex + 1})`, correct: item[1], options: deterministicShuffle(item[2], globalDifficulty + questionIndex * 11), explanation: item[3] };
  }

  const grammarLimitByLevel = [0, 1, 3, 4, 5, 6, 6];
  const maxGrammarIndex = Math.min(data.grammar.length - 1, grammarLimitByLevel[levelIndex]);
  const minGrammarIndex = Math.max(0, levelIndex >= 4 ? maxGrammarIndex - 2 : 0);
  const grammarRange = data.grammar.slice(minGrammarIndex, maxGrammarIndex + 1);
  const grammarGroup = grammarRange[(puzzleNumber + questionIndex) % grammarRange.length];
  const variant = grammarGroup[1 + ((puzzleNumber + questionIndex) % 2)];
  const label = lang === "es" ? `Nivel ${level}, gramática ${puzzleNumber}-${questionIndex + 1}` : `${level}, грамматика ${puzzleNumber}-${questionIndex + 1}`;
  return { type: "Грамматика", q: `${variant[0]} (${label})`, correct: variant[1], options: deterministicShuffle(variant[2], globalDifficulty + questionIndex * 11), explanation: variant[3] };
}

function createReadingQuestion(lang, level, puzzleNumber, questionIndex, globalDifficulty) {
  const data = getStructuredLearningData(lang);
  const levelIndex = Math.max(0, learningLevels.indexOf(level));
  const person = data.readingPeople[(puzzleNumber + questionIndex) % data.readingPeople.length];
  const place = data.places[(puzzleNumber * 2 + questionIndex) % data.places.length];
  const action = data.actions[(puzzleNumber * 3 + questionIndex) % data.actions.length];
  const wrongPlaces = data.places.filter((item) => item !== place);

  if (levelIndex === 0) {
    const simpleText = lang === "de"
      ? `${person} ist in der ${place}. Wo ist ${person}?`
      : lang === "es"
        ? `${person} está en la ${place}. ¿Dónde está ${person}?`
        : `${person} is at the ${place}. Where is ${person}?`;
    return { type: "Чтение", q: simpleText, correct: place, options: makeOptions(place, wrongPlaces, globalDifficulty + questionIndex * 17), explanation: lang === "de" ? `В тексте прямо сказано: ${place}.` : lang === "es" ? `В тексте прямо сказано: ${place}.` : `The text directly says: ${place}.` };
  }

  if (levelIndex >= 6) {
    const concepts = lang === "de"
      ? ["tragfähig", "differenziert", "nachhaltig", "widersprüchlich"]
      : lang === "es"
        ? ["viable", "matizado", "sostenible", "contradictorio"]
        : ["viable", "nuanced", "sustainable", "contradictory"];
    const correctConcept = concepts[(puzzleNumber + questionIndex) % concepts.length];
    const text = lang === "de"
      ? `Der Vorschlag von ${person} wirkt zunächst überzeugend, doch bei genauerer Betrachtung zeigt sich, dass er nur unter sehr engen Bedingungen funktioniert. Die kurzfristigen Vorteile sind klar, die langfristigen Folgen bleiben jedoch unzureichend begründet. Welche Bewertung passt am besten?`
      : lang === "es"
        ? `La propuesta de ${person} parece convincente al principio, pero un análisis más detenido muestra que solo funciona bajo condiciones muy limitadas. Las ventajas a corto plazo son claras, pero las consecuencias a largo plazo no están suficientemente justificadas. ¿Qué valoración encaja mejor?`
        : `${person}'s proposal initially appears convincing, yet closer analysis shows that it only works under very narrow conditions. The short-term benefits are clear, but the long-term consequences are insufficiently justified. Which assessment fits best?`;
    const correct = correctConcept === concepts[0]
      ? (lang === "de" ? "nur bedingt tragfähig" : lang === "es" ? "solo parcialmente viable" : "only partially viable")
      : correctConcept === concepts[1]
        ? (lang === "de" ? "differenziert, aber kritisch" : lang === "es" ? "matizada, pero crítica" : "nuanced but critical")
        : correctConcept === concepts[2]
          ? (lang === "de" ? "nicht nachhaltig genug" : lang === "es" ? "no suficientemente sostenible" : "not sufficiently sustainable")
          : (lang === "de" ? "in sich widersprüchlich" : lang === "es" ? "internamente contradictoria" : "internally contradictory");
    const options = lang === "de"
      ? [correct, "rein faktisch und neutral", "vollständig gelöst", "ohne erkennbare Einschränkung"]
      : lang === "es"
        ? [correct, "puramente objetiva y neutral", "completamente resuelta", "sin ninguna limitación visible"]
        : [correct, "purely factual and neutral", "completely resolved", "without any visible limitation"];
    return { type: "Чтение", q: text, correct, options: deterministicShuffle(options, globalDifficulty + questionIndex * 17), explanation: "C2: нужно понять не отдельный факт, а скрытую оценку и ограничение аргумента." };
  }

  if (lang === "es") {
    const question = levelIndex <= 2 && questionIndex % 3 === 0 ? `¿Dónde está ${person}? / Где находится ${person}?` : `¿Dónde está ${person}?`;
    const text = `${person} está en la ${place} y ${action}. Después escribe una nota breve porque la tarea es importante. ${question}`;
    return { type: "Чтение", q: text, correct: place, options: makeOptions(place, wrongPlaces, globalDifficulty + questionIndex * 17), explanation: `В тексте сказано: ${person} está en la ${place}.` };
  }
  const text = lang === "de"
    ? `${person} ist im ${place} und ${action}. Danach macht die Person eine kurze Notiz, weil die Aufgabe wichtig ist. Frage ${puzzleNumber}-${questionIndex + 1}: Wo ist ${person}?`
    : `${person} is at the ${place} and ${action}. Then this person writes a short note because the task is important. Question ${puzzleNumber}-${questionIndex + 1}: Where is ${person}?`;
  return { type: "Чтение", q: text, correct: place, options: makeOptions(place, wrongPlaces, globalDifficulty + questionIndex * 17), explanation: lang === "de" ? `В тексте сказано: ${person} ist im ${place}.` : `The text says: ${person} is at the ${place}.` };
}

function generateLearningPuzzle(studentName, level, puzzleNumber, adminMode = false, languageOverride = null) {
  const lang = languageOverride || (adminMode && studentName === adminUsername ? "en" : getLearningLanguage(studentName));
  const supportedLang = ["de", "en", "es"].includes(lang) ? lang : getLearningLanguage(studentName);
  const levelPosition = Math.max(0, learningLevels.indexOf(level));
  const globalDifficulty = levelPosition * puzzlesPerLevel + puzzleNumber;
  const tasks = [];
  for (let i = 0; i < questionsPerPuzzle; i += 1) {
    const questionType = i % 3;
    const uniqueSeed = globalDifficulty * 100 + i;
    if (questionType === 0) tasks.push(createReadingQuestion(supportedLang, level, puzzleNumber, i, uniqueSeed));
    else if (questionType === 1) tasks.push(createGrammarQuestion(supportedLang, level, puzzleNumber, i, uniqueSeed));
    else tasks.push(createWordQuestion(supportedLang, level, puzzleNumber, i, uniqueSeed));
  }
  return tasks;
}

function completeLearningPuzzle(studentName, level, puzzleNumber, score, answerDetails = []) {
  const progress = getLearningProgress(studentName);
  const key = `${level}-${puzzleNumber}`;
  const next = {
    ...progress,
    completed: { ...(progress.completed || {}), [key]: score >= 8 },
    scores: { ...(progress.scores || {}), [key]: score },
    answers: { ...(progress.answers || {}), [key]: answerDetails },
  };
  if (score >= 8 && puzzleNumber >= puzzlesPerLevel) {
    const levelIndex = learningLevels.indexOf(level);
    next.unlockedLevel = learningLevels[Math.min(learningLevels.length - 1, levelIndex + 1)];
  }
  saveLearningProgress(studentName, next);
  return next;
}

function isLearningLevelCompleted(progress, level) {
  return Array.from({ length: puzzlesPerLevel }, (_, i) => i + 1).every((number) => Boolean(progress.completed?.[`${level}-${number}`]));
}

const bonusPerLevel = 20;

function getBonusProgress(studentName) {
  return safeGet(`bonus-progress-${studentName}`, { completed: {}, scores: {}, answers: {} });
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
    ? "Anna steht früh auf, trinkt Wasser und fährt mit dem Bus zur Schule. Am Nachmittag macht sie Hausaufgaben und wiederholt neue Wörter."
    : "Anna gets up early, drinks water and takes the bus to school. In the afternoon, she does her homework and reviews new words.";
  const advancedText = lang === "de"
    ? "Digitale Lernwerkzeuge sind nur dann wirklich hilfreich, wenn sie nicht bloß Aufgaben sammeln, sondern klare Lernziele, sinnvolle Rückmeldung und eine nachvollziehbare Progression verbinden. Ohne diese Struktur bleibt selbst eine moderne Plattform oberflächlich; mit guter didaktischer Planung kann dagegen auch ein einfaches digitales Board komplexe Lernprozesse sichtbar machen."
    : "Digital learning tools are genuinely useful only when they do more than collect exercises: they need clear learning goals, meaningful feedback and transparent progression. Without this structure, even a modern platform remains superficial; with thoughtful didactic planning, even a simple digital board can make complex learning processes visible.";
  const text = levelIndex >= 4 ? advancedText : easyText;
  const easyQuestions = lang === "de"
    ? [
        { q: "Wann steht Anna auf?", correct: "früh", options: ["spät", "früh", "nie", "nachts"], explanation: "Im Text steht: Anna steht früh auf." },
        { q: "Womit fährt Anna zur Schule?", correct: "mit dem Bus", options: ["mit dem Zug", "mit dem Bus", "zu Fuß", "mit dem Taxi"], explanation: "Im Text steht: fährt mit dem Bus zur Schule." },
        { q: "Was macht Anna am Nachmittag?", correct: "Hausaufgaben", options: ["Hausaufgaben", "Einkäufe", "Sport", "Kochen"], explanation: "Im Text steht: Am Nachmittag macht sie Hausaufgaben." },
        { q: "Was wiederholt Anna?", correct: "neue Wörter", options: ["alte Filme", "neue Wörter", "Telefonnummern", "Rezepte"], explanation: "Im Text steht: wiederholt neue Wörter." },
        { q: "Was trinkt Anna?", correct: "Wasser", options: ["Tee", "Kaffee", "Wasser", "Milch"], explanation: "Im Text steht: trinkt Wasser." },
      ]
    : [
        { q: "When does Anna get up?", correct: "early", options: ["late", "early", "never", "at night"], explanation: "The text says: Anna gets up early." },
        { q: "How does Anna go to school?", correct: "by bus", options: ["by train", "by bus", "on foot", "by taxi"], explanation: "The text says: she takes the bus to school." },
        { q: "What does Anna do in the afternoon?", correct: "homework", options: ["homework", "shopping", "sport", "cooking"], explanation: "The text says: she does her homework." },
        { q: "What does Anna review?", correct: "new words", options: ["old films", "new words", "phone numbers", "recipes"], explanation: "The text says: reviews new words." },
        { q: "What does Anna drink?", correct: "water", options: ["tea", "coffee", "water", "milk"], explanation: "The text says: drinks water." },
      ];
  const advancedQuestions = lang === "de"
    ? [
        { q: "Wovon hängt der Nutzen digitaler Lernwerkzeuge laut Text vor allem ab?", correct: "von didaktischer Struktur", options: ["von didaktischer Struktur", "vom Preis", "von der Farbe", "von der Länge der App"], explanation: "Der Text nennt klare Ziele, Rückmeldung und Progression als entscheidende Struktur." },
        { q: "Welche Aussage passt am besten zur Hauptidee?", correct: "Technik allein reicht nicht aus.", options: ["Technik allein reicht nicht aus.", "Apps ersetzen Unterricht immer.", "Feedback ist unwichtig.", "Einfache Tools sind nutzlos."], explanation: "Der Text sagt, dass ohne didaktische Planung auch moderne Plattformen oberflächlich bleiben." },
        { q: "Was bedeutet „oberflächlich“ hier?", correct: "ohne tiefere Lernwirkung", options: ["ohne tiefere Lernwirkung", "besonders schnell", "sehr günstig", "technisch perfekt"], explanation: "Oberflächlich bedeutet hier: ohne echte pädagogische Tiefe." },
        { q: "Was kann auch ein einfaches digitales Board leisten?", correct: "Lernprozesse sichtbar machen", options: ["Lernprozesse sichtbar machen", "alle Fehler vermeiden", "Lehrer ersetzen", "Prüfungen abschaffen"], explanation: "Im Text steht: ein Board kann Lernprozesse sichtbar machen." },
        { q: "Welche Bedingung wird nicht genannt?", correct: "automatische Ranglisten", options: ["klare Lernziele", "automatische Ranglisten", "sinnvolle Rückmeldung", "Progression"], explanation: "Automatische Ranglisten werden im Text nicht erwähnt." },
      ]
    : [
        { q: "According to the text, what do digital learning tools mainly need?", correct: "didactic structure", options: ["didactic structure", "a high price", "bright colours", "long menus"], explanation: "The text highlights goals, feedback and progression as key elements." },
        { q: "Which statement best matches the main idea?", correct: "Technology alone is not enough.", options: ["Technology alone is not enough.", "Apps always replace teachers.", "Feedback is irrelevant.", "Simple tools are useless."], explanation: "The text says modern platforms remain superficial without didactic planning." },
        { q: "What does “superficial” mean here?", correct: "lacking deeper learning value", options: ["lacking deeper learning value", "very fast", "very cheap", "technically perfect"], explanation: "Superficial means lacking meaningful educational depth." },
        { q: "What can even a simple digital board do?", correct: "make learning processes visible", options: ["make learning processes visible", "avoid all mistakes", "replace teachers", "cancel exams"], explanation: "The text says a board can make learning processes visible." },
        { q: "Which condition is not mentioned?", correct: "automatic leaderboards", options: ["clear goals", "automatic leaderboards", "meaningful feedback", "progression"], explanation: "Automatic leaderboards are not mentioned in the text." },
      ];
  const questions = levelIndex >= 4 ? advancedQuestions : easyQuestions;
  return { text, tasks: questions.map((item, index) => ({ ...item, options: deterministicShuffle(item.options, bonusNumber * 31 + index * 7 + levelIndex), type: "Чтение" })) };
}

function generateDialogBonus(studentName, level, bonusNumber, adminMode = false, languageOverride = null) {
  const lang = languageOverride || (adminMode && studentName === adminUsername ? "en" : getLearningLanguage(studentName));
  const levelIndex = Math.max(0, learningLevels.indexOf(level));
  const context = lang === "de" ? "Диалог: выберите подходящее слово или фразу." : "Dialogue: choose the suitable word or phrase.";
  const simple = lang === "de"
    ? [
        { q: "A: Hallo! Wie ___ du? B: Gut, danke.", correct: "geht es", options: ["kommst", "geht es", "trinkst", "kaufst"], explanation: "Правильно: Wie geht es dir?" },
        { q: "A: Hast du Zeit? B: Ja, ich habe ___.", correct: "Zeit", options: ["Wasser", "Zeit", "Buch", "Fenster"], explanation: "Man sagt: Ich habe Zeit." },
        { q: "A: Wo treffen wir uns? B: ___ dem Café.", correct: "Vor", options: ["Ohne", "Bis", "Vor", "Seit"], explanation: "Vor dem Café beschreibt den Treffpunkt." },
        { q: "A: Rufst du mich an? B: Ja, ich ___ dich an.", correct: "rufe", options: ["lese", "esse", "rufe", "schlafe"], explanation: "С ich используется: ich rufe an." },
        { q: "A: Bis später! B: ___.", correct: "Bis später", options: ["Guten Appetit", "Keine Milch", "Bis später", "Sehr alt"], explanation: "Подходящий ответ: Bis später." },
      ]
    : [
        { q: "A: Hi! How ___ you? B: I'm fine, thanks.", correct: "are", options: ["is", "are", "am", "be"], explanation: "Correct: How are you?" },
        { q: "A: Are you free? B: Yes, I have ___.", correct: "time", options: ["water", "time", "book", "window"], explanation: "We say: I have time." },
        { q: "A: Where shall we meet? B: ___ the café.", correct: "In front of", options: ["Without", "Since", "In front of", "During"], explanation: "In front of describes the meeting point." },
        { q: "A: Should I call you? B: Yes, please ___.", correct: "call me", options: ["eat me", "read me", "call me", "sleep me"], explanation: "Correct phrase: please call me." },
        { q: "A: See you later! B: ___.", correct: "See you later", options: ["Good appetite", "No milk", "See you later", "Very old"], explanation: "The matching reply is: See you later." },
      ];
  const advanced = lang === "de"
    ? [
        { q: "A: Der Plan klingt gut, ist aber kaum umsetzbar. B: Also ist er praktisch ___.", correct: "nicht tragfähig", options: ["nicht tragfähig", "beliebig", "lustig", "farbig"], explanation: "Nicht tragfähig bedeutet: praktisch nicht stabil oder realistisch." },
        { q: "A: Ich möchte die Entscheidung nicht ablehnen, nur genauer prüfen. B: Sie wünschen also eine ___ Bewertung.", correct: "differenzierte", options: ["differenzierte", "zufällige", "laute", "kurze"], explanation: "Differenziert bedeutet: mit mehreren Aspekten betrachtet." },
        { q: "A: Das Problem kommt sonst wieder. B: Dann brauchen wir eine ___ Lösung.", correct: "nachhaltige", options: ["nachhaltige", "dekorative", "kurze", "späte"], explanation: "Nachhaltig bedeutet hier: langfristig wirksam." },
        { q: "A: Die Formulierung klingt zu hart. B: Dann sollte ich sie ___.", correct: "abmildern", options: ["abmildern", "vergrößern", "bezahlen", "vergessen"], explanation: "Eine harte Formulierung kann man abmildern." },
        { q: "A: Das Argument braucht mehr Kontext. B: Es sollte stärker ___ werden.", correct: "kontextualisiert", options: ["kontextualisiert", "versteckt", "verkauft", "verschlafen"], explanation: "Kontextualisiert bedeutet: in einen größeren Zusammenhang gesetzt." },
      ]
    : [
        { q: "A: The plan sounds good, but it is hardly viable. B: So it is practically ___.", correct: "unworkable", options: ["unworkable", "colourful", "random", "funny"], explanation: "Unworkable means it cannot realistically be implemented." },
        { q: "A: I don't reject the decision; I want to examine it more carefully. B: You want a more ___ assessment.", correct: "nuanced", options: ["nuanced", "loud", "accidental", "short"], explanation: "Nuanced means considering complexity and different aspects." },
        { q: "A: Otherwise the problem will come back. B: Then we need a ___ solution.", correct: "sustainable", options: ["sustainable", "decorative", "late", "random"], explanation: "Sustainable means lasting and structurally sound." },
        { q: "A: The wording sounds too blunt. B: Then I should ___.", correct: "soften it", options: ["soften it", "enlarge it", "rent it", "forget it"], explanation: "If wording is too blunt, you soften it." },
        { q: "A: The argument needs more context. B: It should be more thoroughly ___.", correct: "contextualised", options: ["contextualised", "hidden", "sold", "overslept"], explanation: "Contextualised means placed into a broader context." },
      ];
  const tasks = levelIndex >= 4 ? advanced : simple;
  return { context, tasks: tasks.map((item, index) => ({ ...item, options: deterministicShuffle(item.options, bonusNumber * 41 + index * 9 + levelIndex), type: "Диалог" })) };
}

function completeBonus(studentName, type, level, bonusNumber, score, answerDetails = []) {
  const progress = getBonusProgress(studentName);
  const key = `${type}-${level}-${bonusNumber}`;
  const next = {
    ...progress,
    completed: { ...(progress.completed || {}), [key]: score >= 4 },
    scores: { ...(progress.scores || {}), [key]: score },
    answers: { ...(progress.answers || {}), [key]: answerDetails },
  };
  saveBonusProgress(studentName, next);
  return next;
}

function isBonusLevelCompleted(progress, type, level) {
  return Array.from({ length: bonusPerLevel }, (_, i) => i + 1).every((number) => Boolean(progress.completed?.[`${type}-${level}-${number}`]));
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

function getDailyQuiz(studentName, languageOverride = null) {
  const language = languageOverride || getStudentActiveLanguage(studentName);
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

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getTournament(monthKey = getMonthKey()) {
  return safeGet(`daily-word-tournament-${monthKey}`, { participants: {}, usedNames: {}, points: {} });
}

function saveTournament(data, monthKey = getMonthKey()) {
  safeSet(`daily-word-tournament-${monthKey}`, data);
}

function registerTournamentName(studentName, nickname) {
  const clean = nickname.trim();
  if (!clean) return { ok: false, message: "Введите имя для турнира." };
  const tournament = getTournament();
  const usedBy = tournament.usedNames?.[clean.toLowerCase()];
  if (usedBy && usedBy !== studentName) return { ok: false, message: "Это имя уже занято. Выберите другое." };
  const previous = tournament.participants?.[studentName];
  const next = {
    ...tournament,
    participants: { ...(tournament.participants || {}), [studentName]: clean },
    usedNames: { ...(tournament.usedNames || {}) },
    points: { ...(tournament.points || {}), [studentName]: tournament.points?.[studentName] || 0 },
  };
  if (previous) delete next.usedNames[previous.toLowerCase()];
  next.usedNames[clean.toLowerCase()] = studentName;
  saveTournament(next);
  return { ok: true, message: "Вы зарегистрированы в турнире." };
}

function addTournamentPoints(studentName, points) {
  const tournament = getTournament();
  if (!tournament.participants?.[studentName]) return;
  const today = getTodayKey();
  if (tournament.awardedDays?.[studentName]?.[today]) return;
  const next = {
    ...tournament,
    points: { ...(tournament.points || {}), [studentName]: (tournament.points?.[studentName] || 0) + points },
    awardedDays: {
      ...(tournament.awardedDays || {}),
      [studentName]: { ...(tournament.awardedDays?.[studentName] || {}), [today]: true },
    },
  };
  saveTournament(next);
}

const progressCategories = ["Vocabulary", "Grammar", "Speaking", "Listening"];
const progressCategoryLabels = {
  Vocabulary: "Словарный запас",
  Grammar: "Грамматика",
  Speaking: "Говорение",
  Listening: "Аудирование",
};
const progressLevelRanges = [
  ["A0", 0, 12],
  ["A1", 13, 25],
  ["A2", 26, 40],
  ["B1", 41, 55],
  ["B2", 56, 70],
  ["C1", 71, 84],
  ["C2", 85, 100],
];

function getProgressSettings(studentName) {
  return safeGet(`progress-settings-${studentName}`, {
    includeLearningMenu: false,
    teacherAssessment: { Vocabulary: 0, Grammar: 0, Speaking: 0, Listening: 0 },
  });
}

function getStudentContent(studentName) {
  return safeGet(`student-content-${studentName}`, {
    goal: "Короткая цель на ближайшие занятия будет добавлена здесь.",
    homework: "Будет добавлено после урока. Статус: ожидает обновления.",
    materials: "Здесь можно разместить индивидуальную ссылку на Miro.",
    revision: "Повторить слова дня и примеры из урока.",
    parentProgress: "Здесь можно фиксировать прогресс ученика: грамматика, лексика, чтение, говорение.",
    parentAttendance: "Информация о прошедших и запланированных уроках.",
    parentPayment: "Здесь можно добавить статус оплаты и выбранный формат занятий.",
    parentRecommendations: "Короткие рекомендации для поддержки обучения дома.",
  });
}

function saveStudentContent(studentName, content) {
  safeSet(`student-content-${studentName}`, content);
}

function saveProgressSettings(studentName, settings) {
  safeSet(`progress-settings-${studentName}`, settings);
}

function scoreToLevel(score) {
  const item = progressLevelRanges.find(([, min, max]) => score >= min && score <= max);
  return item ? item[0] : score > 100 ? "C2" : "A0";
}

function levelToScore(level) {
  const item = progressLevelRanges.find(([name]) => name === level);
  if (!item) return 0;
  const [, min, max] = item;
  return Math.round((min + max) / 2);
}

function levelIndex(level) {
  return progressLevelRanges.findIndex(([name]) => name === level);
}

function dailyVocabularyScore(studentName) {
  const stats = getWordStats(studentName);
  const level = stats.level || getStudentWordLevel(studentName) || "A0";
  return levelToScore(level);
}

function learningMenuScore(studentName) {
  const progress = getLearningProgress(studentName);
  const unlockedLevel = progress.unlockedLevel || "A0";
  return levelToScore(unlockedLevel);
}

function calculateCategoryScores(studentName) {
  const settings = getProgressSettings(studentName);
  const teacher = settings.teacherAssessment || {};
  const learning = settings.includeLearningMenu ? learningMenuScore(studentName) : null;
  return progressCategories.reduce((acc, category) => {
    const factors = [];
    if (category === "Vocabulary") factors.push(dailyVocabularyScore(studentName));
    factors.push(Number(teacher[category] || 0));
    if (settings.includeLearningMenu && learning !== null) factors.push(learning);
    acc[category] = Math.round(factors.reduce((sum, value) => sum + value, 0) / factors.length);
    return acc;
  }, {});
}

function calculateOverallProgress(studentName) {
  const scores = calculateCategoryScores(studentName);
  const overall = Math.round(progressCategories.reduce((sum, category) => sum + scores[category], 0) / progressCategories.length);
  return { scores, overall, level: scoreToLevel(overall) };
}

const liveCache = new Map();

function safeGet(key, fallback) {
  if (liveCache.has(key)) return liveCache.get(key);
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : fallback;
    liveCache.set(key, value);
    return value;
  } catch {
    liveCache.set(key, fallback);
    return fallback;
  }
}

function safeSet(key, value) {
  writeLocalCache(key, value);
  emitLiveUpdate(key, value);
  writeLiveValue(key, value).catch((error) => {
    console.warn(`Realtime-Speicherung für ${key} fehlgeschlagen. Lokal wurde gespeichert.`, error);
  });
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

function PublicInterestChat({ topic }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [text, setText] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threads, setThreads] = useRealtimeKey("public-interest-threads", []);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);
  const topicFlag = topic === "de" ? "🇩🇪" : topic === "en" ? "🇬🇧" : topic === "es" ? "🇪🇸" : "🌍";
  const activeThread = threads.find((thread) => thread.id === activeThreadId) || null;

  const saveThreads = (nextThreads) => {
    setThreads(nextThreads);
    safeSet("public-interest-threads", nextThreads);
  };

  const send = () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanText = text.trim();
    if (!cleanName || !cleanPhone || !cleanText) {
      setError("Пожалуйста, укажите имя, телефон и сообщение.");
      return;
    }
    setError("");
    const message = { author: cleanName, role: "lead", text: cleanText, time: new Date().toLocaleString("ru-RU") };
    let nextThreads;
    if (activeThread) {
      nextThreads = threads.map((thread) => thread.id === activeThread.id ? { ...thread, updatedAt: new Date().toISOString(), messages: [...(thread.messages || []), message] } : thread);
    } else {
      const id = `lead-${topic}-${Date.now()}`;
      const newThread = { id, topic, name: cleanName, phone: cleanPhone, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), messages: [message] };
      nextThreads = [...threads, newThread];
      setActiveThreadId(id);
    }
    saveThreads(nextThreads);
    publishLiveActivity(cleanName, "hat eine Anfrage geschrieben", { topic });
    setText("");
    setPopup(true);
    window.setTimeout(() => setPopup(false), 2200);
  };

  return (
    <Card className="p-6">
      {popup && <div className="fixed right-6 top-6 z-50 rounded-full bg-white p-4 text-4xl shadow-2xl ring-1 ring-slate-100 animate-bounce">{topicFlag}</div>}
      <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Внутренний чат сайта</div>
      <h2 className="text-3xl font-black">Есть вопрос? Напишите Anastasia</h2>
      <p className="mt-2 leading-7 text-slate-600">Можно написать без регистрации. Ваши сообщения видите только вы и Anastasia; сообщения других интересующихся не отображаются.</p>
      {activeThread && (
        <div className="mt-5 max-h-56 overflow-y-auto rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          {(activeThread.messages || []).map((msg, index) => (
            <div key={`${msg.time}-${index}`} className={`mb-3 max-w-[88%] rounded-2xl p-3 shadow-sm ${msg.role === "admin" ? "ml-auto bg-violet-100 text-violet-950" : "bg-white text-slate-700"}`}>
              <div className="text-xs font-black opacity-70">{msg.author} • {msg.time}</div>
              <div className="mt-1 font-semibold leading-6">{msg.text}</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-3 md:grid-cols-[0.7fr_0.8fr_1fr_auto]">
        <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Ваше имя" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Телефон" />
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Ваш вопрос или заявка" />
        <button onClick={send} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Отправить</button>
      </div>
      {error && <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-black text-red-700 ring-1 ring-red-100">{error}</div>}
    </Card>
  );
}

function LanguageInterestChatSection({ type }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PublicInterestChat topic={type} />
      </div>
    </section>
  );
}

function OtherLanguagesPage({ onHome }) {
  const featuredLanguages = [
    ["🇪🇸", "Испанский", "1000 ₽", "Популярный мировой язык для путешествий, культуры, учебы и общения. Есть материалы по произношению, базовой грамматике, текстам и упражнениям."],
    ["🇨🇳", "Китайский", "1000 ₽", "Старт с тонов, базовых фраз и иероглифов. Подходит для интереса к Азии, бизнесу и культуре."],
    ["🇫🇷", "Французский", "1000 ₽", "Язык культуры, путешествий и международной коммуникации. Материалы включают чтение, произношение и полезные выражения."],
    ["🇱🇺", "Люксембургский", "100 ₽", "Редкий язык Люксембурга. Короткий ознакомительный старт, базовая лексика и простые фразы."],
  ];

  const groupedLanguagesDetailed = [
    {
      title: "Популярные направления",
      items: [
        { flag: "🇰🇷", name: "Корейский", text: "Хангыль, бытовые фразы, культура и современные медиа." },
        { flag: "🇯🇵", name: "Японский", text: "Письменность, базовые диалоги, культура и путешествия." },
        { flag: "🇹🇷", name: "Турецкий", text: "Гармония гласных, простые фразы и темы для поездок." },
        { flag: "🇸🇦", name: "Арабский", text: "Алфавит, базовое чтение и полезные выражения." },
        { flag: "🇵🇹", name: "Португальский", text: "Бразилия, Португалия, путешествия и повседневная речь." },
        { flag: "🇮🇳", name: "Хинди", text: "Письменность, простые фразы и базовая лексика." },
        { flag: "🇮🇩", name: "Индонезийский", text: "Доступная грамматика и много бытовых диалогов." },
      ],
    },
    {
      title: "Языки, интересные русскоговорящим",
      items: [
        { flag: "🇵🇱", name: "Польский", text: "Славянская логика, чтение, падежи и полезная лексика." },
        { flag: "🇨🇿", name: "Чешский", text: "Центральная Европа, учеба, путешествия и базовая грамматика." },
        { flag: "🇷🇸", name: "Сербский", text: "Кириллица и латиница, простые диалоги и славянская лексика." },
        { flag: "🇬🇪", name: "Грузинский", text: "Собственная письменность, звучание и стартовая лексика." },
        { flag: "🇦🇲", name: "Армянский", text: "Алфавит, культура и базовые фразы для мягкого старта." },
        { flag: "🇦🇿", name: "Азербайджанский", text: "Тюркская структура, произношение и бытовые темы." },
      ],
    },
    {
      title: "Европейские языки",
      items: [
        { flag: "🇮🇹", name: "Итальянский", text: "Музыкальное произношение, путешествия и простые времена." },
        { flag: "🇳🇱", name: "Нидерландский", text: "Европа, учеба, базовые конструкции и произношение." },
        { flag: "🇸🇪", name: "Шведский", text: "Скандинавская культура, повседневная лексика и чтение." },
        { flag: "🇳🇴", name: "Норвежский", text: "Диалоги, базовая грамматика и темы для путешествий." },
        { flag: "🇩🇰", name: "Датский", text: "Базовые фразы и особый фокус на произношении." },
        { flag: "🇫🇮", name: "Финский", text: "Необычная грамматика, случаи и простые тексты." },
        { flag: "🇬🇷", name: "Греческий", text: "Алфавит, чтение, история и полезные фразы." },
        { flag: "🇱🇺", name: "Люксембургский", text: "Редкий язык Люксембурга. Короткий ознакомительный старт." },
      ],
    },
    {
      title: "Другие направления",
      items: [
        { flag: "🇻🇳", name: "Вьетнамский", text: "Тональный язык, произношение и простые диалоги." },
        { flag: "🇹🇭", name: "Тайский", text: "Тоны, письмо и выражения для путешествий." },
        { flag: "🇮🇷", name: "Персидский", text: "Письмо, произношение и культурная лексика." },
        { flag: "🇮🇱", name: "Иврит", text: "Письменность, современная речь и полезные выражения." },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7fbff] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <BackgroundBlobs />
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Испанский и дополнительные языки</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Красивый старт в новый язык — без онлайн-уроков</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">На этой странице собраны материалы для самостоятельного изучения испанского и других языков, кроме немецкого и английского. Вы получаете тексты, упражнения, лексику, грамматику и мини-задания.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onHome} className="rounded-2xl bg-white px-5 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
              <a href="#other-chat" className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white shadow-lg">Задать вопрос</a>
            </div>
          </div>
          <Card className="bg-gradient-to-br from-yellow-100 via-white to-cyan-100 p-6">
            <h2 className="text-2xl font-black">Что входит?</h2>
            <div className="mt-5 grid gap-3">
              {["произношение", "лексика по темам", "короткие тексты", "грамматика", "карточки слов", "мини-тесты"].map((item) => <div key={item} className="rounded-2xl bg-white/80 px-4 py-3 font-black text-slate-700 shadow-sm">✓ {item}</div>)}
            </div>
            <div className="mt-5 rounded-2xl bg-orange-100 p-4 font-black text-orange-900 ring-1 ring-orange-200">Важно: онлайн-уроков по этим языкам нет.</div>
          </Card>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {featuredLanguages.map(([flag, language, price, description]) => (
            <Card key={language} className="p-6">
              <div className="text-5xl">{flag}</div>
              <h3 className="mt-4 text-2xl font-black">{language}</h3>
              <div className="mt-3 inline-flex rounded-2xl bg-slate-950 px-4 py-2 font-black text-white">{price}</div>
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6">
          <Card className="p-6">
            <h2 className="text-3xl font-black">Все дополнительные языки</h2>
            <p className="mt-2 leading-7 text-slate-600">
              Ниже представлены языки с кратким описанием. Каждому языку выделена отдельная карточка с флагом, чтобы ориентироваться было проще и приятнее.
            </p>
            <div className="mt-8 grid gap-8">
              {groupedLanguagesDetailed.map((group) => (
                <div key={group.title} className="rounded-[1.75rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                  <h3 className="text-2xl font-black text-slate-950">{group.title}</h3>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {group.items.map((language) => (
                      <div key={language.name} className="h-full min-w-0 overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="grid min-w-0 gap-4 sm:grid-cols-[3.5rem_1fr]">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-3xl ring-1 ring-cyan-100">
                            {language.flag}
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <h4 className="break-words text-xl font-black leading-tight text-slate-950">{language.name}</h4>
                            <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-600">{language.text}</p>
                          </div>
                        </div>
                        <div className="mt-4 inline-flex max-w-full rounded-2xl bg-yellow-50 px-3 py-2 text-sm font-black leading-5 text-orange-900 ring-1 ring-yellow-100">
                          Материалы для самостоятельного изучения
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-3xl font-black">Стоимость</h2>
              <div className="mt-6 grid gap-4">
                {[["Китайский, испанский, французский", "1000 ₽"], ["Люксембургский", "100 ₽"], ["Все остальные языки", "500 ₽"]].map(([name, price]) => (
                  <div key={name} className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 p-5 ring-1 ring-slate-100"><div className="font-black text-slate-900">{name}</div><div className="mt-2 text-3xl font-black text-cyan-800">{price}</div><p className="mt-1 text-sm font-semibold text-slate-500">разовый доступ к материалам</p></div>
                ))}
              </div>
            </Card>
            <div id="other-chat"><PublicInterestChat topic="other" /></div>
          </div>
        </div>
      </div>
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

function PublicMessagesAdmin() {
  const [threads, setThreads] = useRealtimeKey("public-interest-threads", []);
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const selectedThread = threads.find((thread) => thread.id === selectedId) || threads[0] || null;

  const topicLabel = (topic) => topic === "en" ? ["🇬🇧", "Английский"] : topic === "de" ? ["🇩🇪", "Немецкий"] : ["🌍", "Другие языки"];

  const refreshThreads = (nextThreads) => {
    setThreads(nextThreads);
    safeSet("public-interest-threads", nextThreads);
  };

  const sendReply = () => {
    const clean = replyText.trim();
    if (!clean || !selectedThread) return;
    const nextThreads = threads.map((thread) => thread.id === selectedThread.id ? {
      ...thread,
      updatedAt: new Date().toISOString(),
      messages: [
        ...(thread.messages || []),
        { author: "Anastasia", role: "admin", text: clean, time: new Date().toLocaleString("ru-RU") },
      ],
    } : thread);
    refreshThreads(nextThreads);
    publishLiveActivity("Anastasia", "antwortet auf eine Anfrage", { threadId: selectedThread.id });
    setReplyText("");
  };

  const sortedThreads = [...threads].sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt)));

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-6">
        <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Сообщения интересующихся</div>
        <h2 className="text-3xl font-black">Чаты с потенциальными учениками</h2>
        <p className="mt-2 leading-7 text-slate-600">Список похож на Telegram/WhatsApp: имя, телефон, направление и начало последнего сообщения.</p>
        <div className="mt-6 grid gap-3">
          {sortedThreads.length ? sortedThreads.map((thread) => {
            const [flag, label] = topicLabel(thread.topic);
            const last = (thread.messages || [])[thread.messages.length - 1];
            return (
              <button key={thread.id} onClick={() => setSelectedId(thread.id)} className={`rounded-3xl p-4 text-left ring-1 transition ${selectedThread?.id === thread.id ? "bg-slate-950 text-white ring-slate-950" : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-black">{flag} {thread.name}</div>
                  <div className={`text-xs font-black ${selectedThread?.id === thread.id ? "text-white/60" : "text-slate-400"}`}>{label}</div>
                </div>
                <div className={`mt-1 text-xs font-bold ${selectedThread?.id === thread.id ? "text-white/60" : "text-slate-500"}`}>☎ {thread.phone}</div>
                <div className={`mt-2 truncate text-sm font-semibold ${selectedThread?.id === thread.id ? "text-white/80" : "text-slate-600"}`}>{last?.text || "Нет сообщений"}</div>
              </button>
            );
          }) : <div className="rounded-3xl bg-slate-50 p-6 font-bold text-slate-600 ring-1 ring-slate-100">Пока нет сообщений от потенциальных учеников.</div>}
        </div>
      </Card>

      <Card className="p-6">
        {selectedThread ? (
          <>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">{topicLabel(selectedThread.topic)[0]} {topicLabel(selectedThread.topic)[1]}</div>
                <h2 className="mt-3 text-3xl font-black">{selectedThread.name}</h2>
                <p className="mt-1 font-bold text-slate-500">Телефон: {selectedThread.phone}</p>
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto rounded-[1.75rem] bg-slate-50 p-4 ring-1 ring-slate-100">
              {(selectedThread.messages || []).map((msg, index) => (
                <div key={`${msg.time}-${index}`} className={`mb-3 max-w-[86%] rounded-3xl p-4 shadow-sm ${msg.role === "admin" ? "ml-auto bg-violet-100 text-violet-950" : "bg-white text-slate-700"}`}>
                  <div className="text-xs font-black opacity-60">{msg.author} • {msg.time}</div>
                  <div className="mt-1 font-semibold leading-6">{msg.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Ответ Anastasia..." />
              <button onClick={sendReply} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Ответить</button>
            </div>
          </>
        ) : (
          <div className="rounded-3xl bg-slate-50 p-8 text-center font-bold text-slate-500 ring-1 ring-slate-100">Выберите чат слева.</div>
        )}
      </Card>
    </div>
  );
}

function StudentPortal({ onBack, onOpenLanguage }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [student, setStudent] = useState(null);
  const [view, setView] = useState("dashboard");
  const [error, setError] = useState("");
  const [quizState, setQuizState] = useState(null);
  const [languageVersion, setLanguageVersion] = useState(0);

  const quiz = student && student !== adminUsername ? getDailyQuiz(student) : null;
  const [liveTotalPoints] = useRealtimeKey(student ? `points-${student}` : "points-empty", 0);
  const totalPoints = student ? liveTotalPoints : 0;
  const isAdmin = student === adminUsername;
  const language = student && (isAdmin ? "Admin" : getStudentLanguageLabel(student));
  const activeLanguage = student && !isAdmin ? getActiveLanguageLabel(student) : null;

  useEffect(() => {
    if (!student || isAdmin || !quiz) return undefined;
    publishLiveActivity(student, "ist online", { area: "Portal" });
    return subscribeLiveKey(`daily-word-${quiz.id}`, { answered: false, correct: false, points: 0, selected: null }, setQuizState);
  }, [student, isAdmin, quiz?.id, languageVersion]);

  const handleLanguageChange = () => {
    if (!student || isAdmin) return;
    const nextQuiz = getDailyQuiz(student);
    setQuizState(safeGet(`daily-word-${nextQuiz.id}`, { answered: false, correct: false, points: 0, selected: null }));
    setLanguageVersion((value) => value + 1);
  };

  const login = () => {
    const cleanName = name.trim();
    if (accounts[cleanName] && accounts[cleanName] === password) {
      setStudent(cleanName);
      setView(cleanName === adminUsername ? "admin" : "dashboard");
      if (cleanName !== adminUsername) publishLiveActivity(cleanName, "hat sich eingeloggt", { area: "Portal" });
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
    if (correct) {
      safeSet(`points-${student}`, totalPoints + 10);
      addTournamentPoints(student, 10);
    }
    setQuizState(nextState);
    publishLiveActivity(student, correct ? "hat das Wort des Tages richtig gelöst" : "hat das Wort des Tages beantwortet", { selected: option, correct });
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
            <div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">Вы вошли как: {student} • {language}{getStudentLanguages(student).length > 1 ? ` • сейчас: ${activeLanguage}` : ""}</div>
            <h1 className="mt-3 text-4xl font-black text-slate-950">Личный кабинет</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onBack} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← На главную</button>
            <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
          </div>
        </div>

        <LiveActivityPanel currentUser={student} />

        <div className="mb-6 grid gap-3 md:grid-cols-7">
          {[
            ["dashboard", "Обзор", "home"],
            ["student", "Для ученика", "user"],
            ["parents", "Для родителей", "parent"],
            ["schedule", "Учебный план", "calendar"],
            ["learning", "Учебное меню", "book"],
            ["progress", "Прогресс", "chart"],
            ["languages", "Другие языки", "globe"],
          ].map(([id, label, icon]) => (
            <button key={id} onClick={() => setView(id)} className={`rounded-2xl p-4 text-left font-black shadow-sm ring-1 transition ${view === id ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}><Icon name={icon} /> {label}</button>
          ))}
        </div>

        {getStudentLanguages(student).length > 1 && (
          <div className="mb-6">
            <LanguageSwitcher student={student} onChange={handleLanguageChange} />
          </div>
        )}

        {view === "dashboard" && <StudentDashboard student={student} quiz={quiz} quizState={quizState} totalPoints={totalPoints} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "student" && <StudentInfo student={student} quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />}
        {view === "parents" && <ParentsInfo student={student} />}
        {view === "schedule" && <StudentSchedule student={student} />}
        {view === "learning" && <LearningMenu student={student} />}
        {view === "languages" && <LanguageRecommendation student={student} onOpenLanguage={onOpenLanguage} />}
        {view === "progress" && <ProgressInfo student={student} totalPoints={totalPoints} />}
      </div>
    </div>
  );
}

function AdminPortal({ onBack, logout }) {
  const [adminView, setAdminView] = useState("overview");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProfileTab, setStudentProfileTab] = useState("overview");
  const [adminLanguageMode, setAdminLanguageMode] = useState("active");
  const [attendance, setAttendance] = useRealtimeKey("attendance-records", {});

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
    const adminStudentLanguages = getStudentLanguages(selectedStudent);
    const languagesToShow = adminLanguageMode === "all" ? adminStudentLanguages : [getStudentActiveLanguage(selectedStudent)];
    const adminProfileTabs = [
      ["overview", "Обзор"],
      ["student", "Для ученика"],
      ["parents", "Для родителей"],
      ["schedule", "План"],
      ["progress", "Прогресс"],
      ["learning", "Учебное меню"],
      ["chats", "Чаты"],
    ];
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
              <button onClick={() => { setSelectedStudent(null); setStudentProfileTab("overview"); setAdminLanguageMode("active"); }} className="rounded-2xl bg-white px-4 py-3 font-black text-slate-700 shadow-sm ring-1 ring-slate-100">← К админ-панели</button>
              <button onClick={logout} className="rounded-2xl bg-slate-950 px-4 py-3 font-black text-white shadow-sm">Выйти</button>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card className="p-5"><div className="text-2xl">📅</div><div className="mt-2 text-sm font-bold text-slate-500">Занятий в неделю</div><div className="text-3xl font-black">{stats.total}</div></Card>
            <Card className="p-5"><div className="text-2xl">✅</div><div className="mt-2 text-sm font-bold text-slate-500">Пришёл</div><div className="text-3xl font-black">{stats.came}</div></Card>
            <Card className="p-5"><div className="text-2xl">↔️</div><div className="mt-2 text-sm font-bold text-slate-500">Перенос</div><div className="text-3xl font-black">{stats.moved}</div></Card>
            <Card className="p-5"><div className="text-2xl">❌</div><div className="mt-2 text-sm font-bold text-slate-500">Не пришёл</div><div className="text-3xl font-black">{stats.missed}</div></Card>
          </div>

          <div className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {adminProfileTabs.map(([id, label]) => (
                  <button key={id} onClick={() => setStudentProfileTab(id)} className={`rounded-2xl px-4 py-3 text-sm font-black ring-1 transition ${studentProfileTab === id ? "bg-slate-950 text-white ring-slate-950" : "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{label}</button>
                ))}
              </div>
            </div>

            <div className="mb-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Языки ученика</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">Доступно: {adminStudentLanguages.map((lang) => languageLabels[lang] || lang).join(" • ")}</p>
                </div>
                <button onClick={() => setAdminLanguageMode(adminLanguageMode === "all" ? "active" : "all")} className={`rounded-2xl px-5 py-3 font-black shadow-sm ring-1 transition ${adminLanguageMode === "all" ? "bg-violet-100 text-violet-900 ring-violet-200" : "bg-white text-slate-700 ring-slate-100"}`}>
                  {adminLanguageMode === "all" ? "Показаны все языки" : "Показать все языки ученика"}
                </button>
              </div>
            </div>

            {studentProfileTab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <StudentDashboard student={selectedStudent} quiz={quiz} quizState={quizState} totalPoints={totalPoints} answerWeeklyQuiz={() => {}} />
                <div className="grid gap-4">
                  {languagesToShow.map((lang) => {
                    const langQuiz = getDailyQuiz(selectedStudent, lang);
                    const langState = safeGet(`daily-word-${langQuiz.id}`, { answered: false, correct: false, points: 0, selected: null });
                    return (
                      <div key={lang} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                        <div className="mb-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">{languageLabels[lang] || lang}</div>
                        <h3 className="text-2xl font-black">Слово дня: {langQuiz.word}</h3>
                        <p className="mt-2 font-bold text-slate-600">Правильный ответ: {langQuiz.answer}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">Статус: {langState.answered ? (langState.correct ? "ответ правильный" : "ответ неправильный") : "ещё не отвечено"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {studentProfileTab === "student" && (
              <div className="grid gap-6">
                {languagesToShow.map((lang) => {
                  const langQuiz = getDailyQuiz(selectedStudent, lang);
                  const langState = safeGet(`daily-word-${langQuiz.id}`, { answered: false, correct: false, points: 0, selected: null });
                  return <StudentInfo key={lang} student={selectedStudent} quiz={langQuiz} quizState={langState} answerWeeklyQuiz={() => {}} adminMode />;
                })}
              </div>
            )}

            {studentProfileTab === "parents" && <ParentsInfo student={selectedStudent} adminMode />}
            {studentProfileTab === "schedule" && <StudentSchedule student={selectedStudent} />}
            {studentProfileTab === "progress" && <ProgressInfo student={selectedStudent} totalPoints={totalPoints} adminMode />}
            {studentProfileTab === "learning" && (
              <div className="grid gap-6">
                {languagesToShow.map((lang) => (
                  <div key={lang} className="rounded-[2rem] bg-slate-50 p-4 ring-1 ring-slate-100">
                    <div className="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Учебное меню • {languageLabels[lang] || lang}</div>
                    <LearningMenu student={selectedStudent} adminMode languageOverride={lang} />
                  </div>
                ))}
              </div>
            )}
            {studentProfileTab === "chats" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <ChatWindow student={selectedStudent} channel="student" adminMode />
                <ChatWindow student={selectedStudent} channel="parent" adminMode />
              </div>
            )}
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

        <LiveActivityPanel currentUser="Anastasia" />

        <div className="mb-6 grid gap-3 md:grid-cols-6">
          {[["overview", "Ученики", "👥"], ["calendar", "Календарь посещаемости", "📅"], ["revenue", "Доход", "₽"], ["learning", "Учебные меню", "📚"], ["leads", "Сообщения интересующихся", "💬"], ["stats", "Статистика", "📊"]].map(([id, label, icon]) => (
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
                  const lang = getStudentLanguageLabel(name);
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

        {adminView === "leads" && <PublicMessagesAdmin />}

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

function getLearningLesson(lang, level, puzzleNumber) {
  const languageName = lang === "es" ? "испанского" : lang === "de" ? "немецкого" : "английского";
  const lessonBlock = Math.ceil(puzzleNumber / 10);
  const blockIndex = Math.min(3, Math.floor((puzzleNumber - 1) / 25));
  const lessons = {
    en: {
      pronunciation: [
        "Следите за ударением: в английском оно часто отличается от русского.",
        "Короткие и длинные гласные могут менять смысл: ship / sheep.",
        "В живой речи слова соединяются, поэтому важно тренировать фразы целиком.",
        "На высоких уровнях важны rhythm, sentence stress и естественная интонация.",
      ],
      vocabulary: [
        "Учите слово вместе с примером, а не отдельно.",
        "Группируйте слова по ситуациям: школа, дом, поездка, работа.",
        "С B1 важно учить устойчивые сочетания: make a decision, take a break.",
        "С C1–C2 обращайте внимание на оттенки значений: feasible, plausible, coherent.",
      ],
      grammar: [
        "База: порядок слов subject + verb + object.",
        "Тренируйте времена через реальные маркеры: now, yesterday, already, since, if.",
        "С B1 добавляются passive voice, conditionals и reported speech.",
        "С C1–C2 важны инверсия, сложные связки и точность формулировок.",
      ],
    },
    de: {
      pronunciation: [
        "В немецком важно чётко произносить окончания: -e, -en, -er.",
        "Следите за долгими и краткими гласными: Staat / Stadt.",
        "Обращайте внимание на ударение в сложных словах.",
        "На высоких уровнях тренируйте длинные слова и плавную интонацию фразы.",
      ],
      vocabulary: [
        "Учите существительные сразу с артиклем: der Tisch, die Tasche, das Buch.",
        "Группируйте слова по темам: Alltag, Schule, Reisen, Arbeit.",
        "С B1 учите устойчивые сочетания: einen Termin vereinbaren.",
        "С C1–C2 важны точные различия: machbar, tragfähig, nachhaltig.",
      ],
      grammar: [
        "База: артикли, род, падежи и порядок слов.",
        "В придаточных предложениях глагол часто стоит в конце.",
        "С B1 добавляются Passiv, Konjunktiv II и сложные Nebensätze.",
        "С C1–C2 важно строить длинные, но ясные предложения.",
      ],
    },
    es: {
      pronunciation: [
        "Испанское произношение довольно регулярное: слово часто читается так, как написано.",
        "Буква h обычно не произносится: hola звучит как ola.",
        "Ñ — отдельный звук, похожий на русское нь: español, mañana.",
        "Следите за ударением и акцентами: café, teléfono, difícil.",
      ],
      vocabulary: [
        "Учите слова сразу с артиклем: el libro, la casa, una pregunta.",
        "Собирайте лексику по ситуациям: casa, escuela, viaje, comida, tienda.",
        "С B1 учите частые фразы: tengo que, me gustaría, depende de.",
        "С C1–C2 важны оттенки: viable, sostenible, coherente, enrevesado.",
      ],
      grammar: [
        "База: ser/estar. Ser — более постоянные признаки, estar — состояние и место.",
        "Следите за родом и числом: el libro rojo, la casa roja, los libros rojos.",
        "Глаголы меняются по лицам: yo hablo, tú hablas, él habla, nosotros hablamos.",
        "С B2–C2 добавляются subjuntivo, условные конструкции и точные связки мыслей.",
      ],
    },
  };
  const selected = lessons[lang] || lessons.en;
  const levelIndexValue = Math.max(0, learningLevels.indexOf(level));
  const difficultyNote = levelIndexValue <= 1
    ? "Фокус этой серии — база и уверенность без перегруза."
    : levelIndexValue <= 3
      ? "Фокус этой серии — применение языка в реальных ситуациях."
      : levelIndexValue <= 4
        ? "Фокус этой серии — более точные формулировки и связность речи."
        : "Фокус этой серии — нюансы, аргументация и высокая точность.";
  return {
    title: `Мини-урок перед заданием ${puzzleNumber}: ${level} • ${languageName}`,
    subtitle: `Блок ${lessonBlock}/10 внутри уровня. ${difficultyNote}`,
    pronunciation: selected.pronunciation[blockIndex],
    vocabulary: selected.vocabulary[blockIndex],
    grammar: selected.grammar[blockIndex],
  };
}

function LearningMenu({ student, adminMode = false, languageOverride = null }) {
  const [access, setAccess] = useState(adminMode || student === adminUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useRealtimeKey(`learning-progress-${student}`, { unlockedLevel: "A0", completed: {}, scores: {}, answers: {} });
  const [selectedLevel, setSelectedLevel] = useState("A0");
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [adminLearningLanguage, setAdminLearningLanguage] = useState("en");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [selectedMode, setSelectedMode] = useState("normal");
  const [selectedBonusType, setSelectedBonusType] = useState("reading");
  const [bonusProgress, setBonusProgress] = useRealtimeKey(`bonus-progress-${student}`, { completed: {}, scores: {}, answers: {} });

  const [learningLanguageVersion, setLearningLanguageVersion] = useState(0);
  const activeLearningLanguage = languageOverride || (adminMode && student === adminUsername ? adminLearningLanguage : getLearningLanguage(student));

  const handleLearningLanguageChange = () => {
    setSelectedPuzzle(null);
    setAnswers({});
    setSubmitted(false);
    setRevealedAnswers({});
    setLearningLanguageVersion((value) => value + 1);
  };

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
    publishLiveActivity(student, `öffnet Aufgabe ${level}-${puzzleNumber}`, { level, puzzleNumber, mode: "normal" });
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
    publishLiveActivity(student, `öffnet Bonus ${type} ${level}-${bonusNumber}`, { level, bonusNumber, mode: type });
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
  const lesson = selectedPuzzle ? getLearningLesson(activeLearningLanguage, selectedLevel, selectedPuzzle) : null;
  const resultKey = selectedPuzzle ? (selectedMode === "normal" ? `${selectedLevel}-${selectedPuzzle}` : `${selectedBonusType}-${selectedLevel}-${selectedPuzzle}`) : null;
  const storedAnswers = resultKey ? (selectedMode === "normal" ? progress.answers?.[resultKey] : bonusProgress.answers?.[resultKey]) : null;

  const finishPuzzle = () => {
    const answerDetails = tasks.map((task, index) => ({
      number: index + 1,
      type: task.type,
      question: task.q,
      selected: answers[index] || "Не отвечено",
      correctAnswer: task.correct,
      isCorrect: answers[index] === task.correct,
      explanation: task.explanation,
    }));
    setSubmitted(true);
    publishLiveActivity(student, `hat ${selectedMode === "normal" ? "eine Aufgabe" : "einen Bonus"} abgegeben: ${score}/${maxScore}`, { selectedLevel, selectedPuzzle, selectedMode, score });
    if (student === adminUsername) return;
    if (selectedMode === "normal") {
      const next = completeLearningPuzzle(student, selectedLevel, selectedPuzzle, score, answerDetails);
      setProgress(next);
    }
    if (selectedMode === "bonus") {
      const nextBonus = completeBonus(student, selectedBonusType, selectedLevel, selectedPuzzle, score, answerDetails);
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

        {selectedMode === "normal" && lesson && (
          <div className="mb-6 rounded-[1.75rem] bg-gradient-to-br from-cyan-50 to-violet-50 p-5 ring-1 ring-cyan-100">
            <div className="mb-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">📘 Урок перед заданием</div>
            <h3 className="text-2xl font-black text-slate-950">{lesson.title}</h3>
            <p className="mt-2 leading-7 text-slate-600">{lesson.subtitle}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100"><h4 className="font-black text-slate-950">🔊 Произношение</h4><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{lesson.pronunciation}</p></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100"><h4 className="font-black text-slate-950">📚 Вокабуляр</h4><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{lesson.vocabulary}</p></div>
              <div className="rounded-3xl bg-white p-4 ring-1 ring-slate-100"><h4 className="font-black text-slate-950">🧩 Грамматика</h4><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{lesson.grammar}</p></div>
            </div>
          </div>
        )}

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
            const stored = storedAnswers?.[index];
            return (
              <div key={`${task.q}-${index}`} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
                <div className="mb-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-violet-800 shadow-sm">{index + 1}. {task.type}</div>
                <h3 className="text-lg font-black leading-7 text-slate-950">{task.q}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {task.options.map((option) => (
                    <button key={option} disabled={submitted} onClick={() => { setAnswers({ ...answers, [index]: option }); publishLiveActivity(student, `bearbeitet Aufgabe ${selectedLevel}-${selectedPuzzle}`, { question: index + 1, selectedMode }); }} className={`rounded-2xl p-3 text-left font-bold ring-1 transition ${correct && option === selected ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : wrong && option === selected ? "bg-red-50 text-red-700 ring-red-200" : submitted && option === task.correct ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : selected === option ? "bg-cyan-50 text-cyan-800 ring-cyan-200" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{option}</button>
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
                {adminMode && stored && (
                  <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ring-1 ${stored.isCorrect ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"}`}>
                    Ответ ученика: {stored.selected} • {stored.isCorrect ? "правильно" : `неправильно, правильный ответ: ${stored.correctAnswer}`}<br />
                    Объяснение: {stored.explanation}
                  </div>
                )}
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

      {getStudentLanguages(student).length > 1 && !adminMode && student !== adminUsername && (
        <div className="mb-6">
          <LanguageSwitcher student={student} onChange={handleLearningLanguageChange} />
        </div>
      )}

      {adminMode && student === adminUsername && (
        <div className="mb-6 rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="mb-3 text-sm font-black text-slate-600">Язык учебного меню Anastasia</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => { setAdminLearningLanguage("en"); setSelectedPuzzle(null); }} className={`rounded-2xl px-4 py-3 font-black ring-1 ${adminLearningLanguage === "en" ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100"}`}>Английские уровни A0–C2</button>
            <button onClick={() => { setAdminLearningLanguage("de"); setSelectedPuzzle(null); }} className={`rounded-2xl px-4 py-3 font-black ring-1 ${adminLearningLanguage === "de" ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100"}`}>Немецкие уровни A0–C2</button>
          </div>
        </div>
      )}

      {activeLearningLanguage === "es" && (
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-orange-50 p-5 ring-1 ring-orange-100">
            <h3 className="text-xl font-black text-orange-900">Произношение в испанском</h3>
            <p className="mt-2 leading-7 text-orange-800">В испанском большинство слов читается достаточно регулярно. Важно тренировать гласные a, e, i, o, u, звук ñ, мягкое ll/y и ударение. Буква h обычно не произносится.</p>
          </div>
          <div className="rounded-3xl bg-cyan-50 p-5 ring-1 ring-cyan-100">
            <h3 className="text-xl font-black text-cyan-900">Грамматика в испанском</h3>
            <p className="mt-2 leading-7 text-cyan-800">Особое внимание уделяется ser/estar, родам существительных, артиклям el/la, спряжению глаголов и базовым временам Presente, Pretérito Perfecto и Futuro.</p>
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
          const completedLevel = selectedMode === "normal" ? isLearningLevelCompleted(progress, level) : isBonusLevelCompleted(bonusProgress, selectedBonusType, level);
          const levelLabel = adminMode || student === adminUsername ? `${completedLevel ? "🏆" : "🔒"} ${level}` : `${unlocked ? "" : "🔒 "}${level}`;
          return <button key={level} onClick={() => setSelectedLevel(level)} disabled={!unlocked} className={`rounded-2xl px-4 py-3 font-black ring-1 transition ${selectedLevel === level ? "bg-slate-950 text-white ring-slate-950" : unlocked ? "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50" : "bg-slate-100 text-slate-400 ring-slate-100"}`}>{levelLabel}</button>;
        })}
      </div>

      {selectedMode === "normal" ? (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-20">
          {Array.from({ length: puzzlesPerLevel }, (_, i) => i + 1).map((number) => {
            const key = `${selectedLevel}-${number}`;
            const unlocked = isLearningPuzzleUnlocked(student, selectedLevel, number, adminMode || student === adminUsername);
            const completed = Boolean(progress.completed?.[key]);
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
              const completed = Boolean(bonusProgress.completed?.[key]);
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
            <motion.div variants={fadeUp} className="mt-6 rounded-3xl bg-yellow-50 p-5 font-bold text-orange-800 ring-1 ring-yellow-100"><Icon name="shield" /> Live-Version: Fortschritt und Chats können über Firebase Firestore synchronisiert werden. Für echte Zugriffskontrolle sollten die Passwörter zusätzlich durch Firebase Authentication ersetzt werden.</motion.div>
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

function LanguageSwitcher({ student, onChange }) {
  const languages = getStudentLanguages(student);
  const [language, setLanguage] = useRealtimeKey(`active-language-${student}`, getStudentActiveLanguage(student));
  if (languages.length <= 1) return null;

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    saveStudentActiveLanguage(student, nextLanguage);
    publishLiveActivity(student, `wechselt Sprache zu ${languageLabels[nextLanguage] || nextLanguage}`, { language: nextLanguage });
    if (onChange) onChange(nextLanguage);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Выбор языка • сейчас: {languageLabels[language] || language}</div>
      <h2 className="text-2xl font-black">Выберите язык для заданий</h2>
      <p className="mt-2 leading-7 text-slate-600">Слово дня и учебное меню открываются на выбранном языке. В турнире Daily Word баллы начисляются только один раз в день, даже если вы отвечаете на нескольких языках.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {languages.map((lang) => (
          <button key={lang} onClick={() => changeLanguage(lang)} className={`rounded-2xl px-5 py-4 font-black ring-1 transition ${language === lang ? "bg-slate-950 text-white ring-slate-950" : "bg-white text-slate-700 ring-slate-100 hover:bg-cyan-50"}`}>{languageLabels[lang] || lang}</button>
        ))}
      </div>
    </Card>
  );
}

function TournamentWidget({ student, adminMode = false }) {
  const [tournament, setTournament] = useRealtimeKey(`daily-word-tournament-${getMonthKey()}`, { participants: {}, usedNames: {}, points: {} });
  const [nickname, setNickname] = useState(tournament.participants?.[student] || "");
  const [message, setMessage] = useState("");
  const monthKey = getMonthKey();
  const leaderboard = Object.entries(tournament.participants || {})
    .map(([studentName, name]) => ({ studentName, name, points: tournament.points?.[studentName] || 0 }))
    .sort((a, b) => b.points - a.points);

  const register = () => {
    const result = registerTournamentName(student, nickname);
    setMessage(result.message);
    setTournament(getTournament());
  };

  return (
    <Card className="p-6">
      <div className="mb-4 inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-orange-800">Ежемесячный турнир Daily Word • {monthKey}</div>
      <h2 className="text-3xl font-black">Турнир слов дня</h2>
      <p className="mt-2 leading-7 text-slate-600">Ученики могут участвовать независимо от языка. За правильный ответ в Daily Word начисляется 10 турнирных баллов, но только один раз в день.</p>
      {!adminMode && (
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Ваш уникальный турнирный ник" />
          <button onClick={register} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Участвовать</button>
        </div>
      )}
      {message && <div className="mt-3 rounded-2xl bg-cyan-50 p-3 text-sm font-black text-cyan-800 ring-1 ring-cyan-100">{message}</div>}
      <div className="mt-6 grid gap-3">
        {leaderboard.length ? leaderboard.map((item, index) => (
          <div key={item.studentName} className={`flex items-center justify-between rounded-2xl p-4 font-black ring-1 ${item.studentName === student ? "bg-yellow-50 text-orange-900 ring-yellow-200" : "bg-slate-50 text-slate-700 ring-slate-100"}`}>
            <span>{index + 1}. {item.name}</span>
            <span>{item.points} баллов</span>
          </div>
        )) : <div className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-600 ring-1 ring-slate-100">Пока никто не зарегистрировался.</div>}
      </div>
    </Card>
  );
}

function getStudentFlag(studentName) {
  const active = getStudentActiveLanguage(studentName);
  if (active === "de") return "🇩🇪";
  if (active === "es") return "🇪🇸";
  if (active === "en") return "🇬🇧";
  return "🌍";
}

function getOneHourSlotOptions(daysAhead = 21) {
  const slots = [];
  const start = new Date();
  start.setMinutes(start.getMinutes() < 30 ? 30 : 60, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);
  const pad = (value) => String(value).padStart(2, "0");
  const formatDate = (date) => `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  for (let current = new Date(start); current <= end; current = new Date(current.getTime() + 30 * 60 * 1000)) {
    const hour = current.getHours();
    if (hour < 8 || hour > 21) continue;
    const slotEnd = new Date(current.getTime() + 60 * 60 * 1000);
    if (slotEnd.getHours() > 22 || (slotEnd.getHours() === 22 && slotEnd.getMinutes() > 0)) continue;
    slots.push(`${formatDate(current)} ${pad(current.getHours())}:${pad(current.getMinutes())}–${pad(slotEnd.getHours())}:${pad(slotEnd.getMinutes())}`);
  }
  return slots;
}

function ChatWindow({ student, channel, adminMode = false }) {
  const title = channel === "student" ? "Чат ученика" : "Чат родителей";
  const storageKey = `chat-${student}-${channel}`;
  const requestKey = `schedule-change-requests-${student}-${channel}`;
  const [messages, setMessages] = useRealtimeKey(storageKey, []);
  const [requests, setRequests] = useRealtimeKey(requestKey, []);
  const [text, setText] = useState("");
  const [requestText, setRequestText] = useState("");
  const [requestLesson, setRequestLesson] = useState("");
  const [chatPopup, setChatPopup] = useState(false);
  const slotOptions = useMemo(() => getOneHourSlotOptions(28), []);

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    const next = [...messages, {
      author: adminMode ? "Anastasia" : channel === "student" ? student : "Родитель",
      role: adminMode ? "admin" : channel,
      text: clean,
      time: new Date().toLocaleString("ru-RU"),
    }];
    setMessages(next);
    safeSet(storageKey, next);
    setText("");
    publishLiveActivity(adminMode ? "Anastasia" : student, `hat im ${title} geschrieben`, { student, channel });
    setChatPopup(true);
    window.setTimeout(() => setChatPopup(false), 2200);
  };

  const sendScheduleRequest = () => {
    const clean = requestText.trim();
    const lesson = requestLesson || "Не выбрано";
    if (!clean) return;
    const next = [...requests, {
      author: adminMode ? "Anastasia" : channel === "student" ? student : "Родитель",
      role: adminMode ? "admin" : channel,
      lesson,
      text: clean,
      status: "новая заявка",
      time: new Date().toLocaleString("ru-RU"),
    }];
    setRequests(next);
    safeSet(requestKey, next);
    const chatNext = [...messages, {
      author: adminMode ? "Anastasia" : channel === "student" ? student : "Родитель",
      role: adminMode ? "admin" : channel,
      text: `Заявка на разовое изменение расписания: ${lesson}. ${clean}`,
      time: new Date().toLocaleString("ru-RU"),
    }];
    setMessages(chatNext);
    safeSet(storageKey, chatNext);
    setChatPopup(true);
    window.setTimeout(() => setChatPopup(false), 2200);
    publishLiveActivity(adminMode ? "Anastasia" : student, "hat eine Terminänderung gesendet", { student, channel, lesson });
    setRequestText("");
    setRequestLesson("");
  };

  const updateRequestStatus = (index, status) => {
    const next = requests.map((item, i) => i === index ? { ...item, status } : item);
    setRequests(next);
    safeSet(requestKey, next);
    publishLiveActivity("Anastasia", `Terminstatus: ${status}`, { student, channel });
  };

  return (
    <Card className="p-6">
      {chatPopup && (
        <div className="fixed right-6 top-6 z-50 rounded-full bg-white p-4 text-4xl shadow-2xl ring-1 ring-slate-100 animate-bounce" title="Новое сообщение">
          {getStudentFlag(student)}
        </div>
      )}
      <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">{title} • {student}</div>
      <div className="max-h-72 overflow-y-auto rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
        {messages.length ? messages.map((msg, index) => (
          <div key={index} className={`mb-3 rounded-2xl p-3 ${msg.role === "admin" ? "bg-violet-100 text-violet-900" : "bg-white text-slate-700"}`}>
            <div className="text-xs font-black opacity-70">{msg.author} • {msg.time}</div>
            <div className="mt-1 font-semibold leading-6">{msg.text}</div>
          </div>
        )) : <div className="text-sm font-bold text-slate-500">Сообщений пока нет.</div>}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input value={text} onChange={(e) => { setText(e.target.value); publishLiveActivity(adminMode ? "Anastasia" : student, `tippt im ${title}`, { student, channel }); }} onKeyDown={(e) => e.key === "Enter" && send()} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-100" placeholder="Написать сообщение Anastasia..." />
        <button onClick={send} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Отправить</button>
      </div>

      <div className="mt-6 rounded-3xl bg-yellow-50 p-5 ring-1 ring-yellow-100">
        <h3 className="text-xl font-black text-orange-900">Заявка на разовое изменение расписания</h3>
        <p className="mt-2 text-sm font-bold leading-6 text-orange-800">Эта заявка не меняет общий недельный план. Выберите конкретный одноразовый слот длительностью 1 час. Слоты начинаются в полные и половинные часы.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_1.2fr_auto]">
          <select value={requestLesson} onChange={(e) => setRequestLesson(e.target.value)} className="rounded-2xl border border-yellow-200 bg-white px-4 py-3 font-bold outline-none">
            <option value="">Выберите одноразовый слот на 1 час</option>
            {slotOptions.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          <input value={requestText} onChange={(e) => { setRequestText(e.target.value); publishLiveActivity(adminMode ? "Anastasia" : student, "tippt eine Terminänderung", { student, channel }); }} className="rounded-2xl border border-yellow-200 bg-white px-4 py-3 outline-none" placeholder="Например: можно перенести урок на пятницу вечером?" />
          <button onClick={sendScheduleRequest} className="rounded-2xl bg-orange-400 px-5 py-3 font-black text-white shadow-sm">Отправить заявку</button>
        </div>
        <div className="mt-4 grid gap-3">
          {requests.map((req, index) => (
            <div key={`${req.time}-${index}`} className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-700 ring-1 ring-yellow-100">
              <div>{req.author} • {req.time}</div>
              <div className="mt-1">Урок: {req.lesson}</div>
              <div className="mt-1">Заявка: {req.text}</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">Статус: {req.status}</span>
                {adminMode && ["новая заявка", "одобрено", "отклонено", "обсуждается"].map((status) => (
                  <button key={status} onClick={() => updateRequestStatus(index, status)} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800 ring-1 ring-cyan-100">{status}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function LanguageRecommendation({ student, onOpenLanguage }) {
  const languages = getStudentLanguages(student);
  const suggestions = [];

  if (!languages.includes("en")) {
    suggestions.push([
      "en",
      "Английский язык",
      "Лексика, грамматика, разговорная практика, путешествия и учёба.",
      "EN",
    ]);
  }

  if (!languages.includes("de")) {
    suggestions.push([
      "de",
      "Немецкий язык",
      "Артикли, падежи, порядок слов, Alltag und Kommunikation.",
      "DE",
    ]);
  }

  suggestions.push([
    "other",
    "Другие языки",
    "Испанский и другие языки: материалы, тексты, упражнения и объяснения без онлайн-уроков.",
    "🌍",
  ]);

  return (
    <Card className="p-8">
      <div className="mb-4 inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-black text-cyan-800">
        Другие языки • {student}
      </div>
      <h2 className="text-3xl font-black">Можно изучать больше одного языка</h2>
      <p className="mt-3 leading-7 text-slate-600">
        Здесь можно посмотреть языки, которые подходят ученику дополнительно. Нажатие открывает информационную страницу выбранного направления.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map(([lang, title, text, badge]) => (
          <button
            key={lang}
            onClick={() => onOpenLanguage && onOpenLanguage(lang)}
            className="rounded-[1.75rem] bg-gradient-to-br from-white to-cyan-50 p-6 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:bg-cyan-50"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-xl font-black text-white">
              {badge}
            </div>
            <h3 className="text-2xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{text}</p>
            <div className="mt-5 rounded-2xl bg-yellow-100 px-4 py-3 text-center font-black text-orange-900">
              Открыть информационную страницу
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

function StudentDashboard({ student, quiz, quizState, totalPoints, answerWeeklyQuiz }) {
  const nextLesson = lessonSchedule[student]?.[0] || "Будет добавлено позже";
  const [wordStats] = useRealtimeKey(`word-stats-${student}`, { correct: 0, wrong: 0, unanswered: 0, streak: 0, level: "A0" });
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-6">
        <Card className="p-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat title="Следующий урок" value={nextLesson} icon="clock" />
            <Stat title="Баллы" value={`${totalPoints}`} icon="trophy" />
            <Stat title="Выучено слов" value={`${wordStats.correct}`} icon="star" />
            <Stat title="Язык" value={getStudentLanguageLabel(student)} icon="book" />
          </div>
        </Card>
        <WeeklyWord student={student} quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />
        <TournamentWidget student={student} />
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

function WeeklyWord({ student, quiz, quizState, answerWeeklyQuiz }) {
  const [wordStats] = useRealtimeKey(student ? `word-stats-${student}` : "word-stats-empty", { correct: 0, wrong: 0, unanswered: 0, streak: 0, level: "A0" });
  return (
    <div className="rounded-[1.75rem] bg-gradient-to-br from-cyan-50 via-white to-yellow-50 p-6 ring-1 ring-cyan-100">
      <div className="mb-3 inline-flex rounded-full bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">Слово дня • обновляется каждый день в 00:00 • уровень {quiz.level}</div>
      <h2 className="text-3xl font-black text-slate-950">{quiz.word}</h2>
      <p className="mt-2 text-slate-600">Выберите правильный перевод. За правильный ответ — 10 баллов. После 3 правильных ответов подряд уровень повышается. После ошибки уровень снижается на 1.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quiz.options.map((option) => (
          <button key={option} onClick={() => { publishLiveActivity(student, "löst das Wort des Tages", { selected: option }); answerWeeklyQuiz(option); }} disabled={quizState?.answered} className={`rounded-2xl p-4 text-left font-black ring-1 transition ${quizState?.answered && option === quiz.answer ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : quizState?.answered && option === quizState.selected ? "bg-red-50 text-red-700 ring-red-200" : "bg-white text-slate-800 ring-slate-100 hover:bg-cyan-50"}`}>{option}</button>
        ))}
      </div>
      {quizState?.answered && <div className={`mt-5 rounded-2xl p-4 font-black ${quizState.correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{quizState.correct ? "Правильно! +10 баллов." : `Неправильно. Правильный ответ: ${quiz.answer}.`}</div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 font-bold text-slate-700 shadow-sm">Пример: {quiz.example}</div>
        <div className="rounded-2xl bg-violet-50 p-4 font-black text-violet-800 ring-1 ring-violet-100">Всего выучено слов: {wordStats.correct}</div>
      </div>
    </div>
  );
}

function StudentInfo({ student, quiz, quizState, answerWeeklyQuiz, adminMode = false }) {
  const [content, setContent] = useRealtimeKey(`student-content-${student}`, getStudentContent(student));

  const updateContent = (field, value) => {
    const next = { ...content, [field]: value };
    setContent(next);
    saveStudentContent(student, next);
    publishLiveActivity(adminMode ? "Anastasia" : student, `bearbeitet ${field}`, { student, field });
  };

  const studentItems = [
    ["homework", "Домашнее задание", content.homework],
    ["materials", "Miro и материалы", content.materials],
    ["goal", "Актуальная цель", content.goal],
    ["revision", "Повторение", content.revision],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <WeeklyWord student={student} quiz={quiz} quizState={quizState} answerWeeklyQuiz={answerWeeklyQuiz} />
      <Card className="p-6">
        <h2 className="text-3xl font-black">Материалы и задания</h2>
        <p className="mt-2 leading-7 text-slate-600">Этот раздел Anastasia может обновлять в админ-профиле.</p>
        <div className="mt-6 grid gap-4">
          {studentItems.map(([field, title, text]) => (
            <div key={field} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
              <h3 className="text-xl font-black">{title}</h3>
              {adminMode ? (
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => updateContent(field, e.target.value)}
                  className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              ) : (
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
      <div className="lg:col-span-2">
        <ChatWindow student={student} channel="student" adminMode={adminMode} />
      </div>
    </div>
  );
}

function ParentsInfo({ student, adminMode = false }) {
  const [content, setContent] = useRealtimeKey(`student-content-${student}`, getStudentContent(student));

  const updateContent = (field, value) => {
    const next = { ...content, [field]: value };
    setContent(next);
    saveStudentContent(student, next);
    publishLiveActivity(adminMode ? "Anastasia" : student, `bearbeitet ${field}`, { student, field });
  };

  const parentItems = [
    ["parentProgress", "Прогресс", content.parentProgress],
    ["parentAttendance", "Посещаемость", content.parentAttendance],
    ["parentPayment", "Оплата", content.parentPayment],
    ["parentRecommendations", "Рекомендации", content.parentRecommendations],
  ];

  return (
    <Card className="p-8">
      <div className="mb-4 inline-flex rounded-full bg-yellow-100 px-4 py-2 text-sm font-black text-orange-800">Для родителей • {student}</div>
      <h2 className="text-3xl font-black">Информация для родителей</h2>
      <p className="mt-2 leading-7 text-slate-600">Anastasia может редактировать эти тексты в админ-профиле ученика.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {parentItems.map(([field, title, text]) => (
          <div key={field} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
            <h3 className="text-xl font-black">{title}</h3>
            {adminMode ? (
              <textarea
                rows={3}
                value={text}
                onChange={(e) => updateContent(field, e.target.value)}
                className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            ) : (
              <p className="mt-2 leading-7 text-slate-600">{text}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <ChatWindow student={student} channel="parent" adminMode={adminMode} />
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

function ProgressInfo({ student, totalPoints, adminMode = false }) {
  const [settings, setSettings] = useRealtimeKey(`progress-settings-${student}`, { includeLearningMenu: false, teacherAssessment: { Vocabulary: 0, Grammar: 0, Speaking: 0, Listening: 0 } });
  const [previousLevel, setPreviousLevel] = useRealtimeKey(`last-progress-level-${student}`, "A0");
  const { scores, overall, level } = calculateOverallProgress(student);
  const showCongrats = levelIndex(level) > levelIndex(previousLevel);

  useEffect(() => {
    if (showCongrats) {
      safeSet(`last-progress-level-${student}`, level);
      setPreviousLevel(level);
    }
  }, [showCongrats, level, student]);

  const updateTeacherAssessment = (category, value) => {
    const next = {
      ...settings,
      teacherAssessment: {
        ...(settings.teacherAssessment || {}),
        [category]: Number(value),
      },
    };
    setSettings(next);
    saveProgressSettings(student, next);
    publishLiveActivity(adminMode ? "Anastasia" : student, `aktualisiert Fortschritt: ${category}`, { student, category });
  };

  const toggleLearningMenu = () => {
    const next = { ...settings, includeLearningMenu: !settings.includeLearningMenu };
    setSettings(next);
    saveProgressSettings(student, next);
    publishLiveActivity(adminMode ? "Anastasia" : student, "ändert Fortschrittseinstellungen", { student });
  };

  const [wordStats] = useRealtimeKey(`word-stats-${student}`, { correct: 0, wrong: 0, unanswered: 0, streak: 0, level: "A0" });
  const learningScore = learningMenuScore(student);

  return (
    <Card className="p-8">
      <div className="mb-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-800">Прогресс • {student}</div>
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <h2 className="text-3xl font-black">Учебный прогресс</h2>
          <p className="mt-3 leading-7 text-slate-600">Общий результат состоит из четырёх категорий: словарный запас, грамматика, говорение и аудирование. Каждая категория даёт 25% общего результата.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <div className="text-sm font-bold text-white/60">Общий результат</div>
            <div className="text-4xl font-black">{overall}%</div>
            <div className="mt-1 text-xl font-black text-yellow-300">{level}</div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
            <div className="mb-3 text-sm font-black text-slate-600">Список достижений по уровням</div>
            <div className="grid gap-2">
              {[...progressLevelRanges].reverse().map(([levelName, min, max]) => {
                const current = level === levelName;
                const achieved = overall >= min;
                return (
                  <div key={levelName} className={`flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-black ring-1 ${current ? "bg-yellow-100 text-orange-900 ring-yellow-200" : achieved ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-white text-slate-500 ring-slate-100"}`}>
                    <span>{achieved ? "🏆" : "🔒"} {levelName}</span>
                    <span>{min}–{max}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showCongrats && (
        <div className="mt-6 rounded-[1.75rem] bg-gradient-to-r from-yellow-200 to-orange-200 p-5 text-center font-black text-orange-900 ring-1 ring-yellow-300">
          🎉 Поздравляем! Новый уровень: {level}! Так держать — это отличный прогресс!
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {progressCategories.map((category) => (
          <div key={category} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-100">
            <div className="flex justify-between font-black"><span>{progressCategoryLabels[category]}</span><span>{scores[category]}%</span></div>
            <div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${scores[category]}%` }} /></div>
            <div className="mt-3 text-sm font-bold text-slate-500">Уровень: {scoreToLevel(scores[category])}</div>
            {adminMode && (
              <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                Оценка Anastasia: {settings.teacherAssessment?.[category] || 0}%
                <input type="range" min="0" max="100" value={settings.teacherAssessment?.[category] || 0} onChange={(e) => updateTeacherAssessment(category, e.target.value)} />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl bg-yellow-50 p-5 font-bold text-orange-800 ring-1 ring-yellow-100">
          Слова дня: правильно {wordStats.correct} • неправильно {wordStats.wrong} • фактор словарного запаса по текущему уровню {dailyVocabularyScore(student)}%
        </div>
        <div className="rounded-3xl bg-cyan-50 p-5 font-bold text-cyan-800 ring-1 ring-cyan-100">
          Фактор учебного меню по текущему открытому уровню: {learningScore}% {settings.includeLearningMenu ? "• активно" : "• выключено"}
        </div>
        <div className="rounded-3xl bg-violet-50 p-5 font-bold text-violet-800 ring-1 ring-violet-100">
          Всего баллов за слова дня: {totalPoints}
        </div>
      </div>

      {adminMode && (
        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black">Учитывать учебное меню в прогрессе</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">По умолчанию выключено. Anastasia может включить этот фактор отдельно для каждого ученика.</p>
            </div>
            <button onClick={toggleLearningMenu} className={`rounded-2xl px-5 py-3 font-black ${settings.includeLearningMenu ? "bg-emerald-100 text-emerald-800" : "bg-slate-950 text-white"}`}>
              {settings.includeLearningMenu ? "Включено" : "Выключено"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm font-bold leading-7 text-slate-700 ring-1 ring-slate-100">
        Текущий уровень подсвечен жёлтым, уже достигнутые уровни отмечены кубком. Следующая цель — перейти в следующий процентный диапазон.
      </div>
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
        <CountryFactsSection type={type} />
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
        <LanguageInterestChatSection type={type} />
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

function CountryFactsSection({ type }) {
  const facts = type === "de" ? {
    title: "Немецкий язык и немецкоязычные страны",
    text: "Немецкий открывает доступ к учёбе, работе, путешествиям и культуре Германии, Австрии и Швейцарии. На уроках мы связываем язык с реальными ситуациями: поездки, школа, быт, документы, город и общение.",
    photos: [
      ["Бранденбургские ворота", "Берлин, Германия", "🏛️", "from-yellow-100 via-white to-red-100", "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1200&q=80"],
      ["Альпы", "Австрия и Швейцария", "🏔️", "from-cyan-100 via-white to-blue-100", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80"],
      ["Городская жизнь", "транспорт, кафе, университет", "🚋", "from-orange-100 via-white to-violet-100"],
    ],
    factCards: [
      ["3 страны", "Немецкий особенно важен для Германии, Австрии и Швейцарии."],
      ["der, die, das", "Артикли и падежи тренируются постепенно и без паники."],
      ["Порядок слов", "Одна из ключевых тем для уверенной немецкой речи."],
      ["Культура", "Язык помогает лучше понимать города, традиции и повседневную жизнь."],
    ],
  } : {
    title: "Английский язык и англоязычный мир",
    text: "Английский нужен для учёбы, работы, путешествий, фильмов, музыки, общения и интернета. На занятиях мы учим не абстрактные правила, а язык, который можно сразу использовать в жизни.",
    photos: [
      ["Лондон", "Биг-Бен и городская среда", "🇬🇧", "from-cyan-100 via-white to-blue-100", "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"],
      ["Путешествия", "аэропорт, отель, кафе", "✈️", "from-yellow-100 via-white to-orange-100"],
      ["Международное общение", "учёба, работа, интернет", "🌍", "from-violet-100 via-white to-cyan-100"],
    ],
    factCards: [
      ["Глобальный язык", "Английский часто используется в международной коммуникации."],
      ["Для путешествий", "Фразы для аэропорта, отеля, транспорта и кафе дают быструю пользу."],
      ["Для учёбы", "Помогает читать тексты, смотреть материалы и делать презентации."],
      ["Для уверенности", "Главная цель — говорить понятнее, свободнее и спокойнее."],
    ],
  };

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="Страны и язык" title={facts.title} text={facts.text} />
        <div className="grid gap-6 lg:grid-cols-3">
          {facts.photos.map(([title, subtitle, icon, gradient, imageUrl]) => (
            <Card key={title} className={`overflow-hidden bg-gradient-to-br ${gradient}`}>
              <div className="flex h-56 items-center justify-center overflow-hidden text-7xl">
                {imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-cover" /> : icon}
              </div>
              <div className="bg-white/80 p-5 backdrop-blur">
                <h3 className="text-xl font-black text-slate-950">{title}</h3>
                <p className="mt-1 font-semibold text-slate-600">{subtitle}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">Фото помогает связать язык с реальными местами, культурой и ситуациями общения.</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {facts.factCards.map(([title, text]) => (
            <div key={title} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-xl font-black text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
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
  if (page === "students") return <StudentPortal onBack={() => setPage(null)} onOpenLanguage={(lang) => setPage(lang)} />;
  if (page === "other") return <OtherLanguagesPage onHome={() => setPage(null)} />;
  if (page === "en" || page === "de") return <LanguagePage type={page} onHome={() => setPage(null)} />;
  return (
    <>
      <Home onChoose={setPage} />
      <button
        onClick={() => setPage("other")}
        className="fixed bottom-6 left-6 z-40 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-black text-white shadow-2xl ring-1 ring-white/40"
      >
        🌍 Другие языки
      </button>
    </>
  );
}
