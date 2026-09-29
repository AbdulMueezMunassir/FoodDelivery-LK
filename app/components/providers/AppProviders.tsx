'use client';

import { CartProvider } from './CartProvider';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
