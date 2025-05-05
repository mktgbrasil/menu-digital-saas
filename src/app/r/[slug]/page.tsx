// /src/app/r/[slug]/page.tsx
'use client'; // Required for useState and useEffect

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, limit, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';

// --- Interfaces ---
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface Restaurant {
  id: string; // UID
  name: string;
  slug: string;
  // Add other details like phone, address if needed
}

interface CartItem extends Product {
  quantity: number;
}

interface RestaurantPageParams {
  slug: string;
}

// --- Helper Functions ---
async function findRestaurantUidBySlug(slug: string): Promise<string | null> {
  // ... (keep the existing findRestaurantUidBySlug function)
  console.log(`Searching for restaurant with slug: ${slug}`);
  const restaurantsRef = collection(db, 'restaurants');
  const q = query(restaurantsRef, where('slug', '==', slug), limit(1));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const restaurantDoc = querySnapshot.docs[0];
      console.log(`Restaurant found: ID=${restaurantDoc.id}, Data=`, restaurantDoc.data());
      return restaurantDoc.id; // The document ID is the user's UID
    } else {
      console.log('No restaurant found with this slug.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching restaurant by slug:', error);
    return null;
  }
}

// --- Component ---
export default function RestaurantPage({ params }: { params: RestaurantPageParams }) {
  const { slug } = params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Fetch Restaurant Data Effect
  useEffect(() => {
    const fetchRestaurantData = async () => {
      // ... (keep the existing fetchRestaurantData logic)
      setLoading(true);
      setError(null);
      setOrderSuccess(false); // Reset order status on slug change
      setOrderError(null);

      const restaurantUid = await findRestaurantUidBySlug(slug);

      if (!restaurantUid) {
        setError('Restaurante não encontrado.');
        setLoading(false);
        return;
      }

      try {
        const restaurantDocRef = doc(db, 'restaurants', restaurantUid);
        const restaurantSnap = await getDoc(restaurantDocRef);
        if (restaurantSnap.exists()) {
            setRestaurant({ id: restaurantUid, ...restaurantSnap.data() } as Restaurant);
        } else {
            setRestaurant({ id: restaurantUid, name: `Restaurante ${slug}`, slug: slug });
        }

        const productsCollectionRef = collection(db, `restaurants/${restaurantUid}/products`);
        const productsSnapshot = await getDocs(productsCollectionRef);
        const productsData: Product[] = [];
        const categorySet = new Set<string>();
        productsSnapshot.forEach((doc) => {
          const product = { id: doc.id, ...doc.data() } as Product;
          productsData.push(product);
          categorySet.add(product.category);
        });

        setProducts(productsData);
        setCategories(Array.from(categorySet).sort());
        console.log(`Loaded ${productsData.length} products for restaurant ${restaurantUid}`);

      } catch (err) {
        console.error('Error fetching restaurant products:', err);
        setError('Falha ao carregar o cardápio.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [slug]);

  // --- Cart Logic ---
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // Increase quantity
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Add new item
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        // Decrease quantity
        return prevCart.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        // Remove item completely
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  // --- Order Submission Logic ---
  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!restaurant || cart.length === 0) {
      setOrderError('O carrinho está vazio ou o restaurante não foi carregado.');
      return;
    }
    if (!customerName || !customerPhone || (deliveryMethod === 'delivery' && !customerAddress)) {
        setOrderError('Por favor, preencha seu nome, telefone e endereço (se for entrega).');
        return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);
    setOrderSuccess(false);

    const orderData = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name, // Store for easier display
        customerName,
        customerPhone,
        deliveryMethod,
        customerAddress: deliveryMethod === 'delivery' ? customerAddress : '',
        customerNotes,
        paymentMethod,
        items: cart.map(item => ({ // Store relevant item details
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
        total: cartTotal,
        status: 'Novo', // Initial status
        createdAt: serverTimestamp(),
    };

    try {
        const ordersCollectionRef = collection(db, `restaurants/${restaurant.id}/orders`);
        const docRef = await addDoc(ordersCollectionRef, orderData);
        console.log('Order placed successfully with ID:', docRef.id);
        setOrderSuccess(true);
        setCart([]); // Clear cart after successful order
        // Optionally clear customer fields
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setCustomerNotes('');
    } catch (err: any) {
        console.error('Error placing order:', err);
        setOrderError(err.message || 'Falha ao registrar o pedido. Tente novamente.');
    } finally {
        setIsSubmittingOrder(false);
    }
  };

  // --- Render Logic ---
  if (loading) return <div>Carregando cardápio...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!restaurant) return <div>Restaurante não encontrado.</div>;

  // Display success message instead of form after order
  if (orderSuccess) {
    return (
        <div>
            <h1>Pedido Recebido!</h1>
            <p>Obrigado, {customerName}! Seu pedido foi enviado para o restaurante.</p>
            <p>Status inicial: Novo</p>
            <button onClick={() => setOrderSuccess(false)}>Fazer Novo Pedido</button>
        </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
      {/* Menu Section */}
      <div style={{ flex: 2 }}>
        <h1>{restaurant.name || `Cardápio ${slug}`}</h1>
        {/* Delivery/Pickup Selection */} 
        <div>
            <label>
                <input type="radio" name="deliveryMethod" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} />
                Delivery
            </label>
            <label style={{ marginLeft: '10px' }}>
                <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} />
                Retirada
            </label>
        </div>

        {/* Product Listing */} 
        {categories.map((category) => (
          <div key={category}>
            <h2>{category}</h2>
            {products
              .filter((product) => product.category === category)
              .map((product) => (
                <div key={product.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  {product.imageUrl && <img src={product.imageUrl} alt={product.name} width="100" style={{ float: 'right' }}/>}
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p><strong>R$ {product.price.toFixed(2)}</strong></p>
                  <button onClick={() => addToCart(product)}>Adicionar ao Carrinho</button>
                </div>
              ))}
          </div>
        ))}
        {products.length === 0 && <p>Este restaurante ainda não cadastrou produtos.</p>}
      </div>

      {/* Cart & Order Form Section */} 
      <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
        <h2>Seu Pedido</h2>
        {cart.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span>{item.name} (x{item.quantity})</span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                <div>
                    <button onClick={() => addToCart(item)}>+</button> { /* Reuses addToCart to increment */}
                    <button onClick={() => removeFromCart(item.id)}>-</button>
                </div>
              </div>
            ))}
            <hr />
            <p><strong>Total: R$ {cartTotal.toFixed(2)}</strong></p>

            {/* Order Form */} 
            <form onSubmit={handlePlaceOrder}>
                <h3>Seus Dados</h3>
                <div>
                    <label htmlFor="customerName">Nome:</label>
                    <input type="text" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required disabled={isSubmittingOrder} />
                </div>
                <div>
                    <label htmlFor="customerPhone">Telefone:</label>
                    <input type="tel" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required disabled={isSubmittingOrder} />
                </div>
                {deliveryMethod === 'delivery' && (
                    <div>
                        <label htmlFor="customerAddress">Endereço de Entrega:</label>
                        <input type="text" id="customerAddress" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required disabled={isSubmittingOrder} />
                    </div>
                )}
                <div>
                    <label htmlFor="customerNotes">Observações:</label>
                    <textarea id="customerNotes" value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} disabled={isSubmittingOrder} />
                </div>

                <h3>Pagamento</h3>
                <div>
                    <label>
                        <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} disabled={isSubmittingOrder} />
                        Dinheiro (Precisa de troco? Informe nas observações)
                    </label><br/>
                    <label>
                        <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} disabled={isSubmittingOrder} />
                        Cartão na Entrega/Retirada
                    </label><br/>
                    <label>
                        <input type="radio" name="paymentMethod" value="pix" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} disabled={isSubmittingOrder} />
                        Pix (Aguarde a chave do restaurante)
                    </label>
                </div>

                {orderError && <p style={{ color: 'red' }}>{orderError}</p>}

                <button type="submit" disabled={isSubmittingOrder || cart.length === 0}>
                    {isSubmittingOrder ? 'Enviando Pedido...' : 'Finalizar Pedido'}
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

