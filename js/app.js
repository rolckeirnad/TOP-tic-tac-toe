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

    // Function to mark selected cell
    function addMarker(index) {
        const isCellEmpty = !board[index];
        if (isCellEmpty) {
            const turn = gameController.turn.getTurn(); // Get which player is going to play
            const mark = gameController.players[turn].getMark(); // Get mark for current player
            board[index] = mark; // Save mark in array position
            cells[index].textContent = mark; // Show mark in pressed cell
            gameController.endTurn(index, turn); // Finish player turn
        }
    }

    function removeMarks() {
        for (let cell of cells) {
            cell.textContent = '';
        }
    }

    function returnBoard() {
        return [...board];
    }

    function reset() {
        board = new Array(9);
        removeMarks();
    }

    return {
        returnBoard,
        reset,
    };
})();

const gameController = (function () {
    // Factory for creating players
    function Player(name, mark) {
        let cells = [];
        const getName = () => name;
        const getMark = () => mark;
        const addCell = (index) => cells.push(index);
        const getCells = () => cells;
        const reset = () => cells = [];
        return {
            getName,
            getMark,
            addCell,
            getCells,
            reset,
        }
    };

    // Cached DOM elements
    const messageContainer = document.querySelector('.message');
    const message = document.querySelector('#messageText');
    const resetButton = document.querySelector('#restartButton');

    // Add event to reset button
    resetButton.addEventListener('click', resetGame);

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

    // All possible winning combinations
    const POSSIBLE_WINNING_COMBINATIONS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // Finalizes turn and check if there's winner or not
    const endTurn = function (playedIndex, player) {
        players[player].addCell(playedIndex);// Save index cell in player cells list
        checkWinner(player);// Check played markers
        turn.toggleTurn(); // Toggle actual turn
    };

    // We check if player has all indexes of a winning combination
    const checkWinner = function (player) {
        const playerCells = [...players[player].getCells()];
        const actualBoard = gameBoard.returnBoard();
        let fullBoard = !(actualBoard.includes(undefined));

        const winner = POSSIBLE_WINNING_COMBINATIONS.some(combination =>
            combination.every(index => playerCells.includes(index))
        );

        if (winner) { // There's a winner
            displayResult(`${players[player].getName()} wins!!`);
        } else if (fullBoard) { // If there isn't a winner and the board is full
            displayResult('It\'s a tie!!!');
        }
    };

    const displayResult = function (result) {
        messageContainer.classList.add('show');
        message.textContent = result;
    };

    function resetGame() {
        for (let player of players) player.reset();
        turn.setTurn(0);
        messageContainer.classList.remove('show');
        gameBoard.reset();
    }

    const players = [Player('Player 1', 'X'), Player('Player 2', 'O')];
    return {
        players,
        turn,
        endTurn,
    }
})();
