import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie'
import './css/noLogged.css'
import { UserSvg } from "./svgs/UserSvg";
import { PasswordSvg } from "./svgs/PasswordSvg";
import { CheckSvg } from "./svgs/CheckSvg";
import { VITE_API_LINK } from "../../config.ts";
import { toast } from "sonner";

export const NoLogged = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [checkPass, setCheckPass] = useState('')
    const [usernameLogin, setUsernameLogin] = useState('')
    const [passwordLogin, setPasswordLogin] = useState('')
    
    const navigate = useNavigate()
    
    const handleSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
        if (checkPass !== password) {
            e.preventDefault()
            toast.error('Las contraseñas no coinciden')
            setUsername('')
            setCheckPass('')
            setPassword('')
            return
        }
        
        e.preventDefault()

        fetch(`${VITE_API_LINK}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        }).then(res => {
            if (!res.ok) {
                toast.error('Error al registrar usuario, usuario ya existente')
            } else {
              navigate('/protected')
              toast.success('Usuario registrado con exito')
            }
            
            setUsername('')
            setCheckPass('')
            setPassword('')
        })
    }

    const handleSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        fetch(`${VITE_API_LINK}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameLogin, password: passwordLogin })
        }).then(res => {
            if (!res.ok) {
                toast.error('Error al iniciar sesion, contraseña invalida o usuario no existente')
            }
            return res.json()
        })
          .then(data => {
            if (data.accessToken) {
                const decodedToken = JSON.parse(atob(data.accessToken.split('.')[1]))
                const expirationTime = decodedToken.exp * 1000

                const timeRestant = new Date(expirationTime).getHours() - new Date().getHours()
                const expirateTime = timeRestant > 0 ? timeRestant : 5 / 24
                Cookies.set('accessToken', data.accessToken, { expires: expirateTime })
                Cookies.set('username', data.publicUser.username, { expires: expirateTime })
                Cookies.set('userId', data.publicUser.id, { expires: expirateTime })
                Cookies.set('userRole', data.publicUser.role, { expires: expirateTime })
            }

            navigate('/protected')
            location.reload()
            setUsernameLogin('')
            setPasswordLogin('')
        })
    }

    return (
        <main className="container">
            <h1>Jero Ecommerce</h1>
            <section>
                <form onSubmit={handleSubmitRegister} className="form-container"> 
                <h1>Registrate Aqui: </h1>
                    <label className="label-container">
                        <UserSvg />
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
                    </label>
                    <label className="label-container">
                        <PasswordSvg />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </label>
                    <label className="label-container">
                        <CheckSvg />
                        <input type="password" value={checkPass} onChange={e => setCheckPass(e.target.value)} />
                    </label>
                    <button type="submit">Registrarse</button> 
                </form>   
            </section>
            <section>
                <form onSubmit={handleSubmitLogin} className="form-container">
                <h1>Iniciar Sesion</h1>
                    <label className="label-container">
                        <UserSvg />
                        <input type="text" value={usernameLogin} onChange={e => setUsernameLogin(e.target.value)}/>
                    </label>
                    <label className="label-container">
                        <PasswordSvg />
                        <input type="password" value={passwordLogin} onChange={e => setPasswordLogin(e.target.value)}/>
                    </label>
                    <button type="submit">Iniciar sesion</button>
                </form>
            </section>
        </main>
    )
}