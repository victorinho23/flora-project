import { Outlet } from "react-router-dom";

export default function SuppliersLayout() {
  return (
    <div className="min-h-screen p-8 md:p-16 flex justify-center items-start">
      <div className="w-full max-w-5xl">
        <Outlet />
      </div>
    </div>
  );
}