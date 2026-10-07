import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/minegocio" : "",
  // GitHub Pages sirve archivos estáticos: sin esto, el export genera `login.html`
  // y una URL con barra final `/login/` daba 404. Con trailingSlash el export
  // genera `login/index.html`, así funcionan tanto `/login` como `/login/`.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
