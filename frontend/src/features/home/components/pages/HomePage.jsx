import { useEffect, useState } from "react";
import { Slider } from "../../../../shared";
import { getSessionUser } from "@/features/auth/services/logoutService";
import { useAccess } from "@/features/auth/services/accessService";
import { getActiveDishCards } from "@/features/products/services/dishService";
import {Navbar} from "@/shared";
import fotoFondo from "@/assets/images/cafeteria.png";



export default function HomePage(){

    // platillos activos del menu agrupados por categoria, un slider por categoria
    const [groups, setGroups] = useState([]);
    const user = getSessionUser();
    // la carta solo se pide si la persona puede ver el menu
    const can = useAccess();
    const canSeeMenu = can("menu_listar");

    // saludo segun la hora del dia
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    const today = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });


    useEffect(() => {
        if (!canSeeMenu) return;
        getActiveDishCards()
            .then((dishes) => {
                const byCategory = dishes.reduce((acc, dish) => {
                    (acc[dish.category] ??= []).push(dish);
                    return acc;
                }, {});
                setGroups(Object.values(byCategory));
            })
            .catch(console.error);
    }, [canSeeMenu]);

    return (
        <div className="mx-auto min-h-screen pb-10 bg-bg-s950 bg-cover bg-center bg-fixed bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_62%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_72%,transparent)_100%),var(--foto)]" style={{ "--foto": `url(${fotoFondo})` }}>
            {/** Hero */}
            {/** Carrusel*/}
            {/** Título */}
        
            <Navbar/>

            {/* Encabezado: saludo y fecha (los modulos estan en el menu de la barra) */}
            <header className="w-full max-w-395 mx-auto px-3 sm:px-6 mt-8 sm:mt-12">
                <div>
                    <p className="text-m3-label-large uppercase tracking-wider text-br-t200 first-letter:uppercase">{today}</p>
                    <h1 className="text-m3-display-small font-bold text-bg-w">
                        {greeting}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                    </h1>
                    <p className="text-m3-body-large text-br-p100">{canSeeMenu ? "Esto es lo que hay hoy en la carta de Flora." : "Bienvenido a Flora."}</p>
                </div>
            </header>

            <div className="flex-1 flex  justify-center px-3 sm:px-6">
                <div
                    className="
                        relative
                        z-0
                        grid
                        grid-cols-1
                        gap-8
                        sm:grid-cols-2
                        md:gap-12
                        xl:grid-cols-4
                        xl:gap-18
                        mt-6
                        sm:mt-8
                        border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-m3-lg bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-m3-1
                        rounded-m3-xl
                        w-full
                        max-w-395
                        xl:min-h-154
                        justify-center 
                        items-center
                        px-3
                        py-8
                        sm:px-8
                        sm:py-10
                        xl:px-10
                    "
                >
                    {/* un carrusel por categoria */}
                    {groups.map((products) => (
                        <section key={products[0].category} aria-label={products[0].category} className="flex flex-col items-center">
                            <Slider products={products} interval={4000}/>
                        </section>
                    ))}

                    {!groups.length && (
                        <p className="col-span-full text-center text-br-s950 font-semibold">
                            {canSeeMenu ? "Todavía no hay platillos activos en el menú." : "Usa el menú de arriba para ir a los módulos que tienes asignados."}
                        </p>
                    )}
                
                    
              </div> 

            </div>
        </div>
    )
}