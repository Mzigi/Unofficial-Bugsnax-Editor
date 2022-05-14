const openReader = new FileReader();

var currentIrr;
var loadingIrr = false
var liToIrr = {}
var parser = new DOMParser();
var currentFileIndex = 0
var files = null
var selectedLiElements = []
var CurrentPropertyType ="Attributes"

var PropertiesInfoExample = {
  "PhysicsObject": {
    "x": {
      "type" : "int",
      "values" : ["136"]
    },
    "achievement": {
      "type" : "enum",
      "values" : ["1","2"],
    }
  }
}

var PropertiesInfo = {}
var RealPropertiesInfo = {}

fetch("https://mzigi.github.io/Unofficial-Bugsnax-Editor/jscontent/RealPropertiesInfo.json")
.then(response => {
   return response.json();
})
.then(temporar => RealPropertiesInfo = temporar);


var childrenNotAdded = []

let keysPressed = {
    "KeyW": false,
    "KeyS": false,
    "KeyA": false,
    "KeyD": false,
    "ControlLeft": false,
    "ControlRight": false,
    "ShiftLeft": false
}

window.addEventListener('keydown', function (e) {
  if (e.code) {
    keysPressed[e.code] = true
  }
})
window.addEventListener('keyup', function (e) {
  if (e.code) {
    keysPressed[e.code] = false
  }
})

