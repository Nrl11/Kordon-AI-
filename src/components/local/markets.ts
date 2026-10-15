/* Market packs for the «Local laws. Local languages.» block. Each market has
   a sample request in a local language with local ID formats, and the profile
   Kordon applies there: privacy law, languages, ID formats, routing.
   All names and numbers are fictional samples in the official example formats. */

export type Part = string | { t: string; label: string; token: string };

export interface Market {
  id: string;
  name: string;
  /** short line under the market name */
  laws: string;
  /** language of the sample request, and its code for the lang attribute */
  lang: string;
  code: string;
  req: Part[];
  rows: { k: string; v: string }[];
}

/* a plain string splits into words; «,» sticks to the word before it */
export const words = (parts: Part[]): Part[] =>
  parts.flatMap<Part>((p) => (typeof p === "string" ? p.split(" ").filter(Boolean) : [p]));

export const MARKETS: Market[] = [
  {
    id: "us",
    name: "United States",
    laws: "CCPA · HIPAA",
    lang: "Spanish",
    code: "es",
    req: [
      "Resume la visita de",
      { t: "María López", label: "Name", token: "NAME_1" },
      ",",
      { t: "MRN 448-21-907", label: "Medical record", token: "MRN_1" },
      ",",
      { t: "SSN 123-45-6789", label: "SSN", token: "SSN_1" },
    ],
    rows: [
      { k: "Privacy law", v: "CCPA, HIPAA" },
      { k: "Languages", v: "English, Spanish" },
      { k: "ID formats", v: "SSN, ITIN, MRN, driver’s license" },
      { k: "Routing", v: "Approved US models or local" },
    ],
  },
  {
    id: "eu",
    name: "European Union",
    laws: "GDPR",
    lang: "German",
    code: "de",
    req: [
      "Mahnung an",
      { t: "Jonas Weber", label: "Name", token: "NAME_1" },
      ",",
      { t: "IBAN DE89 3704 0044 0532 0130 00", label: "IBAN", token: "IBAN_1" },
      ", fällig am 30. Juni",
    ],
    rows: [
      { k: "Privacy law", v: "GDPR" },
      { k: "Languages", v: "German, French, Italian and 21 more" },
      { k: "ID formats", v: "IBAN, national ID, tax ID" },
      { k: "Routing", v: "EU-hosted models or local" },
    ],
  },
  {
    id: "ca",
    name: "Canada",
    laws: "PIPEDA · Law 25",
    lang: "French",
    code: "fr",
    req: [
      "Rédige une lettre à",
      { t: "Émilie Roy", label: "Name", token: "NAME_1" },
      ",",
      { t: "NAS 046 454 286", label: "SIN", token: "SIN_1" },
      ", Montréal",
    ],
    rows: [
      { k: "Privacy law", v: "PIPEDA, Quebec Law 25" },
      { k: "Languages", v: "English, French" },
      { k: "ID formats", v: "SIN, health card, driver’s licence" },
      { k: "Routing", v: "Canadian region or local" },
    ],
  },
  {
    id: "br",
    name: "Brazil",
    laws: "LGPD",
    lang: "Portuguese",
    code: "pt",
    req: [
      "Analise o contrato de",
      { t: "Ana Souza", label: "Name", token: "NAME_1" },
      ",",
      { t: "CPF 123.456.789-09", label: "CPF", token: "CPF_1" },
      ", saldo em aberto",
    ],
    rows: [
      { k: "Privacy law", v: "LGPD" },
      { k: "Languages", v: "Portuguese" },
      { k: "ID formats", v: "CPF, RG, CNPJ" },
      { k: "Routing", v: "Approved models or local" },
    ],
  },
  {
    id: "mx",
    name: "Mexico",
    laws: "LFPDPPP",
    lang: "Spanish",
    code: "es",
    req: [
      "Valida el alta de",
      { t: "Luis Hernández", label: "Name", token: "NAME_1" },
      ",",
      { t: "CURP HEGL850101HDFRRS09", label: "CURP", token: "CURP_1" },
    ],
    rows: [
      { k: "Privacy law", v: "LFPDPPP" },
      { k: "Languages", v: "Spanish" },
      { k: "ID formats", v: "CURP, RFC, INE voter ID" },
      { k: "Routing", v: "Approved models or local" },
    ],
  },
  {
    id: "in",
    name: "India",
    laws: "DPDP Act",
    lang: "English",
    code: "en",
    req: [
      "Verify KYC for",
      { t: "Priya Sharma", label: "Name", token: "NAME_1" },
      ",",
      { t: "Aadhaar 2345 6789 0123", label: "Aadhaar", token: "AADHAAR_1" },
      ",",
      { t: "PAN ABCDE1234F", label: "PAN", token: "PAN_1" },
    ],
    rows: [
      { k: "Privacy law", v: "DPDP Act" },
      { k: "Languages", v: "English, Hindi" },
      { k: "ID formats", v: "Aadhaar, PAN, voter ID" },
      { k: "Routing", v: "Approved models or local" },
    ],
  },
];
