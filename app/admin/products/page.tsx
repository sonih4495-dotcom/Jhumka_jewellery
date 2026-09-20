// Location: app/admin/products/page.tsx
import { redirect } from 'next/navigation';

export default function AdminProductsRedirectPage() {
  redirect('/admin/inventory');
}
