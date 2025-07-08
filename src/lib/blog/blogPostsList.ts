import { ContentMeta } from "@/types/content";

export enum CategoryEnum {
  Methodology = "Metodik",
  Analysis = "Analys",
  Guide = "Guide",
}

export const blogMetadata: ContentMeta[] = [
  {
    id: "carbon-law-from-2025",
    title:
      "Q&A: Klimatkollen's adjusted Carbon Law emissions reduction trajectory",
    excerpt:
      "Answering questions related to Klimatkollen's white paper, Applying Carbon Law From 2025; the method used to visualise how corporate emissions compare to the Paris Agreement on Klimatkollen.se.",
    date: "2025-06-23",
    readTime: "7 min",
    category: CategoryEnum.Methodology,
    image: "/images/blogImages/2025_Carbon_Law.png",
    displayLanguages: ["en"],
    language: "English",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["metod"],
  },
  {
    id: "sv-carbon-law-from-2025",
    title:
      "Frågor och svar: Klimatkollens justerade koldioxidlag emissionsminskningspåverkan",
    excerpt:
      "Svar på frågor om Klimatkollens vitbok, Tillämpa koldioxidlag från 2025; metoden som används för att visualisera hur företagens utsläpp jämförs med Parisavtalet på Klimatkollen.se.",
    date: "2025-06-23",
    readTime: "7 min",
    category: CategoryEnum.Methodology,
    image: "/images/blogImages/2025_Carbon_Law.png",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["metod", "utslappsberakning"],
  },
  {
    id: "sv-2024-report",
    title:
      "Klimatkollens 2024-rapport - Översikt",
    excerpt:
      "Vi granskar klimatrapporteringen från 235 storbolag för 2024 och visar varför utsläppsminskningarna går för långsamt – samt ger tre konkreta rekommendationer för mer transparent och effektiv klimatredovisning.",
    date: "2025-07-07",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/reportImages/2024_bolagsklimatkollen.png",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["sv-carbon-law-from-2025", "utslappsberakning"],
  },
  {
    id: "2024-report",
    title:
      "Klimatkollens 2024 Report Overview",
    excerpt:
      "We reviewed the corporate climate reporting from 235 large companies for 2024 and show why the emission reductions are too slow – and give three concrete recommendations for more transparent and effective climate reporting.",
    date: "2025-07-07",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/reportImages/2024_bolagsklimatkollen.png",
    displayLanguages: ["en"],
    language: "English",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["carbon-law-from-2025"],
  },
  {
    id: "hållbara-kolet",
    title: "Låt kolet stanna i jorden",
    excerpt:
      "Den totala mängden kolatomer är konstant, men vi kan omfördela det på rätt sätt. Klimatåtgärder handlar om att låta kolet stanna kvar i jorden, så att det inte förbränns och släpper ut koldioxid.",
    date: "2025-03-28",
    readTime: "5 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/matthias-heyde-co2-unsplash.jpg",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "John Carlbäck, volontär och rådgivare",
      avatar: "/people/carlback_john.jpg",
    },
    relatedPosts: ["klimatmal", "utslappsberakning"],
  },
  {
    id: "ai-process-del-1",
    title:
      "Så kan AI hjälpa oss förstå företagens klimatdata. Del 1 – Översikt",
    excerpt:
      "Vi på Klimatkollen har spenderat ett år med att bygga en öppen databas över företags klimatpåverkan. Det här är första delen i en serie där jag berättar hur vi använder AI för att automatisera inhämtning och tolkning av klimatdata. Och vi behöver din hjälp!",
    date: "2025-01-20",
    readTime: "8 min",
    category: CategoryEnum.Methodology,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
    displayLanguages: ["sv","all"],
    language: "Svenska",
    author: {
      name: "Christian Landgren",
      avatar: "/people/christian.jpg",
    },
    relatedPosts: ["welcome", "metod"],
  },
  {
    id: "metod",
    title: "Varför är scope 3 så svårt att få grepp om?",
    excerpt:
      "Redovisning av utsläpp i värdekedjan, scope 3, är en av de svåraste, men även viktigaste delarna av hållbarhetsrapporteringen. Klimatkollens Alexandra Palmquist skriver om varför scope är så svårt att beräkna korrekt – och ger tre tips på hur arbetet kan förbättras hos bolagen.",
    date: "2025-01-08",
    readTime: "5 min",
    category: CategoryEnum.Analysis,
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    displayLanguages: ["sv","all"],
    language: "Svenska",
    author: {
      name: "Alexandra Palmquist",
      avatar: "/people/alex.jpg",
    },
    relatedPosts: ["welcome", "ai-process-del-1"],
  },
  {
    id: "welcome",
    title: "Välkommen till Klimatkollen",
    excerpt:
      "Läs om hur vi hjälper företag att bli mer transparenta med sina klimatdata",
    date: "2025-01-08",
    readTime: "1 min",
    category: CategoryEnum.Guide,
    image:
      "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&h=400&fit=crop",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "Alexandra Palmquist",
      avatar: "/people/alex.jpg",
    },
    relatedPosts: ["metod", "ai-process-del-1"],
  },
  {
    id: "klimatmal",
    title:
      "Analys av riksdagspartiernas klimatmål – sex av åtta partier missar helt Parisavtalets 1,5-gradersmål",
    excerpt: "",
    date: "2022-09-01",
    readTime: "5 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/image1-31.webp",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["utslappsberakning", "metod"],
  },
  {
    id: "utslappsberakning",
    title: "Utsläppsberäkning av riksdagspartiernas politik",
    excerpt:
      "Utsläppsberäkning av riksdagspartiernas politik gällande tolv centrala klimatåtgärder. Bakom uträkningarna står Klimatkollen, Världsnaturfonden WWF, ClimateView, Naturskyddsföreningen och Våra barns klimat. Beräkningarna visade att den nya regeringens politik kan öka utsläppen med 25 miljoner ton redan under mandatperioden 2022–2026.",
    date: "2022-09-01",
    readTime: "5 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/totala-utslapp-alla-partier.webp",
    displayLanguages: ["sv"],
    language: "Svenska",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["klimatmal", "metod"],
  },
];
