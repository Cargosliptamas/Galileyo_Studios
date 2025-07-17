'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Search, 
  Filter,
  Satellite,
  Shield,
  Globe,
  Zap,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'technology', name: 'Technology' },
    { id: 'emergency', name: 'Emergency Preparedness' },
    { id: 'security', name: 'Security' },
    { id: 'updates', name: 'Product Updates' },
    { id: 'guides', name: 'Guides & Tutorials' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'The Future of Satellite Communications: What 2025 Holds',
      excerpt: 'Explore the latest advancements in satellite technology and how they\'re revolutionizing global communications, especially in emergency situations.',
      content: 'As we move into 2025, satellite communications technology is experiencing unprecedented growth and innovation...',
      author: 'Dr. Sarah Chen',
      date: '2025-01-15',
      readTime: '8 min read',
      category: 'technology',
      image: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Satellite Tech', 'Innovation', 'Future'],
      featured: true
    },
    {
      id: 2,
      title: 'Emergency Preparedness: Building Your Communication Plan',
      excerpt: 'Learn how to create a comprehensive emergency communication strategy that keeps your family connected when traditional networks fail.',
      content: 'When disaster strikes, communication becomes critical. Here\'s how to prepare...',
      author: 'Mark Rodriguez',
      date: '2025-01-12',
      readTime: '6 min read',
      category: 'emergency',
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Emergency', 'Planning', 'Safety'],
      featured: false
    },
    {
      id: 3,
      title: 'Understanding End-to-End Encryption in Satellite Communications',
      excerpt: 'A deep dive into how military-grade encryption protects your communications and why it matters for privacy and security.',
      content: 'End-to-end encryption is the cornerstone of secure communications...',
      author: 'Alex Thompson',
      date: '2025-01-10',
      readTime: '10 min read',
      category: 'security',
      image: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Encryption', 'Security', 'Privacy'],
      featured: false
    },
    {
      id: 4,
      title: 'Galileyo App Update: New Group Messaging Features',
      excerpt: 'Discover the latest features in our mobile app, including enhanced group messaging, location sharing, and emergency check-ins.',
      content: 'We\'re excited to announce major updates to the Galileyo mobile application...',
      author: 'Product Team',
      date: '2025-01-08',
      readTime: '4 min read',
      category: 'updates',
      image: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['App Update', 'Features', 'Messaging'],
      featured: false
    },
    {
      id: 5,
      title: 'Setting Up Your Starlink Mini: Complete Installation Guide',
      excerpt: 'Step-by-step instructions for setting up your Starlink Mini hardware bundle, from unboxing to first connection.',
      content: 'Getting started with your Starlink Mini bundle is easier than you might think...',
      author: 'Technical Support',
      date: '2025-01-05',
      readTime: '12 min read',
      category: 'guides',
      image: 'https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Setup', 'Hardware', 'Tutorial'],
      featured: false
    },
    {
      id: 6,
      title: 'Global Coverage Expansion: 50 New Countries Added',
      excerpt: 'Galileyo extends its satellite network coverage to 50 additional countries, bringing reliable communications to more remote regions.',
      content: 'We\'re thrilled to announce a major expansion of our satellite coverage...',
      author: 'Network Operations',
      date: '2025-01-03',
      readTime: '5 min read',
      category: 'updates',
      image: 'https://images.pexels.com/photos/87651/earth-blue-planet-globe-planet-87651.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Coverage', 'Expansion', 'Global'],
      featured: false
    },
    {
      id: 7,
      title: 'Satellite vs. Cellular: When Traditional Networks Fail',
      excerpt: 'Compare satellite and cellular communications, understanding when each technology excels and why satellite backup is essential.',
      content: 'Understanding the differences between satellite and cellular communications...',
      author: 'Dr. Emily Watson',
      date: '2025-01-01',
      readTime: '7 min read',
      category: 'technology',
      image: 'https://images.pexels.com/photos/33999/communication-smartphone-phone-mobile-phone.jpg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Comparison', 'Technology', 'Reliability'],
      featured: false
    },
    {
      id: 8,
      title: 'Winter Weather and Satellite Communications: What You Need to Know',
      excerpt: 'Learn how extreme weather conditions affect satellite communications and how to maintain connectivity during winter storms.',
      content: 'Winter weather can present unique challenges for satellite communications...',
      author: 'Weather Team',
      date: '2024-12-28',
      readTime: '6 min read',
      category: 'guides',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['Weather', 'Winter', 'Maintenance'],
      featured: false
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return <Satellite className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'updates': return <TrendingUp className="w-4 h-4" />;
      case 'guides': return <Zap className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Galileyo Blog
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Stay informed with the latest insights on satellite communications, emergency preparedness, and technology updates.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === 'all' && !searchTerm && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Featured Article</h2>
              <p className="text-slate-600 dark:text-slate-400">Our latest and most important updates</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="aspect-video lg:aspect-square">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-sm font-medium rounded-full flex items-center gap-1">
                    {getCategoryIcon(featuredPost.category)}
                    {categories.find(cat => cat.id === featuredPost.category)?.name}
                  </span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-medium rounded-full">
                    Featured
                  </span>
                </div>
                
                <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  {featuredPost.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                </div>
                
                <button className="inline-flex items-center gap-2 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium transition-colors">
                  Read Full Article
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No articles found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Latest Articles</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {regularPosts.length} article{regularPosts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="aspect-video">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded flex items-center gap-1">
                          {getCategoryIcon(post.category)}
                          {categories.find(cat => cat.id === post.category)?.name}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 dark:text-slate-400 text-sm" suppressHydrationWarning>
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <button className="inline-flex items-center gap-1 text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 font-medium transition-colors">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {/* Newsletter Signup */}
          <div className="mt-16 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Stay Updated</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Subscribe to our newsletter for the latest articles, product updates, and emergency preparedness tips.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;