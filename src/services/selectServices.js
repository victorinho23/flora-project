import documentTypes from "@/data/select/documentTypes.json"
import typesUser from "@/data/select/typesUser.json"
import dishCategories from "@/data/select/dishCategories.json"
import supplierCategories from "@/data/select/supplierCategories.json"
import supplierDocumentTypes from "@/data/select/supplierDocumentTypes.json"

// selectServices

export async function getDocumentTypes(){
    return documentTypes
}

export async function getTypeUser(){
    return typesUser
}

export async function getDishCategories(){
    return dishCategories
}

export async function getSupplierCategories(){
    return supplierCategories
}

export async function getSupplierDocumentTypes(){
    return supplierDocumentTypes
}

