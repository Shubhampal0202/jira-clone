let addBtn = document.querySelector('.add-button');
let removeBtn = document.querySelector('.remove-button');
let modalCont = document.querySelector('.modal-cont');
let mainCont = document.querySelector('.main-cont');
let textareaCont = document.querySelector('.textarea-cont');
let allPriorityColors = document.querySelectorAll('.priority-color');
let toolBoxColor =  document.querySelectorAll('.color');



let colors = ['lightpink', 'lightblue', 'lightgreen', 'black'];
let modalPriorityColor = colors[colors.length - 1];
let addFlag = false;
let removeFlag = false;

let lockClass = 'fa-lock';
let unlockClass = 'fa-lock-open';
// handle toolBox color
let ticketsArr = [];
// if local storage have some data
if(localStorage.getItem("jira_tickets")){
    // retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj,idx)=>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
    })
}
for(let i=0;i<toolBoxColor.length;i++){
    toolBoxColor[i].addEventListener('click',(e)=>{
        let currentToolBoxColor = toolBoxColor[i].classList[0];
      let filteredTickets =   ticketsArr.filter((ticketObj,idx)=>{
            return currentToolBoxColor === ticketObj.ticketColor;
        });
        // Remove previous tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i=0;i<allTicketsCont.length;i++){
            allTicketsCont[i].remove();
        }
         // Display new filtered tickets
         filteredTickets.forEach((ticketObj,idx)=>{
             createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
         })
    })
    toolBoxColor[i].addEventListener('dblclick',(e)=>{
          // Remove previous tickets
          let allTicketsCont = document.querySelectorAll(".ticket-cont");
          for(let i=0;i<allTicketsCont.length;i++){
              allTicketsCont[i].remove();
          }
          ticketsArr.forEach((ticketObj,idx)=>{
            createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
          })
    })
}
// console.log(ticketsArr);

// listener for modal priority coloring
allPriorityColors.forEach((colorElem) => {
    colorElem.addEventListener('click', (e) => {
        allPriorityColors.forEach((priorityColorElem) => {
            priorityColorElem.classList.remove('border');
        })
        colorElem.classList.add('border');
        modalPriorityColor = colorElem.classList[0];


    })
})


addBtn.addEventListener('click', (e) => {
    // Display modal

    // if addFlag -> true -> display modal
    // if addFlag -> false -> remove modal
    addFlag = !addFlag;
    // console.log(addFlag);
    if (addFlag) {
        modalCont.style.display = "flex";
    } else {
        modalCont.style.display = "none";
    }

})

// listener for ticket removal
removeBtn.addEventListener('click', (e) => {
    console.log(removeFlag);
    removeFlag = !removeFlag;
})


//create ticket

modalCont.addEventListener('keydown', (e) => {
    let shiftKey = e.key;
    if (shiftKey === 'Shift') {
        createTicket(modalPriorityColor, textareaCont.value);
       addFlag = !addFlag;
        setModalToDefault();    
    }
})

function createTicket(ticketColor, ticketTask, ticketID) {
    let id = ticketID || shortid();// or operator returns always truthy value
    // if ticketID is undefined then create new id using shortid function
    // console.log(ticketID);
    // console.log(id);
    // console.log(!ticketID);
    let ticketCont = document.createElement('div');
    ticketCont.setAttribute('class', 'ticket-cont');
    ticketCont.innerHTML = `
     <div class="ticket-color ${ticketColor}"></div>
     <div class="ticket-id">#${id}</div>
     <div class="task-area">${ticketTask}</div>
     <div class="ticket-lock">
     <i class="fas fa-lock"></i>
     </div>
     `;
    mainCont.appendChild(ticketCont);

    // Create object of ticket and add to array
   
  if(!ticketID){
    ticketsArr.push({ticketColor, ticketTask, ticketID: id});
    localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
  }
    console.log(ticketsArr.length);
    console.log(ticketsArr);
    handleRemoval(ticketCont,id);
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

function handleRemoval(ticket,id) {
    // removeFlag -> true -> remove
     ticket.addEventListener('click',(e)=>{
        if (!removeFlag) {
            return;
          }
          let ticketIdx = getTicketIdx(id);
          // DB removal
          ticketsArr.splice(ticketIdx,1);
          localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
          // remove from UI
          ticket.remove();
     })

}

function handleLock(ticket,id) {
    // ticket ke create hone ke baad ticket ke andar element ko retrieve kare
    // let ticketLockCont = document.querySelector('.ticket-lock');// wrong method multiple tickets 
    // creates hone ke baad work nhi karega
    let ticketLockCont = ticket.querySelector('.ticket-lock');
    // console.log(ticketLockCont);
    let ticketLockElm = ticketLockCont.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");
    ticketLockElm.addEventListener('click', (e) => {
        // console.log("hiii");
        let ticketIdx = getTicketIdx(id);
        if (ticketLockElm.classList.contains(lockClass)) {
            ticketLockElm.classList.remove(lockClass);
            ticketLockElm.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", true);// if value of contenteditable
            // attribute is true then we can edit the content of ticket task area
        }
        else {
            ticketLockElm.classList.remove(unlockClass);
            ticketLockElm.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", false);
        }
        // modify data in local storage (edit task area)
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerHTML;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    })

}

// handle ticket color after completing the ticket
function handleColor(ticket,id) {
    let ticketColor = ticket.querySelector('.ticket-color');
    ticketColor.addEventListener('click', (e) => {
        // get ticketIdx from ticket Array
        let ticketIdx = getTicketIdx(id);
        let currentTicketColor = ticketColor.classList[1];
        let currentTicketColorIdx = colors.findIndex((color) => {
            return currentTicketColor === color;
        })
        currentTicketColorIdx++;
        newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        // console.log(newTicketColorIdx,newTicketColor);
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // modify data in local storage (priority color change)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));

    })
}

function getTicketIdx(id){
   let ticketIdx = ticketsArr.findIndex((ticketObj,idx)=>{
        return ticketObj.ticketID ===id;
    })
    return ticketIdx;
}


function setModalToDefault(){
    modalCont.style.display = 'none';
    textareaCont.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem,idx) => {
        priorityColorElem.classList.remove('border');
    });
    allPriorityColors[allPriorityColors.length-1].classList.add('border');
}
