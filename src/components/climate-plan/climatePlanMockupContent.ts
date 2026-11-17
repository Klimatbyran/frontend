export type ExampleStat = {
  label: string;
  value: string;
  unit: string;
  caption?: string;
  valueClassName?: string;
};

export type ExampleSector = {
  label: string;
  share: number;
  color: string;
};

export type MockField = {
  id: string;
  label: string;
  hint?: string;
  kind: "input" | "textarea" | "checkbox";
  value?: string;
  unit?: string;
  placeholder?: string;
  fromKlimatkollen?: boolean;
};

export type FieldGroup = {
  title: string;
  fields: MockField[];
};

export type MockSection = {
  number: string;
  title: string;
  intro?: string;
  showEmissionsRecap?: boolean;
  fields?: MockField[];
  groups?: FieldGroup[];
};

export type MockPart = {
  kicker: string;
  title: string;
  intro: string;
  sections: MockSection[];
};

export const EXAMPLE_MUNICIPALITY = "Uppsala";

export const EXAMPLE_NOTE =
  "Siffrorna är avrundade exempel för mockupen. I verktyget hämtas de från Klimatkollen för den kommun som valts.";

export const EXAMPLE_STATS: ExampleStat[] = [
  {
    label: "Totala utsläpp",
    value: "480 000",
    unit: "ton CO₂e",
    caption: "2023, inom kommungränsen",
  },
  {
    label: "Per invånare",
    value: "2,1",
    unit: "ton CO₂e",
    caption: "2023",
  },
  {
    label: "Förändring",
    value: "−18",
    unit: "%",
    caption: "sedan 2015",
    valueClassName: "text-orange-2",
  },
];

export const EXAMPLE_SECTORS: ExampleSector[] = [
  { label: "Transporter", share: 42, color: "var(--orange-3)" },
  { label: "El och fjärrvärme", share: 18, color: "var(--blue-2)" },
  { label: "Industri", share: 16, color: "var(--orange-2)" },
  { label: "Jordbruk", share: 12, color: "var(--green-4)" },
  { label: "Övrigt", share: 12, color: "var(--grey)" },
];

const filled = (
  id: string,
  label: string,
  value: string,
  unit?: string,
): MockField => ({
  id,
  label,
  kind: "input",
  value,
  unit,
  fromKlimatkollen: true,
});

const emptyInput = (
  id: string,
  label: string,
  unit?: string,
  hint?: string,
): MockField => ({
  id,
  label,
  kind: "input",
  unit,
  hint,
  placeholder: "Fylls i av kommunen",
});

const textArea = (id: string, label: string, hint: string): MockField => ({
  id,
  label,
  kind: "textarea",
  hint,
  placeholder: "Fylls i av kommunen",
});

const check = (id: string, label: string, hint: string): MockField => ({
  id,
  label,
  kind: "checkbox",
  hint,
});

