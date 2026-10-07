# SRO-kompendium

## Offlinefiler

Hent `sro.html` (almindelig) eller `sro-eksamen.html` (eksamen) fra GitHub Releases. Åbn filen direkte i en moderne browser med MathML-understøttelse. Alt indhold og alle beregninger findes i filen; der kræves ingen server, AI, login eller internet.

Normalversionen gemmer lokalt, hvis browseren tillader det, og kan eksportere/importere `.sro.json`. Eksportér før flytning til en anden computer. Eksamensversionen starter altid med en tom opgave, også ved tilbage-navigation fra sidecachen, og læser/skriver aldrig opgaver i browserlageret. Tema og formelvisning kan huskes. Den synlige lommeregner starter fra i normalversionen og til i eksamensversionen.

## Tidsudregning

Alle tidsfelter og tidsresultater tilbyder **TMS (tt:mm:ss)**, fx `02:47:00`. Vælg **Tid → Læg tider sammen** for at kombinere varigheder med hver sin enhed. `8 h + 12,34 h` vises som **20:20:24**. Der findes også en tidsforskel og en selvstændig tidsomregning. Tider over 24 timer, negative varigheder og decimaler i sekunder understøttes. Formler og referencer regner i sekunder med den oprindelige præcision; kun resultatvisningen afrundes.

## Kredsløbsbygger

1. Vælg **Kredsløb → + Modstand**, eller start med en serie-, parallel-, blandet eller brokobling uden tal. En ideal spændingskilde og en resultatformel tilføjes automatisk.
2. Træk komponenterne. **Drej 90°** vender en valgt modstand. Piletaster flytter den fokuserede komponent i gitteret.
3. Klik på en blå tilslutning og derefter en anden for at lave en ledning. Esc annullerer det første valg. Tilføj et knudepunkt for at samle flere ledninger.
4. Ledninger, der krydser eller overlapper på tegningen, forbindes **kun**, hvis de deler en tilslutning eller et knudepunkt. Geometrisk placering afgør ikke den elektriske forbindelse.
5. Vælg en modstand eller kilden for at indtaste tal og enheder. **Fjern valgt** sletter en valgt modstand, ledning eller knudepunkt. **Fortryd** gendanner en tidligere ændring.
6. Den samlede modstand vises som en formel i opgavelisten. Vælg den som reference til `R` i en anden formel, eller brug **+ Formel for samlet strøm**.
7. Med lommeregneren slået til vises også spænding, strøm og effekt pr. modstand, når alle nødvendige tal er indtastet. Fortegn følger retningen venstre→højre/top→bund.

Én ideal DC-kilde og op til 12 modstande pr. opgave, 20 knudepunkter og 60 ledninger. Dette er en formelbygger for ohmske DC-kredsløb, ikke en tidssimulation eller en AC/RLC-simulator. En ledning er ideel; modstande skal være positive. Afbrudte strømbaner vises som fejl, ikke som 0 Ω. En direkte kortslutning giver R = 0 og ingen endelig strøm for en ideal spændingskilde. Flydende komponenter får ingen beregnet grenvisning.

Topologien bruger union-find til ideelle ledninger og serie-/parallelreduktion. Brokoblinger håndteres ved stjerne–maske-elimination. Den udledte formel refererer til de oprindelige komponenters værdier. Grenværdier findes ved separat knudepunktsanalyse. Meget komplicerede kredsløb kan ramme formelmotorens størrelsesgrænse; de får en forklaring frem for et forkert resultat.

## Formler og referencer

De 49 synlige formelfamilier dækker elektricitet, motorer, måling, trykluft og PID. **Find / isolér** udskifter den aktuelle formel på stedet. Hvert felt kan være en kendt størrelse, en underformel eller en reference. Uafhængige formler har separate værdier. Referencer følger kildens værdier og enheder med fuld præcision. En indsat underformel deler symboler inden for sin overordnede formel.

**Egen formel** understøtter `+ - * / ^ sqrt(...) pi`, valgbare størrelser og referencer. Resultatets dimension kontrolleres. Brug et symbol for en værdi med enhed; faste tal i udtrykket er enhedsløse. En formel med dimensionsfejl vises med en forklaring.

Visningerne **Værdier / Symboler / Begge** skifter mellem tal, symboler og tal med små enheds-/symbolmærker. Tomme felter beholder symbolet. Enheder og procent omregnes inden indsættelse. Mellemregninger afrundes ikke. Resultatet tæller tre cifre fra det første ikke-nul i decimaldelen, fx `2,003234 → 2,00323` og `0,0008136 → 0,000814`, uden E-notation.

Der er højst 40 formler inklusive kredsløbets komponenter. Flyt dem med pilene og organisér dem i grupper. SRO- og P&P-opgavefiler er separate formater.

## Interaktive opslag

