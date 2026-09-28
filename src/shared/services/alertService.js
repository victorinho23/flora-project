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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-green-600",
            confirmButton: "bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-red-600",
            confirmButton: "bg-red-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-red-600",
            confirmButton: "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        cancelButtonText,
        showConfirmButton: true,
        showCancelButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-yellow-600",
            confirmButton: "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white",
            cancelButton: "bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-green-600",
            confirmButton: "bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-blue-600",
            confirmButton: "bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white",
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
        title,
        text,
        confirmButtonText,
        timer,
        timerProgressBar: true,
        showConfirmButton: true,

        customClass: {
            popup: "rounded-2xl",
            actions: "gap-3",
            title: "text-red-600",
            confirmButton: "bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white",
        },

        buttonsStyling : false
    });
}
