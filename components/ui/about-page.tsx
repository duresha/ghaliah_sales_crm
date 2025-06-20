"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useScroll,
  useInView,
} from "framer-motion";
import {
  Building2,
  Users,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  image: string;
}

interface GlassProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

const Glass = React.forwardRef<HTMLDivElement, GlassProps>(
  ({ className, width = "w-[360px] lg:w-[900px]", height = "h-[40px]", ...props }, ref) => {
    return (
      <div 
        className="fixed md:absolute animate-slide-up top-0 left-1/2 right-1/2 z-50" 
        ref={ref} 
        {...props}
      >
        <div className="flex flex-col items-center justify-center w-full">
          <div className={`relative overflow-hidden rounded-b-2xl ${width} ${height}`}>
            <div className="pointer-events-none absolute bottom-0 z-10 h-full w-[900px] overflow-hidden border border-[#f5f5f51a] rounded-b-2xl">
              <div className="glass-effect h-full w-full" />
            </div>
            <svg>
              <defs>
                <filter id="fractal-noise-glass">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.12 0.12"
                    numOctaves="1"
                    result="warp"
                  />
                  <feDisplacementMap
                    xChannelSelector="R"
                    yChannelSelector="G"
                    scale="30"
                    in="SourceGraphic"
                    in2="warp"
                  />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    );
  }
);
Glass.displayName = "Glass";

const AnimatedTooltip = ({
  items,
  className,
}: {
  items: TeamMember[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig
  );
  const handleMouseMove = (event: any) => {
    const halfWidth = event.target.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map((item) => (
        <div
          className="-mr-4 relative group"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute -top-16 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-foreground z-50 shadow-xl px-4 py-2"
              >
                <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-purple-500 to-transparent h-px" />
                <div className="absolute left-10 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-purple-400 to-transparent h-px" />
                <div className="font-bold text-background relative z-30 text-base">
                  {item.name}
                </div>
                <div className="text-muted-foreground text-xs">
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="object-cover !m-0 !p-0 object-top rounded-full h-14 w-14 border-2 group-hover:scale-105 group-hover:z-30 border-background relative transition duration-500"
          />
        </div>
      ))}
    </div>
  );
};

interface StatCounterProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix: string;
  delay: number;
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: false });
  const [hasAnimated, setHasAnimated] = useState(false);

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 10,
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value);
      setHasAnimated(true);
    } else if (!isInView && hasAnimated) {
      springValue.set(0);
      setHasAnimated(false);
    }
  }, [isInView, value, springValue, hasAnimated]);

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl flex flex-col items-center text-center group hover:bg-white/20 transition-all duration-300"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-300 group-hover:bg-purple-500/30 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-3xl font-bold text-white flex items-center">
        <motion.span>{displayValue}</motion.span>
        <span>{suffix}</span>
      </motion.div>
      <p className="text-white/70 text-sm mt-1">{label}</p>
      <motion.div className="w-10 h-0.5 bg-purple-400 mt-3 group-hover:w-16 transition-all duration-300" />
    </motion.div>
  );
}

