"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  FileText,
  Image as ImageIcon,
  Shield,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// API Base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ez-pay.realestway.com/api";

// Scoring interfaces
interface ImageQualityScore {
  score: number;
  issues: string[];
  exists: boolean;
  resolution: { width: number; height: number } | null;
  fileSize: number | null;
  isBlurred: boolean;
  isDuplicate: boolean;
  categoryMatch: boolean;
}

interface DocumentScore {
  score: number;
  issues: string[];
  exists: boolean;
  fileType: string | null;
  ocrConfidence: number | null;
  extractedName: string | null;
  nameMatch: boolean;
  completeness: boolean;
}

interface DataConsistencyScore {
  score: number;
  issues: string[];
  stateLgaMatch: boolean;
  addressLocationMatch: boolean;
  topologyUnitsMatch: boolean;
  rentReasonable: boolean;
  ownershipLogic: boolean;
}

interface RiskScore {
  score: number;
  level: "Low" | "Medium" | "High";
  issues: string[];
  duplicateDocuments: boolean;
  suspiciousRent: boolean;
  missingEvidence: boolean;
}

interface PropertyScores {
  imageQuality: ImageQualityScore;
  documentVerification: DocumentScore;
  dataConsistency: DataConsistencyScore;
  riskAssessment: RiskScore;
  finalScore: number;
  recommendation: "Auto-Approve" | "Manual Review" | "Reject";
}

// Nigerian states and LGAs for validation
const NIGERIAN_STATES_LGAS: Record<string, string[]> = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],
  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  "Akwa Ibom": [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat Enin",
    "Nsit Atai",
    "Nsit Ibom",
    "Nsit Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],
  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  Bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],
  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],
  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Oturkpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],
  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],
  "Cross River": [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakurr",
    "Yala",
  ],
  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],
  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaozara",
    "Ohaukwu",
    "Onicha",
  ],
  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba-Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],
  Ekiti: [
    "Ado Ekiti",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],
  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],
  FCT: [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
  ],
  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shomgom",
    "Yamaltu/Deba",
  ],
  Imo: [
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Onuimo",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
  ],
  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],
  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],
  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],
  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dan Musa",
    "Dandume",
    "Danja",
    "Daura",
    "Dutsi",
    "Dutsin-Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],
  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],
  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela-Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Mangongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],
  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju/Lekki",
    "Ifako-Ijaye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],
  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa-Eggon",
    "Obi",
    "Toto",
    "Wamba",
  ],
  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Muya",
    "Pailoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],
  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Sagamu",
  ],
  Ondo: [
    "Akoko North East",
    "Akoko North West",
    "Akoko South Akure East",
    "Akoko South West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],
  Osun: [
    "Aiyedaade",
    "Aiyedire",
    "Atakumosa East",
    "Atakumosa West",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Egbedore",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesha East",
    "Ilesha West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],
  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan Central",
    "Ibadan North",
    "Ibadan North West",
    "Ibadan South East",
    "Ibadan South West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ibarapa West",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],
  Plateau: [
    "Barikin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],
  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Emohua",
    "Eleme",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obia/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omumma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],
  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tqngaza",
    "Tureta",
    "Wamako",
    "Wurno",
    "Yabo",
  ],
  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karin Lamido",
    "Kurmi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],
  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Karawa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
  ],
  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji",
    "Bukkuyum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],
};

// Average rent ranges by state (monthly in Naira)
const AVERAGE_RENTS: Record<string, { min: number; max: number }> = {
  Lagos: { min: 800000, max: 5000000 },
  Abuja: { min: 600000, max: 3000000 },
  "Port Harcourt": { min: 400000, max: 2000000 },
  Kano: { min: 200000, max: 800000 },
  Ibadan: { min: 250000, max: 1000000 },
  Kaduna: { min: 200000, max: 800000 },
  Enugu: { min: 200000, max: 800000 },
  Benin: { min: 200000, max: 600000 },
  Ogun: { min: 150000, max: 500000 },
  default: { min: 100000, max: 500000 },
};

interface PropertyData {
  id: string;
  full_name: string;
  designation?: string;
  business_name?: string;
  property_address: string;
  state: string;
  area: string;
  typology: string;
  no_of_units: number;
  rent: number;
  ownership_doc?: string;
  gov_id?: string;
  cac_cert?: string;
  exterior_shot?: string;
  interior_rooms?: string[];
  [key: string]: any;
}

interface PropertyScoringEngineProps {
  propertyData: PropertyData;
  onScoreUpdate?: (scores: PropertyScores) => void;
}

