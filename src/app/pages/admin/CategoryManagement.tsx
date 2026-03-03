import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react';
import { useCanteen, Category } from '../../store/canteenContext';
import { toast } from 'sonner';

const colorOptions = [
  'bg-orange-100 text-orange-700',
  'bg-yellow-100 text-yellow-700',
  'bg-blue-100 text-blue-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-red-100 text-red-700',
  'bg-indigo-100 text-indigo-700',
];

interface FormState { name: string; icon: string; description: string; color: string; }
const emptyForm: FormState = { name: '', icon: '🍴', description: '', color: colorOptions[0] };

export default function CategoryManagement() {
  const { categories, addCategory, updateCategory, deleteCategory, menuItems } = useCanteen();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => { setEditCat(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description, color: cat.color });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editCat) { 
        await updateCategory(editCat.id, form); 
        toast.success('Category updated!'); 
      }
      else { 
        await addCategory(form); 
        toast.success('Category added!'); 
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setDeleteConfirm(null);
      toast.error('Category deleted');
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const getItemCount = (catId: string) => menuItems.filter(m => m.categoryId === catId).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const itemCount = getItemCount(cat.id);
          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cat.color.split(' ')[0]}`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                    <p className="text-xs text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-orange-100 text-orange-500 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-3">{cat.description}</p>
              )}
              <div className="mt-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                  {cat.icon} {cat.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Meals" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Emoji Icon</label>
                <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  placeholder="🍴" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Short description..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${c} ${form.color === c ? 'border-gray-400 scale-105' : 'border-transparent'}`}>
                      Sample
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {editCat ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Delete Category?</h3>
            <p className="text-sm text-gray-500 mb-5">Menu items in this category will become uncategorized.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
