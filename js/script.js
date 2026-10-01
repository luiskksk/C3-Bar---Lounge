/* ==================================================
   C3 BAR & LOUNGE
   SCRIPT GLOBAL
================================================== */

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


/* ==================================================
   ELEMENTOS
================================================== */

const botaoLogin =
    document.querySelector(".btn-login");


/* ==================================================
   CAMINHOS
================================================== */

function estaNaPastaPages() {

    return window.location.pathname.includes(
        "/pages/"
    );
}


function caminhoLogin() {

    return estaNaPastaPages()
        ? "./login.html"
        : "./pages/login.html";
}


function caminhoHome() {

    return estaNaPastaPages()
        ? "../index.html"
        : "./index.html";
}


function caminhoMinhaConta() {

    return estaNaPastaPages()
        ? "./minha-conta.html"
        : "./pages/minha-conta.html";
}


function caminhoAdmin() {

    return estaNaPastaPages()
        ? "./admin.html"
        : "./pages/admin.html";
}


/* ==================================================
   VERIFICAR ADMIN
================================================== */

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

        const snapshot =
            await getDoc(
                referencia
            );

        if (!snapshot.exists()) {

            console.log(
                "Usuário não possui documento em usuarios."
            );

            return false;
        }

        const dados =
            snapshot.data();

        return dados.admin === true;

    } catch (erro) {

        console.error(
            "Erro ao verificar admin:",
            erro
        );

        return false;
    }
}


/* ==================================================
   TIMESTAMP
================================================== */

function timestampParaNumero(
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
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp
            .toDate()
            .getTime();
    }

    if (
        timestamp.seconds !== undefined
    ) {

        return (
            timestamp.seconds * 1000
        );
    }

    return 0;
}


/* ==================================================
   CRIAR ÁREA DO USUÁRIO
================================================== */

