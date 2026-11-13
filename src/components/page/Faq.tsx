'use client'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Icon } from '@/components/icons/Icon'
import type { QA } from '@/lib/content'

/** Q&A accordion. JSON-LD FAQPage is added by the page (server side). */
export function Faq({ items, heading = 'Good to know' }: { items: QA[]; heading?: string }) {
  if (!items.length) return null
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="font-display text-3xl font-medium sm:text-4xl">{heading}</h2>
      <div className="mt-6 border-t border-current/40">
        {items.map((q) => (
          <Disclosure key={q.question} as="div" className="border-b border-current/20">
            <DisclosureButton className="group flex w-full items-start justify-between gap-6 py-5 text-left">
              <span className="text-lg font-semibold">{q.question}</span>
              <Icon name="plus" size={20} className="mt-1 shrink-0 transition-transform duration-300 group-data-open:rotate-45" />
            </DisclosureButton>
            <DisclosurePanel className="pb-6 pr-10 text-[1.05rem] leading-relaxed opacity-90">{q.answer}</DisclosurePanel>
          </Disclosure>
        ))}
      </div>
    </section>
  )
}
