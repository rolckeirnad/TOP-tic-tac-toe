const gameBoard = (function () {
    let board = new Array(9);

    // Cached DOM elements
    const boardContainer = document.querySelector('#gameBoard');
    const cells = document.querySelectorAll('.board .cell');

    // Add event listener to every cell
    (function () {
        for (let cell of cells) {
            const index = [...cells].indexOf(cell);
            cell.addEventListener('click', _ => addMarker(index));
        }
    })();

    function addMarker(index) {
        if (!board[index]) { // Check if cell is empty
            const turn = gameController.turn.getTurn();
            const mark = gameController.players[turn].getMark(); // Get mark for current player
            board[index] = mark; // Save mark in array
            cells[index].textContent = mark; // Show mark in pressed cell
            gameController.turn.toggleTurn(); // Toggle actual turn
        }
    }
})();

const gameController = (function () {
    // 
    function Player(name, mark) {
        const getName = () => name;
        const getMark = () => mark;
        return {
            getName,
            getMark,
        }
    };

    // Internal state for controller
    const turn = (function () {
        let actualTurn = 0;
        const setActualTurn = (value) => actualTurn = value;
        const getActualTurn = () => actualTurn;
        const toggleActualTurn = () => actualTurn = (actualTurn === 0) ? 1 : 0;

        return {
            setTurn: setActualTurn,
            getTurn: getActualTurn,
            toggleTurn: toggleActualTurn,
        }
        
    })();

    const players = [Player('Player 1', 'X'), Player('Player 2', 'O')];
    console.log("Here goes the rest of the game...", `${players[0].getName()} VS ${players[1].getName()}`);
    return {
        players,
        turn,
    }
})();
