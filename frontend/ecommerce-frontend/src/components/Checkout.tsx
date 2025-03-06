import { useNavigate, useParams } from "react-router-dom"
import { Product } from "../types"
import { useEffect, useState } from "react"
import Cookies from 'js-cookie'
import './css/checkout.css'
import { ProfileSvg } from "./svgs/ProfileSvg"
import { SettingsSvg } from "./svgs/SettingsSvg"
import { CartSvg } from "./svgs/CartSvg"
import { HomeSvg } from "./svgs/HomeSvg"
import { MinusSvg } from "./svgs/MinusSvg"
import { PlusSvg } from "./svgs/PlusSvg"
import { VITE_API_LINK } from "../../config"
import { toast } from "sonner"

export function Checkout () {
    const [product, setProduct] = useState<Product[] | undefined>(undefined)
    const [takeQuantityProduct, setTakeQuantityProduct] = useState(1)
    const [error, setError] = useState(false)
    const username = Cookies.get('username')
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        fetch(`${VITE_API_LINK}/get-product/${id}`)
            .then(res => res.json())
            .then(data => setProduct(data.product))
    }, [id])

    useEffect(() => {
        const timer = setTimeout(() => {
            setError(true)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    const handlePayment = () => {
        const prouductToBuy = product ?? []
        fetch(`${VITE_API_LINK}/checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: prouductToBuy[0].name, 
                stockToBuy: takeQuantityProduct, 
                price: prouductToBuy[0].price,
                description: prouductToBuy[0].description,
                images: [prouductToBuy[0].url_img],
                userId: Cookies.get('userId'),
                productId: [prouductToBuy[0].product_id]  
            })
        }).then(res => {
            if (!res.ok) {
                toast.error('No se ha podido ir a la pagina de pago')
                setTakeQuantityProduct(1)
                return
            } else {
                return res  
            }
        }).then(res => res?.json())
        .then(data => {
            window.location.href = data.url
        })
    }
    
    if (product && product.length !== 0) {
    return (
            <main>
                <header>
                    <p><ProfileSvg /> {username}</p>
                    <div className="btns">
                        <button onClick={() => navigate('/')}><HomeSvg /></button>
                        <button onClick={() => navigate('/cart')}><CartSvg /></button>
                        <button onClick={() => navigate('/settings')}><SettingsSvg /></button>  
                    </div>
                </header>
                    <h1>Comprar producto:</h1>
                {product ? (
                    <section className="product" key={product[0].product_id}>
                        <div className="image-product">
                        <img src={product[0].url_img} alt={product[0].name} />
                        </div>
                        <div className="info-product">
                            <h2>{product[0].name}</h2>
                            <p>Precio: {product[0].price}$</p>
                            <p>En existencia: {product[0].stock}</p>
                            <p>{product[0].description}</p>
                            {product[0].stock > 1 &&
                                <div className="container-stock">
                                    <button onClick={() => {
                                        if (takeQuantityProduct === 1) return
                                        else return setTakeQuantityProduct(prev => prev - 1)
                                    }}><MinusSvg /></button>
                                    <span>{takeQuantityProduct}</span>
                                    <button onClick={() => {
                                        if (takeQuantityProduct === product[0].stock) return
                                        else return setTakeQuantityProduct(prev => prev + 1)
                                    }}><PlusSvg /></button>
                                </div>  
                            }
                            <button className="btn-buy-product" onClick={() => handlePayment()}>Comprar</button>
                            <p style={{ textAlign: "center",  fontSize: '20px' }}>Nota: Tienes que pagar con link para que se procese bien el pago</p>
                        </div>
                    </section>
                )
                : <p>Cargando...</p>}
            </main>
        )
    } else {
        return (
            <main>
                <h1>Cargando...</h1>
                {error && <p>Error al cargar el producto, no encontrado</p>}
            </main>
        )
    }
}