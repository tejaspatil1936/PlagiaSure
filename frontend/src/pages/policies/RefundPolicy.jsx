import React from "react";
import { Helmet } from "react-helmet-async";
import PolicyLayout from "./PolicyLayout";

const RefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cancellation & Refund Policy - PlagiaSure</title>
        <meta
          name="description"
          content="PlagiaSure Cancellation & Refund Policy - Learn about our subscription cancellation and refund procedures."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <PolicyLayout title="Cancellation & Refund Policy" lastUpdated="January 2025">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Cancellation</h2>
            <p className="text-gray-700 mb-4">
              You may cancel your PlagiaSure subscription at any time through your account dashboard 
              or by contacting our support team. Here's what you need to know:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Cancellations can be processed immediately through your account settings</li>
              <li>You will retain access to paid features until the end of your current billing period</li>
              <li>No additional charges will be made after cancellation</li>
              <li>Your account data will be preserved for 90 days after cancellation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Eligibility</h2>
            <p className="text-gray-700 mb-4">
              We offer refunds under the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>30-Day Money-Back Guarantee:</strong> Full refund for new subscribers within 30 days</li>
              <li><strong>Service Outages:</strong> Prorated refunds for extended service interruptions</li>
              <li><strong>Billing Errors:</strong> Full refund for incorrect charges or duplicate payments</li>
              <li><strong>Technical Issues:</strong> Refunds when service cannot be delivered as promised</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Process</h2>
            <p className="text-gray-700 mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 text-gray-700 space-y-2">
              <li>Contact our support team at support@plagiasure.com</li>
              <li>Provide your account details and reason for refund request</li>
              <li>Our team will review your request within 2-3 business days</li>
              <li>Approved refunds will be processed within 5-7 business days</li>
              <li>Refunds will be credited to your original payment method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h2>
            <p className="text-gray-700 mb-4">
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Subscriptions cancelled after 30 days (except for service issues)</li>
              <li>Usage-based charges for document analysis already performed</li>
              <li>Third-party service fees or payment processing charges</li>
              <li>Accounts terminated for violation of terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prorated Refunds</h2>
            <p className="text-gray-700 mb-4">
              In cases of service outages or technical issues that prevent normal use of our platform, 
              we may offer prorated refunds calculated based on:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Duration of service interruption</li>
              <li>Impact on your ability to use core features</li>
              <li>Your subscription plan and billing cycle</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Downgrades</h2>
            <p className="text-gray-700 mb-4">
              If you downgrade your subscription plan:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Changes take effect at the next billing cycle</li>
              <li>No refunds are provided for the difference in plan costs</li>
              <li>You retain access to premium features until the current period ends</li>
              <li>Usage limits will adjust according to your new plan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Educational Institution Policies</h2>
            <p className="text-gray-700 mb-4">
              Special considerations for educational institutions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Extended 60-day evaluation period for institutional accounts</li>
              <li>Flexible billing arrangements for academic calendars</li>
              <li>Prorated adjustments for student enrollment changes</li>
              <li>Custom refund terms may apply to enterprise contracts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact for Refunds</h2>
            <p className="text-gray-700">
              For refund requests or questions about our cancellation policy:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> support@plagiasure.com<br />
                <strong>Subject Line:</strong> "Refund Request - [Your Account Email]"<br />
                <strong>Phone:</strong> +1 (555) 123-4567<br />
                <strong>Business Hours:</strong> Monday-Friday, 9 AM - 6 PM EST
              </p>
            </div>
          </section>
        </div>
      </PolicyLayout>
    </>
  );
};

export default RefundPolicy;