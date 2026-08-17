import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/student/dashboard/', '/student/results/', '/student/profile/'],
      },
    ],
    sitemap: 'https://sonuch-rms.vercel.app/sitemap.xml',
  };
}
