import React from "react";
import { Helmet } from "react-helmet-async";
import PolicyLayout from "./PolicyLayout";

const ShippingPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Shipping Policy - PlagiaSure</title>
        <meta
          name="description"
          content="PlagiaSure Shipping Policy - Learn about our digital service delivery and access policies."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <PolicyLayout title="Shipping Policy" lastUpdated="January 2025">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Digital Service Delivery</h2>
            <p className="text-gray-700 mb-4">
              PlagiaSure is a digital software-as-a-service (SaaS) platform that provides plagiarism 
              detection and AI content analysis services entirely online. As we offer digital services, 
              traditional shipping does not apply to our offerings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Access and Delivery</h2>
            <p className="text-gray-700 mb-4">
              Upon successful subscription and payment processing:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Immediate Access:</strong> Your account is activated instantly upon payment confirmation</li>
              <li><strong>24/7 Availability:</strong> Access our platform anytime through your web browser</li>
              <li><strong>Cloud-Based:</strong> No software installation or physical delivery required</li>
              <li><strong>Multi-Device Support:</strong> Use PlagiaSure on desktop, tablet, or mobile devices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Activation Timeline</h2>
            <p className="text-gray-700 mb-4">
              Service delivery timelines:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Individual Accounts:</strong> Instant activation (within 5 minutes)</li>
              <li><strong>Institutional Accounts:</strong> 1-2 business days for setup and configuration</li>
              <li><strong>Enterprise Solutions:</strong> 3-5 business days for custom implementation</li>
              <li><strong>API Integration:</strong> Access credentials provided within 24 hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
            <p className="text-gray-700 mb-4">
              Our digital services are available:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Geographic Coverage:</strong> Worldwide access (subject to local regulations)</li>
              <li><strong>Uptime Guarantee:</strong> 99.9% service availability</li>
              <li><strong>Maintenance Windows:</strong> Scheduled maintenance during low-usage periods</li>
              <li><strong>Support Coverage:</strong> Technical support during business hours</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Digital Content and Reports</h2>
            <p className="text-gray-700 mb-4">
              All analysis reports and content are delivered digitally:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Instant Reports:</strong> Analysis results available immediately upon completion</li>
              <li><strong>Download Options:</strong> Export reports in PDF, Word, or Excel formats</li>
              <li><strong>Cloud Storage:</strong> Reports stored securely in your account dashboard</li>
              <li><strong>Email Notifications:</strong> Optional email delivery of completed analyses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Physical Materials (If Applicable)</h2>
            <p className="text-gray-700 mb-4">
              In rare cases where physical materials may be involved:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Marketing Materials:</strong> Promotional items may be shipped for conferences or events</li>
              <li><strong>Hardware Tokens:</strong> Security tokens for enterprise accounts (if requested)</li>
              <li><strong>Shipping Costs:</strong> Any physical shipping costs will be clearly communicated</li>
              <li><strong>Delivery Time:</strong> 5-10 business days for domestic, 10-21 days for international</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Interruptions</h2>
            <p className="text-gray-700 mb-4">
              In case of service delivery issues:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Notification:</strong> Users notified immediately of any service interruptions</li>
              <li><strong>Status Updates:</strong> Real-time status available at status.plagiasure.com</li>
              <li><strong>Compensation:</strong> Service credits provided for extended outages</li>
              <li><strong>Alternative Access:</strong> Backup systems activated when possible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Access</h2>
            <p className="text-gray-700 mb-4">
              PlagiaSure is accessible globally, but please note:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Compliance:</strong> Service availability subject to local laws and regulations</li>
              <li><strong>Data Residency:</strong> Data storage locations may vary by region</li>
              <li><strong>Language Support:</strong> Primary interface in English, additional languages available</li>
              <li><strong>Payment Methods:</strong> Accepted payment methods may vary by country</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Requirements</h2>
            <p className="text-gray-700 mb-4">
              To access our digital services, you need:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Internet Connection:</strong> Stable broadband connection recommended</li>
              <li><strong>Web Browser:</strong> Modern browser (Chrome, Firefox, Safari, Edge)</li>
              <li><strong>JavaScript:</strong> JavaScript must be enabled</li>
              <li><strong>Cookies:</strong> Cookies must be enabled for full functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact for Service Issues</h2>
            <p className="text-gray-700">
              If you experience any issues with service delivery or access:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Technical Support:</strong> tech@plagiasure.com<br />
                <strong>General Support:</strong> support@plagiasure.com<br />
                <strong>Phone:</strong> +1 (555) 123-4567<br />
                <strong>Status Page:</strong> status.plagiasure.com
              </p>
            </div>
          </section>
        </div>
      </PolicyLayout>
    </>
  );
};

export default ShippingPolicy;