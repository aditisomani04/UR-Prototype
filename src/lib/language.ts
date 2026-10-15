import { createContext, useContext } from "react";

export const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "hi", label: "हिन्दी" },
] as const;
export type Language = (typeof languages)[number]["code"];
export const LanguageContext = createContext<Language>("en");

// Operational names, addresses, identifiers, and free-form driver remarks are not translated.
const messages: Record<string, readonly [string, string]> = {
  "Language": ["Idioma", "भाषा"],
  "Driver": ["Conductor", "ड्राइवर"],
  "← Back": ["← Atrás", "← वापस"],
  "Driver sign in": ["Acceso del conductor", "ड्राइवर साइन इन"],
  "View today's deliveries and pickups.": ["Consulta las entregas y recogidas de hoy.", "आज की डिलीवरी और पिकअप देखें।"],
  "Driver ID": ["ID del conductor", "ड्राइवर आईडी"],
  "Password": ["Contraseña", "पासवर्ड"],
  "Sign in": ["Iniciar sesión", "साइन इन करें"],
  "Sign out": ["Cerrar sesión", "साइन आउट करें"],
  "Sample drivers": ["Conductores de ejemplo", "नमूना ड्राइवर"],
  "Unknown driver ID — pick a sample driver below.": ["ID desconocido: elige un conductor de ejemplo abajo.", "अज्ञात ड्राइवर आईडी — नीचे से एक नमूना ड्राइवर चुनें।"],
  "Weekly schedule": ["Horario semanal", "साप्ताहिक कार्यक्रम"],
  "Truck": ["Camión", "ट्रक"],
  "Branch": ["Sucursal", "शाखा"],
  "Trip": ["Viaje", "यात्रा"],
  "Stop": ["Parada", "स्टॉप"],
  "trips": ["viajes", "यात्राएँ"],
  "stops": ["paradas", "स्टॉप"],
  "deliveries": ["entregas", "डिलीवरी"],
  "pickups": ["recogidas", "पिकअप"],
  "mi": ["mi", "मील"],
  "✓ Done": ["✓ Listo", "✓ पूरा"],
  "Complete": ["Completado", "पूरा हुआ"],
  "Return to branch": ["Volver a la sucursal", "शाखा में वापस जाएँ"],
  "🧭 Navigate to branch": ["🧭 Ir a la sucursal", "🧭 शाखा का रास्ता देखें"],
  "In progress": ["En curso", "जारी है"],
  "Issues reported": ["Incidencias reportadas", "समस्याएँ दर्ज हैं"],
  "Not started": ["Sin iniciar", "शुरू नहीं हुआ"],
  "{done} of {total} stops completed": ["{done} de {total} paradas completadas", "{total} में से {done} स्टॉप पूरे हुए"],
  "{count} reported": ["{count} reportadas", "{count} समस्याएँ दर्ज"],
  "Delivery": ["Entrega", "डिलीवरी"],
  "Pickup": ["Recogida", "पिकअप"],
  "🗺 Open optimized route in Maps": ["🗺 Abrir ruta optimizada en Maps", "🗺 Maps में अनुकूलित मार्ग खोलें"],
  "All remaining stops were reported — no stops left to route.": ["Todas las paradas restantes tienen incidencias; no quedan paradas para la ruta.", "शेष सभी स्टॉप पर समस्याएँ दर्ज हैं — मार्ग में कोई स्टॉप नहीं बचा।"],
  "Stops are ordered for the shortest drive (~{miles} mi round trip), starting and ending at the branch.": ["Paradas ordenadas para el recorrido más corto (~{miles} mi ida y vuelta), desde y hasta la sucursal.", "सबसे छोटे मार्ग के अनुसार स्टॉप का क्रम है (आने-जाने में लगभग {miles} मील), शुरुआत और अंत शाखा पर।"],
  "Start": ["Inicio", "शुरुआत"],
  "Depart branch": ["Salir de la sucursal", "शाखा से प्रस्थान"],
  "Pending": ["Pendientes", "बाकी"],
  "Completed": ["Completadas", "पूरे हुए"],
  "All stops completed.": ["Todas las paradas completadas.", "सभी स्टॉप पूरे हो गए।"],
  "✓ Arrived at branch — trip complete": ["✓ Llegada a sucursal — viaje completo", "✓ शाखा पहुँच गए — यात्रा पूरी हुई"],
  "Confirm arrival at branch": ["Confirmar llegada a sucursal", "शाखा पहुँचने की पुष्टि करें"],
  "Unlocks after every stop is completed or reported with remarks.": ["Disponible cuando cada parada esté completada o reportada con comentarios.", "हर स्टॉप पूरा होने या टिप्पणी के साथ समस्या दर्ज होने के बाद उपलब्ध होगा।"],
  "NEXT STOP": ["SIGUIENTE PARADA", "अगला स्टॉप"],
  "⚠ Issue reported": ["⚠ Incidencia reportada", "⚠ समस्या दर्ज"],
  "Customer": ["Cliente", "ग्राहक"],
  "Address": ["Dirección", "पता"],
  "🧭 Navigate": ["🧭 Cómo llegar", "🧭 रास्ता देखें"],
  "📞 Call {name}": ["📞 Llamar a {name}", "📞 {name} को कॉल करें"],
  "⚠ Site instructions": ["⚠ Instrucciones del sitio", "⚠ साइट के निर्देश"],
  "Site contact:": ["Contacto del sitio:", "साइट संपर्क:"],
  "Equipment": ["Equipo", "उपकरण"],
  "Time window": ["Franja horaria", "समय सीमा"],
  "qty": ["cant.", "मात्रा"],
  "✓ Equipment delivered": ["✓ Equipo entregado", "✓ उपकरण की डिलीवरी हुई"],
  "✓ Equipment picked up": ["✓ Equipo recogido", "✓ उपकरण का पिकअप हुआ"],
  "⚠ Couldn't complete this stop?": ["⚠ ¿No pudiste completar esta parada?", "⚠ यह स्टॉप पूरा नहीं कर पाए?"],
  "Describe what happened…": ["Describe lo que pasó…", "बताएँ क्या हुआ…"],
  "Driver remark": ["Comentario del conductor", "ड्राइवर की टिप्पणी"],
  "Save remark": ["Guardar comentario", "टिप्पणी सहेजें"],
  "Cancel": ["Cancelar", "रद्द करें"],
  "⚠ Issue reported — not completed": ["⚠ Incidencia reportada — sin completar", "⚠ समस्या दर्ज — स्टॉप पूरा नहीं हुआ"],
  "Edit remark": ["Editar comentario", "टिप्पणी बदलें"],
  "Clear & retry": ["Borrar y reintentar", "हटाएँ और फिर प्रयास करें"],
  "I confirm the equipment was delivered and inspected.": ["Confirmo que el equipo fue entregado e inspeccionado.", "मैं पुष्टि करता/करती हूँ कि उपकरण की डिलीवरी और जाँच हो गई है।"],
  "I confirm the equipment was picked up and inspected.": ["Confirmo que el equipo fue recogido e inspeccionado.", "मैं पुष्टि करता/करती हूँ कि उपकरण का पिकअप और जाँच हो गई है।"],
  "Mark delivery complete": ["Completar entrega", "डिलीवरी पूरी करें"],
  "Mark pickup complete": ["Completar recogida", "पिकअप पूरा करें"],
  "⚠ Couldn't complete — leave a remark": ["⚠ No se pudo completar — comentar", "⚠ पूरा नहीं कर पाए — टिप्पणी लिखें"],
  "Site closed — no access": ["Sitio cerrado — sin acceso", "साइट बंद — प्रवेश नहीं मिला"],
  "Customer not ready": ["Cliente no preparado", "ग्राहक तैयार नहीं है"],
  "Equipment issue": ["Problema con el equipo", "उपकरण में समस्या"],
  "Traffic — ran out of time": ["Tráfico — sin tiempo", "ट्रैफ़िक — समय समाप्त"],
  "Contact unreachable": ["Contacto no disponible", "संपर्क नहीं हो पाया"],
  "Morning": ["Mañana", "सुबह"],
  "Afternoon": ["Tarde", "दोपहर"],
  "departs": ["sale a las", "प्रस्थान"],
  "AM": ["a. m.", "पूर्वाह्न"],
  "PM": ["p. m.", "अपराह्न"],
  "Boom Lift": ["Plataforma de brazo", "बूम लिफ्ट"],
  "Scissor Lift": ["Plataforma de tijera", "सिज़र लिफ्ट"],
  "Mini Excavator": ["Miniexcavadora", "मिनी एक्सकेवेटर"],
  "Light Tower": ["Torre de iluminación", "लाइट टावर"],
  "Skid Steer Loader": ["Minicargadora", "स्किड स्टीयर लोडर"],
  "Telehandler": ["Manipulador telescópico", "टेलीहैंडलर"],
  "Forklift": ["Montacargas", "फोर्कलिफ्ट"],
  "Plate Compactor": ["Compactadora de placa", "प्लेट कॉम्पैक्टर"],
  "Air Compressor": ["Compresor de aire", "एयर कंप्रेसर"],
  "Generator": ["Generador", "जनरेटर"],
  "Trench Shoring Box": ["Caja de entibación", "ट्रेंच शोरिंग बॉक्स"],
};

