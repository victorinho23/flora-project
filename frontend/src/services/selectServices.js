import documentTypes from "@/data/select/documentTypes.json"
import typesUser from "@/data/select/typesUser.json"
import { request } from "@/features/config"
import supplierCategories from "@/data/select/supplierCategories.json"
import supplierDocumentTypes from "@/data/select/supplierDocumentTypes.json"

// selectServices

export async function getDocumentTypes(){
    return documentTypes
}

export async function getTypeUser(){
    return typesUser
}

// las categorias del menu vienen de la tabla categoria del backend
export async function getDishCategories(){
    return await request("/categories")
}

// en la tabla proveedor se guarda el nombre de la categoria, por eso el valor del select es el label
export async function getSupplierCategories(){
    return supplierCategories.map((category) => ({ id: category.label, label: category.label }))
}

export async function getSupplierDocumentTypes(){
    return supplierDocumentTypes
}

