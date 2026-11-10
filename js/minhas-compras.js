import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const lista = document.querySelector("#minhas-compras-lista");

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(timestamp) {
    if (!timestamp) return "Data não informada";

    const data = typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    if (Number.isNaN(data.getTime())) return "Data não informada";

    return data.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function normalizarStatus(status) {
    const valor = String(status || "pendente").toLowerCase();

    if (["concluido", "concluído", "entregue", "finalizado"].includes(valor)) {
        return { texto: "Concluído", classe: "concluido" };
    }

    if (["cancelado", "cancelada", "recusado", "recusada"].includes(valor)) {
        return { texto: "Cancelado", classe: "cancelado" };
    }

    const nomes = {
        pendente: "Em análise",
        em_analise: "Em análise",
        analise: "Em análise",
        aprovado: "Aprovado",
        preparando: "Em preparação",
        enviado: "Enviado"
    };

    return {
        texto: nomes[valor] || (status || "Em análise"),
        classe: ""
    };
}

function criarCompra(pedido) {
    const card = document.createElement("article");
    card.className = "compra-card";

    const topo = document.createElement("div");
    topo.className = "compra-card-topo";

    const identificacao = document.createElement("div");

    const numero = document.createElement("div");
    numero.className = "compra-card-numero";
    numero.textContent = "PEDIDO #" + pedido.id.slice(-8).toUpperCase();

    const data = document.createElement("div");
    data.className = "compra-card-data";
    data.textContent = formatarData(pedido.criadoEm);

    identificacao.append(numero, data);

    const status = normalizarStatus(pedido.status);
    const etiqueta = document.createElement("span");
    etiqueta.className = "compra-card-status " + status.classe;
    etiqueta.textContent = status.texto;

    topo.append(identificacao, etiqueta);

    const itens = document.createElement("div");
    itens.className = "compra-card-itens";

    (Array.isArray(pedido.itens) ? pedido.itens : []).forEach(item => {
        const linha = document.createElement("div");
        linha.className = "compra-card-item";

        const nome = document.createElement("span");
        nome.textContent = (item.quantidade || 1) + "x " + (item.nome || "Item");

        const subtotal = document.createElement("strong");
        subtotal.textContent = formatarPreco(
            item.subtotal ?? (Number(item.preco || 0) * Number(item.quantidade || 1))
        );

        linha.append(nome, subtotal);
        itens.appendChild(linha);
    });

    if (!pedido.itens || pedido.itens.length === 0) {
        const vazio = document.createElement("p");
        vazio.textContent = "Os itens deste pedido não estão disponíveis.";
        itens.appendChild(vazio);
    }

    const rodape = document.createElement("div");
    rodape.className = "compra-card-rodape";

    const total = document.createElement("div");
    total.className = "compra-card-total";
    total.append("TOTAL");

    const valor = document.createElement("strong");
    valor.textContent = formatarPreco(pedido.total);
    total.appendChild(valor);

    rodape.appendChild(total);

    card.append(topo, itens);

    if (pedido.observacao) {
        const observacao = document.createElement("p");
        observacao.className = "compra-card-observacao";
        observacao.textContent = "Observação: " + pedido.observacao;
        card.appendChild(observacao);
    }

    card.appendChild(rodape);
    return card;
}

function mostrarEstado(titulo, texto) {
    lista.innerHTML = "";

    const estado = document.createElement("div");
    estado.className = "minhas-compras-estado";

    const destaque = document.createElement("strong");
    destaque.textContent = titulo;

    const descricao = document.createElement("p");
    descricao.textContent = texto;

    estado.append(destaque, descricao);
    lista.appendChild(estado);
}

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.replace("./login.html");
        return;
    }

    const consulta = query(
        collection(db, "pedidos"),
        where("uid", "==", user.uid)
    );

    onSnapshot(
        consulta,
        snapshot => {
            const pedidos = [];

            snapshot.forEach(documento => {
                pedidos.push({
                    id: documento.id,
                    ...documento.data()
                });
            });

            pedidos.sort((a, b) => {
                const dataA = a.criadoEm?.toMillis?.() || 0;
                const dataB = b.criadoEm?.toMillis?.() || 0;
                return dataB - dataA;
            });

            lista.innerHTML = "";

            if (pedidos.length === 0) {
                mostrarEstado(
                    "Você ainda não tem compras.",
                    "Quando houver pedidos registrados na sua conta, eles aparecerão aqui."
                );
                return;
            }

            pedidos.forEach(pedido => {
                lista.appendChild(criarCompra(pedido));
            });
        },
        erro => {
            console.error("Erro ao carregar compras:", erro);
            mostrarEstado(
                "Não foi possível carregar seu histórico.",
                "Atualize a página. Se o problema continuar, verifique sua conexão ou as permissões da conta."
            );
        }
    );
});
