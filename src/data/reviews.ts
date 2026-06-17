export interface Review {
  text: string;
  author: string;
  city: string;
  rating: number;
  source: string;
}

export const reviews: Review[] = [
  {
    text: "Called at 10pm with a burst pipe. They were here in 30 minutes and had it fixed before midnight. Can't recommend enough.",
    author: "Mike R.",
    city: "South Jordan",
    rating: 5,
    source: "Google",
  },
  {
    text: "The team replaced our 20-year-old water heater in under 3 hours. Professional, clean, and fair pricing.",
    author: "Tina S.",
    city: "Rowlett",
    rating: 5,
    source: "Google",
  },
  {
    text: "Third generation family business that treats you like family. They've been our plumber for 15 years and counting.",
    author: "David L.",
    city: "Royse City",
    rating: 5,
    source: "Google",
  },
];
