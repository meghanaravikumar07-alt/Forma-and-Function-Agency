import { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { PORTFOLIO_PROJECTS } from '../shared/agencyData.ts';
import type { PortfolioCategory, PortfolioProject } from '../types.ts';
import { ResilientImage } from './ResilientImage.tsx';

interface PortfolioSectionProps {
  onBookSimilar: (serviceId: string) => void;
}

const CATEGORIES: PortfolioCategory[] = [
  'All Projects',
  'Local SEO',
  'Web & Booking',
  'E-Commerce',
];

export function PortfolioSection({ onBookSimilar }: PortfolioSectionProps) {
  const [activeCategory, setActiveCategory] = useState<PortfolioCategory>('All Projects');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  const visibleProjects =
    activeCategory === 'All Projects'
      ? PORTFOLIO_PROJECTS
      : PORTFOLIO_PROJECTS.filter((project) => project.category === activeCategory);

  return (
    <section id="portfolio" className="py-16 sm:py-20 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-[#1E40AF] mb-2">
              Project Portfolio &amp; Verified Outcomes
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111827] text-balance">
              Local businesses transformed into top-ranked neighborhood leaders
            </h2>
          </div>

          {/* Functional interactive filter tabs */}
          <div
            role="tablist"
            aria-label="Filter portfolio by category"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg border border-[#E5E7EB]"
          >
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#111827] shadow-sm'
                      : 'text-[#4B5563] hover:text-[#111827]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-column architectural case study grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleProjects.map((project) => (
            <article
              key={project.id}
              className="group bg-[#FAFAF9] rounded-xl border border-[#E5E7EB] overflow-hidden flex flex-col justify-between transition-colors hover:border-[#9CA3AF]"
            >
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#E5E7EB]">
                  <ResilientImage
                    src={project.imageUrl}
                    alt={project.imageAlt}
                    fallbackTitle={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280] mb-2">
                    <span>{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.location}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">Lighthouse {project.lighthouseScore}/100</span>
                  </div>

                  <h3 className="text-xl font-bold text-[#111827]">{project.title}</h3>

                  <p className="mt-2.5 text-sm text-[#4B5563] leading-relaxed">{project.summary}</p>

                  <div className="mt-5 pt-4 border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-xs text-[#6B7280]">Primary SEO Outcome</span>
                      <span className="text-sm font-semibold text-[#111827] tabular-nums">
                        {project.primaryMetric}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#6B7280]">Performance Benchmark</span>
                      <span className="text-sm font-semibold text-[#1E40AF] tabular-nums">
                        {project.secondaryMetric}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E40AF] hover:underline underline-offset-4 cursor-pointer"
                >
                  <span>Inspect Case Study</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onBookSimilar(
                      project.category === 'Local SEO' ? 'local-seo-sprint' : 'growth-engine'
                    )
                  }
                  className="px-3.5 py-2 text-xs font-medium text-[#111827] bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Book Similar Build
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Interactive Case Study Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-xl border border-[#E5E7EB] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <p className="text-xs text-[#6B7280] mb-1">
                  {selectedProject.clientName}
                  <span aria-hidden="true" className="mx-2">
                    ·
                  </span>
                  {selectedProject.location}
                </p>
                <h3 id="case-study-title" className="text-2xl font-bold text-[#111827]">
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close case study details"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 aspect-[16/9] w-full rounded-lg overflow-hidden border border-[#E5E7EB]">
              <ResilientImage
                src={selectedProject.imageUrl}
                alt={selectedProject.imageAlt}
                fallbackTitle={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] mb-1">Starting Challenge</h4>
                <p className="text-sm text-[#1F2937] leading-relaxed">
                  {selectedProject.beforeState}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] mb-1">
                  Web &amp; Local SEO Strategy Executed
                </h4>
                <p className="text-sm text-[#1F2937] leading-relaxed">
                  {selectedProject.strategyExecuted}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-[#6B7280] mb-1">Verified Outcome</h4>
                <p className="text-sm font-medium text-[#111827] leading-relaxed">
                  {selectedProject.outcomeAchieved}
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-semibold text-[#6B7280] mb-1.5">
                  Page-One Ranked Local Keywords
                </h4>
                <p className="text-sm text-[#1E40AF] font-medium">
                  {selectedProject.seoKeywordsRanked.join(' · ')}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-sm font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetService =
                    selectedProject.category === 'Local SEO'
                      ? 'local-seo-sprint'
                      : 'growth-engine';
                  setSelectedProject(null);
                  onBookSimilar(targetService);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#1E40AF] hover:bg-[#1E3A8A] rounded-lg transition-colors cursor-pointer"
              >
                Book Similar Strategy
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
