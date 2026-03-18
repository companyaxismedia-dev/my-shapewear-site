"use client";

import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  Users,
  Sparkles
} from "lucide-react";

export default function AboutPage() {
  return (

    <main className="bg-white">

      {/* HERO SECTION */}

      <section className="bg-pink-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            About IMKAA
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            IMKAA is a modern fashion and lifestyle brand created to bring
            confidence, comfort, and style to every woman. Our mission is to
            deliver high-quality fashion products that combine elegance,
            affordability, and everyday comfort.
          </p>

        </div>
      </section>


      {/* BRAND STORY */}

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>

            <h2 className="text-3xl font-bold mb-6">
              Our Story
            </h2>

            <p className="text-gray-600 mb-4">
              IMKAA was founded with the vision of creating a fashion platform
              that celebrates individuality and comfort. We believe that
              clothing is more than just style — it is confidence, personality,
              and self-expression.
            </p>

            <p className="text-gray-600">
              From everyday essentials to premium fashion collections,
              IMKAA brings together quality fabrics, modern designs, and
              customer-focused experiences to redefine online shopping.
            </p>

            <p className="text-gray-600 mb-4">
              IMKAA is a modern shapewear and fashion brand designed to help women feel confident, comfortable, and empowered in their everyday lives. Our journey started with a simple vision — to create shapewear that supports the natural body while enhancing comfort, style, and confidence. We believe that fashion should never compromise comfort, and every woman deserves clothing that fits beautifully and feels effortless throughout the day.
            </p>

            <p className="text-gray-600 mb-4">
              Inspired by the evolving needs of modern women, IMKAA focuses on creating thoughtfully designed shapewear and fashion essentials that blend functionality with elegance. Our collections are built using carefully selected fabrics, innovative shaping technology, and modern silhouettes that complement different body types while providing all-day comfort and support.
            </p>

            <p className="text-gray-600">
              At IMKAA, we are committed to redefining everyday fashion by combining quality, comfort, and confidence. From everyday shapewear essentials to premium fashion pieces, our goal is to build a brand that celebrates individuality and empowers women to feel their best in every moment.
            </p>

          </div>

          <div className="rounded-xl overflow-hidden">
            <Image
              src="/about-2.jpg"
              alt="IMKAA Fashion"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>

        </div>
      </section>


      {/* VALUES */}

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-12">
            Why Choose IMKAA
          </h2>

          <div className="grid md:grid-cols-4 gap-10">

            <div className="flex flex-col items-center">
              <ShoppingBag className="text-pink-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg">Premium Quality</h3>
              <p className="text-gray-600 text-sm mt-2">
                Carefully selected fabrics and designs to ensure the best
                quality for our customers.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Truck className="text-pink-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg">Fast Delivery</h3>
              <p className="text-gray-600 text-sm mt-2">
                Reliable and fast shipping across India with real-time order
                tracking.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <ShieldCheck className="text-pink-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg">Secure Shopping</h3>
              <p className="text-gray-600 text-sm mt-2">
                Safe and secure payment methods with strong privacy protection.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Heart className="text-pink-500 mb-4" size={40} />
              <h3 className="font-semibold text-lg">Customer First</h3>
              <p className="text-gray-600 text-sm mt-2">
                Our customers are at the heart of everything we design and
                deliver.
              </p>

            </div>

          </div>

        </div>
      </section>


      {/* TEAM / COMMUNITY */}

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div className="rounded-xl overflow-hidden">
            <Image
              src="/about-3.webp"
              alt="IMKAA Team"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>

          <div>

            <h2 className="text-3xl font-bold mb-6">
              Our Community
            </h2>

            <p className="text-gray-600 mb-4">
              IMKAA is more than a brand — it is a community of people who
              believe in confidence, creativity, and individuality.
            </p>

            <p className="text-gray-600">
              We collaborate with designers, creators, and fashion lovers
              to build a platform where style meets innovation and comfort.
            </p>

            <p className="text-gray-600 mb-4">
              IMKAA is more than just a fashion brand — it is a growing community built around confidence, comfort, and self-expression. We believe that fashion should empower every woman to feel comfortable in her own skin while embracing her individuality. Our community includes women from different backgrounds who share a common belief that confidence begins with feeling good about what you wear.
            </p>

            <p className="text-gray-600 mb-4">
              Through IMKAA, we aim to create a space where modern fashion meets comfort-focused design. We collaborate with designers, creators, stylists, and fashion enthusiasts who are passionate about building products that truly support the everyday lifestyle of women. Our focus is not only on style but also on creating shapewear and fashion essentials that enhance confidence and comfort throughout the day.
            </p>

            <p className="text-gray-600">
              As our community continues to grow, IMKAA remains committed to innovation, inclusivity, and quality. By listening to our customers and understanding their needs, we continue to design products that celebrate real body shapes and real lifestyles. Our mission is to build a brand where every woman feels supported, confident, and proud of who she is.
            </p>

            <div className="flex gap-6 mt-6">

              <div className="flex items-center gap-2">
                <Users className="text-pink-500" />
                <span className="text-gray-700">Growing Community</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="text-pink-500" />
                <span className="text-gray-700">Innovative Fashion</span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* MISSION & VISION */}

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>

            <p className="text-gray-600 mb-4">
              At IMKAA, our mission is to create shapewear and fashion essentials that
              empower women to feel confident and comfortable in their own skin. We
              focus on designing products that enhance natural body shapes while
              providing maximum comfort for everyday wear.
            </p>

            <p className="text-gray-600">
              By combining innovative fabrics, modern design, and customer feedback,
              IMKAA aims to build a fashion brand that celebrates body positivity and
              encourages women to embrace their individuality.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>

            <p className="text-gray-600 mb-4">
              Our vision is to become a trusted shapewear and lifestyle brand that
              supports women across the world. We aim to deliver high-quality products
              that combine elegance, innovation, and comfort.
            </p>

            <p className="text-gray-600">
              Through continuous improvement and community feedback, IMKAA strives to
              create fashion solutions that make everyday life more comfortable,
              stylish, and empowering for women everywhere.
            </p>
          </div>

        </div>
      </section>

      {/* CUSTOMER REVIEWS */}

<section className="py-24 bg-gray-50">

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-4xl font-bold text-center mb-4">
      Loved by Thousands of Women
    </h2>

    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
      Thousands of women trust IMKAA for comfort, confidence and everyday
      fashion essentials. Here is what our customers say about their experience.
    </p>


    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">


      {/* REVIEW 1 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-1.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Ananya Sharma</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          I absolutely love IMKAA shapewear. The fabric feels incredibly soft
          and breathable while giving the perfect body support. I wear it under
          dresses and it makes my outfits look much more polished.
        </p>

      </div>



      {/* REVIEW 2 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-2.webp"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Priya Kapoor</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          The comfort level of IMKAA products is amazing. Unlike other
          shapewear brands, this does not feel tight or uncomfortable.
          It gives a smooth shape and I can wear it all day.
        </p>

      </div>



      {/* REVIEW 3 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-3.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Neha Verma</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          I was surprised by the quality of IMKAA shapewear. The material
          feels premium and it fits perfectly. It gives a natural shape
          without feeling restrictive.
        </p>

      </div>



      {/* REVIEW 4 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-4.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Riya Mehta</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          IMKAA shapewear is perfect for everyday outfits. It gives
          confidence when wearing dresses and fitted clothes.
          The fabric feels light and breathable.
        </p>

      </div>



      {/* REVIEW 5 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-5.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Simran Kaur</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          I tried many brands before but IMKAA is by far the most comfortable.
          It fits beautifully and stays in place throughout the day.
        </p>

      </div>



      {/* REVIEW 6 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-6.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Kritika Jain</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          The shaping effect is very natural and comfortable.
          IMKAA really understands what women want from shapewear.
        </p>

      </div>



      {/* REVIEW 7 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-7.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Pooja Arora</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          I love how smooth my dresses look when wearing IMKAA shapewear.
          The material feels very premium and the design is beautiful.
        </p>

      </div>



      {/* REVIEW 8 */}

      <div className="bg-white rounded-xl shadow-lg p-6 text-center">

        <Image
          src="/review-8.jpg"
          alt="Customer"
          width={80}
          height={80}
          className="rounded-full mx-auto mb-4"
        />

        <h3 className="font-semibold">Megha Gupta</h3>

        <p className="text-yellow-500 mb-3">★★★★★</p>

        <p className="text-gray-600 text-sm">
          IMKAA products give both comfort and confidence. The fabric
          quality is excellent and it works perfectly under any outfit.
        </p>

      </div>



    </div>

  </div>

</section>


      {/* CTA */}

      <section className="bg-pink-500 text-white py-16 text-center">

        <h2 className="text-3xl font-bold mb-4">
          Discover Fashion With IMKAA
        </h2>

        <p className="mb-6">
          Explore our latest collections and experience the perfect blend of
          style, comfort, and confidence.
        </p>

        <a
          href="/shop"
          className="bg-white text-pink-500 px-8 py-3 rounded font-semibold"
        >
          Shop Now
        </a>

      </section>

    </main>
  );
}