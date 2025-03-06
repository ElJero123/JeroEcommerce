import { Link } from "react-router-dom"

export const Protected = () => {
    return (
        <main>
            <p>Esta es una ruta protegida, si te acabas de registrar ve otra vez a la homepage, si ya iniciaste sesion ve a la homepage para ir a la pagina principal como usuario</p>
            <Link to='/'>Vuelve a la pagina pricipal</Link>
        </main>
    )
}