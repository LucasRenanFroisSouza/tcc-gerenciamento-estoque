const params = new URLSearchParams(window.location.search)
const mensagem = document.getElementById("mensagem")

if (params.get("msg")) {
    mensagem.innerHTML = `
        <div style="color:#b91c1c; background:#fee2e2; border:1px solid #fca5a5; padding:10px; border-radius:8px; margin-top:10px;">
            ${params.get("msg")}
        </div>
    `
}

document.getElementById("login-form").addEventListener("submit", login_user)

async function login_user(event) {

    // Impede o formulário de recarregar a página
    event.preventDefault()

    let email = document.getElementById("email").value.trim()
    let senha = document.getElementById("senha").value.trim()
    let mensagem = document.getElementById("mensagem")

    if (email == "" || senha == "") {

        mensagem.innerHTML = `
            <div style="color:red; margin-top:10px;">
                Preencha todos os campos.
            </div>
        `
        return
    }

    let resposta = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            senha
        })
    })

    let dados = await resposta.json()

    if (resposta.ok) {

        // Guarda o token recebido do Flask
        localStorage.setItem("token", dados.token)

        mensagem.innerHTML = `
            <div style="color:green; margin-top:10px;">
                Login realizado com sucesso!
            </div>
        `

        // Redireciona para a página principal
        window.location.href = "/templates/html/dashboard.html"

    } else {

        mensagem.innerHTML = `
            <div style="color:red; margin-top:10px;">
                ${dados.error}
            </div>
        `
    }
}