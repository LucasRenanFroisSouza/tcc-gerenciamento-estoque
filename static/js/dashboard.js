// Verifica se o usuário está logado ao carregar o painel de gerenciamento.
if (!localStorage.getItem("token")) {

    // Redireciona para o login com uma mensagem de alerta.
    window.location.href = "index.html?msg=Você precisa fazer login para acessar esta página.";
}


// Carrega os dados do dashboard ao abrir a página.
carregar_dashboard();


// Função para carregar os dados do dashboard.
async function carregar_dashboard() {

    const token = localStorage.getItem("token");

    const totalLotes =
        document.getElementById("total-lotes");

    const totalFarmacos =
        document.getElementById("total-farmacos");

    const totalMovimentacoes =
        document.getElementById("total-movimentacoes");


    // Caso dashboard.js esteja sendo utilizado
    // em outra página, não tenta carregar os cards.
    if (
        !totalLotes ||
        !totalFarmacos ||
        !totalMovimentacoes
    ) {

        return;
    }


    try {

        // Envia a requisição para o backend.
        const resposta = await fetch(
            "http://127.0.0.1:5000/api/dashboard",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            throw new Error(
                dados.erro ||
                dados.error ||
                "Erro ao carregar o dashboard."
            );
        }


        // Atualiza os valores dos cards.
        totalLotes.textContent =
            dados.lotes_ativos ?? 0;


        totalFarmacos.textContent =
            dados.farmacos ?? 0;


        totalMovimentacoes.textContent =
            dados.movimentacoes ?? 0;


    } catch (erro) {

        console.error(
            "Não foi possível carregar o dashboard:",
            erro
        );


        totalLotes.textContent = "0";
        totalFarmacos.textContent = "0";
        totalMovimentacoes.textContent = "0";

    }
}


// Função para fazer o logout.
async function fazer_logout() {

    // Recupera o token salvo no navegador da web.
    const token = localStorage.getItem("token");


    try {

        // Envia a requisição de logout para o backend.
        await fetch(
            "http://127.0.0.1:5000/api/logout",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao realizar logout:",
            erro
        );

    }


    // Remove o token do navegador da web e redireciona para o login.
    localStorage.removeItem("token");

    window.location.href = "index.html";
}