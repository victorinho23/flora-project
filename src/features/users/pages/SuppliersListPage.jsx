import { DataTable } from "../../../shared"
import { SuppliersColumns } from "../table/SuppliersColumns" 
import { suppliers } from "../data/suppliers" 
import { Link } from "react-router-dom"
import {Button} from "../../../shared"
import authBg from "@/assets/images/suppliers.png"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { useState } from "react"

export default function SuppliersListPage () {



    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    return(

        <div className="p-6 bg-fixed min-h-screen"
                        style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} 
        >
            <h1 className="text-xl-font-semibold py-4 mb-4 text-center text-white bg-background-coffe border-2 border-bd-t800 shadow-[0_0_15px_white] backdrop-blur-lg bg-background-coffe/80">Listado de Proveedores</h1>

            <div className="flex gap-12 justify-end">
            <Button size="sm" variant="cuar" onClick={() => setIsReportModalOpen(true)}>
            Reportar Proveedor
            </Button>

            <Link to="/userCreate"> {/* Corregir el link  */}
            <Button size="sm" variant="fifth">
            Agregar Proveedor
            </Button>
            </Link>
            </div>

            <DataTable variant="eighth" data={suppliers} columns={SuppliersColumns}/>

            <ReportConfigModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}/>
        </div>

        
        
    )    
}