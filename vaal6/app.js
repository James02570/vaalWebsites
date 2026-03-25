const routes = {

"#home": {
page: "pages/home.html",
css: "styles/home.css"
},

"#about": {
page: "pages/about.html",
css: "styles/about.css"
},

"#contact": {
page: "pages/contact.html",
css: "styles/contact.css"
},

"#products": {
page: "pages/products.html",
css: "styles/products.css"
}

};

const app = document.getElementById("app");
const pageCSS = document.getElementById("page-css");

async function loadPage(){

let hash = window.location.hash || "#home";

const route = routes[hash];

if(!route){

app.innerHTML = "<h1>Page Not Found</h1>";
return;

}

const response = await fetch(route.page);
const html = await response.text();

app.innerHTML = html;

pageCSS.href = route.css;

window.scrollTo(0,0);

if(hash === "#chatBot"){
loadChatbotScript();
}

}

function loadChatbotScript(){

if(!document.getElementById("chatbot-script")){

const script = document.createElement("script");

script.src = "script/chatbot.js";
script.id = "chatbot-script";

script.onload = () => {
if(typeof initChatbot === "function"){
initChatbot();
}
};

document.body.appendChild(script);

}else{

initChatbot();

}

}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);