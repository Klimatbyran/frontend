export type ClimatePlanField = {
  id: string;
  label: string;
  hint?: string;
  /** Shown when this answer is scored on how specific it is. */
  tip?: string;
  kind: "input" | "textarea" | "checkbox";
  unit?: string;
  placeholder?: string;
  fromKlimatkollen?: boolean;
};

type FieldGroup = {
  title: string;
  fields: ClimatePlanField[];
};

type ClimatePlanSection = {
  title: string;
  intro?: string;
  fields?: ClimatePlanField[];
  groups?: FieldGroup[];
};

type ClimatePlanPart = {
  kicker: string;
  sections: ClimatePlanSection[];
};

const SPECIFICITY_TIP =
  "Nämn vem som ansvarar, till när det ska vara gjort, vad som ska göras och genom vilken mekanism. Ju fler av de fyra, desto bättre.";

const withSpecificityTip = (field: ClimatePlanField): ClimatePlanField => ({
  ...field,
  tip: SPECIFICITY_TIP,
});

const fromKlimatkollen = (
  id: string,
  label: string,
  unit?: string,
): ClimatePlanField => ({
  id,
  label,
  kind: "input",
  unit,
  fromKlimatkollen: true,
  placeholder: "Hämtas från Klimatkollen",
});

const emptyInput = (
  id: string,
  label: string,
  unit?: string,
  hint?: string,
): ClimatePlanField => ({
  id,
  label,
  kind: "input",
  unit,
  hint,
  placeholder: "Fylls i av kommunen",
});

const textArea = (
  id: string,
  label: string,
  hint: string,
): ClimatePlanField => ({
  id,
  label,
  kind: "textarea",
  hint,
  placeholder: "Fylls i av kommunen",
});

const check = (id: string, label: string, hint: string): ClimatePlanField => ({
  id,
  label,
  kind: "checkbox",
  hint,
});

