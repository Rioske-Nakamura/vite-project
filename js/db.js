import { openDB } from "idb";

let db;

async function CreateDB() {
    try {
        db = await openDB("Banco", 1, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    const store = db.createObjectStore("pessoas", {
                        keyPath: "nome"
                    });
                    store.createIndex("id", "id", { unique: false });
                }
            }
        });
        showResult("Banco de dados criado ou aberto com sucesso!");
    } catch (err) {
        showResult("Erro ao criar/abrir o banco de dados: " + err);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await CreateDB();

    document.getElementById("btnSalvar").addEventListener("click", addData);
    document.getElementById("btnListar").addEventListener("click", getData);
});

async function addData() {
    const nomeInput = document.getElementById("nome");
    const nome = nomeInput.value.trim();
    const idadeInput = document.getElementById("idade")
    const idade = idadeInput.value.trim();

    if (!nome || !idade) {
        showResult("O campo 'nome' ou 'idade' não pode estar vazio.");
        return;
    }

    try {
        const tx = db.transaction("pessoas", "readwrite");
        const store = tx.objectStore("pessoas");

        await store.add({ nome: nome, id: Date.now(), idade: idade });
        await tx.done;

        showResult(`Registro adicionado: ${nome}, ${idade}`);
        nomeInput.value = ""; 
        idadeInput.value = ""; 
    } catch (err) {
        showResult("Erro ao adicionar registro: " + err);
    }
}

async function getData() {
    if (!db) {
        showResult("Banco de dados não está aberto.");
        return;
    }

    try {
        const tx = db.transaction("pessoas", "readonly");
        const store = tx.objectStore("pessoas");
        const values = await store.getAll();

        if (values.length > 0) {
            renderCards(values);
        } else {
            showResult("Nenhum registro encontrado.");
        }
    } catch (err) {
        showResult("Erro ao listar registros: " + err);
    }
}

async function deleteData(id) {
    if (!db) {
        showResult("Banco de dados não está aberto.");
        return;
    }

    try {
        const tx = db.transaction("pessoas", "readwrite");
        const store = tx.objectStore("pessoas");
        store.delete(id); // Não precisa de await
        await tx.done;

        showResult(`Registro excluído: ${id}`);
    } catch (err) {
        showResult("Erro ao excluir registro: " + err);
    }
}

function renderCards(data) {
    const container = document.getElementById("resultContainer");
    container.innerHTML = ""; 

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        const content = `
            <h3>${item.nome || "Sem nome"}</h3>
            <p><strong>Idade:</strong> ${item.idade || "Não informado"}</p>
            <button class="delete" data-id="${item.id}">Excluir</button>
        `;
        card.innerHTML = content;
        container.appendChild(card);
    });

    
    container.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete")) {
            const id = event.target.getAttribute("data-id");
            deleteData(id);
        }
    });
}



function showResult(msg) {
    const output = document.getElementById("output");
    output.innerHTML = msg;
}
