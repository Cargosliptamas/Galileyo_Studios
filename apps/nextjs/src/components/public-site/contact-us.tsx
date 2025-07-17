"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@galileyo.com",
      available: "24/7",
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Emergency Hotline",
      description: "Critical support for urgent situations",
      contact: "+1 (555) 123-SATS",
      available: "24/7",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Chat",
      description: "Real-time support via satellite chat",
      contact: "Available in app",
      available: "24/7",
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Technical Support",
      description: "Hardware and setup assistance",
      contact: "tech@galileyo.com",
      available: "Mon-Fri 9AM-6PM EST",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-slate-100 py-16 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">
            Get in Touch
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
            Need help with your satellite communication setup? Our expert team
            is here to assist you 24/7.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white/50 p-6 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
              >
                <div className="mb-4 text-cyan-500 dark:text-cyan-400">
                  {method.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {method.title}
                </h3>
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                  {method.description}
                </p>
                <p className="mb-1 font-medium text-cyan-500 dark:text-cyan-400">
                  {method.contact}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {method.available}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">
                Send us a Message
              </h2>
              <p className="mb-8 text-slate-600 dark:text-slate-300">
                Fill out the form below and we'll get back to you as soon as
                possible. For urgent matters, please use our emergency hotline.
              </p>

              {isSubmitted && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">
                    Message sent successfully! We'll get back to you soon.
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="normal">Normal - Standard support</option>
                    <option value="high">High - Urgent issue</option>
                    <option value="emergency">
                      Emergency - Critical situation
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-cyan-400 hover:to-blue-400"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                Contact Information
              </h3>

              <div className="mb-8 space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                  <div>
                    <h4 className="mb-1 font-medium text-slate-900 dark:text-white">
                      Headquarters
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      1234 Satellite Drive
                      <br />
                      Houston, TX 77058
                      <br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="mt-1 h-6 w-6 text-cyan-500 dark:text-cyan-400" />
                  <div>
                    <h4 className="mb-1 font-medium text-slate-900 dark:text-white">
                      Support Hours
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      Emergency Support: 24/7
                      <br />
                      General Support: Mon-Fri 9AM-6PM EST
                      <br />
                      Technical Support: Mon-Fri 8AM-8PM EST
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <AlertTriangle className="mt-1 h-6 w-6 text-orange-400" />
                  <div>
                    <h4 className="mb-1 font-medium text-slate-900 dark:text-white">
                      Emergency Protocol
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300">
                      For life-threatening emergencies, contact local emergency
                      services first (911). Our emergency hotline is for
                      satellite communication emergencies and technical
                      failures.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Link */}
              <div className="rounded-xl border border-slate-200 bg-white/50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
                <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
                  Need Quick Answers?
                </h4>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Check our FAQ section for instant answers to common questions
                  about setup, billing, and troubleshooting.
                </p>
                <button className="font-medium text-cyan-500 transition-colors hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300">
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
