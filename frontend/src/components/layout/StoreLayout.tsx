import { Outlet } from "react-router-dom";
import StoreHeader from "./StoreHeader";
import Footer from "./Footer";
import { useCart } from "../../store/cartStore";

export default function StoreLayout() {
  const { cartItems, wishlist } = useCart();

  return (
    <div className="min-h-screen text-[var(--current-text)] flex flex-col overflow-x-hidden" style={{ backgroundColor: 'var(--current-bg)' }} data-section="home" data-theme="home">
      <StoreHeader cartItems={cartItems} wishlist={wishlist} />
      <main className="flex-1 w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
        <div className="container-max">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
