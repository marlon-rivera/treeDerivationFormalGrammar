/*Componentes de la grámatica*/
let alphabet = [] /*Alfabeto*/
let variables = [] /*Simbolos no terminales*/
let productions = [] /*Producciones*/
let axiomaticSymbol = ""; /*Simbolo inicial axiomatico*/

/*Verifica si la gramática es válida, es decir, si ningún símbolo terminal es también un símbolo no terminal. 
Recorre el alfabeto y verifica si cada símbolo 
está en la lista de símbolos no terminales.*/
const checkGrammar = () => {
    for (let i = 0; i < alphabet.length; i++) {
        if (variables.includes(alphabet[i])) {
            return false
        }
    }
    return true
}
/*verifica si una producción dada es válida. Comprueba si la variable de la producción está en la lista de 
símbolos no terminales y si la cadena de la producción contiene como máximo una variable.*/ 
const checkProduction = (production) => {
    if (!variables.includes(production.key)) return false
    let countVariables = 0;
    for (let i = 0; i < production.value.length; i++) {
        if (!alphabet.includes(production.value[i])) {
            if (!variables.includes(production.value[i])) {
                return false
            } else {
                countVariables++;
            }
        }
    }
    return !countVariables > 1
}

/* Obtiene la clave de producción para un nodo dado*/

const getKeyProduction = (nodeName) => {
    for (let i = 0; i < nodeName.length; i++) {
        if (variables.includes(nodeName[i])) {
            return nodeName[i]
        }
    }
}
/*Obtiene todas las producciones para una clave de producción dada. Filtra la lista de 
producciones para obtener solo las producciones con la clave dada.*/
const getProductionsByKey = (key) => {
    return productions.filter(prod => prod.key == key)
}

/*Crea un árbol de derivación general*/
let treeData = {}
const createGeneralDerivationTree = () => {
    treeData = {
        name: axiomaticSymbol,
        children: [],
        value: 0
    }
    treeData.children = generateChildren(treeData.children, treeData.value, treeData.name)
}
/*Agrega producciones terminales a los hijos de un nodo en el árbol de derivación. 
Itera sobre las producciones y agrega un nuevo hijo al árbol si la producción no contiene símbolos no terminales.*/
const addProductionsTerminalsToChildren = (childrenTree, productions, key, producer, value) => {
    productions.forEach(prod => {
        if (prod.value.split("").every(p => !variables.includes(p))) childrenTree.push({
            name: producer.replace(key, prod.value),
            children: [],
            value: value + 1

        })
    })
}
/*Agrega producciones no terminales a los hijos de un nodo en el árbol de derivación. 
Itera sobre las producciones y agrega un nuevo hijo al árbol 
si la producción contiene al menos un símbolo no terminal.*/
const addProductionsNotTerminalsToChildren = (childrenTree, productions, key, producer, value) => {
    productions.forEach(prod => {
        if (prod.value.split("").some(p => variables.includes(p))) childrenTree.push({
            name: producer.replace(key, prod.value),
            children: [],
            value: value + 1
        })
    })
}
/*Genera los hijos de un nodo en el árbol de derivación. Obtiene la clave de producción para el nodo actual, 
obtiene las producciones correspondientes a esa clave y llama a addProductionsTerminalsToChildren y 
addProductionsNotTerminalsToChildren para agregar los hijos correspondientes.*/ 
const generateChildren = (childrenTree, value, producer) => {
    if (value === 6) return childrenTree
    const key = getKeyProduction(producer)
    const productionsByKey = getProductionsByKey(key)
    addProductionsTerminalsToChildren(childrenTree, productionsByKey, key, producer, value)
    addProductionsNotTerminalsToChildren(childrenTree, productionsByKey, key, producer, value)
    for (let i = 0; i < childrenTree.length; i++) {
        let letters = childrenTree[i].name.split("")
        let producer = ""
        letters.some(l => {
            if (variables.includes(l)) {
                producer = l
                return true
            }
            return false
        })
        if (producer != "") generateChildren(childrenTree[i].children, childrenTree[i].value, childrenTree[i].name)
    }
    return childrenTree
}


