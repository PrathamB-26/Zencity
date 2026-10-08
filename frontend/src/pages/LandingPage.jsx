import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import {
  HiPlusCircle,
  HiClipboardDocumentCheck,
  HiChartBarSquare,
  HiMapPin,
  HiShieldCheck,
  HiArrowRight,
  HiClock,
  HiCheckCircle,
} from 'react-icons/hi2';

export default function LandingPage() {
  const steps = [
    {
      num: '01',
      title: 'Report Civic Issue',
      desc: 'Pinpoint problem location on map, attach evidence photo, and select category.',
    },
    {
      num: '02',
      title: 'Municipal Assignment',
      desc: 'Complaints route automatically to departments and field officers with SLA targets.',
    },
    {
      num: '03',
      title: 'Field Resolution',
      desc: 'Crews inspect, perform repair work, and document completion remarks.',
    },
    {
      num: '04',
      title: 'Citizen Feedback & Closure',
      desc: 'Citizens rate resolution quality and verify repair before ticket closes.',
    },
  ];

  const categories = [
    { name: 'Roads and Footpaths', group: 'Infrastructure', count: 'Potholes, Tar Erosion, Pavers' },
    { name: 'Water and Drainage', group: 'Utilities', count: 'Pipeline Leaks, Waterlogging, Gutters' },
    { name: 'Solid Waste', group: 'Sanitation', count: 'Missed Pickups, Overflowing Bins' },
    { name: 'Street Lighting', group: 'Electricity', count: 'Dark Lamps, Flickering Sodium Poles' },
    { name: 'Urban Horticulture', group: 'Environment', count: 'Fallen Trees, Broken Branches' },
    { name: 'Public Safety', group: 'Civic Safety', count: 'Stray Cattle, Hazardous Obstructions' },
  ];

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-civic-pale text-civic-dark mb-4">
          Municipal Operations Platform
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Report civic problems. Track resolutions. Improve the city.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          ZenCity allows citizens to report local civic issues while municipal authorities manage complaints and utilize PostgreSQL analytics to understand recurring problems and improve response time.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register">
            <Button size="lg" variant="primary" icon={HiPlusCircle}>
              Submit a Complaint
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" icon={HiChartBarSquare}>
              Explore Demo Dashboards
            </Button>
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <span className="text-2xl font-bold text-gray-900">1,100+</span>
            <p className="text-xs text-gray-500">Seed Complaints Analyzed</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-civic">6</span>
            <p className="text-xs text-gray-500">Municipal Departments</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-gray-900">12</span>
            <p className="text-xs text-gray-500">City Administrative Wards</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-civic">8</span>
            <p className="text-xs text-gray-500">Seaborn Statistical Charts</p>
          </div>
        </div>
      </section>

      {/* How It Works Lifecycle */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Complaint Resolution Lifecycle</h2>
          <p className="text-sm text-gray-500 mt-1">End-to-end transparent process from citizen report to verified closure</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st) => (
            <div key={st.num} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
              <span className="text-3xl font-black text-civic-pale">{st.num}</span>
              <h3 className="text-base font-semibold text-gray-900 mt-2">{st.title}</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8 max-w-5xl mx-auto shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Civic Problem Categories</h2>
            <p className="text-xs text-gray-500 mt-0.5">Structured classification enables rapid department routing</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded font-medium self-start sm:self-auto">
            14 Active Seed Categories
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categories.map((c) => (
            <div key={c.name} className="p-4 rounded-lg border border-gray-100 bg-civic-surface hover:border-civic-light transition">
              <span className="text-[11px] font-semibold uppercase text-civic-dark">{c.group}</span>
              <h4 className="text-sm font-bold text-gray-900 mt-1">{c.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{c.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Analytics Demo Preview */}
      <section className="bg-white border border-gray-200 rounded-2xl p-8 max-w-5xl mx-auto shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-civic">Technical Foundation</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">PostgreSQL DBMS + Python Data Visualization</h2>
          <p className="text-xs text-gray-500 mt-2">
            The platform combines relational database integrity with statistical computing using Pandas, NumPy, Matplotlib, and Seaborn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
            <h4 className="font-bold text-sm text-gray-900 mb-2">1. Relational DBMS</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              PostgreSQL stores normalized complaints, wards, departments, and history logs with transactions, foreign keys, and indexes.
            </p>
          </div>
          <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
            <h4 className="font-bold text-sm text-gray-900 mb-2">2. Statistical Processing</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pandas and NumPy clean data, compute correlation coefficients, trend slopes, and quartile distributions for box plots.
            </p>
          </div>
          <div className="p-5 border border-gray-100 rounded-xl bg-gray-50">
            <h4 className="font-bold text-sm text-gray-900 mb-2">3. Civic Dashboards</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              React dashboards render interactive Recharts and toggle to high-resolution Python-generated Seaborn visualizations.
            </p>
          </div>
        </div>
      </section>

      {/* Citizen Call to Action */}
      <section className="bg-civic-dark text-white rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold">Ready to participate in city improvement?</h2>
        <p className="text-sm text-civic-pale mt-2 max-w-lg mx-auto">
          Create an account to report civic issues, track field crew progress, and view neighborhood analytics.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <button className="bg-white text-civic-dark font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-100 transition">
              Create Citizen Account
            </button>
          </Link>
          <Link to="/login">
            <button className="border border-white/40 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-white/10 transition">
              Sign In to Portal
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
