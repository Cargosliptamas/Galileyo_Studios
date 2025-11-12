"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@galileyo/ui/card";

interface AdCardProps {
  adNumber: number;
}

const mockAds = [
  {
    id: 1,
    title: "Fresh Meal Delivery Service",
    description:
      "Get chef-prepared meals delivered to your door. Healthy, delicious, and ready in minutes!",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Order Now",
    sponsor: "FreshBites",
  },
  {
    id: 2,
    title: "Premium Fitness Tracker",
    description:
      "Track your workouts, monitor your health, and achieve your fitness goals with our smart device.",
    image:
      "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Shop Now",
    sponsor: "FitTech",
  },
  {
    id: 3,
    title: "Luxury Travel Packages",
    description:
      "Discover exotic destinations with our all-inclusive vacation deals. Book now and save up to 40%!",
    image:
      "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Explore Deals",
    sponsor: "Wanderlust Travel",
  },
  {
    id: 4,
    title: "Organic Skincare Collection",
    description:
      "Transform your skin with our natural, cruelty-free skincare products. Made with love and care.",
    image:
      "https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Shop Collection",
    sponsor: "PureGlow",
  },
  {
    id: 5,
    title: "Online Learning Platform",
    description:
      "Master new skills with thousands of courses taught by industry experts. Start learning today!",
    image:
      "https://images.pexels.com/photos/5905708/pexels-photo-5905708.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Start Free Trial",
    sponsor: "SkillMaster",
  },
  {
    id: 6,
    title: "Artisan Coffee Subscription",
    description:
      "Receive freshly roasted coffee beans from around the world delivered monthly to your door.",
    image:
      "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Subscribe",
    sponsor: "BeanBox",
  },
  {
    id: 7,
    title: "Smart Home Security System",
    description:
      "Protect your home with our advanced security cameras and smart locks. Peace of mind guaranteed.",
    image:
      "https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Get Started",
    sponsor: "SecureHome",
  },
  {
    id: 8,
    title: "Fashion Boutique Sale",
    description:
      "Up to 70% off on designer clothing and accessories. Limited time offer - shop now!",
    image:
      "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Shop Sale",
    sponsor: "StyleHub",
  },
  {
    id: 9,
    title: "Pet Care Services",
    description:
      "Professional grooming, walking, and boarding services for your furry friends. Book today!",
    image:
      "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Book Service",
    sponsor: "PawCare",
  },
  {
    id: 10,
    title: "Gourmet Chocolate Box",
    description:
      "Indulge in our handcrafted artisanal chocolates. Perfect gift for any occasion.",
    image:
      "https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Order Gift Box",
    sponsor: "ChocoDelight",
  },
];

export default function AdCard({ adNumber }: AdCardProps) {
  const [isClient, setIsClient] = useState(false);
  const ad = useMemo(() => {
    const requestedAd = mockAds[adNumber];

    if (!requestedAd) {
      return mockAds[Math.floor(Math.random() * mockAds.length)];
    }

    return requestedAd;
  }, [adNumber]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !ad) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Advertisement • {ad.sponsor}
          </div>
          <div className="h-48 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <img
              src={ad.image}
              alt={ad.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {ad.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {ad.description}
            </p>
          </div>
          <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700">
            {ad.cta}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
