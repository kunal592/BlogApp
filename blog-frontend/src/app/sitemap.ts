import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.example.com";

    // Static pages
    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
        { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.9 },
        { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
        { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.3 },
    ];

    // TODO: Fetch dynamic blog posts from API
    // const blogs = await fetchAllBlogs();
    // const blogPages = blogs.map(blog => ({
    //   url: `${baseUrl}/blog/${blog.slug}`,
    //   lastModified: new Date(blog.updatedAt),
    //   changeFrequency: "weekly" as const,
    //   priority: 0.8,
    // }));

    return [...staticPages];
}
