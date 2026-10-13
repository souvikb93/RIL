/* EN / DE. Same pattern as FarmDoc: choice stored under localStorage "lang".
   Static markup: data-i18n (text), data-i18n-html, data-i18n-ph (placeholder),
   data-i18n-aria (aria-label), data-i18n-title (document title).
   Script strings: t('key', { var }). Switching saves the choice and reloads —
   view, scenario and sliders live in the URL hash, so nothing is lost. */

const I18N = (() => {
  const D = {
    en: {
      'login.title': 'EmPowerPlan – Sign in',
      'login.welcome': 'Welcome back',
      'login.sub': 'Sign in to your account to continue.',
      'login.email': 'Email',
      'login.emailPh': 'name@example.com',
      'login.continue': 'Continue with email',
      'login.or': 'or',
      'login.google': 'Sign in with Google',
      'login.apple': 'Sign in with Apple',

      'lang.label': 'Language',
      'nav.home': 'EmPowerPlan home',
      'nav.signOut': 'Sign out',
      'nav.docs': 'Documentation', 'nav.contact': 'Contact', 'nav.back': 'Back',
      'user.guest': 'Guest',

      'w.titleGuest': 'Welcome to EmPowerPlan',
      'w.titleUser': 'Hi {name}, welcome back',
      'w.sub': 'What do you want to find out about wind and solar in Oderland-Spree?',
      'w.explore': 'Explore',
      'w.today.k': 'Today', 'w.today.h': 'Where do we stand?', 'w.today.lead': 'See how far the region has already come.',
      'w.today.stat': 'Renewable share today',
      'w.today.b1': 'Renewable share, generation and capacity by district',
      'w.today.b2': 'Land used for wind and solar against the 2.2 % target',
      'w.today.b3': 'Electricity demand in total and per inhabitant',
      'w.plan.k': 'Plan', 'w.plan.h': 'What if we build more?', 'w.plan.lead': 'Test the state targets or your own mix.',
      'w.plan.stat': 'Renewable share with BB 2030',
      'w.plan.b1': 'Start from BB 2030, BB 2040 or your own numbers',
      'w.plan.b2': 'Adjust wind and solar, results update instantly',
      'w.plan.b3': 'See where new turbines and solar parks could go',
      'w.place.k': 'My Place', 'w.place.h': 'What does it mean here?', 'w.place.lead': 'Zoom in on one town or village.',
      'w.place.stat': 'Towns and villages',
      'w.place.b1': 'Distance to the nearest wind area',
      'w.place.b2': 'Number of turbines within 2.5 km',
      'w.place.b3': 'Yearly § 6 EEG income for the municipality',

      'back.topics': 'All topics',
      'back.start': 'Starting point',
      'today.h': 'Where do we stand?',
      'today.show': 'Show on map',
      'today.deeperHint': 'Energy mix and districts',
      'plan.h': 'What if we build more?',
      'plan.startSub': 'Choose a starting point. You can adjust it in the next step.',
      'plan.build': 'Build more',
      'plan.more': 'More settings',
      'plan.moreHint': 'Rooftop solar and demand',
      'plan.deeperHint': 'Generation, households and CO₂',
      'place.h': 'What does it mean here?',
      'place.label': 'Town or Village',
      'place.ph': 'Enter a town or village name',
      'place.orMap': 'Or select a point on the map.',
      'sources': 'Assumptions & data sources',
      'map.loading': 'Loading map…',
      'map.layers': 'Layers',
      'map.layersN': 'Layers ({n})',
      'map.layersTitle': 'Map layers',
      'map.layersClose': 'Close layers',
      'map.hintPlace': 'Select a point on the map to see what the scenario means there',
      'map.hintPlan': 'Tip: select a point on the map to check that place',
      'sheet.resize': 'Resize panel', 'sheet.expand': 'Expand panel', 'sheet.collapse': 'Collapse panel',
      'drawer.close': 'Close details',
      'soon': 'Soon',

      'sc.heute': 'Today', 'sc.heute.tag': 'Estimate', 'sc.heute.line': 'Where the region is now.',
      'sc.bb30.tag': 'Official target', 'sc.bb30.line': 'Brandenburg energy strategy, 2030.',
      'sc.bb40.tag': 'Derived', 'sc.bb40.line': 'Brandenburg targets for 2040.',
      'sc.eigen': 'Custom', 'sc.eigen.tag': 'Your values', 'sc.eigen.line': 'Set wind and solar yourself.',
      'start.wind': 'MW wind', 'start.solar': 'MWp solar',

      'sl.wind': 'Wind power', 'sl.ff': 'Ground-mounted solar', 'sl.roof': 'Rooftop solar', 'sl.demand': 'Electricity demand',
      'sl.ofToday': '% of today',
      'sl.set': 'Set {what} to {to}',
      'tick.today': 'Today',
      'plain.wind': '≈ {n} turbines on {ha} ha',
      'plain.ff': '≈ {n} football pitches of land',
      'plain.roof': '≈ {n} house roofs',
      'plain.demand': '≈ {n} GWh a year',
      'plain.demandUp': ' (heat pumps, EVs, industry)',
      'plan.own': 'Your own scenario',
      'plan.from': 'Starting from {x}',
      'plan.builtOn': 'Built on {x}.',
      'plan.reset': 'Reset to {x}',
      'plan.moveOwn': 'Adjust wind and solar to build your own scenario.',
      'plan.move': 'Adjust wind and solar below. The map and figures update instantly.',
      'plan.warn': 'This needs more land than the analysis rates as suitable ({ha} ha). Distances or protection rules would have to change.',
      'res.gen': 'Electricity generated', 'res.demand': 'Electricity demand', 'res.households': 'Households supplied',
      'res.pvLand': 'Land for solar', 'res.co2': 'CO₂ avoided', 'res.today': 'Today: {x}',
      'u.m': 'm', 'u.mt': 'm t',

      'grp.Energy': 'Energy', 'grp.Land': 'Land', 'grp.Demand': 'Demand',
      'm.share': 'Renewable share', 'm.share.d': 'Share of electricity use covered by wind and solar.',
      'm.gen': 'Generation', 'm.gen.d': 'Electricity from wind and solar per year.',
      'm.mw': 'Installed capacity', 'm.mw.d': 'Wind and solar capacity in place.',
      'm.windLand': 'Land for wind', 'm.windLand.d': 'Share of the area used by wind turbines.',
      'm.windTarget': 'Progress to wind target', 'm.windTarget.d': 'How far along the 2.2 % land target is.',
      'm.pvLand': 'Land for solar', 'm.pvLand.d': 'Share of the area used by ground-mounted solar.',
      'm.demand': 'Electricity demand', 'm.demand.d': 'Electricity used per year, incl. industry.',
      'm.perCap': 'Per inhabitant', 'm.perCap.d': 'Electricity use divided by population.',
      'm.heat': 'Heat demand', 'm.heat.d': 'Coming with heat-sector data.',
      'mix.title': 'Electricity mix today', 'mix.byDistrict': '{x} by district',
      'src.wind': 'Wind', 'src.ff': 'Ground-mounted solar', 'src.ffShort': 'Ground solar', 'src.roof': 'Rooftop solar', 'src.demand': 'Demand',

      'lg.Energy potential': 'Energy potential', 'lg.Settlements & infrastructure': 'Settlements & infrastructure', 'lg.Nature': 'Nature',
      'ly.potential': 'Suitable for wind (demo)', 'ly.pvpotential': 'Suitable for solar (demo)',
      'ly.excluded': 'Within 1 km of settlements', 'ly.grid': 'Power grid ≥ 110 kV',
      'ly.nature': 'Nature & forest (demo)', 'ly.water': 'Water protection areas',
      'leg.windOld': 'Existing wind areas', 'leg.windNew': 'New wind areas', 'leg.solarOld': 'Existing solar areas', 'leg.solarNew': 'New solar areas',

      'k.showing': 'Showing', 'k.today': 'Today', 'k.estimate': 'Current estimate', 'k.scenario': 'Scenario · change',
      'k.change': 'Change scenario', 'k.same': 'Same as today', 'k.details': 'Details', 'k.pts': ' pts',
      'k.share': 'Renewable share', 'k.share.n': 'Of demand · target 100 %',
      'k.turbines': 'Wind turbines', 'k.turbines.n': 'Counted at 6.5 MW each',
      'k.land': 'Land for wind', 'k.land.n': 'Of the region · target 2.2 %',
      'k.eeg': 'For municipalities', 'k.eeg.n': '§ 6 EEG payments',
      'perYear': '/ year',

      'd.share.lead': '<b>{v}</b> of the electricity used in the region is generated by wind and solar here ({ctx}).',
      'd.share.h': 'Generation vs. demand (GWh / year)',
      'd.share.note': 'Above 100 % means the region produces more than it uses over the year, not in every hour. Storage and the grid balance the rest.',
      'd.turb.lead': '<b>≈ {n} turbines</b>', 'd.turb.more': ', {n} more than today',
      'd.capacity': 'Capacity', 'd.electricity': 'Electricity', 'd.perTurbine': 'Per turbine', 'u.twhYr': 'TWh/yr', 'u.gwhYr': 'GWh/yr',
      'd.turb.note': 'Counted as modern 6.5 MW turbines. Many older turbines today are smaller, so the real count is higher.',
      'd.showMap': 'Show on map',
      'd.land.lead': '<b>{pct}</b> of the region, {ha} ha. The 2032 target is {t} ({tha} ha).',
      'd.land.h': 'Progress to target', 'd.windLand': 'Wind area', 'd.solarLand': 'Solar area', 'd.suitable': 'Suitable for wind (demo)',
      'd.eeg.title': 'Income for municipalities',
      'd.eeg.lead': '<b>{v} a year</b> if all operators pay the voluntary § 6 EEG share of 0.2 ct/kWh.',
      'd.fromWind': 'From wind', 'd.fromFF': 'From ground solar', 'd.oneTurbine': 'One turbine',
      'd.eeg.note': 'Wind payments go to all municipalities within 2.5 km of a turbine. Rooftop solar doesn’t count.',
      'd.checkTown': 'Check a town',

      'pl.basedOn': 'Based on <b>{x}</b>.',
      'pl.near': 'Near {n}', 'pl.point': 'Selected point',
      'pl.subYes': 'For municipalities within 2.5 km of turbines (§ 6 EEG)',
      'pl.subNo': 'No wind turbines within 2.5 km, so no § 6 EEG payment here',
      'pl.nearest': 'Nearest wind area', 'pl.turbines': 'Turbines within 2.5 km', 'pl.new': '{n} new',
      'pl.solar': 'Solar within 2 km', 'pl.none': 'None',
      'pl.towns': 'Towns', 'pl.villages': 'Villages', 'pl.noneFound': 'No place found', 'pl.inh': '{n} residents',
      'pl.clear': 'Clear', 'pl.search': 'Search places',
      'compass': 'N,NE,E,SE,S,SW,W,NW',

      'as.mw': 'Capacity per wind turbine', 'as.land': 'Land per MW wind / MWp solar', 'as.flh': 'Full-load hours wind / ground / rooftop',
      'as.demand': 'Electricity demand today', 'as.eeg': 'Municipal payment, § 6 EEG', 'as.dist': 'Min. distance wind → settlements',
      'as.scen': '<b>Scenarios:</b> BB 2030 is the Brandenburg energy strategy broken down to this region (15.4 % share). BB 2040 applies the same share to the state’s 2040 targets (15.5 GW wind, 33 GW solar); that step is our derivation, not an official value.',
      'as.real': '<b>Real data:</b> district boundaries (GADM), settlements (© OpenStreetMap contributors), BB 2030 targets and land ratios from the <a href="https://epp.rl-institut.de/de/" target="_blank" rel="noopener">EmPowerPlan tool</a> (RLI).',
      'as.demo': '<b>Estimates &amp; demo data:</b> district values are estimates; wind resource and nature/forest areas are simulated to show the principle.',
      'as.disc': 'Independent design prototype. Not a service of the State of Brandenburg; figures are not legally binding.',
      'leg.title': 'Scenario: {x}',
      'today.deeper': 'More details',
      'plan.deeper': 'More results',
    },
    de: {
      'login.title': 'EmPowerPlan – Anmelden',
      'login.welcome': 'Willkommen zurück',
      'login.sub': 'Melden Sie sich an, um fortzufahren.',
      'login.email': 'E-Mail',
      'login.emailPh': 'name@beispiel.de',
      'login.continue': 'Weiter mit E-Mail',
      'login.or': 'oder',
      'login.google': 'Mit Google anmelden',
      'login.apple': 'Mit Apple anmelden',

      'lang.label': 'Sprache',
      'nav.home': 'EmPowerPlan Startseite',
      'nav.signOut': 'Abmelden',
      'nav.docs': 'Dokumentation', 'nav.contact': 'Kontakt', 'nav.back': 'Zurück',
      'user.guest': 'Gast',

      'w.titleGuest': 'Willkommen bei EmPowerPlan',
      'w.titleUser': 'Hallo {name}, willkommen zurück',
      'w.sub': 'Was möchten Sie über Wind- und Solarenergie in Oderland-Spree erfahren?',
      'w.explore': 'Entdecken',
      'w.today.k': 'Heute', 'w.today.h': 'Wo stehen wir?', 'w.today.lead': 'So weit ist die Region heute.',
      'w.today.stat': 'Erneuerbaren-Anteil heute',
      'w.today.b1': 'Erneuerbaren-Anteil, Erzeugung und Leistung je Kreis',
      'w.today.b2': 'Flächen für Wind und Solar, gemessen am 2,2-%-Ziel',
      'w.today.b3': 'Strombedarf – insgesamt und pro Einwohner',
      'w.plan.k': 'Planen', 'w.plan.h': 'Was bringt mehr Ausbau?', 'w.plan.lead': 'Spielen Sie die Landesziele oder Ihren eigenen Mix durch.',
      'w.plan.stat': 'Erneuerbaren-Anteil mit BB 2030',
      'w.plan.b1': 'Mit BB 2030, BB 2040 oder eigenen Werten starten',
      'w.plan.b2': 'Wind und Solar anpassen – Ergebnisse sofort sehen',
      'w.plan.b3': 'Sehen, wo neue Windräder und Solarparks Platz hätten',
      'w.place.k': 'Mein Ort', 'w.place.h': 'Was heißt das für meinen Ort?', 'w.place.lead': 'Der Blick auf Ihre Stadt oder Ihr Dorf.',
      'w.place.stat': 'Städte und Dörfer',
      'w.place.b1': 'Abstand zur nächsten Windfläche',
      'w.place.b2': 'Windräder im Umkreis von 2,5 km',
      'w.place.b3': 'Jährliche Einnahmen der Gemeinde nach § 6 EEG',

      'back.topics': 'Zur Übersicht',
      'back.start': 'Ausgangspunkt wählen',
      'today.h': 'Wo stehen wir?',
      'today.show': 'Auf der Karte',
      'today.deeperHint': 'Strommix und Kreise',
      'plan.h': 'Was bringt mehr Ausbau?',
      'plan.startSub': 'Wählen Sie einen Ausgangspunkt – anpassen können Sie ihn im nächsten Schritt.',
      'plan.build': 'Ausbau',
      'plan.more': 'Weitere Einstellungen',
      'plan.moreHint': 'Dach-PV und Strombedarf',
      'plan.deeperHint': 'Erzeugung, Haushalte und CO₂',
      'place.h': 'Was heißt das für meinen Ort?',
      'place.label': 'Stadt oder Dorf',
      'place.ph': 'Stadt oder Dorf eingeben',
      'place.orMap': 'Oder wählen Sie einen Punkt auf der Karte.',
      'sources': 'Annahmen & Datenquellen',
      'map.loading': 'Karte wird geladen …',
      'map.layers': 'Ebenen',
      'map.layersN': 'Ebenen ({n})',
      'map.layersTitle': 'Kartenebenen',
      'map.layersClose': 'Ebenen schließen',
      'map.hintPlace': 'Wählen Sie einen Punkt auf der Karte, um zu sehen, was das Szenario dort bedeutet',
      'map.hintPlan': 'Tipp: Wählen Sie einen Punkt auf der Karte, um diesen Ort zu prüfen',
      'sheet.resize': 'Bereich anpassen', 'sheet.expand': 'Bereich ausklappen', 'sheet.collapse': 'Bereich einklappen',
      'drawer.close': 'Details schließen',
      'soon': 'Demnächst',

      'sc.heute': 'Heute', 'sc.heute.tag': 'Schätzung', 'sc.heute.line': 'Der heutige Stand der Region.',
      'sc.bb30.tag': 'Offizielles Ziel', 'sc.bb30.line': 'Ziele der Landes-Energiestrategie für 2030.',
      'sc.bb40.tag': 'Abgeleitet', 'sc.bb40.line': 'Landesziele für 2040, auf die Region umgelegt.',
      'sc.eigen': 'Eigene Werte', 'sc.eigen.tag': 'Frei wählbar', 'sc.eigen.line': 'Wind und Solar selbst festlegen.',
      'start.wind': 'MW Wind', 'start.solar': 'MWp Solar',

      'sl.wind': 'Windenergie', 'sl.ff': 'Freiflächen-PV', 'sl.roof': 'Dach-PV', 'sl.demand': 'Strombedarf',
      'sl.ofToday': '% ggü. heute',
      'sl.set': '{what} auf {to} setzen',
      'tick.today': 'Heute',
      'plain.wind': '≈ {n} Windräder auf {ha} ha',
      'plain.ff': '≈ so groß wie {n} Fußballfelder',
      'plain.roof': '≈ {n} Hausdächer',
      'plain.demand': '≈ {n} GWh pro Jahr',
      'plain.demandUp': ' (Wärmepumpen, E-Autos, Industrie)',
      'plan.own': 'Ihr eigenes Szenario',
      'plan.from': 'Ausgehend von {x}',
      'plan.builtOn': 'Grundlage: {x}.',
      'plan.reset': 'Auf {x} zurücksetzen',
      'plan.moveOwn': 'Passen Sie Wind und Solar an, um Ihr eigenes Szenario zu erstellen.',
      'plan.move': 'Passen Sie Wind und Solar unten an. Karte und Kennzahlen aktualisieren sich sofort.',
      'plan.warn': 'Dafür reicht die als geeignet eingestufte Fläche ({ha} ha) nicht aus. Abstände oder Schutzauflagen müssten neu abgewogen werden.',
      'res.gen': 'Erzeugter Strom', 'res.demand': 'Strombedarf', 'res.households': 'Rechnerisch versorgte Haushalte',
      'res.pvLand': 'Fläche für Solar', 'res.co2': 'Vermiedenes CO₂', 'res.today': 'Heute: {x}',
      'u.m': ' Mio.', 'u.mt': ' Mio. t',

      'grp.Energy': 'Energie', 'grp.Land': 'Fläche', 'grp.Demand': 'Bedarf',
      'm.share': 'Erneuerbaren-Anteil', 'm.share.d': 'Anteil des Stromverbrauchs, den Wind und Solar decken.',
      'm.gen': 'Erzeugung', 'm.gen.d': 'Strom aus Wind und Solar pro Jahr.',
      'm.mw': 'Installierte Leistung', 'm.mw.d': 'Vorhandene Wind- und Solarleistung.',
      'm.windLand': 'Fläche für Wind', 'm.windLand.d': 'Anteil der Fläche, den Windräder belegen.',
      'm.windTarget': 'Fortschritt zum Flächenziel', 'm.windTarget.d': 'Wie weit das 2,2-%-Flächenziel erreicht ist.',
      'm.pvLand': 'Fläche für Solar', 'm.pvLand.d': 'Anteil der Fläche für Freiflächen-PV.',
      'm.demand': 'Strombedarf', 'm.demand.d': 'Stromverbrauch pro Jahr, inkl. Industrie.',
      'm.perCap': 'Pro Einwohner', 'm.perCap.d': 'Stromverbrauch geteilt durch die Einwohnerzahl.',
      'm.heat': 'Wärmebedarf', 'm.heat.d': 'Folgt, sobald Daten zur Wärme vorliegen.',
      'mix.title': 'Strommix heute', 'mix.byDistrict': '{x} je Kreis',
      'src.wind': 'Wind', 'src.ff': 'Freiflächen-PV', 'src.ffShort': 'Freiflächen-PV', 'src.roof': 'Dach-PV', 'src.demand': 'Bedarf',

      'lg.Energy potential': 'Energiepotenzial', 'lg.Settlements & infrastructure': 'Siedlungen & Infrastruktur', 'lg.Nature': 'Natur',
      'ly.potential': 'Geeignet für Wind (Demo)', 'ly.pvpotential': 'Geeignet für Solar (Demo)',
      'ly.excluded': 'Unter 1 km Abstand zu Siedlungen', 'ly.grid': 'Stromnetz ≥ 110 kV',
      'ly.nature': 'Natur & Wald (Demo)', 'ly.water': 'Wasserschutzgebiete',
      'leg.windOld': 'Bestehende Windflächen', 'leg.windNew': 'Neue Windflächen', 'leg.solarOld': 'Bestehende Solarflächen', 'leg.solarNew': 'Neue Solarflächen',

      'k.showing': 'Ansicht', 'k.today': 'Heute', 'k.estimate': 'Aktuelle Schätzung', 'k.scenario': 'Szenario · ändern',
      'k.change': 'Szenario ändern', 'k.same': 'Wie heute', 'k.details': 'Details', 'k.pts': ' Pkt.',
      'k.share': 'EE-Anteil', 'k.share.n': 'Vom Bedarf · Ziel 100 %',
      'k.turbines': 'Windräder', 'k.turbines.n': 'Bei 6,5 MW je Anlage',
      'k.land': 'Fläche für Wind', 'k.land.n': 'Der Regionsfläche · Ziel 2,2 %',
      'k.eeg': 'Für Gemeinden', 'k.eeg.n': 'Zahlungen nach § 6 EEG',
      'perYear': '/ Jahr',

      'd.share.lead': '<b>{v}</b> des Stromverbrauchs der Region werden vor Ort aus Wind und Solar erzeugt ({ctx}).',
      'd.share.h': 'Erzeugung vs. Bedarf (GWh / Jahr)',
      'd.share.note': 'Über 100 % heißt: Übers Jahr erzeugt die Region mehr Strom, als sie verbraucht – aber nicht zu jeder Stunde. Den Rest gleichen Speicher und Netz aus.',
      'd.turb.lead': '<b>≈ {n} Windräder</b>', 'd.turb.more': ', {n} mehr als heute',
      'd.capacity': 'Leistung', 'd.electricity': 'Strom', 'd.perTurbine': 'Pro Windrad', 'u.twhYr': 'TWh/Jahr', 'u.gwhYr': 'GWh/Jahr',
      'd.turb.note': 'Gerechnet mit modernen 6,5-MW-Anlagen. Viele Bestandsanlagen sind kleiner – tatsächlich stehen also mehr Windräder.',
      'd.showMap': 'Auf der Karte anzeigen',
      'd.land.lead': '<b>{pct}</b> der Regionsfläche bzw. {ha} ha. Ziel bis 2032: {t} ({tha} ha).',
      'd.land.h': 'Fortschritt zum Ziel', 'd.windLand': 'Windfläche', 'd.solarLand': 'Solarfläche', 'd.suitable': 'Geeignet für Wind (Demo)',
      'd.eeg.title': 'Einnahmen der Gemeinden',
      'd.eeg.lead': '<b>{v} pro Jahr</b>, wenn alle Betreiber die freiwillige Kommunalbeteiligung nach § 6 EEG von 0,2 ct/kWh zahlen.',
      'd.fromWind': 'Aus Wind', 'd.fromFF': 'Aus Freiflächen-PV', 'd.oneTurbine': 'Ein Windrad',
      'd.eeg.note': 'Bei Wind profitieren alle Gemeinden im Umkreis von 2,5 km um die Anlage. Dach-PV ist ausgenommen.',
      'd.checkTown': 'Ort prüfen',

      'pl.basedOn': 'Basierend auf <b>{x}</b>.',
      'pl.near': 'Bei {n}', 'pl.point': 'Gewählter Punkt',
      'pl.subYes': 'Für Gemeinden im Umkreis von 2,5 km um Windräder (§ 6 EEG)',
      'pl.subNo': 'Im Umkreis von 2,5 km stehen keine Windräder – daher keine Zahlung nach § 6 EEG',
      'pl.nearest': 'Nächste Windfläche', 'pl.turbines': 'Windräder im Umkreis von 2,5 km', 'pl.new': '{n} neu',
      'pl.solar': 'Solar im Umkreis von 2 km', 'pl.none': 'Keine',
      'pl.towns': 'Städte', 'pl.villages': 'Dörfer', 'pl.noneFound': 'Kein Ort gefunden', 'pl.inh': '{n} Einwohner',
      'pl.clear': 'Eingabe löschen', 'pl.search': 'Orte suchen',
      'compass': 'N,NO,O,SO,S,SW,W,NW',

      'as.mw': 'Leistung pro Windrad', 'as.land': 'Fläche pro MW Wind / MWp Solar', 'as.flh': 'Volllaststunden Wind / Freifläche / Dach',
      'as.demand': 'Strombedarf heute', 'as.eeg': 'Kommunalbeteiligung, § 6 EEG', 'as.dist': 'Mindestabstand Wind → Siedlungen',
      'as.scen': '<b>Szenarien:</b> BB 2030 ist die Energiestrategie Brandenburg, heruntergebrochen auf diese Region (15,4 % Anteil). BB 2040 wendet denselben Anteil auf die Landesziele für 2040 an (15,5 GW Wind, 33 GW Solar); dieser Schritt ist unsere Ableitung, kein offizieller Wert.',
      'as.real': '<b>Echte Daten:</b> Kreisgrenzen (GADM), Ortslagen (© OpenStreetMap-Mitwirkende), BB-2030-Ziele und Flächenkennzahlen aus dem <a href="https://epp.rl-institut.de/de/" target="_blank" rel="noopener">EmPowerPlan-Tool</a> (RLI).',
      'as.demo': '<b>Schätzungen &amp; Demo-Daten:</b> Die Werte je Kreis sind Schätzungen; Windpotenzial sowie Natur- und Waldflächen sind simuliert, um das Prinzip zu zeigen.',
      'as.disc': 'Unabhängiger Design-Prototyp. Kein Angebot des Landes Brandenburg; die Zahlen sind nicht rechtsverbindlich.',
      'leg.title': 'Szenario: {x}',
      'today.deeper': 'Weitere Details',
      'plan.deeper': 'Weitere Ergebnisse',
    },
  };

  function resolve() {
    try { const v = localStorage.getItem('lang'); if (v === 'de' || v === 'en') return v; } catch { /* storage blocked */ }
    return (navigator.language || 'en').toLowerCase().startsWith('de') ? 'de' : 'en';
  }
  const lang = resolve();
  document.documentElement.lang = lang;

  const t = (key, vars = {}) => {
    const s = D[lang][key] ?? D.en[key] ?? key;
    return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  };

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    const ttl = document.querySelector('[data-i18n-title]');
    if (ttl) document.title = t(ttl.dataset.i18nTitle);
  }

  function setLang(next) {
    if (next === lang) return;
    try { localStorage.setItem('lang', next); } catch { /* storage blocked */ }
    location.reload();
  }

  // FarmDoc-style switcher: "EN ⌄" → "Deutsch" / "English"
  function mountSwitcher(host) {
    if (!host) return;
    host.innerHTML = `
      <button type="button" class="lang-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${t('lang.label')}">
        <span>${lang.toUpperCase()}</span>
        <svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>
      </button>
      <div class="lang-menu" role="listbox" aria-label="${t('lang.label')}">
        ${[['de', 'Deutsch'], ['en', 'English']].map(([k, n]) =>
          `<button type="button" class="lang-opt${k === lang ? ' active' : ''}" role="option" aria-selected="${k === lang}" data-lang="${k}" lang="${k}">${n}</button>`).join('')}
      </div>`;
    const trig = host.querySelector('.lang-trigger');
    const close = () => { host.classList.remove('open'); trig.setAttribute('aria-expanded', 'false'); };
    trig.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !host.classList.contains('open');
      host.classList.toggle('open', open);
      trig.setAttribute('aria-expanded', String(open));
    });
    host.querySelectorAll('.lang-opt').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
    document.addEventListener('click', (e) => { if (!host.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  return { lang, t, apply, setLang, mountSwitcher, locale: lang === 'de' ? 'de-DE' : 'en-GB' };
})();
const t = I18N.t;
