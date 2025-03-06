import Cookies from "js-cookie"
import './css/settings.css'
import { useNavigate } from "react-router-dom"
import { ProfileSvg } from "./svgs/ProfileSvg"
import { AdminOptions } from "./AdminOptions"
import { HomeSvg } from "./svgs/HomeSvg"
import { VITE_API_LINK } from "../../config"
import { toast } from "sonner"

export const Settings = () => {
    const username = Cookies.get('username')
    const userId = Cookies.get('userId')
    const userRole = Cookies.get('userRole')
    const navigate = useNavigate()

    const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        Cookies.remove('accessToken')
        Cookies.remove('username')
        Cookies.remove('userId')
        Cookies.remove('userRole')
        navigate('/')
        location.reload()
    }

    const handleDeleteAccount = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        const confirmDelete = confirm('Estas seguro que deseas eliminar tu cuenta?')

        if (!confirmDelete) {
            return
        } else {
            fetch(`${VITE_API_LINK}}/delete-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: username })
            }).then(res => {
                if (res.ok) {
                    Cookies.remove('accessToken')
                    Cookies.remove('username')
                    Cookies.remove('userId')
                    Cookies.remove('userRole')
                    navigate('/')
                    toast.success('Cuenta eliminada con exito')
                    location.reload()
                } else {
                    toast.error('Error al eliminar cuenta, no se puede eliminar la cuenta')
                }
            })   
        }
        
    }

    return (
        <main>
            {username && userRole ?
               <section>
                    <header>
                        <p><ProfileSvg /> {username}</p>
                        <div className="home-btn">
                            <button onClick={() => navigate('/')} className="back-btn"><HomeSvg /></button>
                        </div>        
                    </header>
                    <h1>Configuracion</h1>
                    <p>Hola {username}</p>
                    <button onClick={handleLogout} className="logout-btn">Cerrar sesion</button> <br />
                    <button onClick={handleDeleteAccount} className="delete-btn">Eliminar cuenta</button> <br />
                    <button onClick={() => navigate('/user-purchases')} className="btn-see-purchases">Ver compras</button>
                </section>
                : <h1>No Logged</h1> 
            }
            
            { userId && username &&
               <section className="info-sect">
                <h1>Informacion de usuario: </h1>
                    <p><b>Nombre de usuario:</b> {username}</p>
                    <p><b>Id de usuario</b> {userId}</p>
                    <p><b>Rol: </b> {userRole}</p>
                </section> 
            }
            
            { username && userId && userRole === 'admin' && <AdminOptions />}
        </main>
    )
}