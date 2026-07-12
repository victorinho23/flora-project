import { useState } from "react";
import {Outlet} from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
import { UserRegisterForm } from "@/features/users";
import {Button} from "@/shared";
import { DataTable } from "@/shared"
import { users } from "../../features/users/data/users";
import { UserColumns } from "../../features/users/table/UsersColumns";  
import {ReportConfigModal} from "@/features/users";

export default function DashboardLayout(){
    const [report, setReport] = useState(false)

    return(
        <>
            <div
                className="min-h-screen w-full"
                style ={{
                    backgroundImage: `url(${authBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
            }}
        >
                <main className="mx-auto">
                    
                    <UserRegisterForm className=""/>
                                  <ReportConfigModal
                    isOpen={report}
                    onClose={() => setReport(false)}
                />
                
                   <Button 
                    variant="primary"
                    size="md"
                    type="button"
                    onClick={() => {
                      console.log("Se oprimio el boton");
                      setReport(true)
                    }}
                    > 
                    Crear reporte
                </Button>
                <DataTable data={users} columns={UserColumns}/>
                 <Outlet />
                </main>
            </div>
        </>
    );
}