export const CLIMATE_PLAN_PARTS: MockPart[] = [
  {
    kicker: "Del 1",
    title: "Grunden och inriktningen",
    intro: "Vart kommunen ska, och varför.",
    sections: [
      {
        number: "1",
        title: "Politiskt löfte och vision",
        intro:
          "Ett offentligt åtagande i linje med Parisavtalet, och en bild av den klimatneutrala kommunen.",
        fields: [
          textArea(
            "pledge",
            "Offentligt åtagande",
            "Löfte från kommunens ledning om brådskande och rättvisa klimatåtgärder mot 1,5-gradersmålet.",
          ),
          textArea(
            "vision",
            "Visionen",
            "Hur kommunen ska se ut när den är klimatneutral, och vad det betyder för invånarnas livskvalitet.",
          ),
        ],
      },
      {
        number: "2",
        title: "Nuläget: klimatpåverkan och utsatthet",
        intro:
          "Utsläppen inom kommungränsen kommer från Klimatkollen. Konsumtion och klimatrisker beskrivs här.",
        showEmissionsRecap: true,
        fields: [
          emptyInput(
            "consumption-total",
            "Konsumtionsbaserade utsläpp",
            "ton CO₂e",
            "Utsläpp från mat, varor och tjänster som köps.",
          ),
          emptyInput(
            "consumption-per-capita",
            "Konsumtionsbaserade utsläpp per invånare",
            "ton CO₂e",
          ),
          textArea(
            "climate-risk",
            "Klimatrisker och sårbarhet",
            "Extremväder som värmeböljor och skyfall, och vilka områden och grupper som är mest utsatta.",
          ),
        ],
      },
      {
        number: "3",
        title: "Målsättningar",
        fields: [
          {
            ...emptyInput("net-zero-year", "År för nettonoll"),
            placeholder: "till exempel 2030",
          },
          textArea(
            "milestones",
            "Etappmål",
            "Mätbara delmål på vägen mot nettonoll.",
          ),
          textArea(
            "adaptation-goals",
            "Anpassningsmål",
            "Mål för att bygga motståndskraft och skydda samhället.",
          ),
          textArea(
            "justice-goals",
            "Rättvisemål",
            "Hur omställningen stärker folkhälsan och inte drabbar utsatta grupper.",
          ),
        ],
      },
    ],
  },
  {
    kicker: "Del 2",
    title: "Genomförandet",
    intro: "Hur målen ska nås.",
    sections: [
      {
        number: "4",
        title: "Åtgärdspaket och sektorstrategier",
        intro: "Konkreta insatser där utsläppen är störst.",
        fields: [
          textArea(
            "transport-actions",
            "Transporter och mobilitet",
            "Cykel- och gångvägar, kollektivtrafik och laddinfrastruktur.",
          ),
          textArea(
            "energy-actions",
            "Energi och bebyggelse",
            "Kommunens egna lokaler, lokal förnybar energi och klimatkrav vid nybyggnation.",
          ),
          textArea(
            "food-actions",
            "Mat och konsumtion",
            "Matsvinn, klimatsmart mat i skola och omsorg, återbruk och delning.",
          ),
          textArea(
            "nature-actions",
            "Natur och kolsänkor",
            "Träd, grönområden och biokol som binder koldioxid och tar hand om vatten.",
          ),
        ],
      },
      {
        number: "5",
        title: "Finansiering och investeringar",
        fields: [
          textArea(
            "investment-plan",
            "Klimatinvesteringsplan",
            "Vad omställningen kostar, var finansieringen kommer ifrån och vilka pengar som styrs om.",
          ),
          textArea(
            "green-procurement",
            "Hållbara inköp",
            "Hur kommunen använder upphandlingen för att ställa klimatkrav.",
          ),
        ],
      },
      {
        number: "6",
        title: "Styrning, organisation och samverkan",
        fields: [
          textArea(
            "mainstreaming",
            "Klimatintegrering",
            "Klimat i besluten i alla förvaltningar, från stadsplanering till äldreomsorg.",
          ),
          textArea(
            "collaboration",
            "Samverkan och medborgarengagemang",
            "Klimatkontrakt med näringslivet, och dialog med invånare, särskilt unga och utsatta grupper.",
          ),
        ],
      },
    ],
  },
  {
    kicker: "Del 3",
    title: "Uppföljning och utvärdering",
    intro: "Ett årligt system för att mäta, redovisa och lära.",
    sections: [
      {
        number: "7",
        title: "Process för uppföljning",
        fields: [
          textArea(
            "yearly-cycle",
            "Årshjulet",
            "Klimatmålen följs upp varje år, med samma vikt som de ekonomiska målen.",
          ),
          textArea(
            "reporting",
            "Återrapportering",
            "Resultat till kommunstyrelse eller fullmäktige, och öppet till invånarna.",
          ),
        ],
      },
      {
        number: "8",
        title: "Kvantitativa klimatnyckeltal",
        intro:
          "Fält märkta Klimatkollen är redan ifyllda. Övriga fylls i av kommunen.",
        groups: [
          {
            title: "Övergripande utsläpp",
            fields: [
              filled("kpi-total", "Totala utsläpp", "480 000", "ton CO₂e"),
              filled(
                "kpi-per-capita",
                "Utsläpp per invånare",
                "2,1",
                "ton CO₂e",
              ),
            ],
          },
          {
            title: "Energi och uppvärmning",
            fields: [
              emptyInput(
                "renewable-share",
                "Självförsörjningsgrad av lokal förnybar el",
                "%",
              ),
              emptyInput(
                "district-heating",
                "Klimatpåverkan från fjärrvärmen",
                "ton CO₂e/kWh",
              ),
              emptyInput("solar", "Installerad effekt av solceller", "MW"),
              emptyInput("wind", "Vindkraft", "MWh"),
            ],
          },
          {
            title: "Transporter",
            fields: [
              filled(
                "kpi-transport",
                "Transportsektorns utsläpp per invånare",
                "0,9",
                "ton CO₂e",
              ),
              emptyInput(
                "modal-split",
                "Färdmedelsfördelning",
                undefined,
                "Andel resor med gång, cykel, kollektivtrafik och bil.",
              ),
              emptyInput(
                "fossil-free-vehicles",
                "Andel fossiloberoende fordon och förnybara drivmedel",
                "%",
              ),
              emptyInput(
                "municipal-fleet",
                "Kommunorganisationens egna fordon",
                undefined,
                "Andel miljöbilar och tjänsteresor.",
              ),
              filled("kpi-ev-change", "Ökning av andel elbilar", "+24", "%"),
              filled("kpi-charge-points", "Elbilar per laddpunkt", "8"),
              filled(
                "kpi-bike-paths",
                "Cykelvägsmeter per invånare",
                "3,4",
                "m",
              ),
            ],
          },
          {
            title: "Konsumtion och resurser",
            fields: [
              emptyInput(
                "food-emissions",
                "Matens klimatpåverkan",
                undefined,
                "Utsläpp per serverad portion eller kg inköpt livsmedel.",
              ),
              emptyInput(
                "food-waste",
                "Matsvinn",
                undefined,
                "Uppmätt svinn i skolor och äldreomsorg.",
              ),
              emptyInput(
                "recycling",
                "Materialåtervinning",
                "%",
                "Andel hushållsavfall som samlas in för återvinning.",
              ),
            ],
          },
          {
            title: "Redan kartlagt i Klimatkollen",
            fields: [
              filled("kpi-climate-plan", "Klimatplan", "Antagen 2022"),
              filled("kpi-procurement", "Klimatkrav i upphandlingar", "Ja"),
            ],
          },
        ],
      },
      {
        number: "9",
        title: "Kvalitativa åtgärdsnyckeltal",
        intro:
          "Om kommunen har processerna på plats för att driva omställningen.",
        fields: [
          check(
            "check-companies",
            "Bolagsstyrning",
            "Finns krav på klimatneutralitet i ägardirektiven till kommunala bolag?",
          ),
          check(
            "check-construction",
            "Byggande",
            "Ställs krav på livscykelanalys, träbyggnation och energieffektivisering vid markanvisningar och nybyggnation?",
          ),
          check(
            "check-finance",
            "Finans",
            "Är kommunens pensionskapital och aktier fossilfria?",
          ),
          check(
            "check-procurement",
            "Upphandling",
            "Ställs klimatkrav vid inköp av IT, möbler, entreprenader och transporttjänster?",
          ),
        ],
      },
    ],
  },
  {
    kicker: "Del 4",
    title: "Kommunikation och lärande",
    intro: "Hur resultatet berättas, och hur planen justeras.",
    sections: [
      {
        number: "10",
        title: "Öppen kommunikation",
        fields: [
          textArea(
            "open-reporting",
            "Informera och bygga tillit",
            "Offentliga rapporter och kampanjer som gör uppföljningen begriplig för invånarna.",
          ),
          textArea(
            "celebrate",
            "Fira framgångar",
            "Goda initiativ, klimatpris och de nyttor som kommer på köpet, som svalka, vatten och en bättre boendemiljö.",
          ),
          textArea(
            "learning",
            "Lärande kultur",
            "Hur planen justeras när en åtgärd inte fungerar.",
          ),
        ],
      },
    ],
  },
];
