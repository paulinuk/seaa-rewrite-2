"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';

export interface CartItem {
  id: string;
  meetingId: string;
  meetingName: string;
  eventCount: number;
  totalCost: number;
  events: Array<{
    eventName: string;
    ageGroupName: string;
    cost: number;
  }>;
}

interface CartProps {
  className?: string;
}

export function Cart({ className }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('registrationCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('registrationCart', JSON.stringify(items));
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.eventCount, 0);
  const totalCost = cartItems.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <div className={className}>
      {/* Cart Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Cart
        {totalItems > 0 && (
          <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
            {totalItems}
          </Badge>
        )}
      </Button>

      {/* Cart Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Registration Cart</span>
              {cartItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.meetingName}</h4>
                        <p className="text-xs text-gray-500">
                          {item.eventCount} event{item.eventCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">£{item.totalCost}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {item.events.map((event, index) => (
                        <div key={index} className="flex justify-between text-xs text-gray-600">
                          <span>{event.ageGroupName} - {event.eventName}</span>
                          <span>£{event.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between items-center font-medium">
                  <span>Total ({totalItems} events)</span>
                  <span className="text-lg">£{totalCost}</span>
                </div>
                
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Pound className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for managing cart
export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('registrationCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (item: CartItem) => {
    const existingItemIndex = cartItems.findIndex(
      cartItem => cartItem.meetingId === item.meetingId
    );

    let updatedItems;
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedItems = [...cartItems];
      updatedItems[existingItemIndex] = item;
    } else {
      // Add new item
      updatedItems = [...cartItems, item];
    }

    setCartItems(updatedItems);
    localStorage.setItem('registrationCart', JSON.stringify(updatedItems));
  };

  const removeFromCart = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    localStorage.setItem('registrationCart', JSON.stringify(updatedItems));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('registrationCart');
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.eventCount, 0);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };
}