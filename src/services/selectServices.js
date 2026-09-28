// selectServices

export async function getDocumentTypes(){
    const res = await fetch("/src/data/select/documentTypes.json")
    return res.json()
}

export async function getTypeUser(){
    const res = await fetch("/src/data/select/typesUser.json")
    return res.json()
}

export async function getDishCategories(){
    const res = await fetch("/src/data/select/dishCategories.json")
    return res.json()
}

export async function getSupplierCategories(){
    const res = await fetch("/src/data/select/supplierCategories.json")
    return res.json()
}

export async function getSupplierDocumentTypes(){
    const res = await fetch("/src/data/select/supplierDocumentTypes.json")
    return res.json()
}