/*Esta funcion verifica si una palabra dada puede ser derivada por la gramática*/
const checkWord = (word) => {
    const steps = []
    let flag = searchWord(axiomaticSymbol, word, steps)
    if (flag) {
        const positions = []
        steps.forEach(step => {
            positions.push(searchProductionPosition(step.prod))
        })
        return { flag, steps, positions }
    }
    return { flag }
}
/*Busca la posición de una producción en la lista de producciones.*/
const searchProductionPosition = (prod) => {
    for (let i = 0; i < productions.length; i++) {
        if (prod.key === productions[i].key && prod.value === productions[i].value) {
            return i + 1
        }
    }
    return -1
}
/* Funcion para buscar una palabra en el árbol de derivación,
Obtiene la clave de producción para el nodo actual, obtiene las producciones 
correspondientes a esa clave y recursivamente busca la palabra en los hijos de ese nodo.*/
const searchWord = (production, word, steps) => {
    let key = getKeyProduction(production)
    if (!key) {
        if (word === production) {
            return true
        }
        return false
    }
    let productionsByKey = getProductionsByKey(key)
    let flag = false
    for (let i = 0; i < productionsByKey.length; i++) {
        steps.push({ prod: productionsByKey[i], name: production.replace(key, productionsByKey[i].value) })
        if (production.replace(key, productionsByKey[i].value).length > word.length) { steps.pop(); continue }
        if (productionsByKey[i].value === word) { flag = true; break }
        flag = searchWord(production.replace(key, productionsByKey[i].value), word, steps)
        if (flag) break
        steps.pop()
    }
    return flag
}

// HTML

const getAndCheckGrammar = (e) => {
    alphabet = document.getElementById("alphabet").value.split(",")
    variables = document.getElementById("nt").value.split(",")
    axiomaticSymbol = document.getElementById("axiomatic").value
    if (alphabet.length === 0 || variables.length === 0 || axiomaticSymbol.length === 0) {
        let errorText = document.getElementById("errorText")
        errorText.innerHTML = "Rellene los campos necesarios por favor!."
        let error = document.getElementById("error")
        error.style.display = "flex"
    } else {
        if (checkGrammar()) {
            if (variables.includes(axiomaticSymbol)) {
                document.getElementById("grammar").style.display = "none"
                document.getElementById("options").style.display = "flex"
            } else {
                let errorText = document.getElementById("errorText")
                errorText.innerHTML = "El simbolo inicial axiomatico debe pertenecer a las variables."
                let error = document.getElementById("error")
                error.style.display = "flex"
            }
        } else {
            let errorText = document.getElementById("errorText")
            errorText.innerHTML = "Los conjuntos de alfabeto y variables no son disyuntos."
            let error = document.getElementById("error")
            error.style.display = "flex"
        }
    }
}

