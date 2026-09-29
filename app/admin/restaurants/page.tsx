'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Restaurant } from '@/lib/data';

const blankMenuItem = { id: '', name: '', description: '', price: '0', category: 'Main' };

const defaultRestaurantForm = {
  name: '',
  cuisine: '',
  rating: '4.5',
  deliveryTime: '20-30 min',
  deliveryFee: '150',
  emoji: '🍽️',
  image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
  description: '',
  ownerEmail: '',
};

export default function RestaurantManagementPage() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantForm, setRestaurantForm] = useState(defaultRestaurantForm);
  const [menuItems, setMenuItems] = useState<typeof blankMenuItem[]>([...structuredClone([blankMenuItem])]);
  const [editingRestaurantId, setEditingRestaurantId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setRestaurantForm(defaultRestaurantForm);
    setMenuItems([{ ...blankMenuItem, id: `menu-${Date.now()}` }]);
    setEditingRestaurantId(null);
  };

  const setFormFromRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurantId(restaurant.id);
    setRestaurantForm({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: String(restaurant.rating),
      deliveryTime: restaurant.deliveryTime,
      deliveryFee: String(restaurant.deliveryFee),
      emoji: restaurant.emoji,
      image: restaurant.image,
      description: restaurant.description,
      ownerEmail: (restaurant as Restaurant & { owner?: { email: string } | null }).owner?.email ?? '',
    });
    setMenuItems(
      restaurant.menu.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: String(item.price),
        category: item.category,
      }))
    );
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = response.ok ? await response.json() : null;
        if (!active) return;
        setUser(data);
        if (data?.role === 'admin' || data?.role === 'owner') {
          const restaurantResponse = await fetch('/api/restaurants?scope=manage');
          if (restaurantResponse.ok) setRestaurants(await restaurantResponse.json());
        }
      } catch {
        if (active) setError('Unable to load restaurant management data.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const totalRevenue = restaurants.reduce((sum, restaurant) => sum + restaurant.deliveryFee, 0);
    return {
      totalRestaurants: restaurants.length,
      avgDelivery: restaurants.length ? totalRevenue / restaurants.length : 0,
    };
  }, [restaurants]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
        <div className="glass-panel rounded-xl p-8 text-center max-w-xl mx-auto">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">Access denied</h1>
          <p className="text-on-surface-variant mb-6">Sign in with an administrator or restaurant-owner account.</p>
          <Link href="/login" className="bg-primary text-on-primary px-5 py-3 rounded-full font-label-bold inline-block">
            Sign in as admin
          </Link>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field: keyof typeof defaultRestaurantForm, value: string) => {
    setRestaurantForm((current) => ({ ...current, [field]: value }));
  };

  const handleMenuItemChange = (index: number, field: keyof typeof blankMenuItem, value: string) => {
    setMenuItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const addMenuRow = () => {
    setMenuItems((current) => [...current, { ...blankMenuItem, id: `menu-${Date.now()}` }]);
  };

  const removeMenuRow = (index: number) => {
    setMenuItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    const trimmedName = restaurantForm.name.trim();
    const trimmedCuisine = restaurantForm.cuisine.trim();
    const trimmedDescription = restaurantForm.description.trim();
    setError('');
    setSuccess('');

    if (!trimmedName || !trimmedCuisine || !trimmedDescription) {
      setError('Restaurant name, cuisine, and description are required.');
      return;
    }

    const validMenu = menuItems
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: item.id || `menu-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: item.name.trim(),
        description: item.description.trim() || 'Chef special',
        price: Number(item.price),
        category: item.category.trim() || 'Main',
      }));

    if (validMenu.some((item) => !Number.isFinite(item.price) || item.price < 0)) {
      setError('Menu prices must be valid non-negative amounts.');
      return;
    }

    const payload = {
      name: trimmedName,
      cuisine: trimmedCuisine,
      rating: Number(restaurantForm.rating) || 4.5,
      deliveryTime: restaurantForm.deliveryTime.trim() || '20-30 min',
      deliveryFee: Number(restaurantForm.deliveryFee) || 0,
      emoji: restaurantForm.emoji.trim() || '🍽️',
      image: restaurantForm.image.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
      description: trimmedDescription,
      ownerEmail: restaurantForm.ownerEmail,
      menu: validMenu.length ? validMenu : [
        {
          id: `sample-${Date.now()}`,
          name: 'Chef Special',
          description: 'House favorite prepared fresh every day.',
          price: 750,
          category: 'Main',
        },
      ],
    };

    setSaving(true);
    try {
      const response = await fetch(editingRestaurantId ? `/api/restaurants/${editingRestaurantId}` : '/api/restaurants', {
        method: editingRestaurantId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? 'Unable to save restaurant.');
        return;
      }
      setRestaurants((current) => editingRestaurantId
        ? current.map((restaurant) => restaurant.id === result.id ? result : restaurant)
        : [result, ...current]);
      resetForm();
      setSuccess(editingRestaurantId ? 'Restaurant updated.' : 'Restaurant created.');
    } catch {
      setError('Unable to save restaurant. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRestaurant = async (restaurantId: number) => {
    setError('');
    const response = await fetch(`/api/restaurants/${restaurantId}`, { method: 'DELETE' });
    if (!response.ok) {
      setError('Only administrators can delete restaurants.');
      return;
    }
    if (editingRestaurantId === restaurantId) {
      resetForm();
    }

    setRestaurants((current) => current.filter((restaurant) => restaurant.id !== restaurantId));
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setFormFromRestaurant(restaurant);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-secondary mb-2">Admin tools</p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Restaurant management</h1>
        </div>
        <Link href={user?.role === 'owner' ? '/owner' : '/admin'} className="text-secondary font-label-bold">
          ← Back to dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Restaurants</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{summary.totalRestaurants}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Avg. delivery fee</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">Rs. {Math.round(summary.avgDelivery).toLocaleString('en-LK')}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Coverage</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{restaurants.length ? 'Live' : 'Draft'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <section className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="font-headline-md text-headline-md text-primary">{editingRestaurantId ? 'Edit restaurant' : 'Add restaurant'}</h2>
            {editingRestaurantId !== null && (
              <button type="button" onClick={resetForm} className="text-secondary font-label-bold text-sm">
                Cancel edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <input
              value={restaurantForm.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              placeholder="Restaurant name"
              className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
            />
            <input
              value={restaurantForm.cuisine}
              onChange={(event) => handleFieldChange('cuisine', event.target.value)}
              placeholder="Cuisine type"
              className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
            />
            <textarea
              value={restaurantForm.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full bg-transparent border border-outline-variant rounded-lg p-3 outline-none focus:border-secondary resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                value={restaurantForm.rating}
                onChange={(event) => handleFieldChange('rating', event.target.value)}
                placeholder="Rating"
                className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
              />
              <input
                value={restaurantForm.deliveryTime}
                onChange={(event) => handleFieldChange('deliveryTime', event.target.value)}
                placeholder="Delivery time"
                className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                value={restaurantForm.deliveryFee}
                onChange={(event) => handleFieldChange('deliveryFee', event.target.value)}
                placeholder="Delivery fee"
                className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
              />
              <input
                value={restaurantForm.emoji}
                onChange={(event) => handleFieldChange('emoji', event.target.value)}
                placeholder="Emoji"
                className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
              />
            </div>

            <input
              value={restaurantForm.image}
              onChange={(event) => handleFieldChange('image', event.target.value)}
              placeholder="Image URL"
              className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
            />

            {user.role === 'admin' && (
              <input
                type="email"
                value={restaurantForm.ownerEmail}
                onChange={(event) => handleFieldChange('ownerEmail', event.target.value)}
                placeholder="Owner account email (optional)"
                className="w-full bg-transparent border-b border-outline-variant pb-2 outline-none focus:border-secondary"
              />
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-label-bold text-primary">Menu items</h3>
                <button type="button" onClick={addMenuRow} className="text-secondary font-label-bold text-sm">
                  + Add item
                </button>
              </div>

              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <div key={item.id || index} className="rounded-lg border border-outline-variant p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={item.name}
                        onChange={(event) => handleMenuItemChange(index, 'name', event.target.value)}
                        placeholder="Item name"
                        className="bg-transparent border-b border-outline-variant pb-1 outline-none focus:border-secondary"
                      />
                      <input
                        value={item.price}
                        onChange={(event) => handleMenuItemChange(index, 'price', event.target.value)}
                        placeholder="Price"
                        className="bg-transparent border-b border-outline-variant pb-1 outline-none focus:border-secondary"
                      />
                    </div>
                    <input
                      value={item.category}
                      onChange={(event) => handleMenuItemChange(index, 'category', event.target.value)}
                      placeholder="Category"
                      className="w-full bg-transparent border-b border-outline-variant pb-1 outline-none focus:border-secondary"
                    />
                    <textarea
                      value={item.description}
                      onChange={(event) => handleMenuItemChange(index, 'description', event.target.value)}
                      placeholder="Description"
                      rows={2}
                      className="w-full bg-transparent border border-outline-variant rounded-lg p-2 outline-none focus:border-secondary resize-none"
                    />
                    <div className="flex justify-end">
                      <button type="button" onClick={() => removeMenuRow(index)} className="text-error text-sm font-label-bold">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? <p role="alert" className="text-error text-sm">{error}</p> : null}
            {success ? <p role="status" className="text-secondary text-sm">{success}</p> : null}
            <button type="button" onClick={handleSubmit} disabled={saving} className="bg-primary text-on-primary px-5 py-3 rounded-full font-label-bold w-full disabled:opacity-60">
              {saving ? 'Saving…' : editingRestaurantId ? 'Update restaurant' : 'Save restaurant'}
            </button>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-md text-headline-md text-primary">Restaurant list</h2>
            <span className="text-sm text-on-surface-variant">{restaurants.length} active</span>
          </div>

          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="rounded-xl border border-outline-variant/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-label-bold text-primary">{restaurant.emoji} {restaurant.name}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{restaurant.cuisine} · {restaurant.deliveryTime}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleEditRestaurant(restaurant)} className="text-secondary text-sm font-label-bold">
                      Edit
                    </button>
                    {user.role === 'admin' && (
                      <button type="button" onClick={() => deleteRestaurant(restaurant.id)} className="text-error text-sm font-label-bold">
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {restaurant.menu.slice(0, 3).map((item) => (
                    <span key={item.id} className="rounded-full bg-surface-variant px-2 py-1 text-xs text-on-surface-variant">
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
