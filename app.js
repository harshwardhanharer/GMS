if(!localStorage.getItem("loggedIn") && window.location.pathname.includes("dashboard")){
window.location="login.html"
}




/* LOGIN */

function login(){

let user=document.getElementById("username")?.value.trim()
let pass=document.getElementById("password")?.value.trim()

if(user==="admin" && pass==="1234"){

localStorage.setItem("loggedIn","true")

window.location.href="dashboard.html"

}else{

alert("Wrong Login")

}

}

function logout(){

localStorage.removeItem("loggedIn")

window.location="login.html"

}


/* SECTION CONTROL */

function showSection(id){

let sections=document.querySelectorAll(".section")

sections.forEach(s=>s.style.display="none")

let target=document.getElementById(id)

if(target){
target.style.display="block"
}

if(id=="dashboard"){
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()
}

}


/* ADD MEMBER */

function addMember(){

let name=document.getElementById("name").value
let phone=document.getElementById("phone").value
let batch=document.getElementById("batch").value
let trainer=document.getElementById("trainer").value
let joinDate=document.getElementById("joinDate").value
let plan=document.getElementById("plan").value

if(!name || !phone || !joinDate){
alert("Please fill all fields")
return
}

let start=new Date(joinDate)
start.setDate(start.getDate()+Number(plan))

let expiry=start.toISOString().split("T")[0]

let member={
name,
phone,
batch,
trainer,
joinDate,
expiry,
plan,
fee:1500,
lastPayment:null,
nextDue:expiry,
paymentHistory:[],
attendance:{}
}

let members=JSON.parse(localStorage.getItem("members"))||[]

if(members.length>=100){
alert("Gym Capacity Full")
return
}

members.push(member)

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

document.getElementById("name").value=""
document.getElementById("phone").value=""
document.getElementById("trainer").value=""

}


/* LOAD MEMBERS */

function loadMembers(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("memberList")

if(!list) return

list.innerHTML=""

members.forEach((m,i)=>{

list.innerHTML += `
<tr>
<td>${m.name}</td>
<td>${m.phone}</td>
<td>${m.batch}</td>
<td>${m.trainer}</td>
<td>${m.expiry}</td>
<td>
<button onclick="editMember(${i})">Edit</button>
<button onclick="deleteMember(${i})">Delete</button>
<button onclick="renewMember(${i})">Renew</button>
</td>
</tr>
`

})

let total=document.getElementById("totalMembers")
if(total){
total.innerText=members.length
}

loadPayments()
loadAttendance()
checkExpiryAlerts()

}





function editMember(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let m = members[index]

let newName = prompt("Edit Name",m.name)
let newPhone = prompt("Edit Phone",m.phone)

if(newName && newPhone){

members[index].name=newName
members[index].phone=newPhone

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

}

}


/* DELETE MEMBER */

function deleteMember(index){

if(!confirm("Are you sure you want to delete this member?")){
return
}

let members = JSON.parse(localStorage.getItem("members")) || []

members.splice(index,1)

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

}



function renewMember(index){

let members=JSON.parse(localStorage.getItem("members"))||[]

let today=new Date()

let next=new Date(today)

next.setMonth(next.getMonth()+1)

let newDate=next.toISOString().split("T")[0]

members[index].expiry=newDate
members[index].nextDue=newDate
members[index].lastPayment=today.toISOString().split("T")[0]

localStorage.setItem("members",JSON.stringify(members))

loadMembers()
loadPayments()
updateRevenue()
createRevenueChart()

}


/* PAYMENTS */

function loadPayments(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("paymentList")

if(!list) return

list.innerHTML=""

let today = new Date().toISOString().split("T")[0]

members.forEach((m,i)=>{

let btn=""

if(m.lastPayment === today){
btn=`<button disabled>Paid</button>`
}else{
btn=`<button onclick="recordPayment(${i})">Mark Paid</button>`
}

list.innerHTML += `
<tr>
<td>${m.name}</td>
<td>₹${m.fee}</td>
<td>${m.nextDue || "N/A"}</td>
<td>${btn}</td>
</tr>
`

})

}



function recordPayment(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date()

let paymentDate = today.toISOString().split("T")[0]

if(members[index].lastPayment === paymentDate){
alert("Payment already recorded today")
return
}

let nextDue = new Date(today)
nextDue.setMonth(nextDue.getMonth()+1)

nextDue = nextDue.toISOString().split("T")[0]

let paymentRecord={
amount:members[index].fee,
date:paymentDate
}

members[index].paymentHistory.push(paymentRecord)

members[index].lastPayment=paymentDate
members[index].nextDue=nextDue
members[index].expiry=nextDue

localStorage.setItem("members",JSON.stringify(members))

loadPayments()
loadMembers()
updateRevenue()
createRevenueChart()

}




/* ATTENDANCE */

function loadAttendance(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("attendanceList")

if(!list) return

let today = new Date().toISOString().split("T")[0]

list.innerHTML=""

members.forEach((m,i)=>{

let status="Not Marked"

if(m.attendance && m.attendance[today]){
status=m.attendance[today]
}

list.innerHTML += `
<tr>
<td>${m.name}</td>
<td><button onclick="markPresent(${i})">Present</button></td>
<td><button onclick="markAbsent(${i})">Absent</button></td>
<td>${status}</td>
</tr>
`

})

}


