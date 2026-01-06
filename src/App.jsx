import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import DesignerPage from './pages/DesignerPage';
import ProductCustomizationPage from './pages/ProductCustomizationPage';
import CartPage from './pages/CartPage';
import ThankYou from './pages/ThankYou';
import Login from './pages/Login';
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import AccountPage from './pages/AccountPage';
import AuthWrapper from './components/AuthWrapper'
import { useLocation } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import { UserProvider } from './context/UserContext'




function App() {


const location = useLocation()
  const isAuthPage = ['/login', '/register', '/', '/reset-password', '/forgot-password'].includes(location.pathname)

  if (isAuthPage) {
    return (
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
      </Routes>
    )
  }



  return (
    <>
    <Toaster />
    <AppProvider>
      <UserProvider>
        <div className="App">
          <Routes>
            <Route path="/products" element={
              <AuthWrapper>
              <ProductsPage />
              </AuthWrapper>
              } />
            <Route path="/customize" element={
              <AuthWrapper>
              <ProductCustomizationPage />
              </AuthWrapper>
              } />
            <Route path="/design-tool" element={
              <AuthWrapper>
              <DesignerPage />
              </AuthWrapper>
              } />
            <Route path="/cart" element={
              <AuthWrapper>
              <CartPage />
              </AuthWrapper>
              } />
            <Route path="/user-account" element={
              <AuthWrapper>
              <AccountPage />
              </AuthWrapper>
              } />
            <Route path="/thank-you" element={
              <AuthWrapper>
              <ThankYou />
              </AuthWrapper>
              } />

            {/* You can add more routes later for checkout and order confirmation */}
          </Routes>
        </div>
      
    </UserProvider>
    </AppProvider>
    </>
  );
}

export default App;