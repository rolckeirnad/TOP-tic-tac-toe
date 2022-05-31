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
            cells[index].classList.add(mark);
            cells[index].classList.add('highlight');
            gameController.endTurn(index); // Finish player turn
        }
    }

    function highlightCells(cellsArr) {
        const cellArray = cellsArr[0];
        removeHighlight();
        for (let cell of cellArray) {
            cells[cell].classList.add('highlight');
        }
    }

    function simulateBoardClick(index) {
        cells[index].click();
    }

    function removeHighlight() {
        for (let cell of cells) {
            cell.classList.remove('highlight');
        }
    }

    function resetCells() {
        for (let cell of cells) {
            cell.textContent = '';
            cell.classList.remove('X');
            cell.classList.remove('O');
            cell.classList.remove('highlight')
        }
    }

    function returnBoard() {
        return [...board];
    }

    function getPossibleMoves() {
        return [...board].map((v, i) => v === undefined ? i : '').filter(Number);
    }

    function isBoardFull() {
        return !(board.includes(undefined));
    }

    function reset() {
        board = new Array(9);
        resetCells();
    }

    return {
        highlightCells,
        simulateBoardClick,
        returnBoard,
        getPossibleMoves,
        isBoardFull,
        reset,
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
        const removeCell = (value) => cells.splice(cells.indexOf(value), 1);
        const getCells = () => [...cells];
        const setCells = (newCells) => cells = [...newCells];
        const resetCells = () => cells = [];
        const getVictories = () => winCount;
        const addVictory = () => winCount = winCount + 1;
        const isPlayerTurn = () => enabled;
        const togglePlayerState = () => enabled = enabled ? false : true;

        return {
            getName,
            getMark,
            addCell,
            removeCell,
            getCells,
            setCells,
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
    const p1Mark = document.querySelector('#p1Mark');
    const p2Mark = document.querySelector('#p2Mark');
    const gameMode = document.querySelector('#gameMode');
    const gameSelection = gameMode.querySelectorAll('li input[type="radio"]');
    const AIDifficult = document.querySelector('#AIDifficult');
    const difficultOptions = AIDifficult.querySelectorAll('li input[type="radio"]');
    const selectDifficult = document.querySelector('#selectDifficult');
    const menuButton = document.querySelector('#menuButton');

    // Event listeners
    for (let radio of gameSelection) radio.addEventListener('click', displayDifficultSelection);
    for (let radio of difficultOptions) radio.addEventListener('click', saveDifficult);
    selectDifficult.addEventListener('click', changeGame);
    resetButton.addEventListener('click', resetGame);
    playButton.addEventListener('click', startGame);
    menuButton.addEventListener('click', showMenu);

    // Internal state for controller
    const state = (function () {
        let actualTurn = 0;
        let players = [];
        let versusIA = false;
        let difficult = 'easy';
        let maxDepth = 1;

        const setActualTurn = (value) => actualTurn = value;
        const getActualTurn = () => actualTurn;
        const toggleActualTurn = () => actualTurn = (actualTurn === 0) ? 1 : 0;
        const setPlayers = (newPlayers) => players = [...newPlayers];
        const getPlayers = () => [...players];
        const getPlayerInTurn = () => players[actualTurn];
        const togglePlayerStatus = (index) => players[index].togglePlayerState();
        const resetPlayerCells = () => players.map(player => player.reset());
        const setIAStatus = (value) => versusIA = value;
        const isIAEnabled = () => versusIA;
        const getMaxDepth = () => maxDepth;
        const getIADifficult = () => difficult;
        const setIADifficult = (value) => {
            difficult = value;
            if (value == 'easy') maxDepth = 1;
            if (value == 'medium') maxDepth = 2;
            if (value == 'hard') maxDepth = 3;
            if (value == 'unbeatable') maxDepth = 8;
        };

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
            getMaxDepth,
            getIADifficult,
            setIADifficult,
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
        checkWinner(state.getPlayerInTurn());// Check played markers
    };

    function displayDifficultSelection() {
        const gameDifficult = document.querySelector('ul>li input:checked');
        const p2Label = document.querySelector('#p2Label');
        // Change default name from "Player 2" to "Computer"
        if (gameDifficult.value == 'player') {
            state.setIAStatus(false);
            AIDifficult.classList.add('hide');
            p2Label.textContent = 'Player 2';
        } else {
            state.setIAStatus(true);
            AIDifficult.classList.remove('hide');
            p2Label.textContent = 'Computer';
        }
    }

    function saveDifficult() {
        const difficult = AIDifficult.querySelector('ul>li input:checked');
        state.setIADifficult(difficult.value);
        selectDifficult.value = difficult.value;
    }

    function computerTurn() {
        const actualBoard = gameBoard.returnBoard();
        const actualPlayers = gameController.state.getPlayers();
        const actualTurn = gameController.state.getActualTurn();
        const indexToPlay = minimax(actualBoard, actualPlayers, actualTurn, 0);
        if (state.getIADifficult() == 'easy') {
            // Make random move to prevent being repetitive with minimax
            const emptyCell = gameBoard.getPossibleMoves();
            const randomIndex = Math.floor(Math.random() * emptyCell.length);
            gameBoard.simulateBoardClick(emptyCell[randomIndex]);
        } else {
            gameBoard.simulateBoardClick(indexToPlay.index);
        }
    }

    function minimax(board, players, turn, depth) {
        // This check if some player has a winning combination
        function checkPlayerCells(players) {
            let index;
            for (let i = 0; i < 2; i++) {
                const cells = players[i].getCells();
                const winner = POSSIBLE_WINNING_COMBINATIONS.some(combination =>
                    combination.every(index => cells.includes(index))
                );
                if (winner) {
                    index = i;
                    break;
                }
            }
            return index;
        }
        // We get all empty cells from passed board
        function getEmptyCells(actualBoard) {
            return [...actualBoard].map((v, i) => v === undefined ? i : '')
                .filter(v => v !== '');
        }

        const nextTurn = turn ? 0 : 1;
        const nextDepth = depth + 1;
        const emptyCell = getEmptyCells(board);

        const winner = checkPlayerCells(players);
        // Player is number 0, Computer is number 1
        if (winner === 0) {
            return { score: depth - 10 };
        } else if (winner === 1) {
            return { score: 10 - depth };
        } else if (emptyCell.length == 0) {
            return { score: 0 }
        } else if (depth == state.getMaxDepth()) {
            return { score: 0 }
        }

        let moves = [];
        for (let i = 0; i < emptyCell.length; i++) {
            let move = {};
            move.index = emptyCell[i];
            board[emptyCell[i]] = players[turn].getMark();
            players[turn].addCell(emptyCell[i]);
            const nextMove = minimax(board, players, nextTurn, nextDepth);
            move.score = nextMove.score;
            players[turn].removeCell(emptyCell[i]);
            board[emptyCell[i]] = undefined;
            moves.push(move);
        }

        let bestMove;
        if (turn == 1) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
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
    const checkWinner = function (player) {
        const playerCells = player.getCells();
        let fullBoard = gameBoard.isBoardFull();

        const winner = POSSIBLE_WINNING_COMBINATIONS.some(combination =>
            combination.every(index => playerCells.includes(index))
        );

        if (winner) {
            const winningCombination = POSSIBLE_WINNING_COMBINATIONS.filter(combination =>
                combination.every(index => playerCells.includes(index))
            );
            gameBoard.highlightCells(winningCombination);
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
        const versusIA = state.isIAEnabled();// Read if the second player is computer; if so, change default name
        const player1 = player1Name.value ? player1Name.value : 'Player 1';
        const player2 = player2Name.value ? player2Name.value : versusIA ? 'Computer' : 'Player 2';
        const tempPlayers = [Player(player1, 'X'), Player(player2, 'O')];
        state.setPlayers(tempPlayers);
        resetGame();
        initialSetup.classList.add('hide');
        if (versusIA) {
            selectDifficult.classList.remove('hide')
        } else {
            selectDifficult.classList.add('hide');
        }
        displayNames();
        displayStats();
    }

    function changeGame() {
        state.setIADifficult(selectDifficult.value);
        resetGame();
    }

    function showMenu() {
        initialSetup.classList.remove('hide');
    }

    // Display names of current players
    function displayNames() {
        const player = state.getPlayers();
        displayP1Name.textContent = player[0].getName();
        displayP2Name.textContent = player[1].getName();
        p1Mark.textContent = player[0].getMark();
        p2Mark.textContent = player[1].getMark();
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
