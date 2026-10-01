import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================
   CAMINHOS
===================================== */

function caminhoLogin() {
    return window.location.pathname.includes("/pages/")
        ? "./login.html"
        : "./pages/login.html";
}


function caminhoHome() {
    return window.location.pathname.includes("/pages/")
        ? "../index.html"
        : "./index.html";
}


function caminhoMinhaConta() {
    return window.location.pathname.includes("/pages/")
        ? "./minha-conta.html"
        : "./pages/minha-conta.html";
}


function caminhoAdmin() {
    return window.location.pathname.includes("/pages/")
        ? "./admin.html"
        : "./pages/admin.html";
}


/* =====================================
   ELEMENTOS
===================================== */

const navegacao =
    document.querySelector("#menu-navegacao");


/* =====================================
   ESTADO
===================================== */

let usuarioAtual = null;

let adminListenerReservas = null;

let adminListenerMensagens = null;

let adminEstaAtivo = false;


/* =====================================
   TIMESTAMP
===================================== */

function timestampParaNumeroAdmin(timestamp) {

    if (!timestamp) {
        return 0;
    }

    if (
        typeof timestamp.toMillis === "function"
    ) {
        return timestamp.toMillis();
    }

    if (
        typeof timestamp.toDate === "function"
    ) {
        return timestamp.toDate().getTime();
    }

    if (
        timestamp instanceof Date
    ) {
        return timestamp.getTime();
    }

    if (
        typeof timestamp === "number"
    ) {
        return timestamp;
    }

    return 0;
}


/* =====================================
   VERIFICAR ADMIN
===================================== */

async function verificarSeAdmin(user) {

    if (!user) {
        return false;
    }

    try {

        const referencia =
            doc(
                db,
                "usuarios",
                user.uid
            );

        const resultado =
            await getDoc(
                referencia
            );

        if (!resultado.exists()) {
            return false;
        }

        return resultado.data().admin === true;

    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );

        return false;
    }
}


/* =====================================
   PARAR NOTIFICAÇÕES
===================================== */

function pararListenersAdmin() {

    if (adminListenerReservas) {

        adminListenerReservas();

        adminListenerReservas =
            null;
    }


    if (adminListenerMensagens) {

        adminListenerMensagens();

        adminListenerMensagens =
            null;
    }


    adminEstaAtivo = false;
}


/* =====================================
   ATUALIZAR BADGES
===================================== */

function atualizarNotificacoesAdmin(
    reservas,
    mensagens
) {

    if (!adminEstaAtivo) {
        return;
    }


    const ultimaVisualizacao =
        Number(
            localStorage.getItem(
                "c3_admin_ultima_visualizacao"
            ) || 0
        );


    let quantidade =
        0;


    /* RESERVAS NOVAS */

    reservas.forEach(
        (reserva) => {

            const criadoEm =
                timestampParaNumeroAdmin(
                    reserva.criadoEm
                );

            if (
                criadoEm > ultimaVisualizacao
            ) {
                quantidade++;
            }
        }
    );


    /* MENSAGENS NOVAS */

    mensagens.forEach(
        (mensagem) => {

            const criadoEm =
                timestampParaNumeroAdmin(
                    mensagem.criadoEm
                );

            if (
                criadoEm > ultimaVisualizacao
            ) {
                quantidade++;
            }
        }
    );


    const badges =
        document.querySelectorAll(
            ".usuario-notificacao"
        );


    badges.forEach(
        (badge) => {

            if (quantidade > 0) {

                badge.textContent =
                    quantidade > 99
                        ? "99+"
                        : quantidade;

                badge.hidden =
                    false;

            } else {

                badge.textContent =
                    "0";

                badge.hidden =
                    true;
            }
        }
    );


    const badgesMenu =
        document.querySelectorAll(
            ".usuario-menu-notificacao"
        );


    badgesMenu.forEach(
        (badge) => {

            if (quantidade > 0) {

                badge.textContent =
                    quantidade > 99
                        ? "99+"
                        : quantidade;

                badge.hidden =
                    false;

            } else {

                badge.textContent =
                    "0";

                badge.hidden =
                    true;
            }
        }
    );
}


