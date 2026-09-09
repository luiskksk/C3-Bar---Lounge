console.log('C3 Bar & Lounge carregado com sucesso!')

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth
} from "./firebase.js";


console.log("C3 Bar & Lounge carregado com sucesso!");


const botaoLogin = document.querySelector(".btn-login");


function estaNaPastaPages() {

    return window.location.pathname.includes("/pages/");
}


function caminhoLogin() {

    if (estaNaPastaPages()) {
        return "./login.html";
    }

    return "./pages/login.html";
}


function caminhoHome() {

    if (estaNaPastaPages()) {
        return "../index.html";
    }

    return "./index.html";
}


function criarMenuUsuario(user) {

    if (!botaoLogin) {
        return;
    }


    const nomeUsuario =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Usuário";


    const primeiroNome =
        nomeUsuario.split(" ")[0];


    /*
        Remove o botão Entrar
    */

    botaoLogin.style.display = "none";


    /*
        Evita criar o menu duas vezes
    */

    const menuExistente =
        document.querySelector(".usuario-area");


    if (menuExistente) {
        menuExistente.remove();
    }


    /*
        Cria área do usuário
    */

    const usuarioArea =
        document.createElement("div");


    usuarioArea.classList.add("usuario-area");


    usuarioArea.innerHTML = `

        <button
            class="usuario-btn"
            id="usuario-btn"
            type="button"
            aria-expanded="false"
        >

            <span class="usuario-avatar">
                ${primeiroNome.charAt(0).toUpperCase()}
            </span>

            <span class="usuario-nome">
                ${primeiroNome}
            </span>

            <span class="usuario-seta">
                ▾
            </span>

        </button>


        <div
            class="usuario-menu"
            id="usuario-menu"
        >

            <div class="usuario-menu-info">

                <strong>
                    ${nomeUsuario}
                </strong>

                <span>
                    ${user.email || ""}
                </span>

            </div>


            <div class="usuario-menu-linha"></div>


            <button
                type="button"
                class="usuario-menu-item usuario-sair"
                id="usuario-sair"
            >
                Sair da conta
            </button>

        </div>

    `;


    /*
        Coloca ao lado do botão Entrar
    */

    botaoLogin.insertAdjacentElement(
        "afterend",
        usuarioArea
    );


    const usuarioBtn =
        usuarioArea.querySelector("#usuario-btn");


    const usuarioMenu =
        usuarioArea.querySelector("#usuario-menu");


    const usuarioSair =
        usuarioArea.querySelector("#usuario-sair");


    /*
        Abrir / fechar menu
    */

    usuarioBtn.addEventListener("click", () => {

        const aberto =
            usuarioArea.classList.toggle("aberto");


        usuarioBtn.setAttribute(
            "aria-expanded",
            aberto
        );

    });


    /*
        Logout
    */

    usuarioSair.addEventListener("click", async () => {

        try {

            await signOut(auth);


            window.location.href =
                caminhoHome();


        } catch (erro) {

            console.error(
                "Erro ao sair da conta:",
                erro
            );

        }

    });


    /*
        Fecha clicando fora
    */

    document.addEventListener("click", (event) => {

        if (
            !usuarioArea.contains(event.target)
        ) {

            usuarioArea.classList.remove("aberto");


            usuarioBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


function mostrarBotaoLogin() {

    if (!botaoLogin) {
        return;
    }


    const usuarioArea =
        document.querySelector(".usuario-area");


    if (usuarioArea) {
        usuarioArea.remove();
    }


    botaoLogin.style.display = "";


    botaoLogin.textContent =
        "Entrar";


    botaoLogin.href =
        caminhoLogin();

}


/*
    FIREBASE OBSERVA O LOGIN
*/

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            console.log(
                "Usuário logado:",
                user.displayName,
                user.email
            );


            criarMenuUsuario(user);

        } else {

            console.log(
                "Nenhum usuário logado."
            );


            mostrarBotaoLogin();

        }

    }
);