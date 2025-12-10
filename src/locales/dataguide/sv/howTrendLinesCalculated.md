# Hur vi beräknar trendlina

Trendlina visar hur utsläppen sannolikt kan utvecklas framåt om aktören fortsätter i samma mönster som de senaste åren. Det är ingen prognos över planerade åtgärder, utan en enkel statistisk uppskattning baserad på historiska data.

**Vi använder en metod som heter Least Absolute Deviations (LAD)**

För att beräkna trendlina använder vi en statistisk metod som kallas **Least Absolute Deviations (LAD)**.  
Metoden drar en rak linje genom de historiska utsläppsvärdena genom att hitta den linje som minimerar det sammanlagda avståndet till datapunkterna.

Till skillnad från en procentbaserad trend ger LAD en **linjär förändring i ton per år**, inte en procentuell förändring.

LAD väljs eftersom den är:
- **robust** mot extremvärden,
- **enkel och transparent**, och  
- ger en tydlig trend även när data varierar mycket

**Varför linjen är rak**
Eftersom LAD skapar en **rak linje** antar modellen att utsläppen förändras med **samma antal ton varje år**.  
Till exempel kan modellen visa en minskning på –1 500 ton per år.

Det betyder också att den **procentuella förändringen** varierar över tid:
- samma ton-minskning är en liten procent när utsläppen är höga  
- och en stor procent när utsläppen är låga

Det är därför trendlina **inte** visar en fast årlig procentminskning, utan en konsekvent årlig förändring i ton.