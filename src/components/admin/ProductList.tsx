// /src/components/admin/ProductList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

// TODO: Define a type/interface for the Product
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  // Add other fields as needed
}

// TODO: Add EditProductForm component or modal

export default function ProductList() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State for editing - simplified, consider a modal approach
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(() => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);
    console.log(`Fetching products for user: ${currentUser.uid}`);

    const productsCollectionRef = collection(db, `restaurants/${currentUser.uid}/products`);
    // Query to get products owned by the current user
    // const q = query(productsCollectionRef, where("ownerId", "==", currentUser.uid)); // Redundant if using path structure
    const q = query(productsCollectionRef); // Path already isolates data

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setLoading(false);
      console.log("Products loaded: ", productsData.length);
    }, (err) => {
      console.error("Error fetching products: ", err);
      setError("Falha ao carregar produtos.");
      setLoading(false);
    });

    // Cleanup subscription on unmount or when currentUser changes
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = fetchProducts();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    if (!currentUser) return;
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const productDocRef = doc(db, `restaurants/${currentUser.uid}/products`, productId);
      await deleteDoc(productDocRef);
      console.log("Product deleted successfully");
      // The onSnapshot listener will automatically update the list
    } catch (err) {
      console.error("Error deleting product: ", err);
      setError("Falha ao excluir produto.");
    }
  };

  // Basic inline editing example - consider a modal/form for better UX
  const handleUpdate = async (product: Product) => {
    if (!currentUser || !editingProduct) return;

    const updatedName = prompt("Novo nome:", editingProduct.name);
    const updatedPriceStr = prompt("Novo preço:", editingProduct.price.toString());

    if (updatedName === null || updatedPriceStr === null) return; // User cancelled

    const updatedPrice = parseFloat(updatedPriceStr);
    if (isNaN(updatedPrice)) {
        alert("Preço inválido.");
        return;
    }

    try {
        const productDocRef = doc(db, `restaurants/${currentUser.uid}/products`, editingProduct.id);
        await updateDoc(productDocRef, {
            name: updatedName,
            price: updatedPrice,
            updatedAt: serverTimestamp() // Import serverTimestamp if not already
        });
        console.log("Product updated successfully");
        setEditingProduct(null); // Exit editing mode
    } catch (err) {
        console.error("Error updating product: ", err);
        setError("Falha ao atualizar produto.");
    }
  };


  if (loading) {
    return <p>Carregando produtos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Lista de Produtos</h2>
      {/* Basic table structure - enhance with Shadcn/UI or similar */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Imagem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>R$ {product.price.toFixed(2)}</td>
              <td>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} width="50" /> : 'Sem imagem'}</td>
              <td>
                {/* Replace prompt with a proper edit form/modal trigger */}
                <button onClick={() => setEditingProduct(product)}>Editar (Simples)</button>
                <button onClick={() => handleDelete(product.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && <p>Nenhum produto cadastrado ainda.</p>}

      {/* Simple inline edit form - replace with modal */}
      {editingProduct && (
          <div>
              <h3>Editando: {editingProduct.name}</h3>
              {/* Simplified update - use prompt for demo */}
              <button onClick={() => handleUpdate(editingProduct)}>Salvar Edição (Prompt)</button>
              <button onClick={() => setEditingProduct(null)}>Cancelar</button>
          </div>
      )}
    </div>
  );
}

