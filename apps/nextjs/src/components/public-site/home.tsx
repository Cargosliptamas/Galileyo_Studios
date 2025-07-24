'use client';

import {
  Bell,
  Check,
  Globe,
  Lock,
  Satellite,
  Shield,
  Star,
} from "lucide-react";
import Link from "next/link";
import { PhoneMockup } from "../phone-mockup";
import { motion } from 'motion/react';
import Image from "next/image";

const features = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Worldwide Coverage",
    description: "Access information anywhere through our satellite network"
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Uncensored Content",
    description: "Share and receive unfiltered information without restrictions"
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Private Groups",
    description: "Create secure groups to share critical information with trusted members"
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Real-Time Alerts",
    description: "Receive instant notifications about emergencies and critical updates"
  }
];

const pricingPlans = [
  {
    name: "Galileyo Starter",
    price: "Free",
    period: "",
    description: "Support Free & Uncensored Speech",
    features: [
      "Private Access to Feeds",
      "Connect With Your Friends",
      "Follow Your Favorite Influencers",
      "Access To Web and IOS/Android Apps",
      "Active support",
    ],
    cta: "Create Account",
    popular: false,
    highlight: false
  },
  {
    name: "Galileyo PREMIUM",
    price: "$9.99",
    period: "/month",
    description: "Ad-Free Experience",
    features: [
      "Revenue Shares with Content Creators",
      "Verified Status Badge + Exclusive Profile Icons",
      "Premium-only Communities",
      "Custom Username in URL",
      "See Who Viewed Your Profile",
      "Premium Customer Support"
    ],
    cta: "Join NOW",
    popular: true,
    highlight: true
  },
  {
    name: "Starlink Mini Bundle",
    price: "$240.00",
    period: "/month",
    description: "Starlink Mini",
    features: [
      "Worldwide Coverage",
      "Mini Transport Case",
      "Goal Zero Sherpa 100PD Power Bank",
      "Goal Zero Nomad 5 Solar Panel",
      "Starlink USB-C to DC Power Cord"
    ],
    cta: "Select Plan",
    popular: false,
    highlight: false
  }
];

const satelliteFeatures = [
  {
    title: "200+ Countries Covered",
    description: "Global satellite network coverage"
  },
  {
    title: "Works with Bivy Stick, Starlink, and More",
    description: "Compatible with leading satellite providers"
  },
  {
    title: "End-to-End Encryption",
    description: "Military-grade security for all communications"
  },
  {
    title: "99.9% Global Uptime",
    description: "Reliable connectivity when you need it most"
  }
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div
            className="absolute inset-0 block opacity-50 dark:hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          <div
            className="absolute inset-0 hidden opacity-50 dark:block"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2 text-green-400" />
                Trusted by 5000+ users worldwide
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 dark:text-white lg:text-6xl">
                Speak Freely —{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
                  Unleash Your Voice
                </span>
              </h1>

              {/* Supporting Tagline */}
              <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Break the Chains & Stand alongside hundreds of uncensored truth seekers who refuse to be silenced!
              </p>

              {/* CTA Buttons */}
              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/pricing"
                  className="transform rounded-lg bg-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-105 hover:bg-cyan-400"
                >
                  Get Started
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>200+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <span>Military-Grade Encryption</span>
                </div>
              </div>
            </div>

            {/* Right Column - Satellite Illustration */}
            <div className="relative flex justify-center">
              {/* <div className="relative w-full max-w-lg">
                <div className="relative z-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                      <Satellite className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Galileyo Network
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Global Satellite Coverage
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Network Status
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-400">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Signal Strength
                        </span>
                      </div>
                      <span className="text-sm font-medium text-cyan-500 dark:text-cyan-400">
                        Excellent
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Encryption
                        </span>
                      </div>
                      <span className="text-sm font-medium text-purple-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 -top-8 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>

                <div className="absolute -right-12 -top-4 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                  <Wifi className="h-5 w-5 text-white" />
                </div>

                <div
                  className="absolute -bottom-6 -left-12 flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Globe className="h-7 w-7 text-white" />
                </div>

                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-1/2 h-px w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-36 -translate-x-1/2 -translate-y-1/2 rotate-12 transform bg-gradient-to-r from-green-400/50 to-transparent"></div>
                </div>

                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform animate-spin rounded-full border border-cyan-400/20"
                    style={{ animationDuration: "20s" }}
                  ></div>
                  <div
                    className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform animate-spin rounded-full border border-blue-400/10"
                    style={{
                      animationDuration: "15s",
                      animationDirection: "reverse",
                    }}
                  ></div>
                </div>

                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl dark:from-cyan-500/10 dark:to-blue-500/10"></div>
              </div> */}
              {/* <div className="relative z-50 mx-auto h-[700px] w-[350px] min-w-[350px] rounded-[42px] border-[14px] border-black bg-gray-800 shadow-xl">
                <div className="absolute left-1/2 top-0 z-50 h-[18px] w-[148px] translate-x-[-50%] rounded-b-[1rem] bg-black"></div>
                <div className="absolute left-[-105px] top-[124px] z-50 h-[46px] w-[4px] rounded-l-lg bg-black"></div>
                <div className="absolute left-[-105px] top-[178px] z-50 h-[46px] w-[4px] rounded-l-lg bg-black"></div>
                <div className="absolute right-[-105px] top-[142px] z-50 h-[64px] w-[4px] rounded-r-lg bg-black"></div>
                <div className="relative h-full w-full overflow-hidden break-words rounded-[32px] bg-gray-800"></div>
              </div> */}

              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <PhoneMockup>
                  <Image src="/nexus_phone.jpg" alt="App" width={300} height={600} />
                </PhoneMockup>
                {/* Animated Text Boxes */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="absolute -left-32 top-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-900 dark:text-white font-medium text-sm">
                      Be the first one to know
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-l-8 border-l-white/95 dark:border-l-slate-800/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                  className="absolute -right-40 top-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-900 dark:text-white font-medium text-sm">
                      Support Free & Uncensored Speech
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-r-8 border-r-white/95 dark:border-r-slate-800/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 2.0 }}
                  className="absolute -left-36 bottom-32 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xl max-w-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-900 dark:text-white font-medium text-sm">
                      Follow Your Favourite Influencers
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-0 h-0 border-l-8 border-l-white/95 dark:border-l-slate-800/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Why Join Galileyo?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto"
            >
              When traditional communication breaks down, Galileyo keeps you connected. Whether it's an emergency, natural disaster, or total network outage — our platform ensures real-time, uncensored information reaches you anywhere in the world.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                className="group p-8 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl transition-all duration-200"
              >
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="text-cyan-500 dark:text-cyan-400 mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
            >
              Choose the plan that best fits your needs.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                  plan.highlight 
                    ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-500/50 shadow-xl shadow-cyan-500/10' 
                    : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{plan.description}</p>
                  <div className="flex items-center justify-center">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-slate-500 dark:text-slate-400 ml-1">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-cyan-500 dark:text-cyan-400' : 'text-green-400'}`} />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Satellite Power Section */}
      <section className="py-20 lg:py-32 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
            >
              The Power of Satellites
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto"
            >
              Galileyo partners with top-tier satellite providers to give you 24/7 coverage — from the mountains to the oceans and everywhere in between. Our satellite-ready app ensures vital communication reaches you, even in the most remote places.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {satelliteFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                className="text-center p-6 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl transition-all duration-200"
              >
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Satellite className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 rounded-2xl border p-8 text-center mx-auto max-w-3xl">
          <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Stay Updated
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Subscribe to our newsletter for the latest articles, product
            updates, and emergency preparedness tips.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <button className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
