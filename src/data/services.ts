export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  heroDescription: string;
  content: string[];
  features: string[];
  faqs: ServiceFAQ[];
}

export const services: Service[] = [
  {
    slug: "emergency-plumbing",
    title: "Emergency Plumbing in South Jordan, UT",
    shortTitle: "Emergency Plumbing",
    icon: "🚨",
    description:
      "Burst pipe at 2am? We're on our way. 24/7 emergency response across all service areas.",
    heroDescription:
      "Wasatch Plumbing Co. provides 24/7 emergency plumbing services across South Jordan and Salt Lake Valley. When a plumbing emergency strikes, our licensed master plumber and team respond fast — day or night.",
    content: [
      "When a pipe bursts, a water heater fails, or a sewer line backs up at 2am, you need a plumber who answers the phone. Wasatch Plumbing Co. has provided emergency plumbing services to South Jordan and Salt Lake Valley since 2018 — three generations of master plumbers who understand that plumbing emergencies don't wait for business hours.",
      "Our emergency response team is equipped with modern diagnostic tools including camera inspection systems, electronic leak detection, and hydro-jetting equipment. We arrive prepared to diagnose and fix the problem in a single visit whenever possible.",
      "As a family-owned business with UT Plumber License #WP-2018-1042, we treat every emergency call with the urgency and care we'd give our own home. No surprise fees, no upselling — just honest, fast service when you need it most.",
    ],
    features: [
      "24/7 availability — nights, weekends, and holidays",
      "Fast response times across all service areas",
      "Burst pipe repair and water shutoff",
      "Sewer line backups and overflows",
      "Water heater failures",
      "Gas leak detection and repair",
      "Slab leak emergency response",
      "No overtime charges for after-hours calls",
    ],
    faqs: [
      {
        question: "How fast can you respond to a plumbing emergency in South Jordan?",
        answer:
          "We typically respond to emergency calls in the South Jordan area within 30-60 minutes, depending on current demand. Our team is available 24/7, including nights, weekends, and holidays.",
      },
      {
        question: "Do you charge extra for after-hours emergency plumbing?",
        answer:
          "We provide transparent pricing for all emergency services. Call us at (801) 555-3366 and we'll give you upfront pricing before we begin any work.",
      },
      {
        question: "What should I do while waiting for an emergency plumber?",
        answer:
          "If you have a water leak, locate and turn off your main water shutoff valve. For a gas leak, leave the house immediately and call us from outside. For sewer backups, avoid using any drains or toilets until we arrive.",
      },
    ],
  },
  {
    slug: "residential-plumbing",
    title: "Residential Plumbing Repair in South Jordan, UT",
    shortTitle: "Residential Plumbing",
    icon: "🏠",
    description:
      "Complete home plumbing — repairs, replacements, remodels, and new installations.",
    heroDescription:
      "Wasatch Plumbing Co. provides expert residential plumbing services in South Jordan and Salt Lake Valley. From routine repairs to complete remodels, our licensed team handles every aspect of home plumbing.",
    content: [
      "Your home's plumbing is the backbone of daily life — from morning showers to kitchen cleanup to laundry. Wasatch Plumbing Co. has been keeping Salt Lake Valley homes running smoothly since 2018, and today our master plumber carries that same standard as a Utah Licensed Master Plumber (License #WP-2018-1042).",
      "We handle everything from leaky faucets and running toilets to complete bathroom remodels and whole-house repiping. Our technicians are trained on modern fixtures and techniques while respecting the older plumbing systems common in established South Jordan neighborhoods.",
      "Every job includes a thorough inspection, clear explanation of the problem, and upfront pricing before work begins. We clean up after ourselves and stand behind every repair.",
    ],
    features: [
      "Leak detection and repair",
      "Faucet and fixture installation",
      "Toilet repair and replacement",
      "Bathroom and kitchen remodels",
      "Water line repair and replacement",
      "Slab leak detection and repair",
      "Garbage disposal installation",
      "Whole-house repiping",
    ],
    faqs: [
      {
        question: "How do I know if I have a slab leak?",
        answer:
          "Signs of a slab leak include unexplained increases in your water bill, warm spots on the floor, the sound of running water when all fixtures are off, or cracks in your foundation. Wasatch Plumbing Co. uses electronic leak detection equipment to pinpoint slab leaks without unnecessary demolition.",
      },
      {
        question: "Do you offer free estimates for residential plumbing work?",
        answer:
          "We offer free estimates for most residential plumbing projects. Call us at (801) 555-3366 or text (214) 549-1290 to schedule. We'll assess the situation and provide transparent pricing before starting any work.",
      },
      {
        question: "What areas do you serve for residential plumbing?",
        answer:
          "We serve South Jordan, Royse City, Rowlett, Garland, Plano, Highland Park, University Park, and surrounding Salt Lake Valley communities.",
      },
    ],
  },
  {
    slug: "commercial-plumbing",
    title: "Commercial Plumber in South Jordan, UT",
    shortTitle: "Commercial Plumbing",
    icon: "🏢",
    description:
      "Offices, restaurants, retail — we handle commercial-grade systems and code compliance.",
    heroDescription:
      "Wasatch Plumbing Co. provides commercial plumbing services in South Jordan and Salt Lake Valley. From restaurants to office buildings, our licensed team handles commercial-grade systems, code compliance, and emergency repairs.",
    content: [
      "Commercial plumbing requires a different level of expertise than residential work. Larger pipe systems, grease traps, backflow prevention devices, and strict building codes demand a plumber who understands commercial requirements. Wasatch Plumbing Co. has served South Jordan-area businesses since 2018.",
      "Our commercial services cover everything from routine maintenance to emergency repairs. We understand that plumbing problems cost your business money every minute, which is why we prioritize fast response times and efficient repairs for our commercial clients.",
      "We work with offices, restaurants, retail spaces, industrial facilities, and multi-unit properties. All work is performed by licensed technicians and meets local building codes and TCEQ regulations.",
    ],
    features: [
      "Commercial pipe installation and repair",
      "Grease trap maintenance and installation",
      "Backflow prevention and testing",
      "Commercial water heater systems",
      "Fixture installation and upgrades",
      "Sewer line inspection and repair",
      "Code compliance inspections",
      "Emergency commercial plumbing 24/7",
    ],
    faqs: [
      {
        question: "What types of commercial properties do you service?",
        answer:
          "We service offices, restaurants, retail spaces, industrial facilities, multi-unit residential buildings, churches, schools, and athletic facilities throughout South Jordan and Salt Lake Valley.",
      },
      {
        question: "Can you handle large-scale commercial plumbing installations?",
        answer:
          "Yes. Our team has completed over 1,200 projects including large-scale commercial installations. We carry the proper licensing and insurance for commercial work of all sizes.",
      },
      {
        question: "Do you offer commercial plumbing maintenance contracts?",
        answer:
          "Yes, we offer maintenance agreements for commercial properties that include regular inspections, preventive maintenance, and priority emergency response. Call (801) 555-3366 for details.",
      },
    ],
  },
  {
    slug: "water-heaters",
    title: "Water Heater Service in South Jordan, UT",
    shortTitle: "Water Heaters",
    icon: "🔥",
    description:
      "Tank and tankless installation, repair, and replacement. Same-day service available.",
    heroDescription:
      "Wasatch Plumbing Co. provides expert water heater repair, installation, and replacement in South Jordan and Salt Lake Valley. Tank and tankless systems — same-day service available.",
    content: [
      "A broken water heater disrupts your entire household. No hot showers, no clean dishes, no laundry — and a leaking water heater can cause serious floor and foundation damage. Wasatch Plumbing Co. provides same-day water heater service across South Jordan and Salt Lake Valley.",
      "We service and install all types of water heaters: traditional tank, tankless, gas, and electric. Our technicians diagnose the problem quickly and provide honest advice on whether repair or replacement is the better investment for your situation.",
      "Every water heater installation includes proper venting, code-compliant connections, a new drain pan, and a thorough safety check. We stand behind our work with manufacturer warranties and our own workmanship guarantee.",
    ],
    features: [
      "Same-day water heater repair",
      "Tank and tankless installation",
      "Gas and electric water heaters",
      "Emergency water heater replacement",
      "Anode rod replacement",
      "Sediment flush service",
      "Expansion tank installation",
      "Code-compliant installations",
    ],
    faqs: [
      {
        question: "How do I know if my water heater needs to be replaced?",
        answer:
          "Common signs include: no hot water, rust-colored water, strange noises (popping or banging), leaking around the base, or age over 10-12 years. Wasatch Plumbing Co. will inspect your water heater and give you honest advice on repair vs. replacement.",
      },
      {
        question: "How long does a water heater installation take?",
        answer:
          "A standard tank water heater replacement typically takes 2-3 hours. Tankless installations may take longer due to additional venting and gas line requirements. We'll give you a time estimate before starting.",
      },
      {
        question: "What size water heater do I need?",
        answer:
          "For most homes: 40-gallon for 1-2 people, 50-gallon for 3-4 people, and 75+ gallon or tankless for larger families. We'll help you choose the right size based on your household's hot water needs.",
      },
    ],
  },
  {
    slug: "tankless-water-heaters",
    title: "Tankless Water Heater in South Jordan, UT",
    shortTitle: "Tankless Water Heaters",
    icon: "♨️",
    description:
      "Endless hot water, energy savings, and a longer lifespan. Expert installation and repair.",
    heroDescription:
      "Wasatch Plumbing Co. provides expert tankless water heater installation, repair, and maintenance in South Jordan and Salt Lake Valley. Endless hot water with energy savings — $500 off installation this month.",
    content: [
      "Tankless water heaters heat water on demand, eliminating the need for a storage tank and providing an endless supply of hot water. Wasatch Plumbing Co. specializes in tankless water heater installation and repair across South Jordan and Salt Lake Valley.",
      "Tankless systems are more space-efficient, require minimal maintenance (descaling typically once annually), and last twice as long as traditional tanks with proper care. They're also more energy-efficient, reducing your annual utility bills.",
      "Proper installation is critical for tankless water heaters. Gas line sizing, venting requirements, and flow rate calculations must be done correctly. As a Utah Licensed Master Plumber, our master plumber ensures every tankless installation meets manufacturer specs and local code requirements.",
    ],
    features: [
      "Tankless water heater installation",
      "Tankless repair and maintenance",
      "Annual descaling service",
      "Gas line sizing and installation",
      "Proper venting installation",
      "Flow rate assessment",
      "Energy efficiency consultation",
      "$500 off installation — current special",
    ],
    faqs: [
      {
        question: "How much does a tankless water heater cost to install?",
        answer:
          "Tankless water heater installation typically costs more upfront than a traditional tank, but saves money over time through lower energy bills and a longer lifespan (20+ years vs. 10-12 years). We currently offer $500 off tankless installation. Call (801) 555-3366 for a free estimate.",
      },
      {
        question: "Can a tankless water heater supply enough hot water for my whole house?",
        answer:
          "Yes, when properly sized. We calculate your home's peak hot water demand and recommend the right unit. A properly sized tankless heater delivers endless hot water to multiple fixtures simultaneously.",
      },
      {
        question: "How often does a tankless water heater need maintenance?",
        answer:
          "We recommend annual descaling to remove mineral buildup, especially in areas with hard water like Salt Lake Valley. Regular maintenance extends the lifespan and maintains efficiency. Wasatch Plumbing Co. offers annual maintenance service.",
      },
    ],
  },
  {
    slug: "drain-cleaning",
    title: "Drain Cleaning Services in South Jordan, UT",
    shortTitle: "Drain Cleaning",
    icon: "🔧",
    description:
      "Hydro-jetting, flex-shaft, camera inspections — we clear the toughest clogs.",
    heroDescription:
      "Wasatch Plumbing Co. provides professional drain cleaning in South Jordan and Salt Lake Valley. Hydro-jetting, flex-shaft clearing, and camera inspection — we clear the toughest clogs.",
    content: [
      "Clogged drains are more than an inconvenience — they can lead to sewage backups, water damage, and health hazards. Wasatch Plumbing Co. uses modern drain cleaning technology to clear even the toughest blockages in South Jordan and Salt Lake Valley homes and businesses.",
      "We use hydro-jetting (high-pressure water to scour pipe walls), flex-shaft machines (for cutting through roots and hardened buildup), and camera inspection systems to see exactly what's causing the problem. No guesswork — we show you the camera footage so you understand the issue.",
      "Whether it's a slow kitchen drain, a backed-up sewer line, or tree roots invading your pipes, our team has the equipment and expertise to fix it right the first time.",
    ],
    features: [
      "Hydro-jetting drain cleaning",
      "Flex-shaft root cutting",
      "Camera inspection and diagnosis",
      "Kitchen and bathroom drain clearing",
      "Main sewer line cleaning",
      "Floor drain maintenance",
      "Preventive drain maintenance",
      "Trenchless sewer repair",
    ],
    faqs: [
      {
        question: "What causes drain clogs?",
        answer:
          "Common causes include grease buildup (kitchen), hair and soap (bathroom), tree root intrusion (main sewer lines), and foreign objects. Wasatch Plumbing Co. uses camera inspection to identify the exact cause and choose the best clearing method.",
      },
      {
        question: "What is hydro-jetting?",
        answer:
          "Hydro-jetting uses high-pressure water (up to 4,000 PSI) to scour the inside of pipes, removing grease, scale, roots, and other buildup. It's the most thorough drain cleaning method available and leaves pipes nearly like new.",
      },
      {
        question: "How do I prevent drain clogs?",
        answer:
          "Avoid putting grease down drains, use drain screens to catch hair and debris, and schedule preventive drain cleaning annually. For older homes with tree root issues, we recommend camera inspections every 1-2 years.",
      },
    ],
  },
  {
    slug: "backflow-testing",
    title: "Backflow Testing in South Jordan, UT",
    shortTitle: "Backflow Testing",
    icon: "💧",
    description:
      "TCEQ-certified testing and certification. Same-week appointments available.",
    heroDescription:
      "Wasatch Plumbing Co. provides TCEQ-certified backflow testing and prevention services in South Jordan and Salt Lake Valley. Same-week appointments — avoid violations and fines.",
    content: [
      "Backflow prevention protects your drinking water from contamination. Utah law (state regulations) requires annual backflow testing for properties with irrigation systems, fire sprinklers, and certain commercial connections. Wasatch Plumbing Co. provides fast, reliable backflow testing with same-week appointments.",
      "Our certified technicians test double check valves, reduced pressure zone (RPZ) assemblies, and pressure vacuum breakers. We handle the paperwork and submit test results directly to your water provider, so you stay compliant without the hassle.",
      "If your city has sent you a backflow testing notice, don't wait — violations can result in water service disconnection. Call (801) 555-3366 for a same-week appointment.",
    ],
    features: [
      "TCEQ-certified backflow testing",
      "Same-week appointments available",
      "Double check valve testing",
      "RPZ assembly testing",
      "Pressure vacuum breaker testing",
      "Test report filing with water provider",
      "Backflow device repair and replacement",
      "Irrigation system backflow compliance",
    ],
    faqs: [
      {
        question: "What is backflow and why does it need testing?",
        answer:
          "Backflow occurs when water flows backward in your plumbing system, potentially contaminating your drinking water with fertilizers, chemicals, or sewage. TCEQ requires annual testing of backflow prevention devices to ensure they're working properly.",
      },
      {
        question: "I received a backflow testing notice from my city. What do I do?",
        answer:
          "Call Wasatch Plumbing Co. at (801) 555-3366 for a same-week backflow testing appointment. We'll test your device, handle the paperwork, and submit results to your water provider before the deadline. Failure to test can result in water service disconnection.",
      },
      {
        question: "How long does backflow testing take?",
        answer:
          "A standard backflow test takes 15-30 minutes. We test the device, record results, and provide you with documentation. If repairs are needed, we can often complete them during the same visit.",
      },
    ],
  },
];
