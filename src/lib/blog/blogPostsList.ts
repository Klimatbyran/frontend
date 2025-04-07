export enum CategoryEnum {
  Methodology = "Metodik",
  Analysis = "Analys",
  Guide = "Guide",
}

export enum LangEnum {
  SE = "Swedish",
  EN = "English",
}

export type BlogPostMeta = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: CategoryEnum;
  image?: string;
  language?: LangEnum;
  link?: string;
  author?: {
    name: string;
    avatar: string;
  };
  relatedPosts?: string[];
};

export const blogMetadata: BlogPostMeta[] = [
  {
    id: "hållbara-kolet",
    title: "Låt kolet stanna i jorden",
    excerpt:
      "Den totala mängden kolatomer är konstant, men vi kan omfördela det på rätt sätt. Klimatåtgärder handlar om att låta kolet stanna kvar i jorden, så att det inte förbränns och släpper ut koldioxid.",
    date: "2025-03-28",
    readTime: "5 min",
    category: CategoryEnum.Analysis,
    image: "/images/blogImages/matthias-heyde-co2-unsplash.jpg",
    language: LangEnum.SE,
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
    language: LangEnum.SE,
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
    language: LangEnum.SE,
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
    language: LangEnum.SE,
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
    language: LangEnum.SE,
    author: {
      name: "Ola Spännar",
      avatar: "/people/ola.jpg",
    },
    relatedPosts: ["klimatmal", "metod"],
  },
];
