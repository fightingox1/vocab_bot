function getRecentElement(el_classname){
    return document.getElementsByClassName(el_classname)[document.getElementsByClassName(el_classname).length-1];
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
const next_btn = document.getElementsByClassName("next")[0];
const ui_el = document.createElement("div");
ui_el.style.position = "absolute";
ui_el.style.borderRadius = "10px";
ui_el.style.backgroundColor = "rgba(10,10,10,75%)";
ui_el.style.width = "250px";
ui_el.style.height = "400px";
ui_el.style.top = "100px";
ui_el.style.left = "20px";
const ans_ui = document.createElement("p");
ans_ui.style.color = "#fff";
ans_ui.style.textAlign = "center";
ans_ui.style.marginTop = "20px";
ans_ui.textContent = "a:0,b:0,c:0,d:0";
const acc_ui = document.createElement("p");
acc_ui.style.color = "#fff";
acc_ui.style.fontSize = "25px";
acc_ui.style.textAlign = "center";
ui_el.appendChild(acc_ui);
ui_el.appendChild(ans_ui);
document.body.appendChild(ui_el);
let guess_count = 0;
let answer_count = 0;
let answers = {0:0,1:0,2:0,3:0};
async function guess(){
    console.log("couldn't find answer; guessing");
    let itt=0;
    await sleep(700);
    while(itt!=4){
        getRecentElement("choices").children[itt].click();
        await sleep(700);
        answer_count++;
        guess_count++;
        if(next_btn.classList[1]=="active"){
            await sleep(200);
            answers[itt]++;
            next_btn.click();
            break
        }
        itt++;
    }
    answer();
    return
}

async function answer(){
    await sleep(700);
    const accuracy = Math.round(((answer_count-guess_count)/answer_count)*100);
    acc_ui.textContent = "accuracy: "+accuracy+"%";
    ans_ui.textContent = "a:"+answers[0]+",b:"+answers[1]+",c:"+answers[2]+",d:"+answers[3];
    const question_type = getRecentElement("question").classList[1];
    console.log(question_type);
    if(question_type=="typeT"){
        const input = getRecentElement("spelltheword").getElementsByTagName("input")[0];
        const ans = getRecentElement("sentence complete").getElementsByTagName("strong")[0].textContent;
        input.value=ans;
        getRecentElement("spellit").click();
        await sleep(200);
        next_btn.click();
        answer_count++;
        answer();
        return
    }
    //typeI == image, typeF == fill in the blank
    if(question_type=="typeI" || question_type=="typeF"){guess();return}
    const choices = getRecentElement("choices");
    let options = choices.children;
    options = [
        options[0].textContent,
        options[1].textContent,
        options[2].textContent,
        options[3].textContent
    ];
    let word = "";
    if(question_type=="typeL" || question_type=="typeP"){
        word = getRecentElement("sentence").children[0].textContent;
    }else{
        word = getRecentElement("instructions").children[0].textContent;
    }
    const word_req = new XMLHttpRequest();
    let ready_state = 0;
    let synonyms = [];
    let definitions = [];
    word_req.onreadystatechange = e=>{
        ready_state++;
        if(ready_state==4){
            console.log("got definition of "+word);
            let dummy_el = document.createElement("html");
            dummy_el.innerHTML=word_req.responseText;
            const content = dummy_el.getElementsByClassName("word-definitions")[0].getElementsByTagName("li");
            for(let i=0;i<content.length;i++){
                const word_type = dummy_el.getElementsByClassName("pos-icon")[i].textContent;
                for(let j=0;j<content[i].getElementsByClassName("definition").length;j++){
                    let def = content[i].getElementsByClassName("definition")[j].textContent;
                    if(j==0 && def.split(word_type).length==2){def=def.split(word_type)[1]}
                    definitions.push(def);
                }
                content[i].getElementsByClassName("word");
                for(let j=0;j<content[i].getElementsByClassName("word").length;j++){
                    synonyms.push(content[i].getElementsByClassName("word")[j].textContent);
                }
            }
        }
    }
    word_req.open("GET","https://www.vocabulary.com/dictionary/"+word,true);
    word_req.send();
    while(ready_state<4){await sleep(50)}
    for(let i=0;i<synonyms.length;i++){
        for(let j=0;j<4;j++){
            if(synonyms[i]==options[j]){
                choices.children[j].click();
                await sleep(200);
                next_btn.click();
                answers[j]++;
                answer_count++;
                answer();
                return
            }
        }
    }
    for(let i=0;i<definitions.length;i++){
        for(let j=0;j<4;j++){
            if(definitions[i]==options[j]){
                choices.children[j].click();
                await sleep(200);
                next_btn.click();
                answers[j]++;
                answer_count++;
                answer();
                return
            }
        }
    }
    guess();
    return
}
answer();
