// Built-in sample schedule (customer names, addresses, contacts, site notes).
// All data is fictional sample content for the prototype.
import { BRANCH, days, loopLength, miles, optimizeRoute, type Stop, type StopType, type Trip } from "./trips";

type Seed = Omit<Stop, "id" | "window" | "completed">;
const S = (type: StopType, customer: string, address: string, lat: number, lng: number, equipment: string, qty: number, contactName: string, contactPhone: string, notes: string): Seed =>
  ({ type, customer, address, lat, lng, equipment, qty, contactName, contactPhone, notes });

// Stops are listed in no particular order — routes are optimized below.
const schedule: Record<string, [Seed[], Seed[]]> = {
  mon: [
    [
      S("delivery", "Summit Roofing Co.", "1720 Telegraph Ave, Berkeley, CA", 37.8698, -122.2593, "Boom Lift 45ft — #BL-0932", 1, "Dale Morgan", "(510) 555-0142", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
      S("delivery", "Apex Construction", "455 Market St, Oakland, CA", 37.8044, -122.2712, "Scissor Lift 19ft — #SL-4471", 1, "Rosa Lin", "(510) 555-0178", "Loading dock is on 5th St side. Call 15 min before arrival."),
      S("pickup", "Bayview Builders", "88 Harbor Blvd, Alameda, CA", 37.7712, -122.2824, "Mini Excavator 3.5T — #EX-2210", 1, "Tom Becker", "(510) 555-0119", "Unit is staged behind the blue trailer. Keys in lockbox, code 4471."),
    ],
    [
      S("delivery", "Metro Electric", "62 Fulton Rd, Hayward, CA", 37.6688, -122.0808, "Light Tower — #LT-3305", 2, "Kevin Ortiz", "(510) 555-0163", "Drop both towers along the north fence. Do not block the fire lane."),
      S("pickup", "Greenline Landscaping", "301 Elm St, San Leandro, CA", 37.7249, -122.1561, "Skid Steer Loader — #SS-1188", 1, "Ana Flores", "(510) 555-0127", "Gate code 2290#. Machine may need a wash-down before loading."),
      S("delivery", "Castro Valley Medical", "20103 Lake Chabot Rd, Castro Valley, CA", 37.6966, -122.0864, "Telehandler 10K — #TH-5520", 1, "Brian Shaw", "(510) 555-0191", "Hospital zone — 5 mph, no horn. Report to security booth first."),
    ],
  ],
  tue: [
    [
      S("delivery", "Fremont Logistics Hub", "45500 Fremont Blvd, Fremont, CA", 37.4904, -121.9431, "Forklift 5K — #FL-7781", 1, "Liam Patel", "(510) 555-0104", "Use truck entrance on Grimmer Blvd. Wear hi-vis vest on site."),
      S("pickup", "Union City Paving", "33300 Alvarado-Niles Rd, Union City, CA", 37.5934, -122.0438, "Plate Compactor — #PC-1420", 3, "Gina Russo", "(510) 555-0155", "Three compactors on pallets by the trailer office. Forklift on site."),
      S("delivery", "Newark Tech Park", "39899 Balentine Dr, Newark, CA", 37.5374, -122.0050, "Scissor Lift 26ft — #SL-6630", 2, "Omar Haddad", "(510) 555-0133", "Building C, roll-up door 4. Floor protection mats required inside."),
      S("pickup", "Hayward Shoreline Works", "3800 Arden Rd, Hayward, CA", 37.6311, -122.1336, "Air Compressor 185 CFM — #AC-0218", 1, "Pat Nguyen", "(510) 555-0170", "Gravel lot — stay on the marked path. Tow hitch is 2-5/16\"."),
    ],
    [
      S("delivery", "San Lorenzo Schools", "15510 Usher St, San Lorenzo, CA", 37.6849, -122.1345, "Boom Lift 60ft — #BL-1144", 1, "Dale Whitman", "(510) 555-0186", "Deliver after 3:00 PM only (school dismissal). Check in at main office."),
      S("pickup", "Oakland Port Annex", "1 Ferro St, Oakland, CA", 37.7955, -122.2840, "Generator 56kW — #GN-3009", 1, "Mike Duran", "(510) 555-0112", "TWIC escort required. Meet escort at Gate B."),
      S("delivery", "Emeryville Lofts", "5900 Hollis St, Emeryville, CA", 37.8410, -122.2896, "Trench Shoring Box — #TS-0811", 1, "Jen Park", "(510) 555-0148", "Street parking only — place cones before offloading."),
    ],
  ],
  wed: [
    [
      S("delivery", "Dublin Retail Center", "4550 Tassajara Rd, Dublin, CA", 37.7049, -121.8713, "Scissor Lift 32ft — #SL-9012", 2, "Chris Allen", "(925) 555-0121", "Back lot behind Target. Offload on asphalt only."),
      S("pickup", "Pleasanton Civic", "200 Old Bernal Ave, Pleasanton, CA", 37.6624, -121.8747, "Light Tower — #LT-2201", 2, "Maria Gomez", "(925) 555-0166", "Towers staged by the parking structure ramp."),
      S("delivery", "Livermore Winery Build", "5565 Tesla Rd, Livermore, CA", 37.6600, -121.7210, "Mini Excavator 5T — #EX-3381", 1, "Dale Hughes", "(925) 555-0109", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
    ],
    [
      S("pickup", "San Ramon Office Park", "2600 Camino Ramon, San Ramon, CA", 37.7725, -121.9686, "Boom Lift 40ft — #BL-0477", 1, "Steve Kwan", "(925) 555-0182", "Unit is on level P2 — max clearance 8'2\". Use spotter."),
      S("delivery", "Danville Residence", "500 La Gonda Way, Danville, CA", 37.8121, -122.0143, "Skid Steer Loader — #SS-2290", 1, "Laura Benton", "(925) 555-0137", "Residential street — narrow. Homeowner will move cars; call on arrival."),
      S("delivery", "Castro Valley Plaza", "3295 Castro Valley Blvd, Castro Valley, CA", 37.6941, -122.0726, "Plate Compactor — #PC-1503", 2, "Ray Soto", "(510) 555-0198", "Deliver to rear service alley. Store manager signs the ticket."),
    ],
  ],
  thu: [
    [
      S("delivery", "Richmond Refinery Gate 3", "841 Chevron Way, Richmond, CA", 37.9365, -122.3810, "Generator 125kW — #GN-5512", 1, "Hank Ellis", "(510) 555-0115", "Safety orientation required (20 min). H2S monitor provided at gate."),
      S("pickup", "El Cerrito Plaza", "6000 El Cerrito Plaza, El Cerrito, CA", 37.8987, -122.3000, "Scissor Lift 19ft — #SL-2287", 2, "Nina Brooks", "(510) 555-0144", "Lifts are chained near the loading area. Bring bolt key #7."),
      S("delivery", "Albany Hillside Homes", "1000 San Pablo Ave, Albany, CA", 37.8888, -122.2977, "Mini Excavator 1.8T — #EX-0905", 1, "Dale Ford", "(510) 555-0159", "Steep driveway — offload at street level. Super Dale on site from 7 AM."),
      S("pickup", "Berkeley Marina", "201 University Ave, Berkeley, CA", 37.8668, -122.3080, "Air Compressor 185 CFM — #AC-0331", 1, "Tara Wells", "(510) 555-0126", "Parking lot B. Watch for pedestrians on the bay trail."),
    ],
    [
      S("delivery", "Alameda Point Hangar", "2151 Ferry Point, Alameda, CA", 37.7865, -122.3089, "Boom Lift 80ft — #BL-8001", 1, "Victor Lane", "(510) 555-0102", "Hangar 12. Escort from front gate. No phones inside hangar."),
      S("pickup", "Fruitvale Station Lofts", "3301 E 12th St, Oakland, CA", 37.7754, -122.2245, "Telehandler 10K — #TH-1190", 1, "Carla Reyes", "(510) 555-0173", "Pick up from the southeast corner of the lot."),
      S("delivery", "San Leandro Marina", "40 Mulford Point Dr, San Leandro, CA", 37.6980, -122.1910, "Light Tower — #LT-4410", 3, "Ben Ito", "(510) 555-0151", "Place towers along the seawall path, 30 ft apart."),
    ],
  ],
  fri: [
    [
      S("pickup", "Milpitas Data Center", "1501 McCarthy Blvd, Milpitas, CA", 37.4180, -121.9200, "Scissor Lift 26ft — #SL-6630", 2, "Arjun Mehta", "(408) 555-0138", "Badge in at security. Lifts on loading dock 2."),
      S("delivery", "Fremont Warm Springs", "45000 Warm Springs Blvd, Fremont, CA", 37.5010, -121.9300, "Boom Lift 45ft — #BL-0932", 1, "Dale Kim", "(510) 555-0167", "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel."),
      S("pickup", "Newark Retail", "5500 Mowry Ave, Newark, CA", 37.5240, -122.0040, "Plate Compactor — #PC-1420", 1, "Lisa Tran", "(510) 555-0184", "Compactor is behind the garden center fence."),
    ],
    [
      S("delivery", "Hayward City Hall", "777 B St, Hayward, CA", 37.6730, -122.0830, "Generator 56kW — #GN-3009", 1, "Sam Ochoa", "(510) 555-0106", "Event setup — place on the B St side near the stage."),
      S("pickup", "Castro Valley Medical", "20103 Lake Chabot Rd, Castro Valley, CA", 37.6966, -122.0864, "Telehandler 10K — #TH-5520", 1, "Brian Shaw", "(510) 555-0191", "Hospital zone — 5 mph. Unit staged near the north parking lot."),
      S("pickup", "San Lorenzo Schools", "15510 Usher St, San Lorenzo, CA", 37.6849, -122.1345, "Boom Lift 60ft — #BL-1144", 1, "Dale Whitman", "(510) 555-0186", "Pick up before 7:30 AM or after 3:00 PM only."),
      S("delivery", "Oakland Coliseum Lot", "7000 Coliseum Way, Oakland, CA", 37.7516, -122.2005, "Light Tower — #LT-2201", 2, "Ike Turner", "(510) 555-0193", "Enter at Gate D. Stage towers in lot C, row 4."),
    ],
  ],
};

// Haversine distance in miles
const fmt = (mins: number) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return `${((h + 11) % 12) + 1}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

function buildTrip(dayId: string, idx: number, seeds: Seed[]): Trip {
  const ordered = optimizeRoute(seeds);
  let t = idx === 0 ? 7 * 60 : 12 * 60 + 30;
  const start = t;
  let prev: { lat: number; lng: number } = BRANCH;
  const stops = ordered.map((s, i) => {
    t += Math.round((miles(prev, s) * 1.3 / 30) * 60 / 15) * 15 + 15; // drive ~30mph, round to 15m
    prev = s;
    const w = `${fmt(t)}–${fmt(t + 60)}`;
    t += 45; // on-site time
    return { ...s, id: `${dayId}-${idx}-${i}`, window: w, completed: false };
  });
  return {
    id: `${dayId}-t${idx + 1}`, dayId, name: `Trip ${idx + 1}`,
    branch: `${BRANCH.name} · ${BRANCH.address}`,
    date: `${idx === 0 ? "Morning" : "Afternoon"} · departs ${fmt(start)}`,
    stops, miles: Math.round(loopLength(ordered) * 1.3),
  };
}

const baseTrips: Trip[] = days.flatMap((d) => schedule[d.id]!.map((seeds, i) => buildTrip(d.id, i, seeds)));

/** Site-note translations [es, hi]; private like the notes themselves. */
export const noteTranslations: Record<string, readonly [string, string]> = {
  "Pick up before 7:30 AM or after 3:00 PM only.": ["Recoge solo antes de las 7:30 a. m. o después de las 3:00 p. m.", "पिकअप केवल सुबह 7:30 बजे से पहले या दोपहर 3:00 बजे के बाद करें।"],
  "Enter at Gate D. Stage towers in lot C, row 4.": ["Entra por la puerta D. Coloca las torres en el lote C, fila 4.", "गेट D से प्रवेश करें। टावर मैदान C की पंक्ति 4 में रखें।"],
  "Check in with site super Dale at the east gate. Offload on the paved pad, not the gravel.": ["Regístrate con el supervisor Dale en la puerta este. Descarga en la plataforma pavimentada, no en la grava.", "पूर्वी गेट पर साइट सुपरवाइज़र Dale से मिलें। पक्के प्लेटफ़ॉर्म पर उतारें, बजरी पर नहीं।"],
  "Loading dock is on 5th St side. Call 15 min before arrival.": ["El muelle de carga está del lado de 5th St. Llama 15 minutos antes de llegar.", "लोडिंग डॉक 5th St की ओर है। पहुँचने से 15 मिनट पहले कॉल करें।"],
  "Unit is staged behind the blue trailer. Keys in lockbox, code 4471.": ["El equipo está detrás del remolque azul. Llaves en la caja de seguridad, código 4471.", "उपकरण नीले ट्रेलर के पीछे है। चाबियाँ लॉकबॉक्स में हैं, कोड 4471।"],
  "Drop both towers along the north fence. Do not block the fire lane.": ["Deja ambas torres junto a la cerca norte. No bloquees el carril de bomberos.", "दोनों टावर उत्तरी बाड़ के पास रखें। अग्निशमन मार्ग अवरुद्ध न करें।"],
  "Gate code 2290#. Machine may need a wash-down before loading.": ["Código de puerta 2290#. La máquina puede necesitar lavado antes de cargarla.", "गेट कोड 2290#। लोड करने से पहले मशीन धोनी पड़ सकती है।"],
  "Hospital zone — 5 mph, no horn. Report to security booth first.": ["Zona hospitalaria: 5 mph, sin bocina. Preséntate primero en seguridad.", "अस्पताल क्षेत्र — 5 मील/घंटा, हॉर्न न बजाएँ। पहले सुरक्षा चौकी पर जाएँ।"],
  "Use truck entrance on Grimmer Blvd. Wear hi-vis vest on site.": ["Usa la entrada de camiones en Grimmer Blvd. Lleva chaleco reflectante.", "Grimmer Blvd के ट्रक प्रवेश द्वार का उपयोग करें। साइट पर हाई-विज़ जैकेट पहनें।"],
  "Three compactors on pallets by the trailer office. Forklift on site.": ["Tres compactadoras en palés junto a la oficina del remolque. Hay montacargas.", "ट्रेलर कार्यालय के पास पैलेट पर तीन कॉम्पैक्टर हैं। साइट पर फोर्कलिफ्ट है।"],
  "Building C, roll-up door 4. Floor protection mats required inside.": ["Edificio C, puerta enrollable 4. Se requieren alfombras de protección para el piso.", "बिल्डिंग C, रोल-अप दरवाज़ा 4। अंदर फ़र्श सुरक्षा मैट आवश्यक हैं।"],
  'Gravel lot — stay on the marked path. Tow hitch is 2-5/16".': ['Terreno de grava: sigue el camino marcado. Enganche de remolque de 2-5/16".', 'बजरी का मैदान — चिह्नित मार्ग पर रहें। टो हिच 2-5/16" है।'],
  "Deliver after 3:00 PM only (school dismissal). Check in at main office.": ["Entrega solo después de las 3:00 p. m. (salida escolar). Regístrate en la oficina principal.", "डिलीवरी केवल दोपहर 3:00 बजे के बाद करें (स्कूल की छुट्टी)। मुख्य कार्यालय में रिपोर्ट करें।"],
  "TWIC escort required. Meet escort at Gate B.": ["Se requiere acompañante TWIC. Encuéntralo en la puerta B.", "TWIC एस्कॉर्ट आवश्यक है। गेट B पर एस्कॉर्ट से मिलें।"],
  "Street parking only — place cones before offloading.": ["Estacionamiento solo en la calle: coloca conos antes de descargar.", "केवल सड़क पर पार्किंग — उतारने से पहले कोन लगाएँ।"],
  "Back lot behind Target. Offload on asphalt only.": ["Terreno trasero detrás de Target. Descarga solo sobre asfalto.", "Target के पीछे का मैदान। केवल डामर पर उतारें।"],
  "Towers staged by the parking structure ramp.": ["Las torres están junto a la rampa del estacionamiento.", "टावर पार्किंग संरचना के रैंप के पास रखे हैं।"],
  'Unit is on level P2 — max clearance 8\'2". Use spotter.': ['El equipo está en el nivel P2; altura máxima 8\'2". Usa un señalero.', 'उपकरण P2 स्तर पर है — अधिकतम ऊँचाई 8\'2"। मार्गदर्शक की मदद लें।'],
  "Residential street — narrow. Homeowner will move cars; call on arrival.": ["Calle residencial estrecha. El propietario moverá los coches; llama al llegar.", "आवासीय सड़क — संकरी है। मकान मालिक गाड़ियाँ हटाएँगे; पहुँचने पर कॉल करें।"],
  "Deliver to rear service alley. Store manager signs the ticket.": ["Entrega en el callejón de servicio trasero. El gerente firma el comprobante.", "पीछे की सर्विस गली में डिलीवरी करें। स्टोर प्रबंधक रसीद पर हस्ताक्षर करेंगे।"],
  "Safety orientation required (20 min). H2S monitor provided at gate.": ["Inducción de seguridad obligatoria (20 min). Monitor H2S en la puerta.", "सुरक्षा परिचय आवश्यक है (20 मिनट)। गेट पर H2S मॉनिटर मिलेगा।"],
  "Lifts are chained near the loading area. Bring bolt key #7.": ["Las plataformas están encadenadas junto al área de carga. Trae la llave #7.", "लिफ्ट लोडिंग क्षेत्र के पास चेन से बँधी हैं। बोल्ट चाबी #7 लाएँ।"],
  "Steep driveway — offload at street level. Super Dale on site from 7 AM.": ["Entrada empinada: descarga al nivel de la calle. El supervisor Dale estará desde las 7 a. m.", "ढलान वाला प्रवेश मार्ग — सड़क स्तर पर उतारें। सुपरवाइज़र Dale सुबह 7 बजे से साइट पर हैं।"],
  "Parking lot B. Watch for pedestrians on the bay trail.": ["Estacionamiento B. Atención a los peatones del sendero de la bahía.", "पार्किंग B। खाड़ी के रास्ते पर पैदल चलने वालों का ध्यान रखें।"],
  "Hangar 12. Escort from front gate. No phones inside hangar.": ["Hangar 12. Acompañante desde la puerta principal. Sin teléfonos dentro.", "हैंगर 12। मुख्य गेट से एस्कॉर्ट लें। हैंगर के अंदर फ़ोन मना हैं।"],
  "Pick up from the southeast corner of the lot.": ["Recoge en la esquina sureste del terreno.", "मैदान के दक्षिण-पूर्वी कोने से पिकअप करें।"],
  "Place towers along the seawall path, 30 ft apart.": ["Coloca las torres junto al malecón, a 30 ft de distancia entre sí.", "समुद्री दीवार के रास्ते पर टावर 30 फ़ुट की दूरी पर रखें।"],
  "Badge in at security. Lifts on loading dock 2.": ["Regístrate con tu credencial en seguridad. Plataformas en el muelle 2.", "सुरक्षा पर बैज दिखाएँ। लिफ्ट लोडिंग डॉक 2 पर हैं।"],
  "Compactor is behind the garden center fence.": ["La compactadora está detrás de la cerca del centro de jardinería.", "कॉम्पैक्टर गार्डन सेंटर की बाड़ के पीछे है।"],
  "Event setup — place on the B St side near the stage.": ["Montaje de evento: coloca del lado de B St, cerca del escenario.", "कार्यक्रम की तैयारी — B St की ओर मंच के पास रखें।"],
  "Hospital zone — 5 mph. Unit staged near the north parking lot.": ["Zona hospitalaria: 5 mph. Equipo junto al estacionamiento norte.", "अस्पताल क्षेत्र — 5 मील/घंटा। उपकरण उत्तरी पार्किंग के पास है।"],
};

export const initialTrips: Trip[] = baseTrips.map((t) => ({ ...t, stops: t.stops.map((s) => ({ ...s, notesI18n: noteTranslations[s.notes] })) }));
