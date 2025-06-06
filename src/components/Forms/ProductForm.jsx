import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/authContext';
import { useLoading } from '../../contexts/loadingContext';
import { fetchWithCache, API_ENDPOINTS, API_URL } from '../../utils/api';
import "./Forms.css";

const ProductForm = ({ presentations: propsPresentations, categories: propsCategories, onSuccess, initialData, onSubmit, submitButtonText = "Añadir producto", isQuimicaIndustrial = false }) => {
  const { currentUser } = useAuth();
  const { showLoading, hideLoading, showSuccess } = useLoading();
  const [presentations, setPresentations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPresentations, setFilteredPresentations] = useState([]);
  const [selectedPresentations, setSelectedPresentations] = useState(initialData?.presentations || []);
  const [presentationType, setPresentationType] = useState("solido");
  const [selectedCategories, setSelectedCategories] = useState(initialData?.categories || []);
  const [descriptions, setDescriptions] = useState(initialData?.descriptions ? Object.values(initialData.descriptions) : Array(5).fill(""));
  const [uses, setUses] = useState(initialData?.uses ? Object.values(initialData.uses) : Array(5).fill(""));
  const [productImages, setProductImages] = useState(
    initialData?.images ? Object.entries(initialData.images).map(([_, url]) => ({ file: null, previewUrl: url })) : Array(5).fill({ file: null, previewUrl: null })
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        setErrors({});

        const [presentationsData, categoriesData] = await Promise.all([
          fetchWithCache(API_ENDPOINTS.PRESENTATIONS),
          fetchWithCache(API_ENDPOINTS.CATEGORIES)
        ]);

        setPresentations(propsPresentations || presentationsData?.data || []);
        setCategories(propsCategories || categoriesData?.data || []);
      } catch (error) {
        setErrors({ fetch: error.message });
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    if (!propsPresentations || !propsCategories) {
      fetchData();
    } else {
      setPresentations(propsPresentations);
      setCategories(propsCategories);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (presentations) {
      setFilteredPresentations(
        presentations.filter((presentation) => presentation.type === presentationType)
      );
    }
  }, [presentationType, presentations]);

  const handleImageUpload = (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ images: "Please upload an image file" });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProductImages((prev) => {
      const updated = [...prev];
      updated[index] = { file, previewUrl };
      return updated;
    });
  };

  const toggleSelection = (array, setArray, itemId) => {
    setArray((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleArrayChange = (array, setArray, index, value) => {
    setArray((prev) => {
      const updatedArray = [...prev];
      updatedArray[index] = value;
      return updatedArray;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (selectedPresentations.length === 0) {
      newErrors.presentations = "Please select at least one presentation";
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }
    
    if (!descriptions.some(desc => desc.trim())) {
      newErrors.descriptions = "Please add at least one description";
    }
    
    if (!uses.some(use => use.trim())) {
      newErrors.uses = "Please add at least one use";
    }
    
    if (!productImages.some(img => img.file)) {
      newErrors.images = "Please upload at least one image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      showLoading();
      
      if (!currentUser) {
        throw new Error("You need to be logged in to submit a product.");
      }

      const token = await currentUser.getIdToken();
      const formData = new FormData();
      const productName = document.getElementById("product-name").value;
      formData.append("name", productName);
      selectedPresentations.forEach(p => formData.append("presentations[]", p));
      selectedCategories.forEach(c => formData.append("categories[]", c));

      descriptions.forEach((desc, index) => {
        formData.append(`descriptions[site${index + 1}]`, desc);
      });

      uses.forEach((use, index) => {
        formData.append(`uses[site${index + 1}]`, use);
      });

      productImages.forEach((imageObj, index) => {
        if (imageObj.file) {
          formData.append(`images[site${index + 1}]`, imageObj.file);
        }
      });

      const response = await fetch(`${API_URL}${API_ENDPOINTS.NEW_PRODUCT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const textResponse = await response.text();
        throw new Error(`Server error: ${textResponse}`);
      }

      const result = await response.json();

      // Reset the form on successful submission
      setProductImages(Array(5).fill({ file: null, previewUrl: null }));
      setDescriptions(Array(5).fill(""));
      setUses(Array(5).fill(""));
      setSelectedPresentations([]);
      setSelectedCategories([]);
      setErrors({});
      
      showSuccess("Product added successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={onSubmit || handleSubmit}>
        <div className="form-group">
          <label htmlFor="product-name" className="card-label">
            Nombre
          </label>
          <input
            type="text"
            id="product-name"
            placeholder="Ingresar nombre"
            className="input-field"
            defaultValue={initialData?.name}
          />
          {errors.productName && <span className="error-message">{errors.productName}</span>}
        </div>
        <div className="form-group">
          <label className="card-label">Presentaciones</label>
          <select
            id="presentationType"
            value={presentationType}
            onChange={(e) => setPresentationType(e.target.value)}
            required
            className="input-field"
          >
            <option value="solido">Sólidas</option>
            <option value="liquido">Líquidas</option>
          </select>
          <div className="presentations-body">
            {filteredPresentations.map((presentation) => (
              <div key={presentation._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`presentation-${presentation._id}`}
                  name="presentations"
                  value={presentation._id}
                  checked={selectedPresentations.includes(presentation._id)}
                  onChange={() =>
                    toggleSelection(
                      selectedPresentations,
                      setSelectedPresentations,
                      presentation._id
                    )
                  }
                />
                <label htmlFor={`presentation-${presentation._id}`}>
                  {presentation.name}
                </label>
              </div>
            ))}
          </div>
          {errors.presentations && <span className="error-message">{errors.presentations}</span>}
        </div>
        <div className="form-group">
          <label className="card-label">Categorías</label>
          <div className="categories-body">
            {categories && categories.map((category) => (
              <div key={category._id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`category-${category._id}`}
                  name="categories"
                  value={category._id}
                  checked={selectedCategories.includes(category._id)}
                  onChange={() =>
                    toggleSelection(
                      selectedCategories,
                      setSelectedCategories,
                      category._id
                    )
                  }
                />
                <label htmlFor={`category-${category._id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
          {errors.categories && <span className="error-message">{errors.categories}</span>}
        </div>
        <div className="form-group">
          <label className="card-label">Descripciones</label>
          {isQuimicaIndustrial ? (
            <input
              id="description-1"
              value={descriptions[0] || ""}
              onChange={(e) =>
                handleArrayChange(descriptions, setDescriptions, 0, e.target.value)
              }
              placeholder="Descripción Química Industrial"
              className="input-field"
            />
          ) : (
            descriptions.map((description, index) => (
              <input
                key={index}
                id={`description-${index + 1}`}
                value={description}
                onChange={(e) =>
                  handleArrayChange(descriptions, setDescriptions, index, e.target.value)
                }
                placeholder={`Descripción ${index + 1}`}
                className="input-field"
              />
            ))
          )}
          {descriptions.map((_, index) =>
            errors[`description${index}`] && (
              <span key={index} className="error-message">{errors[`description${index}`]}</span>
            )
          )}
        </div>
        <div className="form-group">
          <label className="card-label">Usos</label>
          {isQuimicaIndustrial ? (
            <input
              id="use-1"
              value={uses[0] || ""}
              onChange={(e) =>
                handleArrayChange(uses, setUses, 0, e.target.value)
              }
              placeholder="Usos Química Industrial"
              className="input-field"
            />
          ) : (
            uses.map((use, index) => (
              <input
                key={index}
                id={`use-${index + 1}`}
                value={use}
                onChange={(e) =>
                  handleArrayChange(uses, setUses, index, e.target.value)
                }
                placeholder={`Uso ${index + 1}`}
                className="input-field"
              />
            ))
          )}
          {uses.map((_, index) =>
            errors[`use${index}`] && (
              <span key={index} className="error-message">{errors[`use${index}`]}</span>
            )
          )}
        </div>
        <div className="form-group">
          <label className="card-label">Imágenes</label>
          <div className="image-container">
            {isQuimicaIndustrial ? (
              <div className="image-circle">
                <label
                  htmlFor="product-image-0"
                  className="image-upload-label"
                >
                  {productImages[0]?.previewUrl ? (
                    <img
                      src={productImages[0].previewUrl}
                      alt="Product Química Industrial"
                      className="image-preview"
                    />
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                </label>
                <input
                  type="file"
                  id="product-image-0"
                  className="image-upload-input"
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, 0)}
                />
              </div>
            ) : (
              productImages.map((imageObj, index) => (
                <div key={index} className="image-circle">
                  <label
                    htmlFor={`product-image-${index}`}
                    className="image-upload-label"
                  >
                    {imageObj.previewUrl ? (
                      <img
                        src={imageObj.previewUrl}
                        alt={`Product ${index + 1}`}
                        className="image-preview"
                      />
                    ) : (
                      <span className="plus-sign">+</span>
                    )}
                  </label>
                  <input
                    type="file"
                    id={`product-image-${index}`}
                    className="image-upload-input"
                    accept="image/*"
                    onChange={(event) => handleImageUpload(event, index)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
        <div className="form-group">
          <button type="submit" className="submit-button">
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;