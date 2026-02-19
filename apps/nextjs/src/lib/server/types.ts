export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  period: string;
  description: string;
  subtext: string;
  features: string[];
  cta: string;
  popular: boolean;
  highlight: boolean;
}

export interface Partner {
  id: number;
  name: string;
  image: string | null;
  description: string;
  link: string;
}
