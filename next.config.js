/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  

    future: {
      webpack5: true,
    },
    
    webpack5: true,
    webpack: (config) => {
      config.resolve.fallback = { fs: false ,path: false};
  
      return config;
    },
 
  swcMinify: true,
};




module.exports = nextConfig

