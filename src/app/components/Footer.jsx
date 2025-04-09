"use client";

import React from "react";
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  const categories = [
    { name: "Caps", link: "/Category/caps" },
    { name: "Palms", link: "/Category/palms" },
    { name: "Shoes", link: "/Category/shoes" },
    { name: "Kaftan", link: "/Category/kaftan" },
    { name: "Suit", link: "/Category/suits" },
    { name: "Agbada", link: "/Category/agbada" },
    { name: "Two piece", link: "/Category/two-piece" },
  ];

  const companyLinks = [
    { name: "About Us", link: "/about" },
    { name: "Contact", link: "/contact" },
    { name: "Privacy Policy", link: "/privacy" },
    { name: "Terms of Service", link: "/terms" },
  ];

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-widest uppercase">STYLE BY LUCID</h3>
            <p className="text-gray-400">
              Elevating African fashion with contemporary designs that blend tradition and modernity.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                <FiFacebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold uppercase tracking-wider border-b border-gray-800 pb-2">
              Shop By Category
            </h4>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <a
                    href={category.link}
                    className="text-gray-400 hover:text-white transition duration-300 capitalize"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold uppercase tracking-wider border-b border-gray-800 pb-2">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.link}
                    className="text-gray-400 hover:text-white transition duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold uppercase tracking-wider border-b border-gray-800 pb-2">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-400">Style By Lucid, Abuja, Nigeria</p>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="h-5 w-5 text-gray-400" />
                <a href="tel:+2341234567890" className="text-gray-400 hover:text-white transition duration-300">
                  +234 123 456 7890
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="h-5 w-5 text-gray-400" />
                <a href="mailto:hello@stylebylucid.com" className="text-gray-400 hover:text-white transition duration-300">
                  hello@stylebylucid.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Style By Lucid. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition duration-300">
              Shipping Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;