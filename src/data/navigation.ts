export const navLinks = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
      { label: "Residential Plumbing", href: "/services/residential-plumbing" },
      { label: "Commercial Plumbing", href: "/services/commercial-plumbing" },
      { label: "Water Heaters", href: "/services/water-heaters" },
      { label: "Tankless Water Heaters", href: "/services/tankless-water-heaters" },
      { label: "Drain Cleaning", href: "/services/drain-cleaning" },
      { label: "Backflow Testing", href: "/services/backflow-testing" },
    ],
  },
  {
    label: "Service Areas",
    href: "/service-areas",
    children: [
      { label: "South Jordan", href: "/service-areas/rockwall" },
      { label: "Royse City", href: "/service-areas/royse-city" },
      { label: "Rowlett", href: "/service-areas/rowlett" },
      { label: "Garland", href: "/service-areas/garland" },
      { label: "Plano", href: "/service-areas/plano" },
      { label: "Highland Park", href: "/service-areas/highland-park" },
      { label: "University Park", href: "/service-areas/university-park" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Specials", href: "/specials" },
] as const;