const getAndCheckProduction = (e) => {
    const key = document.getElementById("producer").value
    const value = document.getElementById("produced").value
    if (key !== "" && value !== "") {
        let flag = true
        for (let i = 0; i < productions.length; i++) {

            if (key == productions[i].key && value == productions[i].value) {

                let errorText = document.getElementById("errorText")
                errorText.innerHTML = "Esa produccion ya existe, ingrese otra."
                let error = document.getElementById("error")
                error.style.display = "flex"
                flag = false
                break
            }

        }
        if (flag) {

            productions.push({ key, value })
            const productionsDiv = document.getElementById("productions")
            productionsDiv.innerHTML = ""
            let divGeneral = document.createElement("div")
            divGeneral.style.width = "80%"
            divGeneral.style.height = "50%"
            divGeneral.style.display = "flex"
            divGeneral.style.flexFlow = "column"
            divGeneral.style.justifyContent = "center"
            divGeneral.style.alignItems = "center"
            divGeneral.style.overflow = "auto"
            divGeneral.style.gap = "1.25rem"
            for (let i = 0; i < productions.length; i++) {

                let divContent = document.createElement("div")
                divContent.style.background = "#25788A"
                divContent.style.width = "200px"
                divContent.style.height = "50px"
                divContent.style.borderRadius = "4px"
                divContent.style.display = "flex"
                divContent.style.justifyContent = "end"


                let divText = document.createElement("div")
                divText.style.color = "white"
                divText.style.display = "flex"
                divText.innerHTML = `${productions[i].key}   <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-right"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /><path d="M13 18l6 -6" /><path d="M13 6l6 6" /></svg>   ${productions[i].value}`
                divText.style.justifyContent = "center"
                divText.style.width = "100%"
                divText.style.alignItems = "center"
                divContent.appendChild(divText)

                divGeneral.appendChild(divContent)

                let divCross = document.createElement("div")
                divCross.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`
                divCross.style.width = "10%"
                divCross.style.cursor = "pointer"
                divCross.style.display = "flex"
                divCross.style.justifyContent = "end"
                divCross.addEventListener("click", (e) => {
                    productions.splice(i, 1)
                    divGeneral.removeChild(divContent)
                })

                divContent.appendChild(divCross)
            }

            productionsDiv.appendChild(divGeneral)
        }
    } else {
        let errorText = document.getElementById("errorText")
        errorText.innerHTML = "Rellene los campos necesarios."
        let error = document.getElementById("error")
        error.style.display = "flex"
    }
}

const getWordAndCheck = () => {
    let word = document.getElementById("word").value
    if (word != "") {
        let data = checkWord(word)
        document.getElementById("formWord").style.display = "none"
        document.getElementById("treeParticular").innerHTML = ""
        if (data.flag) {
            let divContent = document.createElement("div")
            divContent.style.display = "flex"
            divContent.style.width = "100%"
            divContent.style.overflowX = "auto"
            divContent.style.overflowY = "hidden"
            divContent.style.justifyContent = "center"
            divContent.style.alignItems = "center"
            for (let i = 0; i < data.steps.length; i++) {
                let divContentProduction = document.createElement("div")
                divContentProduction.innerText = data.steps[i].name
                divContentProduction.style.color = "white"
                divContentProduction.style.marginBottom = "-25px"
                divContentProduction.style.display = "flex"
                divContentProduction.style.alignItems = "center"
                divContentProduction.style.marginRight = "15px"
                divContentProduction.style.marginLeft = "15px"

                divContent.appendChild(divContentProduction)
                if (i != data.steps.length) {
                    let divArrow = document.createElement("div")
                    divArrow.innerHTML = `<div style="display:flex; justify-content:center; flex-direction: column; align-items:center; background:#15151A;">
                    <p style="color:white; font-size:20px; margin:0;">${data.positions[i]}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" x="0" y="0" viewBox="0 0 512.009 512.009" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M508.625 247.801 392.262 131.437c-4.18-4.881-11.526-5.45-16.407-1.269-4.881 4.18-5.45 11.526-1.269 16.407.39.455.814.88 1.269 1.269l96.465 96.582H11.636C5.21 244.426 0 249.636 0 256.063s5.21 11.636 11.636 11.636H472.32l-96.465 96.465c-4.881 4.18-5.45 11.526-1.269 16.407s11.526 5.45 16.407 1.269c.455-.39.88-.814 1.269-1.269l116.364-116.364c4.511-4.537 4.511-11.867-.001-16.406z" fill="#3AD0EB" opacity="1" data-original="#000000" class=""></path></g></svg>
                </div>`
                    divContent.appendChild(divArrow)
                }

            }
            let divRelation = document.createElement("p")
            divRelation.innerText = "w₁ ∈ L(G₁)"
            divRelation.style.color = "white"
            divRelation.style.fontSize = "30px"
            document.getElementById("treeParticular").style.display = "flex"
            document.getElementById("treeParticular").appendChild(divContent)
            document.getElementById("treeParticular").appendChild(divRelation)

        } else {
            let divRelation = document.createElement("p")
            divRelation.innerText = "w₁ ∉ L(G₁)"
            divRelation.style.color = "white"
            divRelation.style.fontSize = "20px"
            document.getElementById("treeParticular").style.display = "flex"
            document.getElementById("treeParticular").appendChild(divRelation)
        }
    }
}

const hide = (e) => {
    e.target.parentNode.style.display = "none"
}

const hideOptions = () => {
    document.getElementById("options").style.display = "none"
}

const showOptions = () => {
    document.getElementById("options").style.display = "flex"
}

const hideProductionsPage = () => {
    document.getElementById("productionsPage").style.display = "none"
}

const showProductionsPage = () => {
    document.getElementById("productionsPage").style.display = "flex"
}

const showTree = () => {
    document.getElementById("treeContainer").style.display = "flex"
}

const hideTree = () => {
    document.getElementById("treeContainer").style.display = "none"
}

const showTreeParticular = () => {
    document.getElementById("formWord").style.display = "flex"
    document.getElementById("treeParticularContainer").style.display = "flex"
}

const hideTreeParticular = () => {
    document.getElementById("treeParticular").style.display = "none"
    document.getElementById("formWord").style.display = "none"
    document.getElementById("treeParticularContainer").style.display = "none"
}

const generateTree = () => {
    createGeneralDerivationTree()
    am5.ready(function () {

        var root = am5.Root.new("tree");
        root.setThemes([
            am5themes_Animated.new(root)
        ]);
        var zoomableContainer = root.container.children.push(
            am5.ZoomableContainer.new(root, {
                width: am5.p100,
                height: am5.p100,
                wheelable: true,
                pinchZoom: true
            })
        );

        var zoomTools = zoomableContainer.children.push(am5.ZoomTools.new(root, {
            target: zoomableContainer
        }));

        var series = zoomableContainer.contents.children.push(am5hierarchy.Tree.new(root, {
            singleBranchOnly: false,
            downDepth: 1,
            initialDepth: 10,
            valueField: "value",
            categoryField: "name",
            childDataField: "children"
        }));

        series.labels.template.set("minScale", 0);

        series.data.setAll([treeData]);
        series.set("selectedDataItem", series.dataItems[0]);
        series.appear(1000, 100);
    });
    hideOptions();
    showTree();
}