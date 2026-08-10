import { DataTable } from "../../../shared"
import { ColumnsMenu } from "../table/ColumnsMenu" 
import { menu } from "../data/menu"
import authBg from "@/assets/images/menu.png"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { useState } from "react"

export default function ViewMenuListPage () {

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    return(

        <div className="p-6 bg-fixed min-h-screen"
                        style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} 
        >
            <h1 className="text-xl-font-semibold py-4 mb-4 text-center text-white bg-background-coffe border-2 border-bd-t800 shadow-[0_0_15px_white] backdrop-blur-lg bg-background-coffe/80 ">Menu</h1>



            <DataTable variant="seventh" data={menu} columns={ColumnsMenu}/>

            <ReportConfigModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}/>
        </div>

        
        
    )    
}