const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Empower Your Creative Journey
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            The ultimate platform for content creators to grow, monetize, and
            connect with their audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all">
              Get Started
            </button>
            <button className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div
        className="absolute bottom-0 left-0 w-full h-16 bg-white"
        style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
      ></div>
    </section>
  );
};

export default Hero;
