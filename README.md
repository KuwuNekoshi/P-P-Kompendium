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
- Vælg en figur, og sæt hver fri flade til **Åben** eller **Lukket**. Samleflader udelades automatisk fra den ydre overflade.
- Vælg ved hver størrelse: **kendt størrelse**, **indsæt en formel** eller **brug en reference**.
- Skift mellem **Kort** og **Udfoldet**. Se hele sammenhængen under **Se formelkæden**, eller kopiér formlen som tekst.

En reference følger sin kilde. **Indsæt formlen her** indsætter en kopi af kildens aktuelle formel; eventuelle underreferencer i kopien bliver ved med at følge deres egne kilder.

### Visuelle samlinger i 3D

**3D** viser figurerne samlet ende mod ende. Træk med musen eller en finger for at dreje; brug musehjulet eller knapperne **+ / −** til zoom. Piletasterne drejer også visningen, når den har fokus, og **R** nulstiller vinklen. Åbne flader vises uden låg. **Skitse** viser et klikbart snit med navne og fladernes status.

Begge visninger er skematiske og uden målestok. Der indtastes stadig ingen tal. 3D-visningen følger figurernes typer, samlinger og fladevalg, og hele visningen virker offline uden eksterne biblioteker.

For en cylinder med kuglespids: vælg **Sammensæt → Cylinder → Bund → Ny halvkugle → Sæt sammen**. En halvkugle har højde `D/2`, rumfang `πD³/12` og krumt areal `πD²/2`. Dens plane cirkel og cylinderens tilstødende endeflade tælles ikke med, når de er sammenføjet. Lukning af cylinderens frie ende lægger én cirkelflade til det ydre areal.

Samlinger forbinder hele, passende endeflader: cirkel med cirkel eller rektangel med rektangel. Den første figur leverer de fælles mål. Samlede dele følges ad i beholderens sum. Under visningen findes formlerne for samlet rumfang og ydre overflade med **Brug formel**.

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

Der er 38 formler inden for geometri, overflade, flow og tid, masse, tryk og pumpeeffekt. Hver formel har relevante symbolforklaringer og SI-enheder. Udseendet er inspireret af Teslas enkle grænseflader og har lys og mørk visning.

## Forudsætninger

- Fyldetid bruger konstant, positivt nettoflow. Brug restvolumen ved et delvist fyldt bassin og nettoflow ved samtidig ind- og udstrømning.
- Summer af rumfang forudsætter, at beholderdelene ikke overlapper.
- Overfladearealer omfatter krumme kapper og de valgte lukkede flader. Fælles endeflader i en samling fjernes automatisk. Det åbne bassin-eksempel bruger cylinderkappe og keglekappe.
- Geometrien bruger indvendige mål og ser bort fra vægtykkelse. Et åbent/lukket valg ændrer arealet, men ikke det geometriske rumfang. Visningen viser ingen målestok eller væskeniveau.
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
- `dist/engine.js`: referencegraf, substitution, MathML, tekstformat, LaTeX og validering.
- `dist/geometry.js`: placering af sammenføjede figurer og klikbare snitskitser.
- `dist/solid-preview.js`: 3D-geometri, perspektiv, lys samt rotation og zoom på canvas.
- `dist/app.js`: dansk grænseflade, figurvalg, temaskift og lokale opsætninger.
- `dist/styles.css`: responsivt design og begge temaer.
- `dist/index.html`: indgangspunkt for kildefilerne; kan også åbnes direkte lokalt.
- `index.html`: genereret, selvstændig offlineudgave. Byg igen efter ændringer i `dist/`.

Formlernes skabeloner består af faste matematiske operationer. Der bruges hverken `eval`, dynamisk kodegenerering eller en tjeneste til at behandle opsætninger. MathML vises af browseren.

Testene dækker bassinets referencekæde, symbolske formler, samlinger, fælles mål, åbne/lukkede flader, sletning, gamle opsætninger, importvalidering og dimensionerne i alle katalogformler. Geometritestene kontrollerer sammenfaldende endeflader, orientering og 3D-modellens åbninger. Filkontrollen verificerer den selvstændige HTML-fil, script-rækkefølge og offlinekrav.

Eksempelopgaver kan bruges til at udvide kataloget med flere relevante formler og opsætninger.
