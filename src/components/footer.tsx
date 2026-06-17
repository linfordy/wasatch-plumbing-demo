import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/company";

const serviceLinks = [
  { label: "Emergency Plumbing", href: "/services/emergency-plumbing" },
  { label: "Residential", href: "/services/residential-plumbing" },
  { label: "Commercial", href: "/services/commercial-plumbing" },
  { label: "Water Heaters", href: "/services/water-heaters" },
  { label: "Drain Cleaning", href: "/services/drain-cleaning" },
  { label: "Backflow Testing", href: "/services/backflow-testing" },
];

const areaLinks = [
  { label: "South Jordan", href: "/service-areas/south-jordan" },
  { label: "Riverton", href: "/service-areas/riverton" },
  { label: "Sandy", href: "/service-areas/sandy" },
  { label: "Draper", href: "/service-areas/draper" },
  { label: "Bluffdale", href: "/service-areas/bluffdale" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Specials", href: "/specials" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-darker">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span
                style={{
                  fontFamily: "'Kaushan Script', cursive",
                  fontSize: "1.75rem",
                  lineHeight: 1,
                  color: "white",
                  letterSpacing: "0.5px",
                }}
              >
                Wasatch Plumbing
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Family-owned plumbing service in South Jordan, UT. Trusted local
              of master plumbers serving Salt Lake Valley since 2018.
            </p>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              {company.address.street}
              <br />
              {company.address.city}, {company.address.state}{" "}
              {company.address.zip}
            </p>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-xs text-gray-500 mb-4 font-semibold"
              style={{ letterSpacing: "2px" }}
            >
              SERVICES
            </h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4
              className="text-xs text-gray-500 mb-4 font-semibold"
              style={{ letterSpacing: "2px" }}
            >
              SERVICE AREAS
            </h4>
            <ul className="space-y-2.5">
              {areaLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="text-xs text-gray-500 mb-4 font-semibold"
              style={{ letterSpacing: "2px" }}
            >
              COMPANY
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-brand-darker gap-4">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} {company.legalName}. All rights
            reserved. {company.license}
          </p>
          <div className="flex gap-3">
            {company.social.facebook && (
              <a
                href={company.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brand-darker rounded-lg flex items-center justify-center text-gray-500 hover:bg-brand-red hover:text-white transition-all text-sm"
                aria-label="Facebook"
              >
                f
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
