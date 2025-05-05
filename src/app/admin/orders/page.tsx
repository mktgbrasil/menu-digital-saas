// /src/app/admin/orders/page.tsx
'use client'; // Required for hooks

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Define Order interface (match the structure saved in RestaurantPage)
interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'delivery' | 'pickup';
    customerAddress?: string;
    customerNotes?: string;
    paymentMethod: 'cash' | 'card' | 'pix';
    items: OrderItem[];
    total: number;
    status: 'Novo' | 'Em preparo' | 'Pronto' | 'Entregue' | 'Retirado' | 'Cancelado'; // Added 'Cancelado'
    createdAt: any; // Firestore Timestamp
    // Add restaurantId, restaurantName if needed, though path implies it
}

const STATUS_OPTIONS: Order['status'][] = ['Novo', 'Em preparo', 'Pronto', 'Entregue', 'Retirado', 'Cancelado'];

export default function ManageOrdersPage() {
    const { currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, authLoading, router]);

    // Fetch Orders Effect
    const fetchOrders = useCallback(() => {
        if (!currentUser) return;

        setLoading(true);
        setError(null);
        console.log(`Fetching orders for restaurant: ${currentUser.uid}`);

        const ordersCollectionRef = collection(db, `restaurants/${currentUser.uid}/orders`);
        // Order by creation time, newest first
        const q = query(ordersCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData: Order[] = [];
            querySnapshot.forEach((doc) => {
                ordersData.push({ id: doc.id, ...doc.data() } as Order);
            });
            setOrders(ordersData);
            setLoading(false);
            console.log("Orders loaded: ", ordersData.length);
            // Basic notification for new orders (can be improved)
            if (ordersData.some(order => order.status === 'Novo')) {
                // Play a sound or show a visual cue
                console.log("*** New Order Received! ***");
                // Consider using browser notifications API or a library
            }
        }, (err) => {
            console.error("Error fetching orders: ", err);
            setError("Falha ao carregar pedidos.");
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const unsubscribe = fetchOrders();
            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [currentUser, fetchOrders]);

    // Update Order Status Handler
    const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
        if (!currentUser) return;

        console.log(`Updating order ${orderId} to status ${newStatus}`);
        const orderDocRef = doc(db, `restaurants/${currentUser.uid}/orders`, orderId);

        try {
            await updateDoc(orderDocRef, {
                status: newStatus,
                updatedAt: serverTimestamp() // Track status updates
            });
            console.log("Order status updated successfully");
        } catch (err) {
            console.error("Error updating order status: ", err);
            // Show error to user
            alert("Falha ao atualizar status do pedido.");
        }
    };

    // Render Logic
    if (authLoading || loading) {
        return <div>Carregando pedidos...</div>;
    }

    if (!currentUser) {
        // Should be redirected, but good fallback
        return <div>Redirecionando para login...</div>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div>
            <h1>Gerenciar Pedidos</h1>
            {orders.length === 0 ? (
                <p>Nenhum pedido recebido ainda.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {orders.map((order) => (
                        <div key={order.id} style={{ border: '1px solid #ccc', padding: '15px' }}>
                            <h3>Pedido #{order.id.substring(0, 6)}... ({order.status})</h3>
                            <p><strong>Cliente:</strong> {order.customerName} - {order.customerPhone}</p>
                            <p><strong>Tipo:</strong> {order.deliveryMethod === 'delivery' ? 'Entrega' : 'Retirada'}</p>
                            {order.deliveryMethod === 'delivery' && <p><strong>Endereço:</strong> {order.customerAddress}</p>}
                            <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
                            {order.customerNotes && <p><strong>Observações:</strong> {order.customerNotes}</p>}
                            <p><strong>Itens:</strong></p>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={`${item.productId}-${index}`}>{item.quantity}x {item.name} (R$ {item.price.toFixed(2)} cada)</li>
                                ))}
                            </ul>
                            <p><strong>Total: R$ {order.total.toFixed(2)}</strong></p>
                            <p><strong>Recebido em:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('pt-BR') : 'N/A'}</p>

                            <div>
                                <label htmlFor={`status-${order.id}`}>Mudar Status: </label>
                                <select
                                    id={`status-${order.id}`}
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

