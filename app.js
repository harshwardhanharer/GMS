/* LOGIN PROTECTION */

if(!localStorage.getItem("loggedIn") && window.location.pathname.includes("dashboard")){
window.location="login.html"
}


/* FIREBASE */

import { db } from "./firebase.js";
import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* GLOBAL MEMBERS CACHE */

let members=[]


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

if(id==="dashboard"){
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()
}

}


/* ADD MEMBER */

async function addMember(){

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

await addDoc(collection(db,"members"),member)

loadMembers()

}


/* LOAD MEMBERS */

async function loadMembers(){

const snapshot = await getDocs(collection(db,"members"))

members=[]

snapshot.forEach(d=>{
members.push({
id:d.id,
...d.data()
})
})

let list=document.getElementById("memberList")

if(!list) return

list.innerHTML=""

members.forEach((m,i)=>{

list.innerHTML+=`
<tr>
<td>${m.name}</td>
<td>${m.phone}</td>
<td>${m.batch}</td>
<td>${m.trainer}</td>
<td>${m.expiry}</td>
<td>
<button onclick="deleteMember('${m.id}')">Delete</button>
</td>
</tr>
`

})

let total=document.getElementById("totalMembers")
if(total) total.innerText=members.length

loadPayments()
loadAttendance()
checkExpiryAlerts()

}


/* DELETE MEMBER */

async function deleteMember(id){

if(!confirm("Delete this member?")) return

await deleteDoc(doc(db,"members",id))

loadMembers()

}


/* PAYMENTS */

function loadPayments(){

let list=document.getElementById("paymentList")

if(!list) return

list.innerHTML=""

let today=new Date().toISOString().split("T")[0]

members.forEach((m,i)=>{

let btn=""

if(m.lastPayment===today){
btn=`<button disabled>Paid</button>`
}else{
btn=`<button onclick="recordPayment(${i})">Mark Paid</button>`
}

list.innerHTML+=`
<tr>
<td>${m.name}</td>
<td>₹${m.fee}</td>
<td>${m.nextDue || "N/A"}</td>
<td>${btn}</td>
</tr>
`

})

}


async function recordPayment(index){

let m=members[index]

let today=new Date()

let paymentDate=today.toISOString().split("T")[0]

if(m.lastPayment===paymentDate){
alert("Payment already recorded today")
return
}

let next=new Date(today)
next.setMonth(next.getMonth()+1)

let nextDue=next.toISOString().split("T")[0]

let history=m.paymentHistory || []

history.push({
amount:m.fee,
date:paymentDate
})

await updateDoc(doc(db,"members",m.id),{
paymentHistory:history,
lastPayment:paymentDate,
nextDue:nextDue,
expiry:nextDue
})

loadMembers()

}


/* ATTENDANCE */

function loadAttendance(){

let list=document.getElementById("attendanceList")

if(!list) return

let today=new Date().toISOString().split("T")[0]

list.innerHTML=""

members.forEach((m,i)=>{

let status="Not Marked"

if(m.attendance && m.attendance[today]){
status=m.attendance[today]
}

list.innerHTML+=`
<tr>
<td>${m.name}</td>
<td><button onclick="markPresent(${i})">Present</button></td>
<td><button onclick="markAbsent(${i})">Absent</button></td>
<td>${status}</td>
</tr>
`

})

}


async function markPresent(index){

let m=members[index]

let today=new Date().toISOString().split("T")[0]

let att=m.attendance || {}

att[today]="Present"

await updateDoc(doc(db,"members",m.id),{
attendance:att
})

loadMembers()

}


async function markAbsent(index){

let m=members[index]

let today=new Date().toISOString().split("T")[0]

let att=m.attendance || {}

att[today]="Absent"

await updateDoc(doc(db,"members",m.id),{
attendance:att
})

loadMembers()

}


function updateTodayAttendance(){

let today=new Date().toISOString().split("T")[0]

let count=0

members.forEach(m=>{
if(m.attendance && m.attendance[today]==="Present"){
count++
}
})

let el=document.getElementById("todayAttendance")

if(el) el.innerText=count

}


/* REVENUE */

function updateRevenue(){

let revenue=0

let today=new Date()

let month=today.getMonth()
let year=today.getFullYear()

members.forEach(m=>{

if(m.paymentHistory){

m.paymentHistory.forEach(p=>{

let d=new Date(p.date)

if(d.getMonth()===month && d.getFullYear()===year){
revenue+=p.amount
}

})

}

})

let el=document.getElementById("revenue")

if(el) el.innerText=revenue

}


/* EXPIRY ALERT */

function checkExpiryAlerts(){

let today=new Date()

let list=document.getElementById("expiryAlerts")

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


/* TRAINERS */

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

let trainers=JSON.parse(localStorage.getItem("trainers"))||[]

let list=document.getElementById("trainerList")

if(!list) return

list.innerHTML=""

trainers.forEach((t,i)=>{

list.innerHTML+=`
<li>
${t}
<button onclick="deleteTrainer(${i})">Remove</button>
</li>
`

})

}

function deleteTrainer(index){

let trainers=JSON.parse(localStorage.getItem("trainers"))||[]

trainers.splice(index,1)

localStorage.setItem("trainers",JSON.stringify(trainers))

loadTrainers()

}


/* PAGE LOAD */

window.deleteMember=deleteMember
window.markPresent=markPresent
window.markAbsent=markAbsent
window.recordPayment=recordPayment
window.login=login

window.onload=function(){

loadMembers()
updateRevenue()
updateTodayAttendance()
checkExpiryAlerts()

showSection("dashboard")

}
