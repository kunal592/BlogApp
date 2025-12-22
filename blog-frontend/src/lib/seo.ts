import { Metadata } from "next";

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    type?: "website" | "article";
    publishedTime?: string;
    author?: string;
    tags?: string[];
}

export function generateSEO({
    title,
    description,
    image = "/og-default.png",
    type = "website",
    publishedTime,
    author,
    tags,
}: SEOProps): Metadata {
    const siteName = "Premium Blog Platform";
    const url = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.example.com";

    return {
        title: `${title} | ${siteName}`,
        description,
        keywords: tags?.join(", "),
        authors: author ? [{ name: author }] : undefined,
        openGraph: {
            title,
            description,
            url,
            siteName,
            type,
            images: [
                {
                    url: `${url}${image}`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            ...(type === "article" && {
                publishedTime,
                authors: author ? [author] : undefined,
                tags,
            }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${url}${image}`],
        },
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

// JSON-LD structured data generators
export function generateArticleSchema(article: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    image?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        author: {
            "@type": "Person",
            name: article.author,
        },
        datePublished: article.publishedTime,
        image: article.image,
        publisher: {
            "@type": "Organization",
            name: "Premium Blog Platform",
            logo: {
                "@type": "ImageObject",
                url: "/logo.png",
            },
        },
    };
}

export function generatePersonSchema(author: {
    name: string;
    bio?: string;
    image?: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        description: author.bio,
        image: author.image,
    };
}
