import { showConfirmAlert, showErrorAlert, showSuccesAlert } from "./alertService";

export async function confirmStatusChange({
    entity,
    name,
    active,
    feminine = false,
    blockedMessage,
    requireReason = false,
    successText,
}) {
    if (blockedMessage) {
        await showErrorAlert({
            title: "No se puede cambiar el estado",
            text: blockedMessage,
            confirmButtonText: "Entendido",
            timer: 4000,
        });
        return { confirmed: false };
    }

    const action = active ? "habilitar" : "inhabilitar";
    const result = await showConfirmAlert({
        title: `¿Deseas ${action} ${feminine ? "la" : "el"} ${entity}?`,
        text: `${name} quedará ${active ? (feminine ? "habilitada" : "habilitado") : (feminine ? "inhabilitada" : "inhabilitado")}. No se elimina ninguna información.`,
        confirmButtonText: active ? "Habilitar" : "Inhabilitar",
        requireReason,
        reasonLabel: "Motivo de inactivación",
    });

    if (!result.isConfirmed) return { confirmed: false };

    await showSuccesAlert({
        title: "Estado actualizado",
        text: successText ?? `${feminine ? "La" : "El"} ${entity} ha sido ${active ? (feminine ? "habilitada" : "habilitado") : (feminine ? "inhabilitada" : "inhabilitado")} correctamente.`,
        timer: 2500,
    });

    return { confirmed: true, reason: result.value };
}
