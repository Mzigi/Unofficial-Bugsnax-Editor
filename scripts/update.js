const openReader = new FileReader();

var currentIrr;
var loadingIrr = false
var liToIrr = {}
var parser = new DOMParser();
var currentFileIndex = 0
var files = null
var selectedLiElements = []
var CurrentPropertyType ="Attributes"

var LoadedNodes = 0
var MaxLoadedNodes = 0

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

var DefaultLevel = ""

fetch("https://mzigi.github.io/Unofficial-Bugsnax-Editor/jscontent/RealPropertiesInfo.json")
.then(response => {
   return response.json();
})
.then(temporar => RealPropertiesInfo = temporar);


var x = new XMLHttpRequest();
x.open("GET", "https://mzigi.github.io/Unofficial-Bugsnax-Editor/jscontent/DefaultLevel.xml", true);
x.onreadystatechange = function () {
  if (x.readyState == 4 && x.status == 200)
  {
    DefaultLevel = x.responseText
    // …
  }
};
x.send(null);

console.log(DefaultLevel)
console.log(x)

/*fetch("https://mzigi.github.io/Unofficial-Bugsnax-Editor/jscontent/DefaultLevel.xml")
.then(response => {
   return response
})
.then(temporar => DefaultLevel = temporar);*/

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
      let hidden = false

      console.log(AllProperties[key])

      let presentWhenCondition = AllProperties[key]["presentWhenCondition"]
      if (presentWhenCondition !== undefined) {
          presentWhenCondition = presentWhenCondition[0]
        console.log(presentWhenCondition)
        if (presentWhenCondition === "Immediately") {
          presentWhenCondition = undefined
        }
        console.log(presentWhenCondition)
      }
      
      let presentWhenOnTrigger = AllProperties[key]["presentWhenOnTrigger"]
      if (presentWhenOnTrigger !== undefined) {
        presentWhenOnTrigger = presentWhenOnTrigger[0]
        console.log(presentWhenOnTrigger)
        if (presentWhenOnTrigger === "Nothing") {
          presentWhenOnTrigger = undefined
        }
        console.log(presentWhenOnTrigger)
      }


      if (presentWhenOnTrigger == undefined && presentWhenCondition != undefined) {
        console.log("v\nv\nv\nv\nv")
        if (selectedNodeElement.querySelector(":scope > attributes").querySelector(':scope > enum[name="TriggerCondition"]').getAttribute("value") != presentWhenCondition[0]) {
          hidden = true
          console.log("HIDING PROPERTY: " + key)
        }
      }

      if (presentWhenCondition == undefined && presentWhenOnTrigger != undefined) {
        console.log("w\nv\nv\nv\nv")
        if (selectedNodeElement.querySelector(":scope > attributes").querySelector(':scope > enum[name="OnTriggerEvent"]').getAttribute("value") != presentWhenOnTrigger[0]) {
          hidden = true
          console.log("HIDING PROPERTY: " + key)
        }
      }

      if (presentWhenCondition != undefined && presentWhenOnTrigger != undefined) {
        let areAnyCorrect = false
        if (selectedNodeElement.querySelector(":scope > attributes").querySelector(':scope > enum[name="OnTriggerEvent"]').getAttribute("value") == presentWhenOnTrigger[0]) {
          areAnyCorrect = true
        }
        if (selectedNodeElement.querySelector(":scope > attributes").querySelector(':scope > enum[name="TriggerCondition"]').getAttribute("value") == presentWhenCondition[0]) {
          areAnyCorrect = true
        }
        if (areAnyCorrect === false) {
          hidden = true
          console.log("HIDING PROPERTY: " + key)
        }
      }


      if (hidden != true) {
        console.log(AllProperties[key])

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

        let alpha = null

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

          alpha = document.createElement("input")
          alpha.setAttribute("type","number")
          alpha.setAttribute("min","0")
          alpha.setAttribute("max","255")
          alpha.setAttribute("step","1")
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

          alpha = document.createElement("input")
          alpha.setAttribute("type","number")
          alpha.setAttribute("min","0")
          alpha.setAttribute("max","255")
          alpha.setAttribute("step","1")
          alpha.setAttribute("placeholder", "alpha")
        } else {
          input.setAttribute("placeholder", keyType)
        }
        propertyValue.appendChild(input)
        if (alpha !== null && alpha !== undefined) {
          propertyValue.appendChild(alpha)
        }

        if (selectedNodeElement.querySelector(":scope > attributes")) {
          if (selectedNodeElement.querySelector(keyType + '[name="' + key + '"]')) {
            console.log("success! " + keyType + '[name="' + key + '"]')
            if (keyType !== "enum" && keyType !== "color" && keyType !== "colorf") {
              console.log("final")
              input.setAttribute("value",selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value"))
            } else if (keyType === "enum") {
              input.value = selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value")
            } else if (keyType === "color") {
              console.log("AAAAAAAAAAAAAAAA: " + selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value").slice(0,7))
              input.setAttribute("value",selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value").slice(0,7))
              console.log("ALPHA IS " + selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value").slice(7,9))
              alpha.setAttribute("value",parseInt(selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value").slice(7,9),16))
            } else if (keyType === "colorf") {
              var color = selectedNodeElement.querySelector(keyType + '[name="' + key + '"]').getAttribute("value").split(",")
              alphaColor = color[3]
              console.log(color)
              color = tinycolor({r:Math.floor(color[0] * 255),g:Math.floor(color[1] * 255),b:Math.floor(color[2] * 255),a:Math.floor(color[3] * 255)})
              console.log(color)
              color = color.toHexString()
              console.log(color)

              input.setAttribute("value",color.slice(0,7))
              alpha.setAttribute("value",parseInt(alphaColor * 255))
            }
          } else {
            console.log(keyType + '[name="' + key + '"]')
          }
        } else {
          console.log("HUH?")
        }

        document.getElementById("Attributes").appendChild(property)
      }
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
      if (!nodeType === "TriggerObject" && !nodeType === "TriggerEventObject" && !nodeType === "ConditionalTrigger") {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[]}
      } else if (nodeType === "TriggerObject") {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[], presentWhenCondition:[], presentWhenOnTrigger:[]}
      } else if (nodeType === "TriggerEventObject") {
        PropertiesInfo[nodeType][nodeAttributes[b].getAttribute("name")] = {type:nodeAttributes[b].nodeName, values:[], presentWhenOnTrigger:[]}
      } else if (nodeType === "ConditionalTrigger") {
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
    if (nodeType === "TriggerEventObject") {
      if (!["Name","OnTriggerEvent"].includes(nodeAttributes[b].getAttribute("name"))) {
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
    if (nodeType === "ConditionalTrigger") {
      if (!["Name","Position","Rotation","Scale","Visible","TriggerStartExpression","TriggerCondition","OnTriggerEvent","OnceCondMetAlways","TimeSpan","BreakIfTrue","Randomness"].includes(nodeAttributes[b].getAttribute("name"))) {
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

  let lastDrawnOver = null

  li.addEventListener("dragstart", function(e) {
    e.stopPropagation()
    if (e.dataTransfer.getData("text/plain") == "") {
      e.dataTransfer.setData("text/plain", li.getAttribute("data-internalid"))
      console.log(li.getAttribute("data-internalid"))
    }
  })

  li.addEventListener("dragover", function(e) {
    e.stopPropagation()
    e.preventDefault()

    if (lastDrawnOver) {
      lastDrawnOver.classList.remove("dragOverLi")
    }
    lastDrawnOver = e.target
    e.target.classList.add("dragOverLi")
  })
  
  li.addEventListener("drop", function(e) {
    e.stopPropagation()
    if (e.dataTransfer.getData("text/plain") != li.getAttribute("data-internalid")) {
      e.preventDefault()

      if (lastDrawnOver) {
        lastDrawnOver.classList.remove("dragOverLi")
      }
      let dataInternalId = e.dataTransfer.getData("text/plain")
      console.log(e.target)
      let eTarget = e.target
      if (eTarget.tagName.toLowerCase() === "span") {
        eTarget = eTarget.parentElement
      }
      if (eTarget.tagName.toLowerCase() === "button") {
        eTarget = eTarget.parentElement
      }
      if (eTarget.tagName.toLowerCase() === "ul") {
        eTarget = eTarget.parentElement
      }
      console.log("LOOK HERE!!!!1")
      console.log(eTarget)
      let targetDataInternalId = eTarget.getAttribute("data-internalid")
      console.log("target is " + targetDataInternalId)

      let liElement = document.querySelector('li[data-internalid="' + dataInternalId + '"]')
      let targetLiElement = document.querySelector('li[data-internalid="' + targetDataInternalId + '"]')
      let targetNodeElement = currentIrr
      for (i = 0; i < targetDataInternalId.split(":").length; i += 1) {
        if (i === 0) {
          targetNodeElement = currentIrr.querySelector("irr_scene")
        } else {
          targetNodeElement = targetNodeElement.querySelectorAll(":scope > node")[parseInt(targetDataInternalId.split(":")[i])]
        }
      }

      console.log(targetNodeElement)
      let nodeElement = irrGetNodeAtPath(dataInternalId)
      let startElement = parseInt(dataInternalId.split(":")[dataInternalId.split(":").length - 1]) + 1
      let nodeAfterElementsCount = parseInt(nodeElement.parentElement.querySelectorAll(":scope > node").length) - 1 - startElement

      if (targetNodeElement === nodeElement.parentElement) {
        return
      }

      console.log("start element is: " + startElement)
      let endElementCounts = startElement + nodeAfterElementsCount
      console.log("end element is: " + endElementCounts)

      let UnchangedInternalIds = []

      for (let i = startElement; i <= startElement + nodeAfterElementsCount; i += 1) {
        let CurrentElementDataInternalId = liElement.parentElement.querySelectorAll(":scope > li")[i].getAttribute("data-internalid")
        CurrentElementDataInternalId = CurrentElementDataInternalId.split(":")
        CurrentElementDataInternalId[CurrentElementDataInternalId.length - 1] = parseInt(CurrentElementDataInternalId[CurrentElementDataInternalId.length - 1]) - 1

        let newDataInternalId = ""

        for (let j = 0; j < CurrentElementDataInternalId.length; j += 1) {
          if (j == 0) {
            newDataInternalId = String(CurrentElementDataInternalId[0])
          } else {
            newDataInternalId = newDataInternalId + ":" + String(CurrentElementDataInternalId[j])
          }
        }
        if (liElement.parentElement.querySelectorAll(":scope > li")[i].querySelector(":scope > ul") !== null) {
          console.log("first stage")
          for (let g = 0; g < liElement.parentElement.querySelectorAll(":scope > li")[i].querySelector(":scope > ul").querySelectorAll("li").length; g += 1) {
            console.log("pushing")
            UnchangedInternalIds.push(liElement.parentElement.querySelectorAll(":scope > li")[i].querySelector(":scope > ul").querySelectorAll("li")[g])
          }
        }
        

        liElement.parentElement.querySelectorAll(":scope > li")[i].setAttribute("data-internalid", newDataInternalId)
      }

      console.log("HERE IT IS")
      console.log(UnchangedInternalIds)

      while (UnchangedInternalIds.length > 0) {
        let CurrentElementDataInternalId = UnchangedInternalIds[0].getAttribute("data-internalid")
        CurrentElementDataInternalId = CurrentElementDataInternalId.split(":")
        CurrentElementDataInternalId[CurrentElementDataInternalId.length - 2] = parseInt(CurrentElementDataInternalId[CurrentElementDataInternalId.length - 2]) - 1

        let newDataInternalId = ""

        for (let j = 0; j < CurrentElementDataInternalId.length; j += 1) {
          if (j == 0) {
            newDataInternalId = String(CurrentElementDataInternalId[0])
          } else {
            newDataInternalId = newDataInternalId + ":" + String(CurrentElementDataInternalId[j])
          }
        }
        if (UnchangedInternalIds[0].querySelector(":scope > ul") !== null) {
          for (let g = 0; g < UnchangedInternalIds[0].querySelector(":scope > ul").querySelectorAll("li").length; g += 1) {
            UnchangedInternalIds.push(UnchangedInternalIds[0].querySelector(":scope > ul").querySelectorAll("li")[g]) //li element thing
          }
        }

        UnchangedInternalIds[0].setAttribute("data-internalid", newDataInternalId)

        UnchangedInternalIds.shift()
      }

      console.log(currentIrr)
      console.log(targetNodeElement)
      console.log(nodeElement)
      targetNodeElement.appendChild(nodeElement)

      if (liElement.parentElement.parentElement.querySelector(":scope > button") !== null) {
        if (liElement.parentElement.querySelectorAll(":scope > li").length < 2) {
          liElement.parentElement.parentElement.querySelector(":scope > button").remove()
        }
      }

      lastParentUlForLiElement = liElement.parentElement

      if (targetLiElement.querySelector(":scope > ul") !== null) {
        targetLiElement.querySelector(":scope > ul").appendChild(liElement)
        liElement.setAttribute("data-internalid",targetLiElement.getAttribute("data-internalid") + ":" + String(targetLiElement.querySelector(":scope > ul").querySelectorAll(":scope > li").length - 1))
      } else {
        let newButton = document.createElement("button")
        newButton.classList.add("caretButton")
        newButton.innerHTML = "+"
        targetLiElement.insertBefore(newButton,targetLiElement.querySelector(":scope > span"))

        let newNestedUl = document.createElement("ul")
        newNestedUl.classList.add("nested")
        targetLiElement.appendChild(newNestedUl)

        liElement.setAttribute("data-internalid",targetLiElement.getAttribute("data-internalid") + ":0")

        newNestedUl.appendChild(liElement)

        updateSceneList()
      }

      if (liElement.querySelector(":scope > ul") !== null) {
        let theChildrenOfTheLi = liElement.querySelector(":scope > ul").querySelectorAll(":scope > li")
        for (let j = 0; j < theChildrenOfTheLi.length; j += 1) {
          UnchangedInternalIds.push(theChildrenOfTheLi[j])
        }
      }

      while (UnchangedInternalIds.length > 0) {
        let CurrentElementDataInternalId = UnchangedInternalIds[0].getAttribute("data-internalid")
        CurrentElementDataInternalId = CurrentElementDataInternalId.split(":")

        let ParentInternalId = UnchangedInternalIds[0].parentElement.parentElement.getAttribute("data-internalid").split(":")
        ParentInternalId.push(CurrentElementDataInternalId[CurrentElementDataInternalId.length - 1])

        let newDataInternalId = ""

        for (let g = 0; g < ParentInternalId.length; g += 1) {
          if (g === 0) {
            newDataInternalId = String(ParentInternalId[g])
          } else {
            newDataInternalId = newDataInternalId + ":" + String(ParentInternalId[g])
          }
        }

        if (UnchangedInternalIds[0].querySelector(":scope > ul") !== null) {
          for (let g = 0; g < UnchangedInternalIds[0].querySelector(":scope > ul").querySelectorAll("li").length; g += 1) {
            UnchangedInternalIds.push(UnchangedInternalIds[0].querySelector(":scope > ul").querySelectorAll("li")[g])
          }
        }

        UnchangedInternalIds[0].setAttribute("data-internalid", newDataInternalId)

        UnchangedInternalIds.shift()
      }


      console.log(lastParentUlForLiElement)

      if (lastParentUlForLiElement.querySelectorAll(":scope > li").length < 1) {
        lastParentUlForLiElement.remove()
      }

      console.log(currentIrr)
    }
    
  })

  span.addEventListener("click", function(e) {
    console.log("click!")
    if (keysPressed["ControlLeft"] === false && keysPressed["ControlRight"] === false && keysPressed["ShiftLeft"] === false) {
      console.log("remove selection")
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
      console.log("remove selection")
      span.classList.remove("selectedLi")
      selectedLiElements.splice(selectedLiElements.indexOf(span.parentElement),1)
    } else {
      console.log("add selection")
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
    LoadedNodes += 1
    console.log(LoadedNodes + "/" + MaxLoadedNodes)
  }
}

function refreshStructure() {
  var irrScene = currentIrr.querySelector("irr_scene")
  var liToIrr = {};
  console.log(irrScene)
  document.getElementById("SceneTreeList").innerHTML = ""

  createVisualizedNode("", document.getElementById("SceneTreeList"))
  

  console.log(irrGetNodeAtPath("0:0"))


  LoadedNodes = 0
  MaxLoadedNodes = irrScene.querySelectorAll("node").length

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

document.body.addEventListener('click', function(e){   
  if (!document.getElementById("SceneTree").contains(e.target)) {
    for (let i = 0; i < selectedLiElements.length; i++) {
      selectedLiElements[i].querySelector(":scope > span").classList.remove("selectedLi")
    }
    selectedLiElements = []
  }
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
  document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
  files = document.getElementById("FileMenu-Open").files
  console.log(files)
  currentFileIndex = 0;
  loadNewFile()
})

document.getElementById("FileMenu-SaveAs").addEventListener("click", function(e){
  document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
  download("NewLevel.irr",new XMLSerializer().serializeToString(currentIrr))
})

document.getElementById("FileMenu-New").addEventListener("click", function(e){
  document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
  currentIrr = parser.parseFromString(DefaultLevel,"text/xml");
  refreshStructure()
})


document.getElementById("FileMenu-PropertyInfo").addEventListener("click", function(e){
  document.getElementById('dropdown-File').querySelector(".dropdown-content").classList.toggle("dropdown-content-opened");
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