const notes: Record<string, readonly [string, string]> = {
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

export function translate(language: Language, text: string, values: Record<string, string | number> = {}) {
  const entry = messages[text] ?? notes[text];
  const result = language === "en" || !entry ? text : entry[language === "es" ? 0 : 1];
  return result.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}

export function useLanguage() {
  const language = useContext(LanguageContext);
  const t = (text: string, values?: Record<string, string | number>) => translate(language, text, values);
  const localize = (text: string) => {
    let result = t(text);
    for (const key of ["Boom Lift", "Scissor Lift", "Mini Excavator", "Light Tower", "Skid Steer Loader", "Telehandler", "Forklift", "Plate Compactor", "Air Compressor", "Generator", "Trench Shoring Box", "Morning", "Afternoon", "departs", "Truck", "Branch", "Trip", "AM", "PM"]) {
      result = result.replace(new RegExp(`\\b${key}\\b`, "g"), t(key));
    }
    return result;
  };
  const date = (dayId: string, short = false, dateOnly = false) => {
    const offset = ["mon", "tue", "wed", "thu", "fri"].indexOf(dayId);
    return new Intl.DateTimeFormat(language, { ...(dateOnly ? {} : { weekday: short ? "short" as const : "long" as const }), ...(short && !dateOnly ? {} : { month: "short" as const, day: "numeric" as const }), timeZone: "UTC" }).format(new Date(Date.UTC(2026, 9, 19 + Math.max(0, offset))));
  };
  return { language, t, localize, date };
}

export function isLanguage(value: string | null): value is Language {
  return languages.some((language) => language.code === value);
}
