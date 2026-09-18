# P&P Kompendium

Et interaktivt **formelkompendium** til P&P. Vælg figurer og kendte størrelser, og få den relevante formel sat sammen. Du kan arbejde med symboler eller indsætte kendte tal med små enheds- og symbolmærker. Kompendiet viser formlen; resultatet beregner du selv.

## Brug det offline

Hent **index.html** direkte fra [seneste GitHub Release](https://github.com/KuwuNekoshi/P-P-Kompendium/releases/latest) under **Assets**, og åbn filen i din browser.

Du kan også hente hele projektet:

1. Vælg **Code → Download ZIP** her i GitHub, og pak mappen ud.
2. Dobbeltklik på **index.html** i mappens rod.
3. Vælg, hvad du vil finde, indsæt figurer, og tilpas formlens dele.

`index.html` indeholder hele kompendiet. Den kan også kopieres alene til en anden computer. Der kræves hverken installation, internet, login, en lokal server eller AI. Alle scripts og al styling er indlejret. Der bruges ingen CDN'er, eksterne skrifttyper, analyseværktøjer eller netværkskald.

**Gem opsætning** henter en `.pp.json`-fil med dine figurer og valg. Brug **Åbn opsætning** til at åbne den igen. Opsætningen huskes også lokalt i browseren, når browseren tillader det. Gem som fil, før du flytter til en anden computer eller rydder browserdata.

## Fra opgave til formel

**? øverst til højre** starter en guidet introduktion med 24 trin. Hvert trin fremhæver det relevante område og ruller det ind i visningen, også i tilpasningspanelet med egen scroll. Brug **Næste** / **Forrige**, piletasterne eller Enter på trinnets overskrift. **×** eller **Esc** afslutter når som helst. Via **Læs hjælpen som tekst** kan du åbne den samlede vejledning.

Introduktionen viser et midlertidigt bassin-eksempel og gennemgår figurer, fjernelse, beholderdele, indre/ydre diameter, åbne/lukkede flader, samlingsmenuen, 3D, rumfang/pladeareal, formelsamlingen, referencer, indsatte formler, formelkæden, omskrivning af formler, enheder, tal med små mærker og gem/åbn. Din egen opsætning gemmes ikke over: den gendannes sammen med din valgte visning og scrollposition, når guiden afsluttes. Guiden virker også på en tom opsætning og kræver ikke internet.

- Vælg, hvad du vil finde, fx fyldetid, volumenflow eller rumfang.
- Indsæt cylinder, kegle, halvkugle, keglestub, kasse, kugle, rør, **halvcylinder**, **V-bund** eller **pyramide**.
- Brug **Sammensæt** til at sætte figurer på hinandens ender. Vælg en eksisterende figur eller indsæt et nyt endestykke direkte.
- Vælg en figur, angiv **Indvendig diameter** eller **Udvendig diameter**, og sæt hver fri flade til **Åben** eller **Lukket**. Samleflader udelades automatisk fra pladearealet.
- Vælg ved hver størrelse: **kendt størrelse**, **indsæt en formel** eller **brug en reference**.
- Indtast eventuelt opgavens tal og vælg enheder under **Størrelserne i formlen**, og vælg **Resultatets enhed** nederst. Omregningerne sættes ind med de nødvendige parenteser.
- Skift mellem **Kort** og **Udfoldet**. Se hele sammenhængen under **Se formelkæden**, eller kopiér formlen som tekst.

En reference følger sin kilde. **Indsæt formlen her** indsætter en kopi af kildens aktuelle formel; eventuelle underreferencer i kopien bliver ved med at følge deres egne kilder.

**Virkelig effekt (Pvirk)** findes under **Pumper og tryk** og som **T30**. Formlen er `Pvirk = Pteo / η`, hvor `η` hedder eta og er virkningsgraden. Søg fx på `Pvirk`, `P_virk`, `eta`, `virkeevne` eller det tidligere navn **Tilført effekt**. Vælg **%** som inputenhed, hvis virkningsgraden er oplyst i procent.

Formlerne viser **kun nødvendige parenteser**, både i MathML-visningen, kopieret tekst og LaTeX. Fx bliver `((L · h) + (B · h))` til `L · h + B · h`, og `(D)^2` bliver til `D^2`. Skal hele summen ganges med 2, vises den som `2 · (L · h + B · h)`.

Regnerækkefølgen bestemmer, hvor parenteserne bevares: `a − (b + c)`, `a / (b · c)` og `(D − 2 · t)^2` beholder dem. En brøkstreg eller rodstreg afgrænser allerede sit indhold på skærmen og i LaTeX, så der vises ingen ekstra parenteser omkring hele tælleren, nævneren eller rodudtrykket. Den kopierede tekst bruger de parenteser, der er nødvendige ved lineær indtastning. Figursummer og enhedsomregninger beholder deres betydning, og gemte opsætninger ændres ikke.

### Sæt tal ind i formlen

Under **Størrelserne i formlen** har hver kendt størrelse et felt **Tal (valgfrit)**. Skriv fx B = 50 og L = 30. Formlen viser 50 med **m (B)** i mindre tekst og 30 med **m (L)** i mindre tekst. Mærkerne forklarer tallene; de skal ikke indtastes på lommeregneren. Resultatet beregnes ikke af kompendiet.

- Komma og punktum kan begge bruges til decimaltal, også med minus. Tallene bevares som tekst uden afrunding. Skriv ét decimaltal på højst 32 tegn; udtryk og tusindtalsseparatorer accepteres ikke.
- Et tomt felt viser det oprindelige symbol. **Ryd** fjerner et tal igen. Ufuldstændige eller ugyldige tal erstatter ikke symbolet.
- Enhedsmærket viser din valgte **inputenhed**, fx mm, %, t/m³ eller kg/h. Formlen indeholder de nødvendige omregninger. Hvis du skifter enhed, beholdes det indtastede tal, og omregningen tilpasses.
- Samme symbol og dimension deler tal og enhed i hele opsætningen. Udvidede referencer viser deres kendte tal. Beregnede referencer i **Kort** vises fortsat som mellemresultatets symbol.
- Tallene følger med i gemte opsætninger, omskrivninger og kopieret tekst. Eksisterende opsætninger uden tal kan stadig åbnes. Negative tal får nødvendige parenteser, og en potens afgrænses tydeligt fra tallets små mærker.
- Talindsættelse ændrer ikke den symbolske forenkling: B og L bevarer hver deres identitet, også hvis de har samme talværdi. TI-30-skønnet bruger tallets faktiske længde og udelader enheds- og symbolmærkerne.

### Værdier, enheder eller begge

Den tredelte knap **Værdier · Enheder · Begge** ved formelvisningen skifter mellem:

- **Værdier:** fx `30 · 50`. Størrelser uden indtastede tal vises som symboler.
- **Enheder:** fx `L · B`. De oprindelige symboler vises i stedet for tallene.
- **Begge:** fx `30 m (L) · 50 m (B)`, med enhed og symbol i mindre tekst.

Faste tal, potenser og nødvendige omregningsfaktorer bevares. Resultatets enhed står ved venstresiden i alle tre visninger. Visningsvalget ændrer ikke dine tal, enheder eller formler. Browseren husker valget; standarden er **Begge**.

Valget gælder også figursummer, formelkæden, tilpasningspanelet, delberegninger og **Kopiér formel**. I Værdier og Enheder kopieres selve formlen uden inputlisten. Begge tager også listen over tal og inputenheder med. TI-30-skønnet bruger de indtastede tal uanset visning. Formelsamlingens grundformler beholder deres almindelige symboler.

### Isolér en anden størrelse

Vælg en grundformel, og brug **Isolér en størrelse** over formelvisningen. Fx kan **v = π · D · n** omskrives til både **n = v / (π · D)** og **D = v / (π · n)**. v er båndhastighed; V bruges normalt til rumfang.

Valget opretter en **ny formel**. Dine øvrige kendte størrelser, indsatte formler og referencer følger med. Den hidtidige venstreside bliver et kendt input, så du fx kan angive v fra opgaven. Dens resultatenhed genbruges som inputenhed, medmindre samme symbol allerede har et inputenhedsvalg. Den nye ukendtes enhed følger dens tidligere input, når det er muligt. Kontrollér enhederne under formlen. Originalen og dens eksisterende referencer bevares.

Omskrivningerne kan selv omskrives igen, gemmes, kopieres og indsættes som delformler fra højre panel. Enhedsforkortning, parentesregler og TI-30XS-vejledning gælder også dem. Formelsamlingen viser fortsat grundformlerne, så den ikke fyldes med næsten ens kort.

**Alle 128 grundformler er gennemgået**, og alle deres input har enten en omskrivning eller en konkret forklaring. Der er **323 omskrivninger**. De omfatter produkter, brøker, differenser, kvadrat- og kubikrødder, flere forekomster af samme størrelse, blandinger og de sammensatte tankbundes arealer.

- Geometriske mål bruger den ikke-negative løsning. For hastighed fra kinetisk energi eller dynamisk trykhøjde kan begge fortegn vælges.
- Tid fra `s = v_start · t + (1/2) · a · t²` har to rodvalg. Vælg den tid, der passer til forløbet. Ved `a = 0` bruges `t = s / v_start`. Hvis også `v_start = 0`, kan tiden ikke bestemmes fra strækningen alene.
- Nævnere skal være forskellige fra 0; radikander skal give reelle rødder. Krav før kvadrering og særlige geometriske eller fysiske forudsætninger står ved omskrivningen. En kvadreret ligning kan ellers give en uvedkommende løsning.
- **Keglestubbens kappe med lodret højde:** isolering af D eller d giver en fjerdegradsligning. De to valg er markeret med en forklaring. Den nye **Keglestubskappe med skrå højde**, `A = (π / 2) · (D + d) · s`, kan isolere begge diametre, når s er kendt. Uden s må den oprindelige ligning løses; kompendiet udfører ikke numerisk ligningsløsning.

### Automatisk forenkling

Ens led samles automatisk, også i indsatte formler og referencer. Kassens fire sideflader vises som **2 · (L · h + B · h)**. Halvcylinderens krumme flade med to lukkede ender vises som **π/2 · D · L + π/4 · D²**. Med kun én lukket ende er endens faktor fortsat π/8.

Forenklingen genkender ens produkter, selv når faktorerne står i forskellig rækkefølge. Den samler deres talfaktorer med eksakte brøker, trækker fælles hele antal ud foran en sum og skriver gentagne faktorer som potenser. Reglerne bruges i både Kort, Udfoldet, kopieret tekst og LaTeX. Åbne flader og fælles samleflader fjernes, før arealleddene samles.

Nødvendige enhedsomregninger bevares, mens modgående faktorer forkortes automatisk. Figursummer bevarer opdelingen mellem figurerne, og forskellige referencer holdes adskilt, selv hvis deres visningssymbol er ens. Gemte opsætninger beholder de oprindelige formler og referencer; forenklingen følger automatisk ændringer i kilderne.

Med motorens omdrejningstal i **omdr./min**, tromlediameteren i **m** og båndhastigheden i **m/min** bliver formlen direkte **v = π · D · n**. Division med 60 og efterfølgende multiplikation med 60 forkortes væk. Vælges diameteren i **mm**, bevares den nødvendige længdefaktor: **v = (π · D · n) / 1000**. Vælges resultatet i **m/s**, skal tidsfaktoren fortsat med.

Forkortningen bruger eksakte enhedsfaktorer i produkter, brøker og faste potenser. Den kan også følge fælles faktorer gennem en hel sum eller forskel og eksakte kvadratrødder. Forskellige faktorer i separate sumled forkortes ikke imod hinanden. Temperaturforskydninger som **+273,15** holdes adskilt fra multiplikationsfaktorer. Fx giver liter divideret med liter/min direkte minutter, uden en omvej gennem m³ og sekunder i den viste slutformel.

Brug tallene direkte i de valgte inputenheder. Omregningerne under enhedsvalgene er mærket **SI-reference**; de skal ikke udføres oven i den viste formel. Nødvendige restfaktorer kan stå samlet ét sted. TI-30XS-skønnet og kopierede formler bruger det forkortede udtryk. Forslag til delberegninger bevarer de enkelte mellemresultaters enheder og forkorter hvert trin for sig.

### Lange formler på TI-30XS

Under den aktive formel vises et **vejledende længdeskøn** for indtastning på TI-30XS MultiView. TI angiver op til **80 tegn** i indtastningslinjen ([TI, løsning 15401](https://education.ti.com/en/customer-support/knowledge-base/scientific-elem-calculators/general-information/15401)). Andre TI-30-modeller kan have andre grænser.

Skønnet tæller **de indtastede tals faktiske længde** og regner med **4–8 tegn for hvert endnu ukendt tal**, for hver forekomst. Operatorer, nødvendige parenteser og enhedsomregninger indgår; symbolnavne og enhedslabels gør ikke. Skønnet tæller kun parenteser, som selve regnestykket behøver; eventuelle ekstra parenteser omkring små forklarende mærker udelades. Det tager udgangspunkt i lineær indtastning med division. Decimaler, minustegn, lange tal, skabeloner og tastemetode påvirker pladsen, så det er ingen garanti for, at formlen passer. Fra et øvre skøn på 72 tegn anbefales delberegninger, så der er lidt plads op til grænsen. Det er kompendiets vejledende tærskel, ikke en ekstra TI-grænse.

**Forslag: mellemresultater og en kort slutformel** viser de konkrete trin i rækkefølge. Fx beregnes `V_1` og `V_2` hver for sig, og bagefter bruges `V_1 + V_2`. Hvis slutresultatet ønskes i liter, bliver sluttrinnet `(V_1 + V_2) · 1000`, når delvolumenerne er i m³. Store delformler deles videre efter behov. Et rent mellemudtryk får et ledigt navn som `M_1`; dets værdi bruges direkte i det efterfølgende trin. Forslaget ændrer ikke opsætningen.

Vurderingen følger **Kort/Udfoldet**, valgte enheder, referencer, figurer og åbne/lukkede flader. I Kort forudsættes referencernes værdier allerede beregnet. Deltrinene bevarer nødvendige parenteser, omregninger og rækkefølgen i subtraktion og division. Hvis et trin stadig er langt, står det ved forslaget. Afrund først til sidst.

Der gives også besked ved mere end fire indlejrede brøker, rødder eller potenser, som kan ramme [MathPrint-grænsen på fire niveauer](https://education.ti.com/html/eguides/scientifics/TI-30XS-MultiView/EN/Content/EG_30XSMV/M_GetStart/GS_Home.HTML). TI-30XS har [syv hukommelsesvariable](https://education.ti.com/html/eguides/scientifics/TI-30XS-MultiView/EN/Content/EG_30XSMV/M_GetStart/GS_MemVar.HTML): x, y, z, t, a, b og c. De kan bruges til mellemresultater; genbrug først en variabel, når dens tidligere værdi er færdigbrugt. Hele vejledningen fungerer offline; kun kildehenvisningerne kræver internet.

### Input- og resultatenheder

Hver kendt størrelse har et enhedsvalg, fx **mm → m**, **L/min → m³/s** eller **% → tal**. Indtast eventuelt tallet fra opgaven i feltet ved symbolet. Omregningsfaktorerne er allerede med i formlen; selve resultatet beregner du på lommeregneren.

Brøkenheder har **to uafhængige dropdowns** for tæller og nævner. Vælg fx **t (ton) / m³**, **kg / h**, **mg / min** eller **mL / h**, både for input og resultat. Skifter du tælleren, bevares nævneren, og omvendt. Alle kombinationer af de relevante enheder er tilgængelige; masseflow kombinerer masse og tid, mens densitet kombinerer masse og rumfang.

Hastighed, acceleration, volumenflow, masseflow, densitet, omdrejningstal, antal pr. længde, specifik energi og specifik varmekapacitet bruger de delte valg. Acceleration beholder kvadreret tid i nævneren. Varmekapacitet viser nævneren som en samlet gruppe, fx **(kg·K)** eller **(g·°C)**. Tidligere gemte enhedsvalg genåbnes med de tilsvarende dele og samme omregningsfaktor.

**Resultatets enhed** omregner hele det færdige udtryk, fx fra m³ til liter, sekunder til minutter, kg til ton eller W til kW. Den valgte enhed står ved formelresultatet. Eksempel med diameter i mm, indvendig højde i cm og rumfang i liter:

```text
V [L] = π / 4 · D² · h / 100000
```

- En længde i mm divideres med 1000, et areal i mm² med 1.000.000 og et rumfang i mm³ med 1.000.000.000. Diameterens omregningsfaktor kvadreres sammen med diameteren; efter forkortning kan faktoren stå samlet uden for potensen.
- Flow og sammensatte enheder får både volumen-/massefaktoren og tidsfaktoren. Fx omregnes L/min til m³/s med division med 60.000.
- Absolutte temperaturer i °C får tillæg af 273,15 til K. Resultater i °C får det modsatte fradrag. **Temperaturforskelle** i °C og K har samme tal og får intet tillæg.
- Samme symbol og dimension har samme inputenhed i hele opsætningen. Hver gemt formel har sin egen resultatenhed. Ændringer åbner automatisk den udfoldede visning.
- En beregnet reference har en konsekvent grundværdi i SI. Resultatenheden ændrer dens visning, uden at omregningen gentages i en udfoldet kæde. I **Kort** vises en reference i sin kildes valgte resultatenhed og omregnes tilbage, hvor den indsættes. Kædens delformler og figurernes oversigter angiver deres grundenhed.
- **Kopiér formel** tager indtastede tal, symbolmærker, parenteser, omregninger, resultatenhed og en liste over størrelser og enheder med. Gemte opsætninger bevarer valgene; version 2–4 åbnes med de hidtidige SI-enheder i version 5.

### Indvendig eller udvendig diameter

Vælg figuren og brug **Den oplyste diameter er**. Valget gælder cylinder, rør, kugle, halvkugle, halvcylinder, kegle og keglestub; på keglestubben gælder det både den store og den lille diameter.

```text
D_indre = (D_ydre − (2 · t_radial))
D_ydre  = (D_indre + (2 · t_radial))
```

Rumfang, flowtværsnit og pladeareal i T9 bruger **indvendige mål**. Med en oplyst udvendig diameter indsættes omregningen automatisk, inklusive parenteser under fx `D²`. Højde og længde skal oplyses indvendigt; diametervalget ændrer ikke deres betydning. Den udvendige diameter skal være større end to gange den radiale godstykkelse.

På cylinder, rør og kugledele bruger **Godstykkelse til omregning** som standard samme fælles pladetykkelse som T9. **Tilpas fælles pladetykkelse · T9** ændrer denne kilde ét sted. Et rør kan få sin egen tykkelse, og hvis en beholderdel får anden pladetykkelse, skal dens delmasse beregnes med samme tykkelse.

På kegle og keglestub bruges et separat **Radial godstykkelse**-felt: afstanden i diameterretningen ved samme endeflade. Den er forskellig fra tykkelsen vinkelret på en skrå plade. Ved kendt væghældning kan formlen `t_radial = (t_plade · s) / h` vælges. Her skal skrå længde `s` og aksial højde `h` beskrive samme væghældning. Der gættes ikke på denne hældning ud fra en diameter, som omregningen selv skal finde.

Samlinger deler den **indvendige diameter**. En figur med udvendigt mål kan derfor samles med en figur med indvendigt mål. Omregningen foretages én gang på kildens diameter; hver del viser derefter den valgte indre eller ydre diameter. **Skil ad** gendanner delens egne diametermål og tykkelsesvalg.

Gamle opsætninger åbnes med indvendige diametre, som før. Hvis en gammel opsætning har én T9-formel, genbruges dens tykkelsesformel som fælles pladetykkelse.

### Tankens egenvægt · T9

Find **Tankens egenvægt** i formelsamlingen ved at søge på **T9**, eller vælg den via **Tilføj formel**:

```text
m_tank = (A_cylinder + A_endestykke + …) · t_plade · ρ_mat
```

Pladearealet følger de valgte beholderdele. Åbne flader og fælles samleflader bidrager ikke med materiale. Lukker du en fri ende, kommer dens pladeareal automatisk med. Indløbsrør, der er fravalgt som beholderdele, tælles ikke med.

Vælg **pladetykkelse** og **materialets massefylde** som kendte symboler, formler eller referencer. `t_plade` er en længde, ikke tid. Grundformlen bruger areal i m², tykkelse i m og massefylde i kg/m³ og giver kg. Vælg fx **mm** for tykkelsen, **ton/m³** for massefylden og **ton** som resultatenhed; nødvendige omregninger indsættes, og modgående faktorer forkortes automatisk.

T9 er skolens plademodel `m = A · t · ρ` (side 3 og 10). Den bruger ens materiale og tykkelse. For krumme flader med indvendige mål er materialerumfanget en tilnærmelse for tynd plade. Ben, studs, svejsninger og andet ekstraudstyr er ikke med. Ved forskelligt materiale eller forskellig tykkelse kan du vælge hver figurs areal i sin egen T9-formel og bruge **Sum af masser**.

**Tank med indhold** bruger `m_total = m_tank + ρ_væske · V_væske`. Den kan referere til egenvægtsformlen, men væskens massefylde og faktiske volumen vælges separat. Det fulde tankrumfang antages ikke automatisk. **Tyngdekraft** giver i stedet kraften i newton med `F = m · g`.

### Skolens formelsamling

Kataloget er afstemt mod **EUC-Nordvestsjælland, Processkolen i Kalundborg: Formelsamling · Industri- og procesoperatøruddannelsen · P&P**, dateret 14-02-2017 (13 sider).

- **T1–T39** kan findes direkte i søgefeltet under **Formelsamling**. Kortene viser side- og T-henvisninger; flere formler er omskrivninger af samme grundformel.
- Geometri, plademateriale, bevægelse, kræfter, energi, pumpeløftehøjde, gearing, transportbånd, kopelevator, snegl, redler og varmelære indgår.
- **Enheder og omregninger** forklarer bl.a. kg/ton, m³/s/m³/h, omdr./s/omdr./min, J/kJ og W/kW.
- Katalogets referencer bruger konsekvente SI-enheder. Skolens faktorer `k` og `60` er omregningsfaktorer og skal ikke tilføjes igen i SI-formlerne. Varmelærens kJ og kW er forklaret ved de enkelte formler.
- Temperaturforskelle holdes adskilt fra temperaturer. T13's masse gange arm i kg·m holdes adskilt fra drejningsmoment i N·m. Kassens kappe på side 3 omfatter kun fire sider; åben eller lukket kasse har separate formler.

Den indsendte PDF er brugt som reference; selve PDF-filen distribueres ikke i projektet.

### Rundbund, V-bund og pyramide under en kasse

Vælg **Sammensæt → Kasse → Bund → Ny halvcylinder / Ny v-bund / Ny pyramide → Sæt sammen**. Du kan også forbinde en bundfigur, som allerede er indsat. Samlefladen er rektangulær. Begge dimensioner deles: L følger kassens længde, og B følger kassens bredde. På halvcylinderen er D = kassens indvendige bredde. Det virker i begge forbindelsesretninger, også når halvcylinderen bruger en udvendig diameter med godstykkelse.

| Bundfigur | Udformning | Rumfang | Pladeareal uden den rektangulære snitflade |
| --- | --- | --- | --- |
| Halvcylinder | Cylinder skåret på langs; to flade halvcirkelender. Dybde D/2. | (π/8) · D² · L | ((π/2) · D · L) + ((π/4) · D²) |
| V-bund | Symmetrisk trekantet prisme; to trekantsender og to skrå plader. | (L · B · h)/2 | (2 · L · √(h² + (B/2)²)) + (B · h) |
| Pyramide | Fire trekantede sider mødes i én spids lodret under centrum. | (L · B · h)/3 | (L · √(h² + (B/2)²)) + (B · √(h² + (L/2)²)) |

Her er L længde og B bredde, mens **h er bundfigurens lodrette dybde under kassen**, ikke den skrå sidelængde. Tabellen forudsætter lukkede ender og sideflader. I figurens indstillinger kan hver plan flade åbnes eller lukkes separat. Halvcylinderens ene endeflade har arealet (π/8) · D²; V-bundens ene trekantsende har arealet (B · h)/2. En fri, lukket snitflade tilføjer L · D eller L · B.

Når bundfiguren er sat på kassen, fjernes både kassens bundplade og bundfigurens snitflade fra pladearealet. Rumfangene lægges sammen, og T9 kan bruge det samlede pladeareal til tankens egenvægt. Åbne flader ændrer ikke det geometriske rumfang. Løsnes samlingen, gendannes figurernes egne mål og fladevalg.

### Betjen 3D-visningen

**3D** viser figurerne samlet ende mod ende. Træk med musen eller en finger for at dreje; brug musehjulet eller knapperne **+ / −** til zoom. Piletasterne drejer også visningen, når den har fokus, og **R** nulstiller vinklen. Åbne flader vises uden låg. **Skitse** viser et klikbart snit med navne og fladernes status.

Begge visninger er skematiske og uden målestok. Der indtastes stadig ingen tal. 3D-visningen følger figurernes typer, samlinger og fladevalg, og hele visningen virker offline uden eksterne biblioteker.

For en cylinder med kuglespids: vælg **Sammensæt → Cylinder → Bund → Ny halvkugle → Sæt sammen**. En halvkugle har højde `D/2`, rumfang `πD³/12` og krumt areal `πD²/2`. Dens plane cirkel og cylinderens tilstødende endeflade tælles ikke med, når de er sammenføjet. Lukning af cylinderens frie ende lægger én cirkelflade til det ydre areal.

Samlinger forbinder hele, passende endeflader: cirkel med cirkel eller rektangel med rektangel. Den første figur leverer de fælles indvendige mål. Samlede dele følges ad i beholderens sum. Under visningen findes formlerne for samlet rumfang og pladeareal med **Brug formel**.

**Skil ad** løsner en samling og gendanner figurernes egne mål og fladevalg. **Fjern** under hvert figurkort sletter figuren og løsner dens samlinger. Direkte formelreferencer til en slettet kilde vises som fejl, så du kan vælge en ny kilde.

Gemte opsætninger fra den tidligere udgave kan stadig åbnes. Deres fladevalg og referencer bevares; fysiske samlinger kan tilføjes med **Sammensæt**.

### Bassin med keglebund

Eksemplet åbner med tre sammenkædede formler:

```text
t = V_fyld / Q_v
V_fyld = V_cylinder + V_keglebund
Q_v = A_rør · v
```

Ved fuld udfoldning bliver formlen:

```text
t = [(π/4) · D₁² · h₁ + (1/3) · (π/4) · D₁² · h₂]
    / [(π/4) · D₃² · v]
```

Keglebunden deler diameter med cylinderen. Røret leverer tværsnitsarealet til flowformlen og indgår ikke i beholderens rumfang. Kendes flowet allerede, vælger du **Kendt størrelse · Qv** ved flowet; så forsvinder rørdiameter og hastighed fra den udfoldede formel.

Der er 128 grundformler, 323 omskrivninger og 10 figurer. Hver formel har relevante symbolforklaringer og enheder. Udseendet er inspireret af Teslas enkle grænseflader og har lys og mørk visning.

## Forudsætninger

- Fyldetid bruger konstant, positivt nettoflow. Brug restvolumen ved et delvist fyldt bassin og nettoflow ved samtidig ind- og udstrømning.
- Summer af rumfang forudsætter, at beholderdelene ikke overlapper.
- Overfladearealer omfatter krumme kapper og de valgte lukkede flader. Fælles endeflader i en samling fjernes automatisk. Det åbne bassin-eksempel bruger cylinderkappe og keglekappe.
- Rumfang og pladeareal bruger indvendige mål; en oplyst udvendig diameter omregnes med godstykkelsen. T9 er fortsat skolens tilnærmelse med tynde plader og indvendigt areal, ikke et eksakt rumfang af alle tankvægge og samlinger. Et åbent/lukket valg ændrer arealet, men ikke det geometriske rumfang. Visningen er skematisk og viser ingen målestok, vægtykkelse eller væskeniveau.
- Kompendiet indsætter delformler og samler ens led, talfaktorer og gentagne faktorer automatisk. Isolér en størrelse omskriver en valgt grundformel og bevarer de øvrige input. Det er ikke en numerisk ligningsløser for vilkårlige figursummer eller hele kæder på én gang. Eventuelle rodvalg, nulnævnere og ekstra forudsætninger skal respekteres.
- Referencer af forkert størrelse afvises. Cirkler og manglende kilder vises som fejl. Ens dimension garanterer ikke, at et valg passer til opgavens fysiske forudsætninger.

## Udvikling

Ingen pakker skal installeres. Node.js 18 eller nyere bruges kun ved udvikling:

```bash
npm run build
npm test
npm run check
```

- `dist/catalog.js`: formeldefinitioner, symbolske skabeloner, figurer og forklaringer.
- `dist/units.js`: enheder, eksakte omregningsfaktorer og symbolske temperaturforskydninger.
- `dist/rearrange.js`: symbolske omskrivninger, rodvalg, geometriske specialtilfælde og fuld dækningsoversigt over grundformlernes størrelser.
- `dist/engine.js`: referencegraf, substitution, omskrivning med bevarede enheder og input, MathML, tekstformat, LaTeX og validering.
- `dist/calculator-guide.js`: vejledende TI-30XS-længdeskøn og symbolske delberegninger.
- `dist/geometry.js`: placering af sammenføjede figurer og klikbare snitskitser.
- `dist/solid-preview.js`: 3D-geometri, perspektiv, lys samt rotation og zoom på canvas.
- `dist/tour.js`: guidet introduktion med fremhævning, placering, scroll og tastaturnavigation.
- `dist/app.js`: dansk grænseflade, figurvalg, temaskift og lokale opsætninger.
- `dist/styles.css`: responsivt design og begge temaer.
- `dist/index.html`: indgangspunkt for kildefilerne; kan også åbnes direkte lokalt.
- `index.html`: genereret, selvstændig offlineudgave. Byg igen efter ændringer i `dist/`.

Formlernes skabeloner består af faste matematiske operationer. Der bruges hverken `eval`, dynamisk kodegenerering eller en tjeneste til at behandle opsætninger. MathML vises af browseren.

Testene dækker også indre/ydre diametre, blandede diametervalg i samlinger, fælles og separate tykkelser, radiale mål på skrå vægge, sammenhængen med T9 og migrering af gamle opsætninger. Enhedstestene kontrollerer potenser, sammensat flow, input- og resultatomregning, referencer mellem forskellige resultatenheder, procent, temperaturforskelle og absolut temperatur. Kontroller af parenteser, skoleformler, samlinger og 3D-geometri er bevaret. Filkontrollen verificerer den selvstændige HTML-fil, script-rækkefølge og offlinekrav.

Alle 323 omskrivninger testes med to sæt kendte værdier og indsættelse tilbage i grundformlen. Testene kontrollerer desuden dimensioner, kvadratiske specialtilfælde, rødder, gem/åbn, referencer, minutter, procent og temperaturforskydninger.

Talindsættelse kontrolleres på alle 128 grundformler og 323 omskrivninger. Testene dækker decimalnotation uden afrunding, små mærker, delvist udfyldte formler, nul, negative tal, enheder, referencer, gem/åbn og TI-30-længdeskøn med de faktiske tal.

Eksempelopgaver kan bruges til at udvide kataloget med flere relevante formler og opsætninger.

### Udgivelser

GitHub-workflowen **Udgiv offline-kompendium** kører ved ændringer i `package.json` på `main` og kan også startes manuelt. Den kører testene, bygger offlinefilen og kontrollerer, at den matcher den indcheckede `index.html`. Versionsnummeret i `package.json` og den tilsvarende tekst i `releases/vX.Y.Z.md` bruges til en GitHub Release med `index.html` som asset. Udgivelsen peger på det præcise commit; allerede udgivne versioner ændres ikke.
