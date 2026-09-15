/* =========================================
   C3 BAR & LOUNGE
   PAINEL ADMINISTRATIVO
========================================= */


/* =========================================
   IMPORTS
========================================= */

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =========================================
   ELEMENTOS
========================================= */

const loading =
    document.querySelector("#admin-loading");

const negado =
    document.querySelector("#admin-negado");

const conteudo =
    document.querySelector("#admin-conteudo");

const nomeAdmin =
    document.querySelector("#admin-nome");


/* RESERVAS */

const listaReservas =
    document.querySelector("#admin-reservas");

const listaReservasProximas =
    document.querySelector("#admin-reservas-proximas");

const listaReservasAntigas =
    document.querySelector("#admin-reservas-antigas");


/* MENSAGENS */

const listaMensagens =
    document.querySelector("#admin-mensagens");


/* ESTATÍSTICAS */

const totalElemento =
    document.querySelector("#admin-total");

const pendentesElemento =
    document.querySelector("#admin-pendentes");

const confirmadasElemento =
    document.querySelector("#admin-confirmadas");

const canceladasElemento =
    document.querySelector("#admin-canceladas");


/* LOGOUT */

const botaoSair =
    document.querySelector("#admin-sair");


/* =========================================
   DATA LOCAL
========================================= */

function dataLocalISO() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            agora.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/* =========================================
   FORMATAR DATA
========================================= */

function formatarData(data) {

    if (!data) {
        return "Data não informada";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );
}


/* =========================================
   TIMESTAMP FIREBASE
========================================= */

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


/* =========================================
   FORMATAR STATUS
========================================= */

function formatarStatus(status) {

    switch (status) {

        case "confirmada":
            return "Confirmada";

        case "cancelada":
            return "Cancelada";

        default:
            return "Pendente";
    }
}


/* =========================================
   CRIAR BOTÃO
========================================= */

function criarBotao(
    texto,
    classe,
    funcao
) {

    const botao =
        document.createElement(
            "button"
        );

    botao.type =
        "button";

    botao.classList.add(
        "admin-reserva-btn",
        classe
    );

    botao.textContent =
        texto;

    botao.addEventListener(
        "click",
        funcao
    );

    return botao;
}


/* =========================================
   ALTERAR STATUS
========================================= */

async function alterarStatus(
    reservaId,
    novoStatus
) {

    try {

        await updateDoc(
            doc(
                db,
                "reservas",
                reservaId
            ),
            {
                status:
                    novoStatus,

                atualizadoEm:
                    serverTimestamp()
            }
        );

        await carregarReservas();

    } catch (erro) {

        console.error(
            "Erro ao atualizar reserva:",
            erro
        );

        alert(
            "Não foi possível atualizar a reserva."
        );
    }
}


/* =========================================
   APAGAR RESERVA
========================================= */

async function apagarReserva(
    reservaId
) {

    const confirmou =
        window.confirm(
            "Tem certeza que deseja apagar esta reserva permanentemente?\n\nEssa ação não pode ser desfeita."
        );

    if (!confirmou) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "reservas",
                reservaId
            )
        );

        await carregarReservas();

    } catch (erro) {

        console.error(
            "Erro ao apagar reserva:",
            erro
        );

        alert(
            "Não foi possível apagar a reserva."
        );
    }
}


/* =========================================
   CARD DA RESERVA
========================================= */

