import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://campusdate.vercel.app'; // Replace with actual production URL

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/chat/',
        '/onboarding/',
        '/auth/'
      ], // Prevent search engines from crawling private auth flows and direct chats
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
