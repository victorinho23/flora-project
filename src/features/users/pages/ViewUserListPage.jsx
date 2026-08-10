import { DataTable } from "../../../shared"
import { UserColumns } from "../table/UsersColumns"
import { users } from "../data/users"
import authBg from "@/assets/images/userList.png"
import ReportConfigModal from "../reports/components/ReportConfigModal"
import { useState } from "react"

export default function ViewUserListPage (){

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    return(
        <div className="p-6 bg-fixed min-h-screen"
                        style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }} 
        >
            <h1 className="text-xl-font-semibold py-4 mb-4 text-center text-white bg-background-coffe border-2 border-bd-t800 shadow-[0_0_15px_white] backdrop-blur-lg bg-background-coffe/80">Listado de usuarios</h1>


            <DataTable variant="nineteenth"
            data={users} columns={UserColumns}/>

            <ReportConfigModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}/>
        </div>

        
        
    )
}