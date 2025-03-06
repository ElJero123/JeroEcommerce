import Cookies from "js-cookie"
import './css/purchases.css'
import { useNavigate } from "react-router-dom"
import { HomeSvg } from "./svgs/HomeSvg"
import { CartSvg } from "./svgs/CartSvg"
import { SettingsSvg } from "./svgs/SettingsSvg"
import { ProfileSvg } from "./svgs/ProfileSvg"
import { useEffect, useState } from "react"
import { Purchase, PurchaseTableFilter } from "../types.d"
import { VITE_API_LINK } from "../../config"
import { differenceInDays } from "date-fns"
import { toast } from "sonner"

export function Purchases () {
    const navigate = useNavigate()
    const [purchases, setPurchases] = useState< Purchase[] | undefined >([])
    const [actualizePurchases, setActualizePurchases] = useState(false)
    const [filterState, setFilterState] = useState<PurchaseTableFilter>(PurchaseTableFilter.NONE)
    const username = Cookies.get('username')
    const userRole = Cookies.get('userRole')

    useEffect(() => {
        fetch(`${VITE_API_LINK}/get-purchased-products`)
        .then(res => res.json())
        .then(data => setPurchases(data.purchases))
        .catch(() => toast.error('Error al cargar las compras'))
    }, [actualizePurchases])

    const handleIsPending = (id: string, isPending: boolean, isDelivered: boolean) => {
        if (!isPending && isDelivered) {
            toast.error('No se puede marcar como pendiente una compra que esta entregada')
            return
        } else {
            fetch(`${VITE_API_LINK}/change-isPending-state`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, isPending })
            }).then(res => {
                if (res.ok) {
                    toast.success('Compra recibida o rechazada con exito')
                    setActualizePurchases(!actualizePurchases)
                } else {
                    toast.error('Error al recibir o rechazar la compra')
                }
            })
        }   
    }
        

    const handleCompleteDelivery = (id: string, isPending: boolean, isDelivered: boolean) => {
        if (isPending || isDelivered) {
            setActualizePurchases(!actualizePurchases)
            toast.error('No se puede marcar como entregado una compra que esta pendiente o que ya esta entregada')
            return
        } else {
            fetch(`${VITE_API_LINK}/complete-delivery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            }).then(res => {
                if (!res.ok) {
                    toast.error('Error al marcar como entrado la entrega')
                    setActualizePurchases(!actualizePurchases)
                } else {
                    toast.success('Entrega marcada como completada')
                }
            })
        } 
    }
        

    const handleDeletePurchase = (id: string) => {
        fetch(`${VITE_API_LINK}/delete-purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        }).then(res => {
            if (res.ok) {
                toast.success('Compra eliminada con exito')
            } else {
                toast.error('Error al eliminar la compra')
            }
        })
    }

    const purchaseFilters = purchases?.filter(purchase => {
        const diffTime = differenceInDays(new Date(), new Date(purchase.created_at))

        if (!filterState) return purchase
        else if (filterState === PurchaseTableFilter.LAST_DAY && diffTime <= 1) return purchase
        else if (filterState === PurchaseTableFilter.LAST_WEEK && diffTime <= 7) return purchase
        else if (filterState === PurchaseTableFilter.LAST_MONTH && diffTime <= 30) return purchase
        else if (filterState === PurchaseTableFilter.LAST_YEAR && diffTime <= 365) return purchase
        else if (filterState === PurchaseTableFilter.DELIVERED && purchase.is_delivered) return purchase
        else if (filterState === PurchaseTableFilter.NOT_DELIVERED && !purchase.is_delivered) return purchase
        else if (filterState === PurchaseTableFilter.PENDING && purchase.is_pending) return purchase
        else if (filterState === PurchaseTableFilter.NOT_PENDING && !purchase.is_pending) return purchase
    })

    if (userRole !== 'admin') {
        return <h1>Acceso denegado, vuelve a la pagina principal</h1>
    } else {
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
                <h1 style={{ textAlign: 'center' }}>Compras de los usuarios</h1>
                <section className="filtering-table">
                    <label htmlFor="filter">Filtrar por grupos</label>
                    <select name="filter" value={filterState} onChange={(e) => setFilterState(e.target.value as PurchaseTableFilter)}>
                        <option value={PurchaseTableFilter.NONE}>Sin filtro</option>
                        <option value={PurchaseTableFilter.LAST_DAY}>Ultimo dia</option>
                        <option value={PurchaseTableFilter.LAST_WEEK}>Ultima semana</option>
                        <option value={PurchaseTableFilter.LAST_MONTH}>Ultimo mes</option>
                        <option value={PurchaseTableFilter.LAST_YEAR}>Ultimo año</option>
                        <option value={PurchaseTableFilter.DELIVERED}>Compras entregadas</option>
                        <option value={PurchaseTableFilter.NOT_DELIVERED}>Compras no entregadas</option>
                        <option value={PurchaseTableFilter.PENDING}>Compras pendientes</option>
                        <option value={PurchaseTableFilter.NOT_PENDING}>Compras Reclamadas</option>
                    </select>
                </section>
                <section className="general-purchases-table">
                    <table className="general-purchases-table">
                        <thead>
                            <tr>
                                <th>ID de compra</th>
                                <th>ID del usuario</th>
                                <th>ID del producto</th>
                                <th>Nombre del usuario</th>
                                <th>Ciudad</th>
                                <th>Direccion</th>
                                <th>Codigo postal</th>
                                <th>Estado</th>
                                <th>Email</th>
                                <th>Cantidad comprada</th>
                                <th>Nombre del producto</th>
                                <th>Fecha del envio</th>
                                <th>Acciones del envio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseFilters?.map((purchase) => {
                                const isPendingProduct = (isPending: string, isReceived: string) => {
                                    return purchase.is_pending ? isPending : isReceived
                                }

                                return (
                                    <tr key={purchase.purchase_id}>
                                        <td>{purchase.purchase_id}</td>
                                        <td>{purchase.user_id}</td>
                                        <td>{purchase.product_id}</td>
                                        <td>{purchase.username}</td>
                                        <td>{purchase.city}</td>
                                        <td>{purchase.address}</td>
                                        <td>{purchase.postal_code}</td>
                                        <td>{purchase.state}</td>
                                        <td>{purchase.email}</td>
                                        <td>{purchase.stockPurchased}</td>
                                        <td>{purchase.name_product}</td>
                                        <td>{purchase.created_at}</td>
                                        <td>
                                            <button 
                                                className={isPendingProduct('is-pending-purchase', 'is-received-purchase')}
                                                onClick={() => handleIsPending(purchase.purchase_id, purchase.is_pending, purchase.is_delivered)}
                                            >
                                                {isPendingProduct('Esta pendiente', 'Esta recibido')}
                                            </button>
                                            <button className="btn-check-purchase" onClick={() => handleCompleteDelivery(purchase.purchase_id, purchase.is_pending, purchase.is_delivered)}>{
                                                !purchase.is_delivered ? 'Marcar como entregado' : 'Compra Entregada'   
                                            }</button>
                                            <button className="btn-delete-purchase" onClick={() => handleDeletePurchase(purchase.purchase_id)}>Eliminar envio</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <p>Nota: Al marcar como entregado una compra, esta no se puede volver a desmarcar</p>
                </section>
            </main>
        )
    }
}