const GhaliahAboutPage = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 });
  const isStatsInView = useInView(statsRef, { once: false, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Ahmed",
      designation: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    },
    {
      id: 2,
      name: "Omar Hassan",
      designation: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    },
    {
      id: 3,
      name: "Fatima Al-Zahra",
      designation: "Head of Sales",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 4,
      name: "Ahmed Malik",
      designation: "Product Manager",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    },
    {
      id: 5,
      name: "Layla Ibrahim",
      designation: "UX Designer",
      image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    },
  ];

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Comprehensive sales analytics and reporting tools to track performance and identify opportunities.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Customer Management",
      description: "Centralized customer database with detailed profiles, interaction history, and preferences.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Data Security",
      description: "Enterprise-grade security measures to protect your sensitive business and customer data.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Automation",
      description: "Intelligent automation for lead scoring, follow-ups, and workflow optimization.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Channel",
      description: "Seamless integration across email, phone, social media, and in-person interactions.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Sales Pipeline",
      description: "Visual pipeline management with customizable stages and automated progression tracking.",
    },
  ];

  const stats = [
    { icon: <Building2 />, value: 500, label: "Active Companies", suffix: "+" },
    { icon: <Users />, value: 10000, label: "Users Worldwide", suffix: "+" },
    { icon: <Award />, value: 98, label: "Customer Satisfaction", suffix: "%" },
    { icon: <Star />, value: 5, label: "Average Rating", suffix: "/5" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
      <style jsx global>{`
        .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          background: repeating-radial-gradient(
            circle at 50% 50%,
            rgb(255 255 255 / 0),
            rgba(255, 255, 255, 0.2) 10px,
            rgb(255 255 255) 31px
          );
          filter: url(#fractal-noise-glass);
          background-size: 6px 6px;
          backdrop-filter: blur(0px);
        }

        @keyframes slide-up {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      {/* Background decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-purple-400/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div ref={sectionRef} className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="py-20 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div variants={itemVariants} className="mb-8">
              <motion.span
                className="text-purple-300 font-medium mb-2 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Building2 className="w-4 h-4" />
                GHALIAH SALES CRM
              </motion.span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                About Ghaliah
              </h1>
              <motion.div
                className="w-24 h-1 bg-purple-400 mx-auto"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed"
            >
              Empowering businesses worldwide with intelligent CRM solutions that transform sales processes, 
              enhance customer relationships, and drive sustainable growth through innovation and excellence.
            </motion.p>
          </div>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
                    <Target className="w-12 h-12 text-purple-400 mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-white">Our Mission</h2>
                    <p className="text-white/80 leading-relaxed">
                      To revolutionize how businesses manage customer relationships by providing 
                      intuitive, powerful, and scalable CRM solutions that enable companies to 
                      build meaningful connections, streamline operations, and achieve unprecedented growth.
                    </p>
                  </Card>
                  <Glass className="absolute -top-4 -right-4" width="w-32" height="h-32" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                  <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Innovation First</h3>
                  <p className="text-white/70">
                    Continuously pushing boundaries with cutting-edge technology and user-centric design.
                  </p>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                  <Shield className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Trust & Security</h3>
                  <p className="text-white/70">
                    Maintaining the highest standards of data protection and customer privacy.
                  </p>
                </Card>

                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                  <Users className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Customer Success</h3>
                  <p className="text-white/70">
                    Dedicated to ensuring every customer achieves their business objectives.
                  </p>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Key Features</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Discover the powerful features that make Ghaliah CRM the preferred choice for modern businesses.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 p-6 h-full hover:bg-white/15 transition-all duration-300">
                    <div className="text-purple-400 mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Meet Our Team</h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                The passionate individuals behind Ghaliah CRM, dedicated to delivering excellence and innovation.
              </p>
              <div className="flex justify-center">
                <AnimatedTooltip items={teamMembers} />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          ref={statsRef}
          className="py-16 px-4"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl">
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Our Impact</h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Numbers that reflect our commitment to excellence and customer success.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <StatCounter
                  key={index}
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div variants={itemVariants}>
                <h2 className="text-4xl font-bold mb-6 text-white">Get in Touch</h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  Ready to transform your sales process? Contact us today to learn how Ghaliah CRM 
                  can help your business achieve its goals.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <p className="text-white/70">contact@ghaliah.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <p className="text-white/70">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Address</p>
                      <p className="text-white/70">123 Business Ave, Tech City, TC 12345</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="bg-white/10 backdrop-blur-md border-white/20 p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">Send us a Message</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white/80">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-white/80">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help?"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-white/80">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project..."
                        rows={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-16 px-4"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <div className="container mx-auto max-w-4xl">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-md border border-white/20 rounded-2xl p-12 text-center"
            >
              <h2 className="text-4xl font-bold mb-4 text-white">Ready to Get Started?</h2>
              <p className="text-white/80 mb-8 text-lg">
                Join thousands of businesses that trust Ghaliah CRM to drive their success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Schedule Demo
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default GhaliahAboutPage; 
