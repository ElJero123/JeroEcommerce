import { useState } from "react"
import Cookies from "js-cookie"
import './css/addProductForm.css'
import { ProfileSvg } from "./svgs/ProfileSvg"
import { HomeSvg } from "./svgs/HomeSvg"
import { useNavigate } from "react-router-dom"
import { SettingsSvg } from "./svgs/SettingsSvg"
import { CartSvg } from "./svgs/CartSvg"
import { VITE_API_LINK } from "../../config"
import { toast } from "sonner"

export function AddProductForm () {
    const [propertys, setPropertys] = useState({ name: '', price: '', url_img: '', stock: 0, description: ''  })
    const userRole = Cookies.get('userRole')
    const username = Cookies.get('username')
    const userId = Cookies.get('userId')
    const navigate = useNavigate()

    const handleSubmitProducts = (e: React.FormEvent) => {
        e.preventDefault()

        if (isNaN(Number(propertys.price))) {
            toast.error('El precio debe ser un numero')
        } else {
           fetch(`${VITE_API_LINK}/add-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: propertys.name,
                price: Number(propertys.price),
                urlImg: propertys.url_img,
                stock: propertys.stock,
                description: propertys.description,
                admin: userRole,
                adminId: userId
            })
            }).then(res => {
                if (!res.ok) {
                    toast.error('No tienes permisos para añadir productos o informacion invalida')
                } else {
                    toast.success('Producto añadido con exito')
                }
            }) 
        } 
    }

    if (userRole === 'admin') {
        return (
            <div>
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
                <h2>Añadir producto: </h2>
                <form onSubmit={handleSubmitProducts} className="form-add-product">
                    <label className="label-add-product">
                        Nombre:
                        <input type="text" value={propertys.name} onChange={(e) => setPropertys({ ...propertys, name: e.target.value})}/>
                    </label>
                    <label className="label-add-product">
                        Precio:
                        <input type="text" value={propertys.price} onChange={(e) => setPropertys({ ...propertys, price: e.target.value})}/>
                        <small>NOTA: si el precio tiene decimales ponerlos con "." y no con ","</small>
                    </label>
                    <label className="label-add-product">
                        Imagen (URL):
                        <input type="text" value={propertys.url_img} onChange={(e) => setPropertys({ ...propertys, url_img: e.target.value})}/>
                    </label>
                    <label className="label-add-product">
                        Stock:
                        <input type="number" value={propertys.stock} onChange={(e) => setPropertys({ ...propertys, stock: Number(e.target.value)})}/>
                    </label>
                    <label className="label-add-product">
                        Descripcion:
                        <textarea value={propertys.description} onChange={(e) => setPropertys({ ...propertys, description: e.target.value})}/>
                    </label>
                    <button type="submit">Añadir producto</button>
                </form>
            </div>
        );
    } else {
        return (
            <div>
                <h2>No tienes permisos para añadir productos</h2>
            </div>
        )
    }   
}