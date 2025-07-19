import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import CountdownTimer from '../components/CountdownTimer';
import HowItWorksCard from '../components/HowItWorksCard';
import MapSection from '../components/MapSection';
import { AlignCenter } from 'lucide-react';
import MobileNavBar from '../components/common/MobileNavBar';
import FooterNav from '../components/common/FooterNav';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const heroSlides = [
    {
      title: "Every Wednesday",
      subtitle: "strangers meet for dinner.",
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80"
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Curated Experiences",
      description: "Handpicked events designed to bring people together through shared interests and activities."
    },
    {
      icon: "🤝",
      title: "Meaningful Connections",
      description: "Move beyond superficial interactions to build genuine relationships that last."
    },
    {
      icon: "🌟",
      title: "Premium Community",
      description: "Join an exclusive network of ambitious individuals who value quality over quantity."
    },
    {
      icon: "🚀",
      title: "Growth Focused",
      description: "Every event is designed to help you grow personally and professionally."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      text: "bichance transformed my social life. I've made incredible friends and even found my business partner!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b977?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      text: "The events are perfectly organized and the people are amazing. It's exactly what I needed to expand my network.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      name: "Emma Rodriguez",
      role: "Creative Director",
      text: "I was hesitant at first, but bichance gave me the confidence to try new things and meet wonderful people.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  // Removed auto-sliding since there's only one slide

  const handleJoinNow = () => {
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <>
      <MobileNavBar />
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <motion.nav 
          className="bg-white border-b border-red-100 shadow-sm fixed w-full z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <motion.div 
                className="flex items-center"
                // whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img src="/l1.png"  style={{ width: 140, height: 60, objectFit: 'cover', marginLeft: 0, marginRight: 4,  }} onClick={() => navigate('/')} />
              </motion.div>
              
              <div className="hidden md:flex items-center space-x-8">
                <motion.button 
                  onClick={() => navigate('/about')} 
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  About
                </motion.button>
                <motion.button 
                  onClick={() => navigate('/blog')} 
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Blog
                </motion.button>
                <motion.button 
                  onClick={handleSignIn} 
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Sign In
                </motion.button>
                <motion.button 
                  onClick={handleJoinNow}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Now
                </motion.button>
              </div>
              
              <div className="md:hidden">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-gray-700 hover:text-red-600 p-2"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden bg-white border-t border-red-100 py-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-3">
                  <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-red-600 text-left px-4 py-2">
                    About
                  </button>
                  <button onClick={() => navigate('/blog')} className="text-gray-700 hover:text-red-600 text-left px-4 py-2">
                    Blog
                  </button>
                  <button onClick={handleSignIn} className="text-gray-700 hover:text-red-600 text-left px-4 py-2">
                    Sign In
                  </button>
                  <button 
                    onClick={handleJoinNow}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full mx-4 font-semibold"
                  >
                    Join Now
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.nav>
        
        {/* Hero Section with Slider */}
        <div className="relative h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white to-red-50">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: `url('/4.jpg')` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-red-100/60 to-white/80"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 py-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-lg">
              EVERY WEDNESDAY<br />STRANGERS MEET<br />FOR DINNER.
            </h1>
            <p className="text-lg md:text-2xl mb-6 text-red-700 font-medium">
              Book your seat now and meet 5 strangers over dinner, all matched by our AI personality algorithm.
            </p>
            <div className="bg-white/80 rounded-xl shadow-lg px-6 py-4 mb-4 flex flex-col items-center">
              <span className="text-gray-700 text-lg font-semibold mb-1">Next dinner in</span>
              <CountdownTimer />
            </div>
            <button
              onClick={handleJoinNow}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-3 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 mt-2"
            >
              Book Your Spot Now
            </button>
          </div>
        </div>

        {/* Social Horizon Section */}
        <section className="w-full bg-gradient-to-r from-red-700 to-red-500 py-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4">
            <div className="flex-1 text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">EXPAND YOUR SOCIAL HORIZON —<br />ONE CONVERSATION AT A TIME.</h2>
              <p className="mb-4 text-lg md:text-xl">Five people have gathered around a table—complete strangers from different walks of life, sharing a meal for the first time. There's a mix of nerves and excitement in the air. Slowly, something unexpected starts to happen: real conversation, unfiltered laughter (the kind that doesn’t need a <span role='img' aria-label='smile'>😂</span>).</p>
              <p className="mb-4 text-lg md:text-xl">The sixth seat is still empty—and it has your name on it. Join them for a night that might just surprise you, because the world is full of fascinating people, just like you, who are ready to turn the volume back up on life.</p>
              <p className="mb-6 text-lg md:text-xl">Let's break bread—and maybe a few awkward silences together.</p>
              <button
                onClick={handleJoinNow}
                className="bg-white text-red-700 font-bold px-8 py-3 rounded-full shadow hover:bg-red-100 transition-all border border-white"
              >
                BOOK YOUR SEAT
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <img src="/hero.jpg" alt="Dinner Table" className="rounded-lg border-2 border-white shadow-xl w-full max-w-md" />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 tracking-tight text-center bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent uppercase" >How it works</h1>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105">
                <img src="/2.jpg" alt="Tell Us More About You" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 w-full flex flex-col items-start">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Tell us more about you</h2>
                  <p className="text-gray-700">Take a quick personality quiz, so we can match you with a group that vibes with your energy.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105">
                <img src="/3.jpg" alt="Pick Your Dining Date" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 w-full flex flex-col items-start">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Pick your dining date</h2>
                  <p className="text-gray-700">Choose from curated dining events near you—because good conversations start over great meals!</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105">
                <img src="/4.jpg" alt="Get Matched With Like-Minded Individuals" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 w-full flex flex-col items-start">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Get matched with like-minded individuals</h2>
                  <p className="text-gray-700">Our algorithm connects you with five others for an exciting social dining experience.</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105">
                <img src="/5.jpg" alt="Dine, Laugh & Connect" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 w-full flex flex-col items-start">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Dine, laugh & connect</h2>
                  <p className="text-gray-700">Meet up, break the ice, and let the conversations (and connections) flow naturally!</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105">
                <img src="/6.webp" alt="Stay Connected & Keep Stepping Out" className="w-full h-48 object-cover rounded-t-2xl" />
                <div className="p-5 w-full flex flex-col items-start">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Stay connected & keep stepping out</h2>
                  <p className="text-gray-700">Choose who you want to stay connected with and keep the conversation flowing.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-10">
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow transition-all text-lg" onClick={() => navigate('/select-location')}>GET STARTED</button>
            </div>
          </div>
        </section>
        
        {/* Features Section (Why Choose) */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-red-700 mb-4">
                Why Choose <span className="text-red-500">bichance</span>?
              </h2>
              <p className="text-xl text-red-500 max-w-3xl mx-auto">
                We're not just another social platform. We're a community dedicated to meaningful connections and personal growth.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group border border-red-100"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300 text-red-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">
                    {feature.title}
                  </h3>
                  <p className="text-red-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <div className="w-full bg-white pt-12 pb-2">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-2">Explore <span className="text-red-600">Weekly dinners</span></h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-red-600 text-center mb-6">all over the world</h3>
        </div>
        <section className="w-full bg-white py-0 m-0">
          <MapSection />
        </section>

        {/* How We Select Our Restaurants Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-12 tracking-tight text-center">How we select our <span className='italic font-serif'>restaurants</span></h1>
            <p className="text-lg text-gray-700 text-center mb-10">We handpick restaurants using carefully tailored criteria to guarantee you the finest dining experiences.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105 border border-gray-200">
                <img src="/3.jpg" alt="Selection" className="w-full h-64 object-cover rounded-t-2xl" />
                <div className="w-full flex flex-col items-center -mt-6 pb-6">
                  <div className="bg-pink-300 rounded-full px-4 py-1 flex items-center mb-2 shadow border border-pink-400">
                    <span className="text-white font-bold mr-2">1</span>
                    <span className="text-pink-900 font-semibold">A wide selection to match your budget</span>
                  </div>
                  <p className="text-gray-700 text-center px-4">Many options, friendly to your wallet.</p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105 border border-gray-200">
                <img src="/4.jpg" alt="Dietary" className="w-full h-64 object-cover rounded-t-2xl" />
                <div className="w-full flex flex-col items-center -mt-6 pb-6">
                  <div className="bg-yellow-300 rounded-full px-4 py-1 flex items-center mb-2 shadow border border-yellow-400">
                    <span className="text-white font-bold mr-2">2</span>
                    <span className="text-yellow-900 font-semibold">Options to fit your dietary choices</span>
                  </div>
                  <p className="text-gray-700 text-center px-4">Satisfying every palate, one dish at a time!</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-0 flex flex-col items-center group cursor-pointer transform hover:scale-105 border border-gray-200">
                <img src="/5.jpg" alt="Top Rated" className="w-full h-64 object-cover rounded-t-2xl" />
                <div className="w-full flex flex-col items-center -mt-6 pb-6">
                  <div className="bg-teal-400 rounded-full px-4 py-1 flex items-center mb-2 shadow border border-teal-500">
                    <span className="text-white font-bold mr-2">3</span>
                    <span className="text-teal-900 font-semibold">Top Rated restaurants only</span>
                  </div>
                  <p className="text-gray-700 text-center px-4">Handpicked and user-approved thanks to feedback.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-10">
              <button className="bg-pink-400 hover:bg-pink-500 text-white font-bold px-8 py-3 rounded-full shadow transition-all text-lg" onClick={() => navigate('/select-location')}>See Our Restaurants in Your City</button>
            </div>
          </div>
        </section>

        {/* After-Dinner Drinks & Icebreaker Games Section */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-10 justify-center items-stretch">
            {/* After-Dinner Drinks Card */}
            <div className="flex-1 bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center group cursor-pointer transform hover:scale-105 border border-gray-200">
              <img src="/2.jpg" alt="After Dinner Drinks" className="w-full h-64 object-cover rounded-xl mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">AFTER-DINNER <span className="italic font-serif">DRINKS</span></h2>
              <p className="text-gray-700 text-center mb-4">Keep the energy alive — Unlock your Last Drink location in the app an hour after dinner starts.</p>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow transition-all text-lg" onClick={() => navigate('/select-location')}>Sign Up Now</button>
            </div>
            {/* Icebreaker Games Card */}
            <div className="flex-1 bg-white rounded-2xl shadow hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center group cursor-pointer transform hover:scale-105 border border-gray-200">
              <img src="/6.webp" alt="Icebreaker Games" className="w-full h-64 object-cover rounded-xl mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center"><span className="italic font-serif">ICEBREAKER</span> GAMES</h2>
              <p className="text-gray-700 text-center mb-4">We’ll help spark and keep conversation going with icebreaker questions that connect your group.</p>
              <button className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full shadow transition-all text-lg" onClick={() => navigate('/select-location')}>Sign Up Now</button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What Our Members Say
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from real people who stepped out and transformed their lives.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-red-600 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-500 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Step Out?
              </h2>
              <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
                Join thousands of members who have already transformed their social lives. Your next adventure is just one click away.
              </p>
              <motion.button 
                onClick={handleJoinNow}
                className="bg-white text-red-600 px-12 py-4 rounded-full text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:bg-gray-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Journey
              </motion.button>
            </motion.div>
          </div>
        </section>
        
        {/* Footer */}
        <FooterNav />
      </div>
    </>
  );
};

export default LandingPage;