export default function PropertyScoringEngine({
  propertyData,
  onScoreUpdate,
}: PropertyScoringEngineProps) {
  const [scores, setScores] = useState<PropertyScores | null>(null);
  const [loading, setLoading] = useState(true);

  // Image quality verification
  const checkImageQuality = async (
    imageUrl: string,
    category: string
  ): Promise<ImageQualityScore> => {
    const score: ImageQualityScore = {
      score: 0,
      issues: [],
      exists: false,
      resolution: null,
      fileSize: null,
      isBlurred: false,
      isDuplicate: false,
      categoryMatch: true,
    };

    if (!imageUrl) {
      score.issues.push("Image not provided");
      return score;
    }

    // Ensure full URL for realestway.com images
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `https://ez-pay.realestway.com${
          imageUrl.startsWith("/") ? "" : "/"
        }${imageUrl}`;

    try {
      // Check if image exists and loads
      const response = await fetch(fullImageUrl, { method: "HEAD" });
      if (!response.ok) {
        score.issues.push("Image does not load");
        return score;
      }

      score.exists = true;
      score.fileSize = parseInt(response.headers.get("content-length") || "0");

      // Basic file size check (should be reasonable for property images)
      if (score.fileSize && score.fileSize < 50000) {
        // Less than 50KB
        score.issues.push("Image file size too small");
      } else if (score.fileSize && score.fileSize > 10000000) {
        // More than 10MB
        score.issues.push("Image file size too large");
      }

      // For now, we'll assume minimum resolution and no blur detection
      // In a real implementation, you'd use canvas API or a backend service
      score.resolution = { width: 1024, height: 768 }; // Placeholder

      // Calculate score based on available checks
      let qualityScore = 100;
      if (score.issues.length > 0) {
        qualityScore -= score.issues.length * 20;
      }
      score.score = Math.max(0, qualityScore);
    } catch (error) {
      score.issues.push("Failed to verify image");
    }

    return score;
  };

  // Document verification
  const checkDocumentVerification = async (
    docUrl: string,
    docType: string,
    expectedName: string
  ): Promise<DocumentScore> => {
    const score: DocumentScore = {
      score: 0,
      issues: [],
      exists: false,
      fileType: null,
      ocrConfidence: null,
      extractedName: null,
      nameMatch: false,
      completeness: false,
    };

    if (!docUrl) {
      score.issues.push(`${docType} not provided`);
      return score;
    }

    // Ensure full URL for realestway.com documents
    const fullDocUrl = docUrl.startsWith("http")
      ? docUrl
      : `https://ez-pay.realestway.com${
          docUrl.startsWith("/") ? "" : "/"
        }${docUrl}`;

    try {
      const response = await fetch(fullDocUrl, { method: "HEAD" });
      if (!response.ok) {
        score.issues.push(`${docType} does not load`);
        return score;
      }

      score.exists = true;
      const contentType = response.headers.get("content-type") || "";
      score.fileType = contentType;

      // Check file type
      if (docType === "gov_id" || docType === "cac_cert") {
        if (!contentType.includes("pdf") && !contentType.includes("image/")) {
          score.issues.push(`Invalid file type for ${docType}`);
        }
      }

      // For now, assume OCR confidence and name extraction
      // In real implementation, this would use OCR service
      score.ocrConfidence = 85; // Placeholder
      score.extractedName = expectedName; // Placeholder
      score.nameMatch = true;
      score.completeness = true;

      // Calculate score
      let docScore = 100;
      if (score.issues.length > 0) {
        docScore -= score.issues.length * 25;
      }
      if (score.ocrConfidence && score.ocrConfidence < 70) {
        docScore -= 20;
      }
      if (!score.nameMatch) {
        docScore -= 30;
      }
      score.score = Math.max(0, docScore);
    } catch (error) {
      score.issues.push(`Failed to verify ${docType}`);
    }

    return score;
  };

  // Data consistency checks
  const checkDataConsistency = (data: PropertyData): DataConsistencyScore => {
    const score: DataConsistencyScore = {
      score: 100,
      issues: [],
      stateLgaMatch: true,
      addressLocationMatch: true,
      topologyUnitsMatch: true,
      rentReasonable: true,
      ownershipLogic: true,
    };

    // State and LGA consistency
    const stateLgas = NIGERIAN_STATES_LGAS[data.state];
    if (stateLgas && !stateLgas.includes(data.area)) {
      score.stateLgaMatch = false;
      score.issues.push(
        `LGA "${data.area}" does not belong to state "${data.state}"`
      );
      score.score -= 20;
    }

    // Address and location consistency (basic check)
    if (
      !data.property_address.toLowerCase().includes(data.state.toLowerCase())
    ) {
      score.addressLocationMatch = false;
      score.issues.push("Property address doesn't match selected state");
      score.score -= 15;
    }

    // Topology and units logic
    const topology = data.typology.toLowerCase();
    const units = data.noOfUnits;
    if (topology.includes("single") && units > 1) {
      score.topologyUnitsMatch = false;
      score.issues.push("Single-family property should have 1 unit");
      score.score -= 15;
    }

    // Rent reasonableness
    const avgRent = AVERAGE_RENTS[data.state] || AVERAGE_RENTS.default;
    const monthlyRent = data.rent;
    if (monthlyRent < avgRent.min * 0.3 || monthlyRent > avgRent.max * 3) {
      score.rentReasonable = false;
      score.issues.push(`Rent amount seems unreasonable for ${data.state}`);
      score.score -= 25;
    }

    // Ownership logic
    if (data.designation === "Property Owner" && !data.ownershipDoc) {
      score.ownershipLogic = false;
      score.issues.push("Ownership document required for property owner");
      score.score -= 30;
    }
    if (data.businessName && !data.cacCert) {
      score.ownershipLogic = false;
      score.issues.push("CAC certificate required for business");
      score.score -= 30;
    }

    return score;
  };

  // Risk assessment
  const checkRiskAssessment = (data: PropertyData): RiskScore => {
    const score: RiskScore = {
      score: 100,
      level: "Low",
      issues: [],
      duplicateDocuments: false,
      suspiciousRent: false,
      missingEvidence: false,
    };

    // Check for missing mandatory evidence
    const missingDocs: string[] = [];
    if (!data.ownershipDoc) missingDocs.push("ownership document");
    if (!data.govId) missingDocs.push("government ID");
    if (data.businessName && !data.cacCert) missingDocs.push("CAC certificate");
    if (!data.exteriorShot) missingDocs.push("exterior photo");

    if (missingDocs.length > 0) {
      score.missingEvidence = true;
      score.issues.push(`Missing: ${missingDocs.join(", ")}`);
      score.score -= missingDocs.length * 15;
    }

    // Suspicious rent check
    const avgRent = AVERAGE_RENTS[data.state] || AVERAGE_RENTS.default;
    if (data.rent < avgRent.min * 0.5) {
      score.suspiciousRent = true;
      score.issues.push("Rent significantly below market average");
      score.score -= 20;
    }

    // Determine risk level
    if (score.score >= 80) {
      score.level = "Low";
    } else if (score.score >= 50) {
      score.level = "Medium";
    } else {
      score.level = "High";
    }

    return score;
  };

  // Calculate final scores
  const calculateScores = async (): Promise<PropertyScores> => {
    const imageQualityPromises = [];

    // Check exterior shot
    if (propertyData.exteriorShot) {
      imageQualityPromises.push(
        checkImageQuality(propertyData.exteriorShot, "exterior")
      );
    }

    // Check interior rooms (assuming array)
    if (
      propertyData.interiorRooms &&
      Array.isArray(propertyData.interiorRooms)
    ) {
      propertyData.interiorRooms.forEach((url) => {
        imageQualityPromises.push(checkImageQuality(url, "interior"));
      });
    }

    const imageScores = await Promise.all(imageQualityPromises);
    const avgImageScore =
      imageScores.length > 0
        ? imageScores.reduce((sum, score) => sum + score.score, 0) /
          imageScores.length
        : 0;

    // Document verification
    const documentPromises = [
      checkDocumentVerification(
        propertyData.govId || "",
        "gov_id",
        propertyData.fullName
      ),
      checkDocumentVerification(
        propertyData.ownershipDoc || "",
        "ownership_doc",
        propertyData.fullName
      ),
    ];

    if (propertyData.businessName) {
      documentPromises.push(
        checkDocumentVerification(
          propertyData.cacCert || "",
          "cac_cert",
          propertyData.businessName
        )
      );
    }

    const documentScores = await Promise.all(documentPromises);
    const avgDocumentScore =
      documentScores.reduce((sum, score) => sum + score.score, 0) /
      documentScores.length;

    // Data consistency
    const dataConsistency = checkDataConsistency(propertyData);

    // Risk assessment
    const riskAssessment = checkRiskAssessment(propertyData);

    // Calculate final score with weights
    const finalScore = Math.round(
      avgImageScore * 0.25 +
        avgDocumentScore * 0.35 +
        dataConsistency.score * 0.25 +
        riskAssessment.score * 0.15
    );

    // Determine recommendation
    let recommendation: "Auto-Approve" | "Manual Review" | "Reject";
    if (finalScore >= 80) {
      recommendation = "Auto-Approve";
    } else if (finalScore >= 50) {
      recommendation = "Manual Review";
    } else {
      recommendation = "Reject";
    }

    return {
      imageQuality: {
        score: avgImageScore,
        issues: imageScores.flatMap((s) => s.issues),
        exists: imageScores.some((s) => s.exists),
        resolution: null,
        fileSize: null,
        isBlurred: false,
        isDuplicate: false,
        categoryMatch: true,
      },
      documentVerification: {
        score: avgDocumentScore,
        issues: documentScores.flatMap((s) => s.issues),
        exists: documentScores.some((s) => s.exists),
        fileType: null,
        ocrConfidence: null,
        extractedName: null,
        nameMatch: documentScores.every((s) => s.nameMatch),
        completeness: documentScores.every((s) => s.completeness),
      },
      dataConsistency,
      riskAssessment,
      finalScore,
      recommendation,
    };
  };

  useEffect(() => {
    const loadScores = async () => {
      setLoading(true);
      try {
        const calculatedScores = await calculateScores();
        setScores(calculatedScores);
        onScoreUpdate?.(calculatedScores);
      } catch (error) {
        console.error("Error calculating scores:", error);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, [propertyData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            {/* <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" /> */}
            <p className="text-gray-500 mt-2">
              Analyzing property submission...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scores) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <XCircle className="h-8 w-8 mx-auto" />
            <p className="mt-2">Failed to calculate scores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Auto-Approve":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "Manual Review":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "Reject":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Final Score & Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Property Review Score</span>
            <div className="flex items-center gap-2">
              {getRecommendationIcon(scores.recommendation)}
              <Badge
                variant={
                  scores.recommendation === "Auto-Approve"
                    ? "default"
                    : scores.recommendation === "Manual Review"
                    ? "secondary"
                    : "destructive"
                }
              >
                {scores.recommendation}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div
              className={`text-4xl font-bold ${getScoreColor(
                scores.finalScore
              )}`}
            >
              {scores.finalScore}/100
            </div>
            <Progress value={scores.finalScore} className="mt-4" />
            <p className="text-sm text-gray-600 mt-2">
              Overall property submission quality score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Quality (25%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Score</span>
                <span
                  className={`font-semibold ${getScoreColor(
                    scores.imageQuality.score
                  )}`}
                >
                  {Math.round(scores.imageQuality.score)}/100
                </span>
              </div>
              <Progress value={scores.imageQuality.score} />
              {scores.imageQuality.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Issues:</p>
                  {scores.imageQuality.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Verification (35%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Score</span>
                <span
                  className={`font-semibold ${getScoreColor(
                    scores.documentVerification.score
                  )}`}
                >
                  {Math.round(scores.documentVerification.score)}/100
                </span>
              </div>
              <Progress value={scores.documentVerification.score} />
              {scores.documentVerification.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Issues:</p>
                  {scores.documentVerification.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Consistency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Data Consistency (25%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Score</span>
                <span
                  className={`font-semibold ${getScoreColor(
                    scores.dataConsistency.score
                  )}`}
                >
                  {scores.dataConsistency.score}/100
                </span>
              </div>
              <Progress value={scores.dataConsistency.score} />
              {scores.dataConsistency.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Issues:</p>
                  {scores.dataConsistency.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Assessment (15%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Score</span>
                <span
                  className={`font-semibold ${getScoreColor(
                    scores.riskAssessment.score
                  )}`}
                >
                  {scores.riskAssessment.score}/100
                </span>
              </div>
              <Progress value={scores.riskAssessment.score} />
              <div className="flex justify-between items-center">
                <span className="text-sm">Risk Level</span>
                <Badge
                  className={getRiskBadgeColor(scores.riskAssessment.level)}
                >
                  {scores.riskAssessment.level}
                </Badge>
              </div>
              {scores.riskAssessment.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-600">Issues:</p>
                  {scores.riskAssessment.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-red-600">
                      • {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Review Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() =>
                window.open(
                  `${API_BASE_URL}/properties/${propertyData.id}/download-all`,
                  "_blank"
                )
              }
            >
              <Download className="h-4 w-4" />
              Download All Documents
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                const images = [];
                if (propertyData.exteriorShot) {
                  const url = propertyData.exteriorShot.startsWith("http")
                    ? propertyData.exteriorShot
                    : `https://ez-pay.realestway.com${
                        propertyData.exteriorShot.startsWith("/") ? "" : "/"
                      }${propertyData.exteriorShot}`;
                  images.push(url);
                }
                if (
                  propertyData.interiorRooms &&
                  Array.isArray(propertyData.interiorRooms)
                ) {
                  propertyData.interiorRooms.forEach((img: string) => {
                    const url = img.startsWith("http")
                      ? img
                      : `https://ez-pay.realestway.com${
                          img.startsWith("/") ? "" : "/"
                        }${img}`;
                    images.push(url);
                  });
                }
                if (images.length > 0) {
                  window.open(images[0], "_blank");
                }
              }}
            >
              <Eye className="h-4 w-4" />
              Preview Images
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
