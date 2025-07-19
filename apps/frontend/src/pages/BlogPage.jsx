import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MobileNavBar from '../components/common/MobileNavBar';
import FooterNav from '../components/common/FooterNav';

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
    <>
      <MobileNavBar />
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
                  onClick={() => navigate('/auth?mode=signup')}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Now
                </motion.button>
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
        <FooterNav />
      </div>
    </>
  );
};

export default BlogPage; 