const CLIMATE_PLAN_PARTS: ClimatePlanPart[] = [
  {
    kicker: "Del 1",
    sections: [
      {
        title: "Politiskt löfte och vision",
        intro:
          "Ett offentligt åtagande i linje med Parisavtalet, och en bild av den klimatneutrala kommunen.",
        fields: [
          withSpecificityTip(
            textArea(
              "pledge",
              "Offentligt åtagande",
              "Löfte från kommunens ledning om brådskande och rättvisa klimatåtgärder mot 1,5-gradersmålet.",
            ),
          ),
          textArea(
            "vision",
            "Visionen",
            "Hur kommunen ska se ut när den är klimatneutral, och vad det betyder för invånarnas livskvalitet.",
          ),
        ],
      },
      {
        title: "Nuläget: klimatpåverkan och utsatthet",
        intro:
          "Utsläppen inom kommungränsen kommer från Klimatkollen. Konsumtion och klimatrisker beskrivs här.",
        fields: [
          emptyInput(
            "consumption-total",
            "Konsumtionsbaserade utsläpp",
            "tCO₂e",
            "Utsläpp från mat, varor och tjänster som köps.",
          ),
          fromKlimatkollen(
            "consumption-per-capita",
            "Konsumtionsbaserade utsläpp per invånare",
            "tCO₂e",
          ),
          textArea(
            "climate-risk",
            "Klimatrisker och sårbarhet",
            "Extremväder som värmeböljor och skyfall, och vilka områden och grupper som är mest utsatta.",
          ),
        ],
      },
      {
        title: "Målsättningar",
        fields: [
          {
            ...emptyInput("net-zero-year", "År för nettonoll"),
            placeholder: "till exempel 2030",
          },
          withSpecificityTip(
            textArea(
              "milestones",
              "Etappmål",
              "Delmål på vägen mot nettonoll.",
            ),
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
    sections: [
      {
        title: "Åtgärdspaket och sektorstrategier",
        intro: "Konkreta insatser där utsläppen är störst.",
        fields: [
          withSpecificityTip(
            textArea(
              "transport-actions",
              "Transporter och mobilitet",
              "Cykel- och gångvägar, kollektivtrafik och laddinfrastruktur.",
            ),
          ),
          withSpecificityTip(
            textArea(
              "energy-actions",
              "Energi och bebyggelse",
              "Kommunens egna lokaler, lokal förnybar energi och klimatkrav vid nybyggnation.",
            ),
          ),
          withSpecificityTip(
            textArea(
              "food-actions",
              "Mat och konsumtion",
              "Matsvinn, klimatsmart mat i skola och omsorg, återbruk och delning.",
            ),
          ),
          withSpecificityTip(
            textArea(
              "nature-actions",
              "Natur och kolsänkor",
              "Träd, grönområden och biokol som binder koldioxid och tar hand om vatten.",
            ),
          ),
        ],
      },
      {
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
    sections: [
      {
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
        title: "Kvantitativa klimatnyckeltal",
        intro:
          "Fält märkta Klimatkollen är redan ifyllda. Övriga fylls i av kommunen.",
        groups: [
          {
            title: "Övergripande utsläpp",
            fields: [
              fromKlimatkollen("kpi-total", "Totala utsläpp", "tCO₂e"),
              emptyInput("kpi-per-capita", "Utsläpp per invånare", "tCO₂e"),
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
              emptyInput(
                "kpi-transport",
                "Transportsektorns utsläpp per invånare",
                "tCO₂e",
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
              fromKlimatkollen("kpi-ev-change", "Ökning av andel elbilar", "%"),
              fromKlimatkollen("kpi-charge-points", "Elbilar per laddpunkt"),
              fromKlimatkollen(
                "kpi-bike-paths",
                "Cykelvägsmeter per invånare",
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
              fromKlimatkollen("kpi-climate-plan", "Klimatplan"),
              fromKlimatkollen("kpi-procurement", "Klimatkrav i upphandlingar"),
            ],
          },
        ],
      },
      {
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
    sections: [
      {
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

type WizardStepKind = "municipality" | "emissions" | "fields" | "download";

export type WizardStep = {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  tip?: string;
  kind: WizardStepKind;
  fields: ClimatePlanField[];
  /** A single text area grows to fill the step. */
  grow?: boolean;
};

const INPUTS_PER_STEP = 4;

function chunkFields(
  fields: ClimatePlanField[],
  size: number,
): ClimatePlanField[][] {
  const chunks: ClimatePlanField[][] = [];
  for (let index = 0; index < fields.length; index += size) {
    chunks.push(fields.slice(index, index + size));
  }
  return chunks;
}

function pushFieldSteps(
  steps: WizardStep[],
  kicker: string,
  title: string,
  intro: string | undefined,
  fields: ClimatePlanField[],
) {
  const textAreas = fields.filter((field) => field.kind === "textarea");
  const inputs = fields.filter((field) => field.kind === "input");
  const checks = fields.filter((field) => field.kind === "checkbox");

  for (const [index, group] of chunkFields(inputs, INPUTS_PER_STEP).entries()) {
    const single = group.length === 1;
    steps.push({
      id: group[0].id,
      kicker,
      title: single
        ? group[0].label
        : index === 0
          ? title
          : `${title}, fortsättning`,
      intro: single ? group[0].hint : index === 0 ? intro : undefined,
      kind: "fields",
      fields: group,
    });
  }

  for (const field of textAreas) {
    steps.push({
      id: field.id,
      kicker,
      title: field.label,
      intro: field.hint,
      tip: field.tip,
      kind: "fields",
      fields: [field],
      grow: true,
    });
  }

  if (checks.length > 0) {
    steps.push({
      id: checks[0].id,
      kicker,
      title,
      intro,
      kind: "fields",
      fields: checks,
    });
  }
}

function buildWizardSteps(): WizardStep[] {
  const steps: WizardStep[] = [
    {
      id: "municipality",
      kicker: "Start",
      title: "Välj kommun",
      intro:
        "Sök eller välj i listan. Utsläppen hämtas från Klimatkollen för den kommun som valts.",
      kind: "municipality",
      fields: [],
    },
    {
      id: "emissions",
      kicker: "Nuläge",
      title: "Utsläpp i kommunen",
      intro:
        "Territoriella utsläpp och fördelning per sektor. Fylls i automatiskt.",
      kind: "emissions",
      fields: [],
    },
  ];

  for (const part of CLIMATE_PLAN_PARTS) {
    for (const section of part.sections) {
      const kicker = `${part.kicker} · ${section.title}`;
      if (section.fields) {
        pushFieldSteps(
          steps,
          kicker,
          section.title,
          section.intro,
          section.fields,
        );
      }
      section.groups?.forEach((group, index) => {
        pushFieldSteps(
          steps,
          kicker,
          group.title,
          index === 0 ? section.intro : undefined,
          group.fields,
        );
      });
    }
  }

  steps.push({
    id: "download",
    kicker: "Klar",
    title: "Ladda ner klimatplanen",
    intro:
      "Word-filen fylls med kommunens siffror och det som skrivits i fälten.",
    kind: "download",
    fields: [],
  });

  return steps;
}

export const CLIMATE_PLAN_STEPS = buildWizardSteps();

export function initialAnswers(): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const step of CLIMATE_PLAN_STEPS) {
    for (const field of step.fields) {
      if (field.kind !== "checkbox") answers[field.id] = "";
    }
  }
  return answers;
}

/** Klimatkollen values win when present. A missing value can still be typed. */
export function resolveClimatePlanAnswers(
  userAnswers: Record<string, string>,
  prefill: Record<string, string> | null,
): Record<string, string> {
  const resolved = { ...userAnswers };
  for (const step of CLIMATE_PLAN_STEPS) {
    for (const field of step.fields) {
      if (!field.fromKlimatkollen) continue;
      const filled = prefill?.[field.id]?.trim() ?? "";
      resolved[field.id] =
        filled || (prefill ? (userAnswers[field.id] ?? "") : "");
    }
  }
  return resolved;
}
