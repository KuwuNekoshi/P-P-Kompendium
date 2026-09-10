# P&P Kompendium

Et interaktivt **formelkompendium** til P&P. Vælg figurer og kendte størrelser, og få den relevante formel sat sammen. Kompendiet arbejder med symboler; det har ingen talindtastning eller numerisk beregning.

## Brug det offline

1. Vælg **Code → Download ZIP** her i GitHub, og pak mappen ud.
2. Dobbeltklik på **index.html** i mappens rod.
3. Vælg, hvad du vil finde, indsæt figurer, og tilpas formlens dele.

`index.html` indeholder hele kompendiet. Den kan også kopieres alene til en anden computer. Der kræves hverken installation, internet, login, en lokal server eller AI. Alle scripts og al styling er indlejret. Der bruges ingen CDN'er, eksterne skrifttyper, analyseværktøjer eller netværkskald.

**Gem opsætning** henter en `.pp.json`-fil med dine figurer og valg. Brug **Åbn opsætning** til at åbne den igen. Opsætningen huskes også lokalt i browseren, når browseren tillader det. Gem som fil, før du flytter til en anden computer eller rydder browserdata.

## Fra opgave til formel

- Vælg, hvad du vil finde, fx fyldetid, volumenflow eller rumfang.
- Indsæt cylinder, kegle, **halvkugle**, keglestub, kasse, kugle eller rør.
- Brug **Sammensæt** til at sætte figurer på hinandens ender. Vælg en eksisterende figur eller indsæt et nyt endestykke direkte.
- Vælg en figur, angiv **Indvendig diameter** eller **Udvendig diameter**, og sæt hver fri flade til **Åben** eller **Lukket**. Samleflader udelades automatisk fra pladearealet.
- Vælg ved hver størrelse: **kendt størrelse**, **indsæt en formel** eller **brug en reference**.
- Vælg opgavens enheder under **Størrelserne i formlen**, og vælg **Resultatets enhed** nederst. Omregningerne sættes ind i formlen med parenteser.
- Skift mellem **Kort** og **Udfoldet**. Se hele sammenhængen under **Se formelkæden**, eller kopiér formlen som tekst.

En reference følger sin kilde. **Indsæt formlen her** indsætter en kopi af kildens aktuelle formel; eventuelle underreferencer i kopien bliver ved med at følge deres egne kilder.

**Virkelig effekt (Pvirk)** findes under **Pumper og tryk** og som **T30**. Formlen er `Pvirk = Pteo / η`, hvor `η` hedder eta og er virkningsgraden. Søg fx på `Pvirk`, `P_virk`, `eta`, `virkeevne` eller det tidligere navn **Tilført effekt**. Vælg **%** som inputenhed, hvis virkningsgraden er oplyst i procent.

Indsatte delformler og figursummer får **tydelige parenteser**, både i MathML-visningen, kopieret tekst og LaTeX. Fx ganges hele summen af tankens pladearealer med pladetykkelse og massefylde. Nævnere, subtraherede summer og udtryk under potenser grupperes også.

### Input- og resultatenheder

Hver kendt størrelse har et enhedsvalg, fx **mm → m**, **L/min → m³/s** eller **% → tal**. Brug derefter tallet fra opgaven direkte som det viste symbol. Omregningsfaktorerne er allerede med i formlen; der er fortsat ingen talindtastning eller numerisk resultatberegning i kompendiet.

Brøkenheder har **to uafhængige dropdowns** for tæller og nævner. Vælg fx **t (ton) / m³**, **kg / h**, **mg / min** eller **mL / h**, både for input og resultat. Skifter du tælleren, bevares nævneren, og omvendt. Alle kombinationer af de relevante enheder er tilgængelige; masseflow kombinerer masse og tid, mens densitet kombinerer masse og rumfang.

Hastighed, acceleration, volumenflow, masseflow, densitet, omdrejningstal, antal pr. længde, specifik energi og specifik varmekapacitet bruger de delte valg. Acceleration beholder kvadreret tid i nævneren. Varmekapacitet viser nævneren som en samlet gruppe, fx **(kg·K)** eller **(g·°C)**. Tidligere gemte enhedsvalg genåbnes med de tilsvarende dele og samme omregningsfaktor.

**Resultatets enhed** omregner hele det færdige udtryk, fx fra m³ til liter, sekunder til minutter, kg til ton eller W til kW. Den valgte enhed står ved formelresultatet. Eksempel med diameter i mm, indvendig højde i cm og rumfang i liter:

```text
V [L] = ((π / 4) · (D / 1000)² · (h / 100)) · 1000
```

