import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export default function About() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="About EasyUK" showBack />

      <div className="container max-w-2xl mx-auto p-4 space-y-6">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-2xl font-bold text-foreground">Welcome to EasyUK</h2>
          
          <p className="text-muted-foreground">
            EasyUK is your comprehensive guide to living and working in the United Kingdom.
            We provide essential information and resources for immigrants to help navigate
            life in the UK.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Our Mission</h3>
          
          <p className="text-muted-foreground">
            To make the transition to life in the UK as smooth as possible by providing
            accurate, up-to-date information on essential services, benefits, employment,
            housing, and more.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">What We Offer</h3>
          
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Comprehensive guides and checklists</li>
            <li>NHS and healthcare information</li>
            <li>Job search resources</li>
            <li>Housing assistance</li>
            <li>Benefits and support information</li>
            <li>Education resources</li>
            <li>Community services directory</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Contact Us</h3>
          
          <p className="text-muted-foreground">
            Have questions or feedback? We'd love to hear from you. Visit our Feedback
            page to get in touch.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
