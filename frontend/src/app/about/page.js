"use client";

import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Heart,
  Star,
} from "lucide-react";

const INTER = "'Inter', sans-serif";
const PLAYFAIR = "'Playfair Display', serif";

export default function AboutPage() {
  const reviews = [
    { name: "Ananya Sharma", city: "Delhi", text: "The fabric feels incredibly soft and breathable while giving perfect body support. My outfits look so much more polished." },
    { name: "Priya Kapoor", city: "Mumbai", text: "Unlike other shapewear brands, this never feels tight. It gives a smooth shape and I can wear it all day comfortably." },
    { name: "Neha Verma", city: "Bangalore", text: "Premium quality that fits perfectly. A natural shape without feeling restrictive — exactly what I was looking for." },
    { name: "Riya Mehta", city: "Pune", text: "Perfect for everyday outfits. The fabric feels light, breathable, and gives me confidence in everything I wear." },
    { name: "Simran Kaur", city: "Chandigarh", text: "I've tried many brands but IMKAA is by far the most comfortable. It fits beautifully and stays in place all day." },
    { name: "Kritika Jain", city: "Jaipur", text: "The shaping effect is completely natural. IMKAA really understands what women need from everyday shapewear." },
    { name: "Pooja Arora", city: "Lucknow", text: "My dresses look so smooth wearing IMKAA shapewear. The material is premium and the design is thoughtfully done." },
    { name: "Megha Gupta", city: "Hyderabad", text: "Both comfort and confidence in one product. Excellent fabric quality that works perfectly under any outfit." },
  ];

  return (
    <main style={{ background: '#FFF8F6', fontFamily: INTER }}>

      {/* ── Hero ── */}
      <section style={{ background: '#FCEFEA', paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p style={{ fontFamily: INTER, fontWeight: 500, fontSize: '13px', color: '#C56F7F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            Our Story
          </p>
          <h1 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 'clamp(36px, 5vw, 56px)', color: '#4A2E35', lineHeight: 1.1, marginBottom: '20px' }}>
            About IMKAA
          </h1>
          <p style={{ fontFamily: INTER, fontSize: '16px', color: '#6F5560', lineHeight: 1.7, maxWidth: '680px', margin: '0 auto' }}>
            IMKAA is a modern fashion and lifestyle brand created to bring confidence, comfort, and elegance to every woman. We design shapewear and fashion essentials that celebrate real body shapes and real lifestyles.
          </p>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p style={{ fontFamily: INTER, fontWeight: 500, fontSize: '13px', color: '#C56F7F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                How We Started
              </p>
              <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 'clamp(28px, 3vw, 38px)', color: '#4A2E35', marginBottom: '24px', lineHeight: 1.2 }}>
                A Brand Built on Confidence
              </h2>
              <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75, marginBottom: '16px' }}>
                IMKAA was founded with a simple vision — to create shapewear that supports the natural body while enhancing comfort, style, and confidence. We believe fashion should never compromise comfort, and every woman deserves clothing that fits beautifully and feels effortless throughout the day.
              </p>
              <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75, marginBottom: '16px' }}>
                Inspired by the evolving needs of modern women, our collections are built using carefully selected fabrics, innovative shaping technology, and modern silhouettes that complement different body types.
              </p>
              <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75 }}>
                From everyday essentials to premium fashion collections, IMKAA brings together quality, comfort, and customer-focused design to redefine online shopping for women.
              </p>
            </div>

            <div style={{ borderRadius: 22, overflow: 'hidden', border: '1px solid #EAD7DD' }}>
              <Image
                src="/about-2.jpg"
                alt="IMKAA Brand Story"
                width={600}
                height={420}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section style={{ background: '#FCEFEA', paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 'clamp(28px, 3vw, 40px)', color: '#4A2E35', marginBottom: '10px' }}>
              Why Choose IMKAA
            </h2>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#8C7480', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Everything we do is designed to make you feel beautiful, comfortable, and confident every single day.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <ShoppingBag size={32} />, title: "Premium Quality", text: "Carefully selected fabrics and designs for lasting comfort and style." },
              { icon: <Truck size={32} />, title: "Fast Delivery", text: "Reliable shipping across India with real-time order tracking." },
              { icon: <ShieldCheck size={32} />, title: "Secure Shopping", text: "Safe payment methods with full privacy protection on every order." },
              { icon: <Heart size={32} />, title: "Customer First", text: "Our customers are at the heart of everything we design and deliver." },
            ].map((item) => (
              <div key={item.title}
                style={{
                  background: '#FFFFFF', border: '1px solid #EAD7DD',
                  borderRadius: 22, padding: '32px 24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 12,
                  boxShadow: '0 2px 8px rgba(74,46,53,0.04)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}>
                <div style={{ color: '#C56F7F', marginBottom: 4 }}>{item.icon}</div>
                <h3 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: '18px', color: '#4A2E35' }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: INTER, fontSize: '14px', color: '#8C7480', lineHeight: 1.65 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section style={{ paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-[1280px] mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div>
            <p style={{ fontFamily: INTER, fontWeight: 500, fontSize: '12px', color: '#C56F7F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              What Drives Us
            </p>
            <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 'clamp(26px, 2.5vw, 36px)', color: '#4A2E35', marginBottom: '18px' }}>
              Our Mission
            </h2>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75, marginBottom: '14px' }}>
              To create shapewear and fashion essentials that empower women to feel confident and comfortable in their own skin. We focus on designs that enhance natural body shapes while providing maximum comfort for everyday wear.
            </p>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75 }}>
              By combining innovative fabrics, thoughtful design, and real customer feedback, IMKAA celebrates body positivity and encourages every woman to embrace her individuality.
            </p>
          </div>

          <div>
            <p style={{ fontFamily: INTER, fontWeight: 500, fontSize: '12px', color: '#C56F7F', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Where We're Going
            </p>
            <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 'clamp(26px, 2.5vw, 36px)', color: '#4A2E35', marginBottom: '18px' }}>
              Our Vision
            </h2>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75, marginBottom: '14px' }}>
              To become a trusted shapewear and lifestyle brand that supports women across the world — delivering high-quality products that combine elegance, innovation, and comfort.
            </p>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#6F5560', lineHeight: 1.75 }}>
              Through continuous improvement and community feedback, IMKAA strives to create fashion solutions that make everyday life more comfortable, stylish, and empowering.
            </p>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section style={{ background: '#FCEFEA', paddingTop: 88, paddingBottom: 88 }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 600, fontSize: 'clamp(28px, 3vw, 40px)', color: '#4A2E35', marginBottom: '10px' }}>
              Loved by Thousands of Women
            </h2>
            <p style={{ fontFamily: INTER, fontSize: '15px', color: '#8C7480', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Real words from real customers who trust IMKAA for comfort, confidence, and everyday elegance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r) => (
              <div key={r.name}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #EAD7DD',
                  borderRadius: 22,
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(74,46,53,0.04)',
                }}>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#C56F7F" style={{ color: '#C56F7F' }} />
                  ))}
                </div>
                <p style={{ fontFamily: INTER, fontSize: '14px', color: '#6F5560', lineHeight: 1.65, marginBottom: '16px' }}>
                  "{r.text}"
                </p>
                <div>
                  <p style={{ fontFamily: INTER, fontWeight: 600, fontSize: '14px', color: '#4A2E35' }}>
                    {r.name}
                  </p>
                  <p style={{ fontFamily: INTER, fontSize: '12px', color: '#8C7480' }}>
                    {r.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#C56F7F', paddingTop: 72, paddingBottom: 72, textAlign: 'center' }}>
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 style={{ fontFamily: PLAYFAIR, fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: '#FFF9FA', marginBottom: '14px' }}>
            Discover Fashion With IMKAA
          </h2>
          <p style={{ fontFamily: INTER, fontSize: '15px', color: 'rgba(255,249,250,0.85)', marginBottom: '32px', lineHeight: 1.6 }}>
            Explore our latest collections and experience the perfect blend of style, comfort, and confidence.
          </p>
          <a href="/bra"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#FFF4F6', color: '#C56F7F',
              fontFamily: INTER, fontWeight: 600, fontSize: '15px',
              padding: '14px 32px', borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 4px 18px rgba(74,46,53,0.15)',
              transition: 'transform 0.2s, background 0.2s',
            }}>
            Shop Collection
          </a>
        </div>
      </section>

    </main>
  );
}
