import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import Ticker from "./Ticker";

const Layout = () => (
  <>
    <Ticker />
    <Header />
    <CartDrawer />
    {/* pt = ticker (h-8 = 2rem) + header mobile (h-16 = 4rem) / desktop (h-20 = 5rem) */}
    <main className="min-h-screen pt-24 md:pt-28">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default Layout;
