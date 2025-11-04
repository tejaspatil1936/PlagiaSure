import React from "react";
import PolicyLayout from "./PolicyLayout";

const TermsConditions = () => {
  return (
    <PolicyLayout title="Terms & Conditions" lastUpdated="January 2025">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using PlagiaSure's services, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do not 
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-700 mb-4">
              PlagiaSure provides AI-powered plagiarism detection and content analysis services for 
              educational institutions, businesses, and individuals. Our services include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Document plagiarism detection using multiple databases and sources</li>
              <li>AI-generated content detection</li>
              <li>Detailed analysis reports and recommendations</li>
              <li>Institutional dashboard and management tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
            <p className="text-gray-700 mb-4">
              As a user of PlagiaSure, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to circumvent or manipulate our detection algorithms</li>
              <li>Respect intellectual property rights of others</li>
              <li>Not share your account access with unauthorized users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">
              You may not use PlagiaSure to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Upload malicious content, viruses, or harmful code</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the service for competitive analysis or reverse engineering</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription and Payment</h2>
            <p className="text-gray-700 mb-4">
              PlagiaSure offers various subscription plans with different features and usage limits. 
              By subscribing to our service:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You agree to pay all applicable fees as described in your chosen plan</li>
              <li>Payments are processed securely through our payment partners</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>We reserve the right to change pricing with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              The PlagiaSure platform, including its algorithms, software, and content, is protected by 
              intellectual property laws. You retain ownership of content you submit, but grant us 
              necessary rights to provide our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              PlagiaSure provides its services "as is" without warranties. We are not liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>False positives or negatives in detection results</li>
              <li>Decisions made based on our analysis reports</li>
              <li>Service interruptions or technical issues</li>
              <li>Loss of data or content</li>
              <li>Indirect, incidental, or consequential damages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without prior notice, for conduct 
              that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or through our platform. Continued use of the service constitutes 
              acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms & Conditions, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@plagiasure.com<br />
                <strong>Address:</strong> PlagiaSure, Academic Integrity Solutions<br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>
        </div>
      </PolicyLayout>
  );
};

export default TermsConditions;