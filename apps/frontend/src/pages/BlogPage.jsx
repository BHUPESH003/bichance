import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const blogPosts = [
  {
    id: 1,
    title: 'Meet 5 Women Over Dinner',
    image: '/3.jpg',
    excerpt: 'Stories of connection and new friendships from our weekly dinners.',
    content: 'Full story about meeting 5 women over dinner. This is the detailed content for the blog post.'
  },
  {
    id: 2,
    title: 'Beyond Small Talk: The Courage to Connect',
    image: '/4.jpg',
    excerpt: 'How real conversations at the table can change your perspective.',
    content: 'Full story about going beyond small talk. This is the detailed content for the blog post.'
  },
  {
    id: 3,
    title: 'The Expat Experiences — You’re Not Alone',
    image: '/5.jpg',
    excerpt: 'Finding community and belonging in a new city.',
    content: 'Full story about expat experiences. This is the detailed content for the blog post.'
  },
  {
    id: 4,
    title: 'Why We Dine With Strangers',
    image: '/6.webp',
    excerpt: 'The science and stories behind our unique dinner format.',
    content: 'Full story about why we dine with strangers. This is the detailed content for the blog post.'
  }
];

const BlogPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <motion.nav 
        className="bg-white/95 backdrop-blur-md border-b border-red-100 shadow-sm fixed w-full z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <img src="/l1.png" alt="bichance logo" style={{ width: 140, height: 60, objectFit: 'cover', marginLeft: 0, marginRight: 4, cursor: 'pointer' }} onClick={() => navigate('/')} />
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.button 
                onClick={() => navigate('/about')} 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >About</motion.button>
              <motion.button 
                onClick={() => navigate('/blog')} 
                className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >Blog</motion.button>
              <motion.button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >Join Now</motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      <div className="pt-20" />
      {/* Hero Image with Overlay */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-center mb-12 fade-in-up">
        <img src="/hero.jpg" alt="Blog Hero" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-black/60" />
        <div className="relative z-10 text-center w-full">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-4" style={{ fontFamily: "'Montserrat', 'Poppins', 'Arial', sans-serif" }}>Blog</h1>
          <p className="text-xl md:text-2xl text-white drop-shadow-lg" style={{ fontFamily: "'Montserrat', 'Poppins', 'Arial', sans-serif" }}>Find out the latest news from Bichance</p>
        </div>
      </div>
      {/* Blog Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group">
              <img src={post.image} alt={post.title} className="w-full h-56 object-cover" />
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 text-red-500 group-hover:underline transition-colors duration-200">{post.title}</h3>
                <p className="text-gray-600 mb-4 flex-1 group-hover:text-red-600 transition-colors duration-200">{post.excerpt}</p>
                <button onClick={() => navigate(`/blog/${post.id}`, { state: { post } })} className="mt-auto bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded-full transition-all">Read More</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="bg-black text-white pt-12 pb-6 mt-12 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between w-full">
            {/* Logo left */}
            <div className="flex-1 flex justify-start mb-8 md:mb-0">
              <img src="/l1.png" alt="bichance logo" style={{ width: 180, height: 80, objectFit: 'cover', margin: '24px 0 16px 0' }} />
            </div>
            {/* Main footer content centered, with border above and below */}
            <div className="flex-1 flex flex-col items-center w-full">
              <div className="border-t border-b border-gray-800 py-8 w-full flex flex-col items-center">
                {/* Centered Links */}
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                  <button onClick={() => navigate('/faq')} className="text-gray-300 hover:text-white text-sm">FAQ</button>
                  <button onClick={() => navigate('/help')} className="text-gray-300 hover:text-white text-sm">Help Center</button>
                  <button onClick={() => navigate('/about')} className="text-gray-300 hover:text-white text-sm">About</button>
                  <button onClick={() => navigate('/blog')} className="text-gray-300 hover:text-white text-sm">Blog</button>
                  <button onClick={() => navigate('/privacy')} className="text-gray-300 hover:text-white text-sm">Privacy Policy</button>
                  <button onClick={() => navigate('/terms')} className="text-gray-300 hover:text-white text-sm">Terms & Conditions</button>
                  <button onClick={() => navigate('/contact-us')} className="text-gray-300 hover:text-white text-sm">Contact Us</button>
                </div>
                {/* Store Badges Centered */}
                <div className="flex gap-4 justify-center mb-6">
                  <a href="https://play.google.com/store/games?hl=en_IN&pli=1" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-12 transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-lg bg-black"
                      style={{ minWidth: 150 }}
                    />
                  </a>
                  <a href="https://www.apple.com/in/app-store/" target="_blank" rel="noopener noreferrer">
                    <img
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      alt="Download on the App Store"
                      className="h-12 transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-lg bg-black"
                      style={{ minWidth: 150 }}
                    />
                  </a>
                </div>
                {/* Social Icons Centered */}
                <div className="flex gap-4 justify-center mb-6">
                  {/* Instagram */}
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-black" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
                    </span>
                  </a>
                  {/* Facebook */}
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:text-black" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H6v4h4v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </span>
                  </a>
                  {/* Twitter/X - latest logo */}
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="group">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-black">
                        <path d="M17.53 2H21.5L14.36 10.39L22.75 21.5H16.08L10.98 14.73L5.19 21.5H1.22L8.8 12.61L0.75 2H7.58L12.18 8.18L17.53 2ZM16.36 19.5H18.19L7.75 4.5H5.81L16.36 19.5Z" fill="currentColor"/>
                      </svg>
                    </span>
                  </a>
                  {/* WhatsApp - latest logo */}
                  <a href="https://wa.me" target="_blank" rel="noopener noreferrer" className="group">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black border border-gray-700 hover:bg-white hover:shadow-lg transition-all duration-200">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white group-hover:text-black">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.205 5.077 4.366.711.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2.003c-5.514 0-9.997 4.483-9.997 9.997 0 1.762.462 3.484 1.34 4.997l-1.389 5.077 5.207-1.368c1.482.81 3.16 1.26 4.839 1.26 5.514 0 9.997-4.483 9.997-9.997 0-2.67-1.04-5.182-2.927-7.07C17.186 3.043 14.674 2.003 12.004 2.003z" fill="currentColor"/>
                      </svg>
                    </span>
                  </a>
                </div>
              </div>
              {/* Copyright */}
              <div className="text-center text-gray-400 text-xs w-full mt-6">
                <p>&copy; 2025 All rights reserved. bichance</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage; 