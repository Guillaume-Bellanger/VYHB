import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

const Layout = () => (
  <>
    <Header />
    <CartDrawer />
    <main className="min-h-screen pt-16 md:pt-20">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default Layout;
