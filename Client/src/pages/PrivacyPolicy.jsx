import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-2">Effective Date: July 21, 2025</p>

      <p className="mb-4">
        FinEd ("we", "our", or "us") is committed to protecting your privacy.
        This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
      </p>

      <h2 className="text-xl font-semibold mt-4">Information We Collect</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Your email address (used for authentication and personalization)</li>
        <li>Progress data such as completed lessons, quizzes, and transaction logs</li>
        <li>Optional profile data you choose to provide (e.g., nickname, preferences)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4">Gmail Data Access</h2>
      <p className="mb-4">
        With your permission, FinEd accesses your Gmail account using Google OAuth to read transaction-related emails (such as bank or card statements). This helps us automatically track your expenses and generate insights for educational purposes.
      </p>

      <p className="mb-4">
        We only access the metadata and body content of emails that match specific financial keywords (like "transaction", "debited", "credited", etc.). We do <strong>not</strong> read or store personal conversations or unrelated messages.
      </p>

      <p className="mb-4">
        Your Gmail data is:
      </p>
      <ul className="list-disc ml-6 mb-4">
        <li>Not shared with third parties</li>
        <li>Not used for advertising or marketing</li>
        <li>Stored securely and only processed to provide financial education insights</li>
      </ul>

      <p className="mb-4">
        We comply with Google's <a className="text-blue-600 underline" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">User Data Policy</a>, including the Limited Use requirements.
      </p>

      <h2 className="text-xl font-semibold mt-4">How We Use Your Information</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>To provide access to financial education content and track your learning progress</li>
        <li>To improve our platform and develop new features</li>
        <li>To communicate updates or important notifications</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4">Third-Party Services</h2>
      <p className="mb-4">
        We use third-party services such as Supabase for authentication and data storage. These services may collect limited data necessary for operations.
      </p>

      <h2 className="text-xl font-semibold mt-4">Your Rights</h2>
      <p className="mb-4">
        You may request access, update, or deletion of your personal data by contacting us at <strong>support@fined.app</strong>.
      </p>

      <p className="mt-4">
        By using FinEd, you agree to this Privacy Policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;