function criarCardReserva(
    reserva
) {

    const card =
        document.createElement(
            "article"
        );

    card.classList.add(
        "admin-reserva-card"
    );


    /* =====================================
       TOPO
    ===================================== */

    const topo =
        document.createElement(
            "div"
        );

    topo.classList.add(
        "admin-reserva-topo"
    );


    const cliente =
        document.createElement(
            "div"
        );


    const nome =
        document.createElement(
            "h3"
        );

    nome.textContent =
        reserva.nome ||
        "Cliente C3";


    const email =
        document.createElement(
            "p"
        );

    email.textContent =
        reserva.email ||
        "E-mail não informado";


    cliente.append(
        nome,
        email
    );


    /* STATUS */

    const status =
        document.createElement(
            "span"
        );

    status.classList.add(
        "admin-reserva-status",
        reserva.status ||
            "pendente"
    );

    status.textContent =
        formatarStatus(
            reserva.status
        );


    topo.append(
        cliente,
        status
    );


    /* =====================================
       INFORMAÇÕES
    ===================================== */

    const infos =
        document.createElement(
            "div"
        );

    infos.classList.add(
        "admin-reserva-infos"
    );


    const dados = [
        {
            label:
                "DATA",

            valor:
                formatarData(
                    reserva.data
                )
        },

        {
            label:
                "HORÁRIO",

            valor:
                reserva.horario ||
                "--:--"
        },

        {
            label:
                "PESSOAS",

            valor:
                String(
                    reserva.pessoas ||
                    0
                )
        }
    ];


    dados.forEach(
        (dado) => {

            const item =
                document.createElement(
                    "div"
                );

            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                dado.label;


            const valor =
                document.createElement(
                    "strong"
                );

            valor.textContent =
                dado.valor;


            item.append(
                label,
                valor
            );

            infos.appendChild(
                item
            );
        }
    );


    card.append(
        topo,
        infos
    );


    /* =====================================
       OBSERVAÇÕES
    ===================================== */

    if (reserva.observacoes) {

        const observacoes =
            document.createElement(
                "div"
            );

        observacoes.classList.add(
            "admin-reserva-observacoes"
        );


        const titulo =
            document.createElement(
                "span"
            );

        titulo.textContent =
            "OBSERVAÇÕES";


        const texto =
            document.createElement(
                "p"
            );

        texto.textContent =
            reserva.observacoes;


        observacoes.append(
            titulo,
            texto
        );

        card.appendChild(
            observacoes
        );
    }


    /* =====================================
       AÇÕES
    ===================================== */

    const acoes =
        document.createElement(
            "div"
        );

    acoes.classList.add(
        "admin-reserva-acoes"
    );


    /* CONFIRMAR */

    if (
        reserva.status !==
            "confirmada" &&
        reserva.status !==
            "cancelada"
    ) {

        const confirmar =
            criarBotao(
                "Confirmar",
                "confirmar",
                async () => {

                    await alterarStatus(
                        reserva.id,
                        "confirmada"
                    );
                }
            );

        acoes.appendChild(
            confirmar
        );
    }


    /* CANCELAR */

    if (
        reserva.status !==
        "cancelada"
    ) {

        const cancelar =
            criarBotao(
                "Cancelar",
                "cancelar",
                async () => {

                    const confirmou =
                        window.confirm(
                            "Deseja cancelar esta reserva?"
                        );

                    if (!confirmou) {
                        return;
                    }

                    await alterarStatus(
                        reserva.id,
                        "cancelada"
                    );
                }
            );

        acoes.appendChild(
            cancelar
        );
    }


    /* =====================================
       APAGAR
    ===================================== */

    const apagar =
        criarBotao(
            "Apagar",
            "apagar",
            async () => {

                await apagarReserva(
                    reserva.id
                );
            }
        );

    acoes.appendChild(
        apagar
    );


    /* ADICIONAR AÇÕES */

    if (
        acoes.children.length > 0
    ) {

        card.appendChild(
            acoes
        );
    }


    return card;
}


/* =========================================
   ESTATÍSTICAS
========================================= */

function atualizarEstatisticas(
    reservas
) {

    const pendentes =
        reservas.filter(
            (reserva) =>
                !reserva.status ||
                reserva.status ===
                    "pendente"
        ).length;


    const confirmadas =
        reservas.filter(
            (reserva) =>
                reserva.status ===
                    "confirmada"
        ).length;


    const canceladas =
        reservas.filter(
            (reserva) =>
                reserva.status ===
                    "cancelada"
        ).length;


    if (totalElemento) {

        totalElemento.textContent =
            reservas.length;
    }


    if (pendentesElemento) {

        pendentesElemento.textContent =
            pendentes;
    }


    if (confirmadasElemento) {

        confirmadasElemento.textContent =
            confirmadas;
    }


    if (canceladasElemento) {

        canceladasElemento.textContent =
            canceladas;
    }
}


/* =========================================
   RENDERIZAR RESERVAS
========================================= */

function renderizarReservas(
    elemento,
    reservas,
    textoVazio
) {

    if (!elemento) {
        return;
    }


    elemento.innerHTML =
        "";


    if (
        reservas.length === 0
    ) {

        const vazio =
            document.createElement(
                "div"
            );

        vazio.classList.add(
            "admin-vazio"
        );

        vazio.textContent =
            textoVazio;

        elemento.appendChild(
            vazio
        );

        return;
    }


    reservas.forEach(
        (reserva) => {

            elemento.appendChild(
                criarCardReserva(
                    reserva
                )
            );
        }
    );
}


