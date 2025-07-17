'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Headphones,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@galileyo.com",
      available: "24/7"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Emergency Hotline",
      description: "Critical support for urgent situations",
      contact: "+1 (555) 123-SATS",
      available: "24/7"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Real-time support via satellite chat",
      contact: "Available in app",
      available: "24/7"
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Technical Support",
      description: "Hardware and setup assistance",
      contact: "tech@galileyo.com",
      available: "Mon-Fri 9AM-6PM EST"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Need help with your satellite communication setup? Our expert team is here to assist you 24/7.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <div key={index} className="p-6 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="text-cyan-500 dark:text-cyan-400 mb-4">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {method.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                  {method.description}
                </p>
                <p className="text-cyan-500 dark:text-cyan-400 font-medium mb-1">
                  {method.contact}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {method.available}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Send us a Message</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8">
                Fill out the form below and we'll get back to you as soon as possible. For urgent matters, please use our emergency hotline.
              </p>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="normal">Normal - Standard support</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="emergency">Emergency - Critical situation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mt-1" />
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium mb-1">Headquarters</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      1234 Satellite Drive<br />
                      Houston, TX 77058<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-cyan-500 dark:text-cyan-400 mt-1" />
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium mb-1">Support Hours</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Emergency Support: 24/7<br />
                      General Support: Mon-Fri 9AM-6PM EST<br />
                      Technical Support: Mon-Fri 8AM-8PM EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-orange-400 mt-1" />
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-medium mb-1">Emergency Protocol</h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      For life-threatening emergencies, contact local emergency services first (911). 
                      Our emergency hotline is for satellite communication emergencies and technical failures.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="p-6 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Need Quick Answers?</h4>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Check our FAQ section for instant answers to common questions about setup, billing, and troubleshooting.
                </p>
                <button className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium transition-colors">
                  View FAQ →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;