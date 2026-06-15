// selectServices

export async function getDocumentTypes(){
    const res = await fetch("/src/data/select/documentTypes.json")
    return res.json()

    
}