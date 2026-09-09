import {
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db,
    googleProvider
} from "./firebase.js";


const formCadastro =
    document.querySelector("#form-cadastro");

const nomeInput =
    document.querySelector("#cadastro-nome");

const emailInput =
    document.querySelector("#cadastro-email");

const senhaInput =
    document.querySelector("#cadastro-senha");

const confirmarSenhaInput =
    document.querySelector("#cadastro-confirmar-senha");

const btnGoogle =
    document.querySelector("#cadastro-google");

const mensagem =
    document.querySelector("#cadastro-mensagem");


function mostrarMensagem(texto, tipo) {

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;

    mensagem.className =
        `login-mensagem ${tipo}`;
}


async function salvarUsuario(user, nome) {

    await setDoc(
        doc(
            db,
            "usuarios",
            user.uid
        ),
        {
            uid: user.uid,
            nome: nome,
            email: user.email,
            foto: user.photoURL || "",
            criadoEm: serverTimestamp()
        },
        {
            merge: true
        }
    );
}


/* =========================================================
   CADASTRO COM EMAIL E SENHA
========================================================= */

if (formCadastro) {

    formCadastro.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const nome =
                nomeInput.value.trim();

            const email =
                emailInput.value.trim();

            const senha =
                senhaInput.value;

            const confirmarSenha =
                confirmarSenhaInput.value;


            if (
                !nome ||
                !email ||
                !senha ||
                !confirmarSenha
            ) {

                mostrarMensagem(
                    "Preencha todos os campos.",
                    "erro"
                );

                return;
            }


            if (
                senha !==
                confirmarSenha
            ) {

                mostrarMensagem(
                    "As senhas não são iguais.",
                    "erro"
                );

                return;
            }


            if (
                senha.length < 6
            ) {

                mostrarMensagem(
                    "A senha precisa ter pelo menos 6 caracteres.",
                    "erro"
                );

                return;
            }


            try {

                mostrarMensagem(
                    "Criando sua conta...",
                    "carregando"
                );


                const credencial =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        senha
                    );


                const user =
                    credencial.user;


                await updateProfile(
                    user,
                    {
                        displayName: nome
                    }
                );


                await salvarUsuario(
                    user,
                    nome
                );


                mostrarMensagem(
                    "Conta criada com sucesso!",
                    "sucesso"
                );


                setTimeout(() => {

                    window.location.replace(
                        "../index.html"
                    );

                }, 1000);


            } catch (erro) {

                console.error(
                    "Erro no cadastro:",
                    erro
                );


                let texto =
                    "Não foi possível criar sua conta.";


                if (
                    erro.code ===
                    "auth/email-already-in-use"
                ) {

                    texto =
                        "Esse e-mail já possui uma conta.";
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
                    "auth/weak-password"
                ) {

                    texto =
                        "Escolha uma senha mais forte.";
                }

                else if (
                    erro.code ===
                    "permission-denied"
                ) {

                    texto =
                        "O Firestore bloqueou o salvamento do usuário.";
                }


                mostrarMensagem(
                    texto,
                    "erro"
                );
            }
        }
    );
}


/* =========================================================
   CADASTRO COM GOOGLE
========================================================= */

if (btnGoogle) {

    btnGoogle.addEventListener(
        "click",
        async () => {

            try {

                mostrarMensagem(
                    "Abrindo Google...",
                    "carregando"
                );


                const resultado =
                    await signInWithPopup(
                        auth,
                        googleProvider
                    );


                const user =
                    resultado.user;


                await salvarUsuario(
                    user,
                    user.displayName ||
                    "Usuário C3"
                );


                mostrarMensagem(
                    "Conta criada com Google!",
                    "sucesso"
                );


                setTimeout(() => {

                    window.location.replace(
                        "../index.html"
                    );

                }, 1000);


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
        }
    );
}