- En længde i mm divideres med 1000, et areal i mm² med 1.000.000 og et rumfang i mm³ med 1.000.000.000. En diameter omregnes før kvadrering.
- Flow og sammensatte enheder får både volumen-/massefaktoren og tidsfaktoren. Fx omregnes L/min til m³/s med division med 60.000.
- Absolutte temperaturer i °C får tillæg af 273,15 til K. Resultater i °C får det modsatte fradrag. **Temperaturforskelle** i °C og K har samme tal og får intet tillæg.
- Samme symbol og dimension har samme inputenhed i hele opsætningen. Hver gemt formel har sin egen resultatenhed. Ændringer åbner automatisk den udfoldede visning.
- En beregnet reference har en konsekvent grundværdi i SI. Resultatenheden ændrer dens visning, uden at omregningen gentages i en udfoldet kæde. I **Kort** vises en reference i sin kildes valgte resultatenhed og omregnes tilbage, hvor den indsættes. Kædens delformler og figurernes oversigter angiver deres grundenhed.
- **Kopiér formel** tager parenteser, omregninger, resultatenhed og en liste over inputenheder med. Gemte opsætninger bevarer valgene; version 2–4 åbnes med de hidtidige SI-enheder i version 5.

### Indvendig eller udvendig diameter

Vælg figuren og brug **Den oplyste diameter er**. Valget gælder cylinder, rør, kugle, halvkugle, kegle og keglestub; på keglestubben gælder det både den store og den lille diameter.

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

Vælg **pladetykkelse** og **materialets massefylde** som kendte symboler, formler eller referencer. `t_plade` er en længde, ikke tid. Grundformlen bruger areal i m², tykkelse i m og massefylde i kg/m³ og giver kg. Vælg fx **mm** for tykkelsen, **ton/m³** for massefylden og **ton** som resultatenhed; alle tre omregninger indsættes automatisk.

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

### Visuelle samlinger i 3D

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

Der er 114 valgbare formler. Hver formel har relevante symbolforklaringer og enheder. Udseendet er inspireret af Teslas enkle grænseflader og har lys og mørk visning.

## Forudsætninger

- Fyldetid bruger konstant, positivt nettoflow. Brug restvolumen ved et delvist fyldt bassin og nettoflow ved samtidig ind- og udstrømning.
- Summer af rumfang forudsætter, at beholderdelene ikke overlapper.
- Overfladearealer omfatter krumme kapper og de valgte lukkede flader. Fælles endeflader i en samling fjernes automatisk. Det åbne bassin-eksempel bruger cylinderkappe og keglekappe.
- Rumfang og pladeareal bruger indvendige mål; en oplyst udvendig diameter omregnes med godstykkelsen. T9 er fortsat skolens tilnærmelse med tynde plader og indvendigt areal, ikke et eksakt rumfang af alle tankvægge og samlinger. Et åbent/lukket valg ændrer arealet, men ikke det geometriske rumfang. Visningen er skematisk og viser ingen målestok, vægtykkelse eller væskeniveau.
- Kompendiet omskriver ved substitution. Det isolerer ikke automatisk en vilkårlig ubekendt og foretager ikke algebraisk reduktion. Vælg den ønskede formel fra samlingen.
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
- `dist/engine.js`: referencegraf, substitution, MathML, tekstformat, LaTeX og validering.
- `dist/geometry.js`: placering af sammenføjede figurer og klikbare snitskitser.
- `dist/solid-preview.js`: 3D-geometri, perspektiv, lys samt rotation og zoom på canvas.
- `dist/app.js`: dansk grænseflade, figurvalg, temaskift og lokale opsætninger.
- `dist/styles.css`: responsivt design og begge temaer.
- `dist/index.html`: indgangspunkt for kildefilerne; kan også åbnes direkte lokalt.
- `index.html`: genereret, selvstændig offlineudgave. Byg igen efter ændringer i `dist/`.

Formlernes skabeloner består af faste matematiske operationer. Der bruges hverken `eval`, dynamisk kodegenerering eller en tjeneste til at behandle opsætninger. MathML vises af browseren.

Testene dækker også indre/ydre diametre, blandede diametervalg i samlinger, fælles og separate tykkelser, radiale mål på skrå vægge, sammenhængen med T9 og migrering af gamle opsætninger. Enhedstestene kontrollerer potenser, sammensat flow, input- og resultatomregning, referencer mellem forskellige resultatenheder, procent, temperaturforskelle og absolut temperatur. Kontroller af parenteser, skoleformler, samlinger og 3D-geometri er bevaret. Filkontrollen verificerer den selvstændige HTML-fil, script-rækkefølge og offlinekrav.

Eksempelopgaver kan bruges til at udvide kataloget med flere relevante formler og opsætninger.
