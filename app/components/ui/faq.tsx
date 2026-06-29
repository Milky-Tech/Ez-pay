import { useState } from "react";

const faqs = [
  {
    question: "What is Bridgent HomeStep EZ-Pay?",
    answer:
      "Bridgent HomeStep EZ-Pay is a rental platform that lets you move into verified, premium homes and pay your rent monthly — instead of the traditional one or two years upfront. We handle the financing so you can live comfortably without a large lump-sum payment.",
  },
  {
    question: "What does my monthly EZ-Pay fee include?",
    answer:
      "Your monthly fee covers your rent and applicable service charges, broken into predictable payments. The exact breakdown depends on the property and your selected plan.",
  },
  {
    question: "What do landlords gain by partnering with EZ-Pay?",
    answer:
      "Landlords receive guaranteed monthly payments, reduced vacancy risk, and access to thoroughly vetted tenants — without chasing rent or managing collections themselves.",
  },
  {
    question: "How long does the application and approval process take?",
    answer:
      "After you submit your application, identity and document verification typically completes within 24–72 hours. Full approval and move-in readiness is usually confirmed within 3–5 business days.",
  },
  {
    question: "Can I inspect a property before renting?",
    answer:
      "Yes. Property inspections can be scheduled before you finalise your rental decision. All listed properties are also pre-verified by our team for quality and accuracy.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 px-6 sm:px-20 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col gap-3 items-center text-center">
        <div className="bg-white shadow-lg shadow-primary/50 text-primary rounded-md py-2 px-6 mb-4 text-sm font-medium">
          FAQ
        </div>

        <h2 className="text-4xl font-semibold">Frequently Asked Questions</h2>

        <p className="text-gray-500 max-w-xl">
          Everything you need to know about living better with predictable
          monthly payments and premium homes.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-white"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left"
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>

                <span className="text-xl text-gray-500">
                  {isOpen ? "×" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
