function getRecentElement(el_classname){
    return document.getElementsByClassName(el_classname)[document.getElementsByClassName(el_classname).length-1];
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
const next_btn = document.getElementsByClassName("next")[0];
let word_list = {};
async function getWordData(){
    const word_list_req = new XMLHttpRequest();
    let ready_state = 0;
    word_list_req.onreadystatechange = e=>{
        ready_state++;
        if(ready_state==4){
            let dummy_el = document.createElement("html");
            dummy_el.innerHTML=word_list_req.responseText;
            const words = dummy_el.getElementsByClassName("wordlist")[0].getElementsByClassName("word");
            //?word_list is blank?
            console.log(words);
            for(let i=0;i<words.length;i++){
                const word = words[i].textContent;
                word_list[word] = {"definitions":[],"synonyms":[]};
            }
    }
}
word_list_req.open("GET",window.location.href.split("practice")[0],true);
word_list_req.send();
while(ready_state<4){await sleep(10)}
for(word in word_list){
    const xhr_req = new XMLHttpRequest();
    let ready_state = 0;
    let synonyms = [];
    let definitions = [];
    xhr_req.onreadystatechange = e=>{
        ready_state++;
        if(ready_state==4){
            console.log("got definition of "+word);
            let dummy_el = document.createElement("html");
            dummy_el.innerHTML=xhr_req.responseText;
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
            word_list[word].definitions = definitions;
            word_list[word].synonyms =synonyms;
        }
    }
    xhr_req.open("GET","https://www.vocabulary.com/dictionary/"+word,true);
    xhr_req.send();
    while(ready_state<4){await sleep(10)}
}
}
getWordData();
async function guess(){
    console.log("couldn't find answer; guessing");
    let itt=0;
    while(itt!=4){
        await sleep(700);
        getRecentElement("choices").children[itt].click();
        if(next_btn.classList[1]=="active"){
            await sleep(200);
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
    const question_type = getRecentElement("question").classList[1];
    console.log(question_type);
    if(question_type=="typeT"){
        const input = getRecentElement("spelltheword").getElementsByTagName("input")[0];
        const ans = getRecentElement("sentence complete").getElementsByTagName("strong")[0].textContent;
        input.value=ans;
        getRecentElement("spellit").click();
        await sleep(200);
        next_btn.click();
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
    if(word_list[word]==undefined){guess();return}
    for(let d=0;d<word_list[word].definitions.length;d++){
        for(let o=0;o<4;o++){
            if(options[o]==word_list[word].definitions[d]){
                choices.children[0].click();
                await sleep(200);
                next_btn.click();
                answer();
                return
            }
        }
    }
    guess();
    return
}
answer();
