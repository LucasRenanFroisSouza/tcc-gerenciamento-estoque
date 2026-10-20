const API_URL = "http://127.0.0.1:5000/api/fornecedores";

const tbody = document.querySelector("tbody");

document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();

    document
        .getElementById("btn-save-forn")
        .addEventListener("click", salvarFornecedor);
});

async function carregarFornecedores() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar fornecedores");
        }

        const fornecedores = await response.json();

        tbody.innerHTML = "";

        fornecedores.forEach(fornecedor => {
            tbody.innerHTML += `
                <tr>
                    <td>${fornecedor.id}</td>
                    <td>${fornecedor.nome}</td>
                    <td>${fornecedor.cnpj}</td>
                    <td>${fornecedor.telefone}</td>
                    <td>${fornecedor.email}</td>
                    <td>Ativo</td>
                    <td>
                        <button class="btn btn-outline">Editar</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar fornecedores.");
    }
}

async function salvarFornecedor() {
    const token = localStorage.getItem("token");

    const nome = document.getElementById("in-forn-nome").value.trim();
    const cnpj = document.getElementById("in-forn-cnpj").value.trim();
    const telefone = document.getElementById("in-forn-tel").value.trim();
    const email = document.getElementById("in-forn-email").value.trim();

    if (!nome || !cnpj || !telefone || !email) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                cnpj,
                telefone,
                email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao cadastrar fornecedor.");
        }

        alert("Fornecedor cadastrado com sucesso!");

        document.getElementById("in-forn-nome").value = "";
        document.getElementById("in-forn-cnpj").value = "";
        document.getElementById("in-forn-tel").value = "";
        document.getElementById("in-forn-email").value = "";

        closeModals();

        carregarFornecedores();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}