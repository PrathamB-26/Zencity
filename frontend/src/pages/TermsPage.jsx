import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm my-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded font-medium">
          Draft for review
        </span>
      </div>

      <div className="mt-6 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Scope and Purpose</h2>
          <p>
            ZenCity is a municipal complaint tracking and database analytics demonstration platform. By using this service to report civic concerns or monitor resolution status, you agree to comply with truthful reporting standards.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Civic Reports and Evidence</h2>
          <p>
            Citizens submitting complaints must ensure that photographic evidence and location pins represent actual public civic matters within the municipality. Submitting intentionally fraudulent or malicious reports is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Municipal Response and SLAs</h2>
          <p>
            Target resolution timelines are estimated based on complaint category and priority classification. Emergency services should be contacted directly via emergency municipal phone lines.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Analytics and Public Data</h2>
          <p>
            Aggregated, non-personal complaint metrics, response durations, and geographic problem distributions are processed for urban planning and public operational dashboards.
          </p>
        </section>
      </div>
    </div>
  );
}
