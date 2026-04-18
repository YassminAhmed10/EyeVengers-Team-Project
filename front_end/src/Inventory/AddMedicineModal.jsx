
import React, { useState, useRef } from 'react';
import { X, Upload, Calendar, Image, CheckCircle } from 'lucide-react';

const AddMedicineModal = ({ onClose, onAdd }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Antibiotics',
    stock: '',
    price: '',
    expiry: '',
    manufacturer: '',
    description: '',
    batchNumber: '',
    location: '',
    dosage: '',
    sideEffects: '',
    imageUrl: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.match(/image\/(png|jpg|jpeg|webp)/)) {
        alert('Please select a valid image file (PNG, JPG, or WebP)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Read file and create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData({ ...formData, imageUrl: e.target.result });
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 50);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: null });
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stockValue = parseInt(formData.stock);
    onAdd({
      ...formData,
      stock: stockValue,
      price: parseFloat(formData.price),
      status: stockValue > 50 ? 'In Stock' : stockValue > 20 ? 'Low Stock' : 'Critical',
      expiry: formData.expiry,
      addedDate: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-slide-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Add New Medicine</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all"
               style={{
                 borderColor: isDragging ? '#3B82F6' : imagePreview ? '#10B981' : '#D1D5DB',
                 backgroundColor: isDragging ? '#EFF6FF' : 'transparent'
               }}
               onDrop={handleDrop}
               onDragOver={handleDragOver}
               onDragLeave={handleDragLeave}
          >
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Medicine preview" 
                  className="w-48 h-48 mx-auto object-cover rounded-xl shadow-lg"
                />
                {uploadProgress < 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {uploadProgress >= 100 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files[0])}
                  className="hidden"
                  id="medicine-image"
                />
                <label htmlFor="medicine-image" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">
                    Upload Medicine Image
                  </p>
                  <p className="text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    PNG, JPG up to 2MB
                  </p>
                </label>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Medicine Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder="Enter medicine name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="input-field"
              >
                <option value="Antibiotics">Antibiotics</option>
                <option value="Pain Relief">Pain Relief</option>
                <option value="Chronic Care">Chronic Care</option>
                <option value="Supplements">Vitamins & Supplements</option>
                <option value="Allergies">Allergies</option>
                <option value="Digestive">Digestive</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Manufacturer *</label>
              <input
                type="text"
                required
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                className="input-field"
                placeholder="Manufacturer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="input-field"
                placeholder="Number of units"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (EGP) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Dosage</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                className="input-field"
                placeholder="e.g., 500mg, 10ml"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Batch Number</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                className="input-field"
                placeholder="BATCH-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Storage Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="input-field"
                placeholder="Shelf A-12"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="input-field"
                rows="3"
                placeholder="Medicine description, usage instructions, etc."
              ></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Side Effects</label>
              <textarea
                value={formData.sideEffects}
                onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                className="input-field"
                rows="2"
                placeholder="Known side effects, warnings, etc."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle className="w-4 h-4" />
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;

