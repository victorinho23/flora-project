import { Slider} from "../../../../shared";
import { cafes } from "../../../products/data/cafes";
import { pizzas } from "../../../products/data/pizzas";
import { malteadas } from "../../../products/data/malteadas";
import { galletas } from "../../../products/data/galletas";
import {Navbar} from "@/shared";
import fotoFondo from "@/assets/images/cafeteria.png";



export default function HomePage(){

    return (
        <div className="mx-auto max-w 7xl  min-h-screen pb-10 bg-bg-s950 bg-cover bg-center bg-fixed bg-[linear-gradient(160deg,color-mix(in_srgb,var(--color-bg-s950)_80%,transparent)_0%,color-mix(in_srgb,var(--color-bg-s900)_62%,transparent)_55%,color-mix(in_srgb,var(--color-bg-t950)_72%,transparent)_100%),var(--foto)]" style={{ "--foto": `url(${fotoFondo})` }}>
            {/** Hero */}
            {/** Carrusel*/}
            {/** Título */}
        
            <Navbar/>

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
                        mt-8
                        sm:mt-14
                        lg:mt-20
                        border border-bd-s100 border-t-[5px] border-t-bd-t800 rounded-[1.25rem] bg-bg-w bg-linear-180 from-bg-w to-bg-p50 shadow-[0_26px_50px_-28px_color-mix(in_srgb,var(--color-bg-s950)_55%,transparent)]
                        rounded-[28px]
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
                    <Slider products={cafes} intervalMs={4000}/>
                    <Slider products={pizzas} intervalMs={4000}/>
                    <Slider products={malteadas} intervalMs={4000}/>
                    <Slider products={galletas} intervalMs={4000}/>
                
                    
              </div> 

            </div>
        </div>
    )
}