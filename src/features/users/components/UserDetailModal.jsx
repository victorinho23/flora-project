// src/features/users/components/UserDetailModal.jsx
// Modal para ver la cuenta de un usuario desde la tabla
import { User } from "lucide-react";
import { DetailModal } from "@/shared";
import documentTypes from "@/data/select/documentTypes.json";
import typesUser from "@/data/select/typesUser.json";

// Busca el texto legible de un id en una lista (tipo de documento, tipo de usuario)
const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;

// Muestra la fecha en formato largo o 'No aplica' si esta vacia
const formatDate = (value) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString("es-CO", { dateStyle: "long" }) : "No aplica");

export default function UserDetailModal({ user, onClose, onEdit }) {
    // Si no hay usuario seleccionado el modal no se muestra
    if (!user) return null;

    return (
        <DetailModal
            open
            onClose={onClose}
            icon={User}
            title={user.username}
            subtitle={`Usuario #${user.id} · ${labelOf(typesUser, user.usertype)}`}
            onEdit={onEdit && (() => onEdit(user))}
            editLabel="Editar cuenta"
        >
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Tipo de documento</p>
                <div className="text-base font-semibold text-br-s950 break-words">{labelOf(documentTypes, user.document_type)}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Número de documento</p>
                <div className="text-base font-semibold text-br-s950 break-words">{user.document_number}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Tipo de usuario</p>
                <div className="text-base font-semibold text-br-s950 break-words">{labelOf(typesUser, user.usertype)}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Estado</p>
                <div className="text-base font-semibold text-br-s950 break-words">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${user.is_active ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}>
                        <span className={`h-2 w-2 rounded-full ${user.is_active ? "bg-green-700" : "bg-red-700"}`} />
                        {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                </div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                <p className="text-sm font-medium text-br-s800 mb-1">Correo personal</p>
                <div className="text-base font-semibold text-br-s950 break-words">{user.useremail}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3 [&>div]:break-all">
                <p className="text-sm font-medium text-br-s800 mb-1">Correo empresarial</p>
                <div className="text-base font-semibold text-br-s950 break-words">{user.business_email || "No registrado"}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Teléfono</p>
                <div className="text-base font-semibold text-br-s950 break-words">{user.userphone}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Dirección</p>
                <div className="text-base font-semibold text-br-s950 break-words">{user.address}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Inicio de contrato</p>
                <div className="text-base font-semibold text-br-s950 break-words">{formatDate(user.start_date)}</div>
            </div>
            <div className="border border-bd-s100 border-l-4 border-l-bd-t800 bg-linear-120 from-bg-t50 to-bg-w shadow-[0_8px_20px_-16px_color-mix(in_srgb,var(--color-bg-s950)_45%,transparent)] rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-br-s800 mb-1">Fin de contrato</p>
                <div className="text-base font-semibold text-br-s950 break-words">{formatDate(user.end_date)}</div>
            </div>
        </DetailModal>
    );
}
