import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useSettings } from "../../hooks/useSettings";

export default function Footer() {
  const settings = useSettings();

  return (
    <footer className="mt-16 border-t" style={{ backgroundColor: 'var(--current-header)', borderColor: 'var(--current-card-border)' }}>
      <div className="container-max py-10 grid gap-10">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5 flex items-start gap-3 bg-[var(--current-surface)] border border-[var(--current-card-border)]">
            <Truck className="text-[var(--current-accent)] shrink-0" size={18} />
            <div>
              <div className="font-semibold text-[var(--current-text)]">Fast delivery</div>
              <div className="text-sm text-[var(--current-text-secondary)]">{settings.delivery_text}</div>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3 bg-[var(--current-surface)] border border-[var(--current-card-border)]">
            <Undo2 className="text-[var(--current-accent)] shrink-0" size={18} />
            <div>
              <div className="font-semibold text-[var(--current-text)]">Easy returns</div>
              <div className="text-sm text-[var(--current-text-secondary)]">{settings.returns_text}</div>
            </div>
          </div>
          <div className="card p-5 flex items-start gap-3 bg-[var(--current-surface)] border border-[var(--current-card-border)]">
            <ShieldCheck className="text-[var(--current-accent)] shrink-0" size={18} />
            <div>
              <div className="font-semibold text-[var(--current-text)]">Secure payments</div>
              <div className="text-sm text-[var(--current-text-secondary)]">{settings.payments_text}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <div className="text-lg font-bold break-words text-[var(--current-text)]">{settings.store_name}</div>
            <div className="text-sm text-[var(--current-text-secondary)]">{settings.footer_tagline}</div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[var(--current-text)]">Shop</div>
            <div className="text-sm text-[var(--current-text-secondary)] grid gap-1">
              <Link to="/" className="hover:text-[var(--current-text)]">All products</Link>
              <Link to="/wishlist" className="hover:text-[var(--current-text)]">Wishlist</Link>
              <Link to="/cart" className="hover:text-[var(--current-text)]">Cart</Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[var(--current-text)]">Account</div>
            <div className="text-sm text-[var(--current-text-secondary)] grid gap-1">
              <Link to="/account" className="hover:text-[var(--current-text)]">Profile</Link>
              <Link to="/my-orders" className="hover:text-[var(--current-text)]">My orders</Link>
              <Link to="/wishlist" className="hover:text-[var(--current-text)]">Saved items</Link>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-[var(--current-text)]">Newsletter</div>
            <div className="text-sm text-[var(--current-text-secondary)]">Get early access to drops and offers.</div>
            <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
              <input className="input min-w-0" placeholder="Email address" />
              <button className="btn-primary whitespace-nowrap">Join</button>
            </div>
            <div className="text-[11px] text-[var(--current-text-secondary)]">No spam. Unsubscribe anytime.</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-6 text-center text-sm text-[var(--current-text-secondary)] md:flex-row md:items-center md:justify-between md:text-left" style={{ borderColor: 'var(--current-card-border)' }}>
          <span>© {new Date().getFullYear()} {settings.store_name}. All rights reserved.</span>
          <span className="text-xs">Built for a clean premium shopping experience.</span>
        </div>
      </div>
    </footer>
  );
}
