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

    if (!mensagem) return;

    mensagem.textContent = texto;

    mensagem.className =
        `login-mensagem ${tipo}`;
}


/* =====================================
   LOGIN E-MAIL E SENHA
===================================== */

formLogin?.addEventListener(
    "submit",
    async (event) => {

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

                window.location.replace(
                    "../index.html"
                );

            }, 900);


        } catch (erro) {

            console.error(
                "ERRO LOGIN:",
                erro.code,
                erro.message,
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
    }
);


/* =====================================
   LOGIN GOOGLE
===================================== */

btnGoogle?.addEventListener(
    "click",
    async (event) => {

        event.preventDefault();


        if (btnGoogle.disabled) {
            return;
        }


        try {

            btnGoogle.disabled = true;


            mostrarMensagem(
                "Abrindo Google...",
                "carregando"
            );


            const resultado =
                await signInWithPopup(
                    auth,
                    googleProvider
                );


            console.log(
                "Google conectado:",
                resultado.user
            );


            mostrarMensagem(
                "Login realizado com Google!",
                "sucesso"
            );


            setTimeout(() => {

                window.location.replace(
                    "../index.html"
                );

            }, 900);


        } catch (erro) {

            console.error(
                "ERRO LOGIN GOOGLE:"
            );

            console.error(
                "Código:",
                erro.code
            );

            console.error(
                "Mensagem:",
                erro.message
            );

            console.error(erro);


            let texto =
                "Não foi possível entrar com Google.";


            if (
                erro.code ===
                "auth/popup-closed-by-user"
            ) {

                texto =
                    "A janela do Google foi fechada.";
            }

            else if (
                erro.code ===
                "auth/popup-blocked"
            ) {

                texto =
                    "O navegador bloqueou a janela do Google.";
            }

            else if (
                erro.code ===
                "auth/unauthorized-domain"
            ) {

                texto =
                    "Este domínio não está autorizado no Firebase.";
            }

            else if (
                erro.code ===
                "auth/operation-not-allowed"
            ) {

                texto =
                    "O login com Google não está ativado no Firebase.";
            }

            else if (
                erro.code ===
                "auth/network-request-failed"
            ) {

                texto =
                    "Erro de conexão. Verifique sua internet.";
            }


            mostrarMensagem(
                texto,
                "erro"
            );


        } finally {

            btnGoogle.disabled = false;
        }
    }
);