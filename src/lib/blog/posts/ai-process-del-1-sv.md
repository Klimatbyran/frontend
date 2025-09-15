---
id: "ai-process-del-1"
---

## Vad är problemet med klimatdata?

Inom EU finns det numera lagstiftning (CSRD) för hur företag måste rapportera sina utsläpp, helst enligt GHG-protokollet. Dessa ska rapporteras inom tre olika så kallade scopes. Scope 1 är alla direkta utsläpp från källor som företaget äger eller kontrollerar – det handlar om utsläpp från egna fabriker och fordon. Scope 2 är inköpt energi som el och värme, som kan rapporteras i antingen marknadsbaserad redovisning (där tex solceller minskar utsläppen) eller platsbaserad (där man bara tittar på KWh och tar ett genomsnitt av utsläppen baserad på den platsen per KWh).

Scope 3 är därmed den del som egentligen är mest intressant, då de flesta företag i Sverige har inte sina största utsläpp i sin egen verksamhet. Scope 3 inkluderar alla övriga indirekta utsläpp i företagets värdekedja, dessa delas in i 15 olika kategorier. Volvo tillverkar bilar men köper produkter från underleverantörer som i sin tur har genererat utsläpp. Volvo säljer dessutom bilar som när de köps genererar utsläpp när de används. Men det handlar också om saker som tjänsteresor, anställdas pendling och avfallshantering. Allt detta samlas i vad som kallas Scope 3.

## Det dubbla bokföringsproblemet

Den snabbtänkta räknar snabbt ut att det här även innebär att vissa siffror räknas dubbelt. Volvos underleverantörers utsläpp ingår ju i deras egna scope 1 och i Volvos scope 3. Och deras användning av el räknas även in i Vattenfalls nedströms utsläpp. Detta överlappande ansvar är faktiskt en medveten del av systemet och ska skapa incitament för företag att samarbeta genom hela värdekedjan för att minska utsläppen.

För att göra saken ännu mer komplicerad så inkluderar ju även Sveriges företags utsläpp andra länders utsläpp. När en bankdirektör flyger till USA, inkluderar bankens scope 3 även amerikanska företags utsläpp.

## Från problem till lösning

Hur sammanställer man detta på ett rättvisande sätt?
Ja ni ser hur svårt det blir om man vill skapa någon form av underlag för insyn i hur det går. Men att något är svårt betyder inte att det är omöjligt. Låt oss bryta upp problemet lite i sina beståndsdelar och arbeta iterativt.

## Datainsamlingens utmaning

Hämta företagens redovisade utsläpp – först och främst behöver man hämta alla företags utsläpp. Det borde ju vara enkelt. Det finns ju regler för hur dessa utsläpp ska redovisas berättade jag ju precis.

Problemet är att det inte finns ett samlat ställe där alla företagens utsläpp är registrerade. Eller ja det finns men inget som är gratis för allmänheten att söka i.

Vi började vårt uppdrag med att bygga en sådan databas. Det bör väl inte vara svårare än att hämta utsläppsrapporterna och samla företag + utsläpp i en databas och sen erbjuda en sökmotor?

## Verkligheten bakom rapporterna

Nu kommer vi till problemet att företag som släpper ut mycket koldioxid ofta inte vill redovisa sina utsläpp. Speciellt inte om siffrorna ska stå bredvid deras övriga finansiella information och forma köpbeslutet på börsen.

Men det är ju lag (från och med i år) på att redovisa sina utsläpp? Ja och därför ser deras redovisning ut så här: [vackra bilder på solceller och svanen loggor] man vill helst beskriva de initiativ man har men inte summera hur mycket utsläpp det faktiskt innebär.

## AI som verktyg för transparens

2024 är det inga problem att ta en PDF och skicka till ChatGPT och sen ställa några frågor om utsläpp så får AI hjälpa oss filtrera bort alla fina bilder och grandiosa ord.

Nu ett år senare har vi lyckats lösa de flesta problem med att tolka PDF:erna och har nu en hel pipeline av AI-frågor som ställs i rätt ordning för att hämta ut alla siffror i ett jämförbart format.

![image](https://github.com/user-attachments/assets/81f9f1c9-2ad6-41fb-bab8-5dca1e6799de)

Jag kommer i senare inlägg förklara mer ingående vilka typer av problem vi haft och hur vi har löst dessa. Men nu kan vi tänka att ovanstående process tar en PDF och spottar ur sig allt från årsomsättning, utsläpp i alla olika scope, antal anställda, industrikoder, letar reda på rätt sida för företaget och hämtar övrig fakta från Wikipedia och sedan sparar resultatet i vårt API.

Så här blir resultatet:

![image](https://github.com/user-attachments/assets/acaf8446-12f7-4e28-b1d9-76d1c820660b)

## Nästa fas: Jämförelse och visualisering

Om vi tänker oss ett företag som har redovisat siffror 2023 men inte 2022 - däremot har de redovisat scope 1 för 2019 som är deras sk basår. Ska vi då gissa oss till utsläppen för år 2021 och 2022?

Kan man säga att företaget ökat sina utsläpp när man bara har blivit bättre på att redovisa fler kategorier?

Finns det något rättvist format att visa förändring överhuvudtaget?

Vi tror att lösningen på dessa frågor är att göra visualiseringen till en mer interaktiv upplevelse för besökaren. Om man har en klurig fråga så ska man kunna få besked baserat på den fakta vi har samlat ihop.

Därför påbörjar vi just nu en AI-baserad datastudio kring klimatdata. Vårt mål är att du ska kunna ställa vilka frågor som helst om Sveriges utsläpp – både från kommuner och företag och få svar som är faktabaserade – med enkla grafer som förklarar vad som pågår.

## Var med och bidra

Om du tycker det här verkar som ett meningsfullt och viktigt projekt så är vi glada för all hjälp vi kan få. Klimatkollen är en ideell satsning och vi har fått finansiering från Google att fortsätta utforska dessa frågor under 2025. Vi har en Discordserver där vi hjälps åt att bygga – och all källkod ligger på GitHub där vi gärna tar emot PR:s eller issues.

Just nu behöver vi hjälp av:

- designers/UX specialister för att fundera ut bästa gränssnittet
- Prompt engineers för att förbättra våra frågor
- Frontendutvecklare- React eller Svelte - vi bygger våra komponenter som byggblock med hjälp av Shadcn/ui och vi behöver massor av hjälp
- Backendutvecklare- vår pipeline körs i Kubernetes och kommer behöva skalas upp en hel del- dessutom behöver vi en mer trygg CI/CD pipeline som också verifierar grundläggande funktionalitet = tester. Vi har redan en GitOps pipeline som bygger all kod och rullar ut i klustret automatiskt.

Hör av dig till hej@klimatkollen.se eller joina vår Discord [här](https://discord.com/channels/1049333222309371965/1049333222309371967).

I nästa inlägg ska vi dyka djupare in i hur vi använder AI för att tolka företagens rapporter och vilka utmaningar vi stött på längs vägen, exempelvis hur man får ett AI att förstå skillnaden mellan en fotnot (2) och en tabell i en PDF.
