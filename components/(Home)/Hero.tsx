'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    '/placeholder.svg?height=600&width=800',
    '/placeholder.svg?height=600&width=800',
    '/placeholder.svg?height=600&width=800',
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="flex flex-col md:flex-row min-h-[calc(100vh-60px)] w-full px-4">
      <div className="flex flex-col items-center justify-center px-6 py-6 md:w-3/5 md:px-12 lg:px-16">
        <div className="max-w-xl space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide text-center md:text-left">
            Let&apos;s Create Together
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Get creators more works! Promote your business through creators.
            Let&apos;s Grow Together!
          </p>
          <div className="flex flex-col-reverse space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button size="lg" className="font-medium">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="font-medium">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      <div className="relative flex items-center justify-center overflow-hidden md:w-2/5">
        <div className="relative w-1/2 md:w-full aspect-[1/1] p-32 lg:p-40">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000  ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide || '/placeholder.svg'}
                alt={`Slide ${index + 1}`}
                fill
                objectFit="cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
