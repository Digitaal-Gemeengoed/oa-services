// Anonimiseren: tekst en blokken uit html, eigen patronen voor adressen,
// opschonen, en afschermen. De herkenning zelf is hier nagebootst; met
// OPENANONYMISER_TEST_URL draait er ook een test tegen een echte OpenAnonymiser.
import { test } from "node:test";
import assert from "node:assert/strict";
import { analyseer, lees, pasToe, openAnonymiser, elfproef } from "../dist/anonimiseren.js";
import { bouwServer } from "../dist/server.js";

const HTML =
  '<h1>Besluit op bezwaar</h1><p>Geachte <strong>heer De</strong> Vries,</p><p>U woont op de Kruisweg 12, 2011 LB Haarlem. Uw BSN is 111222333.</p>' +
  "<p>Het college van Burgemeester van Reenensingel 5 tot Haarlem.</p>" +
  "<table><tbody><tr><td>Contact</td><td>Sanne de Boer, 06-12345678</td></tr></tbody></table>";

/** Nagebootste motor: vindt wat een echte zou vinden, met de bekende eigenaardigheden. */
const nep = {
  naam: "nep",
  async analyseer(tekst) {
    const uit = [];
    const zoek = (type, s, score = 0.85) => {
      let i = -1;
      while ((i = tekst.indexOf(s, i + 1)) >= 0) uit.push({ type, begin: i, eind: i + s.length, score });
    };
    zoek("PERSON", "heer De Vries");
    zoek("PERSON", "Sanne de Boer");
    zoek("BSN", "111222333", 1);
    zoek("PHONE_NUMBER", "06-12345678", 0.6);
    zoek("PERSON", "Vries,", 0.5); // overlapt met een langere naam
    zoek("KVK_NUMBER", "12345678", 0.45); // in het telefoonnummer
    return uit;
  },
};

test("tekst per blok, met plek", () => {
  const k = lees(HTML);
  assert.equal(k.tekst, "Besluit op bezwaar\n\nGeachte heer De Vries,\n\nU woont op de Kruisweg 12, 2011 LB Haarlem. Uw BSN is 111222333.\n\nHet college van Burgemeester van Reenensingel 5 tot Haarlem.\n\nContact\n\nSanne de Boer, 06-12345678");
  assert.deepEqual(k.blokken.map((b) => [b.plek.pad, b.plek.beschrijving]), [
    ["body/0", "Kop"],
    ["body/1", "Alinea 1"],
    ["body/2", "Alinea 2"],
    ["body/3", "Alinea 3"],
    ["body/4/0/0/0", "Cel"],
    ["body/4/0/0/1", "Cel"],
  ]);
});

test("treffers: aanhef eraf, adres erbij, overlap en witruimte weg", async () => {
  const a = await analyseer(HTML, nep);
  assert.deepEqual(
    a.treffers.map((t) => [t.soort, t.tekst, t.bron]),
    [
      ["naam", "De Vries", "model"],
      ["adres", "Kruisweg 12, 2011 LB Haarlem", "patroon"],
      ["bsn", "111222333", "model"],
      ["adres", "Burgemeester van Reenensingel 5", "patroon"],
      ["naam", "Sanne de Boer", "model"],
      ["telefoon", "06-12345678", "model"],
    ],
  );
  assert.equal(a.treffers[0].plek.pad, "body/1");
  assert.ok(a.standaard.includes("adres") && !a.standaard.includes("datum"));
});

const leeg = { naam: "leeg", async analyseer() { return []; } };

test("BSN met puntjes of spaties, alleen met de elfproef; postcode ook met SD", async () => {
  assert.equal(elfproef("688746305"), true);
  assert.equal(elfproef("688746306"), false);
  const a = await analyseer("<p>BSN 6887.46.305, oud 688 746 305, fout 6887.46.306, rekening 1234.56.789,00. Postcode 2071 SD Duinmeer.</p>", leeg);
  assert.deepEqual(a.treffers.map((t) => [t.soort, t.tekst]), [
    ["bsn", "6887.46.305"],
    ["bsn", "688 746 305"],
    ["adres", "2071 SD Duinmeer"],
  ]);
});

test("geboortedatum uit de zin; staat standaard aan", async () => {
  const a = await analyseer("<p>Mevrouw is geboren op 4 november 1946 en diende op 12-03-2026 bezwaar in. Geb. datum: 04-11-1946.</p>", leeg);
  assert.deepEqual(a.treffers.map((t) => [t.soort, t.tekst]), [
    ["geboortedatum", "4 november 1946"],
    ["geboortedatum", "04-11-1946"],
  ]);
  assert.ok(a.standaard.includes("geboortedatum"));
});

