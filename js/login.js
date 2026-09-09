import {
    signInWithEmailAndPassword,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    auth,
    googleProvider
} from "./firebase.js";


const formLogin =
    document.querySelector("#form-login");

const emailInput =
    document.querySelector("#login-email");

const senhaInput =
    document.querySelector("#login-senha");

const btnGoogle =
    document.querySelector("#login-google");

const mensagem =
    document.querySelector("#login-mensagem");


function mostrarMensagem(texto, tipo) {

    mensagem.textContent = texto;

    mensagem.className =
        `login-mensagem ${tipo}`;
}


formLogin.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        emailInput.value.trim();

    const senha =
        senhaInput.value;


    if (!email || !senha) {

        mostrarMensagem(
            "Preencha o e-mail e a senha.",
            "erro"
        );

        return;
    }


    try {

        mostrarMensagem(
            "Entrando...",
            "carregando"
        );


        await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );


        mostrarMensagem(
            "Login realizado com sucesso!",
            "sucesso"
        );


        setTimeout(() => {

    window.location.replace("../index.html");

}, 900);


    } catch (erro) {

        console.error(
            "Erro no login:",
            erro
        );


        let texto =
            "Não foi possível entrar.";


        if (
            erro.code ===
            "auth/invalid-credential"
        ) {

            texto =
                "E-mail ou senha incorretos.";
        }


        else if (
            erro.code ===
            "auth/invalid-email"
        ) {

            texto =
                "Digite um e-mail válido.";
        }


        else if (
            erro.code ===
            "auth/too-many-requests"
        ) {

            texto =
                "Muitas tentativas. Tente novamente depois.";
        }


        mostrarMensagem(
            texto,
            "erro"
        );

    }

});


btnGoogle.addEventListener("click", async () => {

    try {

        mostrarMensagem(
            "Abrindo Google...",
            "carregando"
        );


        await signInWithPopup(
            auth,
            googleProvider
        );


        mostrarMensagem(
            "Login realizado!",
            "sucesso"
        );


        setTimeout(() => {

    window.location.replace("../index.html");

}, 900);


    } catch (erro) {

        console.error(
            "Erro Google:",
            erro
        );


        if (
            erro.code ===
            "auth/popup-closed-by-user"
        ) {

            mostrarMensagem(
                "A janela do Google foi fechada.",
                "erro"
            );

            return;
        }


        mostrarMensagem(
            "Não foi possível entrar com Google.",
            "erro"
        );

    }

});