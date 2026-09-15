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
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    auth,
    db
} from "./firebase.js";


/* =====================================
   ELEMENTOS
===================================== */

const loading =
    document.querySelector("#admin-loading");

const negado =
    document.querySelector("#admin-negado");

const conteudo =
    document.querySelector("#admin-conteudo");

const nomeAdmin =
    document.querySelector("#admin-nome");

const listaReservas =
    document.querySelector("#admin-reservas");

const totalElemento =
    document.querySelector("#admin-total");

const pendentesElemento =
    document.querySelector("#admin-pendentes");

const confirmadasElemento =
    document.querySelector("#admin-confirmadas");

const canceladasElemento =
    document.querySelector("#admin-canceladas");

const botaoSair =
    document.querySelector("#admin-sair");


/* =====================================
   DATA
===================================== */

function formatarData(data) {

    if (!data) {
        return "Data não informada";
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* =====================================
   STATUS
===================================== */

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


/* =====================================
   ALTERAR STATUS
===================================== */

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


/* =====================================
   CRIAR BOTÃO
===================================== */

function criarBotao(
    texto,
    classe,
    funcao
) {

    const botao =
        document.createElement("button");

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


/* =====================================
   CARD DA RESERVA
===================================== */

function criarCardReserva(reserva) {

    const card =
        document.createElement("article");

    card.classList.add(
        "admin-reserva-card"
    );


    /* TOPO */

    const topo =
        document.createElement("div");

    topo.classList.add(
        "admin-reserva-topo"
    );


    const cliente =
        document.createElement("div");


    const nome =
        document.createElement("h3");

    nome.textContent =
        reserva.nome ||
        "Cliente C3";


    const email =
        document.createElement("p");

    email.textContent =
        reserva.email ||
        "E-mail não informado";


    cliente.append(
        nome,
        email
    );


    const status =
        document.createElement("span");

    status.classList.add(
        "admin-reserva-status",
        reserva.status || "pendente"
    );

    status.textContent =
        formatarStatus(
            reserva.status
        );


    topo.append(
        cliente,
        status
    );


    /* INFORMAÇÕES */

    const infos =
        document.createElement("div");

    infos.classList.add(
        "admin-reserva-infos"
    );


    const dados = [
        {
            label: "DATA",
            valor:
                formatarData(
                    reserva.data
                )
        },

        {
            label: "HORÁRIO",
            valor:
                reserva.horario ||
                "--:--"
        },

        {
            label: "PESSOAS",
            valor:
                String(
                    reserva.pessoas || 0
                )
        }
    ];


    dados.forEach(
        (dado) => {

            const item =
                document.createElement("div");

            const label =
                document.createElement("span");

            label.textContent =
                dado.label;


            const valor =
                document.createElement("strong");

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


    /* OBSERVAÇÕES */

    if (reserva.observacoes) {

        const observacoes =
            document.createElement("div");

        observacoes.classList.add(
            "admin-reserva-observacoes"
        );


        const titulo =
            document.createElement("span");

        titulo.textContent =
            "OBSERVAÇÕES";


        const texto =
            document.createElement("p");

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


    /* BOTÕES */

    const acoes =
        document.createElement("div");

    acoes.classList.add(
        "admin-reserva-acoes"
    );


    if (
        reserva.status !==
        "confirmada"
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


    if (
        reserva.status !==
        "cancelada"
    ) {

        const cancelar =
            criarBotao(
                "Cancelar",
                "cancelar",
                async () => {

                    const confirmar =
                        window.confirm(
                            "Deseja cancelar esta reserva?"
                        );

                    if (!confirmar) {
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


    card.appendChild(
        acoes
    );


    return card;
}


/* =====================================
   ESTATÍSTICAS
===================================== */

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


    totalElemento.textContent =
        reservas.length;

    pendentesElemento.textContent =
        pendentes;

    confirmadasElemento.textContent =
        confirmadas;

    canceladasElemento.textContent =
        canceladas;
}


/* =====================================
   CARREGAR RESERVAS
===================================== */

async function carregarReservas() {

    if (!listaReservas) {
        return;
    }


    listaReservas.innerHTML =
        `
            <div class="admin-reservas-loading">
                Carregando reservas...
            </div>
        `;


    try {

        const resultado =
            await getDocs(
                collection(
                    db,
                    "reservas"
                )
            );


        const reservas = [];


        resultado.forEach(
            (documento) => {

                reservas.push({
                    id:
                        documento.id,

                    ...documento.data()
                });
            }
        );


        reservas.sort(
            (a, b) => {

                const reservaA =
                    `${a.data || ""} ${a.horario || ""}`;

                const reservaB =
                    `${b.data || ""} ${b.horario || ""}`;

                return reservaB.localeCompare(
                    reservaA
                );
            }
        );


        atualizarEstatisticas(
            reservas
        );


        listaReservas.innerHTML =
            "";


        if (
            reservas.length === 0
        ) {

            const vazio =
                document.createElement("div");

            vazio.classList.add(
                "admin-vazio"
            );

            vazio.textContent =
                "Nenhuma reserva encontrada.";

            listaReservas.appendChild(
                vazio
            );

            return;
        }


        reservas.forEach(
            (reserva) => {

                listaReservas.appendChild(
                    criarCardReserva(
                        reserva
                    )
                );
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );


        listaReservas.innerHTML =
            `
                <div class="admin-erro">
                    Não foi possível carregar as reservas.
                </div>
            `;
    }
}


/* =====================================
   VERIFICAR ADMIN
===================================== */

async function verificarAdmin(user) {

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


        if (
            !resultado.exists() ||
            resultado.data().admin !== true
        ) {

            loading.hidden =
                true;

            negado.hidden =
                false;

            conteudo.hidden =
                true;

            return;
        }


        /* ADMIN AUTORIZADO */

        loading.hidden =
            true;

        negado.hidden =
            true;

        conteudo.hidden =
            false;


        if (nomeAdmin) {

            nomeAdmin.textContent =
                user.displayName ||
                user.email ||
                "Administrador";
        }


        await carregarReservas();

    } catch (erro) {

        console.error(
            "Erro ao verificar administrador:",
            erro
        );


        loading.hidden =
            true;

        negado.hidden =
            false;
    }
}


/* =====================================
   AUTENTICAÇÃO
===================================== */

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


/* =====================================
   LOGOUT
===================================== */

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