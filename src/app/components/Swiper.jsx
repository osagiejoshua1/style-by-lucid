"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";
import { formatPrice } from "../utils/formatPrice";

export default function SwiperComponent({ products }) {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      loop={true}
      slidesPerView={1}
      spaceBetween={15}
      breakpoints={{
        640: { slidesPerView: 1 },
        856: { slidesPerView: 2 },
        1024: { slidesPerView: 2 },
        1280: { slidesPerView: 5 },
      }}
      className="w-full h-[600px]"
    >
      {products.map((product) => (
        <SwiperSlide key={product._id}>
          <div className="relative w-full h-full">
            {/* Product Image */}
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
              style={{ aspectRatio: "9/16" }}
            />

            {/* Dark overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

            {/* Price & Shop Now button */}
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xl font-semibold">
                ₦{formatPrice(product.price)}
              </p>

              <Link href={`/product/${product._id}`}>
                <button className="mt-2 bg-transparent border border-white text-white px-4 py-2 rounded-md font-semibold text-sm hover:text-black hover:bg-white transition">
                  Shop Now <i className="ri-shopping-bag-line"></i>
                </button>
              </Link>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
