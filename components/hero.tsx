"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () => ["tricks", "kendama", "skills", "community", "passion"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative h-[600px]" data-testid="hero-section">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/303_group.png"
          alt="Kendama players group"
          fill
          className="w-full h-full object-cover filter brightness-[0.85]"
          priority
        />
      </div>
      <div className="container mx-auto relative z-10 h-full">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-3xl sm:text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular px-4 text-white">
              <span className="text-primary">Master</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed tracking-tight text-white/80 max-w-2xl text-center px-4">
              Learn from expert instructors and take your kendama skills to the next level.
              High-quality tutorials for players of all skill levels.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 px-4 w-full max-w-xs sm:max-w-none justify-center">
            <Link href="/lessons" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto" variant="default">
                Browse Lessons <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="gap-2 w-full sm:w-auto"
                variant="outline"
              >
                Create Account <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
