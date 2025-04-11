'use client';
import { useState, FormEvent } from 'react';
import Container from '@/components/layout/Container';
import Button from '@/components/common/Button';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactAndOnboarding() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' }); // Reset form
    } catch (error) {
      setSubmitStatus('error');
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24">
      <Container>
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Contact Section - Left Side */}
          <div className="flex flex-col md:col-span-2 justify-self-start">
            {/* Contact Header */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Let's stay in touch.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Have questions about ClioX? We'd love to hear from you. Send us
                a message or reach out through any of the channels below.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-8 mb-12">
              {/* Email Contacts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Email Us
                </h3>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:contact@cliox.org"
                    className="text-lg text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    contact@cliox.org
                  </a>
                  <span className="text-gray-500 text-sm">
                    (General Inquiries)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:support@cliox.org"
                    className="text-lg text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    support@cliox.org
                  </a>
                  <span className="text-gray-500 text-sm">
                    (Technical Support)
                  </span>
                </div>
              </div>

              {/* TODO: Whatsapp Contact instead of phone */}

              {/* Phone Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Find Us</h3>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href="tel:+1234567890"
                    className="text-lg text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    +1 (234) 567-890
                  </a>
                  <span className="text-gray-500 text-sm">
                    (Mon-Fri, 9am-5pm PST)
                  </span>
                </div>
              </div>

              {/* Social/Code */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Build with Us
                </h3>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <a
                    href="https://github.com/ciferresearch/ClioX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
                  >
                    Follow us on GitHub
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 6v2h2.59l-6.3 6.3a1 1 0 0 0 0 1.4 1 1 0 0 0 1.42 0L14 9.41V12h2V6h-6z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Message Form - Right Side */}
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How can we help?"
                  required
                ></textarea>
              </div>

              {submitStatus && (
                <div
                  className={`text-sm ${
                    submitStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {submitStatus === "success"
                    ? "Message sent successfully!"
                    : "Failed to send message. Please try again."}
                </div>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
} 