import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => (
  <>
    <Header />
    <main className="min-h-screen pt-16 md:pt-20">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default Layout;
