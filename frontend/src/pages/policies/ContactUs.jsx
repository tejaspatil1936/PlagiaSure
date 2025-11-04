import React from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Users } from "lucide-react";
import PolicyLayout from "./PolicyLayout";

const ContactUs = () => {
  return (
    <PolicyLayout title="Contact Us" lastUpdated="January 2025">
        <div className="space-y-8">
          <section>
            <p className="text-lg text-gray-700 mb-8">
              We're here to help! Get in touch with our team for support, questions, or feedback 
              about PlagiaSure's plagiarism detection services.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Support</h3>
                    <p className="text-gray-700">support@plagiasure.com</p>
                    <p className="text-sm text-gray-600">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    <p className="text-gray-700">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-600">Monday-Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Address</h3>
                    <p className="text-gray-700">
                      PlagiaSure Inc.<br />
                      123 Academic Integrity Blvd<br />
                      Suite 456<br />
                      Education City, EC 12345<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-700">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 2:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specialized Support</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Sales & Partnerships</h3>
                    <p className="text-gray-700">sales@plagiasure.com</p>
                    <p className="text-sm text-gray-600">For institutional accounts and partnerships</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Technical Support</h3>
                    <p className="text-gray-700">tech@plagiasure.com</p>
                    <p className="text-sm text-gray-600">For API integration and technical issues</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Legal & Privacy</h3>
                    <p className="text-gray-700">legal@plagiasure.com</p>
                    <p className="text-sm text-gray-600">For legal inquiries and privacy concerns</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-6 w-6 text-[#3282B8] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Media & Press</h3>
                    <p className="text-gray-700">press@plagiasure.com</p>
                    <p className="text-sm text-gray-600">For media inquiries and press releases</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">How quickly do you respond to support requests?</h3>
                <p className="text-gray-700">We aim to respond to all support emails within 24 hours during business days. Urgent technical issues are prioritized and typically receive responses within 4-6 hours.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Do you offer phone support?</h3>
                <p className="text-gray-700">Yes, phone support is available for premium subscribers and institutional accounts during business hours. Free tier users can access email support.</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900">Can I schedule a demo or consultation?</h3>
                <p className="text-gray-700">Absolutely! Contact our sales team at sales@plagiasure.com to schedule a personalized demo or consultation for your institution.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                <strong>For urgent security issues or data breaches:</strong><br />
                Email: security@plagiasure.com<br />
                Phone: +1 (555) 911-HELP (Available 24/7)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Social Media</h2>
            <p className="text-gray-700 mb-4">
              Follow us on social media for updates, tips, and educational content:
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#3282B8] hover:text-[#2D4B7C] transition-colors">Twitter</a>
              <a href="#" className="text-[#3282B8] hover:text-[#2D4B7C] transition-colors">LinkedIn</a>
              <a href="#" className="text-[#3282B8] hover:text-[#2D4B7C] transition-colors">Facebook</a>
              <a href="#" className="text-[#3282B8] hover:text-[#2D4B7C] transition-colors">YouTube</a>
            </div>
          </section>
        </div>
      </PolicyLayout>
  );
};

export default ContactUs;