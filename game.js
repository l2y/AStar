var gameAll = {};

gameAll.game = (function () {
 
    var ctx;
    
    gameAll.fps = 1000;
    gameAll.width = 900;
    gameAll.height = 300;
    
    gameAll.pixelSize = 10;
    
    var x = 0;
    var y = 0;
    
    var player;
    var wall;
    var path;
    
    function init() {
        $('body').append('<canvas id="view">');
        var $canvas = $('#view');
        $canvas.attr('width', gameAll.width);
        $canvas.attr('height', gameAll.height);
        
        var canvas = $canvas[0];
        ctx = canvas.getContext('2d');
        
        player = gameAll.player();
        wall = gameAll.wall();
        path = gameAll.path();
        
        player.init();
        wall.init();
        path.init(player.getGoalX(), player.getGoalY());
        wallCoord();
        
        newGame();
        gameLoop();
    }
    
    function wallCoord() {
        var x;
        var y;
        for(var i = 0 ; i < 400 ; i++) {
            x = Math.floor(Math.random() * gameAll.width/15);
            y = Math.floor(Math.random() * gameAll.height/15);
            if (!(x == player.getX() && y == player.getY()) && !(x == player.getGoalX() && y == player.getGoalY())){
                wall.add(x,y);
            }
        }
    }
    
    function newGame() {
        
    }
    
    function gameLoop() {
        ctx.clearRect(0,0,gameAll.width,gameAll.height);
        ctx.fillStyle="FFFFFF";
        ctx.fillRect(0,0,gameAll.width,gameAll.height);
        
        ctx.fillStyle="d3d3d3";
        for (var i = 0; i < gameAll.width ; i=i+15)
            for (var j = 0 ; j < gameAll.height ; j=j+15)
                ctx.fillRect(i,j,gameAll.pixelSize, gameAll.pixelSize);
        wall.render(ctx);
        path.run(player.getX(), player.getY(), wall,ctx);
        path.render(ctx);
        player.render(ctx);

        //setTimeout(gameLoop, gameAll.fps);
    }
    
    return {
        init: init,
        newGame: newGame,
        gameLoop: gameLoop
    };
})();

gameAll.player = function() {
    var x;
    var y;
    
    var goalX;
    var goalY;
    
    function init() {
        x = 10;
        y = 15;
        
        goalX = 50;
        goalY = 3;
    }
    function render(ctx) {
        ctx.fillStyle='red';
        ctx.fillRect(x*15,y*15,gameAll.pixelSize,gameAll.pixelSize);
        ctx.fillStyle='purple';
        ctx.fillRect(goalX*15,goalY*15,gameAll.pixelSize,gameAll.pixelSize);
    }
    function getX(){
        return x;
    }
    function getY(){
        return y;
    }
    function getGoalX(){
        return goalX;
    }
    function getGoalY(){
        return goalY;
    }
    return {
        init: init,
        render: render,
        getY: getY,
        getX: getX,
        getGoalX: getGoalX,
        getGoalY: getGoalY
    };
};

gameAll.wall = function() {
    var coordinates = new Array();
    function init() {
        
    }
    function add(x, y) {
        coordinates.push(new Array(x,y));
    }
    function render(ctx) {
        ctx.fillStyle="blue";
        for (var i = 0 ; i < coordinates.length ; i++) {
            ctx.fillRect(coordinates[i][0]*15,coordinates[i][1]*15,gameAll.pixelSize,gameAll.pixelSize);
        }
    }
    function isWall(x,y) {
        for (var i = 0 ; i < coordinates.length ; i++) {
            if(x == coordinates[i][0] && y == coordinates[i][1]){
               return true;
            }
        }
        return false;
    }
    return {
        init: init,
        add: add,
        render: render,
        isWall: isWall
    };
};

gameAll.path = function() {
    var pathCoordinates = new Array();
    var check = new Array();
    var checked = new Array();
    var current = new Array();
    var endX;
    var endY;
                
    function init(goalX, goalY) {
        endX = goalX;
        endY = goalY;
    }
    function add(value) {
        for (var i = 0 ; i < pathCoordinates.length ; i++)
            if (value == pathCoordinates[i])
                return;
        pathCoordinates.push(value);
    }
    function run(x,y,wall,ctx) {
        var lowest;
        var end = false;
        var index;
        current = new Array(x,y,distanceFrom(x,y));
        //checked.push(current);
        
        while(end == false) {
            if (current[0]+1 < gameAll.width/15 && current[1] > 0)
                addCheck(current[0]+1,current[1], wall);
            if (current[0] > 0 && current[1]+1 < gameAll.height/15)
                addCheck(current[0],current[1]+1, wall);
            if (current[0]-1 > 0 && current[1] > 0)
                addCheck(current[0]-1,current[1], wall);
            if (current[0] > 0 && current[1]-1 > 0)
                addCheck(current[0],current[1]-1, wall);
            
            console.log(' New Length 2: ' + check.length);
            
            lowest = check[0];

            for (var i = 0 ; i < check.length ; i++) {
                if (check[i][0] == endX && check[i][1] == endY){
                    lowest = new Array(endX,endY);
                    i = check.length;
                }
                else if (lowest[2] > check[i][2]) {
                    lowest = check[i];
                    console.log("Check In " + i + " " + check[i]);
                }
            }
            add(lowest);

            checked.push(check);
            checked.push(current);
            current = lowest;
            console.log("Check Length: " + check.length + " Checked Length: " + checked.length + " Current: " + current);
            if ((check.length <= 0) || (current[0] == endX && current[1] == endY)) {
                end = true;
            } 
            check = new Array();
        }

    }
    function remove(pos){
        index = check.indexOf(pos);
        if (index > -1) 
            check.splice(index,1);
    }
    function addCheck(x,y, wall) {
        console.log("Is Wall?: " + wall.isWall(x,y) + " Is New?: " + isNew(x,y));
        if (!wall.isWall(x,y) && isNew(x,y)) {
            check.push(new Array(x,y,distanceFrom(x,y)));
            console.log('pushed ' + new Array(x,y,distanceFrom(x,y)) + ' New Length: ' + check.length);
            
        }
    }
    function isNew(x,y) {
        for (var i = 0 ; i < checked.length ; i++) {
            if (checked[i][0] == x && checked[i][1] == y) {
                return false;   
            }
        } 
        return true;
    }
    function distanceFrom(x,y) {
        //return (Math.sqrt(Math.pow(endX-x,2)+Math.pow(endY-y,2)));
        return Math.abs(endX-x) + Math.abs(endY-y);
    }
    function render(ctx) {
        ctx.fillStyle='yellow';
        for (var i = 0 ; i < pathCoordinates.length - 1 ; i++) {
            ctx.fillRect(pathCoordinates[i][0]*15,pathCoordinates[i][1]*15,gameAll.pixelSize,gameAll.pixelSize);
        }
    }
    return {
        init: init,
        add: add,
        run: run,
        render:render
    };
};

$(document).ready(function() {
    gameAll.game.init();
});