//functions for many uses
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function refreshAttributes() {
  if (selectedLiElements.length === 1) {
    selectedNodeElement = irrGetNodeAtPath(selectedLiElements[0].getAttribute("data-internalid"))
    selectedLiElementType = irrGetNodeAtPath(selectedLiElements[0].getAttribute("data-internalid")).getAttribute("type")

    let AllProperties = RealPropertiesInfo[selectedLiElementType]
    
    document.getElementById("Attributes").innerHTML = ""

    Object.keys(AllProperties).forEach(function(key) {
      let keyType = AllProperties[key]["type"]

      let property = document.createElement("div")
      property.classList.add("property")

      let propertyName = document.createElement("div")
      propertyName.classList.add("propertyName")
      propertyName.innerHTML = key
      property.appendChild(propertyName)

      let propertyValue = document.createElement("div")
      propertyValue.classList.add("propertyValue")
      property.appendChild(propertyValue)

      let input = document.createElement("input")
      if (keyType === "int") {
        input.setAttribute("type","number")
        input.setAttribute("step","1")
      } else if (keyType === "bool") {
        input.setAttribute("type","checkbox")
      } else if (keyType === "enum") {
        input.remove()
        input = document.createElement("select")

        let option = document.createElement("option")
        option.setAttribute("value", "null")
        option.innerHTML = "null"
        input.appendChild(option)

        let values = AllProperties[key]["values"]
        for (let i = 0; i < values.length; i += 1) {
          let option = document.createElement("option")
          option.setAttribute("value", values[i])
          option.innerHTML = values[i]
          input.appendChild(option)
        }
      } else if (keyType === "color") {
        input.setAttribute("type", "color")

        let alpha = document.createElement("input")
        alpha.setAttribute("type","color")
        alpha.setAttribute("min","0")
        alpha.setAttribute("max","1")
        alpha.setAttribute("step","0.01")
        alpha.setAttribute("placeholder", "alpha")
      } else if (keyType === "float") {
        input.setAttribute("type", "number")
        input.setAttribute("step", "0.000000001")
      } else if (keyType === "expression") {
        input.setAttribute("placeholder", "@#Cake,Player,!102")
      } else if (keyType === "path") {
        input.setAttribute("placeholder", "Content/Models/Bugs/Apple/Apple.x")
      } else if (keyType === "vector3") {
        input.setAttribute("value","0.0, 0.0, 0.0")
      } else if (keyType === "colorf") {
        input.setAttribute("type", "color")

        let alpha = document.createElement("input")
        alpha.setAttribute("type","color")
        alpha.setAttribute("min","0")
        alpha.setAttribute("max","1")
        alpha.setAttribute("step","0.01")
        alpha.setAttribute("placeholder", "alpha")
      } else {
        input.setAttribute("placeholder", keyType)
      }
      propertyValue.appendChild(input)

      if (selectedNodeElement.querySelector(":scope > attributes")) {
        if (selectedNodeElement.querySelector(keyType + '[name="' + key + '"]')) {
          console.log("success! " + keyType + '[name="' + key + '"]')
          if (keyType !== "enum" && keyType !== "color" && keyType !== "colorf") {
            console.log("final")
            input.setAttribute("value",selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value"))
          }
        } else {
          console.log(keyType + '[name="' + key + '"]')
        }
      } else {
        console.log("HUH?")
      }

      document.getElementById("Attributes").appendChild(property)
    })
  }
}

function refreshProperties() {
  if (CurrentPropertyType === "Attributes") {
    refreshAttributes()
  }
}

//SCENE LIST
var lastSceneListToggler = null;

function updateSceneListEventListenerFunc(e) {
  this.parentElement.querySelector(".nested").classList.toggle("active");
  this.classList.toggle("caret-down");
  if (this.classList.contains("caret-down")) {
    this.innerText = "-";
  } else {
    this.innerText = "+";
  }
}

function updateSceneList() {
  var toggler = document.getElementsByClassName("caretButton");
  lastSceneListToggler = toggler
  console.log("UPDATED")
  var i;
  
  for (i = 0; i < toggler.length; i++) {
    toggler[i].removeEventListener("click", updateSceneListEventListenerFunc);
    toggler[i].addEventListener("click", updateSceneListEventListenerFunc);
  } 
}

function irrGetNodeAtPath(path) {
  if (path === "") {
    return currentIrr.querySelector("irr_scene")
  }

  let simplifiedPath = path.split(":")

  var selectedNode = currentIrr

  if (simplifiedPath[0] === null) {
    selectedNode = currentIrr.querySelector("irr_scene")
  }

  if (simplifiedPath[0] === "0") {
    selectedNode = currentIrr.querySelector("irr_scene")
    simplifiedPath.shift()
  }
  

  for (let j = 0; j < simplifiedPath.length; j++) {
    selectedNode = selectedNode.querySelectorAll(":scope > node")[parseInt(simplifiedPath[j])]
  }

  return selectedNode
}

/*function addDOMChildrenElements(x,path,gen) {
  let UsedPath = path

  console.log("GUDDHHBFSHFU; " + UsedPath)
  if (gen === null) {
    gen = 0
  }
  x = irrGetNodeAtPath(UsedPath)
  console.log(x)
  let childrenElements = x.querySelectorAll(":scope > node")
  console.log(childrenElements)
  for (i = 0; i < childrenElements.length - 1; i++) {
    let span = document.createElement("span")


    let li = document.createElement("li")
    li.setAttribute("data-internalid", UsedPath + ":" + i.toString())
    span.innerHTML = childrenElements[i].getAttribute("type")
    console.log(li.getAttribute("data-internalid"))
    console.log(irrGetNodeAtPath(li.getAttribute("data-internalid")))
    let section1 = irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelector(":scope > attributes").querySelector(':scope > int[name="Id"]')
    let hasName = irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelector(":scope > attributes").querySelector(':scope > string[name="Name"]')
    if (hasName) {
      span.innerHTML = hasName.getAttribute("value")
    }
    if (section1 !== null) {
      span.innerHTML = span.innerHTML + "_" + section1.getAttribute("value")
    }

    if (irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelectorAll(":scope > node").length > 0) {
      let button = document.createElement("button")
      button.setAttribute("class","caretButton")
      button.innerHTML = "+"
      li.appendChild(button)
    }

    li.appendChild(span)

    

    if (UsedPath === "0") {
      document.getElementById("SceneTreeList").appendChild(li)
    } else {
      console.log('li[data-internalid="' + UsedPath + ":" + i.toString() + '"]')
      console.log("STAGE 2:" + document.getElementById("SceneTreeList").querySelector('li[data-internalid="' + UsedPath + '"]'))
      console.log("STAGE 3:" + document.getElementById("SceneTreeList").querySelector('li[data-internalid="' + UsedPath + '"]').querySelector('ul[class="nested"]'))
      document.getElementById("SceneTreeList").querySelector('li[data-internalid="' + UsedPath + '"]').querySelector('ul[class="nested"]').appendChild(li)
    }

    if (irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelectorAll(":scope > node").length > 0) {
      let ulnested = document.createElement("ul")
      ulnested.setAttribute("class","nested")
      li.appendChild(ulnested)
      
      console.log("ADDING DOM CHILDREN ELEMENTS????")

      console.log("ADDING DOM CHILDREN ELEMENTS")
      console.log("((((((((((((((((((((((((((((((((((((((((((((((((((((((((" + UsedPath)
      console.log(")))))))))))))))))))))))))))))))))))))))))))))))))))))))))" + UsedPath)
    }

    
    

    console.log(UsedPath)
    console.log("0" + ":" + i.toString())



    
  }
  addDOMChildrenElements(null,"0:0")
}*/

function createVisualizedNode(xmlPath, elementParent2) {
  console.log("new node at " + xmlPath)
  xmlNode = null;
  xmlNode = irrGetNodeAtPath(xmlPath)
  xmlNodeChildren = xmlNode.querySelectorAll(":scope > node")

  if (xmlPath === "") {
    xmlPath = "0"
  }

  let li = document.createElement("li")
  li.setAttribute("data-internalid", xmlPath)
  li.setAttribute("draggable", "true")
  if (elementParent2.nodeName.toLowerCase() !== "ul") {
    elementParent2.querySelector(":scope > ul").appendChild(li)
  } else {
    elementParent2.appendChild(li)
  }

  if (xmlNodeChildren.length > 0) {
    let button = document.createElement("button")
    button.setAttribute("class","caretButton")
    button.innerHTML = "+"
    li.appendChild(button)

    childrenNotAdded.push(li)
  }

  let span = document.createElement("span")
  span.setAttribute("class","caret")
  let hasId = irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelector(":scope > attributes").querySelector(':scope > int[name="Id"]')
  let hasName = irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelector(":scope > attributes").querySelector(':scope > string[name="Name"]')

  let nodeType = irrGetNodeAtPath(li.getAttribute("data-internalid")).getAttribute("type")
  let nodeAttributes = irrGetNodeAtPath(li.getAttribute("data-internalid")).querySelector(":scope > attributes").children

  if (nodeType === "null") {
    nodeType = "irr_scene"
  }

  if (PropertiesInfo[nodeType] === undefined) {
    PropertiesInfo[nodeType] = {}
  }

  let LastTriggerConditionValue = null
  let LastOnTriggerEventValue = null

  for (let b = 0; b < nodeAttributes.length; b++) {
    if (PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] === undefined) {
      if (!nodeType === "TriggerObject" && !nodeType === "TriggerEventObject") {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[]}
      } else if (nodeType === "TriggerObject") {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[], presentWhenCondition:[], presentWhenOnTrigger:[]}
      } else {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[]}
      }
    }
    if (nodeAttributes[b].getAttribute("name") === "OnTriggerEvent") {
      LastOnTriggerEventValue = nodeAttributes[b].getAttribute("value")
    }
    if (nodeAttributes[b].getAttribute("name") === "TriggerCondition") {
      LastTriggerConditionValue = nodeAttributes[b].getAttribute("value")
    }
    if (!PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["values"].includes(nodeAttributes[b].getAttribute("value"))) {
      PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["values"].push(nodeAttributes[b].getAttribute("value"))
    }
  }

  for (let b = 0; b < nodeAttributes.length; b++) {
    console.log("trigger objecting")
    if (nodeType === "TriggerObject") {
      if (!["Name","Position","Rotation","Scale","Visible","TriggerStartExpression","TriggerCondition","OnTriggerEvent","OnceCondMetAlways"].includes(nodeAttributes[b].getAttribute("name"))) {
        
        if (PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenCondition"] !== undefined) { //TRIGGER CONDITION
          if (!PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenCondition"].includes(LastTriggerConditionValue)) {
            PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenCondition"].push(LastTriggerConditionValue)
          }
          if (PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenCondition"].length > 1) {
            PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenCondition"] = undefined
          }
        }

        if (PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenOnTrigger"] !== undefined) { //TRIGGER EVENT
          if (!PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenOnTrigger"].includes(LastOnTriggerEventValue)) {
            PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenOnTrigger"].push(LastOnTriggerEventValue)
          }

          if (PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenOnTrigger"].length > 1) {
            PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")]["presentWhenOnTrigger"] = undefined
          }
        } 
      }
    }
  }

  if (hasName) {
    span.innerHTML = hasName.getAttribute("value")
  } else {
    span.innerHTML = "(" + irrGetNodeAtPath(li.getAttribute("data-internalid")).getAttribute("type") + ")"
  }
  if (hasId && parseInt(hasId.getAttribute("value")) > 0) {
    span.innerHTML = span.innerHTML + "_" + hasId.getAttribute("value")
  }

  li.appendChild(span)

  span.addEventListener("click", function(e) {
    if (keysPressed["ControlLeft"] === false && keysPressed["ControlRight"] === false && keysPressed["ShiftLeft"] === false) {
      for (let i = 0; i < selectedLiElements.length; i++) {
        selectedLiElements[i].querySelector(":scope > span").classList.remove("selectedLi")
      }
      selectedLiElements = []
    }
    
    /*if (keysPressed["ShiftLeft"] === true && false === true) {
      if (!span.classList.contains("selectedLi")) {
        span.classList.add("selectedLi")
        selectedLiElements.push(span.parentElement)
      }
      if (selectedLiElements.length >= 2) {
        console.log("SHIFT LEFT NOW SELECT")

        let selectedLiOne = selectedLiElements[0]
        let selectedLiTwo = selectedLiElements[selectedLiElements.length - 1]

        console.log(selectedLiOne.getAttribute("data-internalid"))
        console.log(selectedLiOne.getAttribute("data-internalid").split(":"))

        let selectedLiOneIndex = selectedLiOne.getAttribute("data-internalid").split(":")[selectedLiOne.getAttribute("data-internalid").split(":").length - 1]
        let selectedLiTwoIndex = selectedLiTwo.getAttribute("data-internalid").split(":")[0]
        
        console.log("the li indexes")
        console.log(selectedLiOneIndex)
        console.log(selectedLiTwoIndex)

        let beforeIndexValue = selectedLiTwo.getAttribute("data-internalid").split(":")
        beforeIndexValue.pop()
        let beforeIndexValueString = ""

        console.log("Before index value; ")
        console.log(beforeIndexValue)

        for (let i = 0; i < beforeIndexValue.length; i += 1) {
          if (i !== beforeIndexValue.length - 1) {
            beforeIndexValueString = beforeIndexValueString + String(beforeIndexValue[i]) + ":"
          } else {
            beforeIndexValueString = beforeIndexValueString + String(beforeIndexValue[i])
          }
        }

        if (selectedLiTwoIndex < selectedLiOneIndex) {
          let temp = selectedLiTwoIndex
          selectedLiTwoIndex = selectedLiOneIndex
          selectedLiOneIndex = temp
        }

        console.log(selectedLiOneIndex)
        console.log(selectedLiTwoIndex)

        for (let i = selectedLiOneIndex; i <= selectedLiTwoIndex; i += 1) {
          console.log("this")
          let liToChange = document.querySelector('li[data-internalid="' + beforeIndexValueString + ':' + String(i) + '"]')
          console.log('li[data-internalid="' + beforeIndexValueString + ':' + String(i) + '"]')
          if (!selectedLiElements.includes(liToChange)) {
            console.log("it wasnt selected alreadu")
            liToChange.querySelector(":scope > span").classList.add("selectedLi")
            selectedLiElements.push(liToChange)
          } else {
            console.log("it already was")
          }
        }

      }
    }*/

    if (span.classList.contains("selectedLi")) {
      span.classList.remove("selectedLi")
      selectedLiElements.splice(selectedLiElements.indexOf(span.parentElement),1)
    } else {
      span.classList.add("selectedLi")
      selectedLiElements.push(span.parentElement)
    }
    refreshProperties()
  })


  if (xmlNodeChildren.length > 0) {
    let ulNested = document.createElement("ul")
    ulNested.setAttribute("class","nested")
    li.appendChild(ulNested)
  }
}

