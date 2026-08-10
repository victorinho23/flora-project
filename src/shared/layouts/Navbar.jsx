import { useState } from "react";
import { Menu } from "lucide-react";
import {
  IconButton,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  SearchField,
} from "@/shared";
// import  logo  from "@/assets/images/1-logo.png";
import { Link } from "react-router-dom";


export default function Navbar(){

  // Componente de búsqueda 😂😂😂
  const [search, setSearch] = useState("");


  const handleSearch = (value) => {
    console.log("Buscar:", value);
  };


  const handleClear = () => {
    console.log("Campo limpiado");
  };

;


    return (
      <nav className="w-full bg-background-coffe border-w-2 h-20 flex justify-center items-center border 
      border-2
      border-bd-t800
      shadow-[0_0_15px_white] 
      backdrop-blur-lg 
      bg-background-coffe/80">
        <div className="max-w-7xl px-4">
          <div className="flex  w-full h-16 items-center justify-between">
            {/* Logo de marca */}
            <div className=" hidden sm:block items-center">
              <Link to="/dashboard" className="text-h1 font-heading">
                {/* <img src={logo} alt="logo" className="h-12" /> */}
              </Link>
            </div>


            {/* Switch */}
            {/* inline-flex :Ocupa solo su contenido, no todo el ancho. */}

            {/**SearchField + iconButton */}

            <Dropdown className="absolute right-90">
                <div className="text-text-primary flex ">

               
                <DropdownTrigger>
                    <IconButton
                        flex
                        jusitify-start
                        variant="primary"
                        arialabel ="Menu de usuario">
                        <Menu/>
                    </IconButton>
                </DropdownTrigger>

                <DropdownContent className="absolute left-5">

                  <DropdownItem><Link to="/userCreate"  
                    className="block w-full" >Crear usuarios</Link></DropdownItem>

                  <DropdownItem><Link to="/suppliersCreate"  
                    className="block w-full" >Crear proveedores</Link></DropdownItem>

                  <DropdownItem><Link to="/createDishes"  
                  className="block w-full" >Crear Menu</Link></DropdownItem>

                  <DropdownItem><Link to="/createOrders"  
                    className="block w-full" >Crear Orden</Link></DropdownItem>

                   <DropdownItem><Link to="/createInventory"  
                   className="block w-full" >Crear inventario</Link></DropdownItem>

                    <DropdownItem><Link to="/permissions"  
                   className="block w-full" >Gestion de Permisos</Link></DropdownItem>


                  <DropdownItem><Link to="/auth"  
                   className="block w-full" >Cerrar sesión</Link></DropdownItem>

                </DropdownContent>
               
                </div>
            </Dropdown>
           
                 <img className="w-40 h-40 relative absolute right-30 mr-30" src="src/assets/icons/flora-icon.svg" alt="" />
            <div>
                
                 <SearchField
                    value={search}
                    onChange={setSearch}
                    onSubmit={handleSearch}
                    onClear={handleClear}
                    placeholder="Realizar una busqueda"
                    size="md"
                    variant="white"
                    className="w-200"
                />
                
            </div>

            {/* ======= Dropdown ======= */}



            {/* Ícono de usuario */}
            
            </div>
          </div>
        
      </nav>
    );


}
