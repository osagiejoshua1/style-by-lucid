"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { FiMapPin, FiPhone, FiMail, FiInstagram, FiTwitter, FiFacebook } from "react-icons/fi";
import Footer from "../components/Footer";

export default function Contact() {
  return (
   <>
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative xl:h-[70vh] h-[60vh] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/Screenshot 2025-04-09 at 12.44.57 pm.png')",
            backgroundPosition: "0% 15%",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <h1 className="text-white text-center text-3xl md:text-6xl font-bold tracking-widest uppercase px-4">
            Get In Touch with Us!
          </h1>
        </div>
      </section>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Send us a message</h2>
            <p className="text-gray-600">
              Have questions about our products or need styling advice? We're here to help.
            </p>
            
            <form className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+234 123 456 7890"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 px-6 rounded-md hover:bg-gray-900 transition duration-200 font-medium uppercase tracking-wider"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our details</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiMapPin className="h-6 w-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">Style By Lucid</p>
                  <p className="text-gray-600">Abuja, Nigeria</p>
                  <a
                    href="https://www.google.com/maps/place/Style+By+Lucid/@9.0831018,7.4662676,18.48z/data=!4m6!3m5!1s0x104e0bdbab848e7b:0x98705e1a7e860ee1!8m2!3d9.0828299!4d7.4661299!16s%2Fg%2F11lf7dllmm?entry=ttu&g_ep=EgoyMDI1MDQwNi4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black underline hover:text-gray-700 mt-2 inline-block"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiPhone className="h-6 w-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+234 123 456 7890</p>
                  <p className="text-gray-600">Mon-Sat: 9am-6pm</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <FiMail className="h-6 w-6 text-gray-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Email Us</h3>
                  <p className="text-gray-600">hello@stylebylucid.com</p>
                  <p className="text-gray-600">Response within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="mt-8 aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.715208783492!2d7.4662676!3d9.0831018!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104e0bdbab848e7b%3A0x98705e1a7e860ee1!2sStyle%20By%20Lucid!5e0!3m2!1sen!2sng!4v1712672000000!5m2!1sen!2sng"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-700 hover:text-black transition duration-200"
                  aria-label="Instagram"
                >
                  <FiInstagram className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-black transition duration-200"
                  aria-label="Twitter"
                >
                  <FiTwitter className="h-6 w-6" />
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-black transition duration-200"
                  aria-label="Facebook"
                >
                  <FiFacebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      <Footer/>
   
   
   </>
  );
}