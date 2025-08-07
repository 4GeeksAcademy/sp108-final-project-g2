import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop.jsx"
import { Navbar } from "../components/Navbar.jsx"
import { Footer } from "../components/Footer.jsx"


// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality.
export const Layout = () => {
    return (
        <ScrollToTop>
             <div className="d-flex flex-column min-vh-100">
                <Navbar />

                {/* El main con flex-grow para ocupar todo el espacio y empujar el footer */}
                <main className="flex-grow-1">
                    <Outlet />
                </main>

                <Footer />
            </div>
        </ScrollToTop>
    )
}
