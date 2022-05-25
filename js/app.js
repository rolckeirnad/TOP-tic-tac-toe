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
        const currentPlayer = gameController.state.getPlayerInTurn();
        if (isCellEmpty && currentPlayer.isPlayerEnabled()) {
            const mark = currentPlayer.getMark(); // Get mark for current player
            board[index] = mark; // Save mark in array position
            cells[index].textContent = mark; // Show mark in pressed cell
            gameController.endTurn(index); // Finish player turn
        }
    }

    function simulateBoardClick(index) {
        cells[index].click();
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
        simulateBoardClick,
    };
})();

const gameController = (function () {
    // Factory for creating players
    function Player(name, mark) {
        let cells = [];
        let winCount = 0;
        let enabled = true;

        const getName = () => name;
        const getMark = () => mark;
        const addCell = (index) => cells.push(index);
        const getCells = () => cells;
        const resetCells = () => cells = [];
        const getVictories = () => winCount;
        const addVictory = () => winCount = winCount + 1;
        const isPlayerTurn = () => enabled;
        const togglePlayerState = () => enabled = enabled ? false : true;

        return {
            getName,
            getMark,
            addCell,
            getCells,
            reset: resetCells,
            getVictories,
            addVictory,
            isPlayerEnabled: isPlayerTurn,
            togglePlayerState,
        }
    }

    // Cached DOM elements
    const messageContainer = document.querySelector('.message');
    const message = document.querySelector('#messageText');
    const resetButton = document.querySelector('#restartButton');
    const initialSetup = document.querySelector('#initialSetup');
    const player1Name = document.querySelector('#p1InputName');
    const player2Name = document.querySelector('#p2InputName');
    const playButton = document.querySelector('#playButton');
    const displayP1Name = document.querySelector('#p1Name');
    const displayP2Name = document.querySelector('#p2Name');
    const p1Wins = document.querySelector('#p1Wins');
    const p2Wins = document.querySelector('#p2Wins');

    // Add event to reset button
    resetButton.addEventListener('click', resetGame);
    playButton.addEventListener('click', startGame);

    // Internal state for controller
    const state = (function () {
        let actualTurn = 0;
        let players = [];
        let versusIA = false;

        const setActualTurn = (value) => actualTurn = value;
        const getActualTurn = () => actualTurn;
        const toggleActualTurn = () => actualTurn = (actualTurn === 0) ? 1 : 0;
        const setPlayers = (newPlayers) => players = [...newPlayers];
        const getPlayers = () => players;
        const getPlayerInTurn = () => players[actualTurn];
        const togglePlayerStatus = (index) => players[index].togglePlayerState();
        const resetPlayerCells = () => players.map(player => player.reset());
        const setIAStatus = (value) => versusIA = value;
        const isIAEnabled = () => versusIA;

        return {
            setActualTurn,
            getActualTurn,
            toggleTurn: toggleActualTurn,
            setPlayers,
            getPlayers,
            getPlayerInTurn,
            togglePlayerStatus,
            resetPlayerCells,
            setIAStatus,
            isIAEnabled,
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
    const endTurn = function (playedIndex) {
        state.getPlayerInTurn().addCell(playedIndex);// Save index cell in player cells list
        checkWinner();// Check played markers
    };

    function computerTurn() {
        const possibleMoves = gameBoard.returnBoard().map((v, i) => v === undefined ? i : '').filter(Number);
        const indexToPlay = Math.floor(Math.random() * possibleMoves.length);
        gameBoard.simulateBoardClick(possibleMoves[indexToPlay]);
    }

    const startNextTurn = function () {
        const versusIA = state.isIAEnabled();
        const turnToPlay = state.toggleTurn();
        if (turnToPlay === 1 && versusIA) {
            // Play Computer turn
            computerTurn();
        } 
    };

    // We check if player has all indexes of a winning combination
    const checkWinner = function () {
        const playerCells = [...state.getPlayerInTurn().getCells()];
        const actualBoard = gameBoard.returnBoard();
        let fullBoard = !(actualBoard.includes(undefined));

        const winner = POSSIBLE_WINNING_COMBINATIONS.some(combination =>
            combination.every(index => playerCells.includes(index))
        );

        if (winner) {
            state.getPlayerInTurn().addVictory()
            displayResult(`${state.getPlayerInTurn().getName()} wins!!`);
        } else if (fullBoard) {
            displayResult('It\'s a tie!!!');
        } else {
            startNextTurn();
        }
    };

    // Display Result and finishes the game
    const displayResult = function (result) {
        messageContainer.classList.add('show');
        message.textContent = result;
    };

    // Set a new game and updates displayed stats
    function resetGame() {
        state.resetPlayerCells();
        state.toggleTurn();
        //state.setActualTurn(0);
        messageContainer.classList.remove('show');
        displayStats();
        gameBoard.reset();
        startNextTurn();
    }

    // Initialization of state
    function startGame() {
        const gameMode = document.querySelector('#gameMode>ul>li input:checked');
        const versusIA = gameMode.value === 'player' ? false : true;// Read if the second player is computer; if so, change default name
        const player1 = player1Name.value ? player1Name.value : 'Player 1';
        const player2 = player2Name.value ? player2Name.value : versusIA ? 'Computer' : 'Player 2';
        const tempPlayers = [Player(player1, 'X'), Player(player2, 'O')];
        state.setPlayers(tempPlayers);
        if (versusIA) state.setIAStatus(true);
        initialSetup.classList.add('hide');
        displayNames();
        displayStats();
    }

    // Display names of current players
    function displayNames() {
        const player = state.getPlayers();
        displayP1Name.textContent = player[0].getName();
        displayP2Name.textContent = player[1].getName();
    }

    // Display stats of current players
    function displayStats() {
        const player = state.getPlayers();
        p1Wins.textContent = player[0].getVictories();
        p2Wins.textContent = player[1].getVictories();
    }

    return {
        state,
        endTurn,
    }
})();
