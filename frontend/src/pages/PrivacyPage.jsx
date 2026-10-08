import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm my-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
          Draft for review
        </span>
      </div>

      <div className="mt-6 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Information Collection</h2>
          <p>
            ZenCity collects user account credentials (name, email, contact number) to verify complaint authenticity and send updates on ticket resolution progress.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Location Data</h2>
          <p>
            Geographic coordinates (latitude and longitude) provided during complaint submission are used exclusively to dispatch municipal field officers to the reported problem site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Photographic Evidence</h2>
          <p>
            Uploaded images are stored on municipal servers to assist field repair crews in assessing repair requirements.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Data Security</h2>
          <p>
            Passwords are cryptographically secured using salted bcrypt hashing. Access to administrative controls is protected by JSON Web Tokens with strict role isolation.
          </p>
        </section>
      </div>
    </div>
  );
}
