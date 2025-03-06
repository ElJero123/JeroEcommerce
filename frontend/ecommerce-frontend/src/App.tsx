import { useEffect } from 'react'
import { NoLogged } from './components/NoLogged'
import { Logged } from './components/Logged'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Protected } from './components/Protected'
import Cookies from 'js-cookie'
import { Settings } from './components/Settings'
import { Cart } from './components/Cart'
import { Checkout } from './components/Checkout'
import { AddProductForm } from './components/AddProductForm'
import { SuccessPayment } from './components/SuccessPayment'
import { CancelPayment } from './components/CancelPayment'
import { VITE_API_LINK } from '../config.ts'
import { Purchases } from './components/Purchases.tsx'
import { PurchasesByUser } from './components/PurchasesByUser.tsx'
import { toast, Toaster } from 'sonner'

function App() {
  const storedToken = Cookies.get('accessToken')

  useEffect(() => {
    if (storedToken) {
      fetch(`${VITE_API_LINK}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: storedToken }),
        }).then(res => {
        if (!res.ok) {
          Cookies.remove('accessToken')
          Cookies.remove('username')
          Cookies.remove('userId')
          Cookies.remove('userRole')
          toast.error('Tu sesión ha expirado, por favor vuelve a iniciar sesión')
          location.reload()
        }
        return res
      }).then(res => res.json())
      .then(data => {
        const { accessToken, user } = data
        const decodedToken = JSON.parse(atob(accessToken.split('.')[1]))

        const expirateTime = new Date(decodedToken).getHours() - (new Date().getHours())
        Cookies.set('accessToken', accessToken, { expires: expirateTime, sameSite: 'strict' })
        Cookies.set('username', user.username, { expires: expirateTime ,sameSite: 'strict' })
        Cookies.set('userId', user.id, { expires: expirateTime, sameSite: 'strict' })
        Cookies.set('userRole', user.role, { expires: expirateTime, sameSite: 'strict' })
      })
    }
  }, [storedToken])

  return (
      <BrowserRouter>

      <Toaster richColors/>

      <Routes>
        <Route path='/' element={
          storedToken
          ? <Logged />
          : <NoLogged />
        } />

        <Route path='/protected' 
        element={<Protected/>}/>

        <Route path='/settings'
        element={<Settings />}/> 

        <Route path='*' 
        element={<h1>404 Not Found</h1>} />

        <Route path='/checkout/:id'
        element={<Checkout />}/>

        <Route path="/cart" 
        element={<Cart />} />

        <Route path='/add-product'
        element={<AddProductForm />}/>

        <Route path='/success-payment'
        element={<SuccessPayment />}/>

        <Route path='/cancel-payment'
        element={<CancelPayment />}/>

        <Route path='/purchases'
        element={<Purchases />}/>

        <Route path='/user-purchases'
        element={<PurchasesByUser />}/>

      </Routes>
      
    </BrowserRouter>
  )
}

export default App
