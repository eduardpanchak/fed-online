import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FAQ() {
  const { language, setLanguage, t } = useLanguage();
  const faqs = [
    {
      question: 'What is Locsy?',
      answer: 'Locsy is a comprehensive platform designed to help immigrants navigate life in the United Kingdom by providing essential information, resources, and services.',
    },
    {
      question: 'Is Locsy free to use?',
      answer: 'Locsy offers both free and Pro features. Basic information and resources are available for free, while premium features require a Pro subscription.',
    },
    {
      question: 'How do I upgrade to Pro?',
      answer: 'You can upgrade to Pro by clicking on any locked feature and following the payment process. Pro membership costs £9.99/year.',
    },
    {
      question: 'Can I register my business on Locsy?',
      answer: 'Yes! You can register your business through the Business Account section. Business listings start at £0.00/month for standard listings and £4.99/month for premium listings.',
    },
    {
      question: 'How do I change my nationality or language settings?',
      answer: 'You can change your settings by going to the Account section and selecting your preferences.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
    },
    {
      question: 'How can I contact support?',
      answer: 'You can contact us through the Feedback page in the Account section. We aim to respond to all inquiries within 24-48 hours.',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title={t('account.faq')} showBack />

      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">
            Find answers to common questions about Locsy
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <BottomNav />
    </div>
  );
}
