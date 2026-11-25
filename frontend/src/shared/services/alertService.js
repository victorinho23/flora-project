import Swal from "sweetalert2";

export function showSuccesAlert({
    // Los valores despues del = son valores por defecto.
    title = "Exito",
    text = "",
    confirmButtonText = "Aceptar",
    timer = 1000,
}) {
    // Swal.fire() crea el modal
    return Swal.fire({
        icon: "success",
        iconColor: "var(--color-green-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-success",
            confirmButton: "m3-state bg-m3-success px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showErrorAlert({
    // Los valores despues del = son valores por defecto.
    title = "Cancelado",
    text = "",
    confirmButtonText = "Cancelar",
    timer = 1000,
}) {
    // Swal.fire() crea el modal
    return Swal.fire({
        icon: "error",
        iconColor: "var(--color-red-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-error",
            confirmButton: "m3-state bg-m3-error px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showCreateUserErrorAlert({
    title = "Error al crear usuario",
    text = "",
    confirmButtonText = "Aceptar",
    timer = 1000,
}) {
    return Swal.fire({
        icon: "error",
        iconColor: "var(--color-red-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-error",
            confirmButton: "m3-state bg-m3-error px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showConfirmDeleteAlert({
    title = "¿Estas seguro?",
    text = "",
    confirmButtonText = "Eliminar",
    cancelButtonText = "Cancelar",
}) {
    return Swal.fire({
        icon: "warning",
        iconColor: "var(--color-tertiary-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        cancelButtonText,
        showConfirmButton: true,
        showCancelButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-yellow-900",
            confirmButton: "m3-state bg-m3-error px-6 py-2.5 rounded-m3-full text-white",
            cancelButton: "m3-state border border-m3-outline text-m3-on-surface px-6 py-2.5 rounded-m3-full",
        },

        buttonsStyling : false
    });
}

export function showDeleteSuccessAlert({
    title = "Eliminado",
    text = "",
    confirmButtonText = "Aceptar",
    timer = 1000,
}) {
    return Swal.fire({
        icon: "success",
        iconColor: "var(--color-green-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-success",
            confirmButton: "m3-state bg-m3-success px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showDeleteCancelAlert({
    title = "Cancelado",
    text = "",
    confirmButtonText = "Aceptar",
    timer = 1000,
}) {
    return Swal.fire({
        icon: "info",
        iconColor: "var(--color-blue-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-info",
            confirmButton: "m3-state bg-m3-info px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showUnexpectedErrorAlert({
    title = "Error inesperado",
    text = "",
    confirmButtonText = "Aceptar",
    timer = 1000,
}) {
    return Swal.fire({
        icon: "error",
        iconColor: "var(--color-red-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-m3-error",
            confirmButton: "m3-state bg-m3-error px-6 py-2.5 rounded-m3-full text-white",
        },

        buttonsStyling : false
    });
}

export function showConfirmAlert({
    title = "¿Confirmas el cambio?",
    text = "",
    cancelButtonText = "Cancelar",
    confirmButtonText = "Confirmar",
    reasonLabel,
}) {
    return Swal.fire({
        icon: "question",
        // Si se manda reasonLabel la alerta pide escribir un motivo obligatorio
        ...(reasonLabel && {
            input: "textarea",
            inputLabel: reasonLabel,
            inputPlaceholder: "Escribe el motivo",
            inputValidator: (value) => (!value || value.trim().length < 5) && "Escribe un motivo de al menos 5 caracteres",
        }),
        iconColor: "var(--color-tertiary-800)",
        color: "var(--color-gray-950)",
        title,
        text,
        confirmButtonText,
        cancelButtonText,
        showConfirmButton: true,
        showCancelButton: true,

        customClass: {
            popup: "rounded-m3-xl",
            actions: "gap-3",
            title: "text-br-s950",
            confirmButton: "m3-state bg-bg-s950 px-6 py-2.5 rounded-m3-full text-white",
            cancelButton: "m3-state border border-m3-outline text-m3-on-surface px-6 py-2.5 rounded-m3-full",
            inputLabel: "text-br-s950 font-semibold",
        },

        buttonsStyling : false
    });
}
