import React, { useState, useEffect } from 'react';
import { categoriesApi, departmentsApi } from '../../services/api';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { HiTag, HiPlusCircle } from 'react-icons/hi2';

export default function CategoriesManagement() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add category state
  const [showAddModal, setShowAddModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catGroup, setCatGroup] = useState('Infrastructure');
  const [catDesc, setCatDesc] = useState('');
  const [defaultDept, setDefaultDept] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCats = () => {
    setLoading(true);
    categoriesApi.list()
      .then((res) => {
        if (res.data.success) setCategories(res.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCats();
    departmentsApi.list().then((res) => {
      if (res.data.success) {
        setDepartments(res.data.data);
        if (res.data.data.length > 0) setDefaultDept(res.data.data[0].department_id);
      }
    });
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await categoriesApi.create({
        category_name: catName,
        category_group: catGroup,
        description: catDesc,
        default_department_id: defaultDept,
      });
      if (res.data.success) {
        setShowAddModal(false);
        setCatName('');
        setCatDesc('');
        fetchCats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Complaint Categories</h1>
          <p className="text-xs text-gray-500 mt-1">14 Seed categories active. Extensible up to 32 civic classes.</p>
        </div>
        <Button variant="primary" icon={HiPlusCircle} onClick={() => setShowAddModal(true)}>
          Add New Category
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-6"><LoadingSkeleton type="table" count={7} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Category Name</th>
                  <th className="px-4 py-3 text-left">Group</th>
                  <th className="px-4 py-3 text-left">Default Department</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Filed Cases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {categories.map((c) => (
                  <tr key={c.category_id} className="hover:bg-gray-50/60 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">#{c.category_id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{c.category_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-gray-100 text-gray-700">
                        {c.category_group}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-civic font-semibold">{c.department_name || 'None'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-sm truncate">{c.description}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{c.complaint_count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Add Civic Category">
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="cat-name">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="cat-name"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Broken Road Sign"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="cat-group">
                Category Group
              </label>
              <select
                id="cat-group"
                value={catGroup}
                onChange={(e) => setCatGroup(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic bg-white"
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Water and Drainage">Water and Drainage</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Electricity and Lighting">Electricity and Lighting</option>
                <option value="Environment">Environment</option>
                <option value="Public Safety and Other">Public Safety and Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="cat-dept">
                Default Department
              </label>
              <select
                id="cat-dept"
                value={defaultDept}
                onChange={(e) => setDefaultDept(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic bg-white"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="cat-desc">
                Description
              </label>
              <textarea
                id="cat-desc"
                rows={2}
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Scope and description of problem..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-civic"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" loading={submitting}>Save Category</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
