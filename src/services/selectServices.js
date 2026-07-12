// selectServices

export async function getDocumentTypes(){
    const res = await fetch("/src/data/select/documentTypes.json")
    return res.json()

    
}


export async function getTypeUser(){
    const res = await fetch("/src/data/select/typesUser.json")
    return res.json()

    
}