import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
    en: {
        translation: {
            title: "Task App",
            placeholder: "What needs to be done?",
            add: "Add",
            logout: "Logout",
            empty: "No tasks yet",
            completed: "Completed",
            pending: "Pending",
            all: "All",
        },
    },
    es: {
        translation: {
            title: "Tareas",
            placeholder: "¿Qué tienes pendiente?",
            add: "Añadir",
            logout: "Salir",
            empty: "No hay tareas",
            completed: "Completadas",
            pending: "Pendientes",
            all: "Todas",
        },
    },
    sv: {
        translation: {
            title: "Uppgifter",
            placeholder: "Vad behöver göras?",
            add: "Lägg till",
            logout: "Logga ut",
            empty: "Inga uppgifter",
            completed: "Klara",
            pending: "Pågående",
            all: "Alla",
        },
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    interpolation: { escapeValue: false },
});

export default i18n;