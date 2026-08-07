import { Card, Slider} from "../../../../shared";
import { cafes } from "../../../products/data/cafes";
import { pizzas } from "../../../products/data/pizzas";
import { malteadas } from "../../../products/data/malteadas";
import { galletas } from "../../../products/data/galletas";
import {Navbar} from "@/shared";
import authBg from "@/assets/images/cafeteria.png";



export default function HomePage(){

    return (
        <div className="mx-auto max-w 7xl  h-screen 
        bg-radial-[at_top] from-bg-p50 via-bg-p200 to-bg-p400
        "
            style={
                {backgroundImage: `url(${authBg}
                `, backgroundSize: "cover",
                backgroundPosition: "center",
        }}
        
        >
            {/** Hero */}
            {/** Carrusel*/}
            {/** Título */}
            

            {/** Cards */}
            <Navbar/>

            <div className="flex-1 flex  justify-center">
                <div
                    className="
                        grid
                        gap-18
                        mx-6
                        sm:grid-cols-2
                        sm:mx-12
                        lg:grid-cols-3
                        xl:grid-cols-4
                        mt-20
                        border 
                        border-2
                        border-bd-t800
                        rounded-[24px]
                        shadow-[0_0_15px_white] 
                        backdrop-blur-lg 
                        bg-background-coffe/50
                        h-154
                        w-395
                        justify-center 
                        items-center
                        pl-10
                        pr-10
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