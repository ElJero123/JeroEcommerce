import { useState } from "react"
import './css/adminOptions.css'
import Cookies from 'js-cookie'
import { VITE_API_LINK } from "../../config"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function AdminOptions () {

    const [giveAdminUsername, setGiveAdminUsername] = useState('')
    const [quitAdminUsername, setQuitAdminUsername] = useState('')
    const [idProduct, setIdProduct] = useState('')
    const navigate = useNavigate()
    const userAdmin = Cookies.get('username')

    const handleSubmitGiveAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        fetch(`${VITE_API_LINK}/give-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userToAdmin: giveAdminUsername, userAdmin })
        }).then(res => {
            if (res.ok) {
                toast.success('Usuario administrador agregado con éxito')
                setGiveAdminUsername('')
            } else {
                toast.error('Error al agregar usuario administrador')
                setGiveAdminUsername('')
            }
        })
    }

    const handleSubmitQuitAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        fetch(`${VITE_API_LINK}/quit-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userToQuitAdmin: quitAdminUsername, userAdmin })
        }).then(res => {
            if (res.ok) {
                toast.success('Usuario administrador eliminado con éxito')
                setQuitAdminUsername('')
            } else {
                toast.error('Error al eliminar usuario administrador')
                setQuitAdminUsername('')
            }
        })
    }

    const handleSubmitDeleteProduct = async (e: React.FormEvent) => {
        e.preventDefault()
        fetch(`${VITE_API_LINK}/quit-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: idProduct, admin: userAdmin })
        }).then(res => {
            if (res.ok) {
                toast.success('Producto eliminado con éxito')
                setIdProduct('')
            } else {
                toast.error('Error al eliminar producto')
                setIdProduct('')
            }
        })
    }
    
    return (
        <main>
            <h1>Opciones de administrador</h1>
            <section>
                <button onClick={() => navigate('/purchases')} className="btn-redirect-purchases">Ver compras de los usuarios</button>
            </section>
            <section>
                <h3>Dar admin:</h3>
                <form onSubmit={handleSubmitGiveAdmin} className="form-admin">
                    <label>
                        Nombre de usuario:
                        <input type="text" value={giveAdminUsername} onChange={(e) => { setGiveAdminUsername(e.target.value) }} />
                    </label>
                    <button type="submit">Dar Admin Al usuario</button>
                </form> 
            </section>
            <section>
                <h3>Quitar admin:</h3>
                <form onSubmit={handleSubmitQuitAdmin} className="form-admin">
                    <label>
                        Nombre de usuario:
                        <input type="text" value={quitAdminUsername} onChange={(e) => { setQuitAdminUsername(e.target.value) }} />
                    </label>
                    <button type="submit">Quitar Admin Al usuario</button>
                </form>
            </section>
            <section>
                <h3>Quitar productos:</h3>
                <form onSubmit={handleSubmitDeleteProduct} className="form-admin">
                    <label>
                        ID del producto:
                        <input type="text" value={idProduct} onChange={(e) => { setIdProduct(e.target.value) }} />
                    </label>
                    <button type="submit">Eliminar Producto</button>
                </form>
            </section>
        </main>
    )
}