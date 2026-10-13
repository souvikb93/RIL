/* Documentation + Contact pages (EN / DE).
   Written in our own words; links point to RLI's originals. Individual staff
   contacts are deliberately not copied — we link to the original app instead. */

const PAGES = (() => {
  const L = {
    epp: 'https://epp.rl-institut.de/',
    docs: 'https://epp-app.readthedocs.io/',
    code: 'https://github.com/empowerplan/epp-app/',
    apipe: 'https://github.com/rl-institut/apipe/',
    wam: 'https://wam.rl-institut.de/',
    eppProject: 'https://www.izt.de/projekte/empowerplan/',
    eppPlus: 'https://reiner-lemoine-institut.de/projekt/empowerplanplus/',
    report: 'https://doi.org/10.34657/21079',
    oekoArea: 'https://www.oeko.de/fileadmin/oekodoc/Gerechtigkeit-im-EE-Ausbau-Fl%C3%A4che.pdf',
    oekoSystem: 'https://www.oeko.de/fileadmin/oekodoc/Gerechtigkeit-im-EE-Ausbau-Systemische-Wirkung.pdf',
    dataset: 'https://doi.org/10.5281/zenodo.15188220',
    repo: 'https://github.com/souvikb93/RIL',
  };
  const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const partners = [
    ['Reiner Lemoine Institut (RLI)', 'https://reiner-lemoine-institut.de/'],
    ['IZT – Institut für Zukunftsstudien und Technologiebewertung', 'https://www.izt.de/'],
    ['Öko-Institut e.V.', 'https://www.oeko.de/'],
    ['team ewen', 'https://www.team-ewen.de/'],
    ['Regionale Planungsgemeinschaft Oderland-Spree', 'https://www.rpg-oderland-spree.de/'],
  ];
  const partnerList = `<ul class="plist">${partners.map(([n, h]) => `<li>${a(h, n)}</li>`).join('')}</ul>`;
  // Publication titles stay in their original German.
  const pubs = (de) => `<ul class="pubs">
      <li>${a(L.report, '„EmPowerPlan – Regionale Planung der Energiewende“')}<span>${de ? 'Abschlussbericht' : 'Final report (German)'}</span></li>
      <li>${a(L.oekoArea, '„Gerechtigkeit im EE-Ausbau: Erneuerbare gerecht in die Fläche bringen“')}<span>Öko-Institut${de ? '' : ' (German)'}</span></li>
      <li>${a(L.oekoSystem, '„Gerechtigkeit im EE-Ausbau: Systemische Wirkung gerechter EE-Verteilungen“')}<span>Öko-Institut${de ? '' : ' (German)'}</span></li>
      <li>${a(L.dataset, '„EmPowerPlan EE-Regionalisierungsszenarien“')}<span>${de ? 'Datensatz, frei nachnutzbar' : 'Dataset, open for reuse'}</span></li>
    </ul>`;
  const address = `<address class="addr">Reiner Lemoine Institut gGmbH<br>Rudower Chaussee 12, Aufgang D<br>12489 Berlin</address>`;

  const C = {
    en: {
      docs: `
        <h1>Documentation</h1>
        <p class="plead">This is an independent redesign concept of EmPowerPlan, the tool the Reiner Lemoine Institut (RLI) and partners built for the Oderland-Spree planning region. It is not RLI’s official app.</p>
        <section class="pcard"><h2>How this redesign works</h2>
          <dl class="pdl">
            <dt>Today</dt><dd>Shows where each district stands on renewables, land use and electricity demand.</dd>
            <dt>Plan</dt><dd>Start from a state target or your own values and see the effect on share, land and municipal income.</dd>
            <dt>My Place</dt><dd>Pick a town to see the nearest wind area, nearby turbines and § 6 EEG income.</dd>
          </dl>
          <p class="pnote">All figures follow the assumptions listed under “Assumptions &amp; data sources” in the app. Some map layers are simulated for demonstration.</p>
        </section>
        <section class="pcard"><h2>The original tool</h2>
          <p>EmPowerPlan helps people in Oderland-Spree explore the regional energy transition. It came out of the research projects ${a(L.eppProject, 'EmPowerPlan')} and ${a(L.eppPlus, 'EmPowerPlan+')}.</p>
          <ul class="plinks">
            <li>${a(L.epp, 'Open the original app')}</li>
            <li>${a(L.docs, 'Methods and user guide')} <span>ReadTheDocs</span></li>
            <li>${a(L.code, 'Source code')} <span>GitHub</span></li>
            <li>${a(L.apipe, 'Data pipeline “apipe”')} <span>GitHub</span></li>
            <li>${a(L.wam, 'More RLI tools and maps')} <span>WAM portal</span></li>
          </ul>
        </section>
        <section class="pcard"><h2>Publications</h2>${pubs(false)}</section>
        <section class="pcard"><h2>Project partners</h2>${partnerList}</section>`,
      contact: `
        <h1>Contact</h1>
        <p class="plead">This version of EmPowerPlan is a design prototype, not an official service. For anything about the original tool, its data or methods, please contact the Reiner Lemoine Institut.</p>
        <section class="pcard"><h2>Reiner Lemoine Institut</h2>
          ${address}
          <p class="ptel">Phone <a href="tel:+493012084340">+49 30 1208 434 0</a></p>
          <ul class="plinks">
            <li>${a(L.epp, 'Contact people for EmPowerPlan')} <span>in the original app</span></li>
            <li>${a(L.wam, 'RLI tools and maps')} <span>WAM portal</span></li>
          </ul>
        </section>
        <section class="pcard"><h2>This redesign</h2>
          <p>Feedback on this redesign is welcome via the project repository.</p>
          <ul class="plinks"><li>${a(L.repo, 'Redesign on GitHub')}</li></ul>
        </section>`,
    },
    de: {
      docs: `
        <h1>Dokumentation</h1>
        <p class="plead">Dies ist ein unabhängiges Redesign-Konzept von EmPowerPlan – dem Tool, das das Reiner Lemoine Institut (RLI) mit Partnern für die Planungsregion Oderland-Spree entwickelt hat. Es ist nicht die offizielle App des RLI.</p>
        <section class="pcard"><h2>So funktioniert dieses Redesign</h2>
          <dl class="pdl">
            <dt>Heute</dt><dd>Zeigt, wo jeder Kreis bei Erneuerbaren, Flächennutzung und Strombedarf steht.</dd>
            <dt>Planen</dt><dd>Starten Sie mit einem Landesziel oder eigenen Werten und sehen Sie die Folgen für Anteil, Fläche und Einnahmen der Gemeinden.</dd>
            <dt>Mein Ort</dt><dd>Wählen Sie einen Ort und sehen Sie die nächste Windfläche, Windräder in der Nähe und Einnahmen nach § 6 EEG.</dd>
          </dl>
          <p class="pnote">Alle Zahlen beruhen auf den Annahmen unter „Annahmen &amp; Datenquellen“ in der App. Einige Kartenebenen sind zu Demonstrationszwecken simuliert.</p>
        </section>
        <section class="pcard"><h2>Das Original-Tool</h2>
          <p>EmPowerPlan unterstützt Akteure in Oderland-Spree dabei, die regionale Energiewende zu erkunden. Es ist aus den Forschungsprojekten ${a(L.eppProject, 'EmPowerPlan')} und ${a(L.eppPlus, 'EmPowerPlan+')} hervorgegangen.</p>
          <ul class="plinks">
            <li>${a(L.epp, 'Original-App öffnen')}</li>
            <li>${a(L.docs, 'Methodik und Anleitung')} <span>ReadTheDocs</span></li>
            <li>${a(L.code, 'Quellcode')} <span>GitHub</span></li>
            <li>${a(L.apipe, 'Daten-Pipeline „apipe“')} <span>GitHub</span></li>
            <li>${a(L.wam, 'Weitere Tools und Karten des RLI')} <span>WAM-Portal</span></li>
          </ul>
        </section>
        <section class="pcard"><h2>Veröffentlichungen</h2>${pubs(true)}</section>
        <section class="pcard"><h2>Projektpartner</h2>${partnerList}</section>`,
      contact: `
        <h1>Kontakt</h1>
        <p class="plead">Diese Version von EmPowerPlan ist ein Design-Prototyp und kein offizielles Angebot. Bei Fragen zum Original-Tool, zu Daten oder Methodik wenden Sie sich bitte an das Reiner Lemoine Institut.</p>
        <section class="pcard"><h2>Reiner Lemoine Institut</h2>
          ${address}
          <p class="ptel">Telefon <a href="tel:+493012084340">+49 30 1208 434 0</a></p>
          <ul class="plinks">
            <li>${a(L.epp, 'Ansprechpersonen für EmPowerPlan')} <span>in der Original-App</span></li>
            <li>${a(L.wam, 'Tools und Karten des RLI')} <span>WAM-Portal</span></li>
          </ul>
        </section>
        <section class="pcard"><h2>Dieses Redesign</h2>
          <p>Feedback zu diesem Redesign gern über das Projekt-Repository.</p>
          <ul class="plinks"><li>${a(L.repo, 'Redesign auf GitHub')}</li></ul>
        </section>`,
    },
  };
  return C[I18N.lang];
})();
