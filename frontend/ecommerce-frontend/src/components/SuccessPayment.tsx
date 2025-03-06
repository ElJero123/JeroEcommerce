import { useNavigate } from "react-router-dom"
import { ProfileSvg } from "./svgs/ProfileSvg"
import Cookies from "js-cookie"
import { HomeSvg } from "./svgs/HomeSvg"
import { CartSvg } from "./svgs/CartSvg"
import { SettingsSvg } from "./svgs/SettingsSvg"
import { CheckSvg } from "./svgs/CheckSvg"
import './css/successPayment.css'

export function SuccessPayment () {
    const navigate = useNavigate()
    const username = Cookies.get('username')
    
    
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
            
            <section className="alert-container">
                <section className="info-container">
                    <div className="success">
                        <CheckSvg />
                    </div>
                    <h1>Tu pago ha sido exitoso</h1>
                    <p>Tu envio llegara pronto</p>
                </section>
            </section>
        </main>  
    )
}