test("tabel: de kop zegt wat er in de kolom staat; plaatshouders blijven staan; wat gevonden is, staat elders ook", async () => {
  const html =
    "<h2>Bezwaren</h2><table><tbody>" +
    "<tr><td>Register 2026</td><td></td><td></td><td></td><td></td></tr>" + // titelrij
    "<tr><td>Voorletters</td><td>Achternaam</td><td>Volledige naam (formule)</td><td>Geboortedatum</td><td>Naam document</td></tr>" +
    "<tr><td>B. de</td><td>Graaf</td><td>[PERSOON 3] Graaf</td><td>24-10-2007</td><td>Bezwaarschrift</td></tr>" +
    "<tr><td>-</td><td>Bos</td><td>A. Bos</td><td>zie bijlage</td><td>Besluit</td></tr>" +
    "</tbody></table><p>Volgens Graaf en mevrouw Bos is dat zo. Het bos is mooi.</p>";
  const a = await analyseer(html, leeg);
  assert.deepEqual(a.treffers.map((t) => [t.soort, t.tekst]), [
    ["naam", "B. de"],
    ["naam", "Graaf"],
    ["naam", "Graaf"], // naast de plaatshouder
    ["geboortedatum", "24-10-2007"],
    ["naam", "Bos"],
    ["naam", "A. Bos"],
    ["naam", "Graaf"], // doorgezet in de alinea
    ["naam", "Bos"], // idem; "bos" met een kleine letter niet
  ]);
  // De blokken in het antwoord houden zich aan het contract.
  assert.ok(a.blokken.every((b) => Object.keys(b).sort().join() === "begin,eind,plek"));
});

test("afschermen: ook over opmaak heen; de opmaak blijft", async () => {
  const a = await analyseer(HTML, nep);
  const r = pasToe(HTML, a.treffers.filter((t) => t.tekst !== "Sanne de Boer" && t.soort !== "adres" || t.tekst.startsWith("Kruisweg")));
  assert.equal(
    r.html,
    '<h1>Besluit op bezwaar</h1><p>Geachte <strong>heer [PERSOON]</strong>,</p><p>U woont op de [ADRES]. Uw BSN is [BSN].</p>' +
      "<p>Het college van Burgemeester van Reenensingel 5 tot Haarlem.</p><table><tbody><tr><td>Contact</td><td>Sanne de Boer, [TELEFOON]</td></tr></tbody></table>",
  );
  assert.deepEqual(r.overzicht, { naam: 1, adres: 1, bsn: 1, telefoon: 1 });
});

test("de dienst: 503 zonder motor, 422 voor geen html, en heen en terug", async () => {
  const kop = { "x-oa-dienstsleutel": "test-sleutel-0123456789" };
  const zonder = bouwServer({ dienstsleutel: kop["x-oa-dienstsleutel"], log: false });
  const r0 = await zonder.inject({ method: "POST", url: "/anonimiseren", headers: kop, payload: { inhoud: { formaat: "html", mediaType: "text/html", codering: "tekst", data: HTML } } });
  assert.equal(r0.statusCode, 503);
  const app = bouwServer({ dienstsleutel: kop["x-oa-dienstsleutel"], log: false, anonimiseer: nep });
  const r1 = await app.inject({ method: "POST", url: "/anonimiseren", headers: kop, payload: { inhoud: { formaat: "docx", mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", codering: "base64", data: "UEsDBA==" } } });
  assert.equal(r1.statusCode, 422);
  const r2 = await app.inject({ method: "POST", url: "/anonimiseren", headers: kop, payload: { inhoud: { formaat: "html", mediaType: "text/html", codering: "tekst", data: HTML } } });
  const { treffers } = r2.json();
  const r3 = await app.inject({
    method: "POST",
    url: "/anonimiseren/toepassen",
    headers: kop,
    payload: { inhoud: { formaat: "html", mediaType: "text/html", codering: "tekst", data: HTML }, treffers: treffers.map(({ begin, eind, soort }) => ({ begin, eind, soort })) },
  });
  assert.equal(r3.statusCode, 200, r3.body);
  assert.doesNotMatch(r3.json().inhoud.data, /Vries|111222333|Kruisweg|Sanne/);
  const onbekend = bouwServer({ dienstsleutel: kop["x-oa-dienstsleutel"], log: false, anonimiseer: openAnonymiser("http://127.0.0.1:9", 500) });
  const r4 = await onbekend.inject({ method: "POST", url: "/anonimiseren", headers: kop, payload: { inhoud: { formaat: "html", mediaType: "text/html", codering: "tekst", data: HTML } } });
  assert.equal(r4.statusCode, 503);
  assert.equal(r4.json().fout, "anonimiseren-niet-bereikbaar");
});

test("tegen een echte OpenAnonymiser", { skip: !process.env.OPENANONYMISER_TEST_URL && "zet OPENANONYMISER_TEST_URL" }, async () => {
  const a = await analyseer(HTML, openAnonymiser(process.env.OPENANONYMISER_TEST_URL));
  const gevonden = a.treffers.map((t) => `${t.soort}:${t.tekst}`);
  for (const v of ["naam:De Vries", "naam:Sanne de Boer", "bsn:111222333", "adres:Kruisweg 12, 2011 LB Haarlem", "telefoon:06-12345678"]) assert.ok(gevonden.includes(v), `${v} niet in ${gevonden}`);
  assert.ok(!gevonden.some((g) => g.startsWith("kvk-nummer")), String(gevonden));
});
