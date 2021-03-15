function shakePassword(){
    $("#passwordArea")
        .animate({left: '-=10px'}, 50)
        .animate({left: '+=20px'}, 50)
        .animate({left: '-=20px'}, 50)
        .animate({left: '+=10px'}, 50);
}

function shakeNewPassword(){
    $("#newPasswordArea")
        .animate({left: '-=10px'}, 50)
        .animate({left: '+=20px'}, 50)
        .animate({left: '-=20px'}, 50)
        .animate({left: '+=10px'}, 50);
}

const boardStates = {
    draw: "Draw",
    win: "Win",
    loss: "Loss",
    none: "-"
};

var vm = {
    data() {
        return {
            results: [],
            teamNames: [],
            password: "",
            authenticated: false,
            newPassword: "",
            confirmNewPassword: "",
        }
    },
    methods: {
        getColorForState(state){
            let style = {
                backgroundColor: 'white'
            };
            if(state == boardStates.draw)
                style.backgroundColor = 'rgb(0, 128, 255)';
            else if (state == boardStates.win)
                style.backgroundColor = 'rgb(64, 255, 64)';
            else if (state == boardStates.loss)
                style.backgroundColor = 'rgb(255, 0, 0)';
            else if (state == boardStates.none)
                style.backgroundColor = 'rgb(128, 128, 128)';
            return style;
        },
        cycleState(rowIndex, colIndex){
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            let currentState = this.results[rowIndex][colIndex];
            if(rowIndex == colIndex) return;
            else if(currentState == boardStates.none) {
                this.setState(rowIndex, colIndex, boardStates.win);
                this.setState(colIndex, rowIndex, boardStates.loss);
            }
            else if(currentState == boardStates.win) {
                this.setState(rowIndex, colIndex, boardStates.loss);
                this.setState(colIndex, rowIndex, boardStates.win);
            }
            else if(currentState == boardStates.loss) {
                this.setState(rowIndex, colIndex, boardStates.draw);
                this.setState(colIndex, rowIndex, boardStates.draw);
            }
            else if(currentState == boardStates.draw) {
                this.setState(rowIndex, colIndex, boardStates.none);
                this.setState(colIndex, rowIndex, boardStates.none);
            }
        },
        setState(rowIndex, colIndex, state){
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            $.post(
                "/setState", 
                {
                    password: this.password,
                    rowIndex: rowIndex,
                    colIndex: colIndex,
                    state: state
                }, 
                dataFromServer => {
                    this.results = dataFromServer;
                });
        },
        clearBoard() {
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            $.post("/clearBoard", {password: this.password}, dataFromServer => {
                this.results = dataFromServer;
             });
        },
        setTeamName(index){
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            let text = prompt("Set team name", this.teamNames[index]);
            if (text == ""){
                $.post("/deleteTeam", 
                {
                    password: this.password,
                    index:index
                },
                dataFromServer => {
                    this.teamNames = dataFromServer.teamNames;
                    this.results = dataFromServer.results
                })
            }
            else if (text == null){
                return;
            }
            else{
                $.post(
                    "/setTeamName", 
                    {
                        password: this.password,
                        index: index,
                        name: text
                    }, 
                    dataFromServer => {
                        this.teamNames = dataFromServer;
                    });
            }
        },
        standings(teamIndex){
            let teamIndexInt = parseInt(teamIndex);
            let wins = 0;
            let losses = 0;
            for(let i = 0; i < this.results.length; i++){
                if (this.results[i][teamIndexInt] == boardStates.win) losses++;
                else if (this.results[i][teamIndexInt] == boardStates.loss) wins++;
            }
            return {
                name: this.teamNames[teamIndex],
                wins: wins,
                losses: losses
            }
        },
        newTeam(){
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            let text = prompt("Set team name", "");
            if (text == "" || text == null){
                return;
            }
            else{
                $.post(
                    "/newTeam", 
                    {
                        password: this.password,
                        name: text
                    }, 
                    dataFromServer => {
                        this.teamNames = dataFromServer.teamNames;
                        this.results = dataFromServer.results;
                    });
            }
        },
        authenticate(){
            $.post("/authenticate", {password: this.password}, dataFromServer => {
                this.authenticated = dataFromServer.authenticated;
            });
            if(!this.authenticated) {
                shakePassword();
            }
        },
        resetPassword(){
            if(!this.authenticated) {
                shakePassword();
                return;
            }
            if(this.newPassword == this.confirmNewPassword){
                $.post("/resetPassword",{
                        password: this.password,
                        newPassword: this.newPassword
                    },
                    dataFromServer => {});
                this.newPassword = "";
                this.confirmNewPassword = "";
                alert("Password has been reset.")
            }
            else{
                shakeNewPassword();
            }
        },
        logout(){
            this.password = "";
            this.authenticated = false;
        }
    },
    mounted() {
        $.post("/getBoard", {}, dataFromServer => {
            this.results = dataFromServer;
         });
        $.post("/getTeamNames", {}, dataFromServer => {
            this.teamNames = dataFromServer;
        });
    },
    computed: {
        orderedStandings(){
            let teamList = [];
            for(let i = 0; i < this.teamNames.length; i++){
                teamList.push(this.standings(i));
            }
            teamList.sort((a, b) => {
                if(a.wins < b.wins){
                    return 1;
                }
                if(a.wins > b.wins){
                    return -1;
                }
                if(a.losses > b.losses){
                    return 1;
                }
                if(a.losses < b.losses){
                    return -1;
                }
                return 0;
            })
            return teamList;
        }
    }
};

let app = Vue.createApp(vm).mount('#app');


//copied from https://www.w3schools.com/howto/howto_js_collapsible.asp
var coll = document.getElementsByClassName("collapsible");
var collapsibleIndex;

for (collapsibleIndex = 0; collapsibleIndex < coll.length; collapsibleIndex++) {
  coll[collapsibleIndex].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    } 
  });
}