import { DataTable } from "../../../shared"
import { OrderColumns } from "../table/OrderColumns"
import { orders } from "../data/orders"
import authBg from "@/assets/images/ordenes.png"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { useState } from "react"

export default function ViewOrderListPage () {


    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    return(

        

        <div className="p-6 bg-fixed min-h-screen"
                        style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} 
        >
            {/* <Navbar className="fixed top-0 w-full"/> */}
            <h1 className="text-xl-font-semibold py-4 mb-4 text-center text-white bg-background-coffe border-2 border-bd-t800 shadow-[0_0_15px_white] backdrop-blur-lg bg-background-coffe/80 ">Lista de ordenes</h1>


            <DataTable variant="fourth" data={orders} columns={OrderColumns}/>

            <ReportConfigModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}/>
        </div>

        
        
    )    
}