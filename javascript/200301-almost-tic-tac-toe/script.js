
var turn = 'X';

const resetBoard = () => {

    const board = document.getElementById('game-holder');
    turn = 'X';
    
    for ( var i = 0; i < 9; i++ ) {
        board.children[i].innerHTML = '';
    }
}


const markBox = (event) => {

    const node = event.target;
    node.innerHTML = turn;

    if (turn === 'X') {
        turn = 'O';
    } else {
        turn = 'X';
    }
}