/* =========================================
   CARREGAR RESERVAS
========================================= */

async function carregarReservas() {

    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "reservas"
                )
            );


        const reservas =
            [];


        resultado.forEach(
            (documento) => {

                reservas.push({
                    id:
                        documento.id,

                    ...documento.data()
                });
            }
        );


        /* ESTATÍSTICAS */

        atualizarEstatisticas(
            reservas
        );


        const hoje =
            dataLocalISO();


        /* =====================================
           RESERVAS DE HOJE
        ===================================== */

        const reservasHoje =
            reservas.filter(
                (reserva) =>
                    reserva.data ===
                    hoje
            );


        reservasHoje.sort(
            (a, b) => {

                const horarioA =
                    a.horario || "";

                const horarioB =
                    b.horario || "";

                return (
                    horarioA.localeCompare(
                        horarioB
                    )
                );
            }
        );


        /* =====================================
           PRÓXIMAS RESERVAS

           Canceladas NÃO aparecem aqui.
        ===================================== */

        const reservasProximas =
            reservas.filter(
                (reserva) =>
                    reserva.data &&
                    reserva.data > hoje &&
                    reserva.status !==
                        "cancelada"
            );


        reservasProximas.sort(
            (a, b) => {

                const reservaA =
                    `${a.data || ""} ${a.horario || ""}`;

                const reservaB =
                    `${b.data || ""} ${b.horario || ""}`;

                return (
                    reservaA.localeCompare(
                        reservaB
                    )
                );
            }
        );


        /* =====================================
           HISTÓRICO

           - reservas anteriores a hoje
           - reservas futuras canceladas
        ===================================== */

        const reservasAntigas =
            reservas.filter(
                (reserva) => {

                    if (!reserva.data) {
                        return false;
                    }


                    const passou =
                        reserva.data <
                        hoje;


                    const futuraCancelada =
                        reserva.data >
                            hoje &&
                        reserva.status ===
                            "cancelada";


                    return (
                        passou ||
                        futuraCancelada
                    );
                }
            );


        reservasAntigas.sort(
            (a, b) => {

                const reservaA =
                    `${a.data || ""} ${a.horario || ""}`;

                const reservaB =
                    `${b.data || ""} ${b.horario || ""}`;

                return (
                    reservaB.localeCompare(
                        reservaA
                    )
                );
            }
        );


        /* =====================================
           MOSTRAR
        ===================================== */

        renderizarReservas(
            listaReservas,
            reservasHoje,
            "Nenhuma reserva para hoje."
        );


        renderizarReservas(
            listaReservasProximas,
            reservasProximas,
            "Nenhuma reserva para os próximos dias."
        );


        renderizarReservas(
            listaReservasAntigas,
            reservasAntigas,
            "Nenhuma reserva no histórico."
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );


        if (listaReservas) {

            listaReservas.innerHTML =
                `
                    <div class="admin-erro">
                        Não foi possível carregar as reservas.
                    </div>
                `;
        }


        if (
            listaReservasProximas
        ) {

            listaReservasProximas.innerHTML =
                `
                    <div class="admin-erro">
                        Não foi possível carregar as próximas reservas.
                    </div>
                `;
        }


        if (
            listaReservasAntigas
        ) {

            listaReservasAntigas.innerHTML =
                `
                    <div class="admin-erro">
                        Não foi possível carregar o histórico.
                    </div>
                `;
        }
    }
}


/* =========================================
   CARD DE MENSAGEM
========================================= */

