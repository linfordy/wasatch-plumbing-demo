export interface Special {
  amount: string;
  title: string;
  description: string;
  ctaText: string;
}

export const specials: Special[] = [
  {
    amount: "$500",
    title: "Tankless Water Heater",
    description:
      "Endless hot water, lower energy bills. Professional installation by licensed master plumber.",
    ctaText: "Grab This Offer",
  },
  {
    amount: "$1,000",
    title: "Whole Home Water Treatment",
    description:
      "Halo 5 system — cleaner water from every tap. Say goodbye to hard water and contaminants.",
    ctaText: "Grab This Offer",
  },
];
