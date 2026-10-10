'use client';

import { useState, useTransition, useActionState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createDish, updateDish, deleteDish } from '@/app/actions';

const INITIAL_FORM_STATE = {
  success: false,
  error: null,
  fieldErrors: {},
};

export default function AdminDishManager({ initialDishes = [] }) {
  const [dishes, setDishes] = useState(initialDishes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editingDish, setEditingDish] = useState(null);
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [notice, setNotice] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isPending, startTransition] = useTransition();

  // Create Dish Form Action State
  const [createState, createAction, isCreatingPending] = useActionState(
    async (prevState, formData) => {
      const res = await createDish(prevState, formData);
      if (res.success && res.dish) {
        setDishes((prev) => [res.dish, ...prev]);
        setIsCreatingOpen(false);
        setNotice({ type: 'success', message: res.message });
      }
      return res;
    },
    INITIAL_FORM_STATE
  );

  // Update Dish Form Action State
  const [updateState, updateAction, isUpdatingPending] = useActionState(
    async (prevState, formData) => {
      const res = await updateDish(prevState, formData);
      if (res.success && res.dish) {
        setDishes((prev) =>
          prev.map((d) => (d.id === res.dish.id ? res.dish : d))
        );
        setEditingDish(null);
        setNotice({ type: 'success', message: res.message });
      }
      return res;
    },
    INITIAL_FORM_STATE
  );

  const handleDelete = (dish) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${dish.name}" (ID #${dish.id})? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeletingId(dish.id);
    startTransition(async () => {
      try {
        const res = await deleteDish(dish.id);
        if (res.success) {
          setDishes((prev) => prev.filter((d) => d.id !== dish.id));
          setNotice({
            type: 'success',
            message: res.message || `Dish #${dish.id} deleted.`,
          });
        } else {
          setNotice({
            type: 'error',
            message: res.error || 'Failed to delete dish.',
          });
        }
      } catch {
        setNotice({
          type: 'error',
          message: 'Network error deleting dish.',
        });
      } finally {
        setIsDeletingId(null);
      }
    });
  };

  const categories = ['All', ...new Set(dishes.map((d) => d.category))];

  const filteredDishes = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(d.id).includes(searchTerm);
    const matchesCategory =
      filterCategory === 'All' || d.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const vegetarianCount = dishes.filter((d) => d.vegetarian).length;
  const avgPrice =
    dishes.length > 0
      ? Math.round(dishes.reduce((sum, d) => sum + (Number(d.price) || 0), 0) / dishes.length)
      : 0;

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Total Menu Items
          </span>
          <span className="text-2xl font-extrabold text-stone-900 mt-1 block">
            {dishes.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Vegetarian Dishes
          </span>
          <span className="text-2xl font-extrabold text-emerald-800 mt-1 block">
            {vegetarianCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Meat Specialties
          </span>
          <span className="text-2xl font-extrabold text-amber-900 mt-1 block">
            {dishes.length - vegetarianCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Average Price
          </span>
          <span className="text-2xl font-extrabold text-stone-900 mt-1 block">
            {avgPrice} <span className="text-xs font-bold text-stone-500">ETB</span>
          </span>
        </div>
      </div>

      {/* Global Notice Banner */}
      {notice && (
        <div
          role="status"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-black/5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar: Search, Category Filter, and Add Dish CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, or ID..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
            />
            <svg
              className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreatingOpen(true);
            setEditingDish(null);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-semibold text-sm transition-colors shadow-xs cursor-pointer select-none"
        >
          <span className="text-base font-bold">+</span>
          <span>Create New Dish</span>
        </button>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Dish</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDishes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-stone-500">
                    <p className="font-medium">No dishes found matching your filter.</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Try clearing your search query or create a new dish above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Dish Preview & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {dish.image ? (
                          <Image
                            src={dish.image}
                            alt={dish.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200/80 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xs font-bold text-stone-400 shrink-0">
                            No img
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-stone-900 hover:text-amber-900">
                            <Link href={`/menu/${dish.id}`} className="no-underline text-inherit" target="_blank">
                              {dish.name}
                            </Link>
                          </div>
                          <span className="text-[11px] text-stone-400">
                            ID #{dish.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-stone-700">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-medium">
                        {dish.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                      {dish.price} <span className="text-xs font-semibold text-amber-800">ETB</span>
                    </td>

                    {/* Vegetarian */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          dish.vegetarian
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        {dish.vegetarian ? 'Vegetarian' : 'Stew / Meat'}
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/menu/${dish.id}`}
                          target="_blank"
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors no-underline"
                          title="View on live menu"
                        >
                          View &nearr;
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDish(dish);
                            setIsCreatingOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-900 hover:bg-amber-50 border border-amber-200/80 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(dish)}
                          disabled={isDeletingId === dish.id || isPending}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isDeletingId === dish.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Panel: Create Dish */}
      {isCreatingOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-900 font-bold">
                  Catalog Management
                </span>
                <h3 id="create-dish-title" className="text-xl font-extrabold text-stone-900">
                  Add New Dish
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {createState?.error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {createState.error}
              </div>
            )}

            <form action={createAction} className="space-y-4">
              <div>
                <label htmlFor="create-name" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Dish Name *
                </label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Doro Wot"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {createState?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-rose-600">{createState.fieldErrors.name.join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="create-category" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    id="create-category"
                    name="category"
                    type="text"
                    required
                    placeholder="e.g. Poultry, Beef, Vegetarian"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                  />
                  {createState?.fieldErrors?.category && (
                    <p className="mt-1 text-xs text-rose-600">{createState.fieldErrors.category.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="create-price" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    id="create-price"
                    name="price"
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="e.g. 420"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                  />
                  {createState?.fieldErrors?.price && (
                    <p className="mt-1 text-xs text-rose-600">{createState.fieldErrors.price.join(', ')}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="create-image" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Image Path / URL (Optional)
                </label>
                <input
                  id="create-image"
                  name="image"
                  type="text"
                  placeholder="/images/doro-wot.jpg"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {createState?.fieldErrors?.image && (
                  <p className="mt-1 text-xs text-rose-600">{createState.fieldErrors.image.join(', ')}</p>
                )}
              </div>

              <div>
                <label htmlFor="create-description" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="create-description"
                  name="description"
                  rows="3"
                  placeholder="Traditional Ethiopian culinary specialty..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {createState?.fieldErrors?.description && (
                  <p className="mt-1 text-xs text-rose-600">{createState.fieldErrors.description.join(', ')}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="create-vegetarian"
                  name="vegetarian"
                  type="checkbox"
                  className="w-4 h-4 rounded text-amber-900 border-stone-300 focus:ring-amber-900"
                />
                <label htmlFor="create-vegetarian" className="text-sm font-semibold text-stone-700 cursor-pointer">
                  Vegetarian / Vegan Specialty
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCreatingOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPending}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isCreatingPending ? 'Saving...' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Panel: Edit Dish */}
      {editingDish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-dish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-900 font-bold">
                  Editing Dish #{editingDish.id}
                </span>
                <h3 id="edit-dish-title" className="text-xl font-extrabold text-stone-900">
                  Update {editingDish.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDish(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {updateState?.error && (
              <div role="alert" className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {updateState.error}
              </div>
            )}

            <form action={updateAction} className="space-y-4">
              <input type="hidden" name="id" value={editingDish.id} />

              <div>
                <label htmlFor="edit-name" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Dish Name *
                </label>
                <input
                  id="edit-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingDish.name}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {updateState?.fieldErrors?.name && (
                  <p className="mt-1 text-xs text-rose-600">{updateState.fieldErrors.name.join(', ')}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-category" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <input
                    id="edit-category"
                    name="category"
                    type="text"
                    required
                    defaultValue={editingDish.category}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                  />
                  {updateState?.fieldErrors?.category && (
                    <p className="mt-1 text-xs text-rose-600">{updateState.fieldErrors.category.join(', ')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="edit-price" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Price (ETB) *
                  </label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="1"
                    min="1"
                    required
                    defaultValue={editingDish.price}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                  />
                  {updateState?.fieldErrors?.price && (
                    <p className="mt-1 text-xs text-rose-600">{updateState.fieldErrors.price.join(', ')}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="edit-image" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Image Path / URL (Optional)
                </label>
                <input
                  id="edit-image"
                  name="image"
                  type="text"
                  defaultValue={editingDish.image || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {updateState?.fieldErrors?.image && (
                  <p className="mt-1 text-xs text-rose-600">{updateState.fieldErrors.image.join(', ')}</p>
                )}
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows="3"
                  defaultValue={editingDish.description || ''}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
                />
                {updateState?.fieldErrors?.description && (
                  <p className="mt-1 text-xs text-rose-600">{updateState.fieldErrors.description.join(', ')}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="edit-vegetarian"
                  name="vegetarian"
                  type="checkbox"
                  defaultChecked={Boolean(editingDish.vegetarian)}
                  className="w-4 h-4 rounded text-amber-900 border-stone-300 focus:ring-amber-900"
                />
                <label htmlFor="edit-vegetarian" className="text-sm font-semibold text-stone-700 cursor-pointer">
                  Vegetarian / Vegan Specialty
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPending}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-900 hover:bg-amber-950 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPending ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
