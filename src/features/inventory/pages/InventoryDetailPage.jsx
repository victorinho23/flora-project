// src/features/inventory/pages/InventoryDetailPage.jsx

import { useParams, useNavigate, useLocation } from "react-router-dom";

// Componentes reutilizables del sistema de diseño
import { Button } from "@/shared";

import { ArrowLeft, Pencil, Package } from "lucide-react";

import { inventory } from "../data/inventory";

import authBg from "@/assets/images/white.jpg";

const METAL = "bg-[linear-gradient(180deg,var(--color-br-t50)_0%,var(--color-br-t300)_45%,var(--color-br-t500)_55%,var(--color-br-t400)_100%)] bg-clip-text text-transparent";
const PANEL = "border-2 border-bd-t500 bg-bg-g950/95 backdrop-blur-xl shadow-[0_0_15px_var(--color-tertiary-400),0_0_35px_color-mix(in_srgb,var(--color-tertiary-400)_40%,transparent),0_20px_40px_-12px_rgb(0_0_0/0.6)]";

const toMoney = (value) => (value != null ? `$${Number(value).toLocaleString("es-CO")}` : null);

export default function InventoryDetailPage() {

    const { id: paramId } = useParams();
    const location = useLocation();
    const id = paramId ?? (location.state?.id != null ? String(location.state.id) : undefined);

    const navigate = useNavigate();

    // Busca el registro correspondiente en la fuente de datos
    const item = inventory.find((record) => String(record.id) === id);

    const fields = item
        ? [
              { label: "ID", value: item.id },
              { label: "Marca", value: item.brand },
              { label: "Nombre del producto", value: item.name },
              { label: "Código de barras", value: item.barcode },
              { label: "Cantidad", value: item.quantity },
              { label: "Cantidad total", value: item.totalQuantity },
              { label: "Valor unitario", value: toMoney(item.unitValue) },
              { label: "Valor total", value: toMoney(item.totalValue) },
              { label: "Estado", value: item.status },
              { label: "Fecha de vencimiento", value: item.expirationDate },
              { label: "Descripción", value: item.description, wide: true },
          ].filter((field) => field.value !== undefined && field.value !== null && field.value !== "")
        : [];

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-6 md:p-10 bg-fixed"
            style={{
                backgroundImage: `url(${authBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className={`w-full max-w-3xl rounded-xl p-6 md:p-8 ${PANEL}`}>

                {/* Encabezado */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-bg-g900 border border-bd-t500/60">
                            <svg width="0" height="0" className="absolute" aria-hidden="true">
                                <defs>
                                    <linearGradient id="metalCaramelo" x1="0" y1="2" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" style={{ stopColor: "var(--color-br-t50)" }} />
                                        <stop offset="45%" style={{ stopColor: "var(--color-br-t300)" }} />
                                        <stop offset="55%" style={{ stopColor: "var(--color-br-t500)" }} />
                                        <stop offset="100%" style={{ stopColor: "var(--color-br-t400)" }} />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <Package size={26} color="url(#metalCaramelo)" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${METAL}`}>
                                Detalle de inventario
                            </h1>
                            <p className="text-sm text-bg-g300">
                                {item ? `Producto #${item.id}` : "Producto no encontrado"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="sex" size="sm" onClick={() => navigate("/listInventory")}>
                            <ArrowLeft size={16} />
                            Volver al listado
                        </Button>

                        {item && (
                            <Button
                                variant="remolino"
                                size="sm"
                                onClick={() => navigate("/updateInventory", { state: { search: item.name } })}
                            >
                                <Pencil size={16} />
                                Modificar
                            </Button>
                        )}
                    </div>
                </div>

                {/* Caso: registro no encontrado */}
                {!item ? (
                    <div className="rounded-lg border border-bd-w/15 bg-bg-g900/80 p-6">
                        <p className="text-sm text-br-t100">
                            No se encontró el producto. Vuelve al listado y toca el ojo del producto que quieres ver.
                        </p>
                    </div>
                ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {fields.map((field) => (
                            <div
                                key={field.label}
                                className={`rounded-lg border border-bd-w/15 bg-bg-g900/80 px-4 py-3 ${field.wide ? "sm:col-span-2" : ""}`}
                            >
                                <dt className="text-xs text-bg-g300 mb-1">{field.label}</dt>
                                <dd className="text-base font-medium text-br-t100 break-words">{field.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </div>
    );
}