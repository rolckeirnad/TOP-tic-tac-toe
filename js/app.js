const gameBoard = (function () {
    // Filled with test values
    let board = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];

    // Cached DOM elements
    const boardContainer = document.querySelector('#gameBoard');

    const render = function () {
        for (let content of board) {
            boardContainer.appendChild(createCell(content));
        }
        console.log("Finish render");
    };

    const createCell = function(content) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.textContent = content;
        return cell;
    }
    render();
})();
