import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/mdx";
import { createMetadata } from "@/lib/metadata";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { StaggerChildren, StaggerItem } from "@/components/stagger-children";

export const metadata = createMetadata({
  title: "Blog",
  description:
    "Plumbing tips, project stories, and expert advice from Wasatch Plumbing Co. in South Jordan, UT. Real jobs, real solutions.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Our <span className="text-brand-red">Blog</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Real jobs, real solutions. Stories from the field across South Jordan
              and Salt Lake Valley.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <StaggerChildren className="space-y-6">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block bg-brand-dark border border-brand-darker rounded-xl p-6 hover:border-brand-red transition-all"
              >
                <div className="flex items-start gap-6">
                  {post.featuredImage && (
                    <div className="hidden sm:block relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-brand-red text-xs tracking-[2px] font-semibold">
                      {post.category}
                    </span>
                    <h2 className="text-lg font-bold mt-1 mb-2 group-hover:text-brand-red transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <span className="text-gray-600 text-xs mt-3 block">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>
    </>
  );
}