/* MARK PRESENT */

function markPresent(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date().toISOString().split("T")[0]

if(!members[index].attendance){
members[index].attendance={}
}

members[index].attendance[today]="Present"

localStorage.setItem("members",JSON.stringify(members))

loadAttendance()
updateTodayAttendance()

}


/* MARK ABSENT */

function markAbsent(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date().toISOString().split("T")[0]

if(!members[index].attendance){
members[index].attendance={}
}

members[index].attendance[today]="Absent"

localStorage.setItem("members",JSON.stringify(members))

loadAttendance()
updateTodayAttendance()

}



function updateTodayAttendance(){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date().toISOString().split("T")[0]

let count = 0

members.forEach(m=>{

if(m.attendance && m.attendance[today]=="Present"){
count++
}

})

let el=document.getElementById("todayAttendance")

if(el){
el.innerText=count
}

}



function viewAttendance(){

let date=document.getElementById("attendanceDate").value

if(!date){
alert("Select a date")
return
}

let members=JSON.parse(localStorage.getItem("members"))||[]

let list=document.getElementById("attendanceHistory")

if(!list) return

list.innerHTML=""

members.forEach(m=>{

let status="Absent"

if(m.attendance && m.attendance[date]){
status=m.attendance[date]
}

list.innerHTML+=`
<tr>
<td>${m.name}</td>
<td>${status}</td>
</tr>
`

})

}




/* SEARCH MEMBER */
function searchMember(){

let text=document.getElementById("searchMember").value.toLowerCase()

let members=JSON.parse(localStorage.getItem("members"))||[]

let list=document.getElementById("memberList")

if(!list) return

list.innerHTML=""

members.forEach((m,i)=>{

if(m.name.toLowerCase().includes(text)){

list.innerHTML+=`
<tr>
<td>${m.name}</td>
<td>${m.phone}</td>
<td>${m.batch}</td>
<td>${m.trainer}</td>
<td>${m.expiry}</td>
<td>
<button onclick="editMember(${i})">Edit</button>
<button onclick="deleteMember(${i})">Delete</button>
<button onclick="renewMember(${i})">Renew</button>
</td>
</tr>
`

}

})

}





/* UPDATE REVENUE */

function updateRevenue(){

let members = JSON.parse(localStorage.getItem("members")) || []

let revenue = 0

let today = new Date()
let month = today.getMonth()
let year = today.getFullYear()

members.forEach(m=>{

if(m.paymentHistory){

m.paymentHistory.forEach(p=>{

let d=new Date(p.date)

if(d.getMonth()==month && d.getFullYear()==year){
revenue+=p.amount
}

})

}

})

let el=document.getElementById("revenue")
if(el){
el.innerText=revenue
}

}



let revenueChart

function createRevenueChart(){

let members = JSON.parse(localStorage.getItem("members")) || []

let monthly=[0,0,0,0,0,0,0,0,0,0,0,0]

members.forEach(m=>{

if(m.paymentHistory){

m.paymentHistory.forEach(p=>{

let d=new Date(p.date)

let month=d.getMonth()

monthly[month]+=p.amount

})

}

})

let canvas=document.getElementById("revenueChart")

if(!canvas) return

let ctx=canvas.getContext("2d")

if(revenueChart){
revenueChart.destroy()
}

revenueChart=new Chart(ctx,{

type:"bar",

data:{
labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
datasets:[{
label:"Monthly Revenue",
data:monthly,
backgroundColor:"#ff4d00"
}]
},

options:{
responsive:true,
scales:{
y:{beginAtZero:true}
}
}

})

}




/* EXPIRY ALERT */

function checkExpiryAlerts(){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date()

let list = document.getElementById("expiryAlerts")

if(!list) return

list.innerHTML=""

members.forEach(m=>{

let exp=new Date(m.expiry)

let diff=(exp-today)/(1000*60*60*24)

if(diff<=5){

list.innerHTML+=`<li>${m.name} - ${m.expiry}</li>`

}

})

}






function addTrainer(){

let name=document.getElementById("trainerName").value

if(!name){
alert("Enter trainer name")
return
}

let trainers=JSON.parse(localStorage.getItem("trainers"))||[]

trainers.push(name)

localStorage.setItem("trainers",JSON.stringify(trainers))

document.getElementById("trainerName").value=""

loadTrainers()

}



function loadTrainers(){

let trainers = JSON.parse(localStorage.getItem("trainers")) || []

let list = document.getElementById("trainerList")

if(!list) return

list.innerHTML=""

trainers.forEach((t,i)=>{

list.innerHTML += `
<li>
${t}
<button onclick="deleteTrainer(${i})">Remove</button>
</li>
`

})

}







function deleteTrainer(index){

if(!confirm("Remove this trainer?")) return

let trainers = JSON.parse(localStorage.getItem("trainers")) || []

trainers.splice(index,1)

localStorage.setItem("trainers",JSON.stringify(trainers))

loadTrainers()

}





function refreshRevenue(){

updateRevenue()

createRevenueChart()

}







window.deleteTrainer = deleteTrainer
window.refreshRevenue = refreshRevenue
window.login = login





window.onload=function(){

loadMembers()
loadPayments()
loadAttendance()
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()
createRevenueChart()

showSection("dashboard")

}