function addDOMChildrenElements(path) {
  parent = irrGetNodeAtPath(path)
  
  let childrenElements = parent.querySelectorAll(":scope > node")
  for (let i = 0; i < childrenElements.length; i++) {
    createVisualizedNode(path + ":" + i, document.getElementById("SceneTreeList").querySelector('li[data-internalid="' + path + '"]'))
  }
}

function refreshStructure() {
  var irrScene = currentIrr.querySelector("irr_scene")
  var liToIrr = {};
  console.log(irrScene)
  document.getElementById("SceneTreeList").innerHTML = ""

  createVisualizedNode("", document.getElementById("SceneTreeList"))
  

  console.log(irrGetNodeAtPath("0:0"))

  addDOMChildrenElements("0")

  childrenNotAdded.shift()

  var j = 0;

  while (childrenNotAdded.length > 0 && childrenNotAdded.length !== undefined) {
    addDOMChildrenElements(childrenNotAdded[j].getAttribute("data-internalid"))
    childrenNotAdded.shift(j)
  }

  console.log("finished loading")
  console.log("finished loading")
  console.log("finished loading")
  console.log("finished loading")
  console.log("finished loading")


  console.log("IMPORTANT THIN!!!!!!!!! " + irrGetNodeAtPath(""))

  updateSceneList()
  
}

