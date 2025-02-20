// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const snakeGameDisposable = vscode.commands.registerCommand('vscode-extension.snakeGame', () => {
		const panel = vscode.window.createWebviewPanel(
			'snakeGame', // Identifies the type of the webview. Used internally
			'Snake Game', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				retainContextWhenHidden: true,
			} // Webview options.
		);

		panel.webview.html = getSnakeGameContent();
	});

	context.subscriptions.push(snakeGameDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Function to get the HTML content for the Snake Game
function getSnakeGameContent(): string {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Snake Game</title>
		<style>
			* {
				box-sizing: border-box;
			}
			body {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				width: 100vw;
				height: 100vh;
				margin: 0;
				background-color: #000;
			}
			#header {
				display: flex;
				justify-content: space-between;
				width: 80vmin;
				color: #fff;
				font-size: 24px;
				margin-bottom: 10px;
			}
			#gameContainer {
				width: 80vmin;
				height: 80vmin;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
			}
			canvas {
				width: 100%;
				height: 100%;
				border: 1px solid #fff;
			}
			#gameOver {
				display: none;
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				color: #fff;
				font-size: 24px;
				background-color: rgba(0, 0, 0, 0.8);
				padding: 20px;
				border-radius: 10px;
				text-align: center;
			}
			#newRecord {
				color: yellow;
				font-size: 18px;
				margin-top: 10px;
			}
		</style>
	</head>
	<body>
		<div id="header">
			<div id="score">Score: 0</div>
			<div id="highScore">High Score: 0</div>
		</div>
		<div id="gameContainer">
			<canvas id="gameCanvas" width="400" height="400"></canvas>
			<div id="gameOver">
				Game Over! Your score is <span id="finalScore"></span>.<br>
				<span id="newRecord"></span><br>
				Click anywhere to restart.
			</div>
		</div>
		<script>
			const canvas = document.getElementById('gameCanvas');
			const ctx = canvas.getContext('2d');
			const grid = 10;
			let count = 0;
			let score = 0;
			let highScore = 0;
			let snake = {
				x: 160,
				y: 160,
				dx: grid,
				dy: 0,
				cells: [],
				maxCells: 4
			};
			let apple = {
				x: 320,
				y: 320
			};
			let gameOver = false;

			function getRandomInt(min, max) {
				return Math.floor(Math.random() * (max - min)) + min;
			}

			function placeApple() {
				apple.x = getRandomInt(0, canvas.width / grid) * grid;
				apple.y = getRandomInt(0, canvas.height / grid) * grid;
			}

			function resetGame() {
				snake.x = 160;
				snake.y = 160;
				snake.cells = [];
				snake.maxCells = 4;
				snake.dx = grid;
				snake.dy = 0;
				score = 0;
				gameOver = false;
				document.getElementById('score').innerText = 'Score: ' + score;
				document.getElementById('gameOver').style.display = 'none';
				document.getElementById('newRecord').innerText = '';
				placeApple();
				requestAnimationFrame(loop);
			}

			function loop() {
				if (gameOver) return;

				requestAnimationFrame(loop);
				if (++count < Math.max(10 - Math.floor(snake.maxCells / 5), 1)) { // Adjust speed based on snake length
					return;
				}
				count = 0;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				snake.x += snake.dx;
				snake.y += snake.dy;
				if (snake.x < 0) {
					snake.x = canvas.width - grid;
				} else if (snake.x >= canvas.width) {
					snake.x = 0;
				}
				if (snake.y < 0) {
					snake.y = canvas.height - grid;
				} else if (snake.y >= canvas.height) {
					snake.y = 0;
				}
				snake.cells.unshift({ x: snake.x, y: snake.y });
				if (snake.cells.length > snake.maxCells) {
					snake.cells.pop();
				}
				ctx.fillStyle = 'red';
				ctx.fillRect(apple.x, apple.y, grid, grid); // Ensure apple is a square
				ctx.fillStyle = 'green';
				snake.cells.forEach(function (cell, index) {
					ctx.fillRect(cell.x, cell.y, grid, grid); // Ensure snake segments are squares
					if (cell.x === apple.x && cell.y === apple.y) {
						snake.maxCells++;
						score++;
						document.getElementById('score').innerText = 'Score: ' + score;
						if (score > highScore) {
							highScore = score;
							document.getElementById('highScore').innerText = 'High Score: ' + highScore;
						}
						placeApple();
					}
					for (let i = index + 1; i < snake.cells.length; i++) {
						if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
							gameOver = true;
							document.getElementById('finalScore').innerText = score;
							if (score === highScore) {
								document.getElementById('newRecord').innerText = 'Congratulations! New High Score!';
							}
							document.getElementById('gameOver').style.display = 'block';
							canvas.addEventListener('click', resetGame, { once: true });
						}
					}
				});
			}

			document.addEventListener('keydown', function (e) {
				if (e.key === 'ArrowLeft' && snake.dx === 0) {
					snake.dx = -grid;
					snake.dy = 0;
				} else if (e.key === 'ArrowUp' && snake.dy === 0) {
					snake.dy = -grid;
					snake.dx = 0;
				} else if (e.key === 'ArrowRight' && snake.dx === 0) {
					snake.dx = grid;
					snake.dy = 0;
				} else if (e.key === 'ArrowDown' && snake.dy === 0) {
					snake.dy = grid;
					snake.dx = 0;
				}
			});

			placeApple();
			requestAnimationFrame(loop);
		</script>
	</body>
	</html>`;
}
