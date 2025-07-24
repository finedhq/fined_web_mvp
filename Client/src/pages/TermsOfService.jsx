import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TermsOfService = () => {
  return (
    <div className="mx-auto bg-gray-100 pb-5">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto my-5" >
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="mb-2">Effective Date: July 21, 2025</p>

        <p className="mb-4">
          Welcome to FinEd, a platform designed to help users improve their financial knowledge and habits. By accessing or using FinEd, you agree to these Terms of Service.
        </p>

        <h2 className="text-xl font-semibold mt-4">Use of the Service</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>You must be at least 13 years old to use FinEd.</li>
          <li>You agree not to misuse the platform or interfere with its operation.</li>
          <li>You are responsible for securing your login credentials.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-4">Content Ownership</h2>
        <p className="mb-4">
          All content on FinEd is the property of FinEd or its licensors. You may not reproduce or redistribute without permission.
        </p>

        <h2 className="text-xl font-semibold mt-4">User Data</h2>
        <p className="mb-4">
          Your data usage is governed by our <a href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</a>.
        </p>

        <h2 className="text-xl font-semibold mt-4">Limitation of Liability</h2>
        <p className="mb-4">
          FinEd provides educational information only. We are not liable for decisions made based on our content. Use at your own risk.
        </p>

        <h2 className="text-xl font-semibold mt-4">Access to Gmail Data</h2>
        <p className="mb-4">
          If you connect your Gmail account to FinEd, you authorize us to access specific transaction-related emails for the purpose of generating insights and improving your financial awareness.
        </p>
        <p className="mb-4">
          We access only the minimum data necessary and never share, sell, or use your Gmail data for advertising. This access complies with Google's policies and is revocable at any time via your Google Account permissions.
        </p>

        <h2 className="text-xl font-semibold mt-4">Termination</h2>
        <p className="mb-4">
          We reserve the right to suspend or terminate your account for violations of these terms.
        </p>

        <h2 className="text-xl font-semibold mt-4">Contact</h2>
        <p>
          For questions, contact us at <strong>fined.personalfinance@gmail.com</strong>.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;