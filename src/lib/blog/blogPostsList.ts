import { ContentMeta } from "@/types/content";

export enum CategoryEnum {
  Methodology = "methodology",
  Analysis = "analysis",
  Guide = "guide",
}

export const blogMetadata: ContentMeta[] = [
  {
    id: "municipality-method-update",
    title:
      "Carbon Law – ny metod för att jämföra kommunernas klimatutsläpp ",
    excerpt:
      "Klimatkollen ändrar metod för utsläppsdata om landets kommuner.",
    date: "2025-09-02",
    readTime: "2 min",
    category: CategoryEnum.Methodology,
    image: "/images/blogImages/swedish-municipality-map.png",
    displayLanguages: ["sv"],
    language: "sv",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["carbon-law-from-2025", "only-radical-futures-left"],
  },
  {
    id: "municipality-method-update",
    title:
      "Carbon Law – a new method for comparing municipalities' climate emissions",
    excerpt:
      "Klimatkollen is changing its method for calculating emissions data for Sweden's municipalities.",
    date: "2025-09-02",
    readTime: "2 min",
    category: CategoryEnum.Methodology,
    image: "/images/blogImages/swedish-municipality-map.png",
    displayLanguages: ["en"],
    language: "en",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["carbon-law-from-2025", "only-radical-futures-left"],
  },
  {
    id: "only-radical-futures-left",
    title:
      "Only Radical Futures Left",
    excerpt:
      "There Are Only Radical Futures Left – That’s Why We Need To Cut Emissions by 12 Percent Per Year",
    date: "2025-07-09",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/only-radical-futures.jpg",
    displayLanguages: ["en"],
    language: "en",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["carbon-law-from-2025", "2024-report"],
  },
  {
    id: "only-radical-futures-left",
    title:
      "Bara radikala framtidsutsikter kvar",
    excerpt:
      "Det finns bara radikala framtidsutsikter kvar – därför måste vi minska utsläppen med 12 procent per år",
    date: "2025-07-09",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/only-radical-futures.jpg",
    displayLanguages: ["sv"],
    language: "sv",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["carbon-law-from-2025", "2024-report"],
  },
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
    language: "en",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["metod"],
  },
  {
    id: "carbon-law-from-2025",
    title:
      "Q&A Klimatkollens justerade utsläppsbana för Carbon Law",
    excerpt:
      "Frågor och svar om Klimatkollens rapport Applying Carbon Law from 2025 och metoden vi använder för att visualisera företagens utsläpp jämfört med Parisavtalet.",
    date: "2025-06-23",
    readTime: "7 min",
    category: CategoryEnum.Methodology,
    image: "/images/blogImages/2025_Carbon_Law.png",
    displayLanguages: ["sv"],
    language: "sv",
    author: {
      name: "Frida Berry Eklund",
      avatar: "/people/frida.jpg",
    },
    relatedPosts: ["metod", "utslappsberakning"],
  },
  {
    id: "2024-report",
    title:
      "Klimatkollens 2025-rapport - Översikt",
    excerpt:
      "Vi granskar klimatrapporteringen från 235 storbolag för 2024 data och visar varför utsläppsminskningarna går för långsamt – samt ger tre konkreta rekommendationer för mer transparent och effektiv klimatredovisning.",
    date: "2025-07-07",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/reportImages/2024_bolagsklimatkollen.png",
    displayLanguages: ["sv"],
    language: "sv",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["sv-carbon-law-from-2025", "utslappsberakning"],
  },
  {
    id: "2024-report",
    title:
      "Klimatkollens 2025 Report Overview",
    excerpt:
      "We reviewed the corporate climate reporting from 235 large companies for 2024 data and show why the emission reductions are too slow – and give three concrete recommendations for more transparent and effective climate reporting.",
    date: "2025-07-07",
    readTime: "2 min",
    category: CategoryEnum.Analysis,
    image: "/images/reportImages/2024_bolagsklimatkollen.png",
    displayLanguages: ["en"],
    language: "en",
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
    language: "sv",
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
    language: "sv",
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
    language: "sv",
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
    language: "sv",
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
    language: "sv",
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
    language: "sv",
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["klimatmal", "metod"],
  },
];

export const blogMetadataByLanguage = {
  en: blogMetadata.filter(post => 
    post.displayLanguages.includes('en') || 
    post.displayLanguages.includes('all')
  ),
  sv: blogMetadata.filter(post => 
    post.displayLanguages.includes('sv') || 
    post.displayLanguages.includes('all')
  )
};
