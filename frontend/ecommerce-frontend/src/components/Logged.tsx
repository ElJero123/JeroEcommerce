import './css/logged.css'
import { ProfileSvg } from './svgs/ProfileSvg'
import { Product } from '../types'
import { useNavigate } from 'react-router-dom'
import { SettingsSvg } from './svgs/SettingsSvg'
import Cookies from 'js-cookie'
import { CartSvg } from './svgs/CartSvg'
import { useEffect, useState } from 'react'
import { VITE_API_LINK } from '../../config'
import { toast } from 'sonner'


export const Logged = () => {
    const [products, setProducts] = useState<Product[] | undefined>([])
    const navigate = useNavigate()
    const username = Cookies.get('username')
    const userRole = Cookies.get('userRole')

    useEffect(() => {
        fetch(`${VITE_API_LINK}/products`)
        .then(res => res.json())
        .then(data => {
            setProducts(data.products)
        })
    }, [])

    const handleAddToCart = (product_id: number) => {    
        fetch(`${VITE_API_LINK}/add-to-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: Cookies.get('userId'),
                productId: product_id,
            }),
        }).then(res => {
            if (res.ok) {
                toast.success('Producto añadido al carrito')
            } else {
                toast.error('Error al añadir producto al carrito, ya esta en el carrito o ocurre un error en el servidor')
            }
        })
    }

    const handleQuitToCart = (product_id: number) => {    
        fetch(`${VITE_API_LINK}/quit-to-cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: Cookies.get('userId'),
                productId: product_id,
            }),
        }).then(res => {
            if (res.ok) {
                toast.success('Producto elimiado del carrito')
            } else {
                toast.error('Error al eliminar producto del carrito, no esta en el carrito o ocurre un error en el servidor')
            }
        })
    }
    
    return (
        <main>
            <div className="background-grey">
                <header>
                    <p><ProfileSvg /> {username}</p>
                    <div className="btns">
                        <button onClick={() => navigate('/cart')}><CartSvg /></button>
                        <button onClick={() => navigate('/settings')}><SettingsSvg /></button>  
                    </div>
                </header>
                <section className='title'>
                    <div className="h1-container">
                        <h1>Productos Que estan a la venta: </h1>
                    </div>
                </section>  
            </div>
            {userRole === 'admin' &&
                <section className='add-product-btn'>
                    <button onClick={() => navigate('/add-product')}>Añadir producto +</button>
                </section>  
            }
            
            <section className='products'>
                <ul className='list-products'>
                { products?.length === 0 && <h1>No hay productos a la venta</h1> }
                    {products?.map(product => (
                        <li key={product.product_id}>
                            <img src={product.url_img} alt={product.name} />
                            <div className="info-product">
                               <p><u>{product.name}</u></p>
                                <p>precio: <b>${product.price}</b></p>
                                <p>En existencia: {product.stock}</p>
                                {userRole === 'admin' && <p>ID: {product.product_id}</p>}
                                <div className="group-btns">
                                    <button className='btn-cart' onClick={() => handleAddToCart(product.product_id)}><CartSvg /> Añadir al carrito</button>
                                    <button className='btn-quit-cart' onClick={() => handleQuitToCart(product.product_id)}><CartSvg /> Quitar del carrito</button>
                                    <button onClick={() => navigate(`/checkout/${product.product_id}`)}>Comprar</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    )
}