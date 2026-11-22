import { CLIENT_TESTIMONIALS } from '../shared/agencyData.ts';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
            Client Satisfaction &amp; Proof
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111827] text-balance">
            What local business owners say after moving to page one
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLIENT_TESTIMONIALS.map((item) => (
            <figure
              key={item.id}
              className="bg-white rounded-xl border border-[#E5E7EB] p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                <p
                  className="text-xs font-semibold text-[#1E40AF] tabular-nums mb-3"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {item.metricHighlight}
                </p>
                <blockquote className="text-sm sm:text-base text-[#1F2937] leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
              </div>

              <figcaption className="mt-6 pt-4 border-t border-[#F3F4F6]">
                <div className="text-sm font-semibold text-[#111827]">{item.clientName}</div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  {item.role}
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  {item.businessName}, {item.location}
                </div>
                <div className="text-xs text-[#4B5563] mt-1">{item.serviceUsed}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