- Motor: seks klemmer, Y/Δ-broer, net- og viklingsspænding, mærkeplade og omvendt drejeretning. En motorkæde kan indsættes som en gruppe med referencer.
- Transmitter: 4–20 mA med valgbart temperatur-/trykområde og signal. Den valgte opsætning kan indsættes som formel.
- Regulering: køling/opvarmning, NC/NO og stigende/faldende PV viser den nødvendige direkte/inverse virkning. P-, I- og D-formler kan indsættes.
- Komponenter: 24 klikbare kort med forenklede principskitser, aktiveret/hviletilstand og AND/OR-tryklogik.
- IP-/isoleringsklasser og en redigerbar I/O-liste. Eksempeladresser er illustrative og skal tilpasses PLC-projektet.
- **?** viser en introduktion i 11 trin. Den bruger en midlertidig opgave og gendanner din egen bagefter.

## Kilder og præciseringer

Grundlaget er brugerens 22 billeder `1000037329.jpg`–`1000037350.jpg`. De enkelte formler angiver kildebilledet. Fotoindholdet er transskriberet til tekst og præcise, kodebaserede principskitser; billederne indgår ikke som eksterne afhængigheder.

Følgende er præciseret i appen:

- Frekvens er Hz. Slip er `(n_s − n) / n_s`; procent er en visningsenhed.
- Skolens `1 hk ≈ 736 W`, startstrømsfaktorer 6 og 2 og Pt100-tilnærmelsen `R = 100 + 0,3865 t` er bevaret med forbehold.
- Stjerne/trekant skelner mellem netspænding og viklingsspænding. 230/400 V Δ/Y bruger normalt Y ved 400 V; 400/690 V Δ/Y bruger Δ ved 400 V.
- En sikring reagerer på overstrøm. Termorelæets hjælpekontakter er 95–96 NC og 97–98 NO.
- Modstandsmetoden: `t₂ = (R₂ / R₁)(k + t₁) − k`, derefter `Δt = t₂ − t_a`. Det sidste plustegn i fotoet er rettet til minus. `k ≈ 235` for kobber og `225` for aluminium.
- Boyles lov forudsætter absolut tryk og konstant temperatur. Cylinderkraft bruger trykforskellen.
- Fejl i forhold til forventet værdi og fejl i forhold til målespænd er separate formler. Kvadratsum forudsætter uafhængige fejlbidrag.
- PID-formlerne er idealiserede, diskrete regneeksempler uden filtrering, udgangsbegrænsning eller anti-windup.

Supplerende producentkilder:

- [BEVI: elektriske motorer](https://www.bevi.dk/about-bevi/knowledge-bank/general-technical-information-electric-motors)
- [Schneider: direkte og invers regulering](https://www.se.com/za/en/faqs/FA308179/)
- [Schneider: termorelæets kontakter](https://www.se.com/us/en/faqs/FA119404/)
- [Festo: pneumatiske ventiler](https://www.festo.com/gb/en/e/blog/in-practice/pneumatic-valves-id_1517691)
- [DwyerOmega: Pt100](https://www.dwyeromega.com/en-us/resources/pt100-table)
- WEG, *Specification of Electric Motors*, afsnit 7.1.4, modstandsmetoden for temperaturstigning.

Disse links er supplerende læsning; appen henter intet fra dem.

## Udvikling og kontrol

Kilde: `sro/`. P&P's symbolske motor, enhedslogik og introduktion genbruges gennem `tools/sro-sources.cjs`. SRO udvider dimensionerne med elektrisk strøm og bruger °C som grundværdi for skoleformlerne. P&P's kildefiler og enheder ændres ikke.

```sh
npm test
npm run build
npm run check
```

Bygningen genererer alle fire HTML-filer. Node-testene kontrollerer bl.a. omskrivninger, elektriske dimensioner, procent, temperatur, rpm, uafhængige input og brokoblinger sammenholdt med knudepunktsanalyse.

Valgfri browsertest kræver Playwright og Chromium (kun udvikling):

```sh
PLAYWRIGHT_MODULE=/path/to/playwright CHROMIUM_PATH=/path/to/chromium npm run test:sro:browser
```

Den afprøver tilslutninger, træk, rotation, slet/fortryd, referencer, omregning, omskrivning på stedet, import/eksport, alle introduktionstrin, mobilbredde og eksamensnulstilling. Netværkskald og browserfejl kontrolleres også. `SRO_SCREENSHOT_DIR` kan sættes til en eksisterende mappe for skærmbilleder.

TMS-kontrollen i en rigtig browser kan køres med `npm run test:time:browser` og de samme `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH`-variabler. Den åbner alle fire HTML-filer via `file://` og kontrollerer blandede tidsformater, afrunding, fejlindtastning, mobilenheder, lagring, eksamensnulstilling og fravær af netværkskald.
