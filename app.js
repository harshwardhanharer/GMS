function login(){

let user = document.getElementById("username").value
let pass = document.getElementById("password").value

if(user=="admin" && pass=="1234"){

localStorage.setItem("loggedIn",true)

window.location="dashboard.html"

}else{

alert("Wrong Login")

}

}

function logout(){

localStorage.removeItem("loggedIn")

window.location="login.html"

}

function showSection(id){

let sections=document.querySelectorAll(".section")

sections.forEach(s=>s.style.display="none")

document.getElementById(id).style.display="block"

if(id=="dashboard"){
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()
}

}

showSection("dashboard")


function addMember(){

let name=document.getElementById("name").value
let phone=document.getElementById("phone").value
let batch=document.getElementById("batch").value
let trainer=document.getElementById("trainer").value
let joinDate=document.getElementById("joinDate").value
let plan=document.getElementById("plan").value

let start=new Date(joinDate)

start.setDate(start.getDate()+Number(plan))

let expiry=start.toISOString().split("T")[0]

if(!name || !phone || !joinDate){
alert("Please fill all fields")
return
}


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

function loadMembers(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("memberList")

if(list){

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

document.getElementById("totalMembers").innerText = members.length

}

loadPayments()
loadAttendance()
checkExpiryAlerts()

}

function deleteMember(index){

if(!confirm("Are you sure you want to delete this member?")){
return
}

let members = JSON.parse(localStorage.getItem("members")) || []

members.splice(index,1)

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

}


function loadPayments(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("paymentList")

if(!list) return

list.innerHTML=""

members.forEach((m,i)=>{

list.innerHTML += `
<tr>
<td>${m.name}</td>
<td>₹${m.fee}</td>
<td>${m.nextDue || "N/A"}</td>
<td>
<button onclick="recordPayment(${i})">Mark Paid</button>
</td>
</tr>
`

})

}


function markPaid(index){

let members = JSON.parse(localStorage.getItem("members")) || []

members[index].payment = "Paid"

localStorage.setItem("members",JSON.stringify(members))

loadPayments()
loadMembers()
updateRevenue()

}


function loadAttendance(){

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("attendanceList")

let today = new Date().toISOString().split("T")[0]

if(!list) return

list.innerHTML=""

members.forEach((m,i)=>{

let status = "Not Marked"

if(m.attendance && m.attendance[today]){
status = m.attendance[today]
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


function markPresent(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date().toISOString().split("T")[0]

if(!members[index].attendance){
members[index].attendance = {}
}

members[index].attendance[today] = "Present"

localStorage.setItem("members",JSON.stringify(members))

loadAttendance()
updateTodayAttendance()

}


function markAbsent(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date().toISOString().split("T")[0]

if(!members[index].attendance){
members[index].attendance = {}
}

members[index].attendance[today] = "Absent"

localStorage.setItem("members",JSON.stringify(members))

loadAttendance()
updateTodayAttendance()

}



function addTrainer(){

let name=document.getElementById("trainerName").value

let trainers=JSON.parse(localStorage.getItem("trainers"))||[]

trainers.push(name)

localStorage.setItem("trainers",JSON.stringify(trainers))

loadTrainers()

}

function loadTrainers(){

let trainers = JSON.parse(localStorage.getItem("trainers")) || []

let list = document.getElementById("trainerList")

if(list){

list.innerHTML = ""

trainers.forEach((t,i)=>{

list.innerHTML += `
<li>
${t}
<button onclick="deleteTrainer(${i})">Remove</button>
</li>
`

})

}

}


function deleteTrainer(index){

if(!confirm("Remove this trainer?")) return

let trainers = JSON.parse(localStorage.getItem("trainers")) || []

trainers.splice(index,1)

localStorage.setItem("trainers",JSON.stringify(trainers))

loadTrainers()

}

loadMembers()
loadTrainers()


function updateRevenue(){

let members = JSON.parse(localStorage.getItem("members")) || []

let revenue = 0

let today = new Date()
let currentMonth = today.getMonth()
let currentYear = today.getFullYear()

members.forEach(m=>{

if(m.paymentHistory){

m.paymentHistory.forEach(p=>{

let d = new Date(p.date)

if(d.getMonth()==currentMonth && d.getFullYear()==currentYear){

revenue += p.amount

}

})

}

})

document.getElementById("revenue").innerText = revenue

}




function checkExpiryAlerts(){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date()

let expiring = []

members.forEach(m=>{

let exp = new Date(m.expiry)

let diff = (exp - today) / (1000*60*60*24)

if(diff <= 5){

expiring.push(m.name)

}

})

if(expiring.length > 0){

console.log("Expiring Soon:", expiring)

}

}

function renewMember(index){

let members=JSON.parse(localStorage.getItem("members"))

let today=new Date()

today.setDate(today.getDate()+30)

members[index].expiry=today.toISOString().split("T")[0]

members[index].payment="Pending"

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

}


function searchMember(){

let text=document.getElementById("searchMember").value.toLowerCase()

let members=JSON.parse(localStorage.getItem("members"))||[]

let list=document.getElementById("memberList")

list.innerHTML=""

members.forEach((m,i)=>{

if(m.name.toLowerCase().includes(text)){

list.innerHTML+=`
<li>
${m.name} - ${m.batch} - Expiry: ${m.expiry}
<button onclick="deleteMember(${i})">Delete</button>
<button onclick="renewMember(${i})">Renew</button>
</li>
`

}

})

}



function editMember(index){

let members = JSON.parse(localStorage.getItem("members"))

let m = members[index]

let newName = prompt("Edit Name", m.name)
let newPhone = prompt("Edit Phone", m.phone)

if(newName && newPhone){

members[index].name = newName
members[index].phone = newPhone

localStorage.setItem("members",JSON.stringify(members))

loadMembers()

}

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

document.getElementById("todayAttendance").innerText = count

}





function checkExpiryAlerts(){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date()

let list = document.getElementById("expiryAlerts")

if(!list) return

list.innerHTML=""

members.forEach(m=>{

let exp = new Date(m.expiry)

let diff = (exp - today)/(1000*60*60*24)

if(diff <= 5){

list.innerHTML += `<li>${m.name} - ${m.expiry}</li>`

}

})

}


function createRevenueChart(){

let members = JSON.parse(localStorage.getItem("members")) || []

let revenue = 0

members.forEach(m=>{

if(m.payment=="Paid"){
revenue += 1500
}

})

let ctx = document.getElementById("revenueChart")

if(!ctx) return

new Chart(ctx,{

type:"bar",

data:{
labels:["Revenue"],
datasets:[{
label:"Monthly Revenue",
data:[revenue]
}]
}

})

}




function viewAttendance(){

let date = document.getElementById("attendanceDate").value

let members = JSON.parse(localStorage.getItem("members")) || []

let list = document.getElementById("attendanceHistory")

list.innerHTML=""

members.forEach(m=>{

let status = m.attendance && m.attendance[date] ? m.attendance[date] : "Absent"

list.innerHTML += `<li>${m.name} - ${status}</li>`

})

}


function exportMembers(){

let members = JSON.parse(localStorage.getItem("members")) || []

let csv = "Name,Phone,Batch,Trainer,Expiry\n"

members.forEach(m=>{
csv += `${m.name},${m.phone},${m.batch},${m.trainer},${m.expiry}\n`
})

let blob = new Blob([csv], { type: "text/csv" })

let url = window.URL.createObjectURL(blob)

let a = document.createElement("a")

a.href = url
a.download = "gym_members.csv"

a.click()

}




function recordPayment(index){

let members = JSON.parse(localStorage.getItem("members")) || []

let today = new Date()

let paymentDate = today.toISOString().split("T")[0]

let nextDue = new Date(today)

nextDue.setMonth(nextDue.getMonth() + 1)

nextDue = nextDue.toISOString().split("T")[0]

let paymentRecord = {
amount: members[index].fee,
date: paymentDate
}

members[index].paymentHistory.push(paymentRecord)

members[index].lastPayment = paymentDate
members[index].nextDue = nextDue

localStorage.setItem("members",JSON.stringify(members))

loadPayments()
loadMembers()
updateRevenue()

}







loadMembers()
loadPayments()
loadAttendance()
loadTrainers()
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()
createRevenueChart()