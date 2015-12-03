var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        this.onDeviceReady();
    },

    onDeviceReady: function() {
        app.init();
    },

    init: function() {
       
        this.margin = 10;           /* margem entre os elementos do jogo */

        this.touchRegulator = 50;   /* regulador do touch, informa a distância que o 
                                       dedo dever percorrer para se caracterizar o evento */
        this.points = 0;
        this.records = window.localStorage.best? window.localStorage.best: 0;
        this.numbers_init = [2, 4];
        this.stage_rows = 4;
        this.stage_cols = 4;
        this.proximo = 0;
        this.jogadas = [];
        this.bonus = 0;
        this.metaBonus = 100;
        this.conta_jogadas = 0;


        document.getElementById("record").innerHTML = this.records;

        this.stage = this.getStage();
        this.canvas = document.getElementsByTagName("canvas")[0];        
        this.ctx = this.canvas.getContext("2d");

        document.getElementById("pts").onclick = this.onBonusUse;

        // inicio celulas com os respectivos posicionamento
        this.initPos();
        this.initGame();
    },

    initGame: function(){

        this.stage.gerNumber();
        this.stage.gerNumber();
        this.printStage();
        // ativa eventos para jogadas
        this.bindGame();

    },


    removeEventos: function(){
        /* remove todos os eventos que controlam o jogo */
        this.canvas.removeEventListener("touchstart");
        this.canvas.removeEventListener("touchend");
        window.removeEventListener("keydown");        
    },


    bindGame: function(){
        
        // antes de qualquer coisa, verifica se o jogador perdeu
        this.canvas.addEventListener("touchstart", this.onTouchStart, false);
        this.canvas.addEventListener("touchend", this.onTouchEnd, false);
        window.addEventListener("keydown", this.onKeyDown, false);
    },

    copyStage: function(){
        // antes de qualquer movimento
        app.jogadas[app.conta_jogadas] = JSON.stringify(app.stage.cels);
        app.conta_jogadas ++;
    },

    jogadorPerdeu: function(){

        for(var l = 0; l < app.stage.vrows; l++){
            for(var c = 0; c < app.stage.vcols; c++){
                if(app.stage.cels[l][c].val == 0){
                    return false;
                }
            }
        }

        // todos os espacos estao preenchidos, verificar se ainda tem jogadas

        for(var l = 0; l < app.stage.vrows; l++){
            for(var c = 0; c < app.stage.vcols; c++){
                var cells = app.stage.cels;

                if(l > 0 && cells[l][c].val == cells[l - 1][c].val){
                    return false;
                }
                if(c > 0 && cells[l][c].val == cells[l][c - 1].val){
                    return false;
                }

            }
        }



        return true;
    },

    onBonusUse: function(){
        if(app.bonus > 0){
            app.bonus --;
            var stage_copy = JSON.parse(app.jogadas[--app.conta_jogadas]);
            app.stage.cels = stage_copy;
            app.printStage();
        }
    },    

    onKeyDown: function(ev){

        if(ev.keyCode == 38){
            app.copyStage();
            app.onMoveUp();
        }
        else if(ev.keyCode == 39){
            app.copyStage();
            app.onMoveRight();
        }
        else if(ev.keyCode == 40){
            app.copyStage();
            app.onMoveDown();  
        }
        else if(ev.keyCode == 37){
            app.copyStage();
            app.onMoveLeft();
        }
        else if(ev.keyCode == 76){
            app.onBonusUse();
        }
    },

    onTouchStart: function(ev){
        ev.preventDefault();
        ev.stopImmediatePropagation();

        if(ev.touches.length == 1){
            app.tstarty = ev.touches.item(0).clientY;
            app.tstartx = ev.touches.item(0).clientX;            
        }

    },

    onTouchEnd: function(ev){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        
        if(ev.changedTouches.length == 1){
            ydist = ev.changedTouches.item(0).clientY - app.tstarty;
            xdist = ev.changedTouches.item(0).clientX - app.tstartx;            
        }

        if(ydist < 0 && Math.abs(ydist) > app.touchRegulator){
            // to move up
            app.copyStage();
            app.onMoveUp();
        }
        else if(ydist > 0 && Math.abs(ydist) > app.touchRegulator){
            // executa tudo que tiver que executar
            app.copyStage();
            app.onMoveDown();
        }
        else if(xdist > 0 && Math.abs(xdist) > app.touchRegulator){
            // executa tudo que tiver que executar
            app.copyStage();
            app.onMoveRight();
        }
        else if(xdist < 0 && Math.abs(xdist) > app.touchRegulator){
            // executa tudo que tiver que executar
            app.copyStage();
            app.onMoveLeft();
        }
    },

    countPoints: function(){
        this.points = 0;
        for(var i = 0; i < this.stage.vrows; i++){
            for(var n =0; n < this.stage.vcols; n++){
                this.points += this.stage.cels[i][n].val;
            }
        }
    },

    onMoveRight: function(){

        moved = false;

        for(var i = this.stage.vrows - 1; i >= 0; i-- ){
            for(var n = this.stage.vcols - 1; n >= 0; n-- ){

                var cell = this.stage.cels[i][n];

                // se a celula checada for vasia, nao ha move
                if(!cell.val) continue;


                var d = n +1;
                while(d < this.stage.vcols ){
                    var nextCel = this.stage.cels[i][d];

                    if(!nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        cell = nextCel;
                        moved = true;
                    }
                    else if(cell.val == nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        moved = true;
                        break;
                    }
                    else break;
                    d++;
                }

            }
        }

        if(moved)
            this.stage.gerNumber();
    
        this.printStage();        
    },

    onMoveLeft: function(){

        moved = false;

        for(var i = 0; i < this.stage.vrows; i++ ){
            for(var n = 0; n < this.stage.vcols; n++){

                var cell = this.stage.cels[i][n];

                // se a celula checada for vasia, nao ha move
                if(!cell.val) continue;

                var d = n -1;
                while(d >= 0){
                    var nextCel = this.stage.cels[i][d];

                    if(!nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        cell = nextCel;
                        moved = true;
                    }
                    else if(cell.val == nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        moved = true;
                        break;
                    }
                    else break;

                    d--;
                }

            }
        }

        if(moved)
            this.stage.gerNumber();

        this.printStage();        
        
    },

    onMoveUp: function(){

        moved = false;

        // executa tudo
        // tenta mover para baixo
        for(var i = 0; i < this.stage.vrows; i++ ){
            for(var n = 0; n < this.stage.vcols; n++){
                
                var cell = this.stage.cels[i][n];

                // se a celula checada for vasia, nao ha move
                if(!cell.val) continue;

                var d = i - 1;
                while( d >= 0){
                    var nextCel = this.stage.cels[d][n];
                    if(!nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        cell = nextCel;
                        moved = true;
                    }
                    else if(cell.val == nextCel.val){
                        // se o valor foi igual, move mais para na junção
                        nextCel.val += cell.val;
                        cell.val = 0;
                        moved = true;
                        break;                        
                    }
                    else break;
                    d--;                    
                }
            }
        }

        if(moved)
            this.stage.gerNumber();

        this.printStage();        
    },

    onMoveDown: function(){
        // executa tudo
        // tenta mover para baixo
        moved = false;

        for(var i = this.stage.vrows - 1; i >= 0; i--){
            for(var n = this.stage.vcols - 1; n >= 0; n--){
                
                var cell = this.stage.cels[i][n];

                // se a celula checada for vasia, nao ha move
                if(!cell.val) continue;

                var d = i + 1;
                while( d < this.stage.vrows){
                    var nextCel = this.stage.cels[d][n];
                    if(!nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        cell = nextCel;
                        moved = true;

                    }else if(cell.val == nextCel.val){
                        nextCel.val += cell.val;
                        cell.val = 0;
                        moved = true;
                        break;
                    }
                    else break;
                    d++;
                }
            }
        }

        if(moved)
            this.stage.gerNumber();

        this.printStage();

    },

    initPos: function(){
        // inicia o posicionamento das celulas

        for(var i = 0; i < this.stage.vrows; i++){
            for(var n =0; n < this.stage.vcols; n++){

                // calcular largura e altura das celulas das grades aplicando a margem
                this.stage.cels[i][n].w = boxWidth = ( (this.canvas.width  - ((this.stage.vcols + 1) * this.margin)) / this.stage.vcols);
                this.stage.cels[i][n].h = boxHeight = ( (this.canvas.height - ((this.stage.vrows + 1) * this.margin)) / this.stage.vrows);
                this.stage.cels[i][n].x = n * boxWidth + this.margin * (n + 1);
                this.stage.cels[i][n].y = i * boxHeight + this.margin * (i + 1);
            }
        }
    },

    printStage: function(){

        if(app.jogadorPerdeu()){
            console.log("Perdeu playboy");

            var points = window.localStorage.best? window.localStorage.best: 0;
            if(this.points > points){
                window.localStorage.setItem("best", this.points);
                // save jogadas
                window.localStorage.setItem("best_jogadas", this.jogadas);
            }
    
            app.init();
            app.removeEventos();
        }

        // print celulas
        var color = [];
        color[0]    = "e6e6e6";
        color[2]    = "f1f55c";
        color[4]    = "ffc448";
        color[8]    = "ff9c48";
        color[16]   = "ff7248";
        color[32]   = "ff5f48";
        color[64]   = "ff4855";
        color[128]  = "ff4898";
        color[256]  = "ce48ff";
        color[512]  = "6e48ff";
        color[1024] = "4890ff";
        color[2048] = "00adb8";
        color[4096] = "00da1a";
        color[8192] = "beff34";

        this.countPoints();
        // printar points
        var point = document.getElementById("points");
        p = point.querySelector("span");

        var div_max = document.getElementById("max");
        div_max.style.backgroundColor="#" + color[this.numbers_init[this.proximo]];
        div_max.innerHTML = this.numbers_init[this.proximo];

        if(parseInt(p.innerHTML) != this.points){
            p.innerHTML = this.points;
        }

        if(this.points >= this.metaBonus){
            app.bonus += 1;
            this.metaBonus += this.metaBonus;
        }

        document.getElementById("bonus").innerHTML = this.bonus;


        this.ctx.fillStyle="#bdb9ff";
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);



        for(var i = 0; i < this.stage.vrows; i++){
            for(var n =0; n < this.stage.vcols; n++){

                var cell = this.stage.cels[i][n];

                this.ctx.fillStyle = "#" + color[cell.val];               
                this.ctx.fillRect(cell.x, cell.y, cell.w, cell.h);

                // printar texto com valor
                this.ctx.fillStyle="#fff";
                this.ctx.font="28px Sans";
                var acerto_altura = 9;

                if(cell.val > 10){
                    this.ctx.font="26px Sans";
                    acerto_altura = 8;
                }

                if(cell.val > 100){
                    this.ctx.font="22px Sans";
                    acerto_altura = 8;
                }

                if(cell.val > 1000){
                    this.ctx.font="18px Sans";
                    acerto_altura = 6;
                }

                if(cell.val)
                    this.ctx.fillText(
                        cell.val, 
                        cell.x + cell.w / 2 - this.ctx.measureText(cell.val).width / 2, 
                        cell.y + cell.h / 2 + acerto_altura  
                    );
            }
        }
    },

    getStage: function(){
        var stage = {
            x: 10, 
            y: 10,
            vcols: app.stage_cols,
            vrows: app.stage_rows,
            cels: new Array(),

            gerPos: function(){
                return {
                    col: parseInt(Math.random(new Date().getSeconds()) * this.vcols),
                    row: parseInt(Math.random(new Date().getSeconds()) * this.vrows)
                };
            },

            // adidiciona um novo numero no stadio
            gerNumber: function(){
                var pos = this.gerPos();

                // verifica se tem alguma coisa nesta posição
                if(stage.cels[pos.row][pos.col].val){
                    return this.gerNumber();
                }
                else{
                    stage.cels[pos.row][pos.col].val = app.numbers_init[app.proximo];
                    app.proximo = parseInt(Math.random(new Date().getSeconds()) * (app.numbers_init.length));
                    return 1;   
                }

            }
        };

        for(var i = 0; i < stage.vrows; i++){
            stage.cels[i] = new Array();
            for(var n = 0; n < stage.vcols; n++){
                stage.cels[i][n] = {
                    val: 0,
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0
                };
            }
        }

        return stage;
    },

    debug: function(s){
        str = "";
        for(var i = 0; i < s.length; i++ ){
            for(var n = 0; n < s[i].length; n++){
                str += s[i][n].val + ", ";
            }
            str += "\n";
        }
        console.log(str);
    }

};

app.initialize();