function iniciarListenersAdmin() {

    pararListenersAdmin();

    if (!usuarioAtual) {
        return;
    }

    adminEstaAtivo = true;

    let reservasAtuais = [];
    let mensagensAtuais = [];


    adminListenerReservas =
        onSnapshot(
            collection(
                db,
                "reservas"
            ),

            (snapshot) => {

                reservasAtuais = [];

                snapshot.forEach(
                    (documento) => {

                        reservasAtuais.push({
                            id: documento.id,
                            ...documento.data()
                        });

                    }
                );

                atualizarNotificacoesAdmin(
                    reservasAtuais,
                    mensagensAtuais
                );
            },

            (erro) => {

                console.error(
                    "Erro no listener de reservas do menu:",
                    erro
                );
            }
        );


    adminListenerMensagens =
        onSnapshot(
            collection(
                db,
                "mensagens"
            ),

            (snapshot) => {

                mensagensAtuais = [];

                snapshot.forEach(
                    (documento) => {

                        mensagensAtuais.push({
                            id: documento.id,
                            ...documento.data()
                        });

                    }
                );

                atualizarNotificacoesAdmin(
                    reservasAtuais,
                    mensagensAtuais
                );
            },

            (erro) => {

                console.error(
                    "Erro no listener de mensagens do menu:",
                    erro
                );
            }
        );
}


    /* =================================
       RESERVAS
    ================================= */

    adminListenerReservas =
        onSnapshot(
            collection(
                db,
                "reservas"
            ),

            (snapshot) => {

                const reservas = [];

                snapshot.forEach(
                    (documento) => {

                        reservas.push({
                            id:
                                documento.id,

                            ...documento.data()
                        });

                    }
                );


                atualizarNotificacoesAdmin(
                    reservas,
                    []
                );

            },

            (erro) => {

                console.error(
                    "Erro no listener de reservas do menu:",
                    erro
                );
            }
        );


    /* =================================
       MENSAGENS
    ================================= */

    adminListenerMensagens =
        onSnapshot(
            collection(
                db,
                "mensagens"
            ),

            (snapshot) => {

                const mensagens = [];

                snapshot.forEach(
                    (documento) => {

                        mensagens.push({
                            id:
                                documento.id,

                            ...documento.data()
                        });

                    }
                );


                /* PEGAR RESERVAS ATUAIS
                   PARA MANTER O CONTADOR */

                onSnapshot(
                    collection(
                        db,
                        "reservas"
                    ),

                    (reservasSnapshot) => {

                        const reservas = [];

                        reservasSnapshot.forEach(
                            (documento) => {

                                reservas.push({
                                    id:
                                        documento.id,

                                    ...documento.data()
                                });

                            }
                        );


                        atualizarNotificacoesAdmin(
                            reservas,
                            mensagens
                        );
                    },

                    (erro) => {

                        console.error(
                            "Erro ao sincronizar reservas:",
                            erro
                        );
                    }
                );

            },

            (erro) => {

                console.error(
                    "Erro no listener de mensagens do menu:",
                    erro
                );
            }
        );



/* =====================================
   CRIAR MENU DO USUÁRIO
===================================== */