//FILE MENY
var fileMenuRan = false

function fileMenuButtons() {
  if (fileMenuRan === false) {
    var toggler = document.getElementsByClassName("FileMenu");
    var i;
    
    if (toggler.length > 0) {
      fileMenuRan = true
    }

    for (i = 0; i < toggler.length; i++) {
      toggler[i].addEventListener("click", function() {
          console.log("click!")
          this.parentElement.querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
      });
    } 
  }
}

window.addEventListener('click', function(e){   
  for (let i = 0; i < selectedLiElements.length; i++) {
    selectedLiElements[i].querySelector(":scope > span").classList.remove("selectedLi")
  }
  selectedLiElements = []
  if (!document.getElementById('dropdown-File').contains(e.target) && document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.contains("dropdown-content-opened")){
    document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
  }
});

function loadNewFile() {
  if (currentFileIndex < files.length) {
    if (files[currentFileIndex] !== null) {
      loadingIrr = true
      openReader.readAsText(files[currentFileIndex])
    } else {
      console.log("Its a null")
    }
  }
}

document.getElementById("FileMenu-Open").addEventListener("change", function(e){
  files = document.getElementById("FileMenu-Open").files
  console.log(files)
  currentFileIndex = 0;
  loadNewFile()
})

document.getElementById("FileMenu-SaveAs").addEventListener("click", function(e){
  download("NewLevel.irr",new XMLSerializer().serializeToString(currentIrr))
})

document.getElementById("FileMenu-PropertyInfo").addEventListener("click", function(e){
  download("PropertiesInfo.json", JSON.stringify(PropertiesInfo))
})

openReader.addEventListener("load", () => {
  currentFileIndex += 1
  console.log(openReader.result);
  currentIrr = parser.parseFromString(openReader.result,"text/xml");
  refreshStructure();
  loadNewFile()
  loadingIrr = false
}, false);

updateSceneList()
fileMenuButtons()

function update() {
  
}
createjs.Ticker.framerate = 60
createjs.Ticker.addEventListener("tick", update)