function criarCardMensagem(
    mensagem
) {

    const card =
        document.createElement(
            "article"
        );

    card.classList.add(
        "admin-mensagem-card"
    );


    /* TOPO */

    const topo =
        document.createElement(
            "div"
        );

    topo.classList.add(
        "admin-mensagem-topo"
    );


    const usuario =
        document.createElement(
            "div"
        );


    const nome =
        document.createElement(
            "h3"
        );

    nome.textContent =
        mensagem.nome ||
        "Visitante";


    const email =
        document.createElement(
            "p"
        );

    email.textContent =
        mensagem.email ||
        "E-mail não informado";


    usuario.append(
        nome,
        email
    );


    const tipo =
        document.createElement(
            "span"
        );

    tipo.classList.add(
        "admin-mensagem-nova"
    );

    tipo.textContent =
        "MENSAGEM";


    topo.append(
        usuario,
        tipo
    );


    /* ASSUNTO */

    const assunto =
        document.createElement(
            "div"
        );

    assunto.classList.add(
        "admin-mensagem-assunto"
    );


    const assuntoLabel =
        document.createElement(
            "span"
        );

    assuntoLabel.textContent =
        "ASSUNTO";


    const assuntoTexto =
        document.createElement(
            "strong"
        );

    assuntoTexto.textContent =
        mensagem.assunto ||
        "Sem assunto";


    assunto.append(
        assuntoLabel,
        assuntoTexto
    );


    /* CORPO */

    const corpo =
        document.createElement(
            "div"
        );

    corpo.classList.add(
        "admin-mensagem-corpo"
    );


    const texto =
        document.createElement(
            "p"
        );

    texto.textContent =
        mensagem.mensagem ||
        "Mensagem vazia.";


    corpo.appendChild(
        texto
    );


    card.append(
        topo,
        assunto,
        corpo
    );


    return card;
}


/* =========================================
   CARREGAR MENSAGENS
========================================= */

async function carregarMensagens() {

    if (!listaMensagens) {
        return;
    }


    listaMensagens.innerHTML =
        `
            <div class="admin-reservas-loading">
                Carregando mensagens...
            </div>
        `;


    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "mensagens"
                )
            );


        const mensagens =
            [];


        resultado.forEach(
            (documento) => {

                mensagens.push({
                    id:
                        documento.id,

                    ...documento.data()
                });
            }
        );


        /* NOVAS PRIMEIRO */

        mensagens.sort(
            (a, b) => {

                return (
                    timestampParaNumero(
                        b.criadoEm
                    ) -
                    timestampParaNumero(
                        a.criadoEm
                    )
                );
            }
        );


        listaMensagens.innerHTML =
            "";


        if (
            mensagens.length === 0
        ) {

            const vazio =
                document.createElement(
                    "div"
                );

            vazio.classList.add(
                "admin-vazio"
            );

            vazio.textContent =
                "Nenhuma mensagem recebida.";

            listaMensagens.appendChild(
                vazio
            );

            return;
        }


        mensagens.forEach(
            (mensagem) => {

                listaMensagens.appendChild(
                    criarCardMensagem(
                        mensagem
                    )
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar mensagens:",
            erro
        );


        listaMensagens.innerHTML =
            `
                <div class="admin-erro">
                    Não foi possível carregar as mensagens.
                </div>
            `;
    }
}


/* =========================================
   REGISTRAR VISUALIZAÇÃO
========================================= */

function registrarVisualizacaoAdmin() {

    localStorage.setItem(
        "c3_admin_ultima_visualizacao",
        String(
            Date.now()
        )
    );
}


/* =========================================
   VERIFICAR ADMIN
========================================= */

async function verificarAdmin(
    user
) {

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


        /* NÃO É ADMIN */

        if (
            !resultado.exists() ||
            resultado.data().admin !==
                true
        ) {

            if (loading) {
                loading.hidden = true;
            }

            if (negado) {
                negado.hidden = false;
            }

            if (conteudo) {
                conteudo.hidden = true;
            }

            return;
        }


        /* ADMIN */

        if (loading) {
            loading.hidden = true;
        }

        if (negado) {
            negado.hidden = true;
        }

        if (conteudo) {
            conteudo.hidden = false;
        }


        if (nomeAdmin) {

            nomeAdmin.textContent =
                user.displayName ||
                user.email ||
                "Administrador";
        }


        /* CARREGAR DADOS */

        await Promise.all([
            carregarReservas(),
            carregarMensagens()
        ]);


        registrarVisualizacaoAdmin();


    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );


        if (loading) {
            loading.hidden = true;
        }

        if (negado) {
            negado.hidden = false;
        }

        if (conteudo) {
            conteudo.hidden = true;
        }
    }
}


/* =========================================
   AUTENTICAÇÃO
========================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.replace(
                "./login.html"
            );

            return;
        }


        await verificarAdmin(
            user
        );
    }
);


/* =========================================
   LOGOUT
========================================= */

if (botaoSair) {

    botaoSair.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                window.location.replace(
                    "../index.html"
                );


            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );
            }
        }
    );
}