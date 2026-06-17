import { notFound } from "next/navigation";
import { getAllSlugs, getPost } from "@/lib/mdx";
import { createMetadata } from "@/lib/metadata";
import { blogPostSchema, breadcrumbSchema } from "@/lib/schema";
import { CTASection } from "@/components/cta-section";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  let Content: React.ComponentType;
  try {
    const mod = await import(`@/content/blog/${slug}.mdx`);
    Content = mod.default;
  } catch {
    notFound();
  }

  return (
    <>
      <section className="pt-32 pb-8 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-3xl mx-auto">
          <AnimateOnScroll>
            <span className="text-brand-red text-xs tracking-[2px] font-semibold">
              {post.category}
            </span>
            <h1 className="text-3xl lg:text-4xl font-black mt-2 mb-4">
              {post.title}
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <article className="py-12 px-6 lg:px-10 max-w-3xl mx-auto prose prose-invert prose-red prose-sm lg:prose-base prose-headings:font-bold prose-a:text-brand-red prose-a:no-underline hover:prose-a:underline">
        <Content />
      </article>

      <CTASection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: post.title, href: `/blog/${slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
