import {Outlet} from "react-router-dom";
import authBg from "@/assets/images/cafe.png";
import { UserRegisterForm } from "@/features/users";
import { DataTable } from "@/shared"
import { users } from "../../features/users/data/users";
import { UserColumns } from "../../features/users/table/UsersColumns";

export default function DashboardLayout(){
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
                 <Outlet />

            <DataTable data={users} columns={UserColumns}/>
                    
                </main>
            </div>
        </>
    );
}