async function criarMenuUsuario(user) {

    console.log(
        "CRIANDO PERFIL PARA:",
        user.email
    );


    if (!botaoLogin) {

        console.error(
            "ERRO: .btn-login não foi encontrado no HTML."
        );

        return;
    }


    /* ==============================================
       DADOS DO USUÁRIO
    ============================================== */

    const nomeCompleto =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Usuário";


    const primeiroNome =
        nomeCompleto
            .trim()
            .split(" ")[0];


    const inicial =
        primeiroNome
            .charAt(0)
            .toUpperCase();


    /* ==============================================
       ADMIN
    ============================================== */

    const ehAdmin =
        await verificarSeAdmin(
            user
        );


    console.log(
        "É ADMIN?",
        ehAdmin
    );


    /* ==============================================
       REMOVE MENU ANTIGO
    ============================================== */

    const menuAntigo =
        document.querySelector(
            ".usuario-area"
        );


    if (menuAntigo) {
        menuAntigo.remove();
    }


    /* ==============================================
       ESCONDE ENTRAR
    ============================================== */

    botaoLogin.style.display =
        "none";


    /* ==============================================
       CRIA ÁREA
    ============================================== */

    const usuarioArea =
        document.createElement(
            "div"
        );


    usuarioArea.className =
        "usuario-area";


    /* ==============================================
       BOTÃO DO PERFIL
    ============================================== */

    const usuarioBtn =
        document.createElement(
            "button"
        );

        const notificacao =
    document.createElement("span");

notificacao.className =
    "usuario-notificacao usuario-notificacao-topo";

notificacao.hidden = true;

notificacao.textContent = "0";


    usuarioBtn.type =
        "button";

    usuarioBtn.className =
        "usuario-btn";

    usuarioBtn.id =
        "usuario-btn";

    usuarioBtn.setAttribute(
        "aria-expanded",
        "false"
    );


    const avatar =
        document.createElement(
            "span"
        );

    avatar.className =
        "usuario-avatar";

    avatar.textContent =
        inicial;


    const nome =
        document.createElement(
            "span"
        );

    nome.className =
        "usuario-nome";

    nome.textContent =
        primeiroNome;


    const seta =
        document.createElement(
            "span"
        );

    seta.className =
        "usuario-seta";

    seta.textContent =
        "▾";


    usuarioBtn.append(
    avatar,
    nome,
    seta,
    notificacao
);


    /* ==============================================
       MENU
    ============================================== */

    const usuarioMenu =
        document.createElement(
            "div"
        );

    usuarioMenu.className =
        "usuario-menu";

    usuarioMenu.id =
        "usuario-menu";


    /* ==============================================
       INFORMAÇÕES
    ============================================== */

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "usuario-menu-info";


    const nomeInfo =
        document.createElement(
            "strong"
        );

    nomeInfo.textContent =
        nomeCompleto;


    const emailInfo =
        document.createElement(
            "span"
        );

    emailInfo.textContent =
        user.email || "";


    info.append(
        nomeInfo,
        emailInfo
    );


    usuarioMenu.appendChild(
        info
    );


    /* ==============================================
       LINHA
    ============================================== */

    usuarioMenu.appendChild(
        criarLinha()
    );


    /* ==============================================
       MINHA CONTA
    ============================================== */

    const minhaConta =
        document.createElement(
            "a"
        );

    minhaConta.href =
        caminhoMinhaConta();

    minhaConta.className =
        "usuario-menu-item usuario-conta";

    minhaConta.innerHTML =
        `
        <span class="usuario-menu-icone">
            ◉
        </span>
        <span>
            Minha conta
        </span>
        `;


    usuarioMenu.appendChild(
        minhaConta
    );


    /* ==============================================
       PAINEL ADMIN
    ============================================== */

    if (ehAdmin) {

        const admin =
            document.createElement(
                "a"
            );

        admin.href =
            caminhoAdmin();

        admin.className =
            "usuario-menu-item usuario-admin";

        admin.innerHTML =
            `
            <span class="usuario-menu-icone usuario-admin-icone">
                ◈
            </span>

            <span>
                Painel Admin
            </span>

            <span
                class="usuario-notificacao"
                hidden
            >
                0
            </span>
            `;


        usuarioMenu.appendChild(
            admin
        );
    }


    /* ==============================================
       LINHA
    ============================================== */

    usuarioMenu.appendChild(
        criarLinha()
    );


    /* ==============================================
       SAIR
    ============================================== */

    const sair =
        document.createElement(
            "button"
        );

    sair.type =
        "button";

    sair.className =
        "usuario-menu-item usuario-sair";

    sair.id =
        "usuario-sair";

    sair.innerHTML =
        `
        <span class="usuario-menu-icone">
            ↪
        </span>

        <span>
            Sair da conta
        </span>
        `;


    usuarioMenu.appendChild(
        sair
    );


    /* ==============================================
       JUNTA TUDO
    ============================================== */

    usuarioArea.append(
        usuarioBtn,
        usuarioMenu
    );


    /* ==============================================
       COLOCA NO HEADER
    ============================================== */

    botaoLogin.insertAdjacentElement(
        "afterend",
        usuarioArea
    );


    /* ==============================================
       ABRIR MENU
    ============================================== */

    usuarioBtn.addEventListener(
        "click",
        event => {

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


    /* ==============================================
       FECHAR AO CLICAR FORA
    ============================================== */

    document.addEventListener(
        "click",
        event => {

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


    /* ==============================================
       LOGOUT
    ============================================== */

    sair.addEventListener(
        "click",
        async () => {

            try {

                sair.disabled =
                    true;

                sair.textContent =
                    "Saindo...";


                await signOut(
                    auth
                );


                window.location.href =
                    caminhoHome();

            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );

                sair.disabled =
                    false;

                sair.textContent =
                    "Sair da conta";
            }
        }
    );


    /* ==============================================
       NOTIFICAÇÕES ADMIN
    ============================================== */

    if (ehAdmin) {

        iniciarNotificacoesAdmin();
    }
}


/* ==================================================
   CRIAR LINHA
================================================== */

function criarLinha() {

    const linha =
        document.createElement(
            "div"
        );

    linha.className =
        "usuario-menu-linha";

    return linha;
}


/* ==================================================
   NOTIFICAÇÕES ADMIN EM TEMPO REAL
================================================== */

function iniciarNotificacoesAdmin() {

    const ultimaVisualizacao =
        Number(
            localStorage.getItem(
                "c3_admin_ultima_visualizacao"
            ) || 0
        );


    let reservas = [];

    let mensagens = [];


    function atualizar() {

        let quantidade =
            0;


        reservas.forEach(
            reserva => {

                const criadoEm =
                    timestampParaNumero(
                        reserva.criadoEm
                    );

                if (
                    criadoEm >
                    ultimaVisualizacao
                ) {

                    quantidade++;
                }
            }
        );


        mensagens.forEach(
            mensagem => {

                const criadoEm =
                    timestampParaNumero(
                        mensagem.criadoEm
                    );

                if (
                    criadoEm >
                    ultimaVisualizacao
                ) {

                    quantidade++;
                }
            }
        );


        atualizarBadge(
            quantidade
        );
    }


    onSnapshot(
        collection(
            db,
            "reservas"
        ),

        snapshot => {

            reservas = [];

            snapshot.forEach(
                documento => {

                    reservas.push({
                        id:
                            documento.id,

                        ...documento.data()
                    });
                }
            );

            atualizar();
        },

        erro => {

            console.error(
                "Erro nas notificações de reservas:",
                erro
            );
        }
    );


    onSnapshot(
        collection(
            db,
            "mensagens"
        ),

        snapshot => {

            mensagens = [];

            snapshot.forEach(
                documento => {

                    mensagens.push({
                        id:
                            documento.id,

                        ...documento.data()
                    });
                }
            );

            atualizar();
        },

        erro => {

            console.error(
                "Erro nas notificações de mensagens:",
                erro
            );
        }
    );
}


/* ==================================================
   ATUALIZAR BADGE
================================================== */

function atualizarBadge(
    quantidade
) {

    const badges =
        document.querySelectorAll(
            ".usuario-notificacao"
        );


    badges.forEach(
        badge => {

            if (
                quantidade <= 0
            ) {

                badge.hidden =
                    true;

                badge.textContent =
                    "0";

                return;
            }


            badge.hidden =
                false;

            badge.textContent =
                quantidade > 99
                    ? "99+"
                    : quantidade;
        }
    );
}


/* ==================================================
   MOSTRAR BOTÃO ENTRAR
================================================== */

function mostrarBotaoLogin() {

    const usuarioArea =
        document.querySelector(
            ".usuario-area"
        );


    if (usuarioArea) {
        usuarioArea.remove();
    }


    if (!botaoLogin) {
        return;
    }


    botaoLogin.style.display =
        "";


    botaoLogin.textContent =
        "Entrar";


    botaoLogin.href =
        caminhoLogin();
}


/* ==================================================
   FIREBASE
================================================== */

onAuthStateChanged(
    auth,
    async user => {

        console.log(
            "AUTH STATE:",
            user
        );


        if (!user) {

            console.log(
                "Nenhum usuário conectado."
            );

            mostrarBotaoLogin();

            return;
        }


        console.log(
            "USUÁRIO CONECTADO:",
            user.email
        );


        await criarMenuUsuario(
            user
        );
    }
);