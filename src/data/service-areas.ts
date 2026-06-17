export interface ServiceArea {
  slug: string;
  name: string;
  description: string;
  content: string[];
  faqs: { question: string; answer: string }[];
}

export const serviceAreas: ServiceArea[] = [
  {
    slug: "south-jordan",
    name: "South Jordan",
    description:
      "South Jordan's most trusted plumbers since 2018. Licensed master plumber, same-day service, no overtime charges. Drain cleaning, water heaters, emergency plumbing & more. Call (801) 555-3366 — available 24/7.",
    content: [
      "South Jordan is home to Wasatch Plumbing Co. Our headquarters at 10000 S. Redwood Rd is centrally located to serve the entire South Jordan community with fast response times. As a trusted local plumbing service, we know South Jordan's infrastructure — from established neighborhoods near Bangerter Highway to the newer developments along the Daybreak communities.",
      "Whether you need emergency service at 2am, a water heater replacement, or backflow testing for your irrigation system, Wasatch Plumbing Co. is your trusted local plumber. Licensed, insured, and available 24/7.",
    ],
    faqs: [
      {
        question: "Who is the best plumber in South Jordan, UT?",
        answer:
          "Wasatch Plumbing Co. has been South Jordan's trusted plumber since 2018. Our licensed master plumbers have completed 850+ projects across the Salt Lake Valley. Available 24/7 at (801) 555-3366.",
      },
      {
        question: "Is there a 24/7 emergency plumber in South Jordan?",
        answer:
          "Yes. Wasatch Plumbing provides 24/7 emergency plumbing service in South Jordan, UT. Call (801) 555-3366 anytime — nights, weekends, and holidays. We typically respond within 30-60 minutes.",
      },
    ],
  },
  {
    slug: "riverton",
    name: "Riverton",
    description:
      "Wasatch Plumbing Co. serves Riverton, UT with residential and commercial plumbing, water heaters, drain cleaning, and 24/7 emergency service.",
    content: [
      "Riverton is one of the fastest-growing communities in the Salt Lake Valley, and Wasatch Plumbing has been serving its residents since day one. From new construction plumbing to repairs on established homes, we handle it all.",
      "Our South Jordan headquarters is just minutes from Riverton, ensuring fast response times for emergency calls and scheduled appointments alike. We're familiar with the plumbing needs of Riverton homes and businesses.",
    ],
    faqs: [
      {
        question: "Does Wasatch Plumbing serve Riverton?",
        answer:
          "Yes. Wasatch Plumbing provides full plumbing services in Riverton, UT including emergency plumbing, water heaters, drain cleaning, and backflow testing. Our South Jordan headquarters is just minutes away. Call (801) 555-3366.",
      },
    ],
  },
  {
    slug: "sandy",
    name: "Sandy",
    description:
      "Wasatch Plumbing Co. provides plumbing services in Sandy, UT — water heaters, drain cleaning, residential and commercial plumbing, and 24/7 emergency response.",
    content: [
      "Sandy homeowners and businesses trust Wasatch Plumbing for reliable, honest plumbing service. We've been serving the Sandy community since 2018 — treating every customer's home like our own.",
      "From established neighborhoods near Little Cottonwood Canyon to newer developments near the Jordan River, we understand Sandy's unique plumbing challenges and respond quickly when you need us most.",
    ],
    faqs: [
      {
        question: "What plumbing services does Wasatch Plumbing offer in Sandy?",
        answer:
          "We offer complete plumbing services in Sandy including emergency plumbing (24/7), water heater installation and repair, drain cleaning, slab leak detection, backflow testing, and bathroom/kitchen remodels. Call (801) 555-3366.",
      },
    ],
  },
  {
    slug: "draper",
    name: "Draper",
    description:
      "Wasatch Plumbing Co. serves Draper, UT with licensed master plumber services — residential, commercial, water heaters, drain cleaning, and emergency response.",
    content: [
      "Draper is one of the premier communities in our service area, and Wasatch Plumbing is proud to serve its growing population. From established neighborhoods to newer developments along the Wasatch Front, we handle plumbing systems of every age and complexity.",
      "Our licensed master plumber and team provide fast, reliable service throughout Draper — including 24/7 emergency response, water heater installation, drain cleaning, and complete residential and commercial plumbing.",
    ],
    faqs: [
      {
        question: "How quickly can Wasatch Plumbing respond to emergencies in Draper?",
        answer:
          "We provide emergency plumbing response to Draper, UT within 30-60 minutes depending on traffic and current demand. Call (801) 555-3366 for immediate assistance — available 24/7.",
      },
    ],
  },
  {
    slug: "bluffdale",
    name: "Bluffdale",
    description:
      "Wasatch Plumbing Co. serves Bluffdale, UT with expert plumbing services — residential, commercial, water heaters, drain cleaning, and 24/7 emergency calls.",
    content: [
      "Bluffdale residents deserve a plumber they can trust. Wasatch Plumbing brings years of licensed expertise and local knowledge to every Bluffdale home and business we serve.",
      "Whether you're in a newer development or an established neighborhood, we provide fast response times, transparent pricing, and work performed by licensed professionals. No surprises, no upselling — just honest plumbing.",
    ],
    faqs: [
      {
        question: "Does Wasatch Plumbing service Bluffdale, UT?",
        answer:
          "Yes. Wasatch Plumbing provides full plumbing services across Bluffdale, UT. We offer residential and commercial plumbing, water heater service, drain cleaning, backflow testing, and 24/7 emergency response. Call (801) 555-3366.",
      },
    ],
  },
];
