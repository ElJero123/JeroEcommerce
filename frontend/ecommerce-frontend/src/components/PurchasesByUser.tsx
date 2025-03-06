import Cookies from 'js-cookie'
import './css/purchasesByUser.css'
import { useEffect, useState } from "react"
import { Purchase } from "../types"
import { VITE_API_LINK } from "../../config"
import { ProfileSvg } from './svgs/ProfileSvg'
import { useNavigate } from 'react-router-dom'
import { HomeSvg } from './svgs/HomeSvg'
import { CartSvg } from './svgs/CartSvg'
import { SettingsSvg } from './svgs/SettingsSvg'
import { toast } from 'sonner'

export const PurchasesByUser = () => {
    const [purchases, setPurchases] = useState< Purchase[] | undefined >([])
    const navigate = useNavigate()
    const username = Cookies.get('username')

    useEffect(() => {
        fetch(`${VITE_API_LINK}/get-purchased-products-by-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: Cookies.get('userId') })
        })
        .then(res => res.json())
        .then(data => setPurchases(data.purchases))
        .catch(() => toast.error('Error al cargar las compras'))
    }, [])
    
    return (
        <main>
            <header>
                <p>
                    <ProfileSvg />
                    {username}
                </p>
                <div className="btns">
                    <button onClick={() => navigate('/')}><HomeSvg /></button>
                    <button onClick={() => navigate('/cart')}><CartSvg /></button>
                    <button onClick={() => navigate('/settings')}><SettingsSvg /></button>
                </div>
            </header>
            <h1>Tus Compras</h1>
            <section className='user-purchases'>
                <ul className='list-purchases'>
                    {purchases?.length === 0 && <h2>No tienes compras</h2>}
                    {purchases?.map(purchase => (
                        <li key={purchase.purchase_id}>
                            <h2>{purchase.name_product}</h2>
                            <img src={purchase.url_img} alt={purchase.name_product}/>
                            <p>ID de compra: {purchase.purchase_id}</p>
                            <p>Fecha de compra: {purchase.created_at}</p>
                            <p>Nombre del comprador: {purchase.username}</p>
                            <p>Cantidad Comprada: {purchase.stockPurchased}</p>
                            <p>Ubicacion: <br />
                                <em>Pais:</em> {purchase.country} <br />
                                <em>Estado o departamento:</em> {purchase.state} <br />
                                <em>Ciudad:</em> {purchase.city} <br />
                                <em>Direccion:</em> {purchase.address} <br />
                                <em>Codigo Postal:</em> {purchase.postal_code} <br />
                                <em>Estado de la compra: {purchase.is_pending ? 'Esta pendiente' : 'Esta recibido, llegara pronto!'}</em>
                            </p>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    )
}