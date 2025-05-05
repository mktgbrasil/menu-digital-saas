// /src/components/admin/AddProductForm.tsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebaseConfig'; // Assuming firebaseConfig is set up
import { useAuth } from '@/context/AuthContext';

export default function AddProductForm({ onProductAdded }: { onProductAdded?: () => void }) {
  const { currentUser } = useAuth();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(''); // TODO: Fetch categories dynamically
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) {
      setError('Você precisa estar logado para adicionar produtos.');
      return;
    }
    if (!productName || !price || !category) {
        setError('Nome, preço e categoria são obrigatórios.');
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = '';
      // Upload image if selected
      if (imageFile) {
        const imageRef = ref(storage, `restaurants/${currentUser.uid}/images/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Add product data to Firestore
      const productsCollectionRef = collection(db, `restaurants/${currentUser.uid}/products`);
      await addDoc(productsCollectionRef, {
        name: productName,
        description: description,
        price: parseFloat(price), // Store price as number
        category: category, // Consider storing category ID if using separate collection
        imageUrl: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: currentUser.uid // Ensure owner ID is stored
      });

      console.log('Product added successfully!');
      // Clear form
      setProductName('');
      setDescription('');
      setPrice('');
      setCategory('');
      setImageFile(null);
      // Notify parent component if needed
      if (onProductAdded) {
        onProductAdded();
      }

    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message || 'Falha ao adicionar produto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Adicionar Novo Produto</h2>
      <form onSubmit={handleSubmit}>
        {/* Form fields remain the same as previous version */}
        <div>
          <label htmlFor="productName">Nome do Produto:</label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="price">Preço (R$):</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="category">Categoria:</label>
          {/* TODO: Replace with a select dropdown populated from categories in Firestore */}
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="image">Imagem:</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          {imageFile && <p>Arquivo selecionado: {imageFile.name}</p>}
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Produto'}
        </button>
      </form>
    </div>
  );
}

