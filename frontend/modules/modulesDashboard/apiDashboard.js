export async function  fetchDashboard(tipo = "todos") {
    try {
        const response = await fetch( `/api/dashboard?tipo=${tipo}`);

        if(!response.ok) {
            throw new Error('Erro ao buscar dados');
        }

        const data = await response.json();

        return data;
    } catch(e) {
        console.error(e);
        return null;
    }
}  