'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Satellite, 
  Shield, 
  CreditCard, 
  Settings, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'All Questions', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'general', name: 'General', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'technical', name: 'Technical', icon: <Settings className="w-5 h-5" /> },
    { id: 'billing', name: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'hardware', name: 'Hardware', icon: <Satellite className="w-5 h-5" /> }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'general',
      question: 'What is Galileyo and how does it work?',
      answer: 'Galileyo is a satellite communication platform that provides reliable connectivity when traditional networks fail. We use a global network of satellites to ensure you can access vital information, send messages, and receive emergency alerts even in remote locations or during network outages.'
    },
    {
      id: 2,
      category: 'general',
      question: 'What countries does Galileyo cover?',
      answer: 'Galileyo provides coverage in over 200 countries and territories worldwide. Our satellite network ensures global connectivity, including remote areas where traditional cellular and internet services are unavailable.'
    },
    {
      id: 3,
      category: 'technical',
      question: 'What equipment do I need to use Galileyo?',
      answer: 'For basic service, you only need our mobile app or web access. For satellite connectivity, you can use our Bivy service or upgrade to our Starlink Mini Bundle which includes all necessary hardware: Starlink Mini terminal, protective case, power bank, solar panel, and professional power cord.'
    },
    {
      id: 4,
      category: 'billing',
      question: 'Can I try Galileyo for free?',
      answer: 'Yes! Our Starter plan is completely free and includes private feeds, web & mobile app access, active support, and basic emergency alerts. You can upgrade to paid plans anytime for satellite connectivity and advanced features.'
    },
    {
      id: 5,
      category: 'billing',
      question: 'How does billing work for the paid plans?',
      answer: 'Our Free Bivy plan is $59.99/month and the Starlink Mini Bundle is $240/month. All plans are billed monthly with no long-term contracts. You can upgrade, downgrade, or cancel anytime through your account dashboard.'
    },
    {
      id: 6,
      category: 'security',
      question: 'How secure are my communications?',
      answer: 'All communications on Galileyo are protected with military-grade end-to-end encryption. We use advanced security protocols to ensure your messages, location data, and personal information remain private and secure.'
    },
    {
      id: 7,
      category: 'security',
      question: 'Can governments or third parties access my messages?',
      answer: 'No. Galileyo is designed to provide uncensored, private communications. Our end-to-end encryption means that only you and your intended recipients can read your messages. We do not store decrypted messages on our servers.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'What is the difference between Bivy and Starlink Mini?',
      answer: 'Bivy provides satellite connectivity through our partner network and works with your existing devices. Starlink Mini Bundle includes dedicated hardware for direct satellite internet access, offering higher speeds and more reliable connectivity in extreme conditions.'
    },
    {
      id: 9,
      category: 'hardware',
      question: 'How long does the battery last on the Starlink Mini?',
      answer: 'The included power bank provides 8-12 hours of continuous operation. The solar panel charger can extend this indefinitely in good sunlight conditions. The system is designed for extended off-grid use.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'What happens during an emergency?',
      answer: 'Galileyo automatically sends real-time emergency alerts to your device when critical situations are detected in your area. You can also manually trigger emergency check-ins to notify your emergency contacts of your status and location.'
    },
    {
      id: 11,
      category: 'general',
      question: 'Can I use Galileyo for regular internet browsing?',
      answer: 'Yes, with our Starlink Mini Bundle, you get full internet access. The Free Bivy plan focuses on essential communications and emergency services, while the hardware bundle provides complete internet connectivity.'
    },
    {
      id: 12,
      category: 'technical',
      question: 'How fast is the satellite internet connection?',
      answer: 'Connection speeds vary by location and conditions, but typically range from 25-100 Mbps download speeds. The connection is optimized for reliability rather than speed, ensuring consistent performance when you need it most.'
    },
    {
      id: 13,
      category: 'hardware',
      question: 'Is the equipment weatherproof?',
      answer: 'Yes, all hardware in the Starlink Mini Bundle is designed for outdoor use and extreme weather conditions. The protective case provides additional protection during transport and storage.'
    },
    {
      id: 14,
      category: 'billing',
      question: 'Are there any setup fees or hidden costs?',
      answer: 'No setup fees or hidden costs. The monthly subscription includes all software features and support. Hardware bundles include all necessary equipment with no additional fees.'
    },
    {
      id: 15,
      category: 'general',
      question: 'How do I get started with Galileyo?',
      answer: 'Simply create a free account to start with our Starter plan. You can immediately access private feeds and basic features. Upgrade to paid plans anytime for satellite connectivity and advanced emergency features.'
    }
  ];

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Find answers to common questions about Galileyo satellite communications, setup, and features.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
              <p className="text-slate-400">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/70 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-white pr-4">
                      {item.question}
                    </h3>
                    {openItems.includes(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-slate-300 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-16 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
            <p className="text-slate-300 mb-6">
              Can't find what you're looking for? Our support team is available 24/7 to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-slate-600 hover:border-slate-500 text-white font-semibold rounded-lg transition-colors">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;