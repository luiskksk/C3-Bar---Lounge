console.log("C3 Bar & Lounge carregado com sucesso!");


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";


/* =====================================
   ELEMENTOS
===================================== */

const botaoLogin =
    document.querySelector(".btn-login");


/* =====================================
   CAMINHOS
===================================== */

function estaNaPastaPages() {

    return window.location.pathname.includes(
        "/pages/"
    );
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


function caminhoMinhaConta() {

    if (estaNaPastaPages()) {
        return "./minha-conta.html";
    }

    return "./pages/minha-conta.html";
}


function caminhoAdmin() {

    if (estaNaPastaPages()) {
        return "./admin.html";
    }

    return "./pages/admin.html";
}


/* =====================================
   VERIFICAR SE É ADMIN
===================================== */

async function verificarSeAdmin(user) {

    try {

        const referenciaUsuario =
            doc(
                db,
                "usuarios",
                user.uid
            );


        const usuarioSnap =
            await getDoc(
                referenciaUsuario
            );


        if (!usuarioSnap.exists()) {
            return false;
        }


        return (
            usuarioSnap.data().admin === true
        );

    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );

        return false;
    }
}


/* =====================================
   CONVERTER TIMESTAMP
===================================== */

function timestampParaNumeroAdmin(
    timestamp
) {

    if (!timestamp) {
        return 0;
    }


    if (
        typeof timestamp.toMillis ===
        "function"
    ) {
        return timestamp.toMillis();
    }


    if (
        typeof timestamp.seconds ===
        "number"
    ) {
        return (
            timestamp.seconds *
            1000
        );
    }


    return 0;
}


/* =====================================
   CONTAR NOTIFICAÇÕES
===================================== */

async function contarNotificacoesAdmin() {

    try {

        const ultimaVisualizacao =
            Number(
                localStorage.getItem(
                    "c3_admin_ultima_visualizacao"
                ) || 0
            );


        const [
            reservasSnapshot,
            mensagensSnapshot
        ] =
            await Promise.all([

                getDocs(
                    collection(
                        db,
                        "reservas"
                    )
                ),

                getDocs(
                    collection(
                        db,
                        "mensagens"
                    )
                )

            ]);


        let quantidade = 0;


        reservasSnapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();


                const criadoEm =
                    timestampParaNumeroAdmin(
                        dados.criadoEm
                    );


                if (
                    criadoEm >
                    ultimaVisualizacao
                ) {
                    quantidade++;
                }
            }
        );


        mensagensSnapshot.forEach(
            (documento) => {

                const dados =
                    documento.data();


                const criadoEm =
                    timestampParaNumeroAdmin(
                        dados.criadoEm
                    );


                if (
                    criadoEm >
                    ultimaVisualizacao
                ) {
                    quantidade++;
                }
            }
        );


        return quantidade;

    } catch (erro) {

        console.error(
            "Erro ao verificar notificações:",
            erro
        );

        return 0;
    }
}


/* =====================================
   CRIAR MENU DO USUÁRIO
===================================== */

async function criarMenuUsuario(user) {

    if (!botaoLogin) {
        return;
    }


    const nomeUsuario =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Usuário";


    const primeiroNome =
        nomeUsuario.split(" ")[0];


    const usuarioAdmin =
        await verificarSeAdmin(user);


    let quantidadeNotificacoes = 0;


    if (usuarioAdmin) {

        quantidadeNotificacoes =
            await contarNotificacoesAdmin();
    }


    botaoLogin.style.display =
        "none";


    const menuExistente =
        document.querySelector(
            ".usuario-area"
        );


    if (menuExistente) {
        menuExistente.remove();
    }


    const usuarioArea =
        document.createElement("div");


    usuarioArea.classList.add(
        "usuario-area"
    );


    usuarioArea.innerHTML = `

        <button
            class="usuario-btn"
            id="usuario-btn"
            type="button"
            aria-expanded="false"
        >

            <span class="usuario-avatar-wrapper">

                <span class="usuario-avatar">
                    ${primeiroNome.charAt(0).toUpperCase()}
                </span>

                ${
                    usuarioAdmin &&
                    quantidadeNotificacoes > 0

                        ? `
                            <span
                                class="usuario-notificacao"
                                title="${quantidadeNotificacoes} nova(s) notificação(ões)"
                            >
                                ${
                                    quantidadeNotificacoes > 9
                                        ? "9+"
                                        : quantidadeNotificacoes
                                }
                            </span>
                        `

                        : ""
                }

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


            <a
                href="${caminhoMinhaConta()}"
                class="usuario-menu-item usuario-conta"
            >

                <span class="usuario-menu-icone">
                    ◉
                </span>

                Minha conta

            </a>


            ${
                usuarioAdmin

                    ? `
                        <a
                            href="${caminhoAdmin()}"
                            class="usuario-menu-item usuario-admin"
                        >

                            <span
                                class="usuario-menu-icone usuario-admin-icone"
                            >
                                ◈
                            </span>

                            Painel Admin

                            ${
                                quantidadeNotificacoes > 0

                                    ? `
                                        <span
                                            class="usuario-menu-notificacao"
                                        >
                                            ${
                                                quantidadeNotificacoes > 9
                                                    ? "9+"
                                                    : quantidadeNotificacoes
                                            }
                                        </span>
                                    `

                                    : ""
                            }

                        </a>
                    `

                    : ""
            }


            <div class="usuario-menu-linha"></div>


            <button
                type="button"
                class="usuario-menu-item usuario-sair"
                id="usuario-sair"
            >

                <span class="usuario-menu-icone">
                    ↪
                </span>

                Sair da conta

            </button>

        </div>

    `;


    botaoLogin.insertAdjacentElement(
        "afterend",
        usuarioArea
    );


    const usuarioBtn =
        usuarioArea.querySelector(
            "#usuario-btn"
        );


    const usuarioSair =
        usuarioArea.querySelector(
            "#usuario-sair"
        );


    usuarioBtn.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            const aberto =
                usuarioArea.classList.toggle(
                    "aberto"
                );


            usuarioBtn.setAttribute(
                "aria-expanded",
                String(aberto)
            );
        }
    );


    usuarioSair.addEventListener(
        "click",
        async () => {

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
        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !usuarioArea.contains(
                    event.target
                )
            ) {

                usuarioArea.classList.remove(
                    "aberto"
                );


                usuarioBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
}


/* =====================================
   MOSTRAR BOTÃO ENTRAR
===================================== */

function mostrarBotaoLogin() {

    if (!botaoLogin) {
        return;
    }


    const usuarioArea =
        document.querySelector(
            ".usuario-area"
        );


    if (usuarioArea) {
        usuarioArea.remove();
    }


    botaoLogin.style.display =
        "";


    botaoLogin.textContent =
        "Entrar";


    botaoLogin.href =
        caminhoLogin();
}


/* =====================================
   FIREBASE OBSERVA LOGIN
===================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            console.log(
                "Usuário logado:",
                user.displayName,
                user.email
            );


            await criarMenuUsuario(
                user
            );

        } else {

            console.log(
                "Nenhum usuário logado."
            );


            mostrarBotaoLogin();
        }
    }
);