import { Clock, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { getMapsLink, getOrderLink, getWhatsappUrl, siteConfig } from '../data/siteConfig';

function InfoItem({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 border-t border-charcoal/15 py-5">
      <span className="mt-0.5 text-chili" aria-hidden>{icon}</span>
      <div>
        <p className="eyebrow mb-1.5 text-warmgray">{label}</p>
        <div className="text-lg font-medium">{children}</div>
      </div>
    </li>
  );
}

/** Shown in place of any detail the owner hasn't filled in yet. */
function Pending({ field }: { field: string }) {
  return (
    <span className="text-warmgray">
      Coming soon
      {import.meta.env.DEV && (
        <span className="ml-2 rounded bg-gold/40 px-1.5 py-0.5 font-mono text-xs text-charcoal">set {field} in siteConfig.ts</span>
      )}
    </span>
  );
}

export default function VisitSection() {
  const order = getOrderLink();
  const maps = getMapsLink();
  const wa = getWhatsappUrl();
  const { address, phone, hours, instagramUrl, instagramHandle } = siteConfig;

  return (
    <section id="visit" data-nav="light" aria-labelledby="visit-title" className="relative overflow-hidden bg-gold py-24 text-charcoal sm:py-32">
      <div aria-hidden className="pointer-events-none absolute -left-[10%] -top-[30%] h-[60vmax] w-[60vmax] rounded-full bg-chili/25 blur-3xl" />
      <div className="container-x relative grid gap-16 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <SectionHeading
            id="visit-title"
            eyebrow="Visit CAFE 93"
            eyebrowClassName="text-charcoal/70"
            lines={['Your next momo', 'moment', <span className="text-chili">starts here.</span>]}
            titleClassName="text-[clamp(2.6rem,7vw,6.4rem)]"
          >
            <p className="mt-6 max-w-md text-lg text-charcoal/75">Bring your cravings. We&rsquo;ll bring the momos.</p>
          </SectionHeading>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={order.href} external={order.external} magnetic variant="primary">
              Order now
            </Button>
            <Button href={maps.href} external={maps.external} variant="outline-dark">
              <MapPin className="h-4 w-4" aria-hidden /> Find us
            </Button>
          </div>
          {!order.configured && (
            <p className="mt-6 max-w-md text-sm text-charcoal/70">
              Online ordering isn&rsquo;t available yet — drop by the cafe and order at the counter.
            </p>
          )}
        </div>

        <div id="visit-info" tabIndex={-1} className="rounded-[28px] bg-cream/70 p-6 shadow-[0_30px_60px_-40px_rgba(21,21,21,.6)] backdrop-blur sm:p-8">
          <h3 className="mb-2 font-display text-2xl font-bold uppercase tracking-tight">Find &amp; reach us</h3>
          <ul>
            <InfoItem icon={<MapPin className="h-5 w-5" />} label="Address">
              {address ? (
                siteConfig.mapsUrl ? (
                  <a className="underline decoration-chili/50 underline-offset-4 hover:decoration-chili" href={siteConfig.mapsUrl} target="_blank" rel="noopener noreferrer">{address}</a>
                ) : address
              ) : <Pending field="address" />}
            </InfoItem>
            <InfoItem icon={<Clock className="h-5 w-5" />} label="Opening hours">
              {hours.length ? (
                <dl className="space-y-1">
                  {hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-6">
                      <dt>{h.days}</dt>
                      <dd className="text-charcoal/75">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              ) : <Pending field="hours" />}
            </InfoItem>
            <InfoItem icon={<Phone className="h-5 w-5" />} label="Phone">
              {phone ? <a className="hover:text-chili" href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a> : <Pending field="phone" />}
            </InfoItem>
            <InfoItem icon={<MessageCircle className="h-5 w-5" />} label="WhatsApp">
              {wa ? <a className="hover:text-chili" href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> : <Pending field="whatsappNumber" />}
            </InfoItem>
            <InfoItem icon={<Instagram className="h-5 w-5" />} label="Instagram">
              {instagramUrl ? (
                <a className="hover:text-chili" href={instagramUrl} target="_blank" rel="noopener noreferrer">{instagramHandle || instagramUrl}</a>
              ) : <Pending field="instagramUrl" />}
            </InfoItem>
          </ul>
        </div>
      </div>
    </section>
  );
}
