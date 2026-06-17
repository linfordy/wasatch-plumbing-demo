import { company } from "@/data/company";
import { createMetadata } from "@/lib/metadata";
import { GoogleMap } from "@/components/google-map";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { ScheduleForm } from "@/components/schedule-form";

export const metadata = createMetadata({
  title: "Contact Us",
  description: `Contact Wasatch Plumbing Co. in South Jordan, UT. Call ${company.phone}, text ${company.text}, or visit us at ${company.address.full}. Available 24/7.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <section className="pt-32 pb-16 px-6 lg:px-10 bg-gradient-to-b from-brand-dark to-brand-black">
        <div className="max-w-4xl mx-auto">
          <AnimateOnScroll>
            <h1 className="text-4xl lg:text-5xl font-black mb-6">
              Contact <span className="text-brand-red">Us</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Available 24/7 for emergencies. Schedule service or ask us
              anything.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <AnimateOnScroll direction="left">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold mb-3">Call or Text</h2>
                <a
                  href={`tel:${company.phoneRaw}`}
                  className="block text-2xl font-black text-brand-red mb-2"
                >
                  {company.phone}
                </a>
                <a
                  href={`sms:${company.textRaw}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Text us: {company.text}
                </a>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Visit Us</h2>
                <p className="text-gray-400">
                  {company.address.street}
                  <br />
                  {company.address.city}, {company.address.state}{" "}
                  {company.address.zip}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">Hours</h2>
                <p className="text-gray-400">
                  Open 24/7 — including nights, weekends, and holidays
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <ScheduleForm />
          </AnimateOnScroll>
        </div>
      </section>

      <section className="pb-16 px-6 lg:px-10 max-w-4xl mx-auto">
        <AnimateOnScroll>
          <GoogleMap src={company.googleMapsEmbed} />
        </AnimateOnScroll>
      </section>
    </>
  );
}
