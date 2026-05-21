import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
}

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    
    // Fetch categories
    axios.get(`${apiUrl}/api/categories`).then(res => {
      setCategories(res.data.data || []);
    }).catch(err => console.error(err));

    // Fetch products
    axios.get(`${apiUrl}/api/products`).then(res => {
      setProducts(res.data.data || []);
    }).catch(err => console.error(err));
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.category_id === activeCategory)
    : products;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cardápio</h1>
      
      {/* Category Filter */}
      <div className="flex gap-4 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full font-medium ${activeCategory === null ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full font-medium ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="border rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{product.description}</p>
            </div>
            <div className="mt-4 text-primary font-bold text-lg">
              R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center text-muted-foreground mt-12">
          Nenhum produto encontrado.
        </div>
      )}
    </div>
  );
}