async function criarMenuUsuario(user) {

    if (!navegacao) {
        return;
    }


    usuarioAtual =
        user;


    const ehAdmin =
        await verificarSeAdmin(
            user
        );


    const nome =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Usuário C3";


    const inicial =
        nome
            .charAt(0)
            .toUpperCase();


    const caminhoConta =
        caminhoMinhaConta();


    const caminhoPainel =
        caminhoAdmin();


    navegacao.innerHTML =
        `
            <div class="usuario-menu">

                <button
                    type="button"
                    class="usuario-menu-botao"
                    id="usuario-menu-botao"
                    aria-expanded="false"
                >

                    <span class="usuario-avatar-wrapper">

                        <span class="usuario-avatar">
                            ${inicial}
                        </span>

                        <span
                            class="usuario-notificacao"
                            hidden
                        >
                            0
                        </span>

                    </span>

                    <span class="usuario-nome">
                        ${nome}
                    </span>

                    <span class="usuario-seta">
                        ▾
                    </span>

                </button>


                <div
                    class="usuario-dropdown"
                    id="usuario-dropdown"
                    hidden
                >

                    <div class="usuario-dropdown-topo">

                        <strong>
                            ${nome}
                        </strong>

                        <span>
                            ${user.email || ""}
                        </span>

                    </div>


                    <a
                        href="${caminhoConta}"
                        class="usuario-menu-link"
                    >
                        Minha conta
                    </a>


                    ${
                        ehAdmin
                            ? `
                                <a
                                    href="${caminhoPainel}"
                                    class="usuario-menu-link usuario-menu-admin"
                                >
                                    Painel administrativo

                                    <span
                                        class="usuario-menu-notificacao"
                                        hidden
                                    >
                                        0
                                    </span>

                                </a>
                            `
                            : ""
                    }


                    <button
                        type="button"
                        class="usuario-menu-sair"
                        id="usuario-menu-sair"
                    >
                        Sair da conta
                    </button>

                </div>

            </div>
        `;


    const botaoMenu =
        document.querySelector(
            "#usuario-menu-botao"
        );

    const dropdown =
        document.querySelector(
            "#usuario-dropdown"
        );

    const botaoSair =
        document.querySelector(
            "#usuario-menu-sair"
        );


    if (botaoMenu && dropdown) {

        botaoMenu.addEventListener(
            "click",
            () => {

                const aberto =
                    !dropdown.hidden;

                dropdown.hidden =
                    aberto;

                botaoMenu.setAttribute(
                    "aria-expanded",
                    String(!aberto)
                );
            }
        );
    }


    if (botaoSair) {

        botaoSair.addEventListener(
            "click",
            async () => {

                try {

                    botaoSair.disabled =
                        true;

                    botaoSair.textContent =
                        "Saindo...";


                    pararListenersAdmin();


                    await signOut(
                        auth
                    );


                    window.location.replace(
                        caminhoHome()
                    );

                } catch (erro) {

                    console.error(
                        "Erro ao sair:",
                        erro
                    );

                    botaoSair.disabled =
                        false;

                    botaoSair.textContent =
                        "Sair da conta";
                }
            }
        );
    }


    if (ehAdmin) {

        iniciarListenersAdmin();

    } else {

        pararListenersAdmin();
    }
}


/* =====================================
   BOTÃO LOGIN
===================================== */

function mostrarBotaoLogin() {

    if (!navegacao) {
        return;
    }


    pararListenersAdmin();

    usuarioAtual = null;


    navegacao.innerHTML =
        `
            <a
                href="${caminhoLogin()}"
                class="nav-login"
            >
                Entrar
            </a>
        `;
}


/* =====================================
   AUTENTICAÇÃO
===================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            mostrarBotaoLogin();

            return;
        }


        await criarMenuUsuario(
            user
        );
    }
);


/* =====================================
   CLICAR FORA DO MENU
===================================== */

document.addEventListener(
    "click",
    (event) => {

        const menu =
            document.querySelector(
                ".usuario-menu"
            );

        const dropdown =
            document.querySelector(
                "#usuario-dropdown"
            );

        if (
            !menu ||
            !dropdown
        ) {
            return;
        }


        if (
            !menu.contains(
                event.target
            )
        ) {

            dropdown.hidden =
                true;

            const botao =
                document.querySelector(
                    "#usuario-menu-botao"
                );

            if (botao) {

                botao.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    }
);