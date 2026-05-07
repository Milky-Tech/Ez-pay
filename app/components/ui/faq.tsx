import { useState } from "react";

const faqs = [
  {
    question: "What is Bridget HomeStep EZ-Pay?",
    answer:
      "Yes. Every property listed on Realtysway goes through a verification process to ensure authenticity. We work only with trusted agents and landlords, so you can rent or buy with confidence.",
  },
  {
    question: "What does my monthly EZ-Pay fee include?",
    answer:
      "Your monthly EZ-Pay fee covers rent, service charges, and flexible payment support, depending on your selected plan.",
  },
  {
    question: "What do landlords gain by partnering with EZ-Pay?",
    answer:
      "Landlords receive guaranteed monthly payments, reduced vacancy risk, and access to vetted tenants.",
  },
  {
    question:
      "How long does the rental application and verification process take?",
    answer:
      "The verification process typically takes between 24–72 hours after submission.",
  },
  {
    question: "How long does the rental application and approval take?",
    answer: "Approvals are usually completed within 3–5 business days.",
  },
  {
    question: "Can I inspect a property before renting?",
    answer:
      "Yes, property inspections can be scheduled before finalizing your rental decision.",
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
