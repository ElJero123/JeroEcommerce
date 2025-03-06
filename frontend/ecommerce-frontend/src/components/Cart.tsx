import { useNavigate } from "react-router-dom"
import { ProfileSvg } from "./svgs/ProfileSvg"
import Cookies from "js-cookie"
import { SettingsSvg } from "./svgs/SettingsSvg"
import { HomeSvg } from "./svgs/HomeSvg"
import { useEffect, useState } from "react"
import { Product } from "../types"
import './css/cart.css'
import { VITE_API_LINK } from "../../config"
import { toast } from "sonner"

export function Cart () {
    const [products, setProducts] = useState<Product[] | undefined>([])
    const totalValue = products?.reduce((acc, product) => acc + Number(product.price), 0)
    const username = Cookies.get('username')
    const navigate = useNavigate()
    const userRole = Cookies.get('userRole')

    const handlePayment = () => {
        const productsToPay = products ?? []
        fetch(`${VITE_API_LINK}/checkout-session-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productsToPay.map(product => product.name).join(', '),
                price: totalValue,
                stockToBuy: 1,
                userId: Cookies.get('userId'),
                description: productsToPay.map(product => product.description).join('\n'),
                productsId: productsToPay.map(product => product.product_id),
                image: productsToPay.length === 1 ? productsToPay[0].url_img : undefined
            })
        }).then(res => {
            if (!res.ok) {
                toast.error('No se ha podido ir a la pagina de pago')
                return
            } else {
              return res  
            }
        }).then(res => res?.json())
        .then(data => {
            window.location.href = data.url
        })
    }

    useEffect(() => {
        fetch(`${VITE_API_LINK}/products-in-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: Cookies.get('userId') })
        }).then(res => res.json())
        .then(data => setProducts(data.products))
    }, [])

    if (!username && !userRole) {
        navigate('/')
        setProducts([])
        return (
            <h1>Not Logged</h1>
        )
    } else {
        return (
          <main>
            <section>
                <header>
                    <p><ProfileSvg /> {username}</p>
                    <div className="btns">
                        <button onClick={() => navigate('/')}><HomeSvg /></button>
                        <button onClick={() => navigate('/settings')}><SettingsSvg /></button>  
                    </div>
                </header>
            </section>
            <section className="cart-info">
                <h1>Carrito de Compras</h1>
                <p>En esta seccion podras ver los productos que has agregado al carrito de compras</p>
            </section>
            <section className="cart-products">
                <ul className='list-products'>
                  {
                    products?.map(product => (
                        <li key={product.product_id}>
                        <img src={product.url_img} alt={product.name} />
                            <div className="info-product">
                                <p><u>{product.name}</u></p>
                                <p>precio: <b>${product.price}</b></p>
                                <p>En existencia: {product.stock}</p>
                                {userRole === 'admin' && <p>ID: {product.product_id}</p>}
                            </div>
                        </li>
                    ))
                }  
                </ul>
                {
                    products?.length === 0 
                    ? <h2>No hay productos en el carrito</h2>
                    : <section className="btn-buy-cart-container">
                        <button className="btn-buy-cart" onClick={() => handlePayment()}>Comprar Todo el carrito: {totalValue}$</button> 
                    </section>
                }
                {products?.length !== 0 && <p style={{ textAlign: "center",  fontSize: '20px'}}>Nota: Tienes que pagar con link para que se procese bien el pago</p>}
            </section>
        </main>  
        )  
    }
}