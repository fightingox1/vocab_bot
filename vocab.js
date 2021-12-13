//PRACTICE URL: https://www.vocabulary.com/lists/1401217/practice
const url = window.location.href;
const ans_url = url.split("practice")[0];
const next_btn = document.getElementsByClassName("next")[0];
let word_list = {};
let last_index = {"choices":document.getElementsByClassName("choices").length-1,"spellit":document.getElementsByClassName("spelltheword").length-1};
const xhr = new XMLHttpRequest();
let ready_state = 0;
let skips = 0;
xhr.onreadystatechange = e=>{
    ready_state++;
    if(ready_state==4){
        console.log("request complete");
        //parse xhr response to usable data (dictionary,verbs,defs);
        let dummy_el = document.createElement("html");
        dummy_el.innerHTML=xhr.responseText;
        const word_els = dummy_el.getElementsByClassName("wordlist")[0].children;
        for(let i=0;i<word_els.length;i++){
            const word_el = word_els[i];
            word_list[word_el.getElementsByClassName("word")[0].textContent] = {
                "def":word_el.getElementsByClassName("definition")[0].textContent
            };
        }
        console.log(word_list);
    }
}
xhr.open("GET",ans_url,true);
xhr.send();
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function guess(){
    console.log("couldn't find answer; guessing");
    let itt=0;
    while(itt!=4){
        await sleep(1500);
        document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[itt].click();
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
let calls = 0;
async function answer(){
    await sleep(1500);
    calls++;
    console.log(calls);
    const question_type = document.getElementsByClassName("question")[document.getElementsByClassName("question").length-1].classList[1];
    console.log(question_type);
    /*
    type key:
    *S: synonym
    *D: definition/means to:
    *H: ?context?
    *F: fill in the blank
    *A: antonym
    *T: type/spelling
    */
   if(document.getElementsByClassName("choices")[last_index.choices]!=undefined){
       //answer is multiple choice
       if(question_type=="typeI"){
           //answer has an image so guess
           guess();
           return
        }else{
        let options = document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children;
        options = [
            options[0].textContent,
            options[1].textContent,
            options[2].textContent,
            options[3].textContent
        ];
        let viable_options = [];
        for(let i=0;i<4;i++){
            if(word_list[options[i]]!=undefined){
                viable_options.push(i)
            }
        }
        //contains indecies to options list that were found in the word list
        last_index.choices++;
        if(viable_options.length==1){
            //only 1 option;problem has been solved
            document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[viable_options[0]].click();
            await sleep(500);
            if(next_btn.classList[1]!="active"){
                guess();
                return
            }
            next_btn.click();
            answer();
            return
        }
        if(viable_options.length>1){
            for(let i=0;i<viable_options.length;i++){
                //guess the word based off possible options
                await sleep(1250);
                document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[viable_options[i]].click();
                if(next_btn.classList[1]=="active"){
                    next_btn.click();
                    answer();
                    return
                }
            }
        }
        if(viable_options.length==0){
            let word;
            //typeP || type?
            if(question_type=="typeF"){
                for(let i=0;i<4;i++){
                    if(word_list[options[i].split("ing")[0]]!=undefined 
                    || word_list[options[i].split("y")[0]]!=undefined
                    || word_list[options[i]]!=undefined){
                        document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[i].click();
                        await sleep(200);
                        next_btn.click();
                        answer();
                        return
                    }
                }
                let it=0;
                while(it<4){
                    await sleep(1500);
                    document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[it].click();
                    if(next_btn.classList[1]=="active"){
                        await sleep(200);
                        next_btn.click();
                    }
                    it++;
                }
                answer();
                return
            }else if(question_type=="typeH" || question_type=="typeS" || question_type=="typeA" || question_type=="typeD"){
                const word = document.getElementsByClassName("instructions")[document.getElementsByClassName("instructions").length-1].children[0].textContent;
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
                            definitions.push(content[i].getElementsByClassName("definition")[0].textContent);
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
                            document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[j].click();
                            await sleep(200);
                            next_btn.click();
                            answer();
                            return
                        }
                    }
                }
                for(let i=0;i<definitions.length;i++){
                    for(let j=0;j<4;j++){
                        if(definitions[i]==options[j]){
                            document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[j].click();
                            await sleep(200);
                            next_btn.click();
                            answer();
                            return
                        }
                    }
                }
                guess();
                return
            }else if(question_type=="typeP"){
                word = document.getElementsByClassName("sentence")[document.getElementsByClassName("sentence").length-1].children[0].textContent
            }else{
                word = document.getElementsByClassName("instructions")[document.getElementsByClassName("instructions").length-1].children[0].textContent;
            }
            for(let i=0;i<4;i++){
                if(word_list[word]!=undefined){
                    if(options[i]==word_list[word].def){
                        document.getElementsByClassName("choices")[document.getElementsByClassName("choices").length-1].children[i].click();
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
    }
    }
    else if(question_type=="typeT"){
        const input = document.getElementsByClassName("spelltheword")[document.getElementsByClassName("spelltheword").length-1].getElementsByTagName("input")[0];
        //answer is stored on client-side for spelling problems
        const ans = document.getElementsByClassName("sentence complete")[document.getElementsByClassName("sentence complete").length-1].getElementsByTagName("strong")[0].textContent;
        input.value=ans;
        document.getElementsByClassName("spellit")[document.getElementsByClassName("spellit").length-1].click();
        console.log(ans);
        last_index.spellit++;
        await sleep(200);
        next_btn.click();
        answer();
        return
    }
    else{
        if(skips>3){
            //if it cant find the input then the index (probably) reset
            last_index.choices=0;
            last_index.spellit=0;
            skips=0;
            answer();
            return
        }
        skips++;
        await sleep(200);
        next_btn.click();
        answer();
        return
    }
}
let wait = setInterval(function(){
    if(ready_state==4){
        answer();
        clearInterval(wait);
        return
    }
},50);
