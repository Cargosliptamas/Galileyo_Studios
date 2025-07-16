import { Bell, Check, Globe, Lock, Radio, Satellite, Shield, Signal, Star, Wifi, Zap } from "lucide-react";

const features = [
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Always Online, 24/7",
    description: "Continuous connectivity when you need it most, powered by our global satellite network."
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "200+ Countries Coverage",
    description: "Worldwide reach ensuring you stay connected no matter where you are on the planet."
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "99.9% Uptime & Military-Grade Security",
    description: "Redundant satellite network with enterprise-level encryption for maximum reliability."
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: "Real-Time Emergency Alerts",
    description: "Instant notifications for critical situations when traditional channels fail."
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: "Secure Private Communications",
    description: "Uncensored messaging and private group sharing with end-to-end encryption."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started with satellite communications",
    features: [
      "Private feeds",
      "Web & mobile app access",
      "Active support",
      "Basic emergency alerts"
    ],
    cta: "Get Started",
    popular: false,
    highlight: false
  },
  {
    name: "Free Bivy",
    price: "$59.99",
    period: "/month",
    description: "Complete satellite communication solution",
    features: [
      "All Starter features",
      "Satellite feeds via Bivy",
      "Global coverage",
      "Priority emergency alerts",
      "Advanced group sharing",
      "24/7 premium support"
    ],
    cta: "Choose Bivy",
    popular: true,
    highlight: true
  },
  {
    name: "Starlink Mini Bundle",
    price: "$240",
    period: "/month",
    description: "Complete hardware and service package",
    features: [
      "All Free Bivy features",
      "Starlink Mini hardware included",
      "Protective carrying case",
      "Portable power bank",
      "Solar panel charger",
      "Professional power cord",
      "Hardware support & warranty"
    ],
    cta: "Get Complete Bundle",
    popular: false,
    highlight: false
  }
];

export default function HomePage() {
  return (
    <>
     {/* Hero Section */}
     <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-8">
              <Satellite className="w-4 h-4 mr-2" />
              Worldwide SATCOM Network
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Stay Connected —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Even When Everything Else Fails
              </span>
            </h1>

            {/* Supporting Tagline */}
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Access vital information through our worldwide SATCOM network when traditional communication channels are down.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-white text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/25">
                Select Plan
              </button>
              <button className="px-8 py-4 border-2 border-slate-600 hover:border-slate-500 text-white text-lg font-semibold rounded-lg transition-all duration-200 hover:bg-slate-800">
                Sign In
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>200+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <span>Military-Grade Encryption</span>
              </div>
            </div>
          </div>

          {/* Right Column - Satellite Illustration */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              
              {/* Central Satellite */}
              <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-4">
                    <Satellite className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Galileyo Network</h3>
                  <p className="text-slate-400 text-sm">Global Satellite Coverage</p>
                </div>
                
                {/* Status Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-300">Network Status</span>
                    </div>
                    <span className="text-sm text-green-400 font-medium">Online</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Signal className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-300">Signal Strength</span>
                    </div>
                    <span className="text-sm text-cyan-400 font-medium">Excellent</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-300">Encryption</span>
                    </div>
                    <span className="text-sm text-purple-400 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Floating Satellites */}
              <div className="absolute -top-8 -left-8 w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <Radio className="w-6 h-6 text-white" />
              </div>
              
              <div className="absolute -top-4 -right-12 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              
              <div className="absolute -bottom-6 -left-12 w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                <Globe className="w-7 h-7 text-white" />
              </div>

              {/* Connection Lines */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Animated connection lines */}
                <div className="absolute top-1/2 left-1/2 w-32 h-px bg-gradient-to-r from-cyan-400/50 to-transparent transform -translate-y-1/2 -translate-x-1/2 rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 w-28 h-px bg-gradient-to-r from-purple-400/50 to-transparent transform -translate-y-1/2 -translate-x-1/2 -rotate-45"></div>
                <div className="absolute top-1/2 left-1/2 w-36 h-px bg-gradient-to-r from-green-400/50 to-transparent transform -translate-y-1/2 -translate-x-1/2 rotate-12"></div>
              </div>

              {/* Orbital Rings */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 w-96 h-96 border border-cyan-400/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{animationDuration: '20s'}}></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-blue-400/10 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
              </div>

              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="features" className="py-20 lg:py-32 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Built for When It Matters Most
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our satellite communication platform delivers uncompromising reliability and security for critical communications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-8 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your Connection Level
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            From basic satellite access to complete hardware solutions, we have the right plan for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.highlight 
                  ? 'bg-gradient-to-b from-cyan-500/10 to-blue-500/10 border-cyan-500/50 shadow-xl shadow-cyan-500/10' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-300 mb-4">{plan.description}</p>
                <div className="flex items-center justify-center">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-cyan-400' : 'text-white'}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-400 ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-cyan-400' : 'text-green-400'}`} />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* <div className="text-center mt-12">
          <p className="text-slate-400">
            Need a custom solution?{' '}
            <button 
              onClick={() => setCurrentPage('contact')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Contact our team
            </button>
          </p>
        </div> */}
      </div>
    </section>
    </>
  );
}